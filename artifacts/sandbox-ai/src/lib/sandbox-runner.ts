/**
 * Executes JavaScript code in a true sandbox using a hidden iframe with
 * `sandbox="allow-scripts"`. The code is injected as a literal <script> tag
 * in the iframe's srcdoc — no eval() or new Function() is used.
 *
 * Isolation guarantees provided by sandbox="allow-scripts":
 *  - No access to parent DOM, window, cookies, or localStorage
 *  - No same-origin network requests that carry credentials
 *  - No form submission, popups, or plugin execution
 *
 * The iframe runs in its own separate browsing context. Communication is
 * strictly limited to postMessage with source verification.
 *
 * Infinite-loop / long-running code will NOT block the main thread (the iframe
 * sandbox has no access to the parent event loop). The 5-second timeout removes
 * the iframe and resolves the promise, so the page remains responsive.
 */
export async function runInSandbox(code: string, timeoutMs = 5000): Promise<string[]> {
  // Escape </script occurrences so the user code does not prematurely close the
  // <script> tag (HTML5 raw text element rule, case-insensitive match).
  const safeCode = code.replace(/<\/script/gi, "<\\/script");

  // srcdoc attribute value: HTML-encode the outer quotes that wrap the attribute.
  // The srcdoc is set via JS property assignment (not as an attribute string), so
  // no attribute-level escaping is needed — we set iframe.srcdoc directly.
  const srcdoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function () {
  "use strict";
  function send(type, data) {
    window.parent.postMessage({ __sandbox: true, type: type, data: data }, "*");
  }
  function fmt(args) {
    return Array.prototype.slice.call(args).map(function (a) {
      if (a !== null && typeof a === "object") {
        try { return JSON.stringify(a, null, 2); } catch (_) { return String(a); }
      }
      return String(a);
    }).join(" ");
  }
  console.log   = function () { send("log",   fmt(arguments)); };
  console.info  = function () { send("log",   "[info] " + fmt(arguments)); };
  console.warn  = function () { send("warn",  "[warn] " + fmt(arguments)); };
  console.error = function () { send("error", "[error] " + fmt(arguments)); };
  window.onerror = function (msg, _src, _line, _col, err) {
    send("error", "[error] " + (err ? err.message : String(msg)));
    return true;
  };
  window.onunhandledrejection = function (ev) {
    send("error", "[error] (unhandled promise) " + String(ev.reason));
  };
})();
<\/script>
<script>
(function () {
  "use strict";
  try {
${safeCode}
  } catch (e) {
    window.parent.postMessage(
      { __sandbox: true, type: "error", data: "[error] " + (e && e.message ? e.message : String(e)) },
      "*"
    );
  } finally {
    window.parent.postMessage({ __sandbox: true, type: "done", data: null }, "*");
  }
})();
<\/script>
</body>
</html>`;

  return new Promise<string[]>((resolve) => {
    const output: string[] = [];
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none;";

    function cleanup() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }

    function onMessage(ev: MessageEvent) {
      if (ev.source !== iframe.contentWindow) return;
      const msg = ev.data as { __sandbox?: boolean; type: string; data: string | null };
      if (!msg.__sandbox) return;

      if (msg.type === "done") {
        cleanup();
        resolve(output.length > 0 ? output : ["(no output)"]);
      } else if (typeof msg.data === "string") {
        output.push(msg.data);
      }
    }

    window.addEventListener("message", onMessage);

    timer = setTimeout(() => {
      cleanup();
      resolve([...output, "[error] Execution timed out (5 s)"]);
    }, timeoutMs);

    // Assign srcdoc after the listeners are in place so we don't miss the first message.
    iframe.srcdoc = srcdoc;
    document.body.appendChild(iframe);
  });
}

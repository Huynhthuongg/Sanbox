import { useState, useRef, useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Play, ChevronDown, ChevronUp, Loader2, RotateCcw, Terminal } from "lucide-react";
import { OpenaiMessage } from "@workspace/api-client-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { runInSandbox } from "@/lib/sandbox-runner";

const syntaxTheme = vscDarkPlus as { [key: string]: CSSProperties };
const JS_LANGS = new Set(["javascript", "js", "jsx", "ts", "tsx", "typescript"]);
const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console", "terminal", "powershell", "cmd"]);

/* ─── Simulated output generator ────────────────────────────────── */
function getSimulatedOutput(cmd: string): string[] {
  const c = cmd.trim();
  const cl = c.toLowerCase();

  if (cl.startsWith("git clone")) {
    const name = c.match(/\/([^/\s]+?)(?:\.git)?\s*$/)?.[1] || "project";
    return [
      `Cloning into '${name}'...`,
      "remote: Enumerating objects: 142, done.",
      "remote: Counting objects: 100% (142/142), done.",
      "Receiving objects: 100% (142/142), 48.21 KiB | 2.1 MiB/s, done.",
      "✓ Cloned successfully",
    ];
  }
  if (cl.startsWith("cd ")) return [];
  if (cl.startsWith("mkdir")) return [];
  if (/^(cp|mv|rm|touch|chmod|chown)\s/.test(cl)) return [];

  if (cl === "pnpm install" || cl.startsWith("pnpm install ") || cl.startsWith("npm install") || cl.startsWith("yarn install")) {
    return [
      "Resolving packages...",
      "Fetching packages...",
      "Linking packages...",
      "✓ 248 packages installed in 3.2s",
    ];
  }
  if (/^npm install -g|pnpm install -g/.test(cl)) {
    return ["Installing globally...", "✓ Package installed globally"];
  }

  if (cl.startsWith("flutter create")) {
    const name = c.match(/flutter create\s+(\S+)/)?.[1] || "my_app";
    return [
      `Creating project ${name}...`,
      "  lib/main.dart (created)",
      "  pubspec.yaml (created)",
      "  android/app/build.gradle (created)",
      `✓ Project '${name}' created successfully!`,
    ];
  }
  if (cl.startsWith("flutter pub get") || cl === "flutter pub get") {
    return [
      "Resolving dependencies...",
      "+ flutter_riverpod 2.5.1",
      "+ riverpod 2.5.1",
      "Changed 4 dependencies!",
      "✓ Dependencies resolved",
    ];
  }
  if (cl.startsWith("flutter run")) {
    return [
      "Launching lib/main.dart on emulator...",
      "Running Gradle task 'assembleDebug'...",
      "✓ Built build/app/outputs/flutter-apk/app-debug.apk",
      "Syncing files to device emulator...",
      "✓ App launched on emulator",
    ];
  }
  if (cl.startsWith("flutter build")) {
    return [
      "Building app...",
      "Running Gradle task 'assembleRelease'...",
      "✓ Built build/app/outputs/flutter-apk/app-release.apk (18.2MB)",
    ];
  }

  if (cl.startsWith("dart pub global activate")) return [
    "Activating package...",
    "✓ Activated",
  ];

  if (cl.startsWith("node ") || cl.startsWith("python ") || cl.startsWith("python3 ")) {
    return ["Executing script...", "Done."];
  }

  if (/(npm|pnpm|yarn)\s+run\s+dev/.test(cl)) {
    return [
      "> dev",
      "  VITE v5.x  ready in 312 ms",
      "  ➜  Local:   http://localhost:5173/",
      "✓ Dev server running",
    ];
  }
  if (/(npm|pnpm|yarn)\s+run\s+build/.test(cl)) {
    return [
      "> build",
      "vite v5.x building for production...",
      "dist/index.html         0.46 kB",
      "dist/assets/index.js  142.30 kB",
      "✓ Build complete",
    ];
  }
  if (/(npm|pnpm|yarn)\s+run\s+/.test(cl)) {
    const script = c.match(/run\s+(\S+)/)?.[1] ?? "script";
    return [`> ${script}`, "Done."];
  }

  if (cl.startsWith("echo ")) return [c.replace(/^echo\s+/i, "").replace(/['"]/g, "")];
  if (cl.startsWith("cat ")) return ["[file contents]"];
  if (cl.startsWith("nano ") || cl.startsWith("vim ") || cl.startsWith("code ")) return ["[opening editor...]"];

  if (cl.startsWith("cp ") && cl.includes(".env")) return ["✓ .env file created"];
  if (cl.startsWith("export ") || cl.includes("=")) return [];

  return ["Done."];
}

/* ─── Terminal Emulator ──────────────────────────────────────────── */
interface HistoryEntry {
  cmd: string;
  output: string[];
  isComment: boolean;
}

interface ParsedCmd {
  raw: string;
  isComment: boolean;
}

function parseCmds(code: string): ParsedCmd[] {
  return code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => {
      const stripped = l.startsWith("$ ") ? l.slice(2) : l.startsWith("$") ? l.slice(1).trim() : l;
      return { raw: stripped, isComment: stripped.startsWith("#") };
    });
}

function TerminalEmulator({ code, lang }: { code: string; lang: string }) {
  const cmds = useMemo(() => parseCmds(code), [code]);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeCmd, setActiveCmd] = useState<string | null>(null);
  const [typedCount, setTypedCount] = useState(0);
  const [activeOutput, setActiveOutput] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const bodyRef = useRef<HTMLDivElement>(null);

  /* auto-scroll */
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, activeOutput, typedCount]);

  /* animation */
  useEffect(() => {
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        return () => clearTimeout(t);
      });

    setHistory([]);
    setActiveCmd(null);
    setTypedCount(0);
    setActiveOutput([]);
    setIsDone(false);

    async function run() {
      await wait(400);
      if (cancelled) return;

      for (const entry of cmds) {
        if (cancelled) return;

        if (entry.isComment) {
          setHistory((prev) => [...prev, { cmd: entry.raw, output: [], isComment: true }]);
          await wait(100);
          continue;
        }

        /* type the command */
        setActiveCmd(entry.raw);
        setTypedCount(0);
        setActiveOutput([]);

        for (let i = 0; i <= entry.raw.length; i++) {
          if (cancelled) return;
          setTypedCount(i);
          await wait(20);
        }

        await wait(380);
        if (cancelled) return;

        /* reveal output lines */
        const output = getSimulatedOutput(entry.raw);
        for (const line of output) {
          if (cancelled) return;
          setActiveOutput((prev) => [...prev, line]);
          await wait(170);
        }

        await wait(320);
        if (cancelled) return;

        /* commit to history */
        setHistory((prev) => [...prev, { cmd: entry.raw, output, isComment: false }]);
        setActiveCmd(null);
        setTypedCount(0);
        setActiveOutput([]);
        await wait(80);
      }

      if (!cancelled) setIsDone(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [cmds, replayKey]);

  return (
    <div
      className="my-4 overflow-hidden"
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "#0c0c13",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#181825", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          <div className="flex items-center gap-1.5 ml-3">
            <Terminal size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              AI Terminal — {lang}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDone && (
            <motion.div
              className="flex items-center gap-1.5 text-[11px] font-mono"
              style={{ color: "rgba(0,208,255,0.6)" }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#00d0ff" }} />
              Running
            </motion.div>
          )}
          {isDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-[11px] font-mono"
              style={{ color: "#28c840" }}
            >
              <Check size={11} />
              Done
            </motion.div>
          )}
          <button
            onClick={() => setReplayKey((k) => k + 1)}
            title="Replay"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,208,255,0.1)";
              e.currentTarget.style.color = "var(--sb-accent)";
              e.currentTarget.style.borderColor = "rgba(0,208,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <RotateCcw size={10} />
            Replay
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={bodyRef}
        className="p-4 overflow-y-auto"
        style={{ minHeight: 80, maxHeight: 340, fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
      >
        {/* Completed history */}
        {history.map((entry, i) =>
          entry.isComment ? (
            <div key={i} className="flex items-start mb-0.5">
              <span className="text-[12.5px] leading-5" style={{ color: "rgba(255,255,255,0.22)" }}>
                {entry.cmd}
              </span>
            </div>
          ) : (
            <div key={i} className="mb-2">
              <div className="flex items-start gap-2">
                <span className="text-[12.5px] leading-5 shrink-0 select-none" style={{ color: "rgba(0,208,255,0.55)" }}>
                  $
                </span>
                <span className="text-[12.5px] leading-5 text-white break-all">{entry.cmd}</span>
              </div>
              {entry.output.map((line, j) => (
                <div
                  key={j}
                  className="text-[12px] leading-5 pl-4"
                  style={{
                    color: line.startsWith("✓") ? "#28c840" : "rgba(134,239,172,0.65)",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          )
        )}

        {/* Currently active cmd being typed */}
        {activeCmd !== null && (
          <div className="mb-2">
            <div className="flex items-start gap-2">
              <span className="text-[12.5px] leading-5 shrink-0 select-none" style={{ color: "rgba(0,208,255,0.55)" }}>
                $
              </span>
              <span className="text-[12.5px] leading-5 text-white break-all">
                {activeCmd.slice(0, typedCount)}
                <span
                  className="inline-block w-[7px] h-[14px] align-middle ml-px rounded-sm animate-blink"
                  style={{ background: "rgba(0,208,255,0.8)", verticalAlign: "middle" }}
                />
              </span>
            </div>
            {activeOutput.map((line, j) => (
              <motion.div
                key={j}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[12px] leading-5 pl-4"
                style={{
                  color: line.startsWith("✓") ? "#28c840" : "rgba(134,239,172,0.65)",
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        )}

        {/* Idle cursor when nothing is typing but not done */}
        {activeCmd === null && !isDone && history.length === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] leading-5" style={{ color: "rgba(0,208,255,0.55)" }}>$</span>
            <span
              className="inline-block w-[7px] h-[14px] rounded-sm animate-blink"
              style={{ background: "rgba(0,208,255,0.8)" }}
            />
          </div>
        )}

        {/* Done line */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1.5 mt-1 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-[12.5px] leading-5" style={{ color: "rgba(0,208,255,0.55)" }}>$</span>
            <span
              className="inline-block w-[7px] h-[14px] rounded-sm animate-blink"
              style={{ background: "rgba(0,208,255,0.5)" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Generic Code Block ─────────────────────────────────────────── */
type CodeProps = React.ComponentPropsWithoutRef<"code"> & { inline?: boolean };

const CodeBlock: Components["code"] = ({ inline, className, children, ...props }: CodeProps) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string[] | null>(null);
  const [showOutput, setShowOutput] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const code = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1] ?? "";
  const canRun = JS_LANGS.has(lang.toLowerCase());
  const isShell = SHELL_LANGS.has(lang.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await runInSandbox(code);
      setOutput(result);
      setShowOutput(true);
    } finally {
      setIsRunning(false);
    }
  };

  if (!inline && match) {
    if (isShell) {
      return <TerminalEmulator code={code} lang={lang} />;
    }

    return (
      <div
        className="relative group my-4 overflow-x-auto"
        style={{ borderRadius: 12, border: "1px solid rgba(0,208,255,0.18)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: "rgba(0,208,255,0.06)", borderBottom: "1px solid rgba(0,208,255,0.1)" }}
        >
          <span className="text-xs font-mono" style={{ color: "rgba(0,208,255,0.6)" }}>{lang || "code"}</span>
          <div className="flex items-center gap-3">
            {canRun && (
              <button
                onClick={() => void handleRun()}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                style={{ color: "#34d399" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6ee7b7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#34d399")}
              >
                {isRunning ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                <span>{isRunning ? "Running…" : "Run"}</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sb-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              {copied ? <Check size={13} style={{ color: "#34d399" }} /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          style={syntaxTheme}
          language={lang}
          PreTag="div"
          className="!m-0 !bg-transparent !p-4 text-sm"
          {...(props as object)}
        >
          {code}
        </SyntaxHighlighter>
        {output !== null && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setShowOutput((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
              style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.4)" }}
            >
              <span className="font-mono">Output</span>
              {showOutput ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showOutput && (
              <pre
                className="px-4 py-3 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-48"
                style={{ background: "rgba(0,0,0,0.5)", color: "#34d399" }}
              >
                {output.join("\n")}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <code
      className="font-mono text-sm"
      style={{
        background: "rgba(0,208,255,0.12)",
        color: "#b3f0ff",
        padding: "0.125em 0.375em",
        borderRadius: 4,
      }}
      {...props}
    >
      {children}
    </code>
  );
};

const markdownComponents: Components = { code: CodeBlock };

/* ─── Avatars ────────────────────────────────────────────────────── */
function UserAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
      style={{ background: "var(--sb-gradient)", color: "#121212", boxShadow: "var(--sb-glow-sm)" }}
    >
      U
    </div>
  );
}

function AiAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
      style={{ background: "rgba(0,208,255,0.12)", border: "1px solid rgba(0,208,255,0.3)", color: "var(--sb-accent)" }}
    >
      AI
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--sb-accent)" }}
        />
      ))}
    </div>
  );
}

/* ─── Message List ───────────────────────────────────────────────── */
interface MessageListProps {
  messages: OpenaiMessage[];
  isLoading: boolean;
  streamingContent?: string | null;
}

export function MessageList({ messages, isLoading, streamingContent }: MessageListProps) {

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 rounded-full w-1/4" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-16 rounded-2xl w-full" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";
        const isImage = typeof msg.content === "string" && msg.content.startsWith("data:image/");

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
            className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {isUser ? <UserAvatar /> : <AiAvatar />}
            <div className={`flex flex-col gap-1 min-w-0 ${isUser ? "items-end max-w-[78%]" : "items-start flex-1"}`}>
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                {isUser ? "You" : "Sandbox AI"}
              </span>
              {isImage ? (
                <img
                  src={msg.content}
                  alt="Generated"
                  className="rounded-2xl max-w-full h-auto"
                  style={{ border: "1px solid rgba(0,208,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                />
              ) : isUser ? (
                <div
                  className="px-4 py-3 text-sm leading-relaxed break-words"
                  style={{
                    background: "var(--sb-gradient)",
                    borderRadius: "16px 4px 16px 16px",
                    color: "#121212",
                    fontWeight: 500,
                    boxShadow: "0 4px 20px rgba(0,208,255,0.3)",
                  }}
                >
                  {msg.content}
                </div>
              ) : (
                <div
                  className="px-4 py-3 text-sm prose-chat w-full min-w-0"
                  style={{
                    background: "var(--sb-gradient-ai)",
                    borderRadius: "4px 16px 16px 16px",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Live streaming bubble */}
      {streamingContent !== null && streamingContent !== undefined && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 flex-row">
          <AiAvatar />
          <div className="flex flex-col gap-1 min-w-0 flex-1 items-start">
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
              Sandbox AI
            </span>
            <div
              className="px-4 py-3 text-sm prose-chat w-full min-w-0"
              style={{
                background: "var(--sb-gradient-ai)",
                borderRadius: "4px 16px 16px 16px",
                border: "1px solid rgba(0,208,255,0.12)",
                boxShadow: "0 0 20px rgba(0,208,255,0.06)",
              }}
            >
              {streamingContent === "" ? (
                <TypingDots />
              ) : streamingContent.startsWith("data:image/") ? (
                <img
                  src={streamingContent}
                  alt="Generating..."
                  className="rounded-xl max-w-full h-auto"
                  style={{ border: "1px solid rgba(0,208,255,0.2)" }}
                />
              ) : (
                <>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {streamingContent}
                  </ReactMarkdown>
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 -mb-0.5 rounded-full animate-blink"
                    style={{ backgroundColor: "var(--sb-accent)" }}
                  />
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, ExternalLink, Copy, Check,
  Code2, RefreshCw, Maximize2, Minimize2, CheckCircle2,
  Terminal, Play, Square, Zap, ZapOff,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CSSProperties } from "react";
import { runInSandbox } from "@/lib/sandbox-runner";

const syntaxTheme = vscDarkPlus as { [key: string]: CSSProperties };

/* ─────────────────────────────────────────
   Types
   ───────────────────────────────────────── */
export interface CodeBlock {
  lang: string;
  code: string;
  label?: string;
}

interface TerminalLine {
  type: "log" | "error" | "warn" | "info" | "system";
  text: string;
}

type ViewMode = "preview" | "terminal" | "code";

interface CodePreviewPanelProps {
  blocks: CodeBlock[];
  isOpen: boolean;
  onClose: () => void;
  autoOpened?: boolean;
}

/* ─────────────────────────────────────────
   Helpers
   ───────────────────────────────────────── */
function buildSrcdoc(block: CodeBlock): string {
  const { lang, code } = block;
  const l = lang.toLowerCase();

  if (l === "html" || code.trimStart().toLowerCase().startsWith("<!doctype") || code.includes("<html")) {
    return code;
  }

  if (l === "css") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 24px; font-family: -apple-system, sans-serif; background: #0e0e14; color: #e0e0e0; }
  ${code}
</style>
</head>
<body>
  <div class="preview-content">
    <h1>CSS Preview</h1>
    <p>Your styles are applied to this page.</p>
    <button>Button</button>
    <div class="card"><p>Card element</p></div>
  </div>
</body>
</html>`;
  }

  if (["js", "javascript", "jsx", "ts", "tsx", "typescript"].includes(l)) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 20px; font-family: -apple-system, sans-serif; background: #0e0e14; color: #e0e0e0; }
  #output { white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 13px; background: rgba(0,208,255,0.05); border: 1px solid rgba(0,208,255,0.15); border-radius: 8px; padding: 16px; min-height: 48px; }
  .label { font-size: 11px; color: rgba(0,208,255,0.6); margin-bottom: 8px; font-family: monospace; letter-spacing: 0.05em; text-transform: uppercase; }
  #root { background: #0e0e14; }
</style>
</head>
<body>
  <div class="label">Output</div>
  <div id="output"></div>
  <div id="root"></div>
  <script>
    const _out = document.getElementById('output');
    console.log = (...args) => {
      _out.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') + '\\n';
    };
    console.error = (...args) => {
      _out.style.color = '#ef4444';
      _out.textContent += '[ERROR] ' + args.map(a => String(a)).join(' ') + '\\n';
    };
    try { ${code} } catch(e) { document.getElementById('output').textContent = 'Error: ' + e.message; }
  </script>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>body { margin: 0; padding: 20px; background: #0e0e14; }
pre { color: #e0e0e0; font-family: 'JetBrains Mono', monospace; font-size: 13px; white-space: pre-wrap; }</style>
</head>
<body><pre>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body>
</html>`;
}

function langLabel(lang: string): string {
  const map: Record<string, string> = {
    html: "HTML", css: "CSS", js: "JavaScript", javascript: "JavaScript",
    jsx: "React JSX", ts: "TypeScript", tsx: "React TSX", typescript: "TypeScript",
    python: "Python", py: "Python", bash: "Shell", sh: "Shell",
  };
  return map[lang.toLowerCase()] ?? lang.toUpperCase();
}

const PREVIEWABLE = new Set(["html", "css", "js", "javascript", "jsx", "ts", "tsx", "typescript"]);
const RUNNABLE = new Set(["js", "javascript", "jsx", "ts", "tsx", "typescript"]);

/* ─────────────────────────────────────────
   Terminal View
   ───────────────────────────────────────── */
function TerminalView({ lines, isRunning, onRun, onClear, canRun }: {
  lines: TerminalLine[];
  isRunning: boolean;
  onRun: () => void;
  onClear: () => void;
  canRun: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error": return "#ef4444";
      case "warn": return "#fbbf24";
      case "info": return "#60a5fa";
      case "system": return "rgba(0,208,255,0.5)";
      default: return "#34d399";
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "#08080e", fontFamily: "var(--app-font-mono, 'JetBrains Mono', monospace)" }}
    >
      {/* Terminal toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34d399" }} />
          <span className="ml-3 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>sandbox terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {canRun && (
            <>
              <button
                onClick={onClear}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >
                clear
              </button>
              <button
                onClick={onRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                style={{
                  background: isRunning ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.12)",
                  color: isRunning ? "#ef4444" : "#34d399",
                  border: isRunning ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(52,211,153,0.2)",
                }}
              >
                {isRunning ? (
                  <><Square size={10} /> Stop</>
                ) : (
                  <><Play size={10} /> Run</>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        {lines.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            <Terminal size={32} style={{ opacity: 0.3 }} />
            <div className="text-xs text-center">
              {canRun ? "Click Run to execute code in the sandbox" : "This language cannot be executed in the terminal"}
            </div>
          </div>
        )}

        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-start gap-2 mb-1 leading-relaxed"
          >
            <span style={{ color: "rgba(0,208,255,0.35)", flexShrink: 0 }}>
              {line.type === "system" ? "»" : "$"}
            </span>
            <span style={{ color: lineColor(line.type), wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
              {line.text}
            </span>
          </motion.div>
        ))}

        {isRunning && (
          <motion.div
            className="flex items-center gap-2 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span style={{ color: "rgba(0,208,255,0.35)" }}>$</span>
            <span style={{ color: "rgba(0,208,255,0.5)" }}>running</span>
            <motion.span
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ color: "var(--sb-accent)" }}
            >
              ▋
            </motion.span>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
   ───────────────────────────────────────── */
export function CodePreviewPanel({ blocks, isOpen, onClose, autoOpened }: CodePreviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewableBlocks = useMemo(
    () => blocks.filter((b) => PREVIEWABLE.has(b.lang.toLowerCase())),
    [blocks]
  );
  const displayBlocks = previewableBlocks.length > 0 ? previewableBlocks : blocks;
  const block = displayBlocks[Math.min(currentIndex, displayBlocks.length - 1)];
  const total = displayBlocks.length;

  const canPreview = block && PREVIEWABLE.has(block.lang.toLowerCase());
  const canRun = block && RUNNABLE.has(block.lang.toLowerCase());

  const runCode = useCallback(async () => {
    if (!block || !canRun || isRunning) return;
    setIsRunning(true);
    setTerminalLines([{ type: "system", text: `Running ${langLabel(block.lang)} code…` }]);
    try {
      const output = await runInSandbox(block.code, 8000);
      setTerminalLines((prev) => [
        ...prev,
        ...output.map((line): TerminalLine => {
          if (line.startsWith("[error]")) return { type: "error", text: line.replace("[error] ", "") };
          if (line.startsWith("[warn]")) return { type: "warn", text: line.replace("[warn] ", "") };
          if (line.startsWith("[info]")) return { type: "info", text: line.replace("[info] ", "") };
          return { type: "log", text: line };
        }),
        { type: "system", text: "Done." },
      ]);
    } catch (err) {
      setTerminalLines((prev) => [
        ...prev,
        { type: "error", text: String(err) },
        { type: "system", text: "Execution failed." },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [block, canRun, isRunning]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(0);
    setTerminalLines([]);
    setIsRunning(false);
    setIframeKey((k) => k + 1);

    if (autoOpened) {
      setShowSuccessBanner(true);
      const t = setTimeout(() => setShowSuccessBanner(false), 3500);

      // Decide initial view
      if (block && canRun) {
        // JS/TS → show terminal first and auto-run
        setViewMode("terminal");
        if (autoRun) {
          setTimeout(() => { void runCode(); }, 300);
        }
      } else {
        setViewMode("preview");
      }

      return () => clearTimeout(t);
    } else {
      setViewMode(canRun ? "terminal" : "preview");
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoOpened]);

  useEffect(() => {
    if (isOpen) {
      setTerminalLines([]);
      setIframeKey((k) => k + 1);
    }
  }, [currentIndex, isOpen]);

  const handleCopy = () => {
    if (block) navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInNewTab = () => {
    if (!block) return;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(buildSrcdoc(block));
      w.document.close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && block && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              height: isMaximized ? "100vh" : "65vh",
              background: "var(--sb-card)",
              borderTop: "1px solid rgba(0,208,255,0.2)",
              borderRadius: isMaximized ? 0 : "20px 20px 0 0",
              boxShadow: "0 -8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,208,255,0.08)",
            }}
          >
            {/* Success banner */}
            <AnimatePresence>
              {showSuccessBanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden shrink-0"
                >
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                    style={{
                      background: "linear-gradient(90deg, rgba(0,208,255,0.12), rgba(52,211,153,0.08))",
                      borderBottom: "1px solid rgba(52,211,153,0.2)",
                      color: "#34d399",
                    }}
                  >
                    <CheckCircle2 size={15} />
                    Build complete — {canRun ? "Auto-running in terminal…" : "Preview ready"}
                    <motion.div
                      className="ml-auto h-0.5 rounded-full"
                      style={{ background: "#34d399", originX: 0 }}
                      initial={{ scaleX: 1 }}
                      animate={{ scaleX: 0 }}
                      transition={{ duration: 3.5, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Drag handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Left — label + nav */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Code2 size={14} style={{ color: "var(--sb-accent)" }} />
                  <span
                    className="text-sm font-semibold hidden sm:block"
                    style={{ fontFamily: "var(--app-font-display)", color: "white" }}
                  >
                    {block.label ?? langLabel(block.lang)}
                  </span>
                </div>

                {/* Prev/Next */}
                {total > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      disabled={currentIndex === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,208,255,0.12)"; e.currentTarget.style.color = "var(--sb-accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-mono px-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {currentIndex + 1} / {total}
                    </span>
                    <button
                      onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                      disabled={currentIndex === total - 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,208,255,0.12)"; e.currentTarget.style.color = "var(--sb-accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Block tabs (when multiple) */}
                {total > 1 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {displayBlocks.map((b, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={i === currentIndex ? {
                          background: "var(--sb-gradient)",
                          color: "#080810",
                        } : {
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {langLabel(b.lang)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — view tabs + actions */}
              <div className="flex items-center gap-1.5">
                {/* View mode tabs */}
                <div
                  className="flex items-center rounded-lg p-0.5 gap-0.5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Terminal tab */}
                  {canRun && (
                    <button
                      onClick={() => setViewMode("terminal")}
                      title="Terminal"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                      style={viewMode === "terminal" ? {
                        background: "rgba(52,211,153,0.15)",
                        color: "#34d399",
                      } : {
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Terminal size={11} />
                      <span className="hidden sm:inline">Terminal</span>
                    </button>
                  )}

                  {/* Preview tab */}
                  {canPreview && (
                    <button
                      onClick={() => setViewMode("preview")}
                      title="Preview"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                      style={viewMode === "preview" ? {
                        background: "rgba(0,208,255,0.12)",
                        color: "var(--sb-accent)",
                      } : {
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Play size={11} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  )}

                  {/* Code tab */}
                  <button
                    onClick={() => setViewMode("code")}
                    title="Source Code"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={viewMode === "code" ? {
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    } : {
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Code2 size={11} />
                    <span className="hidden sm:inline">Code</span>
                  </button>
                </div>

                {/* Auto-run toggle (only for runnable blocks) */}
                {canRun && (
                  <button
                    onClick={() => setAutoRun((v) => !v)}
                    title={autoRun ? "Auto-run ON — click to disable" : "Auto-run OFF — click to enable"}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={autoRun ? {
                      background: "rgba(52,211,153,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.25)",
                    } : {
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid transparent",
                    }}
                  >
                    {autoRun ? <Zap size={12} /> : <ZapOff size={12} />}
                  </button>
                )}

                {/* Refresh */}
                <button
                  onClick={() => { setIframeKey((k) => k + 1); if (viewMode === "terminal") { setTerminalLines([]); void runCode(); } }}
                  title="Refresh"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >
                  <RefreshCw size={12} />
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  title="Copy code"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: copied ? "#34d399" : "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>

                {/* Open in new tab */}
                {canPreview && (
                  <button
                    onClick={handleOpenInNewTab}
                    title="Open in new tab"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,208,255,0.12)"; e.currentTarget.style.color = "var(--sb-accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <ExternalLink size={12} />
                  </button>
                )}

                {/* Maximize */}
                <button
                  onClick={() => setIsMaximized((v) => !v)}
                  title={isMaximized ? "Restore" : "Maximize"}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >
                  {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  title="Close"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.6)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(239,68,68,0.6)"; }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {viewMode === "terminal" ? (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <TerminalView
                      lines={terminalLines}
                      isRunning={isRunning}
                      onRun={() => { setTerminalLines([]); void runCode(); }}
                      onClear={() => setTerminalLines([])}
                      canRun={!!canRun}
                    />
                  </motion.div>
                ) : viewMode === "code" ? (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-auto"
                    style={{ background: "#1e1e2e" }}
                  >
                    <SyntaxHighlighter
                      style={syntaxTheme}
                      language={block.lang || "html"}
                      PreTag="div"
                      className="!m-0 !bg-transparent !p-5 text-sm h-full"
                      showLineNumbers
                      wrapLines
                    >
                      {block.code}
                    </SyntaxHighlighter>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`preview-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                    style={{ background: "#fff" }}
                  >
                    <iframe
                      ref={iframeRef}
                      key={iframeKey}
                      srcDoc={buildSrcdoc(block)}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      className="w-full h-full border-0"
                      title="Code Preview"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile nav footer */}
            {total > 1 && (
              <div
                className="flex sm:hidden items-center justify-between px-4 py-2 shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {currentIndex + 1} / {total}
                </span>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                  disabled={currentIndex === total - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Utilities (used by chat-area.tsx)
   ───────────────────────────────────────── */
export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let match;
  const seen = new Set<string>();

  while ((match = regex.exec(content)) !== null) {
    const lang = (match[1] ?? "").toLowerCase().trim() || "text";
    const code = match[2].trim();
    if (!code) continue;
    const key = `${lang}:${code.slice(0, 100)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({ lang, code });
  }

  if (blocks.length === 0 && (content.includes("<!DOCTYPE") || content.includes("<html"))) {
    const htmlMatch = content.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
    if (htmlMatch) blocks.push({ lang: "html", code: htmlMatch[0] });
  }

  return blocks;
}

const RENDERABLE = new Set(["html", "css", "js", "javascript", "jsx", "ts", "tsx", "typescript"]);

export function hasRenderableCode(blocks: CodeBlock[]): boolean {
  return blocks.some((b) => RENDERABLE.has(b.lang.toLowerCase()));
}

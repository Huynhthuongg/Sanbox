import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Square, Trash2, Terminal, ChevronDown } from "lucide-react";
import { runInSandbox } from "@/lib/sandbox-runner";

interface TerminalLine {
  type: "log" | "error" | "warn" | "info" | "system" | "input";
  text: string;
}

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export function TerminalDrawer({ isOpen, onClose, initialCode }: TerminalDrawerProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "Sandbox Terminal — JavaScript REPL · type code and press Run" },
  ]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [height, setHeight] = useState(300);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firedCode = useRef<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialCode && initialCode !== firedCode.current) {
      firedCode.current = initialCode;
      setInput(initialCode);
      void runCode(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCode]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const runCode = useCallback(async (code?: string) => {
    const src = (code ?? input).trim();
    if (!src || isRunning) return;
    setIsRunning(true);
    setLines((prev) => [
      ...prev,
      { type: "input", text: src.length > 120 ? src.slice(0, 120) + "…" : src },
    ]);
    try {
      const output = await runInSandbox(src, 8000);
      setLines((prev) => [
        ...prev,
        ...output.map((line): TerminalLine => {
          if (line.startsWith("[error]")) return { type: "error", text: line.replace("[error] ", "") };
          if (line.startsWith("[warn]"))  return { type: "warn",  text: line.replace("[warn] ", "") };
          if (line.startsWith("[info]"))  return { type: "info",  text: line.replace("[info] ", "") };
          return { type: "log", text: line };
        }),
        { type: "system", text: "─── done ───" },
      ]);
    } catch (err) {
      setLines((prev) => [
        ...prev,
        { type: "error", text: String(err) },
        { type: "system", text: "─── failed ───" },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [input, isRunning]);

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":  return "#ef4444";
      case "warn":   return "#fbbf24";
      case "info":   return "#60a5fa";
      case "system": return "rgba(0,208,255,0.4)";
      case "input":  return "rgba(255,255,255,0.45)";
      default:       return "#34d399";
    }
  };

  const linePrefix = (type: TerminalLine["type"]) => {
    if (type === "input")  return "›";
    if (type === "system") return "»";
    return "$";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void runCode();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
          style={{
            height,
            minHeight: 220,
            maxHeight: "70vh",
            background: "#090910",
            borderTop: "1px solid rgba(52,211,153,0.25)",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -8px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(52,211,153,0.08)",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {/* Resize handle */}
          <div
            className="absolute top-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startH = height;
              const onMove = (me: MouseEvent) => {
                const delta = startY - me.clientY;
                setHeight(Math.max(220, Math.min(window.innerHeight * 0.7, startH + delta)));
              };
              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          </div>

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 shrink-0 mt-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#fbbf24" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#34d399" }} />
              </div>
              <div className="flex items-center gap-1.5">
                <Terminal size={12} style={{ color: "#34d399" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  sandbox — javascript repl
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLines([{ type: "system", text: "Sandbox Terminal — cleared" }])}
                title="Clear"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >
                <Trash2 size={11} />
                <span className="hidden sm:inline">clear</span>
              </button>
              <button
                onClick={onClose}
                title="Close terminal"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; }}
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          {/* Body: output + input */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Output */}
            <div className="flex-1 overflow-y-auto px-4 py-3 text-xs" style={{ scrollbarWidth: "thin" }}>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-start gap-2 mb-1 leading-relaxed"
                >
                  <span className="shrink-0" style={{ color: "rgba(0,208,255,0.3)" }}>
                    {linePrefix(line.type)}
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
                  <span style={{ color: "rgba(0,208,255,0.3)" }}>$</span>
                  <span style={{ color: "rgba(52,211,153,0.6)" }}>running</span>
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ color: "#34d399" }}
                  >▋</motion.span>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input row */}
            <div
              className="shrink-0 flex items-end gap-2 px-3 pb-3 pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span style={{ color: "rgba(52,211,153,0.5)", fontSize: 13, marginBottom: 6 }}>›</span>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type JavaScript... (Ctrl+Enter to run)"
                rows={2}
                className="flex-1 resize-none bg-transparent border-0 outline-none text-xs leading-relaxed"
                style={{
                  color: "#e0e0e0",
                  caretColor: "#34d399",
                  fontFamily: "inherit",
                  maxHeight: 80,
                  scrollbarWidth: "none",
                }}
                spellCheck={false}
              />
              <button
                onClick={() => void runCode()}
                disabled={isRunning || !input.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 shrink-0"
                style={{
                  background: isRunning ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.14)",
                  color:      isRunning ? "#ef4444" : "#34d399",
                  border:     isRunning ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(52,211,153,0.22)",
                }}
              >
                {isRunning ? <><Square size={10} /> Stop</> : <><Play size={10} /> Run</>}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

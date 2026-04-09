import { useState, useRef, useEffect, useCallback, MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Paperclip, Globe, Brain, Mic, X,
  StopCircle, FileText, Image as ImageFileIcon, File,
  Smartphone, Code2, ImageIcon, MessageSquare, Lightbulb,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PendingEntry {
  message: string;
  forConvId: number;
}

interface AttachedFile {
  id: string;
  file: File;
  previewUrl?: string;
}

type ConvMode = "chat" | "code" | "image" | "flutter";

interface ModeSuggestion {
  mode: ConvMode;
  label: string;
  icon: typeof MessageSquare;
  color: string;
  reason: string;
}

const MODE_META: Record<ConvMode, { label: string; icon: typeof MessageSquare; color: string }> = {
  chat:    { label: "Chat",    icon: MessageSquare, color: "#00d0ff" },
  code:    { label: "Code",    icon: Code2,         color: "#34d399" },
  image:   { label: "Image",   icon: ImageIcon,     color: "#a855f7" },
  flutter: { label: "Flutter", icon: Smartphone,    color: "#54c5f8" },
};

function detectMode(text: string): { mode: ConvMode; reason: string } | null {
  const t = text.toLowerCase();

  if (
    /flutter|dart|riverpod|getx|cubit|bloc\s|pubspec|pub\.dev|statefulwidget|statelesswidget|buildcontext|scaffold|materialapp|navigat(or|e to)|build flutter|mobile app/.test(t) ||
    (/app/.test(t) && /android|ios|play store|app store/.test(t))
  ) {
    return { mode: "flutter", reason: "Flutter / Dart / Mobile" };
  }

  if (
    /generate (a |an )?(image|picture|photo|illustration|logo|icon)|draw (me |a |an )?|create (a |an )?(image|visual|design|logo|thumbnail|banner|wallpaper)|make (a |an )?(photo|picture|image)|render (a |an )?|photorealistic|3d render/.test(t)
  ) {
    return { mode: "image", reason: "image generation" };
  }

  if (
    /write (a |the )?(function|class|component|api|test|script|algorithm|code|program)|build (a |an )?(api|backend|server|cli|component|app in)|implement (a |an )?|debug (my|this|the)|fix (this|my|the) (bug|error|code|issue)|refactor|python|typescript script|node\.js|express(\.js)?|fastapi|django|sql query|write tests/.test(t)
  ) {
    return { mode: "code", reason: "code generation" };
  }

  return null;
}

interface ChatInputProps {
  conversationId?: number;
  mode: string;
  pendingRef: MutableRefObject<PendingEntry | null>;
  onCreateConversation: (content: string) => void;
  onStreamStart?: () => void;
  onChunk: (chunk: string) => void;
  onStreamDone: () => void;
  promptFill?: string;
  onPromptFillConsumed?: () => void;
  isDeepThink?: boolean;
  onDeepThinkChange?: (val: boolean) => void;
  onSuggestMode?: (mode: ConvMode) => void;
}

async function streamConversation(
  conversationId: number,
  content: string,
  onChunk: (text: string) => void,
  options?: { deepThink?: boolean }
): Promise<void> {
  const body: Record<string, unknown> = { content };
  if (options?.deepThink) {
    body.systemPrefix =
      "Think step by step. Before giving your answer, walk through your reasoning process carefully. Show your chain of thought.";
    body.deepThink = true;
  }

  const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream reader");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      for (const line of event.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        let parsed: { content?: string; imageUrl?: string; done?: boolean; error?: string };
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.content) onChunk(parsed.content);
        if (parsed.imageUrl) onChunk(parsed.imageUrl);
        if (parsed.done) return;
      }
    }
  }
}

function fileIcon(file: File) {
  if (file.type.startsWith("image/")) return <ImageFileIcon size={11} />;
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return <FileText size={11} />;
  return <File size={11} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

const TOOLBAR_BTN =
  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none";

export function ChatInput({
  conversationId,
  mode,
  pendingRef,
  onCreateConversation,
  onStreamStart,
  onChunk,
  onStreamDone,
  promptFill,
  onPromptFillConsumed,
  isDeepThink = false,
  onDeepThinkChange,
  onSuggestMode,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestion, setSuggestion] = useState<ModeSuggestion | null>(null);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firedForConvId = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── promptFill ───────────────────────── */
  useEffect(() => {
    if (promptFill) {
      setInput(promptFill);
      onPromptFillConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [promptFill]);

  /* ── pending message after nav ──────── */
  useEffect(() => {
    const pending = pendingRef.current;
    if (
      pending &&
      conversationId === pending.forConvId &&
      firedForConvId.current !== pending.forConvId
    ) {
      firedForConvId.current = pending.forConvId;
      pendingRef.current = null;
      void send(pending.message, pending.forConvId);
    }
  }, [conversationId]);

  /* ── auto-resize textarea ───────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  /* ── smart mode detection (debounced) ─ */
  useEffect(() => {
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);

    if (!input.trim() || input.length < 12 || conversationId || suggestionDismissed) {
      if (!input.trim()) {
        setSuggestion(null);
        setSuggestionDismissed(false);
      }
      return;
    }

    suggestionTimerRef.current = setTimeout(() => {
      const detected = detectMode(input);
      if (detected && detected.mode !== (mode as ConvMode)) {
        const meta = MODE_META[detected.mode];
        setSuggestion({
          mode: detected.mode,
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          reason: detected.reason,
        });
      } else {
        setSuggestion(null);
      }
    }, 650);

    return () => {
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    };
  }, [input, mode, conversationId, suggestionDismissed]);

  const handleAcceptSuggestion = useCallback(() => {
    if (!suggestion) return;
    onSuggestMode?.(suggestion.mode);
    setSuggestion(null);
    setSuggestionDismissed(true);
  }, [suggestion, onSuggestMode]);

  const handleDismissSuggestion = useCallback(() => {
    setSuggestion(null);
    setSuggestionDismissed(true);
  }, []);

  /* ── send ───────────────────────────── */
  const send = async (content: string, convId: number) => {
    setIsGenerating(true);
    onStreamStart?.();
    try {
      await streamConversation(convId, content, onChunk, { deepThink: isDeepThink });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Send error:", err);
      }
    } finally {
      setIsGenerating(false);
      onStreamDone();
    }
  };

  const handleSend = async () => {
    let content = input.trim();
    if (!content || isGenerating) return;

    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.file.name).join(", ");
      content += `\n\n[Attached files: ${fileNames}]`;
    }

    setInput("");
    setAttachedFiles([]);
    setSuggestion(null);
    setSuggestionDismissed(false);

    if (!conversationId) {
      onCreateConversation(content);
      return;
    }
    await send(content, conversationId);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    onStreamDone();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  /* ── file attach ────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles: AttachedFile[] = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  /* ── voice ──────────────────────────── */
  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  };

  const placeholder =
    mode === "image"
      ? "Describe the image you want to generate…"
      : mode === "code"
      ? "Describe what code you need…"
      : mode === "flutter"
      ? "Ask about Flutter, Riverpod, Firebase, ASO, Android Vitals…"
      : isDeepThink
      ? "Ask anything — AI will reason step-by-step…"
      : "Ask anything… (Enter to send · Shift+Enter for newline)";

  const charCount = input.length;
  const canSend = !!input.trim() && !isGenerating;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Smart Mode Suggestion Banner ── */}
      <AnimatePresence>
        {suggestion && !conversationId && (
          <motion.div
            key="mode-suggestion"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-2 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${suggestion.color}0f, ${suggestion.color}07)`,
              border: `1px solid ${suggestion.color}28`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${suggestion.color}18`, border: `1px solid ${suggestion.color}30` }}
              >
                <Lightbulb size={13} style={{ color: suggestion.color }} />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-medium text-white/75">
                  Looks like a{" "}
                  <span style={{ color: suggestion.color }} className="font-semibold">
                    {suggestion.reason}
                  </span>{" "}
                  request —{" "}
                </span>
                <span className="text-[12px] text-white/45">
                  switch to {suggestion.label} mode?
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleAcceptSuggestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: `${suggestion.color}22`,
                  color: suggestion.color,
                  border: `1px solid ${suggestion.color}35`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${suggestion.color}35`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${suggestion.color}22`;
                }}
              >
                <suggestion.icon size={11} />
                Switch
              </button>
              <button
                onClick={handleDismissSuggestion}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                title="Dismiss"
              >
                <X size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Attached files ───────────────── */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 px-1 pb-2"
          >
            {attachedFiles.map((af) => (
              <motion.div
                key={af.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(0,208,255,0.08)",
                  border: "1px solid rgba(0,208,255,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 180,
                }}
              >
                {af.previewUrl ? (
                  <img
                    src={af.previewUrl}
                    alt=""
                    className="w-5 h-5 rounded object-cover shrink-0"
                  />
                ) : (
                  <span style={{ color: "var(--sb-accent)", flexShrink: 0 }}>{fileIcon(af.file)}</span>
                )}
                <span className="truncate">{af.file.name}</span>
                <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {formatBytes(af.file.size)}
                </span>
                <button
                  onClick={() => removeFile(af.id)}
                  className="shrink-0 rounded-full p-0.5 transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input container ─────────── */}
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          background: "var(--sb-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: isFocused
            ? "1px solid rgba(0,208,255,0.45)"
            : isDeepThink
            ? "1px solid rgba(139,92,246,0.35)"
            : "1px solid rgba(255,255,255,0.09)",
          boxShadow: isFocused
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 3px rgba(0,208,255,0.1)"
            : isDeepThink
            ? "0 0 0 1px rgba(139,92,246,0.1), 0 8px 32px rgba(0,0,0,0.3)"
            : "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
          className="min-h-[52px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 px-4 py-4 pb-12 text-sm shadow-none leading-relaxed placeholder:text-white/20"
          style={{ color: "var(--sb-text)", outline: "none" }}
          disabled={isGenerating}
        />

        {/* ── Bottom toolbar ───────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 pb-2 pt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Left tools */}
          <div className="flex items-center gap-1">
            {/* Attach */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.ts,.py,.html,.css"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className={TOOLBAR_BTN}
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--sb-accent)";
                e.currentTarget.style.background = "rgba(0,208,255,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Paperclip size={13} />
              <span className="hidden sm:inline">Attach</span>
            </button>

            {/* Web search */}
            <button
              onClick={() => setWebSearch((v) => !v)}
              title="Toggle web search"
              className={TOOLBAR_BTN}
              style={{
                color: webSearch ? "var(--sb-accent)" : "rgba(255,255,255,0.35)",
                background: webSearch ? "rgba(0,208,255,0.1)" : "transparent",
                border: webSearch ? "1px solid rgba(0,208,255,0.25)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                if (!webSearch) {
                  e.currentTarget.style.color = "var(--sb-accent)";
                  e.currentTarget.style.background = "rgba(0,208,255,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (!webSearch) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Globe size={13} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Deep Think */}
            <button
              onClick={() => onDeepThinkChange?.(!isDeepThink)}
              title={isDeepThink ? "Deep Think ON — Click to disable" : "Enable deep thinking mode"}
              className={TOOLBAR_BTN}
              style={{
                color: isDeepThink ? "#c084fc" : "rgba(255,255,255,0.35)",
                background: isDeepThink ? "rgba(139,92,246,0.12)" : "transparent",
                border: isDeepThink ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isDeepThink) {
                  e.currentTarget.style.color = "#c084fc";
                  e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (!isDeepThink) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Brain size={13} />
              <span className="hidden sm:inline">
                {isDeepThink ? "Deep Think ON" : "Think"}
              </span>
              {isDeepThink && (
                <motion.span
                  className="w-1.5 h-1.5 rounded-full ml-0.5"
                  style={{ background: "#c084fc" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </button>

            {/* Voice */}
            <button
              onClick={handleVoice}
              title="Voice input"
              className={TOOLBAR_BTN}
              style={{
                color: isListening ? "#ef4444" : "rgba(255,255,255,0.35)",
                background: isListening ? "rgba(239,68,68,0.1)" : "transparent",
              }}
              onMouseEnter={e => {
                if (!isListening) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={e => {
                if (!isListening) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Mic size={13} />
                </motion.div>
              ) : (
                <Mic size={13} />
              )}
            </button>
          </div>

          {/* Right side — char count + send/stop */}
          <div className="flex items-center gap-2">
            {charCount > 0 && (
              <span
                className="text-[10px] font-mono tabular-nums"
                style={{ color: charCount > 3000 ? "#f59e0b" : "rgba(255,255,255,0.2)" }}
              >
                {charCount.toLocaleString()}
              </span>
            )}

            {/* Stop button */}
            <AnimatePresence>
              {isGenerating && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleStop}
                  title="Stop generation"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#ef4444",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                >
                  <StopCircle size={12} />
                  <span className="hidden sm:inline">Stop</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Send */}
            <motion.button
              whileHover={canSend ? { scale: 1.08 } : {}}
              whileTap={canSend ? { scale: 0.93 } : {}}
              onClick={() => void handleSend()}
              disabled={!canSend}
              title="Send message (Enter)"
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all"
              style={
                isGenerating
                  ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.15)" }
                  : canSend
                  ? {
                      background: isDeepThink
                        ? "linear-gradient(135deg, #7c3aed, #00d0ff)"
                        : "var(--sb-gradient)",
                      color: "#080810",
                      boxShadow: isDeepThink
                        ? "0 0 20px rgba(139,92,246,0.5)"
                        : "0 0 20px rgba(0,208,255,0.45)",
                    }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" }
              }
            >
              {isGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

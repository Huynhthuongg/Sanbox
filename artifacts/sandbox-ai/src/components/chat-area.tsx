import { useState, useEffect, useRef } from "react";
import {
  useGetOpenaiConversation,
  getGetOpenaiConversationQueryKey,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
  useCreateOpenaiConversation,
  getListOpenaiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Menu, Code2, ImageIcon, MessageSquare, Smartphone,
  Zap, History, Globe, Brain, Layers, ArrowRight,
  Copy, Check, Share2,
} from "lucide-react";
import { LockedModeButton, PaywallModal } from "./feature-gate";
import { AnimatePresence, motion } from "framer-motion";
import { usePermissions } from "@/hooks/use-permissions";
import { ChatInput } from "./chat-input";
import { ThinkingAnimation, DeepThinkBadge } from "./thinking-animation";
import { MessageList } from "./message-list";
import { CodePreviewPanel, extractCodeBlocks, hasRenderableCode } from "./code-preview-panel";
import type { CodeBlock } from "./code-preview-panel";
import { useLocation } from "wouter";

interface ChatAreaProps {
  conversationId?: number;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

type ConvMode = "chat" | "code" | "image" | "flutter";

const MODES: { id: ConvMode; label: string; icon: typeof MessageSquare; description: string; color: string }[] = [
  { id: "chat",    label: "Chat",    icon: MessageSquare, description: "GPT-5.2 · assistant",         color: "#00d0ff" },
  { id: "code",    label: "Code",    icon: Code2,         description: "GPT-5.3 Codex · specialist",   color: "#34d399" },
  { id: "image",   label: "Image",   icon: ImageIcon,     description: "gpt-image-1 · generator",      color: "#a855f7" },
  { id: "flutter", label: "Flutter", icon: Smartphone,    description: "GPT-5.2 · Flutter & Firebase", color: "#54c5f8" },
];

const MODE_MODELS: Record<ConvMode, string> = {
  chat:    "gpt-5.2",
  code:    "gpt-5.3-codex",
  image:   "gpt-image-1",
  flutter: "gpt-5.2",
};

const PROMPT_CHIPS: Record<ConvMode, string[]> = {
  image:   ["A futuristic city at night", "Portrait of a cyberpunk warrior", "Abstract neon art", "Serene Japanese garden in fog"],
  code:    ["Build a REST API in Node.js", "Fix a React bug for me", "Write a Python web scraper", "Explain async/await in JS"],
  chat:    ["Build a website for me", "Fix a bug in my code", "Write an API", "Explain this concept"],
  flutter: ["Build a HabitFlow app with Riverpod", "Set up Firebase Auth + Firestore", "Generate ASO store listing 2026", "Fix Android Vitals: ANR & cold start"],
};

const EMPTY_STATE_FEATURES: Record<ConvMode, { icon: typeof Zap; title: string; desc: string }[]> = {
  chat: [
    { icon: Brain,   title: "Deep reasoning",     desc: "Complex multi-step analysis and planning" },
    { icon: Globe,   title: "Web knowledge",       desc: "Up-to-date information and research" },
    { icon: Layers,  title: "Full context",        desc: "Remembers your entire conversation" },
    { icon: Zap,     title: "Real-time stream",    desc: "Answers appear word by word instantly" },
  ],
  code: [
    { icon: Code2,   title: "GPT-5.3 Codex",     desc: "Most capable coding model available" },
    { icon: Zap,     title: "Live sandbox",        desc: "Run code directly in the browser" },
    { icon: Layers,  title: "Any language",        desc: "Python, JS, Go, Rust and more" },
    { icon: History, title: "Full history",        desc: "Save and revisit every session" },
  ],
  image: [
    { icon: ImageIcon, title: "gpt-image-1",      desc: "OpenAI's highest quality image model" },
    { icon: History,   title: "Saved forever",    desc: "All images stored in your conversation" },
    { icon: Globe,     title: "Any style",         desc: "Photorealistic, illustration, abstract" },
    { icon: Zap,       title: "Fast generation",  desc: "High resolution in seconds" },
  ],
  flutter: [
    { icon: Smartphone, title: "Flutter expert",    desc: "MVVM + Riverpod architecture patterns" },
    { icon: Zap,        title: "Firebase ready",    desc: "Auth, Firestore, Functions setup" },
    { icon: Globe,      title: "ASO 2026",          desc: "Store optimization and ranking strategies" },
    { icon: Layers,     title: "Android Vitals",    desc: "ANR <0.47%, Crash <1.09% targets" },
  ],
};

interface PendingEntry {
  message: string;
  forConvId: number;
}

function SandboxLogo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
          filter: "drop-shadow(0 0 8px rgba(0,208,255,0.5))",
        }}
      >
        <img
          src="/icons/icon-512.png"
          alt="Sandbox AI"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }}
        />
      </div>
      <div className="hidden sm:flex flex-col">
        <span
          className="font-bold text-sm leading-tight"
          style={{
            fontFamily: "var(--app-font-display)",
            color: "var(--sb-accent)",
            letterSpacing: "-0.02em",
            textShadow: "0 0 12px rgba(0,208,255,0.45)",
          }}
        >
          SANDBOX.AI
        </span>
        <span className="text-[9px] font-mono leading-tight" style={{ color: "rgba(0,208,255,0.5)", letterSpacing: "0.08em" }}>
          v2.0
        </span>
      </div>
    </div>
  );
}

function CopyConversationButton({ messages }: { messages: { role: string; content: string }[] }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = messages
      .map(m => `${m.role === "user" ? "You" : "Sandbox AI"}:\n${m.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy conversation"
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(0,208,255,0.1)";
        e.currentTarget.style.color = "var(--sb-accent)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.color = "rgba(255,255,255,0.35)";
      }}
    >
      <AnimatePresence mode="wait">
        {copied
          ? <motion.div key="check" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}><Check size={14} style={{ color: "#34d399" }} /></motion.div>
          : <motion.div key="copy" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}><Copy size={13} /></motion.div>}
      </AnimatePresence>
    </button>
  );
}

export function ChatArea({ conversationId, onToggleSidebar, isSidebarOpen }: ChatAreaProps) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedMode, setSelectedMode] = useState<ConvMode>("chat");
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [promptFill, setPromptFill] = useState("");
  const [isDeepThink, setIsDeepThink] = useState(false);
  const [isThinkingPhase, setIsThinkingPhase] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<CodeBlock[]>([]);
  const [previewAutoOpened, setPreviewAutoOpened] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<"image" | "flutter" | null>(null);
  const pendingRef = useRef<PendingEntry | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef<string>("");
  const { canUse } = usePermissions();

  const { data: conversation, isLoading: isLoadingConv } = useGetOpenaiConversation(
    conversationId ?? 0,
    { query: { enabled: !!conversationId, queryKey: getGetOpenaiConversationQueryKey(conversationId ?? 0) } }
  );

  const { data: messages, isLoading: isLoadingMessages } = useListOpenaiMessages(
    conversationId ?? 0,
    { query: { enabled: !!conversationId, queryKey: getListOpenaiMessagesQueryKey(conversationId ?? 0) } }
  );

  const createConversation = useCreateOpenaiConversation();

  useEffect(() => {
    const mode = sessionStorage.getItem("sb_prompt_mode") as ConvMode | null;
    const fill = sessionStorage.getItem("sb_prompt_fill");
    if (mode && MODES.some((m) => m.id === mode)) setSelectedMode(mode);
    if (fill) setPromptFill(fill);
    sessionStorage.removeItem("sb_prompt_mode");
    sessionStorage.removeItem("sb_prompt_fill");
  }, []);

  useEffect(() => {
    if (conversation?.mode) {
      const m = conversation.mode as ConvMode;
      if (MODES.some((mo) => mo.id === m)) setSelectedMode(m);
    }
  }, [conversation?.mode]);

  useEffect(() => {
    setStreamingContent(null);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streamingContent]);

  const handleNewConversation = (content: string) => {
    const mode = selectedMode;
    const model = MODE_MODELS[mode];
    createConversation.mutate(
      { data: { title: content.slice(0, 60), mode, model } },
      {
        onSuccess: (conv) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          pendingRef.current = { message: content, forConvId: conv.id };
          navigate(`/chat/${conv.id}`);
        },
      }
    );
  };

  const handleStreamStart = () => {
    setStreamingContent("");
    setIsThinkingPhase(true);
    streamingContentRef.current = "";
  };

  const handleChunk = (chunk: string) => {
    setIsThinkingPhase(false);
    streamingContentRef.current += chunk;
    setStreamingContent((prev) => (prev ?? "") + chunk);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleStreamDone = () => {
    const finalContent = streamingContentRef.current;
    setStreamingContent(null);
    setIsThinkingPhase(false);

    const blocks = extractCodeBlocks(finalContent);
    if (blocks.length > 0 && hasRenderableCode(blocks)) {
      setPreviewBlocks(blocks);
      setPreviewAutoOpened(true);
      setPreviewOpen(true);
    }

    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    }
  };

  const activeMode = conversationId && conversation?.mode ? (conversation.mode as ConvMode) : selectedMode;
  const activeModeInfo = MODES.find((m) => m.id === activeMode) ?? MODES[0];
  const modeInfo = MODES.find((m) => m.id === selectedMode) ?? MODES[0];
  const features = EMPTY_STATE_FEATURES[selectedMode];

  return (
    <div
      className="flex-1 flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: "var(--sb-bg)" }}
    >
      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 shrink-0"
        style={{
          height: 60,
          backgroundColor: "rgba(22,22,31,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {!isSidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onToggleSidebar}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(0,208,255,0.12)";
                  e.currentTarget.style.color = "var(--sb-accent)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <Menu size={16} />
              </button>
              <SandboxLogo />
            </div>
          ) : (
            <button
              onClick={onToggleSidebar}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,208,255,0.12)";
                e.currentTarget.style.color = "var(--sb-accent)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              <Menu size={16} />
            </button>
          )}

          {/* Conversation title (when in a conversation) */}
          {conversationId && conversation?.title && (
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <span
                className="text-sm font-semibold truncate max-w-[240px]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {conversation.title}
              </span>
            </div>
          )}

          {/* Mode selector pills — only show when no conversation */}
          {!conversationId && (
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {MODES.map((m) => {
                const Icon = m.icon;
                const isActive = m.id === selectedMode;
                const isGated = m.id === "image" || m.id === "flutter";
                if (isGated) {
                  return (
                    <LockedModeButton
                      key={m.id}
                      label={m.label}
                      icon={m.icon}
                      color={m.color}
                      feature={m.id as "image" | "flutter"}
                      isActive={isActive}
                      onClick={() => setSelectedMode(m.id)}
                    />
                  );
                }
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    title={m.description}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={isActive ? {
                      background: "var(--sb-gradient)",
                      color: "#121212",
                      boxShadow: "0 0 12px rgba(0,208,255,0.4)",
                    } : {
                      background: "transparent",
                      color: "rgba(255,255,255,0.38)",
                    }}
                  >
                    <Icon size={12} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence>
            {isDeepThink && <DeepThinkBadge />}
          </AnimatePresence>

          {/* Copy conversation */}
          {conversationId && messages && messages.length > 0 && (
            <CopyConversationButton messages={messages as any} />
          )}

          {/* Mode badge — always visible */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono"
            style={{
              background: "rgba(0,208,255,0.06)",
              color: "rgba(0,208,255,0.6)",
              border: "1px solid rgba(0,208,255,0.12)",
            }}
          >
            <activeModeInfo.icon size={11} />
            <span>{activeModeInfo.description}</span>
          </div>
        </div>
      </header>

      {/* ── Scrollable chat body ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-[800px] mx-auto pb-36">
          {!conversationId ? (
            /* ── Beautiful empty state ── */
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center mt-10 md:mt-16"
              >
                {/* Mode icon glow */}
                <motion.div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative"
                  style={{
                    background: `linear-gradient(135deg, ${modeInfo.color}22, ${modeInfo.color}10)`,
                    border: `1px solid ${modeInfo.color}40`,
                    boxShadow: `0 0 48px ${modeInfo.color}18`,
                  }}
                  animate={{ boxShadow: [`0 0 48px ${modeInfo.color}18`, `0 0 64px ${modeInfo.color}28`, `0 0 48px ${modeInfo.color}18`] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <modeInfo.icon size={32} style={{ color: modeInfo.color }} />
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2.5 text-white">
                  {selectedMode === "image"   ? "Describe an image to generate"
                    : selectedMode === "code"   ? "What code can I help you build?"
                    : selectedMode === "flutter" ? "Build your Flutter app with AI"
                    :                             "How can I help you today?"}
                </h2>
                <p className="text-sm max-w-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {selectedMode === "image"   ? "Powered by gpt-image-1. Describe your vision and watch it come to life."
                    : selectedMode === "code"   ? "GPT-5.3 Codex — the most capable coding model. Ask anything."
                    : selectedMode === "flutter" ? "Expert mode: MVVM + Riverpod · Firebase · ASO 2026 · Android Vitals."
                    :                             "Powered by GPT-5.2 with real-time streaming and full history."}
                </p>

                {/* Feature mini-cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-8 w-full max-w-2xl">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className="p-3 rounded-xl text-left"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <f.icon size={14} style={{ color: modeInfo.color, marginBottom: 6 }} />
                      <div className="text-xs font-semibold text-white mb-0.5">{f.title}</div>
                      <div className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.32)" }}>{f.desc}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Prompt suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {PROMPT_CHIPS[selectedMode].map((prompt, i) => (
                    <motion.button
                      key={prompt}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + 0.04 * i }}
                      onClick={() => setPromptFill(prompt)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: "rgba(0,208,255,0.06)",
                        border: "1px solid rgba(0,208,255,0.18)",
                        color: "rgba(56,217,255,0.72)",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(0,208,255,0.14)";
                        e.currentTarget.style.borderColor = "rgba(0,208,255,0.45)";
                        e.currentTarget.style.color = "var(--sb-accent-light)";
                        e.currentTarget.style.boxShadow = "0 0 14px rgba(0,208,255,0.18)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(0,208,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(0,208,255,0.18)";
                        e.currentTarget.style.color = "rgba(56,217,255,0.72)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <ArrowRight size={11} />
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              <MessageList
                messages={messages ?? []}
                isLoading={isLoadingMessages || isLoadingConv}
                streamingContent={streamingContent}
              />
              <div className="mt-4">
                <ThinkingAnimation isThinking={isThinkingPhase} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Input area ── */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 md:p-5"
        style={{ background: "linear-gradient(to top, var(--sb-bg) 60%, transparent)" }}
      >
        <div className="max-w-[800px] mx-auto">
          <ChatInput
            conversationId={conversationId}
            mode={activeMode}
            pendingRef={pendingRef}
            onCreateConversation={handleNewConversation}
            onStreamStart={handleStreamStart}
            onChunk={handleChunk}
            onStreamDone={handleStreamDone}
            promptFill={promptFill}
            onPromptFillConsumed={() => setPromptFill("")}
            isDeepThink={isDeepThink}
            onDeepThinkChange={setIsDeepThink}
            onSuggestMode={(m) => {
              const mode = m as ConvMode;
              if ((mode === "image" || mode === "flutter") && !canUse(mode)) {
                setPaywallFeature(mode);
                return;
              }
              setSelectedMode(mode);
            }}
          />
          <p
            className="text-center mt-2.5 text-[11px] font-mono"
            style={{ color: "rgba(255,255,255,0.14)" }}
          >
            Sandbox AI v2 · {activeModeInfo.description} · verify important outputs
          </p>
        </div>
      </div>

      {/* ── Code Preview Panel ── */}
      <CodePreviewPanel
        blocks={previewBlocks}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        autoOpened={previewAutoOpened}
      />

      {/* ── Paywall Modal (suggest-mode bypass guard) ── */}
      {paywallFeature && (
        <PaywallModal
          feature={paywallFeature}
          onClose={() => setPaywallFeature(null)}
        />
      )}
    </div>
  );
}

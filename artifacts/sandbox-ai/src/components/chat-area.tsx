import { useState, useEffect, useRef, useCallback } from "react";
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
  Copy, Check, ChevronDown, Bot, BarChart2,
  GitBranch, Shield, Cpu, TrendingUp, Search, ChevronUp,
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

type ConvMode = "agent" | "chat" | "code" | "sas" | "image" | "flutter";

const MODES: { id: ConvMode; label: string; icon: typeof MessageSquare; description: string; color: string }[] = [
  { id: "agent", label: "Agent",  icon: Bot,         description: "GPT-5.2 Auto · autonomous agent",  color: "#a855f7" },
  { id: "chat",  label: "Chat",   icon: MessageSquare, description: "GPT-5.2 · deep reasoning",       color: "#00d0ff" },
  { id: "code",  label: "Vscode", icon: Code2,         description: "GPT-5.3 Codex · code specialist", color: "#34d399" },
  { id: "sas",   label: "Sas",    icon: BarChart2,     description: "Analytics AI · data & SaaS",      color: "#f59e0b" },
];

const MODE_MODELS: Record<ConvMode, string> = {
  agent:   "gpt-5.2",
  chat:    "gpt-5.2",
  code:    "gpt-5.3-codex",
  sas:     "gpt-5.2",
  image:   "gpt-image-1",
  flutter: "gpt-5.2",
};

const MULTI_MODELS = [
  { id: "gpt-5.2",   label: "GPT-5.2",       provider: "OpenAI",    color: "#00d0ff", active: true },
  { id: "gemini-2.0", label: "Gemini 2.0 Pro", provider: "Google",    color: "#34d399", active: false },
  { id: "claude-3.7", label: "Claude 3.7",     provider: "Anthropic", color: "#f59e0b", active: false },
];

const PROMPT_CHIPS: Record<ConvMode, string[]> = {
  agent:   ["Build me a full-stack app autonomously", "Research AI trends 2026 và tổng hợp", "Tự động hóa deploy pipeline của tôi", "Phân tích và sửa toàn bộ bug trong codebase"],
  chat:    ["Build a website for me", "Fix a bug in my code", "Write an API", "Explain this concept"],
  code:    ["Build a REST API in Node.js", "Fix a React bug for me", "Write a Python web scraper", "Explain async/await in JS"],
  sas:     ["Phân tích dữ liệu doanh thu Q4", "Tạo dashboard SaaS metrics", "Dự báo tăng trưởng MRR 2026", "Phân tích churn rate và nguyên nhân"],
  image:   ["A futuristic city at night", "Portrait of a cyberpunk warrior", "Abstract neon art", "Serene Japanese garden in fog"],
  flutter: ["Build a HabitFlow app with Riverpod", "Set up Firebase Auth + Firestore", "Generate ASO store listing 2026", "Fix Android Vitals: ANR & cold start"],
};

const EMPTY_STATE_FEATURES: Record<ConvMode, { icon: typeof Zap; title: string; desc: string }[]> = {
  agent: [
    { icon: Bot,        title: "Autonomous Execution", desc: "Lên kế hoạch, thực thi và tự sửa lỗi không cần can thiệp" },
    { icon: Search,     title: "Web Research",          desc: "Tìm kiếm web thật qua Serper.dev, tổng hợp dữ liệu" },
    { icon: GitBranch,  title: "Self-Mutation Engine",  desc: "Tự đọc và ghi đè code của chính nó qua GitHub" },
    { icon: Layers,     title: "Multi-Agent System",    desc: "Điều phối nhiều sub-agent cho tác vụ phức tạp" },
  ],
  chat: [
    { icon: Brain,   title: "Deep Reasoning",    desc: "Complex multi-step analysis and planning" },
    { icon: Globe,   title: "Web Knowledge",     desc: "Up-to-date information and research" },
    { icon: Layers,  title: "Vector Memory",     desc: "Bộ nhớ dài hạn lưu toàn bộ ngữ cảnh dự án" },
    { icon: Zap,     title: "Real-time Stream",  desc: "Answers appear word by word instantly" },
  ],
  code: [
    { icon: Code2,     title: "GPT-5.3 Codex",   desc: "Most capable coding model available" },
    { icon: Zap,       title: "Live Sandbox",     desc: "Run code directly in the browser" },
    { icon: Shield,    title: "Security Review",  desc: "Phát hiện SQL Injection, Memory Leak tự động" },
    { icon: GitBranch, title: "One-Click Deploy", desc: "Push GitHub và deploy Vercel trong một bước" },
  ],
  sas: [
    { icon: BarChart2,  title: "Data Analytics",    desc: "Phân tích thống kê sâu và phát hiện pattern" },
    { icon: TrendingUp, title: "Predictive AI",      desc: "Dự báo xu hướng với ML-powered projections" },
    { icon: Cpu,        title: "SaaS Metrics",       desc: "MRR, Churn, LTV, DAU và 50+ KPI tự động" },
    { icon: Zap,        title: "Auto Dashboards",    desc: "Tạo biểu đồ tương tác từ raw data" },
  ],
  image: [
    { icon: ImageIcon, title: "gpt-image-1",     desc: "OpenAI's highest quality image model" },
    { icon: History,   title: "Saved forever",   desc: "All images stored in your conversation" },
    { icon: Globe,     title: "Any style",        desc: "Photorealistic, illustration, abstract" },
    { icon: Zap,       title: "Fast generation", desc: "High resolution in seconds" },
  ],
  flutter: [
    { icon: Smartphone, title: "Flutter expert",  desc: "MVVM + Riverpod architecture patterns" },
    { icon: Zap,        title: "Firebase ready",  desc: "Auth, Firestore, Functions setup" },
    { icon: Globe,      title: "ASO 2026",        desc: "Store optimization and ranking strategies" },
    { icon: Layers,     title: "Android Vitals",  desc: "ANR <0.47%, Crash <1.09% targets" },
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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState(MULTI_MODELS[0]);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const isAtBottomRef = useRef(true);
  const pendingRef = useRef<PendingEntry | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef<string>("");
  const { canUse } = usePermissions();

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    }
    setNewMsgCount(0);
    setIsAtBottom(true);
    isAtBottomRef.current = true;
  }, []);

  const checkAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 120;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
    isAtBottomRef.current = atBottom;
    if (atBottom) setNewMsgCount(0);
  }, []);

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
    setNewMsgCount(0);
    setIsAtBottom(true);
    isAtBottomRef.current = true;
  }, [conversationId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkAtBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkAtBottom);
  }, [checkAtBottom]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom(false);
    } else {
      setNewMsgCount((n) => n + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  const handleNewConversation = (content: string) => {
    const mode = selectedMode;
    const model = MODE_MODELS[mode];
    createConversation.mutate(
      { data: { title: content.slice(0, 60), mode: mode as any, model } },
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
    setNewMsgCount(0);
    scrollToBottom(false);
  };

  const handleChunk = (chunk: string) => {
    setIsThinkingPhase(false);
    streamingContentRef.current += chunk;
    setStreamingContent((prev) => (prev ?? "") + chunk);
    if (isAtBottomRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
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
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    title={m.description}
                    className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${m.color}ee, ${m.color}99)`,
                      color: "#121212",
                      boxShadow: `0 0 12px ${m.color}55`,
                    } : {
                      background: "transparent",
                      color: "rgba(255,255,255,0.38)",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{m.label}</span>
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

          {/* Multi-Model Selector */}
          <div className="relative">
            <button
              onClick={() => setModelDropOpen(v => !v)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all"
              style={{
                background: `${selectedModel.color}0f`,
                color: selectedModel.color,
                border: `1px solid ${selectedModel.color}28`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${selectedModel.color}55`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${selectedModel.color}28`; }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: selectedModel.color }} />
              <span>{selectedModel.label}</span>
              {modelDropOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            <AnimatePresence>
              {modelDropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-50"
                  style={{ background: "#0c0c14", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                >
                  {MULTI_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m); setModelDropOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all"
                      style={{ color: selectedModel.id === m.id ? m.color : "rgba(255,255,255,0.5)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = selectedModel.id === m.id ? m.color : "rgba(255,255,255,0.5)"; }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                        <span className="font-semibold">{m.label}</span>
                        <span className="text-[10px] opacity-50">{m.provider}</span>
                      </div>
                      {!m.active && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>Soon</span>
                      )}
                      {selectedModel.id === m.id && (
                        <Check size={11} style={{ color: m.color }} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mode badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono"
            style={{
              background: `${activeModeInfo.color}0a`,
              color: `${activeModeInfo.color}99`,
              border: `1px solid ${activeModeInfo.color}18`,
            }}
          >
            <activeModeInfo.icon size={11} />
            <span>{activeModeInfo.description}</span>
          </div>
        </div>
      </header>

      {/* ── Scroll-to-bottom floating button ── */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            key="scroll-btn"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollToBottom()}
            className="absolute z-20 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold shadow-lg"
            style={{
              bottom: 110,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--sb-gradient)",
              color: "#0a0a12",
              boxShadow: "0 4px 24px rgba(0,208,255,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            <ChevronDown size={15} />
            {newMsgCount > 0 ? `${newMsgCount} tin nhắn mới` : "Cuộn xuống"}
          </motion.button>
        )}
      </AnimatePresence>

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
                className="flex flex-col items-center justify-center text-center mt-6 md:mt-10"
              >
                {/* Mode icon glow */}
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: `linear-gradient(135deg, ${modeInfo.color}20, ${modeInfo.color}0d)`,
                    border: `1px solid ${modeInfo.color}35`,
                    boxShadow: `0 0 28px ${modeInfo.color}14`,
                  }}
                  animate={{ boxShadow: [`0 0 28px ${modeInfo.color}14`, `0 0 40px ${modeInfo.color}22`, `0 0 28px ${modeInfo.color}14`] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <modeInfo.icon size={20} style={{ color: modeInfo.color }} />
                </motion.div>

                <h2 className="text-lg md:text-xl font-black tracking-tight mb-1.5 text-white">
                  {selectedMode === "agent"   ? "Your Autonomous AI Agent"
                    : selectedMode === "code"  ? "What code can I help you build?"
                    : selectedMode === "sas"   ? "Analyze your data with AI"
                    : selectedMode === "image" ? "Describe an image to generate"
                    :                           "How can I help you today?"}
                </h2>
                <p className="text-xs max-w-xs mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {selectedMode === "agent"   ? "Tự lên kế hoạch, thực thi, research và deploy — không cần can thiệp thủ công."
                    : selectedMode === "code"  ? "GPT-5.3 Codex — the most capable coding model. Ask anything."
                    : selectedMode === "sas"   ? "Analytics AI phân tích dữ liệu, tạo dashboard và dự báo tăng trưởng SaaS."
                    : selectedMode === "image" ? "Powered by gpt-image-1. Describe your vision and watch it come to life."
                    :                           "Powered by GPT-5.2 · Vector Memory · Real-time streaming."}
                </p>

                {/* Feature mini-cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5 w-full max-w-xl">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                      className="p-2.5 rounded-xl text-left"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <f.icon size={13} style={{ color: modeInfo.color, marginBottom: 4 }} />
                      <div className="text-[11px] font-semibold text-white mb-0.5">{f.title}</div>
                      <div className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.32)" }}>{f.desc}</div>
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

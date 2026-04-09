import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, ChevronUp,
  Copy, Terminal, GitBranch, Package, Settings2, Rocket, Zap,
  X, Key, Smartphone,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

/* ─── Design tokens (blackbox.ai-style) ─────────────────── */
const BB = {
  bg: "#050507",
  terminal: "#0a0a10",
  terminalBorder: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.06)",
  accent: "#00d0ff",
  green: "#34d399",
  muted: "rgba(255,255,255,0.38)",
};

/* ─── Terminal panel data ───────────────────────────────── */
interface TermLine { text: string; color?: string }

const PANELS: { id: string; title: string; lines: TermLine[] }[] = [
  {
    id: "chat",
    title: "MODE: CHAT // Deep Reasoning",
    lines: [
      { text: "> sandbox ask --model gpt-5.2 \"Phân tích kiến trúc microservices\"" },
      { text: "[INIT] Loading conversation context...", color: BB.muted },
      { text: "[THINK] Multi-step reasoning enabled", color: BB.accent },
      { text: "[FETCH] Web knowledge base: active", color: BB.muted },
      { text: "[STREAM] Generating response...", color: BB.muted },
      { text: "[TOKEN] 1024 / 128k context used", color: BB.muted },
      { text: "[DONE] Answer ready. 847 tokens.", color: BB.green },
      { text: "" },
      { text: "> sandbox ask \"Tối ưu SQL query này cho tôi\"" },
      { text: "[THINK] Analyzing query plan...", color: BB.muted },
      { text: "[OPT] Index suggestion: users(email, created_at)", color: BB.accent },
      { text: "[BENCH] Estimated speedup: 12×", color: BB.green },
      { text: "[DONE] Optimized query generated.", color: BB.green },
    ],
  },
  {
    id: "code",
    title: "MODE: CODE // GPT-5.3 Codex",
    lines: [
      { text: "> sandbox code --task \"Build REST API with auth\"" },
      { text: "[PLAN] Endpoints: POST /auth, GET /me, CRUD /posts", color: BB.muted },
      { text: "[GEN] src/routes/auth.ts — created", color: BB.accent },
      { text: "[GEN] src/routes/posts.ts — created", color: BB.accent },
      { text: "[GEN] src/middleware/jwt.ts — created", color: BB.accent },
      { text: "[GEN] tests/auth.test.ts (8 cases)", color: BB.muted },
      { text: "[TEST] 8/8 passing", color: BB.green },
      { text: "[DONE] API ready. PR staged.", color: BB.green },
      { text: "" },
      { text: "> sandbox code --task \"Fix TypeError in useEffect\"" },
      { text: "[SCAN] Found: stale closure on line 47", color: "#f59e0b" },
      { text: "[FIX] Added deps array [userId, token]", color: BB.accent },
      { text: "[DONE] Bug fixed.", color: BB.green },
    ],
  },
  {
    id: "image",
    title: "MODE: IMAGE // gpt-image-1",
    lines: [
      { text: "> sandbox image \"Cyberpunk city at night, neon rain\"" },
      { text: "[INIT] Loading gpt-image-1...", color: BB.muted },
      { text: "[STYLE] Photorealistic · 1024×1024", color: BB.muted },
      { text: "[GEN] Rendering frame 1/4...", color: BB.accent },
      { text: "[GEN] Rendering frame 2/4...", color: BB.accent },
      { text: "[GEN] Rendering frame 3/4...", color: BB.accent },
      { text: "[GEN] Rendering frame 4/4...", color: BB.accent },
      { text: "[SAVE] Saved to conversation history", color: BB.muted },
      { text: "[DONE] Image ready. Quality: HD", color: BB.green },
      { text: "" },
      { text: "> sandbox image \"Logo for a fintech startup\"" },
      { text: "[STYLE] Vector style · transparent bg", color: BB.muted },
      { text: "[DONE] 3 variants generated.", color: BB.green },
    ],
  },
  {
    id: "flutter",
    title: "MODE: FLUTTER // Expert AI",
    lines: [
      { text: "> sandbox flutter --app HabitFlow --arch riverpod" },
      { text: "[PLAN] MVVM + Riverpod + Firebase", color: BB.muted },
      { text: "[GEN] lib/main.dart — entry point", color: BB.accent },
      { text: "[GEN] lib/providers/habit_provider.dart", color: BB.accent },
      { text: "[GEN] lib/screens/home_screen.dart", color: BB.accent },
      { text: "[FIREBASE] Auth + Firestore configured", color: BB.accent },
      { text: "[PUBSPEC] riverpod: ^2.5.1 added", color: BB.muted },
      { text: "[DONE] App scaffolded. Run: flutter run", color: BB.green },
      { text: "" },
      { text: "> sandbox flutter --task \"Fix ANR < 0.47%\"" },
      { text: "[PROFILE] Main thread blocked: 234ms", color: "#f59e0b" },
      { text: "[FIX] Moved DB ops to compute isolate", color: BB.accent },
      { text: "[DONE] ANR rate: 0.31% ✓", color: BB.green },
    ],
  },
];

/* ─── Animated Terminal Panel ───────────────────────────── */
function TerminalPanel({ panel, delay = 0 }: { panel: typeof PANELS[0]; delay?: number }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setVisibleLines(i);
      if (i < panel.lines.length) {
        timerRef.current = setTimeout(tick, i === 0 ? delay + 400 : 580 + Math.random() * 380);
      } else {
        // reset after a pause
        timerRef.current = setTimeout(() => {
          setVisibleLines(0);
          i = 0;
          timerRef.current = setTimeout(tick, 900);
        }, 5500);
      }
    };
    timerRef.current = setTimeout(tick, delay + 200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [panel, delay]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: BB.terminal,
        border: `1px solid ${BB.terminalBorder}`,
        minHeight: 200,
        maxHeight: 260,
      }}
    >
      {/* title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${BB.terminalBorder}`, background: "rgba(255,255,255,0.02)" }}
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-2 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>
          {panel.title}
        </span>
      </div>
      {/* output */}
      <div className="flex-1 overflow-hidden p-3 space-y-0.5">
        {panel.lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="font-mono text-[11px] leading-[18px] whitespace-pre-wrap break-all">
            {line.text === "" ? (
              <span>&nbsp;</span>
            ) : (
              <span style={{ color: line.color ?? "rgba(255,255,255,0.75)" }}>{line.text}</span>
            )}
          </div>
        ))}
        {visibleLines < panel.lines.length && visibleLines > 0 && (
          <span
            className="inline-block w-[7px] h-[13px] rounded-sm"
            style={{ background: BB.accent, opacity: 0.8, animation: "blink 0.9s step-end infinite" }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Logo marquee ──────────────────────────────────────── */
const LOGOS = [
  "GitHub", "Vercel", "Firebase", "Supabase", "Stripe",
  "OpenAI", "Anthropic", "Clerk", "Railway", "PlanetScale",
  "Cloudflare", "AWS", "Render", "Neon", "Resend",
  "Upstash", "Turso", "Linear", "Sentry", "Datadog",
];

function LogoMarquee() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <div className="relative overflow-hidden py-6" style={{ borderTop: `1px solid ${BB.border}`, borderBottom: `1px solid ${BB.border}` }}>
      <div
        className="flex items-center gap-12 whitespace-nowrap"
        style={{ animation: "marquee 32s linear infinite", display: "flex", width: "max-content" }}
      >
        {doubled.map((logo, i) => (
          <span
            key={i}
            className="text-sm font-semibold tracking-wide shrink-0"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Deploy Guide components ───────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={copy}
      className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-all"
      style={{
        background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
        border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
        color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function CmdLine({ cmd, comment }: { cmd: string; comment?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg transition-colors"
      style={{ background: hovered ? "rgba(255,255,255,0.04)" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2 min-w-0">
        {comment ? (
          <span className="font-mono text-[12px] leading-5 select-text" style={{ color: "rgba(255,255,255,0.25)" }}>{cmd}</span>
        ) : (
          <>
            <span className="font-mono text-[12px] shrink-0 select-none" style={{ color: "rgba(0,208,255,0.5)" }}>$</span>
            <span className="font-mono text-[12px] leading-5 text-white truncate select-text">{cmd}</span>
          </>
        )}
      </div>
      <AnimatePresence>
        {hovered && !comment && (
          <motion.div key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.1 }}>
            <CopyBtn text={cmd} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DeployStepProps {
  step: number;
  title: string;
  icon: typeof Terminal;
  color: string;
  cmds: { cmd: string; comment?: boolean }[];
}

function DeployStep({ step, title, icon: Icon, color, cmds }: DeployStepProps) {
  const [copied, setCopied] = useState(false);
  const allCmds = cmds.filter(c => !c.comment).map(c => c.cmd).join("\n");
  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(allCmds);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [allCmds]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: step * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${BB.border}`, background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "#0f0f18", borderBottom: `1px solid ${BB.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-black text-xs" style={{ background: `${color}22`, color, border: `1px solid ${color}40` }}>{step}</div>
          <div className="flex items-center gap-2">
            <Icon size={13} style={{ color }} />
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
        </div>
      </div>
      <div className="py-2">
        {cmds.map((c, i) => <CmdLine key={i} cmd={c.cmd} comment={c.comment} />)}
      </div>
      <div className="px-4 py-2.5 flex justify-end" style={{ borderTop: `1px solid ${BB.border}` }}>
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
            border: copied ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.09)",
            color: copied ? "#34d399" : "rgba(255,255,255,0.4)",
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copied!" : "Copy All"}
        </button>
      </div>
    </motion.div>
  );
}

const QUICK_START = "git clone https://github.com/your-org/sandbox-ai.git && cd sandbox-ai && pnpm install && cp .env.example .env && pnpm --filter @workspace/api-server run dev & pnpm --filter @workspace/sandbox-ai run dev";

const DEPLOY_STEPS: DeployStepProps[] = [
  { step: 1, title: "Clone repository", icon: GitBranch, color: "#00d0ff", cmds: [{ cmd: "# Clone the repo from GitHub", comment: true }, { cmd: "git clone https://github.com/your-org/sandbox-ai.git" }, { cmd: "cd sandbox-ai" }] },
  { step: 2, title: "Install dependencies", icon: Package, color: "#34d399", cmds: [{ cmd: "# Install pnpm (if not installed)", comment: true }, { cmd: "npm install -g pnpm" }, { cmd: "pnpm install" }] },
  { step: 3, title: "Configure environment", icon: Settings2, color: "#a855f7", cmds: [{ cmd: "# Copy example env file", comment: true }, { cmd: "cp .env.example .env" }, { cmd: "nano .env" }] },
  { step: 4, title: "Run the project", icon: Rocket, color: "#f59e0b", cmds: [{ cmd: "# Start API server", comment: true }, { cmd: "pnpm --filter @workspace/api-server run dev" }, { cmd: "pnpm --filter @workspace/sandbox-ai run dev" }] },
];

/* ─── FAQ ───────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b cursor-pointer" style={{ borderColor: BB.border }} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="text-sm font-semibold text-white">{q}</span>
        <span style={{ color: BB.accent, flexShrink: 0 }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </div>
      {open && <p className="pb-5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{a}</p>}
    </div>
  );
}

/* ─── Logo mark ─────────────────────────────────────────── */
function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 6, overflow: "hidden", flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(0,208,255,0.5))" }}>
      <img src="/icons/icon-512.png" alt="Sandbox AI" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
    </div>
  );
}

/* ─── App Setup Modal ───────────────────────────────────── */
type Platform = "ios" | "android";

interface SetupStep {
  num: number;
  icon: typeof Smartphone;
  color: string;
  title: string;
  lines: { text: string; code?: boolean; note?: boolean; download?: { label: string; href: string } }[];
}

const IOS_PROFILE_URL = "/api/mobile/ios/profile";

const SETUP_STEPS: Record<Platform, SetupStep[]> = {
  ios: [
    {
      num: 1, icon: Smartphone, color: BB.accent, title: "Mở Safari trên iPhone / iPad",
      lines: [
        { text: "⚠️ Bắt buộc dùng Safari — không mở bằng Chrome hay app khác.", note: true },
        { text: "Nhấn nút bên dưới để tải Profile ngay trong Safari:", },
        { download: { label: "⬇️  Tải Profile iOS", href: IOS_PROFILE_URL }, text: "" },
      ],
    },
    {
      num: 2, icon: ArrowRight, color: "#a855f7", title: "Cho phép tải & cài Profile",
      lines: [
        { text: "Safari hỏi 'Trang web này đang cố tải xuống cấu hình...' → nhấn Cho phép." },
        { text: "Mở Settings app trên iPhone." },
        { text: "Ngay đầu Settings sẽ có dòng 'Đã tải Hồ Sơ' → nhấn vào đó." },
        { text: "✓ Giống màn hình: Settings → VPN & Thiết bị → Sandbox AI", note: true },
      ],
    },
    {
      num: 3, icon: Settings2, color: "#f59e0b", title: "Cài đặt Profile",
      lines: [
        { text: "Nhấn Cài đặt (Install) ở góc trên phải." },
        { text: "Nhập Passcode nếu được yêu cầu." },
        { text: "Nhấn Cài đặt lần nữa để xác nhận → Xong (Done)." },
        { text: "✓ Icon Sandbox AI xuất hiện ngay trên màn hình chính!", note: true },
      ],
    },
    {
      num: 4, icon: Key, color: BB.green, title: "Mở app & cấu hình",
      lines: [
        { text: "Mở Sandbox AI từ màn hình chính (chạy toàn màn hình, không có thanh địa chỉ)." },
        { text: "Đăng nhập tài khoản → bắt đầu chat ngay." },
        { text: "✓ 4 mode: 💬 Chat · ⌨️ Code · 🎨 Image · 📱 Flutter", note: true },
      ],
    },
    {
      num: 5, icon: Rocket, color: "#34d399", title: "Sẵn sàng rồi!",
      lines: [
        { text: "✓ Chạy full screen như app native — không có thanh URL", note: true },
        { text: "✓ Hội thoại lưu tự động", note: true },
        { text: "✓ Xem lại lịch sử khi offline", note: true },
      ],
    },
  ],
  android: [
    {
      num: 1, icon: Smartphone, color: BB.accent, title: "Mở Chrome trên Android",
      lines: [
        { text: "Mở Chrome và truy cập:" },
        { text: "https://sandbox-ai.replit.app", code: true },
        { text: "Hỗ trợ Chrome, Edge và Samsung Internet.", note: true },
      ],
    },
    {
      num: 2, icon: ArrowRight, color: "#a855f7", title: "Cài đặt như app native",
      lines: [
        { text: "Chrome sẽ hiển thị banner 'Install App' ở thanh dưới." },
        { text: "Nếu không thấy: nhấn menu ⋮ → 'Add to Home Screen'." },
        { text: "✓ App được cài như APK — xuất hiện trong App Drawer và Settings.", note: true },
      ],
    },
    {
      num: 3, icon: Key, color: BB.green, title: "Cấu hình API Key",
      lines: [
        { text: "Mở app → Settings (⚙️) → API Configuration." },
        { text: "Dán OpenAI API Key vào ô:" },
        { text: "sk-proj-xxxxxxxxxxxxxxxxxxxx", code: true },
        { text: "Bật Streaming để xem response ngay lập tức." },
      ],
    },
    {
      num: 4, icon: Settings2, color: "#f59e0b", title: "Chọn AI Mode",
      lines: [
        { text: "Nhấn nút mode trong chat để chọn:" },
        { text: "💬 Chat  ·  ⌨️ Code  ·  🎨 Image  ·  📱 Flutter", note: true },
      ],
    },
    {
      num: 5, icon: Rocket, color: "#34d399", title: "Sẵn sàng rồi!",
      lines: [
        { text: "✓ Shortcut trên màn hình chính", note: true },
        { text: "✓ Hội thoại lưu tự động", note: true },
        { text: "✓ Full screen — không có thanh địa chỉ", note: true },
      ],
    },
  ],
};

function AppSetupModal({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const steps = SETUP_STEPS[platform];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />

      {/* Sheet */}
      <motion.div
        className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "#0e0e16", border: "1px solid rgba(255,255,255,0.09)" }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-[10px] font-mono mb-0.5" style={{ color: BB.accent }}>// CÀI ĐẶT ỨNG DỤNG</p>
            <h2 className="text-base font-black text-white">
              {platform === "ios" ? "🍎  iOS — iPhone & iPad" : "🤖  Android"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Steps — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-0">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;
            return (
              <motion.div
                key={step.num}
                className="flex gap-4"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.3 }}
              >
                {/* Number + line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                    style={{ background: `${step.color}18`, border: `1px solid ${step.color}35`, color: step.color }}
                  >
                    {step.num}
                  </div>
                  {!isLast && <div className="w-px flex-1 mt-2 mb-0" style={{ background: "rgba(255,255,255,0.07)", minHeight: 16 }} />}
                </div>
                {/* Content */}
                <div className={`${isLast ? "pb-2" : "pb-5"} flex-1`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={13} style={{ color: step.color }} />
                    <span className="text-sm font-bold text-white">{step.title}</span>
                  </div>
                  <div className="space-y-1.5">
                    {step.lines.map((line, li) =>
                      line.download ? (
                        <a
                          key={li}
                          href={line.download.href}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-opacity hover:opacity-90 active:opacity-70"
                          style={{ background: step.color, color: "#050507" }}
                        >
                          {line.download.label}
                        </a>
                      ) : line.code ? (
                        <div key={li} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl" style={{ background: "#07070d", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <code className="font-mono text-[11px] text-white/60 break-all">{line.text}</code>
                          <CopyBtn text={line.text} />
                        </div>
                      ) : line.note ? (
                        <p key={li} className="text-[12px] leading-relaxed px-2.5 py-1.5 rounded-lg" style={{ background: `${step.color}0d`, color: step.color, border: `1px solid ${step.color}20` }}>
                          {line.text}
                        </p>
                      ) : line.text ? (
                        <p key={li} className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
                          {line.text}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 text-sm font-black rounded-xl"
              style={{ background: "#fff", color: "#050507" }}
              onClick={onClose}
            >
              Mở App ngay →
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ HOME PAGE ═════════════════════════════════════════════ */
export default function Home() {
  const [appModal, setAppModal] = useState<Platform | null>(null);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── App Setup Modal ── */}
      <AnimatePresence>
        {appModal && (
          <AppSetupModal platform={appModal} onClose={() => setAppModal(null)} />
        )}
      </AnimatePresence>

      {/* ── Global CSS animations ── */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes orb1 {
          0%,100% { transform: translate(0%,0%) scale(1); }
          33% { transform: translate(9%,7%) scale(1.14); }
          66% { transform: translate(-7%,11%) scale(0.9); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0%,0%) scale(1); }
          40% { transform: translate(-11%,-9%) scale(1.1); }
          70% { transform: translate(7%,-5%) scale(0.94); }
        }
        @keyframes orb3 {
          0%,100% { transform: translate(0%,0%) scale(1); }
          50% { transform: translate(4%,-13%) scale(1.07); }
        }
        @keyframes scanline {
          0% { top: -4px; }
          100% { top: 100%; }
        }
      `}</style>

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ background: "rgba(5,5,7,0.85)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BB.border}` }}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-black text-sm tracking-tight" style={{ color: BB.accent, textShadow: "0 0 14px rgba(0,208,255,0.5)", letterSpacing: "-0.02em" }}>
            SANDBOX.AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          <a href="#modes" className="hover:text-white transition-colors">Modes</a>
          <a href="#deploy" className="hover:text-white transition-colors">Deploy</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <Link href="/about"><span className="hover:text-white transition-colors cursor-pointer">About</span></Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="hidden md:inline-flex px-4 py-2 text-sm font-medium transition-colors rounded-lg" style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              LOGIN
            </button>
          </Link>
          <Link href="/chat">
            <button
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all"
              style={{ background: "#fff", color: "#050507", boxShadow: "0 0 0 1px rgba(255,255,255,0.15)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e8e8e8"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
            >
              GET STARTED
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="pt-24 min-h-[88vh] flex items-center justify-center px-6 md:px-10 relative overflow-hidden">
        {/* Subtle static orb glow behind hero text */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div style={{
            position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 400, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,208,255,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
          }} />
        </div>
        <motion.div
          className="text-center max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          <p className="text-xs font-mono mb-6 tracking-widest" style={{ color: BB.accent }}>// THE AI COMMAND CENTER</p>
          <h1 className="font-black tracking-tighter mb-6 leading-[1.04]" style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}>
            <span style={{ color: "#fff" }}>Chat · Code · Image · </span>
            <span style={{ background: "linear-gradient(135deg, #00d0ff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Flutter
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.42)" }}>
            Bốn AI mode mạnh nhất trong một workspace — GPT-5.2, GPT-5.3 Codex, gpt-image-1 và Flutter Expert.
            Không cần chuyển tab. Không cần nhiều subscription.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-9 py-3.5 text-sm font-black rounded-xl"
                style={{ background: "#fff", color: "#050507" }}
              >
                Get Started
                <ArrowRight size={15} />
              </motion.button>
            </Link>
            <Link href="/about">
              <button
                className="flex items-center gap-2 px-9 py-3.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: `1px solid ${BB.border}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BB.border; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                Tìm hiểu thêm
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── LOGO MARQUEE ───────────────────────────────────── */}
      <LogoMarquee />

      {/* ─── MODES GRID ─────────────────────────────────────── */}
      <section id="modes" className="py-24 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono mb-4 text-center" style={{ color: BB.accent }}>// 4 AI MODES</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white text-center">
            Một workspace. Bốn siêu năng lực.
          </h2>
          <p className="text-sm text-center mb-14 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Mỗi mode được tối ưu cho từng loại task — AI tự chọn model phù hợp nhất cho bạn.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Chat Mode", model: "GPT-5.2", desc: "Lý luận sâu, multi-turn context, streaming thời gian thực.", color: "#00d0ff" },
              { label: "Code Mode", model: "GPT-5.3 Codex", desc: "Syntax highlight, in-browser sandbox, copy 1 click.", color: "#34d399" },
              { label: "Image Mode", model: "gpt-image-1", desc: "Tạo ảnh HD từ mô tả. Lưu vĩnh viễn vào lịch sử.", color: "#a855f7" },
              { label: "Flutter Mode", model: "GPT-5.2 Expert", desc: "MVVM + Riverpod · Firebase · ASO 2026 · Android Vitals.", color: "#54c5f8", isNew: true },
            ].map(({ label, model, desc, color, isNew }) => (
              <motion.div
                key={label}
                whileHover={{ translateY: -4 }}
                transition={{ duration: 0.18 }}
                className="p-5 rounded-2xl relative"
                style={{ background: `${color}09`, border: `1px solid ${color}28` }}
              >
                {isNew && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-black rounded-full" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, color: "#121212" }}>NEW</span>
                )}
                <div className="text-sm font-bold text-white mb-1">{label}</div>
                <div className="text-xs font-mono px-2 py-0.5 rounded-full mb-3 inline-block" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.38)" }}>{model}</div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPLOY GUIDE ───────────────────────────────────── */}
      <section id="deploy" className="py-20 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}`, background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono mb-4" style={{ color: BB.accent }}>// DEPLOY GUIDE</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
              Chạy dự án trong{" "}
              <span style={{ background: "linear-gradient(135deg, #00d0ff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                4 bước
              </span>
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Clone → Install → Config → Run. Từ zero đến server trong vài phút.
            </p>
          </div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-4 mb-10"
            style={{ background: "rgba(0,208,255,0.05)", border: "1px solid rgba(0,208,255,0.18)" }}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,208,255,0.12)", border: "1px solid rgba(0,208,255,0.25)" }}>
                  <Zap size={13} style={{ color: BB.accent }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono mb-1" style={{ color: "rgba(0,208,255,0.5)" }}>QUICK START — one-liner</div>
                  <code className="text-[11px] font-mono text-white/60 break-all leading-5">{QUICK_START}</code>
                </div>
              </div>
              <CopyBtn text={QUICK_START} />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {DEPLOY_STEPS.map(s => <DeployStep key={s.step} {...s} />)}
          </div>

          {/* System requirements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-5 flex flex-col sm:flex-row gap-6"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BB.border}` }}
          >
            <div className="flex-1">
              <p className="text-xs font-mono mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>// YÊU CẦU HỆ THỐNG</p>
              <div className="grid grid-cols-2 gap-2">
                {[["Node.js", "≥ 18"], ["pnpm", "≥ 8"], ["Git", "latest"], ["OpenAI API Key", "required"]].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <Check size={11} style={{ color: BB.green }} />
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="text-xs font-mono ml-auto" style={{ color: "rgba(0,208,255,0.5)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:w-52 shrink-0">
              <p className="text-xs font-mono mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>// PRODUCTION BUILD</p>
              <div className="rounded-xl overflow-hidden" style={{ background: BB.terminal, border: `1px solid ${BB.terminalBorder}` }}>
                <CmdLine cmd="pnpm run build" />
                <CmdLine cmd="pnpm run serve" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-mono mb-4" style={{ color: BB.accent }}>// PRICING</p>
          <h2 className="text-3xl font-black tracking-tight mb-4 text-white">Đơn giản. Một mức giá.</h2>
          <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.4)" }}>
            ChatGPT Plus $20 + Copilot $10 + Midjourney $10 = $40+/tháng cho 3 tool rời rạc.
            Sandbox.ai làm cả 4 mode trong một nơi.
          </p>

          <div
            className="relative p-8 rounded-3xl text-left"
            style={{ background: "#0d0d15", border: "1px solid rgba(0,208,255,0.25)", boxShadow: "0 0 60px rgba(0,208,255,0.08)" }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #00d0ff, #34d399)", color: "#050507" }}>
              MOST POPULAR
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Sandbox Pro</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Everything. One workspace. One price.</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-white">$19<span className="text-xl font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>or $15/mo billed annually</div>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {["GPT-5.2 unlimited chat", "GPT-5.3 Codex code mode", "gpt-image-1 generation", "Flutter Dev expert mode ✦ NEW", "Full conversation history", "Real-time streaming", "In-browser code runner", "Markdown + syntax highlight"].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,208,255,0.15)", color: BB.accent }}><Check size={11} /></span>
                  <span className={f.includes("NEW") ? "font-bold" : ""} style={f.includes("NEW") ? { color: "#54c5f8" } : {}}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 text-sm font-black rounded-xl"
                style={{ background: "#fff", color: "#050507" }}
              >
                Start Free — No Credit Card Required →
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}` }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-mono mb-4" style={{ color: BB.accent }}>// FAQ</p>
          <h2 className="text-3xl font-black tracking-tight mb-8 text-white">Câu hỏi thường gặp.</h2>
          <FaqItem q="Khác gì so với ChatGPT?" a="ChatGPT là chatbot đa năng. Sandbox.ai được xây dựng riêng cho developer: Code Mode với GPT-5.3 Codex, tạo ảnh, chạy code ngay trong browser, lịch sử hội thoại persistent, dark UI tập trung — tất cả trong một interface." />
          <FaqItem q="Tôi có cần tự cài API key không?" a="Không. API access được quản lý hoàn toàn — bạn chỉ cần đăng nhập và dùng. Không cần cấu hình, không cần environment variable." />
          <FaqItem q="Nếu tôi chỉ dùng Chat và không dùng Code hay Image?" a="Hoàn toàn ổn. Nhiều user bắt đầu với Chat Mode rồi khám phá Code hoặc Image sau. Mỗi mode chỉ cần một click để chuyển." />
          <FaqItem q="Có thể hủy bất kỳ lúc nào không?" a="Có, ngay lập tức. Không có phí hủy, không khóa hợp đồng. Bạn giữ quyền truy cập đến hết chu kỳ thanh toán hiện tại." />
          <FaqItem q="Dữ liệu của tôi có được dùng để train AI không?" a="Không bao giờ. Hội thoại, code và ảnh của bạn là của bạn. Chúng tôi không chia sẻ, bán hay dùng dữ liệu của bạn để fine-tune bất kỳ model nào." />
        </div>
      </section>

      {/* ─── LIVE DEMO TERMINALS ────────────────────────────── */}
      <section className="relative overflow-hidden py-20" style={{ borderTop: `1px solid ${BB.border}` }}>

        {/* Animated background — orbs + dot grid + scanline */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{
            position: "absolute", top: "10%", left: "5%",
            width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,208,255,0.14) 0%, transparent 70%)",
            filter: "blur(64px)",
            animation: "orb1 14s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "20%", right: "6%",
            width: 380, height: 380, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
            filter: "blur(56px)",
            animation: "orb2 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "8%", left: "38%",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: "orb3 22s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%)",
          }} />
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, rgba(0,208,255,0.22), transparent)",
            animation: "scanline 6s linear infinite",
          }} />
          {/* Top + bottom fade */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to bottom, ${BB.bg}, transparent)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to top, ${BB.bg}, transparent)` }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <p className="text-xs font-mono mb-3" style={{ color: BB.accent }}>// SEE IT IN ACTION</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              AI đang làm việc — thời gian thực
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {PANELS.map((panel, i) => (
              <TerminalPanel key={panel.id} panel={panel} delay={i * 400} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white leading-tight">
            Dừng quản lý tool.<br />
            <span style={{ background: "linear-gradient(135deg, #00d0ff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Bắt đầu build thứ gì đó.
            </span>
          </h2>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            12,400+ developers đã gộp toàn bộ AI setup vào Sandbox.ai. Workspace miễn phí của bạn chỉ cần một click.
          </p>
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-10 py-4 text-sm font-black rounded-xl"
              style={{ background: "#fff", color: "#050507" }}
            >
              Get Started Free
              <ArrowRight size={15} />
            </motion.button>
          </Link>
          <p className="text-xs mt-4 mb-10" style={{ color: "rgba(255,255,255,0.2)" }}>No credit card · Cancel anytime · 30-day money-back</p>

          {/* ── Store badges ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* App Store */}
            <motion.button
              onClick={() => setAppModal("ios")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all"
              style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                minWidth: 172,
              }}
            >
              {/* Apple icon */}
              <svg width="22" height="26" viewBox="0 0 22 26" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.07 13.77c-.03-3.35 2.74-4.97 2.86-5.05-1.56-2.28-3.99-2.59-4.85-2.62-2.06-.21-4.03 1.22-5.07 1.22-1.05 0-2.67-1.19-4.38-1.16C4.4 6.2 2.3 7.37 1.14 9.27c-2.35 4.07-.6 10.07 1.68 13.37 1.12 1.62 2.45 3.44 4.19 3.37 1.69-.07 2.32-1.09 4.36-1.09 2.02 0 2.6 1.09 4.38 1.05 1.81-.03 2.96-1.64 4.06-3.27.5-.72.97-1.49 1.33-2.31-3.5-1.34-3.97-5.22-3.07-6.62zM14.69 4.11c.93-1.12 1.55-2.68 1.38-4.23-1.34.05-2.95.89-3.91 2-.86.99-1.61 2.57-1.41 4.09 1.49.11 3.01-.76 3.94-1.86z"/>
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Download on the</div>
                <div className="text-[16px] font-bold text-white tracking-tight">App Store</div>
              </div>
            </motion.button>

            {/* Google Play */}
            <motion.button
              onClick={() => setAppModal("android")}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all"
              style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                minWidth: 172,
              }}
            >
              {/* Google Play icon (4-color) */}
              <svg width="22" height="24" viewBox="0 0 22 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.432 0.396C0.16 0.684 0 1.14 0 1.74v20.52c0 .6.16 1.056.432 1.344l.072.068 11.5-11.5v-.272L.504.328.432.396z" fill="#4FC3F7"/>
                <path d="M15.84 15.984l-3.836-3.836v-.296l3.836-3.836.088.048 4.548 2.584c1.3.736 1.3 1.944 0 2.684l-4.548 2.584-.088.068z" fill="#FFD54F"/>
                <path d="M15.928 15.916L12.004 12 .432 23.572c.428.456 1.136.512 1.932.056l13.564-7.712" fill="#F48FB1"/>
                <path d="M15.928 8.084L2.364.372C1.568-.084.86-.024.432.432L12.004 12l3.924-3.916z" fill="#A5D6A7"/>
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Get it on</div>
                <div className="text-[16px] font-bold text-white tracking-tight">Google Play</div>
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-12 px-6 md:px-10" style={{ borderTop: `1px solid ${BB.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <LogoMark size={20} />
                <span className="font-black text-sm" style={{ color: BB.accent, textShadow: "0 0 10px rgba(0,208,255,0.4)" }}>SANDBOX.AI</span>
              </div>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                The AI command center for developers who move fast.
              </p>
            </div>
            <div className="flex flex-wrap gap-12">
              {[
                { label: "Product", links: ["Features", "Pricing", "Chat", "Code Mode"] },
                { label: "Company", links: ["About", "Blog", "Contact"] },
                { label: "Legal", links: ["Privacy", "Terms", "Security"] },
              ].map(({ label, links }) => (
                <div key={label}>
                  <p className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: BB.accent }}>{label}</p>
                  <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {links.map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${BB.border}` }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 Sandbox.ai. All rights reserved.</p>
            <Link href="/chat">
              <span className="text-xs font-mono underline cursor-pointer" style={{ color: "rgba(0,208,255,0.4)" }}>
                Start free →
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

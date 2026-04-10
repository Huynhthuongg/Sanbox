import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, Copy, ChevronRight,
  Smartphone, Settings2, Key, Rocket,
} from "lucide-react";

const BB = {
  bg: "#050507",
  card: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  accent: "#00d0ff",
  green: "#34d399",
  muted: "rgba(255,255,255,0.38)",
};

/* ─── Inline CopyBtn ─────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
      style={{
        background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)",
        border: copied ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.09)",
        color: copied ? BB.green : BB.muted,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Đã copy" : "Copy"}
    </button>
  );
}

/* ─── Step card ─────────────────────────────────────────── */
function Step({
  num, icon: Icon, color, title, children,
}: {
  num: number;
  icon: typeof Smartphone;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: num * 0.08 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm"
          style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
        >
          {num}
        </div>
        {num < 5 && <div className="w-px flex-1 mt-2" style={{ background: BB.border }} />}
      </div>
      <div className="pb-8 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={15} style={{ color }} />
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        <div className="text-sm leading-relaxed space-y-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Code block ─────────────────────────────────────────── */
function CodeBlock({ value }: { value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 mt-2 px-3 py-2.5 rounded-xl"
      style={{ background: "#0a0a10", border: `1px solid ${BB.border}` }}
    >
      <code className="font-mono text-[12px] text-white/70 break-all">{value}</code>
      <CopyBtn text={value} />
    </div>
  );
}

/* ─── Platform step data ─────────────────────────────────── */
const IOS_STEPS = [
  {
    num: 1, icon: Smartphone, color: "#00d0ff", title: "Mở Sandbox.ai trên Safari",
    content: (
      <>
        <p>Mở Safari và truy cập địa chỉ:</p>
        <CodeBlock value="https://sandbox-ai.replit.app" />
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          ⚠️ Phải dùng Safari — Chrome trên iOS không hỗ trợ Add to Home Screen đầy đủ.
        </p>
      </>
    ),
  },
  {
    num: 2, icon: ChevronRight, color: "#a855f7", title: "Thêm vào màn hình chính",
    content: (
      <>
        <p>Nhấn nút <strong className="text-white">Share</strong> (hình vuông có mũi tên lên) ở thanh dưới cùng của Safari.</p>
        <p>Cuộn xuống và chọn <strong className="text-white">"Add to Home Screen"</strong>.</p>
        <p>Nhập tên <strong className="text-white">Sandbox AI</strong> → nhấn <strong className="text-white">Add</strong>.</p>
        <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(0,208,255,0.06)", border: "1px solid rgba(0,208,255,0.15)", color: BB.accent }}>
          ✓ App sẽ xuất hiện trên Home Screen với icon và chạy như native app — không có thanh địa chỉ.
        </div>
      </>
    ),
  },
  {
    num: 3, icon: Key, color: BB.green, title: "Cấu hình API Key",
    content: (
      <>
        <p>Mở app → vào <strong className="text-white">Settings</strong> (góc trên phải) → chọn <strong className="text-white">API Configuration</strong>.</p>
        <p>Dán OpenAI API Key của bạn:</p>
        <CodeBlock value="sk-proj-xxxxxxxxxxxxxxxxxxxx" />
        <p>Chọn model mặc định: <strong className="text-white">GPT-5.2</strong> hoặc <strong className="text-white">GPT-5.3 Codex</strong>.</p>
      </>
    ),
  },
  {
    num: 4, icon: Settings2, color: "#f59e0b", title: "Chọn AI Mode",
    content: (
      <>
        <p>Trong chat, nhấn nút mode ở góc trên để chọn:</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { label: "💬 Chat", desc: "GPT-5.2 • Lý luận sâu" },
            { label: "⌨️ Code", desc: "GPT-5.3 • Code AI" },
            { label: "🎨 Image", desc: "gpt-image-1 • Tạo ảnh" },
            { label: "📱 Flutter", desc: "Expert • Mobile dev" },
          ].map(({ label, desc }) => (
            <div key={label} className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BB.border}` }}>
              <div className="text-xs font-bold text-white">{label}</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: 5, icon: Rocket, color: "#34d399", title: "Sẵn sàng rồi!",
    content: (
      <>
        <p>App đã được cài đặt và cấu hình đầy đủ.</p>
        <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
          ✓ Hội thoại được lưu tự động · ✓ Hoạt động offline (xem lại lịch sử) · ✓ Push notifications (nếu bật)
        </div>
      </>
    ),
  },
];

const ANDROID_STEPS = [
  {
    num: 1, icon: Smartphone, color: "#00d0ff", title: "Mở Sandbox.ai trên Chrome",
    content: (
      <>
        <p>Mở Chrome và truy cập:</p>
        <CodeBlock value="https://sandbox-ai.replit.app" />
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          Hỗ trợ Chrome, Edge và Firefox trên Android.
        </p>
      </>
    ),
  },
  {
    num: 2, icon: ChevronRight, color: "#a855f7", title: "Cài đặt như app native",
    content: (
      <>
        <p>Chrome sẽ hiển thị banner <strong className="text-white">"Add to Home Screen"</strong> hoặc <strong className="text-white">"Install App"</strong> ở thanh dưới.</p>
        <p>Nếu không thấy: nhấn menu <strong className="text-white">⋮</strong> (3 chấm) → chọn <strong className="text-white">"Add to Home Screen"</strong>.</p>
        <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", color: "#c084fc" }}>
          ✓ App được cài như APK thật — xuất hiện trong Launcher, App Drawer và Settings.
        </div>
      </>
    ),
  },
  {
    num: 3, icon: Key, color: BB.green, title: "Cấu hình API Key",
    content: (
      <>
        <p>Mở app → vào <strong className="text-white">Settings</strong> → <strong className="text-white">API Configuration</strong>.</p>
        <p>Dán OpenAI API Key của bạn:</p>
        <CodeBlock value="sk-proj-xxxxxxxxxxxxxxxxxxxx" />
        <p>Chọn model mặc định và bật <strong className="text-white">Streaming</strong> để xem response ngay.</p>
      </>
    ),
  },
  {
    num: 4, icon: Settings2, color: "#f59e0b", title: "Chọn AI Mode",
    content: (
      <>
        <p>Trong chat, nhấn nút mode ở góc trên để chọn:</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { label: "💬 Chat", desc: "GPT-5.2 • Lý luận sâu" },
            { label: "⌨️ Code", desc: "GPT-5.3 • Code AI" },
            { label: "🎨 Image", desc: "gpt-image-1 • Tạo ảnh" },
            { label: "📱 Flutter", desc: "Expert • Mobile dev" },
          ].map(({ label, desc }) => (
            <div key={label} className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BB.border}` }}>
              <div className="text-xs font-bold text-white">{label}</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: 5, icon: Rocket, color: "#34d399", title: "Sẵn sàng rồi!",
    content: (
      <>
        <p>App đã được cài đặt và cấu hình đầy đủ.</p>
        <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
          ✓ Hội thoại được lưu tự động · ✓ Hoạt động offline (xem lại lịch sử) · ✓ Shortcut trên màn hình chính
        </div>
      </>
    ),
  },
];

/* ═══ PAGE ══════════════════════════════════════════════════ */
export default function GetApp() {
  const params = new URLSearchParams(window.location.search);
  const defaultPlatform = params.get("platform") === "android" ? "android" : "ios";
  const [platform, setPlatform] = useState<"ios" | "android">(defaultPlatform);

  const steps = platform === "ios" ? IOS_STEPS : ANDROID_STEPS;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,7,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BB.border}` }}
      >
        <Link href="/">
          <button className="flex items-center gap-2 text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <ArrowLeft size={15} />
            Trang chủ
          </button>
        </Link>
        <span className="font-black text-sm tracking-tight" style={{ color: BB.accent }}>SANDBOX.AI</span>
        <div style={{ width: 80 }} />
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-mono mb-3 tracking-widest" style={{ color: BB.accent }}>// CÀI ĐẶT ỨNG DỤNG</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Cài Sandbox.ai<br />
            <span style={{ background: "linear-gradient(135deg, #00d0ff, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              trên điện thoại của bạn
            </span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Chọn nền tảng và làm theo các bước cài đặt bên dưới.
          </p>
        </motion.div>

        {/* Platform tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex rounded-2xl p-1 mb-10"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BB.border}` }}
        >
          {([
            { id: "ios", label: "🍎  iOS (iPhone / iPad)" },
            { id: "android", label: "🤖  Android" },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setPlatform(tab.id)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={{
                background: platform === tab.id ? "#fff" : "transparent",
                color: platform === tab.id ? "#050507" : "rgba(255,255,255,0.4)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {steps.map(s => (
              <Step key={s.num} num={s.num} icon={s.icon} color={s.color} title={s.title}>
                {s.content}
              </Step>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-4"
        >
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-black rounded-xl"
              style={{ background: "#fff", color: "#050507" }}
            >
              Mở App ngay
              <Rocket size={14} />
            </motion.button>
          </Link>
          <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            Gặp vấn đề? <a href="mailto:Admin@huynhthuong.online" className="underline" style={{ color: "rgba(0,208,255,0.5)" }}>Liên hệ hỗ trợ</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

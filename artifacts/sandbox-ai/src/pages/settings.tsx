import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useUser } from "@clerk/react";
import {
  ArrowLeft, User, Cpu, Sliders, Save, CheckCheck,
  Camera, Sparkles, MessageSquare, Code2, Image as ImageIcon,
  Smartphone, ChevronDown, Globe, Bell, Moon, Zap, Key, Shield, Crown, ArrowRight,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

/* ─── Design tokens ─────────────────────────────────────── */
const BB = {
  bg: "#050507",
  card: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  accent: "#00d0ff",
  green: "#34d399",
  yellow: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  muted: "rgba(255,255,255,0.38)",
};

const STORAGE_KEY = "sb_ai_config";
const PREF_KEY = "sb_preferences";

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveConfig(v: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch { return {}; }
}
function savePrefs(v: Record<string, unknown>) {
  localStorage.setItem(PREF_KEY, JSON.stringify(v));
}

/* ─── Shared UI primitives ───────────────────────────────── */
function SectionCard({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div
      className={`rounded-2xl ${noPad ? "" : "p-5"} space-y-4`}
      style={{ background: BB.card, border: `1px solid ${BB.border}` }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-[13px] font-bold text-white">{children}</label>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: BB.muted }}>{sub}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", rows, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; rows?: number; disabled?: boolean;
}) {
  const base = {
    background: disabled ? "rgba(255,255,255,0.02)" : "#07070d",
    border: `1px solid ${BB.border}`,
    color: disabled ? BB.muted : "#fff",
    outline: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    width: "100%",
    resize: "none" as const,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "text",
  };
  if (rows) return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} disabled={disabled} />;
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} disabled={disabled} />;
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#07070d", border: `1px solid ${BB.border}`, color: "#fff",
          borderRadius: 12, padding: "10px 36px 10px 14px", fontSize: 13,
          width: "100%", appearance: "none", outline: "none", fontFamily: "inherit",
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BB.muted }} />
    </div>
  );
}

function Toggle({ value, onChange, label, sub, accentColor }: {
  value: boolean; onChange: (v: boolean) => void; label: string; sub?: string; accentColor?: string;
}) {
  const color = accentColor ?? BB.accent;
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="min-w-0">
        <p className="text-[13px] text-white">{label}</p>
        {sub && <p className="text-[11px] mt-0.5 leading-tight" style={{ color: BB.muted }}>{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative shrink-0 rounded-full transition-all duration-200"
        style={{
          width: 40, height: 22,
          background: value ? color : "rgba(255,255,255,0.1)",
        }}
      >
        <span
          className="absolute top-1 left-1 w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
          style={{ transform: value ? "translateX(18px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function SaveBtn({ onClick, saved, fullWidth }: { onClick: () => void; saved: boolean; fullWidth?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${fullWidth ? "w-full justify-center" : ""}`}
      style={{
        background: saved ? `${BB.green}18` : BB.accent,
        color: saved ? BB.green : "#050507",
        border: saved ? `1px solid ${BB.green}30` : "none",
      }}
    >
      {saved ? <><CheckCheck size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
    </motion.button>
  );
}

/* ─── Section heading ────────────────────────────────────── */
function SectionHeading({ icon: Icon, label, color }: { icon: typeof User; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[16px] font-black text-white tracking-tight">{label}</span>
      </div>
      <div className="flex-1 h-px" style={{ background: BB.border }} />
    </div>
  );
}

/* ─── Profile section ────────────────────────────────────── */
function ProfileSection() {
  const { user } = useUser();
  const { role, plan, isPro } = usePermissions();
  const [displayName, setDisplayName] = useState(user?.fullName ?? user?.username ?? "");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const planColor = plan === "enterprise" ? BB.purple : plan === "pro" ? BB.accent : BB.muted;
  const roleColor = role === "admin" ? BB.red : role === "moderator" ? BB.yellow : BB.muted;

  async function handleSave() {
    try {
      await user?.update({
        firstName: displayName.split(" ")[0],
        lastName: displayName.split(" ").slice(1).join(" ") || undefined,
      });
    } catch { /* ignore clerk errors in dev */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Avatar + identity */}
      <SectionCard noPad>
        <div
          className="p-5 rounded-t-2xl"
          style={{ background: "linear-gradient(135deg, rgba(0,208,255,0.06), rgba(0,208,255,0.02))" }}
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Avatar"
                  className="w-[68px] h-[68px] rounded-2xl object-cover"
                  style={{ border: `2px solid rgba(0,208,255,0.3)` }} />
              ) : (
                <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-2xl font-black"
                  style={{ background: `${BB.accent}15`, border: `2px solid ${BB.accent}30`, color: BB.accent }}>
                  {(displayName || "U")[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                style={{ background: BB.accent }}>
                <Camera size={12} style={{ color: "#050507" }} />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] text-white font-black truncate">{displayName || "Người dùng"}</p>
              <p className="text-[12px] mb-2 truncate" style={{ color: BB.muted }}>
                {user?.primaryEmailAddress?.emailAddress}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider"
                  style={{ background: `${planColor}18`, color: planColor, border: `1px solid ${planColor}30` }}>
                  {plan === "free" ? "Free" : plan === "pro" ? "✦ Pro" : "Enterprise"}
                </span>
                {role !== "user" && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}30` }}>
                    <Shield size={8} />
                    {role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account quick stats */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: "Tham gia", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—" },
              { label: "Đăng nhập cuối", value: user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("vi-VN") : "—" },
              { label: "User ID", value: user?.id ? user.id.slice(0, 8) + "…" : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BB.border}` }}>
                <p className="text-[10px] mb-0.5" style={{ color: BB.muted }}>{label}</p>
                <p className="text-[11px] font-bold text-white font-mono truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Upgrade card — Free only */}
      {!isPro() && (
        <div className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(0,208,255,0.07), rgba(0,208,255,0.02))", border: "1px solid rgba(0,208,255,0.18)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Crown size={14} style={{ color: BB.accent }} />
            <p className="text-[13px] font-black text-white">Bạn đang dùng Free Plan</p>
          </div>
          <p className="text-[12px] mb-3" style={{ color: BB.muted }}>
            Nâng cấp lên Pro để mở khóa Image AI, Flutter mode, Dashboard và nhiều hơn nữa.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["Image Generation", "Flutter Mode", "Dashboard", "Priority AI"].map((f) => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${BB.accent}10`, color: BB.accent, border: `1px solid ${BB.accent}25` }}>
                {f}
              </span>
            ))}
          </div>
          <Link href="/pricing">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold w-full justify-center"
              style={{ background: BB.accent, color: "#050507" }}>
              <Crown size={13} /> Nâng cấp lên Pro — $19/tháng <ArrowRight size={13} />
            </motion.button>
          </Link>
        </div>
      )}

      {/* Edit info */}
      <SectionCard>
        <div>
          <FieldLabel sub="Tên hiển thị trong chat">Display Name</FieldLabel>
          <Input value={displayName} onChange={setDisplayName} placeholder="Nhập tên hiển thị..." />
        </div>
        <div>
          <FieldLabel sub="Giới thiệu ngắn về bạn (tùy chọn)">Bio</FieldLabel>
          <Input value={bio} onChange={setBio} placeholder="Tôi là developer, thích xây app AI..." rows={3} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input value={user?.primaryEmailAddress?.emailAddress ?? ""} onChange={() => {}} type="email" disabled />
          <p className="text-[11px] mt-1" style={{ color: BB.muted }}>Quản lý bởi Clerk — không thể đổi ở đây.</p>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── AI Config section ──────────────────────────────────── */
function AIConfigSection() {
  const cfg = loadConfig();
  const [model, setModel] = useState(cfg.model ?? "gpt-4o");
  const [mode, setMode] = useState(cfg.mode ?? "chat");
  const [systemPrompt, setSystemPrompt] = useState(cfg.systemPrompt ?? "");
  const [temperature, setTemperature] = useState<number>(cfg.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(cfg.maxTokens ?? "4096");
  const [streaming, setStreaming] = useState<boolean>(cfg.streaming ?? true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveConfig({ model, mode, systemPrompt, temperature, maxTokens, streaming });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const MODES = [
    { id: "chat", icon: MessageSquare, label: "Chat", color: BB.accent, desc: "Hội thoại thông thường" },
    { id: "code", icon: Code2, label: "Code", color: BB.green, desc: "Sinh & debug code" },
    { id: "image", icon: ImageIcon, label: "Image", color: BB.purple, desc: "Tạo ảnh từ mô tả" },
    { id: "flutter", icon: Smartphone, label: "Flutter", color: BB.yellow, desc: "Sinh UI Flutter" },
  ];

  return (
    <div className="space-y-4">
      {/* Default mode */}
      <SectionCard>
        <FieldLabel sub="Mode mặc định khi mở chat mới">Default AI Mode</FieldLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {MODES.map(({ id, icon: Icon, label, color, desc }) => (
            <button key={id} onClick={() => setMode(id)}
              className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all"
              style={{
                background: mode === id ? `${color}14` : "rgba(255,255,255,0.02)",
                border: `1px solid ${mode === id ? color + "40" : BB.border}`,
                boxShadow: mode === id ? `0 0 16px ${color}14` : "none",
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black"
                  style={{ color: mode === id ? color : "rgba(255,255,255,0.8)" }}>{label}</p>
                <p className="text-[11px] mt-0.5 leading-tight" style={{ color: BB.muted }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Model */}
      <SectionCard>
        <FieldLabel sub="Model AI mặc định cho tất cả chat">Default Model</FieldLabel>
        <Select value={model} onChange={setModel} options={[
          { value: "gpt-4o", label: "GPT-4o (Recommended)" },
          { value: "gpt-4o-mini", label: "GPT-4o mini (Faster)" },
          { value: "o3", label: "o3 (Reasoning)" },
          { value: "o4-mini", label: "o4-mini (Fast Reasoning)" },
          { value: "gpt-image-1", label: "GPT-Image-1 (Image mode)" },
        ]} />
      </SectionCard>

      {/* System prompt */}
      <SectionCard>
        <FieldLabel sub="Prompt hệ thống gửi kèm mỗi cuộc hội thoại">System Prompt</FieldLabel>
        <Input value={systemPrompt} onChange={setSystemPrompt}
          placeholder="Bạn là trợ lý AI thông minh của Sandbox AI. Trả lời ngắn gọn, chính xác..."
          rows={5} />
        <p className="text-[11px]" style={{ color: BB.muted }}>Để trống = dùng prompt mặc định của hệ thống.</p>
      </SectionCard>

      {/* Advanced */}
      <SectionCard>
        <p className="text-[13px] font-black text-white flex items-center gap-2">
          <Zap size={13} style={{ color: BB.yellow }} /> Advanced
        </p>

        {/* Temperature */}
        <div>
          <FieldLabel sub={`Độ sáng tạo: ${temperature.toFixed(2)} — ${temperature < 0.35 ? "Chính xác" : temperature < 0.65 ? "Cân bằng" : "Sáng tạo"}`}>
            Temperature
          </FieldLabel>
          <input type="range" min={0} max={1} step={0.05} value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${BB.accent} ${temperature * 100}%, rgba(255,255,255,0.08) 0%)`,
            }} />
          <div className="flex justify-between text-[10px] mt-1.5" style={{ color: BB.muted }}>
            <span>0 — Chính xác</span><span>0.5 — Cân bằng</span><span>1 — Sáng tạo</span>
          </div>
        </div>

        {/* Max tokens */}
        <div>
          <FieldLabel sub="Số token tối đa mỗi response">Max Tokens</FieldLabel>
          <Select value={maxTokens} onChange={setMaxTokens} options={[
            { value: "1024", label: "1,024 tokens" },
            { value: "2048", label: "2,048 tokens" },
            { value: "4096", label: "4,096 tokens (Default)" },
            { value: "8192", label: "8,192 tokens" },
            { value: "16384", label: "16,384 tokens" },
          ]} />
        </div>

        <div className="pt-1">
          <Toggle value={streaming} onChange={setStreaming}
            label="Streaming response"
            sub="Hiển thị text từng ký tự khi AI đang trả lời"
            accentColor={BB.accent} />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── Preferences section ────────────────────────────────── */
function PreferencesSection() {
  const prefs = loadPrefs();
  const [lang, setLang] = useState(prefs.lang ?? "vi");
  const [notifSound, setNotifSound] = useState<boolean>(prefs.notifSound ?? true);
  const [enterSend, setEnterSend] = useState<boolean>(prefs.enterSend ?? true);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(prefs.showTimestamps ?? false);
  const [compactMode, setCompactMode] = useState<boolean>(prefs.compactMode ?? false);
  const [autoTitle, setAutoTitle] = useState<boolean>(prefs.autoTitle ?? true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    savePrefs({ lang, notifSound, enterSend, showTimestamps, compactMode, autoTitle });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Language */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-1">
          <Globe size={14} style={{ color: BB.accent }} />
          <p className="text-[13px] font-black text-white">Ngôn ngữ</p>
        </div>
        <Select value={lang} onChange={setLang} options={[
          { value: "vi", label: "🇻🇳 Tiếng Việt" },
          { value: "en", label: "🇺🇸 English" },
          { value: "zh", label: "🇨🇳 中文" },
          { value: "ja", label: "🇯🇵 日本語" },
          { value: "ko", label: "🇰🇷 한국어" },
        ]} />
      </SectionCard>

      {/* Chat behavior */}
      <SectionCard>
        <div className="flex items-center gap-2">
          <MessageSquare size={14} style={{ color: BB.green }} />
          <p className="text-[13px] font-black text-white">Chat Behavior</p>
        </div>
        <div className="space-y-4 pt-1">
          <Toggle value={enterSend} onChange={setEnterSend} accentColor={BB.green}
            label="Enter để gửi" sub="Nhấn Enter gửi tin nhắn, Shift+Enter xuống dòng" />
          <div className="h-px" style={{ background: BB.border }} />
          <Toggle value={showTimestamps} onChange={setShowTimestamps} accentColor={BB.accent}
            label="Hiển thị timestamp" sub="Hiện giờ gửi bên cạnh mỗi tin nhắn" />
          <div className="h-px" style={{ background: BB.border }} />
          <Toggle value={compactMode} onChange={setCompactMode} accentColor={BB.yellow}
            label="Compact mode" sub="Giảm khoảng cách giữa các tin nhắn" />
          <div className="h-px" style={{ background: BB.border }} />
          <Toggle value={autoTitle} onChange={setAutoTitle} accentColor={BB.purple}
            label="Tự động đặt tên hội thoại" sub="AI tự đặt tên chat dựa trên nội dung" />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard>
        <div className="flex items-center gap-2">
          <Bell size={14} style={{ color: BB.yellow }} />
          <p className="text-[13px] font-black text-white">Thông báo</p>
        </div>
        <div className="pt-1">
          <Toggle value={notifSound} onChange={setNotifSound} accentColor={BB.yellow}
            label="Âm thanh thông báo" sub="Phát âm thanh khi AI hoàn tất trả lời" />
        </div>
      </SectionCard>

      {/* Data & Privacy */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Moon size={14} style={{ color: BB.red }} />
          <p className="text-[13px] font-black" style={{ color: BB.red }}>Data & Privacy</p>
        </div>
        <button
          className="w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold transition-colors"
          style={{ background: "rgba(239,68,68,0.06)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" }}
          onClick={() => { if (confirm("Xóa toàn bộ lịch sử chat?")) {} }}>
          Xóa toàn bộ lịch sử chat
        </button>
        <button
          className="w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold transition-colors"
          style={{ background: "rgba(239,68,68,0.06)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" }}
          onClick={() => { localStorage.clear(); window.location.reload(); }}>
          Xóa toàn bộ dữ liệu cục bộ
        </button>
      </div>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── Sidebar nav items ──────────────────────────────────── */
const NAV = [
  { id: "profile", icon: User, label: "Profile", color: BB.accent },
  { id: "ai-config", icon: Cpu, label: "AI Config", color: BB.green },
  { id: "preferences", icon: Sliders, label: "Preferences", color: BB.purple },
] as const;

type SectionId = typeof NAV[number]["id"];

/* ─── Settings page ──────────────────────────────────────── */
export default function Settings() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* IntersectionObserver — track which section is in view */
  useEffect(() => {
    const sections = NAV.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id as SectionId);
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );
    sections.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ background: `${BB.bg}ee`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${BB.border}` }}>
        <Link href="/chat">
          <button className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: BB.muted }}>
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: BB.accent }} />
          <span className="text-[15px] font-black text-white">Settings</span>
        </div>
      </header>

      {/* ── Mobile pill tabs (hidden on md+) ── */}
      <div className="md:hidden sticky top-14 z-30 px-4 py-2.5"
        style={{ background: `${BB.bg}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${BB.border}` }}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {NAV.map(({ id, icon: Icon, label, color }) => {
            const active = activeSection === id;
            return (
              <button key={id} onClick={() => scrollTo(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold shrink-0 transition-all"
                style={{
                  background: active ? `${color}18` : "rgba(255,255,255,0.04)",
                  color: active ? color : BB.muted,
                  border: `1px solid ${active ? color + "35" : "transparent"}`,
                }}>
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two-column layout (sidebar + content) ── */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="flex gap-8 relative">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden md:block w-44 shrink-0">
            <div className="sticky top-14 py-6 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-3"
                style={{ color: BB.muted }}>Navigation</p>
              {NAV.map(({ id, icon: Icon, label, color }) => {
                const active = activeSection === id;
                return (
                  <button key={id} onClick={() => scrollTo(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all text-left"
                    style={{
                      background: active ? `${color}15` : "transparent",
                      color: active ? color : BB.muted,
                      border: `1px solid ${active ? color + "30" : "transparent"}`,
                    }}>
                    <Icon size={14} />
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0 py-6 space-y-12">

            {/* Profile section */}
            <section id="profile" className="scroll-mt-24">
              <SectionHeading icon={User} label="Profile" color={BB.accent} />
              <div className="mt-4">
                <ProfileSection />
              </div>
            </section>

            {/* AI Config section */}
            <section id="ai-config" className="scroll-mt-24 pt-2" style={{ borderTop: `1px solid ${BB.border}` }}>
              <div className="pt-8">
                <SectionHeading icon={Cpu} label="AI Config" color={BB.green} />
                <div className="mt-4">
                  <AIConfigSection />
                </div>
              </div>
            </section>

            {/* Preferences section */}
            <section id="preferences" className="scroll-mt-24 pt-2" style={{ borderTop: `1px solid ${BB.border}` }}>
              <div className="pt-8">
                <SectionHeading icon={Sliders} label="Preferences" color={BB.purple} />
                <div className="mt-4">
                  <PreferencesSection />
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

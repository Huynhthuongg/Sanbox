import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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

/* ─── Helpers ────────────────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
      {children}
    </div>
  );
}

function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-1">
      <label className="text-[13px] font-bold text-white">{children}</label>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: BB.muted }}>{sub}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", rows }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const base = {
    background: "#07070d",
    border: `1px solid ${BB.border}`,
    color: "#fff",
    outline: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    width: "100%",
    resize: "none" as const,
    fontFamily: "inherit",
  };
  if (rows) return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} />;
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />;
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

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13px] text-white">{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: BB.muted }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all shrink-0"
        style={{ background: value ? BB.accent : "rgba(255,255,255,0.1)" }}>
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
      style={{ background: saved ? `${BB.green}18` : BB.accent, color: saved ? BB.green : "#050507", border: saved ? `1px solid ${BB.green}30` : "none" }}
    >
      {saved ? <><CheckCheck size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
    </motion.button>
  );
}

/* ─── Tabs ───────────────────────────────────────────────── */
type Tab = "profile" | "ai" | "preferences";
const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "ai", icon: Cpu, label: "AI Config" },
  { id: "preferences", icon: Sliders, label: "Preferences" },
];

/* ─── Profile tab ────────────────────────────────────────── */
function ProfileTab() {
  const { user } = useUser();
  const { role, plan, isPro } = usePermissions();
  const [displayName, setDisplayName] = useState(user?.fullName ?? user?.username ?? "");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const planColor = plan === "enterprise" ? "#a855f7" : plan === "pro" ? BB.accent : BB.muted;
  const roleColor = role === "admin" ? "#ef4444" : role === "moderator" ? BB.yellow : BB.muted;

  async function handleSave() {
    try {
      await user?.update({ firstName: displayName.split(" ")[0], lastName: displayName.split(" ").slice(1).join(" ") || undefined });
    } catch { /* ignore clerk errors in dev */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <SectionCard>
        <p className="text-[13px] font-bold text-white">Avatar</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover"
                style={{ border: `2px solid rgba(0,208,255,0.25)` }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{ background: `${BB.accent}15`, border: `2px solid ${BB.accent}25`, color: BB.accent }}>
                {(displayName || "U")[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: BB.accent }}>
              <Camera size={11} style={{ color: "#050507" }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] text-white font-bold">{displayName || "Người dùng"}</p>
            <p className="text-[12px]" style={{ color: BB.muted }}>{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ background: `${planColor}15`, color: planColor, border: `1px solid ${planColor}30` }}
              >
                {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Enterprise"}
              </span>
              {role !== "user" && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}
                >
                  <Shield size={8} />
                  {role}
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Plan upgrade card — only for Free users */}
      {!isPro() && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(0,208,255,0.07), rgba(0,208,255,0.03))",
            border: "1px solid rgba(0,208,255,0.15)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={14} style={{ color: BB.accent }} />
                <p className="text-[13px] font-black text-white">Bạn đang dùng Free Plan</p>
              </div>
              <p className="text-[12px] mb-3" style={{ color: BB.muted }}>
                Nâng cấp lên Pro để mở khóa Image AI, Flutter mode, Dashboard và nhiều hơn nữa.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Image Generation", "Flutter Mode", "Dashboard Access", "Priority AI"].map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${BB.accent}10`, color: BB.accent, border: `1px solid ${BB.accent}25` }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold w-full justify-center"
              style={{ background: "var(--sb-gradient)", color: "#121212", boxShadow: "0 0 20px rgba(0,208,255,0.25)" }}
            >
              <Crown size={13} />
              Nâng cấp lên Pro — $19/tháng
              <ArrowRight size={13} />
            </motion.button>
          </Link>
        </div>
      )}

      {/* Info */}
      <SectionCard>
        <div>
          <Label sub="Tên hiển thị trong chat">Display Name</Label>
          <Input value={displayName} onChange={setDisplayName} placeholder="Nhập tên hiển thị..." />
        </div>
        <div>
          <Label sub="Giới thiệu ngắn về bạn (tùy chọn)">Bio</Label>
          <Input value={bio} onChange={setBio} placeholder="Tôi là developer, thích xây app AI..." rows={3} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.primaryEmailAddress?.emailAddress ?? ""} onChange={() => {}} placeholder="" type="email" />
          <p className="text-[11px] mt-1" style={{ color: BB.muted }}>Email được quản lý bởi Clerk, không thể đổi ở đây.</p>
        </div>
      </SectionCard>

      {/* Account info */}
      <SectionCard>
        <p className="text-[13px] font-bold text-white">Thông tin tài khoản</p>
        <div className="space-y-2">
          {[
            { k: "User ID", v: user?.id ?? "—" },
            { k: "Tham gia", v: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—" },
            { k: "Đăng nhập cuối", v: user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("vi-VN") : "—" },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between">
              <span className="text-[12px]" style={{ color: BB.muted }}>{k}</span>
              <span className="text-[12px] font-mono text-white">{v}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── AI Config tab ──────────────────────────────────────── */
function AIConfigTab() {
  const cfg = loadConfig();
  const [model, setModel] = useState(cfg.model ?? "gpt-4o");
  const [mode, setMode] = useState(cfg.mode ?? "chat");
  const [systemPrompt, setSystemPrompt] = useState(cfg.systemPrompt ?? "");
  const [temperature, setTemperature] = useState(cfg.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(cfg.maxTokens ?? "4096");
  const [streaming, setStreaming] = useState(cfg.streaming ?? true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveConfig({ model, mode, systemPrompt, temperature, maxTokens, streaming });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const MODES = [
    { id: "chat", icon: MessageSquare, label: "Chat", color: BB.accent, desc: "Hội thoại thông thường" },
    { id: "code", icon: Code2, label: "Code", color: BB.green, desc: "Sinh & debug code" },
    { id: "image", icon: ImageIcon, label: "Image", color: "#a855f7", desc: "Tạo ảnh từ mô tả" },
    { id: "flutter", icon: Smartphone, label: "Flutter", color: BB.yellow, desc: "Sinh UI Flutter" },
  ];

  return (
    <div className="space-y-4">
      {/* Default mode */}
      <SectionCard>
        <Label sub="Mode mặc định khi mở chat mới">Default AI Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(({ id, icon: Icon, label, color, desc }) => (
            <button key={id} onClick={() => setMode(id)}
              className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all"
              style={{
                background: mode === id ? `${color}12` : "rgba(255,255,255,0.03)",
                border: `1px solid ${mode === id ? color + "35" : BB.border}`,
              }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <div>
                <p className="text-[12px] font-bold" style={{ color: mode === id ? color : "rgba(255,255,255,0.75)" }}>{label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: BB.muted }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Model selection */}
      <SectionCard>
        <div>
          <Label sub="Model AI mặc định cho tất cả chat">Default Model</Label>
          <Select value={model} onChange={setModel} options={[
            { value: "gpt-4o", label: "GPT-4o (Recommended)" },
            { value: "gpt-4o-mini", label: "GPT-4o mini (Faster)" },
            { value: "o3", label: "o3 (Reasoning)" },
            { value: "o4-mini", label: "o4-mini (Fast Reasoning)" },
            { value: "gpt-image-1", label: "GPT-Image (Image mode)" },
          ]} />
        </div>
      </SectionCard>

      {/* System prompt */}
      <SectionCard>
        <div>
          <Label sub="Prompt hệ thống gửi kèm mỗi cuộc hội thoại">System Prompt</Label>
          <Input value={systemPrompt} onChange={setSystemPrompt}
            placeholder="Bạn là trợ lý AI thông minh của Sandbox AI. Trả lời ngắn gọn, chính xác..."
            rows={5} />
          <p className="text-[11px] mt-1.5" style={{ color: BB.muted }}>
            Để trống = dùng prompt mặc định của hệ thống.
          </p>
        </div>
      </SectionCard>

      {/* Advanced */}
      <SectionCard>
        <p className="text-[13px] font-bold text-white">Advanced</p>
        <div>
          <Label sub={`Độ sáng tạo: ${temperature} (0 = chính xác, 1 = sáng tạo)`}>Temperature</Label>
          <input type="range" min={0} max={1} step={0.05} value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${BB.accent} ${temperature * 100}%, rgba(255,255,255,0.08) 0%)` }} />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: BB.muted }}>
            <span>Chính xác</span><span>Sáng tạo</span>
          </div>
        </div>
        <div>
          <Label sub="Số token tối đa mỗi response">Max Tokens</Label>
          <Select value={maxTokens} onChange={setMaxTokens} options={[
            { value: "1024", label: "1,024 tokens" },
            { value: "2048", label: "2,048 tokens" },
            { value: "4096", label: "4,096 tokens (Default)" },
            { value: "8192", label: "8,192 tokens" },
            { value: "16384", label: "16,384 tokens" },
          ]} />
        </div>
        <Toggle value={streaming} onChange={setStreaming} label="Streaming response"
          sub="Hiển thị text từng ký tự khi AI đang trả lời" />
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── Preferences tab ────────────────────────────────────── */
function PreferencesTab() {
  const prefs = loadPrefs();
  const [lang, setLang] = useState(prefs.lang ?? "vi");
  const [notifSound, setNotifSound] = useState(prefs.notifSound ?? true);
  const [enterSend, setEnterSend] = useState(prefs.enterSend ?? true);
  const [showTimestamps, setShowTimestamps] = useState(prefs.showTimestamps ?? false);
  const [compactMode, setCompactMode] = useState(prefs.compactMode ?? false);
  const [autoTitle, setAutoTitle] = useState(prefs.autoTitle ?? true);
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
          <p className="text-[13px] font-bold text-white">Ngôn ngữ</p>
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
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={14} style={{ color: BB.green }} />
          <p className="text-[13px] font-bold text-white">Chat Behavior</p>
        </div>
        <div className="space-y-4">
          <Toggle value={enterSend} onChange={setEnterSend} label="Enter để gửi"
            sub="Nhấn Enter gửi tin nhắn, Shift+Enter xuống dòng" />
          <Toggle value={showTimestamps} onChange={setShowTimestamps} label="Hiển thị timestamp"
            sub="Hiện giờ gửi bên cạnh mỗi tin nhắn" />
          <Toggle value={compactMode} onChange={setCompactMode} label="Compact mode"
            sub="Giảm khoảng cách giữa các tin nhắn" />
          <Toggle value={autoTitle} onChange={setAutoTitle} label="Tự động đặt tên hội thoại"
            sub="AI tự đặt tên chat dựa trên nội dung" />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-2">
          <Bell size={14} style={{ color: BB.yellow }} />
          <p className="text-[13px] font-bold text-white">Thông báo</p>
        </div>
        <Toggle value={notifSound} onChange={setNotifSound} label="Âm thanh thông báo"
          sub="Phát âm thanh khi AI hoàn tất trả lời" />
      </SectionCard>

      {/* Danger */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-2">
          <Moon size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          <p className="text-[13px] font-bold text-white">Data & Privacy</p>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold transition-colors"
            style={{ background: "rgba(248,113,113,0.06)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}
            onClick={() => { if (confirm("Xóa toàn bộ lịch sử chat?")) {} }}>
            Xóa toàn bộ lịch sử chat
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-bold transition-colors"
            style={{ background: "rgba(248,113,113,0.06)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}
            onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Xóa toàn bộ dữ liệu cục bộ
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

/* ─── Settings page ──────────────────────────────────────── */
export default function Settings() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ background: `${BB.bg}e8`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${BB.border}` }}>
        <Link href="/chat">
          <button className="p-2 rounded-xl" style={{ color: BB.muted }}>
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: BB.accent }} />
          <span className="text-[14px] font-black text-white">Settings</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pb-16">
        {/* Tab bar */}
        <div className="flex gap-1 py-4">
          {TABS.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex-1 justify-center"
                style={{
                  background: active ? `${BB.accent}15` : "transparent",
                  color: active ? BB.accent : BB.muted,
                  border: `1px solid ${active ? BB.accent + "25" : "transparent"}`,
                }}>
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === "profile" && <ProfileTab />}
            {tab === "ai" && <AIConfigTab />}
            {tab === "preferences" && <PreferencesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

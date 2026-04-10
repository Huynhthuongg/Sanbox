import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, ScrollText, BarChart3, Cpu, Globe, Settings2,
  ArrowLeft, Activity, Clock, Zap, Users, TrendingUp, TrendingDown,
  RefreshCw, ChevronRight, CheckCircle2, AlertCircle, XCircle,
  Copy, CheckCheck, Plus, Trash2, ExternalLink, Shield, RotateCcw,
  Terminal, Info, AlertTriangle, Power, Download, Upload,
  HardDrive, MemoryStick, Wifi, Lock, Unlock,
} from "lucide-react";

/* ─── Design tokens ─────────────────────────────────────── */
const BB = {
  bg: "#050507",
  card: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  accent: "#00d0ff",
  green: "#34d399",
  yellow: "#f59e0b",
  red: "#f87171",
  purple: "#a855f7",
  muted: "rgba(255,255,255,0.38)",
};

/* ─── Mock data ─────────────────────────────────────────── */
const reqData = [
  { t: "00:00", v: 124 }, { t: "02:00", v: 89 }, { t: "04:00", v: 62 },
  { t: "06:00", v: 148 }, { t: "08:00", v: 312 }, { t: "10:00", v: 476 },
  { t: "12:00", v: 534 }, { t: "14:00", v: 498 }, { t: "16:00", v: 612 },
  { t: "18:00", v: 589 }, { t: "20:00", v: 421 }, { t: "22:00", v: 287 },
];

const latencyData = [
  { t: "00:00", v: 142 }, { t: "02:00", v: 128 }, { t: "04:00", v: 119 },
  { t: "06:00", v: 131 }, { t: "08:00", v: 178 }, { t: "10:00", v: 162 },
  { t: "12:00", v: 195 }, { t: "14:00", v: 188 }, { t: "16:00", v: 201 },
  { t: "18:00", v: 174 }, { t: "20:00", v: 156 }, { t: "22:00", v: 143 },
];

const modelData = [
  { name: "GPT-4o", value: 42, color: BB.accent },
  { name: "GPT-4o-mini", value: 28, color: BB.green },
  { name: "o3", value: 18, color: BB.purple },
  { name: "GPT-image", value: 12, color: BB.yellow },
];

const weekData = [
  { day: "T2", req: 3210, err: 12 },
  { day: "T3", req: 4180, err: 8 },
  { day: "T4", req: 3870, err: 21 },
  { day: "T5", req: 5120, err: 6 },
  { day: "T6", req: 6340, err: 14 },
  { day: "T7", req: 7890, err: 9 },
  { day: "CN", req: 5430, err: 11 },
];

const MOCK_LOGS = [
  { id: 1, time: "14:32:01", level: "info", msg: "GET /api/openai/conversations 200 34ms", source: "api-server" },
  { id: 2, time: "14:32:04", level: "info", msg: "POST /api/openai/conversations/abc/messages 200 1243ms", source: "api-server" },
  { id: 3, time: "14:32:11", level: "warn", msg: "Rate limit approaching: 80% of quota used", source: "openai" },
  { id: 4, time: "14:32:15", level: "info", msg: "GET /api/health 200 2ms", source: "api-server" },
  { id: 5, time: "14:32:19", level: "error", msg: "Image generation failed: safety system triggered", source: "openai" },
  { id: 6, time: "14:32:22", level: "info", msg: "GET / 200 18ms", source: "web" },
  { id: 7, time: "14:32:28", level: "debug", msg: "DB pool: 3/10 connections active", source: "database" },
  { id: 8, time: "14:32:31", level: "info", msg: "POST /api/openai/conversations 201 28ms", source: "api-server" },
  { id: 9, time: "14:32:35", level: "warn", msg: "Slow query detected: 892ms (conversations.list)", source: "database" },
  { id: 10, time: "14:32:41", level: "info", msg: "Conversation 8f3a2b deleted by user u_Kj9xPq", source: "api-server" },
  { id: 11, time: "14:32:48", level: "info", msg: "GET /api/mobile/ios/profile 200 3ms", source: "api-server" },
  { id: 12, time: "14:32:53", level: "error", msg: "Auth token expired for session sess_Mn8Lp2", source: "clerk" },
  { id: 13, time: "14:32:57", level: "info", msg: "Flutter code generated: 847 tokens, 1.8s", source: "openai" },
  { id: 14, time: "14:33:02", level: "debug", msg: "Cache miss: conversations for u_Kj9xPq", source: "cache" },
  { id: 15, time: "14:33:08", level: "info", msg: "Image generated: 1024×1024, 3.2s", source: "openai" },
];

const MOCK_DOMAINS = [
  { domain: "sandbox-ai.replit.app", type: "default", ssl: true, status: "active", primary: true },
  { domain: "api.sandbox-ai.replit.app", type: "api", ssl: true, status: "active", primary: false },
];

const MOCK_ENV = [
  { key: "NODE_ENV", value: "production", secret: false },
  { key: "DATABASE_URL", value: "postgresql://***@***:5432/sandbox", secret: true },
  { key: "CLERK_SECRET_KEY", value: "sk_live_***", secret: true },
  { key: "AI_INTEGRATIONS_OPENAI_API_KEY", value: "sk-proj-***", secret: true },
  { key: "PORT", value: "3000", secret: false },
];

/* ─── Types ─────────────────────────────────────────────── */
type Tab = "overview" | "logs" | "analytics" | "resources" | "domains" | "manage";

/* ─── Helpers ────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = BB.accent, trend }: {
  icon: typeof Activity; label: string; value: string; sub?: string;
  color?: string; trend?: { dir: "up" | "down"; pct: number };
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: BB.card, border: `1px solid ${BB.border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: trend.dir === "up" ? BB.green : BB.red }}>
            {trend.dir === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.pct}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-[12px] mt-0.5" style={{ color: BB.muted }}>{label}</div>
        {sub && <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.22)" }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: "healthy" | "degraded" | "down" }) {
  const cfg = {
    healthy: { color: BB.green, label: "Healthy", icon: CheckCircle2 },
    degraded: { color: BB.yellow, label: "Degraded", icon: AlertCircle },
    down: { color: BB.red, label: "Down", icon: XCircle },
  }[status];
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
      <cfg.icon size={11} />
      {cfg.label}
    </span>
  );
}

function LogLevelBadge({ level }: { level: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    info: { color: BB.accent, bg: `${BB.accent}12` },
    warn: { color: BB.yellow, bg: `${BB.yellow}12` },
    error: { color: BB.red, bg: `${BB.red}12` },
    debug: { color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)" },
  };
  const s = cfg[level] ?? cfg.info;
  return (
    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest" style={{ background: s.bg, color: s.color }}>
      {level}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1.5 rounded-lg transition-colors" style={{ color: BB.muted }}
    >
      {copied ? <CheckCheck size={13} style={{ color: BB.green }} /> : <Copy size={13} />}
    </button>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-black text-white">{children}</h2>
      {sub && <p className="text-[13px] mt-0.5" style={{ color: BB.muted }}>{sub}</p>}
    </div>
  );
}

/* ─── Sections ──────────────────────────────────────────── */
function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* App info + status */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0" style={{ border: `1px solid rgba(0,208,255,0.2)` }}>
          <img src="/icons/icon-512.png" alt="Sandbox AI" className="w-full h-full object-cover" style={{ objectPosition: "center 60%" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-white">Sandbox AI</h1>
            <StatusBadge status="healthy" />
          </div>
          <p className="text-[13px] mt-1" style={{ color: BB.muted }}>sandbox-ai.replit.app · Production · Node 20 · PostgreSQL 15</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: `1px solid ${BB.border}` }}>
            <RefreshCw size={13} /> Redeploy
          </motion.button>
          <motion.a whileTap={{ scale: 0.95 }} href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold"
            style={{ background: BB.accent, color: "#050507" }}>
            <ExternalLink size={13} /> Open
          </motion.a>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Zap} label="Requests / 24h" value="4,231" color={BB.accent} trend={{ dir: "up", pct: 12 }} />
        <StatCard icon={Clock} label="Avg Latency" value="162ms" color={BB.green} trend={{ dir: "down", pct: 8 }} />
        <StatCard icon={Users} label="Active Users" value="89" sub="Last 24 hours" color={BB.purple} trend={{ dir: "up", pct: 23 }} />
        <StatCard icon={Activity} label="Uptime" value="99.97%" sub="Last 30 days" color={BB.yellow} />
      </div>

      {/* Requests chart */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] font-bold text-white">Requests Today</p>
            <p className="text-[11px]" style={{ color: BB.muted }}>Requests per 2-hour window</p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: BB.muted }}>Last 24h</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={reqData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BB.accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={BB.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12 }} />
            <Area type="monotone" dataKey="v" name="Requests" stroke={BB.accent} strokeWidth={2} fill="url(#reqGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Services */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <p className="text-[13px] font-bold text-white mb-4">Services</p>
        <div className="space-y-3">
          {[
            { name: "Web (sandbox-ai)", status: "healthy" as const, uptime: "99.97%", latency: "18ms" },
            { name: "API Server", status: "healthy" as const, uptime: "99.91%", latency: "162ms" },
            { name: "PostgreSQL", status: "healthy" as const, uptime: "100%", latency: "4ms" },
            { name: "Clerk Auth", status: "healthy" as const, uptime: "99.99%", latency: "—" },
            { name: "OpenAI API", status: "healthy" as const, uptime: "99.80%", latency: "1.2s" },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BB.border}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: BB.green, boxShadow: `0 0 6px ${BB.green}` }} />
                <span className="text-[13px] text-white">{s.name}</span>
              </div>
              <div className="flex items-center gap-4 text-[12px]" style={{ color: BB.muted }}>
                <span>↑ {s.uptime}</span>
                <span className="font-mono">{s.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsSection() {
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error" | "debug">("all");
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(true);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const newLines = [
        "GET /api/health 200 2ms",
        "POST /api/openai/conversations/xyz/messages 200 987ms",
        "DB pool: 4/10 connections active",
        "Cache hit: conversations for u_Kj9xPq",
        "GET / 200 14ms",
      ];
      const levels = ["info", "info", "debug", "info", "warn"] as const;
      const pick = Math.floor(Math.random() * newLines.length);
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLogs((prev) => [
        ...prev.slice(-49),
        { id: Date.now(), time: t, level: levels[pick], msg: newLines[pick], source: "api-server" },
      ]);
    }, 2800);
    return () => clearInterval(id);
  }, [live]);

  useEffect(() => {
    if (live) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, live]);

  const filtered = logs.filter((l) => {
    if (filter !== "all" && l.level !== filter) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <SectionTitle sub="Realtime log stream from all services">Application Logs</SectionTitle>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm log..."
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: BB.card, border: `1px solid ${BB.border}`, color: "#fff" }}
        />
        <div className="flex gap-2">
          {(["all", "info", "warn", "error", "debug"] as const).map((l) => (
            <button key={l} onClick={() => setFilter(l)}
              className="px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: filter === l ? (l === "all" ? BB.accent : l === "warn" ? BB.yellow : l === "error" ? BB.red : l === "debug" ? "rgba(255,255,255,0.15)" : BB.accent) + "20" : "rgba(255,255,255,0.04)",
                color: filter === l ? (l === "warn" ? BB.yellow : l === "error" ? BB.red : l === "debug" ? "rgba(255,255,255,0.5)" : BB.accent) : BB.muted,
                border: `1px solid ${filter === l ? (l === "warn" ? BB.yellow : l === "error" ? BB.red : BB.accent) + "30" : BB.border}`,
              }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setLive((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold"
          style={{ background: live ? `${BB.green}15` : "rgba(255,255,255,0.04)", color: live ? BB.green : BB.muted, border: `1px solid ${live ? BB.green + "25" : BB.border}` }}>
          <span className={`w-2 h-2 rounded-full ${live ? "animate-pulse" : ""}`} style={{ background: live ? BB.green : "rgba(255,255,255,0.2)" }} />
          {live ? "LIVE" : "Paused"}
        </button>
      </div>

      {/* Log viewer */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#05050a", border: `1px solid ${BB.border}` }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${BB.border}` }}>
          <span className="text-[11px] font-bold" style={{ color: BB.muted }}>
            <Terminal size={11} className="inline mr-1.5" />
            {filtered.length} entries
          </span>
          <button onClick={() => setLogs([])} className="text-[11px]" style={{ color: BB.muted }}>Clear</button>
        </div>
        <div className="overflow-y-auto font-mono" style={{ height: 420 }}>
          <AnimatePresence initial={false}>
            {filtered.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}
              >
                <span className="text-[10px] shrink-0 mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{log.time}</span>
                <LogLevelBadge level={log.level} />
                <span className="text-[11px] shrink-0 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>{log.source}</span>
                <span className="text-[12px] break-all flex-1" style={{ color: log.level === "error" ? BB.red : log.level === "warn" ? BB.yellow : "rgba(255,255,255,0.65)" }}>{log.msg}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle sub="Usage statistics for the last 7 days">Analytics</SectionTitle>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Zap} label="Total Requests" value="34,210" color={BB.accent} trend={{ dir: "up", pct: 18 }} />
        <StatCard icon={Users} label="Unique Users" value="412" color={BB.green} trend={{ dir: "up", pct: 7 }} />
        <StatCard icon={Clock} label="p95 Latency" value="284ms" color={BB.yellow} trend={{ dir: "down", pct: 5 }} />
        <StatCard icon={XCircle} label="Error Rate" value="0.31%" color={BB.red} trend={{ dir: "down", pct: 14 }} />
      </div>

      {/* Request / Error bar chart */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <p className="text-[13px] font-bold text-white mb-1">Requests & Errors — 7 ngày</p>
        <p className="text-[11px] mb-4" style={{ color: BB.muted }}>Số request (xanh) và lỗi (đỏ) từng ngày trong tuần</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="30%">
            <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12 }} />
            <Bar dataKey="req" name="Requests" fill={BB.accent} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            <Bar dataKey="err" name="Errors" fill={BB.red} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model usage pie */}
        <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <p className="text-[13px] font-bold text-white mb-1">Phân bổ Model AI</p>
          <p className="text-[11px] mb-4" style={{ color: BB.muted }}>% request theo model</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={modelData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                  {modelData.map((m, i) => <Cell key={i} fill={m.color} fillOpacity={0.85} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {modelData.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-[12px] text-white">{m.name}</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: m.color }}>{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latency chart */}
        <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <p className="text-[13px] font-bold text-white mb-1">Latency hôm nay</p>
          <p className="text-[11px] mb-4" style={{ color: BB.muted }}>Avg response time (ms) theo giờ</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={latencyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BB.green} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={BB.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12 }} formatter={(v) => [`${v}ms`, "Latency"]} />
              <Area type="monotone" dataKey="v" stroke={BB.green} strokeWidth={2} fill="url(#latGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function GaugeBar({ label, value, max, color, unit = "%" }: { label: string; value: number; max: number; color: string; unit?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-[13px] text-white">{label}</span>
        <span className="text-[13px] font-bold" style={{ color }}>{value}{unit} <span className="font-normal text-[11px]" style={{ color: BB.muted }}>/ {max}{unit}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: pct > 80 ? BB.red : pct > 60 ? BB.yellow : color }}
        />
      </div>
    </div>
  );
}

function ResourcesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle sub="Live resource consumption">Resources</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU + Memory */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={15} style={{ color: BB.accent }} />
            <p className="text-[13px] font-bold text-white">Compute</p>
          </div>
          <GaugeBar label="CPU" value={23} max={100} color={BB.accent} />
          <GaugeBar label="Memory" value={412} max={512} color={BB.purple} unit=" MB" />
          <GaugeBar label="Swap" value={0} max={256} color={BB.yellow} unit=" MB" />
          <div className="pt-2 flex gap-4 text-[11px]" style={{ color: BB.muted }}>
            <span>4 vCPU · 512 MB RAM</span>
            <span>Node 20 LTS</span>
          </div>
        </div>

        {/* Storage */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={15} style={{ color: BB.green }} />
            <p className="text-[13px] font-bold text-white">Storage</p>
          </div>
          <GaugeBar label="Disk usage" value={2.4} max={10} color={BB.green} unit=" GB" />
          <GaugeBar label="Database" value={384} max={1024} color={BB.accent} unit=" MB" />
          <GaugeBar label="Object Storage" value={1.1} max={5} color={BB.yellow} unit=" GB" />
          <div className="pt-2 text-[11px]" style={{ color: BB.muted }}>10 GB SSD · PostgreSQL 15</div>
        </div>

        {/* Network */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={15} style={{ color: BB.yellow }} />
            <p className="text-[13px] font-bold text-white">Network</p>
          </div>
          <GaugeBar label="Bandwidth (ingress)" value={1.2} max={10} color={BB.green} unit=" GB" />
          <GaugeBar label="Bandwidth (egress)" value={3.8} max={10} color={BB.accent} unit=" GB" />
          <div className="pt-3 flex items-center gap-6 text-[12px]">
            <div className="flex items-center gap-1.5" style={{ color: BB.green }}>
              <Download size={12} /> 1.2 GB today
            </div>
            <div className="flex items-center gap-1.5" style={{ color: BB.accent }}>
              <Upload size={12} /> 3.8 GB today
            </div>
          </div>
        </div>

        {/* DB connections */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <MemoryStick size={15} style={{ color: BB.purple }} />
            <p className="text-[13px] font-bold text-white">Database</p>
          </div>
          <GaugeBar label="Connections" value={3} max={10} color={BB.purple} unit="" />
          <GaugeBar label="Cache hit rate" value={92} max={100} color={BB.green} />
          <GaugeBar label="Query time (avg)" value={14} max={100} color={BB.accent} unit=" ms" />
          <div className="pt-2 text-[11px]" style={{ color: BB.muted }}>10 connection pool · PgBouncer</div>
        </div>
      </div>

      {/* Instance info */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <p className="text-[13px] font-bold text-white mb-4">Instance Info</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { k: "Region", v: "US East (us-east-1)" },
            { k: "Runtime", v: "Node.js 20 LTS" },
            { k: "Build", v: "Vite + ESBuild" },
            { k: "Deployed", v: "Apr 9, 2026 14:22 UTC" },
            { k: "Commit", v: "6ae89a6" },
            { k: "Branch", v: "main" },
          ].map(({ k, v }) => (
            <div key={k}>
              <p className="text-[11px] mb-0.5" style={{ color: BB.muted }}>{k}</p>
              <p className="text-[13px] font-mono text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainsSection() {
  const [domains, setDomains] = useState(MOCK_DOMAINS);
  const [adding, setAdding] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  function addDomain() {
    if (!newDomain.trim()) return;
    setDomains((prev) => [...prev, { domain: newDomain.trim(), type: "custom", ssl: false, status: "pending", primary: false }]);
    setNewDomain("");
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      <SectionTitle sub="Manage custom domains and SSL certificates">Domains</SectionTitle>

      {/* Domain list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BB.border}` }}>
          <p className="text-[13px] font-bold text-white">Configured Domains</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold"
            style={{ background: BB.accent, color: "#050507" }}>
            <Plus size={12} /> Add Domain
          </motion.button>
        </div>

        {adding && (
          <div className="px-5 py-4 flex gap-2" style={{ borderBottom: `1px solid ${BB.border}`, background: "rgba(0,208,255,0.03)" }}>
            <input
              autoFocus value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addDomain(); if (e.key === "Escape") setAdding(false); }}
              placeholder="yourdomain.com"
              className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none"
              style={{ background: "#07070d", border: `1px solid rgba(0,208,255,0.25)`, color: "#fff" }}
            />
            <button onClick={addDomain} className="px-4 py-2 rounded-xl text-[12px] font-bold" style={{ background: BB.accent, color: "#050507" }}>Add</button>
            <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-xl text-[12px]" style={{ color: BB.muted }}>Cancel</button>
          </div>
        )}

        {domains.map((d, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: i < domains.length - 1 ? `1px solid ${BB.border}` : undefined }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: d.ssl ? `${BB.green}12` : `${BB.yellow}12` }}>
              {d.ssl ? <Lock size={14} style={{ color: BB.green }} /> : <Unlock size={14} style={{ color: BB.yellow }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-white truncate">{d.domain}</span>
                {d.primary && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${BB.accent}15`, color: BB.accent, border: `1px solid ${BB.accent}25` }}>Primary</span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: d.status === "active" ? `${BB.green}12` : `${BB.yellow}12`, color: d.status === "active" ? BB.green : BB.yellow, border: `1px solid ${d.status === "active" ? BB.green : BB.yellow}25` }}>
                  {d.status === "active" ? "● Active" : "⏳ Pending"}
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: BB.muted }}>
                {d.ssl ? "SSL/TLS: Active · Auto-renew" : "SSL/TLS: Pending DNS verification"} · {d.type}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`https://${d.domain}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg" style={{ color: BB.muted }}>
                <ExternalLink size={13} />
              </a>
              {!d.primary && (
                <button onClick={() => setDomains((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-lg" style={{ color: BB.muted }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DNS records */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <p className="text-[13px] font-bold text-white mb-4">DNS Records — sandbox-ai.replit.app</p>
        <div className="space-y-3">
          {[
            { type: "A", name: "@", value: "34.125.12.88", ttl: "3600" },
            { type: "CNAME", name: "api", value: "api-server.sandbox-ai.replit.app", ttl: "3600" },
            { type: "TXT", name: "@", value: "v=spf1 include:replit.app ~all", ttl: "3600" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#07070d", border: `1px solid ${BB.border}` }}>
              <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ background: `${BB.accent}12`, color: BB.accent }}>{r.type}</span>
              <code className="text-[11px] text-white/60 flex-1 truncate font-mono">{r.name}</code>
              <code className="text-[11px] text-white/80 flex-1 truncate font-mono">{r.value}</code>
              <span className="text-[10px] shrink-0" style={{ color: BB.muted }}>TTL {r.ttl}</span>
              <CopyBtn text={r.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManageSection() {
  const [envVisible, setEnvVisible] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      <SectionTitle sub="Environment variables, deployment settings and danger zone">Manage</SectionTitle>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: RefreshCw, label: "Redeploy", color: BB.accent, desc: "Push latest build" },
          { icon: RotateCcw, label: "Restart", color: BB.green, desc: "Restart services" },
          { icon: Download, label: "Export Logs", color: BB.purple, desc: "Download as .log" },
          { icon: Power, label: "Shut Down", color: BB.red, desc: "Stop all services" },
        ].map(({ icon: Icon, label, color, desc }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-2xl p-4 text-left flex flex-col gap-2"
            style={{ background: BB.card, border: `1px solid ${BB.border}` }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{label}</p>
              <p className="text-[11px]" style={{ color: BB.muted }}>{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Environment variables */}
      <div className="rounded-2xl overflow-hidden" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BB.border}` }}>
          <div>
            <p className="text-[13px] font-bold text-white">Environment Variables</p>
            <p className="text-[11px] mt-0.5" style={{ color: BB.muted }}>Secrets are encrypted at rest and never exposed in logs</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold"
            style={{ background: BB.accent, color: "#050507" }}>
            <Plus size={12} /> Add Variable
          </motion.button>
        </div>
        {MOCK_ENV.map((env, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: i < MOCK_ENV.length - 1 ? `1px solid ${BB.border}` : undefined }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: env.secret ? `${BB.yellow}12` : "rgba(255,255,255,0.04)" }}>
              {env.secret ? <Shield size={12} style={{ color: BB.yellow }} /> : <Info size={12} style={{ color: BB.muted }} />}
            </div>
            <code className="text-[12px] font-mono flex-1 text-white">{env.key}</code>
            <code className="text-[12px] font-mono flex-1 truncate" style={{ color: BB.muted }}>
              {env.secret && !envVisible[i] ? "•".repeat(16) : env.value}
            </code>
            <div className="flex items-center gap-1 shrink-0">
              {env.secret && (
                <button onClick={() => setEnvVisible((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="px-2.5 py-1 rounded-lg text-[11px]" style={{ color: BB.muted }}>
                  {envVisible[i] ? "Hide" : "Show"}
                </button>
              )}
              <CopyBtn text={env.value} />
              <button className="p-1.5 rounded-lg" style={{ color: BB.muted }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Build settings */}
      <div className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
        <p className="text-[13px] font-bold text-white mb-4">Build & Deploy Settings</p>
        <div className="space-y-3">
          {[
            { label: "Build Command", value: "pnpm --filter @workspace/sandbox-ai run build" },
            { label: "Start Command", value: "pnpm --filter @workspace/api-server run start" },
            { label: "Install Command", value: "pnpm install" },
            { label: "Output Directory", value: "artifacts/sandbox-ai/dist" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold" style={{ color: BB.muted }}>{label}</label>
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "#07070d", border: `1px solid ${BB.border}` }}>
                <code className="text-[12px] font-mono text-white/70 flex-1 truncate">{value}</code>
                <CopyBtn text={value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-5" style={{ background: "#0d0306", border: `1px solid ${BB.red}22` }}>
        <p className="text-[13px] font-bold mb-1" style={{ color: BB.red }}>Danger Zone</p>
        <p className="text-[12px] mb-4" style={{ color: "rgba(248,113,113,0.55)" }}>These actions are irreversible. Proceed with caution.</p>
        <div className="space-y-3">
          {[
            { label: "Reset Database", desc: "Drop and recreate all tables. All data will be lost." },
            { label: "Revoke All Sessions", desc: "Sign out all users immediately." },
            { label: "Delete Deployment", desc: "Permanently delete this deployment and all associated data." },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: "rgba(248,113,113,0.04)", border: `1px solid ${BB.red}15` }}>
              <div>
                <p className="text-[13px] font-bold text-white">{label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,113,113,0.5)" }}>{desc}</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-xl text-[12px] font-bold shrink-0"
                style={{ background: `${BB.red}15`, color: BB.red, border: `1px solid ${BB.red}25` }}>
                {label.split(" ")[0]}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar / Nav ─────────────────────────────────────── */
const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "resources", label: "Resources", icon: Cpu },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "manage", label: "Manage", icon: Settings2 },
];

/* ─── Dashboard page ─────────────────────────────────────── */
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [, setLocation] = useLocation();

  const section = {
    overview: <OverviewSection />,
    logs: <LogsSection />,
    analytics: <AnalyticsSection />,
    resources: <ResourcesSection />,
    domains: <DomainsSection />,
    manage: <ManageSection />,
  }[tab];

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 shrink-0" style={{ background: `${BB.bg}e8`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${BB.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-xl transition-colors" style={{ color: BB.muted }}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img src="/icons/icon-512.png" alt="Sandbox AI" className="w-full h-full object-cover" style={{ objectPosition: "center 60%" }} />
            </div>
            <span className="text-[13px] font-black text-white">Sandbox AI</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: `${BB.green}15`, color: BB.green, border: `1px solid ${BB.green}25` }}>Production</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[12px]" style={{ color: BB.green }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BB.green }} />
            All systems operational
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 py-4 px-3" style={{ borderRight: `1px solid ${BB.border}` }}>
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all"
                  style={{
                    background: active ? `${BB.accent}12` : "transparent",
                    color: active ? BB.accent : BB.muted,
                    border: `1px solid ${active ? BB.accent + "22" : "transparent"}`,
                  }}>
                  <Icon size={15} />
                  {label}
                  {active && <ChevronRight size={12} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${BB.border}` }}>
            <Link href="/chat">
              <motion.button whileTap={{ scale: 0.96 }} className="w-full py-2.5 rounded-xl text-[12px] font-bold"
                style={{ background: BB.accent, color: "#050507" }}>
                Open Chat →
              </motion.button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide" style={{ borderBottom: `1px solid ${BB.border}` }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 transition-all"
                  style={{
                    background: active ? `${BB.accent}15` : "transparent",
                    color: active ? BB.accent : BB.muted,
                    border: `1px solid ${active ? BB.accent + "22" : "transparent"}`,
                  }}>
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                {section}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

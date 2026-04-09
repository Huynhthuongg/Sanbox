import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermissions } from "@/hooks/use-permissions";
import { Link } from "wouter";
import {
  Users, Shield, Crown, Search, ChevronLeft,
  RefreshCw, BarChart2, MessageSquare, AlertTriangle,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const API = `${BASE_URL}/api`;

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: string;
  plan: string;
  createdAt: number;
  lastSignInAt: number | null;
}

const ROLE_OPTIONS = ["user", "moderator", "admin"];
const PLAN_OPTIONS = ["free", "pro", "enterprise"];

const ROLE_COLOR: Record<string, string> = {
  admin: "#ef4444",
  moderator: "#f59e0b",
  user: "rgba(255,255,255,0.3)",
};

const PLAN_COLOR: Record<string, string> = {
  enterprise: "#a855f7",
  pro: "#00d0ff",
  free: "rgba(255,255,255,0.25)",
};

export default function AdminPage() {
  const { isAdmin, isLoaded, role } = usePermissions();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<{ totalConversations: number; totalUsers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/users`),
        fetch(`${API}/admin/stats`),
      ]);
      if (!usersRes.ok) throw new Error(`Users API ${usersRes.status}`);
      const usersData = await usersRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setUsers(usersData);
      setStats(statsData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const handleUpdate = async (userId: string, field: "role" | "plan", value: string) => {
    setUpdating(userId + field);
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Update failed");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
      );
    } catch {
      setError("Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sb-bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--sb-accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" style={{ background: "var(--sb-bg)" }}>
        <AlertTriangle size={40} style={{ color: "#ef4444" }} />
        <h1 className="text-2xl font-black text-white">Access Denied</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          You need Admin role to access this page. Your current role: <strong style={{ color: ROLE_COLOR[role] ?? "#fff" }}>{role}</strong>
        </p>
        <Link href="/chat">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--sb-gradient)", color: "#121212" }}
          >
            <ChevronLeft size={14} />
            Back to Chat
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--sb-bg)", color: "var(--sb-text)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,7,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/chat">
            <button
              className="flex items-center gap-1.5 text-sm transition-all"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--sb-accent)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </Link>
          <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "#ef4444" }} />
            <span className="font-bold text-base text-white">Admin Panel</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              Restricted
            </span>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              label: "Total Users",
              value: stats?.totalUsers ?? "—",
              color: "#00d0ff",
            },
            {
              icon: MessageSquare,
              label: "Conversations",
              value: stats?.totalConversations ?? "—",
              color: "#34d399",
            },
            {
              icon: BarChart2,
              label: "Shown in table",
              value: filtered.length,
              color: "#a855f7",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl"
              style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} style={{ color }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color }}>{value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Search size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "rgba(255,255,255,0.7)", caretColor: "var(--sb-accent)" }}
            />
          </div>
          <div className="flex gap-2">
            {["all", ...ROLE_OPTIONS].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={
                  filterRole === r
                    ? { background: "rgba(0,208,255,0.12)", color: "var(--sb-accent)", border: "1px solid rgba(0,208,255,0.25)" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
          >
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-3 px-5 py-3 text-[11px] uppercase tracking-widest font-semibold"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="col-span-5">User</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Plan</div>
            <div className="col-span-1">Joined</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              <RefreshCw size={14} className="animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
              No users found
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((u, i) => {
                const isUpdating = updating?.startsWith(u.id);
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center group transition-colors"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isUpdating ? "rgba(0,208,255,0.03)" : "transparent",
                    }}
                    onMouseEnter={e => { if (!isUpdating) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { if (!isUpdating) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* User info */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black overflow-hidden shrink-0"
                        style={{ background: "linear-gradient(135deg, #00d0ff, #00a3cc)", color: "#121212" }}
                      >
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.firstName?.[0] ?? u.email?.[0] ?? "U").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : "—"}
                        </div>
                        <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{u.email}</div>
                      </div>
                    </div>

                    {/* Role selector */}
                    <div className="col-span-3">
                      <select
                        value={u.role}
                        onChange={e => handleUpdate(u.id, "role", e.target.value)}
                        disabled={!!isUpdating}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg appearance-none cursor-pointer transition-all disabled:opacity-50"
                        style={{
                          background: `${ROLE_COLOR[u.role] ?? "rgba(255,255,255,0.05)"}18`,
                          border: `1px solid ${ROLE_COLOR[u.role] ?? "rgba(255,255,255,0.1)"}35`,
                          color: ROLE_COLOR[u.role] ?? "rgba(255,255,255,0.5)",
                          outline: "none",
                        }}
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r} style={{ background: "#1e1e2f", color: "#fff" }}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan selector */}
                    <div className="col-span-3">
                      <select
                        value={u.plan}
                        onChange={e => handleUpdate(u.id, "plan", e.target.value)}
                        disabled={!!isUpdating}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg appearance-none cursor-pointer transition-all disabled:opacity-50"
                        style={{
                          background: `${PLAN_COLOR[u.plan] ?? "rgba(255,255,255,0.05)"}18`,
                          border: `1px solid ${PLAN_COLOR[u.plan] ?? "rgba(255,255,255,0.1)"}35`,
                          color: PLAN_COLOR[u.plan] ?? "rgba(255,255,255,0.5)",
                          outline: "none",
                        }}
                      >
                        {PLAN_OPTIONS.map(p => (
                          <option key={p} value={p} style={{ background: "#1e1e2f", color: "#fff" }}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Joined */}
                    <div className="col-span-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) : "—"}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <p className="text-center text-[11px] pb-8" style={{ color: "rgba(255,255,255,0.15)" }}>
          Role and plan changes take effect on the user's next login · Changes are permanent
        </p>
      </div>
    </div>
  );
}

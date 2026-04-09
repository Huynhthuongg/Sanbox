import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/react";
import {
  MessageSquare, Code2, Image as ImageIcon, LogOut, Plus, Trash2,
  Menu, Sparkles, Search, X, Smartphone, BookOpen, Download,
  Info, Settings2, ChevronDown, ChevronRight, LayoutDashboard, Crown, Shield,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeId?: number;
  isMobile?: boolean;
  onClose?: () => void;
}

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
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
  );
}

const MODE_ICON: Record<string, React.ReactNode> = {
  code: <Code2 size={12} />,
  image: <ImageIcon size={12} />,
  chat: <MessageSquare size={12} />,
  flutter: <Smartphone size={12} />,
};

const MODE_COLOR: Record<string, string> = {
  code: "rgba(52,211,153,0.7)",
  image: "rgba(168,85,247,0.7)",
  chat: "rgba(0,208,255,0.7)",
  flutter: "rgba(84,197,248,0.7)",
};

function groupConversations(convs: { id: number; title: string; mode: string; createdAt?: string | Date | null }[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const week = new Date(today.getTime() - 6 * 86400000);

  const groups: Record<string, typeof convs> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    Earlier: [],
  };

  for (const c of convs) {
    const d = c.createdAt ? new Date(c.createdAt) : new Date(0);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today) groups["Today"].push(c);
    else if (day >= yesterday) groups["Yesterday"].push(c);
    else if (day >= week) groups["Last 7 Days"].push(c);
    else groups["Earlier"].push(c);
  }

  return groups;
}

export function ChatSidebar({ isOpen, onToggle, activeId, isMobile = false, onClose }: ChatSidebarProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: conversations, isLoading } = useListOpenaiConversations();
  const { user } = useUser();
  const { signOut } = useClerk();
  const createConversation = useCreateOpenaiConversation();
  const deleteConversation = useDeleteOpenaiConversation();
  const { role, plan, canUse } = usePermissions();

  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleNewChat = () => {
    createConversation.mutate(
      { data: { title: "New Conversation", mode: "chat", model: "gpt-5.2" } },
      {
        onSuccess: (conv) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          setLocation(`/chat/${conv.id}`);
          onClose?.();
        },
      }
    );
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          if (activeId === id) setLocation("/chat");
        },
      }
    );
  };

  const filtered = useMemo(() => {
    if (!conversations) return [];
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title?.toLowerCase().includes(q) || c.mode?.toLowerCase().includes(q));
  }, [conversations, search]);

  const grouped = useMemo(() => groupConversations(filtered as any), [filtered]);

  const toggleGroup = (g: string) => setCollapsedGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const MOBILE_W = 256;
  const mobileStyle: React.CSSProperties = isMobile
    ? { position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50, width: MOBILE_W }
    : {};

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={isMobile ? { x: -MOBILE_W, opacity: 0 } : { width: 0, opacity: 0 }}
          animate={isMobile ? { x: 0, opacity: 1 } : { width: 256, opacity: 1 }}
          exit={isMobile ? { x: -MOBILE_W, opacity: 0 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="h-full flex flex-col overflow-hidden shrink-0"
          style={{ backgroundColor: "var(--sb-card)", borderRight: "1px solid rgba(255,255,255,0.07)", ...mobileStyle }}
        >
          {/* ── Logo header ── */}
          <div
            className="p-3.5 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <LogoMark size={26} />
              <div className="flex flex-col">
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
                <span
                  className="text-[9px] font-mono leading-tight"
                  style={{ color: "rgba(0,208,255,0.5)", letterSpacing: "0.08em" }}
                >
                  v2.0
                </span>
              </div>
            </Link>
            {isMobile && (
              <button
                onClick={onClose ?? onToggle}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--sb-accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* ── New Chat button ── */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNewChat}
              disabled={createConversation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              style={{
                background: "var(--sb-gradient)",
                color: "#121212",
                boxShadow: "0 0 18px rgba(0,208,255,0.22)",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 28px rgba(0,208,255,0.48)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 18px rgba(0,208,255,0.22)"; }}
            >
              <Plus size={14} />
              <span>New Chat</span>
            </motion.button>
          </div>

          {/* ── Search ── */}
          <div className="px-3 pb-2 shrink-0">
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Search size={12} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="flex-1 bg-transparent border-0 outline-none text-xs min-w-0"
                style={{ color: "rgba(255,255,255,0.7)", caretColor: "var(--sb-accent)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* ── Conversations list ── */}
          <ScrollArea className="flex-1 px-2 min-h-0">
            <div className="py-1 pb-4">
              {isLoading ? (
                <div className="space-y-1.5 px-2 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <Sparkles size={18} className="mx-auto mb-2" style={{ color: "rgba(0,208,255,0.3)" }} />
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
                    {search ? "No results found" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => {
                  if (items.length === 0) return null;
                  const collapsed = !!collapsedGroups[group];
                  return (
                    <div key={group} className="mb-1">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                      >
                        {collapsed
                          ? <ChevronRight size={11} />
                          : <ChevronDown size={11} />}
                        <span className="text-[10px] uppercase tracking-widest font-semibold">{group}</span>
                        <span
                          className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}
                        >
                          {items.length}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-0.5">
                              {items.map((conv) => {
                                const isActive = activeId === conv.id;
                                const modeColor = MODE_COLOR[conv.mode] ?? MODE_COLOR.chat;
                                return (
                                  <Link key={conv.id} href={`/chat/${conv.id}`} onClick={onClose}>
                                    <div
                                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all group cursor-pointer"
                                      style={{
                                        backgroundColor: isActive ? "rgba(0,208,255,0.08)" : "transparent",
                                        color: isActive ? "var(--sb-accent-light)" : "rgba(255,255,255,0.45)",
                                        borderLeft: isActive ? `2px solid var(--sb-accent)` : "2px solid transparent",
                                      }}
                                      onMouseEnter={e => {
                                        if (!isActive) {
                                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                                          e.currentTarget.style.color = "rgba(255,255,255,0.72)";
                                        }
                                      }}
                                      onMouseLeave={e => {
                                        if (!isActive) {
                                          e.currentTarget.style.backgroundColor = "transparent";
                                          e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                                        }
                                      }}
                                    >
                                      <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                          background: isActive ? "rgba(0,208,255,0.15)" : "rgba(255,255,255,0.05)",
                                          color: isActive ? "var(--sb-accent)" : modeColor,
                                        }}
                                      >
                                        {MODE_ICON[conv.mode] ?? <MessageSquare size={12} />}
                                      </div>
                                      <div className="flex-1 truncate font-medium leading-tight">
                                        {conv.title || "New Conversation"}
                                      </div>
                                      <button
                                        onClick={(e) => handleDelete(e, conv.id)}
                                        disabled={deleteConversation.isPending && deleteConversation.variables?.id === conv.id}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0"
                                        style={{ color: "rgba(255,255,255,0.25)" }}
                                        onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* ── Quick nav ── */}
          <div className="px-2 py-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-1 flex-wrap">
              {(
                [
                  { href: "/settings", icon: Settings2, label: "Settings", always: true },
                  { href: "/pricing", icon: Crown, label: "Pricing", always: true },
                  { href: "/prompts", icon: BookOpen, label: "Prompts", always: true },
                  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", always: false, show: canUse("dashboard") },
                  { href: "/admin", icon: Shield, label: "Admin", always: false, show: canUse("admin") },
                  { href: "/about", icon: Info, label: "About", always: true },
                ] as const
              )
                .filter((item) => item.always || item.show)
                .map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={onClose}>
                    <div
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                      style={{ color: label === "Admin" ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.28)" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = label === "Admin" ? "#ef4444" : "rgba(255,255,255,0.65)";
                        e.currentTarget.style.background = label === "Admin" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = label === "Admin" ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.28)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline font-medium">{label}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* ── User profile footer ── */}
          <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #00d0ff, #00a3cc)", color: "#121212" }}
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "User"}
                  </div>
                  {role !== "user" && (
                    <span
                      className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide"
                      style={{
                        background: role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: role === "admin" ? "#ef4444" : "#f59e0b",
                        border: `1px solid ${role === "admin" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                      }}
                    >
                      {role}
                    </span>
                  )}
                  {plan !== "free" && (
                    <span
                      className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide"
                      style={{
                        background: plan === "enterprise" ? "rgba(168,85,247,0.15)" : "rgba(0,208,255,0.12)",
                        color: plan === "enterprise" ? "#a855f7" : "#00d0ff",
                        border: `1px solid ${plan === "enterprise" ? "rgba(168,85,247,0.3)" : "rgba(0,208,255,0.25)"}`,
                      }}
                    >
                      {plan}
                    </span>
                  )}
                </div>
                <div className="text-[10px] truncate leading-tight" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {user?.emailAddresses?.[0]?.emailAddress ?? ""}
                </div>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                title="Sign out"
                className="p-1.5 rounded-lg transition-all shrink-0 opacity-0 group-hover:opacity-100"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

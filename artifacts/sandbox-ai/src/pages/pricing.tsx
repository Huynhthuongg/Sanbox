import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, X, Zap, Crown, Building2, ArrowRight,
  Bot, MessageSquare, Code2, BarChart2,
  ChevronDown, ChevronUp,
  Star, Users, Lock, Sparkles, BadgeCheck, Infinity,
  Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import { useUser } from "@clerk/react";

const BB = {
  bg: "#050507",
  card: "#0c0c14",
  card2: "#0f0f18",
  border: "rgba(255,255,255,0.07)",
  accent: "#00d0ff",
  green: "#34d399",
  yellow: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  muted: "rgba(255,255,255,0.38)",
  muted2: "rgba(255,255,255,0.18)",
};

interface Plan {
  id: string;
  icon: typeof Zap;
  label: string;
  badge?: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  color: string;
  desc: string;
  cta: string;
  ctaHref: string;
  featured: boolean;
  features: string[];
  missing: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    icon: Zap,
    label: "Starter",
    priceMonthly: 0,
    priceAnnual: 0,
    color: BB.green,
    desc: "Khởi đầu miễn phí, không cần thẻ tín dụng.",
    cta: "Bắt đầu miễn phí",
    ctaHref: "/sign-up",
    featured: false,
    features: [
      "50 messages / ngày",
      "GPT-5.2 (giới hạn)",
      "Chat mode & Code mode",
      "30 hội thoại lưu trữ",
      "Export Markdown",
      "1 System prompt tùy chỉnh",
    ],
    missing: [
      "Agent mode tự động hóa",
      "Sas Analytics dashboard",
      "Vector Memory (RAG)",
      "Multi-model routing",
      "One-Click Deploy",
      "API access",
    ],
  },
  {
    id: "pro",
    icon: Crown,
    label: "Pro",
    badge: "PHỔ BIẾN NHẤT",
    priceMonthly: 19,
    priceAnnual: 14,
    color: BB.accent,
    desc: "Full power cho developer, creator và indie hacker.",
    cta: "Nâng cấp lên Pro",
    ctaHref: "/sign-up",
    featured: true,
    features: [
      "Không giới hạn messages",
      "GPT-5.2 đầy đủ · Gemini 2.0 · Claude 3.7",
      "Agent · Chat · Vscode · Sas (4 modes)",
      "Vector Memory (RAG) dài hạn",
      "Self-Mutation Engine",
      "One-Click Deploy (Vercel)",
      "Web Research Agent (Serper)",
      "Lịch sử không giới hạn",
      "Export PDF / Markdown",
      "API access (5,000 req/ngày)",
      "Priority response & support",
    ],
    missing: [],
  },
  {
    id: "enterprise",
    icon: Building2,
    label: "Enterprise",
    priceMonthly: null,
    priceAnnual: null,
    color: BB.purple,
    desc: "Cho team & doanh nghiệp. Custom SLA & billing.",
    cta: "Liên hệ Sales",
    ctaHref: "mailto:Admin@huynhthuong.online",
    featured: false,
    features: [
      "Tất cả tính năng Pro",
      "Thành viên không giới hạn",
      "Shared team workspaces",
      "Custom model fine-tuning",
      "SSO / SAML / LDAP",
      "Audit logs & compliance",
      "Dedicated account manager",
      "API không giới hạn",
      "On-premise deployment",
      "SLA 99.99% uptime",
      "Custom AI personas",
    ],
    missing: [],
  },
];

const COMPARE_ROWS = [
  { feature: "Messages / ngày", free: "50", pro: "Không giới hạn", ent: "Không giới hạn", category: "Cơ bản" },
  { feature: "AI Models", free: "GPT-5.2 (giới hạn)", pro: "GPT-5.2 · Gemini · Claude", ent: "Custom + Fine-tune", category: "Cơ bản" },
  { feature: "Chat mode", free: true, pro: true, ent: true, category: "Modes" },
  { feature: "Vscode mode", free: true, pro: true, ent: true, category: "Modes" },
  { feature: "Agent mode", free: false, pro: true, ent: true, category: "Modes" },
  { feature: "Sas Analytics", free: false, pro: true, ent: true, category: "Modes" },
  { feature: "Vector Memory (RAG)", free: false, pro: true, ent: true, category: "AI Engine" },
  { feature: "Self-Mutation Engine", free: false, pro: true, ent: true, category: "AI Engine" },
  { feature: "One-Click Deploy", free: false, pro: true, ent: true, category: "AI Engine" },
  { feature: "Web Research Agent", free: false, pro: true, ent: true, category: "AI Engine" },
  { feature: "System prompts", free: "1", pro: "Không giới hạn", ent: "Không giới hạn", category: "Cài đặt" },
  { feature: "Lịch sử chat", free: "30", pro: "Không giới hạn", ent: "Không giới hạn", category: "Cài đặt" },
  { feature: "API access", free: false, pro: "5,000 req/ngày", ent: "Không giới hạn", category: "API" },
  { feature: "Team workspace", free: false, pro: false, ent: true, category: "Team" },
  { feature: "SSO / SAML", free: false, pro: false, ent: true, category: "Team" },
  { feature: "Audit logs", free: false, pro: false, ent: true, category: "Team" },
  { feature: "SLA", free: "—", pro: "99.9%", ent: "99.99%", category: "Bảo mật" },
];

const FAQ_ITEMS = [
  {
    q: "Có thể hủy bất cứ lúc nào không?",
    a: "Hoàn toàn có. Bạn hủy từ Settings → Billing bất cứ lúc nào. Quyền truy cập Pro vẫn giữ đến hết chu kỳ đã thanh toán.",
  },
  {
    q: "Gói Năm tiết kiệm bao nhiêu?",
    a: "Gói Pro Năm là $14/tháng thay vì $19/tháng — tiết kiệm 26% (~$60/năm). Thanh toán một lần hàng năm.",
  },
  {
    q: "Vector Memory và RAG hoạt động thế nào?",
    a: "Sandbox AI lưu toàn bộ ngữ cảnh dự án của bạn vào Supabase pgvector. Khi bạn hỏi, hệ thống tra cứu ngữ nghĩa tương đồng để đưa ra câu trả lời chính xác nhất — không bao giờ quên context.",
  },
  {
    q: "One-Click Deploy hoạt động thế nào?",
    a: "Sandbox AI kết nối với GitHub API và Vercel Deployments API. Sau khi AI hoàn thành code, nó tự commit lên GitHub và trigger build trên Vercel. Bạn nhận được URL thật và trạng thái Live.",
  },
  {
    q: "Multi-model routing là gì?",
    a: "Hệ thống tự động chọn model tối ưu (GPT-5.2, Gemini 2.0, Claude 3.7) dựa trên loại tác vụ và chi phí, giúp tối ưu hóa cả chất lượng lẫn tốc độ.",
  },
  {
    q: "API access dùng để làm gì?",
    a: "Bạn có thể gọi Sandbox AI API từ ứng dụng của mình — gửi prompt và nhận phản hồi AI, tích hợp vào workflow tự động, hoặc xây dựng extension.",
  },
];

const MODES_PREVIEW = [
  { icon: Bot,          label: "Agent",  color: "#a855f7", desc: "Autonomous · Self-mutation · Deploy" },
  { icon: MessageSquare, label: "Chat",  color: "#00d0ff", desc: "Deep reasoning · Vector Memory" },
  { icon: Code2,        label: "Vscode", color: "#34d399", desc: "GPT-5.3 Codex · Security review" },
  { icon: BarChart2,    label: "Sas",    color: "#f59e0b", desc: "Analytics · Dashboard · Forecast" },
];

function CellValue({ val, planColor }: { val: boolean | string; planColor: string }) {
  if (val === true) return <Check size={14} style={{ color: planColor }} />;
  if (val === false) return <X size={12} style={{ color: "rgba(255,255,255,0.15)" }} />;
  if (val === "—") return <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>;
  return <span style={{ color: planColor === BB.green ? BB.green : planColor === BB.accent ? BB.accent : BB.purple }}>{val}</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all"
      style={{ background: BB.card, border: `1px solid ${open ? "rgba(0,208,255,0.2)" : BB.border}` }}
      onClick={() => setOpen(v => !v)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        {open ? <ChevronUp size={15} style={{ color: BB.accent, flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: BB.muted }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

async function createCheckoutSession(plan: "pro_monthly" | "pro_annual", userId?: string, userEmail?: string) {
  const res = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, userId, userEmail }),
  });
  if (!res.ok) throw new Error("Failed to create checkout session");
  return res.json() as Promise<{ url: string; sessionId: string }>;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [, navigate] = useLocation();
  const { user } = useUser();

  // Show toast on return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "success") {
      setToast({ type: "success", msg: "Thanh toán thành công! Tài khoản Pro đã được kích hoạt." });
      navigate("/pricing", { replace: true });
    } else if (params.get("upgrade") === "cancelled") {
      setToast({ type: "error", msg: "Thanh toán bị huỷ. Bạn có thể thử lại bất cứ lúc nào." });
      navigate("/pricing", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCheckout = async (plan: "pro_monthly" | "pro_annual") => {
    setCheckoutLoading(true);
    try {
      const { url } = await createCheckoutSession(
        plan,
        user?.id,
        user?.primaryEmailAddress?.emailAddress,
      );
      if (url) window.location.href = url;
    } catch {
      setToast({ type: "error", msg: "Không thể kết nối Stripe. Vui lòng thử lại." });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-5 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold shadow-2xl"
            style={{
              transform: "translateX(-50%)",
              background: toast.type === "success" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.35)" : "rgba(239,68,68,0.35)"}`,
              color: toast.type === "success" ? BB.green : BB.red,
              backdropFilter: "blur(12px)",
              whiteSpace: "nowrap",
            }}
          >
            {toast.type === "success"
              ? <CheckCircle size={16} />
              : <AlertCircle size={16} />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #00d0ff, transparent)", filter: "blur(80px)" }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
          style={{ background: `${BB.bg}ec`, backdropFilter: "blur(16px)", borderBottom: `1px solid ${BB.border}` }}>
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <button className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: BB.muted }}
                onMouseEnter={e => e.currentTarget.style.color = BB.accent}
                onMouseLeave={e => e.currentTarget.style.color = BB.muted}>
                <ArrowLeft size={14} /> Quay lại
              </button>
            </Link>
            <div className="h-4 w-px" style={{ background: BB.border }} />
            <div className="flex items-center gap-2">
              <Crown size={14} style={{ color: BB.accent }} />
              <span className="text-sm font-black text-white">Nâng cấp gói</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: BB.muted2 }}>
            <Lock size={11} />
            <span>Bảo mật thanh toán SSL</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 pb-28">

          {/* ── Hero ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: `${BB.accent}10`, color: BB.accent, border: `1px solid ${BB.accent}22` }}>
              <Zap size={10} /> Đơn giản · Minh bạch · Không ẩn phí
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              Chọn gói phù hợp{" "}
              <span style={{ background: "linear-gradient(135deg, #00d0ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                với bạn
              </span>
            </h1>
            <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: BB.muted }}>
              Bắt đầu miễn phí, nâng cấp khi cần. Tất cả gói đều có thể hủy bất cứ lúc nào.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 rounded-2xl px-4 py-2" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
              <span className="text-xs font-semibold" style={{ color: !annual ? "white" : BB.muted }}>Tháng</span>
              <button
                onClick={() => setAnnual(v => !v)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ background: annual ? BB.accent : "rgba(255,255,255,0.1)" }}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  animate={{ left: annual ? 24 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              </button>
              <span className="text-xs font-semibold" style={{ color: annual ? "white" : BB.muted }}>
                Năm
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                style={{ background: `${BB.green}18`, color: BB.green, border: `1px solid ${BB.green}30` }}>
                -26%
              </span>
            </div>
          </motion.div>

          {/* ── Plan Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const price = annual ? plan.priceAnnual : plan.priceMonthly;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
                  style={{
                    background: plan.featured
                      ? `linear-gradient(155deg, rgba(0,208,255,0.06) 0%, #0d1520 50%, #0c0c14 100%)`
                      : BB.card,
                    border: plan.featured ? `1px solid rgba(0,208,255,0.3)` : `1px solid ${BB.border}`,
                    boxShadow: plan.featured ? `0 0 60px rgba(0,208,255,0.07), inset 0 1px 0 rgba(0,208,255,0.12)` : "none",
                  }}
                >
                  {/* Glow strip for featured */}
                  {plan.featured && (
                    <div className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(0,208,255,0.6), transparent)" }} />
                  )}

                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider"
                      style={{ background: `linear-gradient(135deg, ${BB.accent}, #38bdf8)`, color: "#050507" }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}28` }}>
                    <Icon size={20} style={{ color: plan.color }} strokeWidth={1.8} />
                  </div>

                  {/* Label + desc */}
                  <div className="text-[11px] font-bold mb-1 uppercase tracking-widest" style={{ color: plan.color }}>{plan.label}</div>
                  <p className="text-xs mb-5" style={{ color: BB.muted }}>{plan.desc}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {price === null ? (
                      <div className="text-3xl font-black text-white">Liên hệ</div>
                    ) : price === 0 ? (
                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-black text-white leading-none">$0</span>
                        <span className="text-xs mb-1" style={{ color: BB.muted }}>mãi mãi</span>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1.5">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={annual ? "annual" : "monthly"}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18 }}
                            className="text-4xl font-black text-white leading-none"
                          >
                            ${price}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-xs mb-1" style={{ color: BB.muted }}>/tháng</span>
                      </div>
                    )}
                    {annual && price !== null && price > 0 && (
                      <div className="text-[11px] mt-1" style={{ color: BB.green }}>
                        Thanh toán ${(price * 12)} / năm · tiết kiệm ${((plan.priceMonthly ?? 0) - price) * 12}
                      </div>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${plan.color}18` }}>
                          <Check size={9} style={{ color: plan.color }} />
                        </div>
                        <span className="text-xs text-white leading-tight">{f}</span>
                      </div>
                    ))}
                    {plan.missing.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 opacity-25">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "rgba(255,255,255,0.06)" }}>
                          <X size={9} style={{ color: BB.muted }} />
                        </div>
                        <span className="text-xs leading-tight" style={{ color: BB.muted }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {plan.id === "pro" ? (
                    <motion.button
                      whileHover={{ scale: checkoutLoading ? 1 : 1.02 }}
                      whileTap={{ scale: checkoutLoading ? 1 : 0.97 }}
                      onClick={() => handleCheckout(annual ? "pro_annual" : "pro_monthly")}
                      disabled={checkoutLoading}
                      className="w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                      style={{ background: `linear-gradient(135deg, #00d0ff, #0ea5e9)`, color: "#050507", boxShadow: "0 4px 20px rgba(0,208,255,0.35)", opacity: checkoutLoading ? 0.8 : 1 }}
                    >
                      {checkoutLoading ? (
                        <><Loader2 size={14} className="animate-spin" /> Đang chuyển hướng...</>
                      ) : (
                        <>{plan.cta} <ArrowRight size={14} /></>
                      )}
                    </motion.button>
                  ) : plan.id === "enterprise" ? (
                    <div className="space-y-2">
                      <a href={plan.ctaHref}>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                          style={{ background: `${plan.color}12`, color: plan.color, border: `1px solid ${plan.color}28` }}
                        >
                          {plan.cta} <ArrowRight size={14} />
                        </motion.button>
                      </a>
                      <a href="https://www.facebook.com/share/1CTzTTYNh4/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                          style={{ background: "rgba(24,119,242,0.1)", color: "#1877f2", border: "1px solid rgba(24,119,242,0.25)" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </motion.button>
                      </a>
                    </div>
                  ) : (
                    <Link href={plan.ctaHref}>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                        style={{ background: `${plan.color}12`, color: plan.color, border: `1px solid ${plan.color}28` }}
                      >
                        {plan.cta} <ArrowRight size={14} />
                      </motion.button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── Modes included in Pro ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5 mb-10"
            style={{ background: "rgba(0,208,255,0.04)", border: "1px solid rgba(0,208,255,0.12)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} style={{ color: BB.accent }} />
              <span className="text-xs font-bold text-white">Gói Pro bao gồm 4 AI Modes</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MODES_PREVIEW.map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={15} style={{ color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{label}</div>
                    <div className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Trust signals ── */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-12">
            {[
              { icon: BadgeCheck, text: "Thanh toán bảo mật SSL" },
              { icon: Lock,       text: "Hủy bất cứ lúc nào" },
              { icon: Star,       text: "4.9/5 đánh giá từ dev" },
              { icon: Users,      text: "12,000+ developers" },
              { icon: Infinity,   text: "Uptime 99.9%" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: BB.muted }}>
                <Icon size={12} style={{ color: BB.muted2 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* ── Feature comparison table ── */}
          <div className="mb-14">
            <button
              onClick={() => setCompareOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all mb-2"
              style={{ background: BB.card, border: `1px solid ${compareOpen ? "rgba(0,208,255,0.2)" : BB.border}` }}
            >
              <span className="text-sm font-black text-white">So sánh đầy đủ tính năng</span>
              {compareOpen ? <ChevronUp size={16} style={{ color: BB.accent }} /> : <ChevronDown size={16} style={{ color: BB.muted }} />}
            </button>

            <AnimatePresence>
              {compareOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl"
                  style={{ border: `1px solid ${BB.border}` }}
                >
                  {/* Table header */}
                  <div className="grid grid-cols-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: BB.card, borderBottom: `1px solid ${BB.border}` }}>
                    <span style={{ color: BB.muted }}>Tính năng</span>
                    <span className="text-center" style={{ color: BB.green }}>Starter</span>
                    <span className="text-center" style={{ color: BB.accent }}>Pro</span>
                    <span className="text-center" style={{ color: BB.purple }}>Enterprise</span>
                  </div>

                  {/* Group rows */}
                  {(() => {
                    const categories = Array.from(new Set(COMPARE_ROWS.map(r => r.category)));
                    return categories.map(cat => (
                      <div key={cat}>
                        <div className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                          style={{ background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.2)", borderBottom: `1px solid ${BB.border}` }}>
                          {cat}
                        </div>
                        {COMPARE_ROWS.filter(r => r.category === cat).map((row, i) => (
                          <div key={row.feature}
                            className="grid grid-cols-4 items-center px-5 py-2.5 text-xs"
                            style={{
                              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                              borderBottom: `1px solid ${BB.border}`,
                            }}
                          >
                            <span className="text-white">{row.feature}</span>
                            <span className="flex justify-center"><CellValue val={row.free} planColor={BB.green} /></span>
                            <span className="flex justify-center"><CellValue val={row.pro} planColor={BB.accent} /></span>
                            <span className="flex justify-center"><CellValue val={row.ent} planColor={BB.purple} /></span>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}

                  {/* Table footer CTA */}
                  <div className="grid grid-cols-4 px-5 py-3 gap-2"
                    style={{ background: BB.card, borderTop: `1px solid ${BB.border}` }}>
                    <span />
                    <div className="flex justify-center">
                      <Link href="/sign-up">
                        <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          style={{ background: `${BB.green}12`, color: BB.green, border: `1px solid ${BB.green}25` }}>
                          Miễn phí
                        </button>
                      </Link>
                    </div>
                    <div className="flex justify-center">
                      <Link href="/sign-up">
                        <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                          style={{ background: `linear-gradient(135deg, ${BB.accent}, #0ea5e9)`, color: "#050507" }}>
                          Nâng cấp
                        </button>
                      </Link>
                    </div>
                    <div className="flex justify-center">
                      <a href="mailto:Admin@huynhthuong.online">
                        <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          style={{ background: `${BB.purple}12`, color: BB.purple, border: `1px solid ${BB.purple}25` }}>
                          Liên hệ
                        </button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FAQ ── */}
          <div className="mb-14">
            <h2 className="text-2xl font-black text-white text-center mb-2">Câu hỏi thường gặp</h2>
            <p className="text-sm text-center mb-8" style={{ color: BB.muted }}>
              Không tìm thấy câu trả lời?{" "}
              <a href="mailto:Admin@huynhthuong.online" style={{ color: BB.accent }}>Email chúng tôi</a>
              {" · "}
              <a href="https://www.facebook.com/share/1CTzTTYNh4/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2" }}>Facebook</a>
            </p>
            <div className="space-y-2 max-w-2xl mx-auto">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative text-center rounded-3xl p-10 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(0,208,255,0.07), rgba(168,85,247,0.07))`,
              border: `1px solid rgba(0,208,255,0.15)`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center top, rgba(0,208,255,0.05), transparent 60%)" }} />
            <Crown size={28} style={{ color: BB.accent, margin: "0 auto 12px" }} />
            <h2 className="text-2xl font-black text-white mb-2">Sẵn sàng nâng cấp?</h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: BB.muted }}>
              Truy cập đầy đủ 4 AI modes, Vector Memory, One-Click Deploy và hơn thế nữa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: checkoutLoading ? 1 : 1.03 }}
                whileTap={{ scale: checkoutLoading ? 1 : 0.97 }}
                onClick={() => handleCheckout(annual ? "pro_annual" : "pro_monthly")}
                disabled={checkoutLoading}
                className="px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #00d0ff, #0ea5e9)", color: "#050507", boxShadow: "0 4px 24px rgba(0,208,255,0.35)", opacity: checkoutLoading ? 0.8 : 1 }}
              >
                {checkoutLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Đang chuyển hướng...</>
                  : <><Crown size={15} /> Nâng cấp Pro {annual ? `· $14` : `· $19`}/tháng</>
                }
              </motion.button>
              <Link href="/chat">
                <button className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all" style={{ color: BB.muted }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = BB.muted}>
                  Dùng thử miễn phí →
                </button>
              </Link>
            </div>
            <p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.2)" }}>
              Không cần thẻ tín dụng · Hủy bất cứ lúc nào · Bảo mật SSL
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

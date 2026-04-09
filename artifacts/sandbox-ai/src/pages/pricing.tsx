import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Zap, Crown, Building2, ArrowRight, Sparkles } from "lucide-react";

const BB = {
  bg: "#050507",
  card: "#0c0c14",
  border: "rgba(255,255,255,0.07)",
  accent: "#00d0ff",
  green: "#34d399",
  yellow: "#f59e0b",
  purple: "#a855f7",
  muted: "rgba(255,255,255,0.38)",
};

const PLANS = [
  {
    id: "free",
    icon: Zap,
    label: "Free",
    price: "0",
    period: "/ tháng",
    color: BB.green,
    desc: "Bắt đầu miễn phí, không cần thẻ.",
    cta: "Bắt đầu miễn phí",
    ctaHref: "/sign-up",
    featured: false,
    features: [
      "50 messages / ngày",
      "GPT-4o mini",
      "Chat & Code mode",
      "Lịch sử 30 hội thoại",
      "Export markdown",
      "1 Custom system prompt",
    ],
    missing: [
      "Image generation",
      "Flutter mode",
      "Priority support",
      "API access",
    ],
  },
  {
    id: "pro",
    icon: Crown,
    label: "Pro",
    price: "12",
    period: "/ tháng",
    color: BB.accent,
    desc: "Dành cho developer & creator cần full power.",
    cta: "Nâng cấp Pro",
    ctaHref: "/sign-up",
    featured: true,
    features: [
      "Không giới hạn messages",
      "GPT-4o, o3, o4-mini",
      "Chat · Code · Image · Flutter",
      "Lịch sử không giới hạn",
      "Export PDF / Markdown",
      "Unlimited system prompts",
      "Image generation (gpt-image-1)",
      "Flutter code export",
      "Priority response",
      "API access (1,000 req/day)",
    ],
    missing: [],
  },
  {
    id: "enterprise",
    icon: Building2,
    label: "Enterprise",
    price: "Liên hệ",
    period: "",
    color: BB.purple,
    desc: "Cho team & doanh nghiệp. Custom SLA & billing.",
    cta: "Liên hệ Sales",
    ctaHref: "mailto:hi@sandbox-ai.app",
    featured: false,
    features: [
      "Tất cả tính năng Pro",
      "Unlimited members",
      "Shared team workspaces",
      "Custom model fine-tuning",
      "SSO / SAML",
      "Audit logs",
      "Dedicated support",
      "API không giới hạn",
      "On-premise option",
      "SLA 99.99%",
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "Tôi có thể hủy bất cứ lúc nào không?",
    a: "Có. Bạn có thể hủy subscription bất cứ lúc nào từ Settings → Billing. Bạn vẫn có thể dùng Pro đến hết chu kỳ đã thanh toán.",
  },
  {
    q: "Có giới hạn token không?",
    a: "Gói Pro không giới hạn messages nhưng mỗi request vẫn có max tokens theo model (ví dụ GPT-4o: 128k context). Gói Free giới hạn 50 messages/ngày.",
  },
  {
    q: "Image generation dùng model nào?",
    a: "Sandbox AI dùng gpt-image-1 (GPT-Image) — model mới nhất của OpenAI với độ chính xác cao, hỗ trợ inpainting và editing.",
  },
  {
    q: "Flutter mode xuất code như thế nào?",
    a: "Flutter mode sinh Dart/Flutter code hoàn chỉnh theo mô tả UI của bạn, bao gồm widget tree, state management (Riverpod/Bloc), và responsive layout. Bạn có thể copy hoặc export file .dart.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BB.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: `${BB.bg}e8`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${BB.border}` }}>
        <Link href="/">
          <button className="p-2 rounded-xl" style={{ color: BB.muted }}><ArrowLeft size={16} /></button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: BB.accent }} />
          <span className="text-[14px] font-black text-white">Pricing</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 pb-24">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-6"
            style={{ background: `${BB.accent}12`, color: BB.accent, border: `1px solid ${BB.accent}25` }}>
            <Zap size={11} /> Đơn giản · Minh bạch · Không ẩn phí
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Chọn gói phù hợp<br />
            <span style={{ color: BB.accent }}>với bạn</span>
          </h1>
          <p className="text-[15px] max-w-lg mx-auto" style={{ color: BB.muted }}>
            Bắt đầu miễn phí, nâng cấp khi cần. Không ràng buộc, không ẩn phí.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
                style={{
                  background: plan.featured ? `linear-gradient(145deg, #0d1a20, #0c0c14)` : BB.card,
                  border: `1px solid ${plan.featured ? BB.accent + "40" : BB.border}`,
                  boxShadow: plan.featured ? `0 0 40px rgba(0,208,255,0.08)` : "none",
                }}
              >
                {plan.featured && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider"
                    style={{ background: BB.accent, color: "#050507" }}>
                    POPULAR
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}25` }}>
                  <Icon size={18} style={{ color: plan.color }} />
                </div>

                <p className="text-[13px] font-bold mb-1" style={{ color: plan.color }}>{plan.label}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white leading-none">
                    {plan.price === "Liên hệ" ? "" : "$"}{plan.price}
                  </span>
                  {plan.price === "Liên hệ" ? (
                    <span className="text-2xl font-black text-white leading-none">Liên hệ</span>
                  ) : (
                    <span className="text-[13px] mb-1" style={{ color: BB.muted }}>{plan.period}</span>
                  )}
                </div>
                <p className="text-[12px] mb-5" style={{ color: BB.muted }}>{plan.desc}</p>

                <div className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={13} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span className="text-[12px] text-white">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-30">
                      <div className="w-3 h-0.5 mt-2 rounded-full shrink-0" style={{ background: BB.muted }} />
                      <span className="text-[12px]" style={{ color: BB.muted }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href={plan.ctaHref}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                    style={plan.featured
                      ? { background: BB.accent, color: "#050507" }
                      : { background: `${plan.color}12`, color: plan.color, border: `1px solid ${plan.color}25` }}
                  >
                    {plan.cta}
                    <ArrowRight size={13} />
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div className="rounded-2xl overflow-hidden mb-16" style={{ border: `1px solid ${BB.border}` }}>
          <div className="px-6 py-4" style={{ background: BB.card, borderBottom: `1px solid ${BB.border}` }}>
            <p className="text-[14px] font-black text-white">So sánh tính năng</p>
          </div>
          {[
            { feature: "Messages / ngày", free: "50", pro: "Không giới hạn", ent: "Không giới hạn" },
            { feature: "Models", free: "GPT-4o mini", pro: "GPT-4o, o3, o4-mini", ent: "Custom + Fine-tune" },
            { feature: "Chat mode", free: "✓", pro: "✓", ent: "✓" },
            { feature: "Code mode", free: "✓", pro: "✓", ent: "✓" },
            { feature: "Image generation", free: "—", pro: "✓", ent: "✓" },
            { feature: "Flutter mode", free: "—", pro: "✓", ent: "✓" },
            { feature: "System prompt", free: "1", pro: "Không giới hạn", ent: "Không giới hạn" },
            { feature: "Lịch sử chat", free: "30 hội thoại", pro: "Không giới hạn", ent: "Không giới hạn" },
            { feature: "API access", free: "—", pro: "1,000 req/day", ent: "Không giới hạn" },
            { feature: "Team workspace", free: "—", pro: "—", ent: "✓" },
            { feature: "SSO / SAML", free: "—", pro: "—", ent: "✓" },
            { feature: "SLA", free: "—", pro: "99.9%", ent: "99.99%" },
          ].map(({ feature, free, pro, ent }, i) => (
            <div key={feature} className="grid grid-cols-4 px-6 py-3 text-[12px]"
              style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: `1px solid ${BB.border}` }}>
              <span className="text-white col-span-1">{feature}</span>
              <span className="text-center" style={{ color: free === "—" ? "rgba(255,255,255,0.18)" : BB.green }}>{free}</span>
              <span className="text-center" style={{ color: pro === "—" ? "rgba(255,255,255,0.18)" : BB.accent }}>{pro}</span>
              <span className="text-center" style={{ color: ent === "—" ? "rgba(255,255,255,0.18)" : BB.purple }}>{ent}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 px-6 py-2" style={{ background: BB.card, borderTop: `1px solid ${BB.border}` }}>
            <span className="text-[11px]" style={{ color: BB.muted }}>Tính năng</span>
            {["Free", "Pro", "Enterprise"].map((l, i) => (
              <span key={l} className="text-center text-[11px] font-bold"
                style={{ color: [BB.green, BB.accent, BB.purple][i] }}>{l}</span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6 text-center">Câu hỏi thường gặp</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQ.map(({ q, a }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl p-5" style={{ background: BB.card, border: `1px solid ${BB.border}` }}>
                <p className="text-[13px] font-bold text-white mb-2">{q}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: BB.muted }}>{a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-16 text-center rounded-2xl p-8"
          style={{ background: `linear-gradient(135deg, rgba(0,208,255,0.06), rgba(168,85,247,0.06))`, border: `1px solid rgba(0,208,255,0.12)` }}>
          <p className="text-xl font-black text-white mb-2">Sẵn sàng chưa?</p>
          <p className="text-[13px] mb-6" style={{ color: BB.muted }}>Bắt đầu miễn phí ngay hôm nay. Nâng cấp bất cứ lúc nào.</p>
          <Link href="/sign-up">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl text-[14px] font-black"
              style={{ background: BB.accent, color: "#050507" }}>
              Bắt đầu miễn phí →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

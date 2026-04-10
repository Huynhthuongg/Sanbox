import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Code2, MessageSquare, ImageIcon, Zap, Users, Star,
  Globe, Smartphone, Shield, Cpu, ChevronRight, Check,
  Copy, CheckCheck, Terminal, Package, Settings2, Rocket, GitBranch,
} from "lucide-react";

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 6, overflow: "hidden", flexShrink: 0,
        filter: "drop-shadow(0 0 10px rgba(0,208,255,0.55))",
      }}
    >
      <img src="/icons/icon-512.png" alt="Sandbox AI"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
    </div>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return (
    <motion.span
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
}

function StatBlock({ value, label, prefix = "", suffix = "" }: { value: number | string; label: string; prefix?: string; suffix?: string }) {
  return (
    <div className="text-center group">
      <div
        className="text-4xl md:text-5xl font-black mb-2 tabular-nums"
        style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {prefix}{typeof value === "number" ? <AnimatedCounter target={value} suffix={suffix} /> : value}
      </div>
      <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
    </div>
  );
}

function TimelineItem({
  year, title, body, index,
}: { year: string; title: string; body: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex gap-6 group"
    >
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-300"
          style={{
            background: "rgba(0,208,255,0.1)",
            border: "1px solid rgba(0,208,255,0.25)",
            color: "var(--sb-accent)",
            fontFamily: "var(--app-font-mono)",
          }}
        >
          {year}
        </div>
        <div className="w-px flex-1 mt-3" style={{ background: "linear-gradient(to bottom, rgba(0,208,255,0.2), transparent)" }} />
      </div>
      <div className="pb-10 pt-2.5 flex-1">
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{body}</p>
      </div>
    </motion.div>
  );
}

function PrincipleCard({
  icon: Icon, title, body, index,
}: { icon: typeof Zap; title: string; body: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-7 rounded-2xl cursor-default relative overflow-hidden transition-all duration-300"
      style={{
        background: hovered ? "var(--sb-card-2)" : "var(--sb-card)",
        border: `1px solid ${hovered ? "rgba(0,208,255,0.25)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? "0 0 40px rgba(0,208,255,0.08)" : "none",
      }}
    >
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,208,255,0.06) 0%, transparent 70%)" }}
        />
      )}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
        style={{
          background: hovered ? "rgba(0,208,255,0.18)" : "rgba(0,208,255,0.1)",
          color: "var(--sb-accent)",
        }}
      >
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-bold text-white mb-3 leading-snug">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{body}</p>
    </motion.div>
  );
}

function TeamCard({
  initials, name, role, bio, gradient, index,
}: { initials: string; name: string; role: string; bio: string; gradient: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-7 rounded-2xl transition-all duration-300 relative overflow-hidden"
      style={{
        background: "var(--sb-card)",
        border: `1px solid ${hovered ? "rgba(0,208,255,0.2)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.4), 0 0 30px rgba(0,208,255,0.06)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: hovered ? gradient : "transparent", transition: "background 0.3s" }}
      />
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black mb-5"
        style={{ background: gradient, color: "#080810" }}
      >
        {initials}
      </div>
      <div className="font-bold text-white mb-0.5">{name}</div>
      <div className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--sb-accent)", opacity: 0.7 }}>{role}</div>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{bio}</p>
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
      style={{
        background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: copied ? "#34d399" : "rgba(255,255,255,0.45)",
      }}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeLine({ command, comment }: { command: string; comment?: string }) {
  return (
    <div className="flex items-start gap-3 group py-0.5">
      <div className="flex-1 min-w-0">
        {comment && (
          <div className="text-xs mb-0.5 font-mono" style={{ color: "rgba(255,255,255,0.22)" }}>
            # {comment}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: "rgba(0,208,255,0.5)" }}>$</span>
          <code className="text-sm font-mono break-all" style={{ color: "#e2e8f0" }}>{command}</code>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function DeployStep({
  number, icon: Icon, title, description, commands, index,
}: {
  number: number;
  icon: typeof Terminal;
  title: string;
  description: string;
  commands: { command: string; comment?: string }[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm"
          style={{ background: "var(--sb-gradient)", color: "#080810" }}
        >
          {number}
        </div>
        <div className="w-px flex-1 mt-3" style={{ background: "linear-gradient(to bottom, rgba(0,208,255,0.2), transparent)", minHeight: 24 }} />
      </div>

      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} style={{ color: "var(--sb-accent)" }} />
          <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{description}</p>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-2 text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>terminal</span>
          </div>
          <div className="p-4 space-y-2">
            {commands.map((cmd, i) => (
              <CodeLine key={i} {...cmd} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ModeChip({ icon: Icon, label, color }: { icon: typeof Code2; label: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}14`, border: `1px solid ${color}30`, color }}
    >
      <Icon size={11} />
      {label}
    </div>
  );
}

export default function About() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(14,14,20,0)", "rgba(14,14,20,0.96)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "var(--sb-bg)", overflowX: "hidden" }}>

      {/* ─ NAVBAR ─────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: navBg, borderBottom: `1px solid`, borderColor: navBorder, backdropFilter: "blur(16px)" }}
      >
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
            <LogoMark size={28} />
            <span className="text-sm font-black tracking-tight" style={{ color: "var(--sb-accent)", textShadow: "0 0 14px rgba(0,208,255,0.5)", fontFamily: "var(--app-font-display)" }}>
              SANDBOX.AI
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
          <Link href="/#features"><span className="hover:text-white transition-colors cursor-pointer">Features</span></Link>
          <Link href="/#pricing"><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></Link>
          <Link href="/prompts"><span className="hover:text-white transition-colors cursor-pointer">Prompts</span></Link>
          <Link href="/about"><span className="text-white cursor-pointer border-b" style={{ borderColor: "var(--sb-accent)" }}>About</span></Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="hidden md:inline-flex px-4 py-2 text-sm font-medium transition-colors rounded-lg" style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
              Sign In
            </button>
          </Link>
          <Link href="/chat">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl"
              style={{ background: "var(--sb-gradient)", color: "#080810", boxShadow: "0 0 20px rgba(0,208,255,0.3)" }}>
              Start Free <ArrowRight size={13} />
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ─ HERO ───────────────────────────────── */}
      <section className="relative pt-40 pb-28 px-6 max-w-5xl mx-auto overflow-hidden">
        {/* Animated grid-line background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.35 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,208,255,0.12)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(14,14,20,0) 0%, rgba(14,14,20,0.85) 100%)" }} />
        </div>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,208,255,0.08) 0%, transparent 70%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono mb-10 rounded-full"
          style={{ border: "1px solid rgba(0,208,255,0.3)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Our story, our team, our mission
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.95]"
        >
          Most AI tools are built for
          <br />
          <span style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            everyone.
          </span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.9)" }}>We built one for developers.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          When you build for everyone, you optimize for nobody. Generic AI chat interfaces
          are designed around the average user — slow UX, limited models, no code runner,
          no image generation, no conversation persistence. That is not good enough for people
          who build things for a living.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-wrap gap-3"
        >
          <ModeChip icon={MessageSquare} label="Chat" color="#00d0ff" />
          <ModeChip icon={Code2} label="Code" color="#a78bfa" />
          <ModeChip icon={ImageIcon} label="Image Gen" color="#f59e0b" />
          <ModeChip icon={Smartphone} label="Flutter Dev" color="#54d3d8" />
        </motion.div>
      </section>

      {/* ─ STATS ──────────────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,208,255,0.02)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatBlock value={12400} suffix="+" label="Developers" />
            <StatBlock value="4.9/5" label="Avg. rating" />
            <StatBlock value={4} label="AI modes" />
            <StatBlock value={100} suffix="%" label="History kept" />
          </div>
        </div>
      </section>

      {/* ─ FLUTTER MODE CALLOUT ───────────────── */}
      <section className="py-16 px-6" style={{ borderTop: "1px solid rgba(84,211,216,0.15)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(84,211,216,0.08) 0%, rgba(0,208,255,0.04) 100%)", border: "1px solid rgba(84,211,216,0.3)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(84,211,216,0.07) 0%, transparent 70%)" }} />

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(84,211,216,0.15)", border: "1px solid rgba(84,211,216,0.35)" }}
            >
              <Smartphone size={28} style={{ color: "#54d3d8" }} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(84,211,216,0.12)", border: "1px solid rgba(84,211,216,0.3)", color: "#54d3d8" }}
              >
                NEW — Flutter Dev Mode
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                Specialized AI for Dart & Flutter development.
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Widget scaffolding, state management patterns, responsive layouts, and full API stack support —
                all tuned specifically for the Flutter ecosystem. One mode built for mobile-first engineers.
              </p>
            </div>

            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "linear-gradient(135deg,#54d3d8,#00a3cc)", color: "#080810" }}
              >
                Try Flutter Mode <ArrowRight size={14} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─ STORY TIMELINE ─────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-4 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              Origin story
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-14">
              From frustration to product.
            </h2>
          </motion.div>

          <div>
            {[
              {
                year: "Ch.1",
                title: "Sandbox.ai started with a single frustration",
                body: "Every AI tool worth using required a separate subscription, a separate tab, and a separate workflow interruption. Chat in one window. Code completion in another. Image generation somewhere else entirely. The context-switching alone was costing hours per week.",
              },
              {
                year: "Ch.2",
                title: "A simple question that changed everything",
                body: "What would an AI workspace look like if it was designed specifically for how developers actually work? Not a general-purpose chatbot. Not a plugin bolted onto an IDE. A purpose-built command center — fast, dark, model-aware, with real-time streaming and persistent history built in from day one.",
              },
              {
                year: "Ch.3",
                title: "The answer is Sandbox.ai",
                body: "One workspace that routes each task to the right model — GPT-5.2 for reasoning, GPT-5.3 Codex for code, gpt-image-1 for generation — without you ever thinking about which tool to open. Every conversation saved. Every session resumable. Every response streamed in real time.",
              },
              {
                year: "Now",
                title: "One obsession, unchanged",
                body: "We launched with a single obsession: make the best AI experience a developer has ever used. That obsession has not changed.",
              },
            ].map((item, i) => (
              <TimelineItem key={item.year} index={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ─ WHO WE SERVE ───────────────────────── */}
      <section className="py-24 px-6" style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
                style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
                Who we serve
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-6 leading-tight">
                Built for developers who move fast<br />and think in systems.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                We build for engineers, full-stack developers, solo founders, and technical freelancers
                who use AI every day as a core part of their workflow — not as an occasional novelty.
                You have strong opinions about latency. You notice when a UI interrupts your flow.
                You want markdown rendered correctly, code highlighted, and conversations saved without
                having to think about it. That is exactly who Sandbox.ai is for.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Code2, label: "Full-stack engineers", color: "#00d0ff" },
                { icon: Cpu, label: "Backend developers", color: "#a78bfa" },
                { icon: Globe, label: "Solo founders", color: "#f59e0b" },
                { icon: Users, label: "Technical freelancers", color: "#34d399" },
                { icon: Shield, label: "DevOps & infra", color: "#f87171" },
                { icon: Smartphone, label: "Mobile / Flutter devs", color: "#54d3d8" },
              ].map(({ icon: Icon, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}14`, color }}>
                    <Icon size={13} />
                  </div>
                  <span className="text-xs font-medium text-white">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─ PROOF BLOCK ────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              What we've shipped
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
              Every feature earns its place.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: MessageSquare, title: "Millions of messages streamed", body: "Millions of chat messages streamed in real time with sub-1s first-token latency.", color: "#00d0ff" },
              { icon: Code2, title: "GPT-5.3 Codex, natively integrated", body: "The same model behind production code at scale — in a dedicated code mode with syntax highlighting and format support.", color: "#a78bfa" },
              { icon: ImageIcon, title: "gpt-image-1 generation", body: "Full image generation with persistence across all conversations. Create, save, and revisit.", color: "#f59e0b" },
              { icon: Star, title: "94% rate their first session 5/5", body: "94% of users rate their first session a 5 out of 5 for speed and UX.", color: "#fbbf24" },
              { icon: Users, title: "Trusted across the industry", body: "Trusted by developers at Series A startups, agencies, and solo practices alike.", color: "#34d399" },
              { icon: Globe, title: "Available globally", body: "Available globally with consistent performance — no region-locked features.", color: "#54d3d8" },
            ].map(({ icon: Icon, title, body, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-6 rounded-2xl"
                style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}14`, color }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-1.5">{title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ PRINCIPLES ─────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              How we think
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
              Principles we don't compromise on.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PrincipleCard
              index={0}
              icon={Zap}
              title="Speed is not a feature — it is the product."
              body="Every millisecond of latency is a tax on your attention. We obsess over first-token speed, streaming performance, and UI responsiveness because your flow state is worth protecting."
            />
            <PrincipleCard
              index={1}
              icon={Code2}
              title="Developer experience is UX, not a bonus."
              body="Syntax highlighting, code execution, markdown rendering, keyboard shortcuts — these are not nice-to-haves. They are the baseline. We build to that standard."
            />
            <PrincipleCard
              index={2}
              icon={Shield}
              title="Your data belongs to you. Full stop."
              body="We do not sell your conversations, use them to train models, or share them with third parties. Your history is stored, searchable, and yours to delete at any time."
            />
          </div>
        </div>
      </section>

      {/* ─ TEAM ───────────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              The team
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">
              Builders who use Sandbox every day.
            </h2>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
              We eat our own dog food — if something slows us down, it gets fixed before the next deploy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TeamCard
              index={0}
              initials="AK"
              name="Alex Kim"
              role="Founder & CTO"
              gradient="linear-gradient(135deg,#00d0ff,#0099cc)"
              bio="Former distributed systems engineer who spent 6 years building infrastructure at scale. Quit to build the AI tool he kept wishing existed. Writes Rust for fun and regrets nothing."
            />
            <TeamCard
              index={1}
              initials="ML"
              name="Maya Lenz"
              role="Head of Product"
              gradient="linear-gradient(135deg,#a78bfa,#7c3aed)"
              bio="Spent 4 years as a developer before switching to product. Still writes code on weekends. Believes the best products are the ones that make you forget you are using software."
            />
            <TeamCard
              index={2}
              initials="JR"
              name="James Rowe"
              role="Lead Engineer"
              gradient="linear-gradient(135deg,#34d399,#059669)"
              bio="Full-stack engineer obsessed with latency, streaming UX, and the moment a user sees their first token appear. Once optimized a chat response time from 1.4s to 180ms. Did not stop there."
            />
          </div>
        </div>
      </section>

      {/* ─ DEPLOY GUIDE ──────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.2)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              <Terminal size={11} />
              Triển khai dự án
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-3">
              Từ clone đến chạy —<br />
              <span style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                chỉ vài lệnh.
              </span>
            </h2>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
              Copy từng lệnh hoặc chạy toàn bộ một lần. Không cần cấu hình phức tạp.
            </p>
          </motion.div>

          {/* One-liner quickstart banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative mb-12 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(0,208,255,0.08) 0%, rgba(0,153,204,0.04) 100%)", border: "1px solid rgba(0,208,255,0.25)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(0,208,255,0.06) 0%, transparent 70%)" }} />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 p-6">
              <div>
                <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--sb-accent)" }}>
                  ⚡ Quick Start — một lệnh duy nhất
                </div>
                <code
                  className="text-sm md:text-base font-mono break-all"
                  style={{ color: "#e2e8f0" }}
                >
                  git clone https://github.com/your-org/sandbox-ai.git &amp;&amp; cd sandbox-ai &amp;&amp; pnpm install &amp;&amp; pnpm run dev
                </code>
              </div>
              <div className="shrink-0">
                <CopyButton text="git clone https://github.com/your-org/sandbox-ai.git && cd sandbox-ai && pnpm install && pnpm run dev" />
              </div>
            </div>
          </motion.div>

          {/* Two columns: steps + requirements */}
          <div className="grid md:grid-cols-3 gap-10">

            {/* Steps (left 2/3) */}
            <div className="md:col-span-2">
              <DeployStep
                index={0}
                number={1}
                icon={GitBranch}
                title="Clone repository"
                description="Tải source code về máy. Cần Git đã cài sẵn."
                commands={[
                  { command: "git clone https://github.com/your-org/sandbox-ai.git", comment: "Tải source code" },
                  { command: "cd sandbox-ai", comment: "Vào thư mục dự án" },
                ]}
              />
              <DeployStep
                index={1}
                number={2}
                icon={Package}
                title="Cài đặt thư viện"
                description="Dự án dùng pnpm workspace — cài một lần cho toàn bộ monorepo."
                commands={[
                  { command: "npm install -g pnpm", comment: "Cài pnpm nếu chưa có" },
                  { command: "pnpm install", comment: "Cài tất cả dependencies" },
                ]}
              />
              <DeployStep
                index={2}
                number={3}
                icon={Settings2}
                title="Cấu hình biến môi trường"
                description="Tạo file .env từ mẫu và điền API keys (OpenAI, Clerk)."
                commands={[
                  { command: "cp .env.example .env", comment: "Tạo file cấu hình" },
                  { command: "nano .env", comment: "Chỉnh sửa keys (hoặc dùng VS Code)" },
                ]}
              />
              <DeployStep
                index={3}
                number={4}
                icon={Rocket}
                title="Khởi động dự án"
                description="Chạy API server và web app song song. Mở http://localhost:5173 để xem kết quả."
                commands={[
                  { command: "pnpm --filter @workspace/api-server run dev", comment: "Khởi động API server (port 3000)" },
                  { command: "pnpm --filter @workspace/sandbox-ai run dev", comment: "Khởi động Web app (port 5173)" },
                ]}
              />
            </div>

            {/* Requirements sidebar (right 1/3) */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="sticky top-28"
              >
                <div
                  className="p-6 rounded-2xl mb-4"
                  style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Yêu cầu hệ thống
                  </div>
                  {[
                    { label: "Node.js", version: "≥ 18.x", ok: true },
                    { label: "pnpm", version: "≥ 8.x", ok: true },
                    { label: "Git", version: "any", ok: true },
                    { label: "OpenAI API Key", version: "required", ok: false },
                    { label: "Clerk Account", version: "required", ok: false },
                  ].map(({ label, version, ok }) => (
                    <div key={label} className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: ok ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)" }}
                        >
                          {ok
                            ? <Check size={10} style={{ color: "#34d399" }} />
                            : <Settings2 size={10} style={{ color: "#fbbf24" }} />
                          }
                        </div>
                        <span className="text-xs font-medium text-white">{label}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{version}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Build production
                  </div>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
                    </div>
                    <div className="p-3 space-y-2">
                      <CodeLine command="pnpm run build" comment="Build toàn bộ" />
                      <CodeLine command="pnpm run serve" comment="Chạy bản production" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─ CTA ────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(0,208,255,0.12)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(0,208,255,0.07) 0%, transparent 70%)" }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-8 rounded-full"
              style={{ border: "1px solid rgba(0,208,255,0.25)", color: "var(--sb-accent)", backgroundColor: "rgba(0,208,255,0.06)" }}>
              <Check size={11} />
              Free to start · No credit card
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-5 leading-tight">
              Ready for the AI workspace
              <br />
              <span style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                built for how you work?
              </span>
            </h2>

            <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
              Chat, code, and image generation — all four modes, ready in 30 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(0,208,255,0.65)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 text-sm font-black rounded-2xl transition-all"
                  style={{ background: "var(--sb-gradient)", color: "#080810", boxShadow: "0 0 30px rgba(0,208,255,0.4)" }}
                >
                  Start Free
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
              <Link href="/">
                <button
                  className="px-7 py-4 text-sm font-bold rounded-2xl transition-all flex items-center gap-2"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,208,255,0.4)"; e.currentTarget.style.color = "var(--sb-accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >
                  Back to Home <ChevronRight size={14} />
                </button>
              </Link>
            </div>

            <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
              30-day money-back guarantee · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─ FOOTER ─────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={18} />
            <span className="font-black text-sm" style={{ color: "var(--sb-accent)", fontFamily: "var(--app-font-display)" }}>SANDBOX.AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Link href="/"><span className="hover:text-white transition-colors cursor-pointer">Home</span></Link>
            <Link href="/#pricing"><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></Link>
            <Link href="/prompts"><span className="hover:text-white transition-colors cursor-pointer">Prompts</span></Link>
            <Link href="/about"><span className="text-white cursor-pointer">About</span></Link>
            <Link href="/chat"><span className="hover:text-white transition-colors cursor-pointer">Launch App</span></Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 Sandbox.ai</p>
        </div>
      </footer>
    </div>
  );
}

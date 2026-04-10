import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Initializing secure session",
  "Verifying credentials",
  "Checking access level",
  "Loading workspace",
];

export default function AuthCheck() {
  const { isLoaded, isSignedIn } = useUser();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const intervals: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      intervals.push(setTimeout(() => setStep(i), i * 420));
    });
    return () => intervals.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const redirectTimeout = setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        if (isSignedIn) {
          navigate("/chat");
        } else {
          navigate("/sign-in");
        }
      }, 500);
    }, Math.max(1700, 0));
    return () => clearTimeout(redirectTimeout);
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{ backgroundColor: "var(--sb-bg, #050507)" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,208,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,208,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Ambient radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,208,255,0.07) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Corner scan lines */}
      <ScanCorners />

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Hexagon logo + spinner */}
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{ width: 120, height: 120 }}
          >
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="56"
                stroke="url(#ringGrad)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="80 270"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d0ff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00d0ff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Middle counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{ width: 90, height: 90 }}
          >
            <svg width={90} height={90} viewBox="0 0 90 90">
              <circle
                cx="45" cy="45" r="42"
                stroke="rgba(0,208,255,0.18)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="30 200"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* Hexagon logo mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width={52} height={52} viewBox="0 0 32 32" fill="none">
              <polygon
                points="16,2 28,8 28,24 16,30 4,24 4,8"
                stroke="url(#hexGrad)"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="16,7 23,11 23,21 16,25 9,21 9,11"
                fill="url(#hexGrad)"
                opacity="0.25"
              />
              {/* Center dot pulse */}
              <circle cx="16" cy="16" r="2.5" fill="url(#hexGrad)" opacity="0.9" />
              <defs>
                <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d0ff" />
                  <stop offset="100%" stopColor="#00a3cc" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Ping glow on logo */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full"
            style={{
              width: 52,
              height: 52,
              background: "radial-gradient(circle, rgba(0,208,255,0.35) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex flex-col items-center gap-1"
        >
          <span
            className="font-black text-xl tracking-tight"
            style={{ color: "var(--sb-accent, #00d0ff)", textShadow: "0 0 20px rgba(0,208,255,0.5)" }}
          >
            SANDBOX.AI
          </span>
          <span className="text-[11px] tracking-[0.25em] uppercase font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
            Secure Workspace
          </span>
        </motion.div>

        {/* Step progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 w-72"
        >
          {/* Steps list */}
          <div className="flex flex-col gap-2 w-full">
            {STEPS.map((label, i) => (
              <StepRow key={i} label={label} state={i < step ? "done" : i === step ? "active" : "pending"} />
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-[2px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00d0ff, #00a3cc)" }}
              initial={{ width: "0%" }}
              animate={{ width: done ? "100%" : `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Status text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[12px] font-mono"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {done ? "Access granted" : STEPS[step]}
              {!done && <BlinkingCursor />}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-6 flex items-center gap-4"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        <StatusDot active={isLoaded} label="Session" />
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
        <StatusDot active={isSignedIn ?? false} label="Auth" />
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
        <span className="text-[10px] font-mono tracking-widest">256-bit TLS</span>
      </motion.div>
    </div>
  );
}

function StepRow({ label, state }: { label: string; state: "done" | "active" | "pending" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: 16, height: 16 }}>
        {state === "done" && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            width={14} height={14} viewBox="0 0 14 14" fill="none"
          >
            <circle cx="7" cy="7" r="7" fill="rgba(52,211,153,0.18)" />
            <path d="M4 7l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
        {state === "active" && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="rounded-full"
            style={{ width: 7, height: 7, background: "#00d0ff", boxShadow: "0 0 6px rgba(0,208,255,0.8)" }}
          />
        )}
        {state === "pending" && (
          <div className="rounded-full" style={{ width: 5, height: 5, background: "rgba(255,255,255,0.12)" }} />
        )}
      </div>
      <span
        className="text-[12px] font-mono"
        style={{
          color:
            state === "done"
              ? "rgba(52,211,153,0.8)"
              : state === "active"
              ? "rgba(255,255,255,0.75)"
              : "rgba(255,255,255,0.2)",
          transition: "color 0.3s",
        }}
      >
        {label}
        {state === "done" && (
          <span style={{ color: "rgba(52,211,153,0.5)", marginLeft: 6 }}>✓</span>
        )}
      </span>
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      style={{ marginLeft: 2 }}
    >
      _
    </motion.span>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-full"
        style={{
          width: 5,
          height: 5,
          background: active ? "#34d399" : "rgba(255,255,255,0.2)",
          boxShadow: active ? "0 0 5px rgba(52,211,153,0.7)" : "none",
          transition: "background 0.4s, box-shadow 0.4s",
        }}
      />
      <span className="text-[10px] font-mono tracking-widest">{label}</span>
    </div>
  );
}

function ScanCorners() {
  const corner = (style: React.CSSProperties) => (
    <div className="absolute" style={{ width: 20, height: 20, ...style }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: 2,
        background: "rgba(0,208,255,0.4)",
      }} />
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: 2, height: "100%",
        background: "rgba(0,208,255,0.4)",
      }} />
    </div>
  );

  return (
    <>
      {corner({ top: 32, left: 32 })}
      {corner({ top: 32, right: 32, transform: "scaleX(-1)" })}
      {corner({ bottom: 32, left: 32, transform: "scaleY(-1)" })}
      {corner({ bottom: 32, right: 32, transform: "scale(-1,-1)" })}
    </>
  );
}

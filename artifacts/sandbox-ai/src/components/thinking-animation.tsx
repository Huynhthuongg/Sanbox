import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ThinkingAnimationProps {
  isThinking: boolean;
}

const THINKING_STEPS = [
  "Analyzing your request...",
  "Gathering relevant context...",
  "Formulating response...",
  "Structuring the answer...",
  "Refining output...",
];

export function ThinkingAnimation({ isThinking }: ThinkingAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!isThinking) {
      setStepIndex(0);
      setDotCount(1);
      return;
    }
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % THINKING_STEPS.length);
    }, 1800);
    const dotInterval = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 400);
    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, [isThinking]);

  return (
    <AnimatePresence>
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-start gap-3 py-1"
        >
          {/* Animated orb */}
          <div className="relative mt-0.5 shrink-0" style={{ width: 32, height: 32 }}>
            {/* Outer pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(0,208,255,0.3)" }}
                animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
            {/* Core glow */}
            <motion.div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(0,208,255,0.25) 0%, rgba(0,208,255,0.06) 70%)",
                border: "1px solid rgba(0,208,255,0.4)",
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Neural dots */}
              <div className="relative" style={{ width: 14, height: 14 }}>
                {[0, 1, 2].map((i) => {
                  const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                  const x = Math.cos(angle) * 5;
                  const y = Math.sin(angle) * 5;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 3,
                        height: 3,
                        background: "var(--sb-accent)",
                        left: `calc(50% + ${x}px - 1.5px)`,
                        top: `calc(50% + ${y}px - 1.5px)`,
                      }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.25,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
                {/* Center dot */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    background: "var(--sb-accent-light)",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 6px rgba(0,208,255,0.8)",
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--app-font-mono)", color: "var(--sb-accent)", letterSpacing: "0.1em" }}
              >
                Thinking
              </span>
              <span style={{ color: "var(--sb-accent)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                {"●".repeat(dotCount)}{"○".repeat(3 - dotCount)}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--app-font-sans)" }}
              >
                {THINKING_STEPS[stepIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Neural network lines visualization */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    height: 3,
                    background: "var(--sb-accent)",
                    opacity: 0.15,
                  }}
                  animate={{
                    width: ["4px", `${6 + Math.random() * 18}px`, "4px"],
                    opacity: [0.1, 0.5, 0.1],
                  }}
                  transition={{
                    duration: 0.8 + i * 0.07,
                    repeat: Infinity,
                    delay: i * 0.06,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   DeepThink Badge — shows in topbar when mode is active
   ───────────────────────────────────────── */
export function DeepThinkBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,208,255,0.1))",
        border: "1px solid rgba(139,92,246,0.4)",
        color: "#c084fc",
        fontFamily: "var(--app-font-mono)",
      }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "#c084fc" }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      Deep Think
    </motion.div>
  );
}

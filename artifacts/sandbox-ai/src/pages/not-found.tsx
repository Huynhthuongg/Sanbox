import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

const BB = {
  bg: "#050507",
  card: "#0c0c14",
  accent: "#00d0ff",
  border: "rgba(255,255,255,0.07)",
  muted: "rgba(255,255,255,0.38)",
};

const LINES = [
  "> navigating to requested route...",
  "> resolving path...",
  "> ERROR: route not found (404)",
  "> checking fallback handlers...",
  "> no match found",
  "> redirect to /404",
];

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), visibleLines === 0 ? 300 : 420);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: BB.bg,
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,208,255,0.05) 0%, transparent 70%)",
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(0,208,255,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* 404 number */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-8xl font-black leading-none select-none"
            style={{
              background: `linear-gradient(135deg, ${BB.accent}, rgba(0,208,255,0.3))`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 24px rgba(0,208,255,0.35))`,
            }}
          >
            404
          </motion.div>
          <p className="text-lg font-black text-white mt-2">Page Not Found</p>
          <p className="text-[13px] mt-1" style={{ color: BB.muted }}>
            Trang bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
        </div>

        {/* Terminal block */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "#05050a", border: `1px solid ${BB.border}` }}
        >
          <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${BB.border}` }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-2 text-[11px]" style={{ color: BB.muted }}>
              <Terminal size={10} className="inline mr-1" />
              router.log
            </span>
          </div>
          <div className="p-4 font-mono text-[12px] space-y-1.5" style={{ minHeight: 140 }}>
            {LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  color: line.includes("ERROR") ? "#f87171"
                    : line.includes("no match") || line.includes("redirect") ? "#f59e0b"
                    : "rgba(255,255,255,0.45)",
                }}
              >
                {line}
                {i === visibleLines - 1 && visibleLines < LINES.length && (
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: BB.accent }} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Link href="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold"
              style={{ background: BB.accent, color: "#050507" }}
            >
              <Home size={14} />
              Về trang chủ
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold"
            style={{ background: BB.card, color: "rgba(255,255,255,0.65)", border: `1px solid ${BB.border}` }}
          >
            <ArrowLeft size={14} />
            Quay lại
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

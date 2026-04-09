import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  Sparkles, MessageSquare, Code2, Image as ImageIcon, Smartphone,
  ArrowRight, CheckCheck, Zap, ChevronRight,
} from "lucide-react";

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

const STORAGE_KEY = "sb_onboarded_v2";

const MODES = [
  { id: "chat", icon: MessageSquare, label: "Chat", color: BB.accent, desc: "Hội thoại thông minh, Q&A, tóm tắt" },
  { id: "code", icon: Code2, label: "Code", color: BB.green, desc: "Sinh code, debug, giải thích" },
  { id: "image", icon: ImageIcon, label: "Image", color: BB.purple, desc: "Tạo ảnh từ mô tả text" },
  { id: "flutter", icon: Smartphone, label: "Flutter", color: BB.yellow, desc: "Sinh UI Flutter / Dart" },
];

function Step1({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-20 h-20 mx-auto rounded-3xl overflow-hidden mb-6"
        style={{ border: "2px solid rgba(0,208,255,0.3)", boxShadow: "0 0 40px rgba(0,208,255,0.2)" }}
      >
        <img src="/icons/icon-512.png" alt="Sandbox AI" className="w-full h-full object-cover" style={{ objectPosition: "center 60%" }} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4"
          style={{ background: `${BB.accent}12`, color: BB.accent, border: `1px solid ${BB.accent}22` }}>
          <Sparkles size={10} /> The AI Command Center
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          Chào mừng{name ? `, ${name.split(" ")[0]}` : ""}! 👋
        </h2>
        <p className="text-[14px] leading-relaxed mb-8" style={{ color: BB.muted }}>
          Sandbox AI là workspace AI toàn diện — Chat, Code, Image và Flutter trong một nơi duy nhất.
          Hãy để chúng tôi giúp bạn thiết lập trong 3 bước nhanh.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-2 mb-8 text-left">
        {[
          { icon: Zap, label: "4 AI modes", sub: "Chat · Code · Image · Flutter", color: BB.accent },
          { icon: MessageSquare, label: "Chat thông minh", sub: "GPT-4o, o3, o4-mini", color: BB.green },
          { icon: Code2, label: "Code expert", sub: "Debug & sinh code", color: BB.purple },
          { icon: ImageIcon, label: "Image AI", sub: "gpt-image-1", color: BB.yellow },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
            <Icon size={13} style={{ color }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-white">{label}</p>
              <p className="text-[10px]" style={{ color: BB.muted }}>{sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="w-full py-3.5 rounded-xl text-[14px] font-black flex items-center justify-center gap-2"
        style={{ background: BB.accent, color: "#050507" }}
      >
        Bắt đầu thiết lập <ArrowRight size={15} />
      </motion.button>
    </div>
  );
}

function Step2({ selected, onSelect, onNext }: { selected: string; onSelect: (v: string) => void; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1 text-center">Chọn AI Mode yêu thích</h2>
      <p className="text-[13px] text-center mb-6" style={{ color: BB.muted }}>Đây sẽ là mode mặc định khi bạn mở chat mới.</p>

      <div className="space-y-2.5 mb-8">
        {MODES.map(({ id, icon: Icon, label, color, desc }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{
              background: selected === id ? `${color}12` : "rgba(255,255,255,0.03)",
              border: `1px solid ${selected === id ? color + "40" : BB.border}`,
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold" style={{ color: selected === id ? color : "rgba(255,255,255,0.85)" }}>{label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: BB.muted }}>{desc}</p>
            </div>
            <div className="w-5 h-5 rounded-full border shrink-0 flex items-center justify-center"
              style={{ borderColor: selected === id ? color : BB.border, background: selected === id ? color : "transparent" }}>
              {selected === id && <CheckCheck size={11} style={{ color: "#050507" }} />}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        disabled={!selected}
        className="w-full py-3.5 rounded-xl text-[14px] font-black flex items-center justify-center gap-2 transition-all"
        style={{ background: selected ? BB.accent : "rgba(255,255,255,0.08)", color: selected ? "#050507" : BB.muted }}
      >
        Tiếp theo <ArrowRight size={15} />
      </motion.button>
    </div>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${BB.green}15`, border: `1px solid ${BB.green}25` }}>
        <CheckCheck size={28} style={{ color: BB.green }} />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Tất cả đã sẵn sàng!</h2>
      <p className="text-[13px] mb-8" style={{ color: BB.muted }}>
        Bạn đã hoàn tất thiết lập Sandbox AI. Bắt đầu chat ngay hoặc
        khám phá thêm cài đặt trong Settings.
      </p>

      <div className="space-y-2 mb-8">
        {[
          { icon: MessageSquare, text: "Tạo hội thoại mới → nhấn nút ✦ trong sidebar" },
          { icon: Code2, text: "Code mode → AI tự detect ngôn ngữ và format code đẹp" },
          { icon: ImageIcon, text: "Image mode → mô tả bằng tiếng Anh/Việt, AI sinh ảnh" },
          { icon: Smartphone, text: "Flutter mode → mô tả UI, nhận code Dart hoàn chỉnh" },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BB.border}` }}>
            <Icon size={13} className="shrink-0 mt-0.5" style={{ color: BB.accent }} />
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { onNext(); setLocation("/settings"); }}
          className="flex-1 py-3 rounded-xl text-[13px] font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: `1px solid ${BB.border}` }}
        >
          Cài đặt thêm
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-1.5"
          style={{ background: BB.accent, color: "#050507" }}
        >
          Bắt đầu chat <ChevronRight size={14} />
        </motion.button>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const { user, isLoaded } = useUser();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState("chat");

  useEffect(() => {
    if (!isLoaded || !user) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoaded, user]);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    try {
      const cfg = JSON.parse(localStorage.getItem("sb_ai_config") || "{}");
      cfg.mode = selectedMode;
      localStorage.setItem("sb_ai_config", JSON.stringify(cfg));
    } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  const steps = [
    <Step1 key={0} name={user?.fullName ?? user?.username ?? ""} onNext={() => setStep(1)} />,
    <Step2 key={1} selected={selectedMode} onSelect={setSelectedMode} onNext={() => setStep(2)} />,
    <Step3 key={2} onNext={finish} />,
  ];

  const STEP_LABELS = ["Chào mừng", "Chọn Mode", "Hoàn tất"];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) finish(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: BB.bg, border: `1px solid ${BB.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div
                className="h-full"
                style={{ background: BB.accent }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BB.border}` }}>
              <div className="flex items-center gap-2">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: i < step ? BB.green : i === step ? BB.accent : "rgba(255,255,255,0.08)",
                        color: i <= step ? "#050507" : BB.muted,
                      }}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className="text-[11px] hidden sm:block font-bold"
                      style={{ color: i === step ? "rgba(255,255,255,0.8)" : BB.muted }}>{label}</span>
                    {i < STEP_LABELS.length - 1 && (
                      <div className="w-4 h-px mx-1" style={{ background: i < step ? BB.green : BB.border }} />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={finish} className="text-[11px] px-2.5 py-1 rounded-lg" style={{ color: BB.muted }}>Bỏ qua</button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  {steps[step]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

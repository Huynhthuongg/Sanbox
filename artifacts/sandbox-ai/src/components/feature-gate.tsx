import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Image as ImageIcon, Smartphone, X, ArrowRight } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useLocation } from "wouter";

type GatedFeature = "image" | "flutter" | "dashboard" | "admin";
type RequiredPlan = "pro" | "enterprise";

interface FeatureGateProps {
  feature: GatedFeature;
  plan?: RequiredPlan;
  children: ReactNode;
  fallback?: ReactNode;
}

const FEATURE_META: Record<string, {
  label: string;
  icon: typeof ImageIcon;
  color: string;
  benefits: string[];
}> = {
  image: {
    label: "Image Generation",
    icon: ImageIcon,
    color: "#a855f7",
    benefits: [
      "Generate images with gpt-image-1",
      "1024×1024 high resolution output",
      "Save all images to conversation history",
      "Any style: photorealistic, illustration, art",
    ],
  },
  flutter: {
    label: "Flutter Mode",
    icon: Smartphone,
    color: "#54c5f8",
    benefits: [
      "Expert Flutter + Dart development",
      "MVVM + Riverpod architecture patterns",
      "Firebase Auth, Firestore & Functions",
      "ASO 2026 & Android Vitals guidance",
    ],
  },
  dashboard: {
    label: "Dashboard",
    icon: Zap,
    color: "#f59e0b",
    benefits: ["Access deployment overview", "Live log streaming", "Resource monitoring", "Domain management"],
  },
  admin: {
    label: "Admin Panel",
    icon: Lock,
    color: "#ef4444",
    benefits: ["User management", "Role assignments", "Plan management", "Platform stats"],
  },
};

export function PaywallModal({
  feature,
  onClose,
}: {
  feature: GatedFeature;
  onClose: () => void;
}) {
  const [, navigate] = useLocation();
  const meta = FEATURE_META[feature] ?? FEATURE_META.image;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "var(--sb-card)",
          border: `1px solid ${meta.color}30`,
          boxShadow: `0 0 60px ${meta.color}20, 0 32px 64px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 relative"
          style={{
            background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}08)`,
            borderBottom: `1px solid ${meta.color}18`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <X size={13} />
          </button>

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}35` }}
          >
            <Icon size={22} style={{ color: meta.color }} />
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
          >
            <Lock size={9} />
            Pro Feature
          </div>

          <h2 className="text-lg font-black text-white mb-1">{meta.label}</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Upgrade to Pro to unlock this feature and much more.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4">
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
            What you'll get
          </p>
          <ul className="space-y-2">
            {meta.benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onClose(); navigate("/pricing"); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{
              background: "var(--sb-gradient)",
              color: "#121212",
              boxShadow: "0 0 24px rgba(0,208,255,0.35)",
            }}
          >
            <Zap size={14} />
            Upgrade to Pro
            <ArrowRight size={13} />
          </motion.button>
          <p className="text-center text-[11px] mt-2.5" style={{ color: "rgba(255,255,255,0.2)" }}>
            Starting at $19/month · Cancel anytime
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canUse, isLoaded } = usePermissions();
  const [showPaywall, setShowPaywall] = useState(false);

  if (!isLoaded) return <>{children}</>;

  if (canUse(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return (
      <>
        <div onClick={() => setShowPaywall(true)}>{fallback}</div>
        <AnimatePresence>
          {showPaywall && <PaywallModal feature={feature} onClose={() => setShowPaywall(false)} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <div onClick={() => setShowPaywall(true)} className="cursor-pointer">
        {children}
      </div>
      <AnimatePresence>
        {showPaywall && <PaywallModal feature={feature} onClose={() => setShowPaywall(false)} />}
      </AnimatePresence>
    </>
  );
}

export function LockedModeButton({
  label,
  icon: Icon,
  color,
  feature,
  isActive,
  onClick,
}: {
  label: string;
  icon: typeof ImageIcon;
  color: string;
  feature: GatedFeature;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const [showPaywall, setShowPaywall] = useState(false);
  const { canUse } = usePermissions();
  const isLocked = !canUse(feature);

  const handleClick = () => {
    if (isLocked) {
      setShowPaywall(true);
      return;
    }
    onClick?.();
  };

  return (
    <>
      <button
        onClick={handleClick}
        title={isLocked ? `Upgrade to Pro to use ${label}` : label}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all relative"
        style={isActive && !isLocked ? {
          background: "var(--sb-gradient)",
          color: "#121212",
          boxShadow: "0 0 12px rgba(0,208,255,0.4)",
        } : {
          background: "transparent",
          color: isLocked ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.38)",
        }}
      >
        <Icon size={12} style={isLocked ? { color: "rgba(255,255,255,0.2)" } : {}} />
        <span>{label}</span>
        {isLocked && (
          <span
            className="ml-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase"
            style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
          >
            Pro
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPaywall && <PaywallModal feature={feature} onClose={() => setShowPaywall(false)} />}
      </AnimatePresence>
    </>
  );
}

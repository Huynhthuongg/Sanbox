import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Smartphone, Download as DownloadIcon, CheckCircle2,
  ChevronRight, AlertCircle, Settings,
  Package, ToggleRight,
} from "lucide-react";

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 6,
        overflow: "hidden", flexShrink: 0,
        filter: "drop-shadow(0 0 10px rgba(0,208,255,0.55))",
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

/* ────────────────────────────────────────────────────
   Tab switcher
   ──────────────────────────────────────────────────── */
type Platform = "ios" | "android";

function PlatformTab({
  active, onClick, icon, label, sub,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all"
      style={active ? {
        background: "var(--sb-card-2, #1c1c28)",
        border: "1px solid rgba(0,208,255,0.3)",
        boxShadow: "0 0 30px rgba(0,208,255,0.1)",
      } : {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ color: active ? "var(--sb-accent)" : "rgba(255,255,255,0.3)" }}>
        {icon}
      </div>
      <div className="text-sm font-bold" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}>{label}</div>
      <div className="text-xs" style={{ color: active ? "rgba(0,208,255,0.7)" : "rgba(255,255,255,0.25)" }}>{sub}</div>
    </button>
  );
}

/* ────────────────────────────────────────────────────
   Step card
   ──────────────────────────────────────────────────── */
function Step({ n, title, desc, children }: { n: number; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ background: "var(--sb-gradient)", color: "#080810" }}
        >
          {n}
        </div>
        <div className="w-px flex-1 mt-2" style={{ background: "rgba(0,208,255,0.12)", minHeight: 20 }} />
      </div>
      <div className="pb-6 flex-1">
        <div className="text-sm font-bold text-white mb-1">{title}</div>
        <div className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</div>
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Code/path display
   ──────────────────────────────────────────────────── */
function PathDisplay({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(0,208,255,0.8)" }}
    >
      <ChevronRight size={11} />
      {text}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   iOS section
   ──────────────────────────────────────────────────── */
function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function IosSection() {
  const [showProfile, setShowProfile] = useState(false);
  const profileUrl = "/api/mobile/ios/profile";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {/* Recommended badge */}
      <div
        className="flex gap-3 p-4 rounded-2xl mb-6 text-sm"
        style={{ background: "rgba(0,208,255,0.06)", border: "1px solid rgba(0,208,255,0.22)" }}
      >
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "#34d399" }} />
        <div>
          <div className="font-bold text-white mb-1">Dùng Safari "Thêm vào màn hình chính"</div>
          <div style={{ color: "rgba(255,255,255,0.5)" }}>
            Phương pháp này hiện <strong className="text-white">đúng logo</strong>, mở{" "}
            <strong className="text-white">toàn màn hình</strong> không có thanh địa chỉ, và không cần cài hồ sơ cấu hình.
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <Step
          n={1}
          title="Mở Sandbox AI bằng Safari"
          desc="Quan trọng: phải dùng Safari (không dùng Chrome). Mở trang chính của app."
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono break-all"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(0,208,255,0.8)" }}
          >
            {typeof window !== "undefined" ? window.location.origin : "sandbox-ai.replit.app"}
          </div>
        </Step>

        <Step
          n={2}
          title='Nhấn biểu tượng Chia sẻ ở thanh dưới'
          desc='Biểu tượng hình vuông có mũi tên chỉ lên — nằm ở thanh công cụ dưới cùng của Safari.'
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            <ShareIcon />
            Nút Share (Chia sẻ)
          </div>
        </Step>

        <Step
          n={3}
          title='"Thêm vào màn hình chính" → Thêm'
          desc='Cuộn xuống trong menu chia sẻ, nhấn "Thêm vào màn hình chính", giữ nguyên tên "Sandbox AI" rồi nhấn Thêm.'
        >
          <PathDisplay text='Chia sẻ → Thêm vào màn hình chính → Thêm' />
        </Step>

        <Step
          n={4}
          title="Icon Sandbox AI với logo xuất hiện!"
          desc="Nhấn vào icon để mở toàn màn hình không có thanh địa chỉ — y như app thật."
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: "#34d399" }} />
            <span className="text-xs" style={{ color: "#34d399" }}>Logo đúng · Toàn màn hình · Chat · Code · Image</span>
          </div>
        </Step>
      </div>

      {/* CTA: open in Safari */}
      <a href="/" target="_blank" rel="noopener noreferrer">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,208,255,0.5)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black transition-all"
          style={{ background: "var(--sb-gradient)", color: "#080810", boxShadow: "0 0 28px rgba(0,208,255,0.35)" }}
        >
          <ShareIcon />
          Mở bằng Safari để cài
        </motion.button>
      </a>

      <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
        Safari · iOS 14+ · Toàn màn hình · Logo hiển thị đúng
      </p>

      {/* Secondary: Configuration Profile */}
      <div className="mt-8">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-full flex items-center justify-between py-3 text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="flex items-center gap-2">
            <Settings size={13} />
            Cài bằng hồ sơ cấu hình (.mobileconfig) — tùy chọn
          </span>
          <ChevronRight
            size={14}
            style={{ transform: showProfile ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="pt-4 pb-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <div
                  className="flex gap-2 p-3 rounded-xl mb-4 text-xs"
                  style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}
                >
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  iOS 14+ có thể không hiển thị logo khi cài qua hồ sơ — đây là giới hạn của Apple. Nên dùng phương pháp Safari bên trên.
                </div>
                <ol className="space-y-2 text-xs pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <li>1. Mở link hồ sơ bằng Safari → nhấn Cho phép khi được hỏi</li>
                  <li>2. Vào <span style={{ color: "rgba(0,208,255,0.7)" }}>Cài đặt → Cài đặt chung → VPN và Quản lý thiết bị</span></li>
                  <li>3. Nhấn hồ sơ "Sandbox AI" → Cài đặt → xác nhận</li>
                </ol>
                <a href={profileUrl} className="block mt-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
                  >
                    <DownloadIcon size={13} />
                    Tải hồ sơ iOS (.mobileconfig)
                  </button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
   Android section
   ──────────────────────────────────────────────────── */
function AndroidSection() {
  const [apkAvailable, setApkAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/mobile/android/apk/status")
      .then((r) => r.json())
      .then((d: { available: boolean }) => setApkAvailable(d.available))
      .catch(() => setApkAvailable(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {/* Option A: PWA (primary) */}
      <div className="mb-6">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit mb-4"
          style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
        >
          ✓ Cách 1 — PWA (Khuyên dùng)
        </div>

        <div
          className="p-4 rounded-2xl mb-4"
          style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            Android Chrome hỗ trợ cài PWA như app thật: icon riêng, toàn màn hình, chạy offline nhẹ. Không cần APK, không cần bật nguồn không xác định.
          </p>

          <Step n={1} title='Mở Chrome trên Android và vào Sandbox AI' desc=''>
            <div
              className="text-xs font-mono px-3 py-2 rounded-lg break-all"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(0,208,255,0.8)" }}
            >
              {typeof window !== "undefined" ? window.location.origin : "https://sandbox-ai.replit.app"}
            </div>
          </Step>

          <Step n={2} title='Nhấn ⋮ (3 chấm) → "Thêm vào màn hình chính"' desc='Chrome sẽ hiện popup xác nhận tên ứng dụng.'>
            <PathDisplay text='Chrome menu ⋮ → Add to Home screen' />
          </Step>

          <Step n={3} title='Nhấn "Thêm" → icon xuất hiện trên màn hình!' desc='Mở ứng dụng từ icon — toàn màn hình, không có thanh địa chỉ Chrome.'>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "#34d399" }} />
              <span className="text-xs" style={{ color: "#34d399" }}>Cài đặt ngay, không cần tải file</span>
            </div>
          </Step>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>hoặc</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Option B: APK sideload */}
      <div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit mb-4"
          style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
        >
          ⚡ Cách 2 — Cài APK trực tiếp (Sideload)
        </div>

        <div
          className="p-4 rounded-2xl mb-4 text-sm"
          style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}
        >
          <div className="flex gap-2 mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
            Phương pháp này cần bật "Cài từ nguồn không xác định". Dành cho người dùng muốn cài app native WebView.
          </div>

          <Step n={1} title='Bật phép cài ứng dụng từ nguồn ngoài' desc=''>
            <PathDisplay text="Cài đặt → Bảo mật → Cài ứng dụng từ nguồn không xác định → BẬT" />
            <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Một số máy: Cài đặt → Ứng dụng → Chrome → Cài từ nguồn ngoài
            </div>
          </Step>

          <Step n={2} title='Tải file APK về máy' desc='Nhấn nút bên dưới để tải sandbox-ai.apk.'>
            {apkAvailable === null && (
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Đang kiểm tra APK…</div>
            )}
          </Step>

          <Step n={3} title='Mở file APK vừa tải' desc='Android hỏi "Bạn có muốn cài ứng dụng này không?" → Nhấn Cài đặt.'>
            <PathDisplay text="Downloads → sandbox-ai.apk → Cài đặt" />
          </Step>

          <Step n={4} title='Mở Sandbox AI từ màn hình chính!' desc='Ứng dụng WebView toàn màn hình, giao diện giống hệt web.'>
            <div className="flex items-center gap-2">
              <Package size={14} style={{ color: "#fbbf24" }} />
              <span className="text-xs" style={{ color: "#fbbf24" }}>Android 8.0 Oreo trở lên</span>
            </div>
          </Step>
        </div>

        {/* APK download button */}
        {apkAvailable === true ? (
          <a href="/api/mobile/android/apk" download="sandbox-ai.apk">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}
            >
              <DownloadIcon size={18} />
              Tải sandbox-ai.apk
            </motion.button>
          </a>
        ) : (
          <div>
            <div
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}
            >
              <Package size={16} />
              APK đang được chuẩn bị — dùng PWA bên trên trong thời gian này
            </div>
            <div
              className="mt-3 flex gap-2 p-3 rounded-xl text-xs"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.12)", color: "rgba(255,255,255,0.4)" }}
            >
              <ToggleRight size={14} className="shrink-0" style={{ color: "#fbbf24" }} />
              APK sẽ khả dụng sau khi build hoàn tất. PWA (Cách 1) hoạt động ngay bây giờ với đầy đủ tính năng.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────── */
export default function Download() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialPlatform = params.get("p") === "android" ? "android" : "ios";
  const [platform, setPlatform] = useState<Platform>(initialPlatform);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "var(--sb-bg)" }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "rgba(14,14,20,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/">
          <button className="flex items-center gap-2.5 group">
            <ArrowLeft size={15} style={{ color: "rgba(255,255,255,0.35)" }} />
            <LogoMark size={22} />
            <span className="text-sm font-bold" style={{ fontFamily: "var(--app-font-display)", color: "var(--sb-accent)" }}>
              SANDBOX.AI
            </span>
          </button>
        </Link>
        <Link href="/chat">
          <button
            className="px-4 py-2 text-sm font-bold rounded-xl transition-all"
            style={{ background: "var(--sb-gradient)", color: "#080810" }}
          >
            Mở Web App
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-10 px-6 max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-24 h-24 rounded-[24px] overflow-hidden"
            style={{ boxShadow: "0 0 50px rgba(0,208,255,0.3), 0 16px 48px rgba(0,0,0,0.5)", border: "1px solid rgba(0,208,255,0.2)" }}
          >
            <img src="/icons/icon-512.png" alt="Sandbox AI" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl md:text-4xl font-black tracking-tighter mb-3"
        >
          Tải Sandbox AI
          <br />
          <span style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            về thiết bị của bạn
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Chọn nền tảng để xem hướng dẫn cài đặt phù hợp.
        </motion.p>

        {/* Platform tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex gap-3 mb-10"
        >
          <PlatformTab
            active={platform === "ios"}
            onClick={() => setPlatform("ios")}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            }
            label="iPhone / iPad"
            sub="Profile .mobileconfig"
          />
          <PlatformTab
            active={platform === "android"}
            onClick={() => setPlatform("android")}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341a.5.5 0 0 1-.857.348l-1.516-1.516A5.984 5.984 0 0 1 12 14.5a5.984 5.984 0 0 1-3.15-.827l-1.516 1.516a.5.5 0 0 1-.857-.348V7.5a6 6 0 0 1 12 0v7.841zM8.5 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm7 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM5.07 7.297A6.973 6.973 0 0 0 5 8v8a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1v-1.5A2.5 2.5 0 0 0 5.07 7.297zm13.86 0A2.5 2.5 0 0 0 16.5 14.5V16a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1V8a6.973 6.973 0 0 0-.07-.703z"/>
              </svg>
            }
            label="Android"
            sub="APK / PWA install"
          />
        </motion.div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {platform === "ios" ? (
            <IosSection key="ios" />
          ) : (
            <AndroidSection key="android" />
          )}
        </AnimatePresence>
      </section>

      {/* Comparison footer */}
      <section
        className="py-10 px-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          Cũng có thể dùng ngay trên trình duyệt — không cần cài đặt
        </p>
        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            <Smartphone size={15} />
            Mở Web App
            <ChevronRight size={13} />
          </motion.button>
        </Link>
      </section>

      <footer className="py-8 px-6 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © 2025 Sandbox.ai · <Link href="/"><span className="underline cursor-pointer hover:text-white transition-colors">Trang chủ</span></Link>
        </p>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Github, Link2, Search, GitBranch, Star, Eye, Lock, Unlock, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_REPOS = [
  { name: "facebook/react", desc: "The library for web and native user interfaces.", stars: "225K", lang: "JavaScript", color: "#00d0ff", priv: false },
  { name: "vercel/next.js", desc: "The React Framework for the Web.", stars: "124K", lang: "JavaScript", color: "#fff", priv: false },
  { name: "vitejs/vite", desc: "Next generation frontend tooling.", stars: "68K", lang: "TypeScript", color: "#a855f7", priv: false },
  { name: "shadcn-ui/ui", desc: "Beautifully designed components built with Radix UI.", stars: "73K", lang: "TypeScript", color: "#00d0ff", priv: false },
  { name: "tailwindlabs/tailwindcss", desc: "A utility-first CSS framework.", stars: "82K", lang: "CSS", color: "#06b6d4", priv: false },
  { name: "microsoft/TypeScript", desc: "TypeScript is a superset of JavaScript that compiles to clean JavaScript.", stars: "101K", lang: "TypeScript", color: "#2563eb", priv: false },
];

type Step = "input" | "loading" | "success";

export default function ImportGitHub() {
  const [, navigate] = useLocation();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState("");

  const isValidGitHubUrl = (u: string) => {
    return u.match(/^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/i) || u.match(/^[\w.-]+\/[\w.-]+$/);
  };

  const handleImport = () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Please enter a GitHub URL or repo path."); return; }
    if (!isValidGitHubUrl(trimmed)) { setError("Invalid GitHub URL. Use format: https://github.com/user/repo"); return; }
    setError("");
    setStep("loading");
    setTimeout(() => setStep("success"), 2000);
  };

  const handleSelectRepo = (name: string) => {
    setUrl(`https://github.com/${name}`);
    setError("");
  };

  const handleStartCoding = () => {
    const repoName = url.replace(/^https?:\/\/(www\.)?github\.com\//i, "").split("/").pop() ?? "project";
    sessionStorage.setItem("sb_prompt_fill", `Help me work on my GitHub project: ${repoName}`);
    sessionStorage.setItem("sb_prompt_mode", "code");
    navigate("/chat");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--sb-bg)", color: "#fff" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          backgroundColor: "rgba(5,5,7,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--sb-accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <Github size={13} style={{ color: "#fff" }} />
            </div>
            <h1 className="font-black text-lg tracking-tight" style={{ fontFamily: "var(--app-font-display)", color: "#fff" }}>
              Import from GitHub
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Hero */}
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <Github size={28} style={{ color: "#fff" }} />
                </div>
                <h2 className="text-xl font-black mb-2">Import your GitHub repo</h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Paste a GitHub URL to clone, explore, or build on top of any public repository
                </p>
              </div>

              {/* URL input */}
              <div
                className="rounded-2xl p-5 mb-5"
                style={{ background: "var(--sb-card)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Repository URL
                </label>
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Link2 size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <input
                    value={url}
                    onChange={e => { setUrl(e.target.value); setError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") handleImport(); }}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-transparent border-0 outline-none text-sm font-mono"
                    style={{ color: "#fff", caretColor: "var(--sb-accent)" }}
                  />
                </div>
                {error && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
                )}
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Supports public repos. Also accepts: <code className="font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>username/repo</code>
                </p>

                <button
                  onClick={handleImport}
                  className="w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: url.trim() ? "var(--sb-gradient)" : "rgba(255,255,255,0.06)",
                    color: url.trim() ? "#0a0a12" : "rgba(255,255,255,0.25)",
                    boxShadow: url.trim() ? "0 0 24px rgba(0,208,255,0.3)" : "none",
                  }}
                >
                  Import Repository
                </button>
              </div>

              {/* Popular repos */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Popular repositories
                  </span>
                </div>
                <div className="space-y-2">
                  {POPULAR_REPOS.map((repo) => (
                    <button
                      key={repo.name}
                      onClick={() => handleSelectRepo(repo.name)}
                      className="w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all"
                      style={{
                        background: url === `https://github.com/${repo.name}` ? "rgba(0,208,255,0.08)" : "rgba(255,255,255,0.025)",
                        border: url === `https://github.com/${repo.name}` ? "1px solid rgba(0,208,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={e => {
                        if (url !== `https://github.com/${repo.name}`) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (url !== `https://github.com/${repo.name}`) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        }
                      }}
                    >
                      <Github size={16} style={{ color: "rgba(255,255,255,0.4)", marginTop: 1, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white font-mono">{repo.name}</span>
                          {repo.priv
                            ? <Lock size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
                            : <Unlock size={10} style={{ color: "rgba(255,255,255,0.2)" }} />}
                        </div>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{repo.desc}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: repo.color }} />
                            {repo.lang}
                          </div>
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <Star size={9} />
                            {repo.stars}
                          </div>
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <Eye size={9} />
                            Public
                          </div>
                        </div>
                      </div>
                      <GitBranch size={13} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(0,208,255,0.1)", border: "1px solid rgba(0,208,255,0.2)" }}
                animate={{ boxShadow: ["0 0 0px rgba(0,208,255,0.2)", "0 0 40px rgba(0,208,255,0.4)", "0 0 0px rgba(0,208,255,0.2)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--sb-accent)" }} />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">Cloning repository…</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {url.replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
              </p>
              <div className="mt-6 flex flex-col gap-1.5 text-xs font-mono" style={{ color: "rgba(0,208,255,0.5)" }}>
                {["Connecting to GitHub…", "Fetching repository metadata…", "Cloning files…"].map((msg, i) => (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                  >
                    $ {msg}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", boxShadow: "0 0 48px rgba(52,211,153,0.15)" }}
              >
                <CheckCircle2 size={36} style={{ color: "#34d399" }} />
              </motion.div>
              <h2 className="text-xl font-black mb-2">Repository imported!</h2>
              <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                {url.replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
              </p>
              <p className="text-xs mb-8" style={{ color: "rgba(255,255,255,0.25)" }}>
                Your repository has been cloned and is ready to work with
              </p>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                  onClick={handleStartCoding}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: "var(--sb-gradient)",
                    color: "#0a0a12",
                    boxShadow: "0 0 28px rgba(0,208,255,0.35)",
                  }}
                >
                  Start coding with AI
                </button>
                <button
                  onClick={() => { setStep("input"); setUrl(""); }}
                  className="w-full py-3 rounded-2xl font-medium text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >
                  Import another repo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

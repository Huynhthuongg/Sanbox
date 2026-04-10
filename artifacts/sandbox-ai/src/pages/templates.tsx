import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, X, Star, GitFork, ArrowLeft, Zap, Globe, Layers, Code2, ImageIcon, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  stars: string;
  icon?: string;
  color: string;
  tag: string;
}

const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const DEVICONS: Record<string, string> = {
  "python":       `${DI}/python/python-original.svg`,
  "nodejs":       `${DI}/nodejs/nodejs-original.svg`,
  "c":            `${DI}/c/c-original.svg`,
  "java":         `${DI}/java/java-original.svg`,
  "cpp":          `${DI}/cplusplus/cplusplus-original.svg`,
  "html-css-js":  `${DI}/html5/html5-original.svg`,
  "typescript":   `${DI}/typescript/typescript-original.svg`,
  "react":        `${DI}/react/react-original.svg`,
  "vite":         `${DI}/vitejs/vitejs-original.svg`,
  "angular":      `${DI}/angularjs/angularjs-original.svg`,
  "vue":          `${DI}/vuejs/vuejs-original.svg`,
  "svelte-server":`${DI}/svelte/svelte-original.svg`,
  "svelte-static":`${DI}/svelte/svelte-original.svg`,
  "expressjs":    `${DI}/express/express-original.svg`,
  "fastapi":      `${DI}/fastapi/fastapi-original.svg`,
  "flask":        `${DI}/flask/flask-original.svg`,
  "django":       `${DI}/django/django-plain.svg`,
  "pygame":       `${DI}/python/python-original.svg`,
  "threejs":      `${DI}/threejs/threejs-original.svg`,
  "processing":   `${DI}/processing/processing-original.svg`,
  "rust":         `${DI}/rust/rust-original.svg`,
  "go":           `${DI}/go/go-original.svg`,
  "kotlin":       `${DI}/kotlin/kotlin-original.svg`,
  "swift":        `${DI}/swift/swift-original.svg`,
  "dart":         `${DI}/dart/dart-original.svg`,
  "ruby":         `${DI}/ruby/ruby-original.svg`,
  "php":          `${DI}/php/php-original.svg`,
  "bash":         `${DI}/bash/bash-original.svg`,
  "haskell":      `${DI}/haskell/haskell-original.svg`,
  "scala":        `${DI}/scala/scala-original.svg`,
  "elixir":       `${DI}/elixir/elixir-original.svg`,
  "r":            `${DI}/r/r-original.svg`,
  "lua":          `${DI}/lua/lua-original.svg`,
  "sqlite":       `${DI}/sqlite/sqlite-original.svg`,
  "csharp":       `${DI}/csharp/csharp-original.svg`,
  "expo":         `${DI}/react/react-original.svg`,
  "jupyter":      `${DI}/jupyter/jupyter-original.svg`,
  "streamlit":    `${DI}/python/python-original.svg`,
  "data-science": `${DI}/python/python-original.svg`,
};

const TEMPLATES: Template[] = [
  { id: "python", name: "Python", category: "languages", description: "A high-level, interpreted, general-purpose programming language.", stars: "32.9M", color: "#3b82f6", tag: "popular" },
  { id: "nodejs", name: "Node.js", category: "languages", description: "Nodejs is an open-source, cross-platform, back-end JavaScript runtime environment.", stars: "6M", color: "#22c55e", tag: "popular" },
  { id: "c", name: "C", category: "languages", description: "A general-purpose computer programming language.", stars: "4M", color: "#94a3b8", tag: "" },
  { id: "java", name: "Java", category: "languages", description: "A concurrent, class-based, statically typed object-oriented language.", stars: "4.3M", color: "#f59e0b", tag: "popular" },
  { id: "cpp", name: "C++", category: "languages", description: "A low-level and cross-platform imperative language with object-oriented features.", stars: "3.2M", color: "#6366f1", tag: "" },
  { id: "html-css-js", name: "HTML, CSS, JS", category: "languages", description: "The languages that make up the web.", stars: "10.4M", color: "#f97316", tag: "popular" },
  { id: "typescript", name: "TypeScript", category: "web", description: "A strict syntactical superset of JavaScript with optional static typing.", stars: "148.9K", color: "#2563eb", tag: "popular" },
  { id: "react", name: "React Javascript", category: "web", description: "Online React Editor and IDE: compile, run, and host React apps.", stars: "319K", color: "#00d0ff", tag: "popular" },
  { id: "vite", name: "Vanilla Vite", category: "web", description: "Write blazing fast web apps with Vite.", stars: "59.9K", color: "#a855f7", tag: "" },
  { id: "angular", name: "Angular", category: "web", description: "A web framework that empowers developers to build fast, reliable applications.", stars: "3.2K", color: "#ef4444", tag: "" },
  { id: "vue", name: "VueJS", category: "web", description: "An approachable, performant and versatile framework for building web user interfaces.", stars: "482", color: "#22c55e", tag: "beta" },
  { id: "svelte-server", name: "SvelteKit (server)", category: "web", description: "Web development, streamlined.", stars: "877", color: "#f97316", tag: "" },
  { id: "svelte-static", name: "SvelteKit (static)", category: "web", description: "Web development, streamlined.", stars: "548", color: "#f97316", tag: "" },
  { id: "expressjs", name: "Express.js", category: "web", description: "Fast, unopinionated, minimalist web framework for Node.js.", stars: "5.8K", color: "#6b7280", tag: "" },
  { id: "fastapi", name: "FastAPI", category: "web", description: "A modern, fast web framework for building APIs with Python.", stars: "6.9K", color: "#22c55e", tag: "popular" },
  { id: "flask", name: "Flask", category: "web", description: "Minimalist Python web framework.", stars: "8.2K", color: "#64748b", tag: "popular" },
  { id: "django", name: "Django", category: "web", description: "The python framework for perfectionists on a deadline.", stars: "30.8K", color: "#065f46", tag: "popular" },
  { id: "htmx", name: "htmx", category: "web", description: "High power tools for HTML.", stars: "1.2K", color: "#14b8a6", tag: "", icon: "</>" },
  { id: "pygame", name: "Pygame", category: "games", description: "Cross-platform set of Python modules designed for writing video games.", stars: "468.8K", color: "#4f46e5", tag: "popular" },
  { id: "kaboom", name: "Kaboom", category: "games", description: "A Javascript game programming library.", stars: "18.2K", color: "#f59e0b", tag: "", icon: "💥" },
  { id: "threejs", name: "3D Rendering (Three.js)", category: "graphics", description: "Render 3D objects using the popular Three.js library.", stars: "4.5K", color: "#a855f7", tag: "" },
  { id: "p5js", name: "p5.js", category: "graphics", description: "A JavaScript library for creative coding.", stars: "225.7K", color: "#ec4899", tag: "popular", icon: "p5" },
  { id: "turtle", name: "Python (with Turtle)", category: "graphics", description: "Turtle is a pre-installed Python library for pictures and shapes.", stars: "38.6K", color: "#10b981", tag: "", icon: "🐢" },
  { id: "processing", name: "Processing (Java)", category: "graphics", description: "Get started creating graphics with Java and Processing.", stars: "54K", color: "#0ea5e9", tag: "" },
  { id: "rust", name: "Rust", category: "languages", description: "A multi-paradigm, general-purpose language designed for performance.", stars: "12.1K", color: "#f97316", tag: "popular" },
  { id: "go", name: "Go", category: "languages", description: "A statically typed language with a focus on concurrency.", stars: "122.7K", color: "#00acd7", tag: "popular" },
  { id: "kotlin", name: "Kotlin", category: "languages", description: "A cross-platform, statically typed, general-purpose language.", stars: "60.8K", color: "#7c3aed", tag: "" },
  { id: "swift", name: "Swift", category: "languages", description: "A general-purpose, multi-paradigm, compiled language.", stars: "158.4K", color: "#f97316", tag: "popular" },
  { id: "dart", name: "Dart", category: "languages", description: "A general-purpose language used to build web, server, desktop, and mobile apps.", stars: "70.1K", color: "#0ea5e9", tag: "popular" },
  { id: "ruby", name: "Ruby", category: "languages", description: "A dynamic language with a focus on simplicity and productivity.", stars: "148.6K", color: "#ef4444", tag: "" },
  { id: "php", name: "PHP Web Server", category: "languages", description: "A popular general scripting programming language.", stars: "522.9K", color: "#818cf8", tag: "popular" },
  { id: "bash", name: "Bash", category: "languages", description: "A Unix shell and command language.", stars: "579.9K", color: "#22c55e", tag: "popular" },
  { id: "haskell", name: "Haskell", category: "languages", description: "A general-purpose, purely functional programming language.", stars: "90.4K", color: "#a78bfa", tag: "" },
  { id: "scala", name: "Scala", category: "languages", description: "Combines object-oriented and functional programming.", stars: "31.8K", color: "#ef4444", tag: "" },
  { id: "elixir", name: "Elixir", category: "languages", description: "A functional, concurrent, general-purpose language on the Erlang VM.", stars: "10.2K", color: "#a855f7", tag: "" },
  { id: "r", name: "R", category: "languages", description: "A programming language for statistical computing and graphics.", stars: "56.9K", color: "#2563eb", tag: "" },
  { id: "lua", name: "Lua", category: "languages", description: "A lightweight, high-level, multi-paradigm programming language.", stars: "134.5K", color: "#1d4ed8", tag: "" },
  { id: "sqlite", name: "SQLite", category: "languages", description: "A database engine written in the C language.", stars: "155.4K", color: "#06b6d4", tag: "" },
  { id: "csharp", name: "C#", category: "languages", description: "A general-purpose, multi-paradigm programming language.", stars: "695.4K", color: "#7c3aed", tag: "popular" },
  { id: "expo", name: "Expo", category: "mobile", description: "An open-source framework for making universal native apps with React.", stars: "21.5K", color: "#00d0ff", tag: "popular" },
  { id: "jupyter", name: "Jupyter Notebook", category: "data", description: "An open-source web application for creating and sharing documents.", stars: "20.8K", color: "#f59e0b", tag: "popular" },
  { id: "streamlit", name: "Streamlit", category: "data", description: "Basic streamlit setup for testing and deployments.", stars: "5.3K", color: "#ef4444", tag: "" },
  { id: "data-science", name: "Python Data Science", category: "data", description: "Contains numpy, pandas, matplotlib and more.", stars: "45.2K", color: "#0ea5e9", tag: "popular" },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Layers },
  { id: "languages", label: "Languages", icon: Code2 },
  { id: "web", label: "Web", icon: Globe },
  { id: "games", label: "Games", icon: Zap },
  { id: "graphics", label: "Graphics", icon: ImageIcon },
  { id: "mobile", label: "Mobile", icon: Cpu },
  { id: "data", label: "Data", icon: Star },
];

function formatStars(s: string): string {
  return s;
}

export default function Templates() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TEMPLATES.filter((t) => {
      const matchCat = activeCategory === "all" || t.category === activeCategory;
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const handleUse = (t: Template) => {
    sessionStorage.setItem("sb_prompt_fill", `Build a ${t.name} project for me`);
    sessionStorage.setItem("sb_prompt_mode", "code");
    navigate("/chat");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
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
                className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,208,255,0.15))", border: "1px solid rgba(168,85,247,0.4)" }}
              >
                ⚡
              </div>
              <h1 className="font-black text-lg tracking-tight" style={{ fontFamily: "var(--app-font-display)", background: "linear-gradient(135deg, #a855f7, #00d0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Remix a Template
              </h1>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <Search size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                autoFocus
                className="flex-1 bg-transparent border-0 outline-none text-sm"
                style={{ color: "#fff", caretColor: "var(--sb-accent)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              Cancel
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0"
                  style={isActive ? {
                    background: "var(--sb-gradient)",
                    color: "#0a0a12",
                    boxShadow: "0 0 14px rgba(0,208,255,0.3)",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.38)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
                >
                  <Icon size={11} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 py-5 max-w-5xl mx-auto w-full">
        <div className="text-xs font-mono mb-4" style={{ color: "rgba(255,255,255,0.22)" }}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
          >
            {filtered.map((t, i) => {
              const isHovered = hoveredId === t.id;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.25) }}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="flex flex-col rounded-2xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
                    border: isHovered ? `1px solid ${t.color}55` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isHovered ? `0 0 24px ${t.color}18` : "none",
                  }}
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 overflow-hidden"
                      style={{ background: `${t.color}22`, border: `1px solid ${t.color}33` }}
                    >
                      {DEVICONS[t.id] ? (
                        <img src={DEVICONS[t.id]} alt={t.name} className="w-6 h-6 object-contain" loading="lazy" />
                      ) : (
                        <span style={{ color: t.color }}>{t.icon ?? t.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                      <Star size={10} />
                      {formatStars(t.stars)}
                    </div>
                  </div>

                  {/* Name + tag */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white">{t.name}</span>
                    {t.tag && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                        style={{
                          background: t.tag === "popular" ? "rgba(0,208,255,0.15)" : "rgba(168,85,247,0.15)",
                          color: t.tag === "popular" ? "#00d0ff" : "#a855f7",
                          border: `1px solid ${t.tag === "popular" ? "rgba(0,208,255,0.3)" : "rgba(168,85,247,0.3)"}`,
                        }}
                      >
                        {t.tag}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <span className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>
                    {t.category}
                  </span>

                  {/* Description */}
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {t.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => handleUse(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: isHovered ? "var(--sb-gradient)" : "rgba(0,208,255,0.08)",
                        color: isHovered ? "#0a0a12" : "var(--sb-accent)",
                        border: "1px solid rgba(0,208,255,0.2)",
                        boxShadow: isHovered ? "0 0 14px rgba(0,208,255,0.3)" : "none",
                      }}
                    >
                      <Zap size={11} />
                      Start with AI
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                      title="Fork template"
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                    >
                      <GitFork size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={32} style={{ color: "rgba(255,255,255,0.12)", marginBottom: 12 }} />
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>No templates found</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

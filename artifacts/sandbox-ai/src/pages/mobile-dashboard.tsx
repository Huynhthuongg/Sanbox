import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, MessageSquare, Wrench, TerminalSquare, User } from "lucide-react";

export default function MobileDashboard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur px-4 py-3 flex items-center justify-between">
        <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg border border-white/20">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <h1 className="font-black">Sandbox Dashboard</h1>
        <User size={18} className="opacity-70" />
      </header>

      {open && (
        <nav className="p-4 space-y-2 border-b border-white/10">
          <Link href="/chat-static" className="flex items-center gap-2 p-3 rounded-lg bg-white/5"><MessageSquare size={16}/> Chat tĩnh (Codex style)</Link>
          <Link href="/termux-lab" className="flex items-center gap-2 p-3 rounded-lg bg-white/5"><TerminalSquare size={16}/> Termux nền + AI lệnh</Link>
          <Link href="/tools" className="flex items-center gap-2 p-3 rounded-lg bg-white/5"><Wrench size={16}/> Công cụ hỗ trợ</Link>
        </nav>
      )}

      <main className="p-4 space-y-3">
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
          <p className="text-sm text-cyan-200">Mobile-first layout với menu 3 gạch như bạn yêu cầu.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/chat-static" className="rounded-xl p-4 bg-white/5 border border-white/10">Mở Chat</Link>
          <Link href="/tools" className="rounded-xl p-4 bg-white/5 border border-white/10">Mở Tools</Link>
        </div>
      </main>
    </div>
  );
}

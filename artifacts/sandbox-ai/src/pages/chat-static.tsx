export default function ChatStaticPage() {
  const messages = [
    { role: "user", content: "Tạo API login bằng Node.js" },
    { role: "assistant", content: "Dưới đây là skeleton theo phong cách Codex, gồm route, service và validator..." },
  ];
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col">
      <header className="p-4 border-b border-white/10 font-black">Codex-style Chat (Static UI)</header>
      <div className="flex-1 p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-3xl rounded-xl p-3 ${m.role === "user" ? "ml-auto bg-cyan-500/20" : "bg-white/5"}`}>
            <div className="text-xs opacity-70 mb-1">{m.role}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <input disabled value="Static mock input..." className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

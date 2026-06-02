const tools = [
  "Prompt Optimizer",
  "API Schema Checker",
  "Log Analyzer",
  "Release Checklist",
  "Env Validator",
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-[#080a10] text-white p-6">
      <h1 className="text-2xl font-black mb-4">Công cụ hỗ trợ</h1>
      <div className="grid gap-3">
        {tools.map((t) => (
          <div key={t} className="rounded-xl border border-white/15 p-4 bg-white/5">{t}</div>
        ))}
      </div>
    </div>
  );
}

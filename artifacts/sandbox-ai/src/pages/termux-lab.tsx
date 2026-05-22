import { useState } from "react";

export default function TermuxLab() {
  const [cmd, setCmd] = useState("npm run build");
  const [logs, setLogs] = useState<string[]>(["[termux] session booted", "[ai] ready to suggest commands"]);
  return (
    <div className="min-h-screen bg-black text-green-300 p-4 font-mono">
      <h1 className="text-white font-bold mb-4">Termux nền + AI command assistant (mock)</h1>
      <div className="rounded-xl border border-green-500/30 p-3 mb-3 bg-green-950/20">
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="flex gap-2">
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} className="flex-1 bg-white/10 text-white px-3 py-2 rounded" />
        <button onClick={() => setLogs((v) => [...v, `$ ${cmd}`, "[ai] suggestion: add --verbose if fail"])} className="px-3 py-2 rounded bg-cyan-500 text-black font-bold">Run</button>
      </div>
    </div>
  );
}

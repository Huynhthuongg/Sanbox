import { authMode, envChecklist, isAuthEnabled } from "@/config/auth-mode";

export default function HealthConfigPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--sb-bg)", color: "#fff", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Health Config</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Runtime auth mode: <strong>{authMode}</strong>. Auth enabled: <strong>{String(isAuthEnabled)}</strong>.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {envChecklist.map((item) => (
          <div key={item.key} style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <code>{item.key}</code>
              <strong>
                {item.status === "ok" ? "✅ configured" : item.status === "missing" ? "❌ missing" : "ℹ️ optional"}
              </strong>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>required: {String(item.required)}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>value: {item.value ? "set" : "empty"}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{item.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

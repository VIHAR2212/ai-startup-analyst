"use client";

type AgentState = "idle" | "running" | "done" | "error";

interface Agent {
  name: string;
  description: string;
  color: string;
  icon: string;
  state: AgentState;
  model: string;
  modelColor: string;
}

interface Props { agents: Agent[]; }

const MODEL_LOGOS: Record<string, string> = {
  "Groq":    "⚡",
  "Claude":  "🔮",
  "Gemini":  "✨",
};

export default function AgentPanel({ agents }: Props) {
  return (
    <div className="card p-4">
      <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Agent council
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {agents.map((agent) => (
          <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              {agent.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{agent.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: agent.modelColor + "20", color: agent.modelColor, fontWeight: 500 }}>
                  {MODEL_LOGOS[agent.model] || "🤖"} {agent.model}
                </span>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>
                  {agent.state === "running" ? "Running…" : agent.state === "done" ? "✓ Done" : agent.state === "error" ? "✗ Error" : agent.description}
                </span>
              </div>
            </div>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: agent.state === "done" ? "#4ade80" : agent.state === "running" ? "#4ade80" : agent.state === "error" ? "#ef4444" : "rgba(255,255,255,0.15)",
              ...(agent.state === "running" ? { animation: "pulse-dot 1.2s infinite" } : {}),
            }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8, border: "0.5px solid var(--border)" }}>
        <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>FAILOVER CHAIN</div>
        <div style={{ fontSize: 11, color: "var(--foreground)", lineHeight: 1.6 }}>
          If any model fails, the next one auto-takes over. Zero downtime.
        </div>
      </div>
    </div>
  );
}

"use client";

type AgentState = "idle" | "running" | "done" | "error";

interface Agent {
  name: string;
  description: string;
  color: string;
  icon: string;
  state: AgentState;
}

interface Props {
  agents: Agent[];
}

export default function AgentPanel({ agents }: Props) {
  return (
    <div className="card p-4">
      <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Agent council
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {agents.map((agent) => (
          <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
              {agent.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {agent.state === "running" ? "Running…" : agent.state === "done" ? "Complete ✓" : agent.state === "error" ? "Error" : agent.description}
              </div>
            </div>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: agent.state === "done" ? "var(--accent)" : agent.state === "running" ? "var(--accent)" : agent.state === "error" ? "var(--red)" : "var(--border-md)",
              ...(agent.state === "running" ? { animation: "pulse-dot 1.2s infinite" } : {}),
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

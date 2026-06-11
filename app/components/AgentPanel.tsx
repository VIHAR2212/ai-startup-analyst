"use client";
type AgentState = "idle"|"running"|"done"|"error";
interface Agent { name:string; description:string; color:string; icon:string; state:AgentState; model:string; modelColor:string; }
interface Props { agents: Agent[]; }

const MODEL_COLORS: Record<string,string> = { Groq:"#f97316", Claude:"#7c6bff", Gemini:"#4dd9d9" };

export default function AgentPanel({ agents }: Props) {
  return (
    <div className="glass" style={{ padding:"16px" }}>
      <div className="field-label" style={{ marginBottom:12 }}>Agent council</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        {agents.map((agent) => (
          <div key={agent.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"0.5px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:agent.color+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>
              {agent.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:500 }}>{agent.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <span style={{ fontSize:10, padding:"1px 6px", borderRadius:99, background:(MODEL_COLORS[agent.model]||"#888")+"18", color:MODEL_COLORS[agent.model]||"#888", fontWeight:500 }}>
                  {agent.model}
                </span>
                <span style={{ fontSize:10, color:"var(--muted)" }}>
                  {agent.state==="running"?"Running…":agent.state==="done"?"Complete ✓":agent.state==="error"?"Failed":agent.description}
                </span>
              </div>
            </div>
            <div className={`agent-dot ${agent.state}`} />
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(124,107,255,0.06)", borderRadius:10, border:"0.5px solid rgba(124,107,255,0.15)" }}>
        <div style={{ fontSize:10, color:"var(--violet)", fontWeight:500, marginBottom:3 }}>⚡ AUTO-FAILOVER ACTIVE</div>
        <div style={{ fontSize:11, color:"var(--muted)", lineHeight:1.5 }}>If any model fails, the next auto-takes over. Zero downtime.</div>
      </div>
    </div>
  );
}

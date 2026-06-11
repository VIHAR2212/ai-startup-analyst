"use client";
type AgentState = "idle"|"running"|"done"|"error";
interface Agent { name:string; description:string; color:string; icon:string; state:AgentState; model:string; modelColor:string; }
const MC: Record<string,string> = { Groq:"#d4841a", Claude:"#c0a060", Gemini:"#50b4b4" };
export default function AgentPanel({ agents }: { agents: Agent[] }) {
  return (
    <div className="glass" style={{ padding:16 }}>
      <div className="field-label" style={{ marginBottom:12 }}>Agent council</div>
      {agents.map((a) => (
        <div key={a.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"0.5px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(212,132,26,0.08)", border:"0.5px solid rgba(212,132,26,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{a.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:500, color:"var(--off-white)" }}>{a.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
              <span style={{ fontSize:9, padding:"1px 6px", borderRadius:99, background:(MC[a.model]||"#888")+"18", color:MC[a.model]||"#888", fontWeight:600, letterSpacing:"0.04em" }}>{a.model}</span>
              <span style={{ fontSize:9, color:"var(--hint)" }}>{a.state==="running"?"Running…":a.state==="done"?"Done ✓":a.state==="error"?"Error":a.description}</span>
            </div>
          </div>
          <div className={`agent-dot ${a.state}`}/>
        </div>
      ))}
      <div style={{ marginTop:12, padding:"10px 12px", background:"rgba(212,132,26,0.05)", borderRadius:10, border:"0.5px solid rgba(212,132,26,0.12)" }}>
        <div style={{ fontSize:9, color:"var(--amber-3)", fontWeight:600, letterSpacing:"0.08em", marginBottom:3 }}>AUTO-FAILOVER ACTIVE</div>
        <div style={{ fontSize:11, color:"var(--hint)", lineHeight:1.5 }}>If any model fails, next one takes over instantly.</div>
      </div>
    </div>
  );
}

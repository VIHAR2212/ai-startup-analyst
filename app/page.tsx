"use client";
import { useState } from "react";
import AgentPanel from "./components/AgentPanel";
import ReportView from "./components/ReportView";

type AgentState = "idle"|"running"|"done"|"error";
interface HistoryEntry { idea:string; capital:string; country:string; market:string; report:any; ts:number; }

const AGENTS_CONFIG = [
  { name:"Market Research",     description:"Trends & demand",   color:"#4ade80", icon:"📈", model:"Groq",   modelColor:"#f97316" },
  { name:"Competitor Analysis", description:"Landscape mapping", color:"#5b8fff", icon:"⚔️",  model:"Claude", modelColor:"#7c6bff" },
  { name:"Business Strategy",   description:"Growth & models",   color:"#ffb347", icon:"♟️",  model:"Groq",   modelColor:"#f97316" },
  { name:"Scoring Agent",       description:"Viability 0–100",   color:"#ff6b9d", icon:"📊", model:"Groq",   modelColor:"#f97316" },
  { name:"Bootstrap Advisor",   description:"How to start lean", color:"#4dd9d9", icon:"💡", model:"Claude", modelColor:"#7c6bff" },
  { name:"Synthesizer",         description:"Final report",      color:"#7c6bff", icon:"🧠", model:"Claude", modelColor:"#7c6bff" },
];

const STAGE_LABELS = [
  "⚡ Groq/Llama scanning market data…",
  "🔮 Claude mapping competitor landscape…",
  "⚡ Groq building growth strategy…",
  "⚡ Groq computing viability scores…",
  "🔮 Claude crafting bootstrap roadmap…",
  "🧠 Claude synthesizing final intelligence report…",
];

const CAPITAL_PRESETS: Record<string,string[]> = {
  India:       ["₹10K–₹50K","₹50K–₹2L","₹2L–₹10L","₹10L–₹50L","₹50L+"],
  USA:         ["$1K–$5K","$5K–$25K","$25K–$100K","$100K–$500K","$500K+"],
  UK:          ["£1K–£5K","£5K–£20K","£20K–£100K","£100K+"],
  Germany:     ["€1K–€5K","€5K–€25K","€25K–€100K","€100K+"],
  Australia:   ["A$2K–A$10K","A$10K–A$50K","A$50K+"],
  Canada:      ["C$2K–C$10K","C$10K–C$50K","C$50K+"],
  Singapore:   ["S$5K–S$25K","S$25K–S$100K","S$100K+"],
  UAE:         ["AED 10K–50K","AED 50K–200K","AED 200K+"],
  default:     ["$1K–$5K","$5K–$25K","$25K–$100K","$100K+"],
};

const COUNTRIES = ["India","USA","UK","Germany","France","Australia","Canada","Singapore","UAE","Japan","Brazil","South Africa","Netherlands","Sweden","Nigeria","Kenya"];
const FLAGS: Record<string,string> = { India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦",Netherlands:"🇳🇱",Sweden:"🇸🇪",Nigeria:"🇳🇬",Kenya:"🇰🇪" };
const EXAMPLES = ["AI-powered personal finance coach for Gen Z","Hardware store with Blinkit-style delivery","Agarbatti brand for modern Hindu households","SaaS for college exam prep with spaced repetition"];

export default function Home() {
  const [idea,    setIdea]    = useState("");
  const [capital, setCapital] = useState("");
  const [country, setCountry] = useState("India");
  const [market,  setMarket]  = useState<"domestic"|"international">("domestic");
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<AgentState[]>(["idle","idle","idle","idle","idle","idle"]);
  const [report,   setReport]   = useState<any>(null);
  const [curIdea,  setCurIdea]  = useState("");
  const [curCap,   setCurCap]   = useState("");
  const [curCountry,setCurCountry] = useState("India");
  const [curMarket, setCurMarket]  = useState("domestic");
  const [history,  setHistory]  = useState<HistoryEntry[]>([]);
  const [activeIdx,setActiveIdx] = useState<number|null>(null);
  const [error,    setError]    = useState("");

  const agents = AGENTS_CONFIG.map((a,i)=>({...a,state:agentStates[i]}));
  const presets = CAPITAL_PRESETS[country]||CAPITAL_PRESETS.default;

  async function analyze() {
    if (!idea.trim()||loading) return;
    setError(""); setLoading(true); setReport(null); setActiveIdx(null);
    setAgentStates(["idle","idle","idle","idle","idle","idle"]);
    setProgress(0); setStageIdx(-1);
    const stageP=[15,30,47,62,78,93];
    let si=0;
    const interval=setInterval(()=>{
      if(si<AGENTS_CONFIG.length){
        setStageIdx(si); setProgress(stageP[si]);
        if(si>0) setAgentStates(p=>p.map((s,i)=>i===si-1?"done":s));
        setAgentStates(p=>p.map((s,i)=>i===si?"running":s));
        si++;
      }
    },2200);
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea,capital:capital||"Not specified",country,market})});
      clearInterval(interval);
      if(!res.ok){const e=await res.json();throw new Error(e.details||e.error||"API error");}
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setAgentStates(["done","done","done","done","done","done"]);
      setProgress(100);
      const entry={idea,capital,country,market,report:data.report,ts:Date.now()};
      setHistory(p=>[entry,...p]);
      setReport(data.report); setCurIdea(idea); setCurCap(capital); setCurCountry(country); setCurMarket(market);
      setActiveIdx(0);
    } catch(err) {
      clearInterval(interval);
      const msg=String(err).replace("Error:","").trim();
      setError(msg.length>140?msg.slice(0,140)+"…":msg);
      setAgentStates(p=>p.map(s=>s==="running"?"error":s));
    }
    setLoading(false);
  }

  function loadHistory(i:number){const e=history[i];setReport(e.report);setCurIdea(e.idea);setCurCap(e.capital);setCurCountry(e.country);setCurMarket(e.market);setActiveIdx(i);}

  return (
    <div style={{minHeight:"100vh",background:"var(--black)",position:"relative",overflow:"hidden"}}>

      {/* ── Ambient aurora blobs ── */}
      <div className="blob" style={{width:600,height:600,background:"rgba(124,107,255,0.07)",top:-200,right:-100,animationDuration:"14s"}}/>
      <div className="blob" style={{width:400,height:400,background:"rgba(77,137,255,0.06)",bottom:100,left:-100,animationDuration:"18s",animationDelay:"-6s"}}/>
      <div className="blob" style={{width:300,height:300,background:"rgba(255,107,157,0.04)",top:"40%",right:"30%",animationDuration:"22s",animationDelay:"-10s"}}/>

      {/* ── Navbar ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,borderBottom:"0.5px solid var(--glass-border)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",background:"rgba(6,6,10,0.8)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:16}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:8}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c6bff,#5b8fff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"0 0 16px rgba(124,107,255,0.4)"}}>🧠</div>
            <span style={{fontWeight:700,fontSize:14,letterSpacing:"-0.01em"}}>Startup Intelligence</span>
          </div>
          {/* Model badges */}
          <div style={{display:"flex",gap:6}}>
            {[["⚡","Groq","#f97316"],["🔮","Claude","#7c6bff"],["✨","Gemini","#4dd9d9"]].map(([icon,name,color])=>(
              <span key={name} className="chip" style={{background:(color as string)+"12",color:color as string,borderColor:(color as string)+"25"}}>{icon} {name}</span>
            ))}
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <span className="chip chip-violet">⚡ 6 agents · 3 models</span>
          </div>
        </div>
      </nav>

      {/* ── Main layout ── */}
      <div className="main-layout" style={{display:"grid",gridTemplateColumns:"320px 1fr",maxWidth:1400,margin:"0 auto",minHeight:"calc(100vh - 56px)",gap:0}}>

        {/* ── Sidebar ── */}
        <aside className="sidebar-panel" style={{borderRight:"0.5px solid var(--glass-border)",padding:"20px 16px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto",position:"sticky",top:56,height:"calc(100vh - 56px)"}}>

          {/* Input card */}
          <div className="glass" style={{padding:"18px"}}>

            {/* Idea textarea */}
            <div className="field-label">Startup idea</div>
            <textarea className="input-field" value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&analyze()} placeholder="Describe your startup idea in detail…" rows={4} style={{minHeight:90}}/>

            {/* Country */}
            <div className="field-label" style={{marginTop:14}}>Country</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none",zIndex:1}}>{FLAGS[country]||"🌍"}</span>
              <select className="input-field" value={country} onChange={e=>{setCountry(e.target.value);setCapital("");}} style={{paddingLeft:36}}>
                {COUNTRIES.map(c=><option key={c} value={c}>{FLAGS[c]||"🌍"} {c}</option>)}
              </select>
            </div>

            {/* Market type */}
            <div className="field-label" style={{marginTop:14}}>Market type</div>
            <div style={{display:"flex",gap:6}}>
              {(["domestic","international"] as const).map(m=>(
                <button key={m} onClick={()=>setMarket(m)} style={{flex:1,padding:"9px 0",fontSize:12,fontWeight:500,borderRadius:10,border:`0.5px solid ${market===m?"rgba(124,107,255,0.4)":"var(--glass-border)"}`,background:market===m?"rgba(124,107,255,0.12)":"transparent",color:market===m?"var(--violet)":"var(--muted)",cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit"}}>
                  {m==="domestic"?`🏠 ${country.slice(0,8)}…`:"🌍 Global"}
                </button>
              ))}
            </div>

            {/* Capital */}
            <div className="field-label" style={{marginTop:14}}>Available capital</div>
            <input className="input-field" value={capital} onChange={e=>setCapital(e.target.value)} placeholder={`e.g. ${presets[1]||"$10,000"}`}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
              {presets.map(p=>(
                <button key={p} onClick={()=>setCapital(p)} style={{fontSize:10,padding:"3px 8px",borderRadius:99,background:capital===p?"rgba(124,107,255,0.15)":"var(--black-4)",color:capital===p?"var(--violet)":"var(--muted)",border:`0.5px solid ${capital===p?"rgba(124,107,255,0.3)":"var(--glass-border)"}`,cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit"}}>{p}</button>
              ))}
            </div>

            <div style={{fontSize:10,color:"var(--hint)",margin:"10px 0 12px",textAlign:"center"}}>Ctrl+Enter to analyze</div>

            <button className="btn-primary" style={{width:"100%",justifyContent:"center",fontSize:14}} onClick={analyze} disabled={loading||!idea.trim()}>
              {loading?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Analyzing…</>:<>🚀 Analyze startup</>}
            </button>

            {error && (
              <div style={{marginTop:10,padding:"10px 12px",background:"rgba(255,107,107,0.08)",border:"0.5px solid rgba(255,107,107,0.2)",borderRadius:10,fontSize:11,color:"#ff6b6b",lineHeight:1.5}}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Examples */}
          <div className="glass" style={{padding:"14px"}}>
            <div className="field-label" style={{marginBottom:8}}>Try an example</div>
            {EXAMPLES.map((ex,i)=>(
              <button key={i} onClick={()=>setIdea(ex)} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"0.5px solid transparent",borderRadius:8,padding:"7px 8px",fontSize:11,color:"var(--muted)",cursor:"pointer",transition:"all 0.15s",marginBottom:2,fontFamily:"inherit",lineHeight:1.4}}
                onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="var(--black-4)";(e.currentTarget as HTMLElement).style.color="var(--white)";(e.currentTarget as HTMLElement).style.borderColor="var(--glass-border)";}}
                onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color="var(--muted)";(e.currentTarget as HTMLElement).style.borderColor="transparent";}}>
                {ex}
              </button>
            ))}
          </div>

          <AgentPanel agents={agents}/>

          {/* Progress */}
          {loading&&stageIdx>=0&&(
            <div className="glass" style={{padding:"14px"}}>
              <div style={{fontSize:12,marginBottom:10,lineHeight:1.5}}>{STAGE_LABELS[stageIdx]||"Finalizing…"}</div>
              <div style={{height:2,background:"var(--black-4)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#7c6bff,#5b8fff,#4dd9d9)",borderRadius:2,transition:"width 0.5s ease"}}/>
              </div>
              <div style={{fontSize:10,color:"var(--hint)",marginTop:6,textAlign:"right"}}>{progress}%</div>
            </div>
          )}

          {/* History */}
          {history.length>0&&(
            <div className="glass" style={{padding:"14px"}}>
              <div className="field-label" style={{marginBottom:8}}>Analysis history</div>
              {history.map((e,i)=>(
                <button key={e.ts} onClick={()=>loadHistory(i)} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:10,border:`0.5px solid ${i===activeIdx?"rgba(124,107,255,0.3)":"transparent"}`,background:i===activeIdx?"rgba(124,107,255,0.08)":"transparent",cursor:"pointer",marginBottom:4,transition:"all 0.15s",fontFamily:"inherit"}}>
                  <div style={{fontSize:12,fontWeight:500,color:"var(--white)",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.report.startupName}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:10,color:"var(--muted)"}}>{FLAGS[e.country]||"🌍"} {e.country}</span>
                    <span style={{fontSize:10,color:"var(--hint)"}}>·</span>
                    <span style={{fontSize:10,color:e.report.overallScore>=68?"var(--green)":e.report.overallScore>=48?"var(--amber)":"#ff6b6b",fontWeight:600}}>{e.report.overallScore}/100</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* ── Content area ── */}
        <main style={{padding:"24px",overflowY:"auto",position:"relative"}}>

          {/* Welcome state */}
          {!report&&!loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",gap:32,padding:"3rem 2rem",textAlign:"center"}}>
              {/* Hero title */}
              <div>
                <div className="chip chip-violet" style={{marginBottom:20,fontSize:12}}>✦ Multi-model AI · 6 agents · 3 models</div>
                <h1 className="display-xl" style={{marginBottom:16}}>
                  <span className="grad-text">Startup Intelligence</span><br/>
                  <span style={{color:"var(--muted)",fontWeight:300}}>that thinks like a VC</span>
                </h1>
                <p style={{fontSize:16,color:"var(--muted)",maxWidth:480,lineHeight:1.7,margin:"0 auto"}}>
                  Enter your idea, country, and capital. Get a brutally honest VC-grade report with market sizing, competitor map, scores, and a step-by-step launch roadmap.
                </p>
              </div>

              {/* Model cards */}
              <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
                {[
                  {icon:"⚡",name:"Groq / Llama 3.3",role:"Market research & scoring",color:"#f97316",desc:"270 tok/s — fastest inference"},
                  {icon:"🔮",name:"Claude / Haiku",role:"Competitor analysis & synthesis",color:"#7c6bff",desc:"Best structured reasoning"},
                  {icon:"✨",name:"Gemini / Flash",role:"Business strategy",color:"#4dd9d9",desc:"Creative strategy thinking"},
                ].map(m=>(
                  <div key={m.name} className="glass glass-hover" style={{padding:"20px 22px",borderRadius:16,textAlign:"center",minWidth:160,cursor:"default"}}>
                    <div style={{fontSize:28,marginBottom:10}}>{m.icon}</div>
                    <div style={{fontSize:13,fontWeight:600,color:m.color,marginBottom:4}}>{m.name}</div>
                    <div style={{fontSize:11,color:"var(--muted)",marginBottom:6,lineHeight:1.4}}>{m.role}</div>
                    <div style={{fontSize:10,color:"var(--hint)"}}>{m.desc}</div>
                  </div>
                ))}
              </div>

              {/* Feature chips */}
              <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",maxWidth:600}}>
                {["📈 Market sizing","⚔️ Competitor map","🛡️ SWOT analysis","⚠️ Risk scan + solutions","💡 Bootstrap roadmap","💰 Business models","📊 Score breakdown","📉 Revenue projection","🥧 Capital allocation","🏆 Investment verdict","📧 Email report"].map(f=>(
                  <span key={f} className="chip" style={{background:"var(--black-3)",borderColor:"var(--glass-border)",color:"var(--muted)",fontSize:11}}>{f}</span>
                ))}
              </div>

              {/* Country examples */}
              <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
                {[["🇮🇳","India","₹ INR","Local market intelligence"],["🇺🇸","USA","$ USD","Silicon Valley context"],["🌍","Global","Multi-currency","International expansion"]].map(([flag,name,cur,sub])=>(
                  <div key={name} className="glass" style={{padding:"14px 20px",borderRadius:14,textAlign:"center",minWidth:130}}>
                    <div style={{fontSize:24,marginBottom:6}}>{flag}</div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{name}</div>
                    <div style={{fontSize:11,color:"var(--violet)",marginBottom:4,fontWeight:500}}>{cur}</div>
                    <div style={{fontSize:10,color:"var(--hint)"}}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",gap:24}}>
              <div style={{position:"relative",width:64,height:64}}>
                <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid var(--glass-border)",borderTopColor:"var(--violet)",animation:"spin 0.8s linear infinite"}}/>
                <div style={{position:"absolute",inset:6,borderRadius:"50%",border:"2px solid transparent",borderLeftColor:"var(--cyan)",animation:"spin 1.4s linear infinite reverse"}}/>
                <div style={{position:"absolute",inset:12,borderRadius:"50%",border:"1.5px solid transparent",borderRightColor:"var(--rose)",animation:"spin 2s linear infinite"}}/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:500,textAlign:"center",marginBottom:8}}>{stageIdx>=0?STAGE_LABELS[stageIdx]:"Initializing agents…"}</div>
                <div style={{fontSize:12,color:"var(--muted)",textAlign:"center"}}>Analyzing for {FLAGS[country]||"🌍"} {country} · {market} market</div>
              </div>
              <div style={{width:280,height:2,background:"var(--black-4)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#7c6bff,#5b8fff,#4dd9d9)",borderRadius:2,transition:"width 0.5s ease"}}/>
              </div>
              <div style={{fontSize:11,color:"var(--hint)"}}>{progress}% · 6 agents running in parallel</div>
            </div>
          )}

          {/* Report */}
          {report&&!loading&&(
            <ReportView report={report} idea={curIdea} capital={curCap} country={curCountry} market={curMarket}/>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

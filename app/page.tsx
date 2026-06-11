"use client";
import { useState } from "react";
import AgentPanel from "./components/AgentPanel";
import ReportView from "./components/ReportView";

type AgentState = "idle"|"running"|"done"|"error";

const AGENTS = [
  { name:"Market Research",     description:"Trends & demand",  color:"#d4841a", icon:"📈", model:"Groq",   modelColor:"#d4841a" },
  { name:"Competitor Analysis", description:"Landscape",        color:"#c0a060", icon:"⚔️",  model:"Claude", modelColor:"#c0a060" },
  { name:"Business Strategy",   description:"Growth & models",  color:"#d4841a", icon:"♟️",  model:"Groq",   modelColor:"#d4841a" },
  { name:"Scoring Agent",       description:"Viability 0–100",  color:"#d4841a", icon:"📊", model:"Groq",   modelColor:"#d4841a" },
  { name:"Bootstrap Advisor",   description:"Launch roadmap",   color:"#c0a060", icon:"💡", model:"Claude", modelColor:"#c0a060" },
  { name:"Synthesizer",         description:"Final report",     color:"#c0a060", icon:"🧠", model:"Claude", modelColor:"#c0a060" },
];

const STAGES = [
  "Groq/Llama scanning market data…",
  "Claude mapping competitor landscape…",
  "Groq building growth strategy…",
  "Groq computing viability scores…",
  "Claude crafting bootstrap roadmap…",
  "Claude synthesizing final report…",
];

const PRESETS: Record<string,string[]> = {
  India:["₹10K–₹50K","₹50K–₹2L","₹2L–₹10L","₹10L–₹50L","₹50L+"],
  USA:["$1K–$5K","$5K–$25K","$25K–$100K","$100K+"],
  UK:["£1K–£10K","£10K–£50K","£50K+"],
  Germany:["€2K–€10K","€10K–€50K","€50K+"],
  default:["$1K–$5K","$5K–$25K","$25K–$100K","$100K+"],
};

const COUNTRIES = ["India","USA","UK","Germany","France","Australia","Canada","Singapore","UAE","Japan","Brazil","South Africa","Netherlands","Nigeria","Kenya"];
const FLAGS: Record<string,string> = {India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦",Netherlands:"🇳🇱",Nigeria:"🇳🇬",Kenya:"🇰🇪"};
const EXAMPLES = ["AI-powered finance coach for Gen Z","Agarbatti brand for modern Hindu homes","Hardware store with Blinkit-style delivery","SaaS for CA exam prep in India"];

export default function Home() {
  const [idea,setIdea]=useState(""); const [capital,setCapital]=useState("");
  const [country,setCountry]=useState("India"); const [market,setMarket]=useState<"domestic"|"international">("domestic");
  const [loading,setLoading]=useState(false); const [si,setSi]=useState(-1); const [prog,setProg]=useState(0);
  const [states,setStates]=useState<AgentState[]>(["idle","idle","idle","idle","idle","idle"]);
  const [report,setReport]=useState<any>(null); const [cIdea,setCIdea]=useState(""); const [cCap,setCCap]=useState("");
  const [cCountry,setCCountry]=useState("India"); const [cMarket,setCMarket]=useState("domestic");
  const [history,setHistory]=useState<any[]>([]); const [activeIdx,setActiveIdx]=useState<number|null>(null);
  const [error,setError]=useState("");

  const agents=AGENTS.map((a,i)=>({...a,state:states[i]}));
  const presets=PRESETS[country]||PRESETS.default;

  async function analyze(){
    if(!idea.trim()||loading)return;
    setError("");setLoading(true);setReport(null);setActiveIdx(null);
    setStates(["idle","idle","idle","idle","idle","idle"]);setProg(0);setSi(-1);
    const sp=[15,30,47,62,78,93];let idx=0;
    const iv=setInterval(()=>{
      if(idx<AGENTS.length){
        setSi(idx);setProg(sp[idx]);
        if(idx>0)setStates(p=>p.map((s,i)=>i===idx-1?"done":s));
        setStates(p=>p.map((s,i)=>i===idx?"running":s));
        idx++;
      }
    },2200);
    try{
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea,capital:capital||"Not specified",country,market})});
      clearInterval(iv);
      if(!res.ok){const e=await res.json();throw new Error(e.details||e.error||"API error");}
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setStates(["done","done","done","done","done","done"]);setProg(100);
      const entry={idea,capital,country,market,report:data.report,ts:Date.now()};
      setHistory(p=>[entry,...p]);
      setReport(data.report);setCIdea(idea);setCCap(capital);setCCountry(country);setCMarket(market);setActiveIdx(0);
    }catch(err){
      clearInterval(iv);
      const msg=String(err).replace("Error:","").trim();
      setError(msg.length>140?msg.slice(0,140)+"…":msg);
      setStates(p=>p.map(s=>s==="running"?"error":s));
    }
    setLoading(false);
  }

  function loadH(i:number){const e=history[i];setReport(e.report);setCIdea(e.idea);setCCap(e.capital);setCCountry(e.country);setCMarket(e.market);setActiveIdx(i);}

  return (
    <div style={{minHeight:"100vh",background:"var(--black)",position:"relative",overflow:"hidden"}}>

      {/* ── Noon-style amber particle waves ── */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {/* Main amber orb — top right like Noon */}
        <div className="amber-orb" style={{width:700,height:500,background:"radial-gradient(ellipse,rgba(212,132,26,0.18) 0%,rgba(180,90,10,0.08) 50%,transparent 70%)",top:-180,right:-150,animationDuration:"20s"}}/>
        {/* Secondary warm orb — center */}
        <div className="amber-orb" style={{width:500,height:400,background:"radial-gradient(ellipse,rgba(240,160,60,0.08) 0%,transparent 65%)",top:"30%",left:"20%",animationDuration:"28s",animationDelay:"-8s"}}/>
        {/* Bottom warm glow */}
        <div className="amber-orb" style={{width:600,height:300,background:"radial-gradient(ellipse,rgba(200,100,20,0.06) 0%,transparent 70%)",bottom:-100,left:"10%",animationDuration:"24s",animationDelay:"-14s"}}/>
        {/* Subtle grain overlay */}
        <div style={{position:"absolute",inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",opacity:0.4}}/>
      </div>

      {/* ── Navbar ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,borderBottom:"0.5px solid rgba(255,255,255,0.06)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",background:"rgba(0,0,0,0.75)"}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 24px",height:54,display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#d4841a,#f5a623)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:"0 0 12px rgba(212,132,26,0.5)"}}>🧠</div>
            <span style={{fontWeight:600,fontSize:13,color:"var(--off-white)",letterSpacing:"-0.01em"}}>Startup Intelligence</span>
          </div>
          <div style={{display:"flex",gap:6,marginLeft:8}}>
            {[["⚡","Groq","#d4841a"],["◆","Claude","#c0a060"],["✦","Gemini","#50b4b4"]].map(([icon,name,color])=>(
              <span key={name} className="chip" style={{background:(color as string)+"10",color:color as string,borderColor:(color as string)+"22",fontSize:10}}>{icon} {name}</span>
            ))}
          </div>
          <div style={{marginLeft:"auto"}}>
            <span className="chip chip-amber" style={{fontSize:10}}>6 agents · 3 models</span>
          </div>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div className="main-layout" style={{display:"grid",gridTemplateColumns:"308px 1fr",maxWidth:1360,margin:"0 auto",minHeight:"calc(100vh - 54px)",position:"relative",zIndex:1}}>

        {/* ── Sidebar ── */}
        <aside className="sidebar-panel" style={{borderRight:"0.5px solid rgba(255,255,255,0.06)",padding:"18px 14px",display:"flex",flexDirection:"column",gap:10,overflowY:"auto",position:"sticky",top:54,height:"calc(100vh - 54px)"}}>

          <div className="glass" style={{padding:16}}>
            <div className="field-label">Your startup idea</div>
            <textarea className="input-field" value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&analyze()} placeholder="Describe your startup idea…" rows={4} style={{minHeight:88}}/>

            <div className="field-label" style={{marginTop:14}}>Country</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",zIndex:1}}>{FLAGS[country]||"🌍"}</span>
              <select className="input-field" value={country} onChange={e=>{setCountry(e.target.value);setCapital("");}} style={{paddingLeft:34}}>
                {COUNTRIES.map(c=><option key={c} value={c}>{FLAGS[c]||"🌍"} {c}</option>)}
              </select>
            </div>

            <div className="field-label" style={{marginTop:14}}>Market type</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {(["domestic","international"] as const).map(m=>(
                <button key={m} onClick={()=>setMarket(m)} style={{padding:"8px 0",fontSize:11,fontWeight:500,borderRadius:99,border:`0.5px solid ${market===m?"rgba(212,132,26,0.4)":"var(--glass-border)"}`,background:market===m?"rgba(212,132,26,0.1)":"transparent",color:market===m?"var(--amber-3)":"var(--muted)",cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit",letterSpacing:"0.01em"}}>
                  {m==="domestic"?`🏠 ${country.length>7?country.slice(0,7)+"…":country}`:"🌍 International"}
                </button>
              ))}
            </div>

            <div className="field-label" style={{marginTop:14}}>Available capital</div>
            <input className="input-field" value={capital} onChange={e=>setCapital(e.target.value)} placeholder={presets[1]||"e.g. $10,000"}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:7}}>
              {presets.map(p=>(
                <button key={p} onClick={()=>setCapital(p)} style={{fontSize:9,padding:"3px 8px",borderRadius:99,background:capital===p?"rgba(212,132,26,0.12)":"var(--black-4)",color:capital===p?"var(--amber-3)":"var(--hint)",border:`0.5px solid ${capital===p?"rgba(212,132,26,0.3)":"var(--glass-border)"}`,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{p}</button>
              ))}
            </div>

            <div style={{fontSize:9,color:"var(--hint)",textAlign:"center",margin:"10px 0 12px",letterSpacing:"0.04em"}}>Ctrl+Enter to run analysis</div>

            <button className="btn-primary" style={{width:"100%"}} onClick={analyze} disabled={loading||!idea.trim()}>
              {loading
                ? <><span style={{width:13,height:13,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#000",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Analyzing…</>
                : <>🚀 Analyze Startup</>}
            </button>

            {error&&<div style={{marginTop:10,padding:"10px 12px",background:"rgba(224,85,85,0.07)",border:"0.5px solid rgba(224,85,85,0.2)",borderRadius:10,fontSize:11,color:"#e05555",lineHeight:1.5}}>⚠️ {error}</div>}
          </div>

          {/* Examples */}
          <div className="glass" style={{padding:14}}>
            <div className="field-label" style={{marginBottom:8}}>Try an example</div>
            {EXAMPLES.map((ex,i)=>(
              <button key={i} onClick={()=>setIdea(ex)} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",padding:"7px 8px",fontSize:11,color:"var(--muted)",cursor:"pointer",fontFamily:"inherit",lineHeight:1.4,borderRadius:8,transition:"all 0.15s"}}
                onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="var(--black-4)";(e.currentTarget as HTMLElement).style.color="var(--off-white)";}}
                onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color="var(--muted)";}}>
                {ex}
              </button>
            ))}
          </div>

          <AgentPanel agents={agents}/>

          {loading&&si>=0&&(
            <div className="glass" style={{padding:14}}>
              <div style={{fontSize:11,marginBottom:10,lineHeight:1.5,color:"var(--muted)"}}>{STAGES[si]}</div>
              <div style={{height:1.5,background:"var(--black-5)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#d4841a,#f5a623)",borderRadius:2,transition:"width 0.5s ease"}}/>
              </div>
              <div style={{fontSize:9,color:"var(--hint)",marginTop:6,textAlign:"right",letterSpacing:"0.04em"}}>{prog}% COMPLETE</div>
            </div>
          )}

          {history.length>0&&(
            <div className="glass" style={{padding:14}}>
              <div className="field-label" style={{marginBottom:8}}>History</div>
              {history.map((e,i)=>(
                <button key={e.ts} onClick={()=>loadH(i)} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 10px",borderRadius:10,border:`0.5px solid ${i===activeIdx?"rgba(212,132,26,0.25)":"transparent"}`,background:i===activeIdx?"rgba(212,132,26,0.06)":"transparent",cursor:"pointer",marginBottom:3,fontFamily:"inherit",transition:"all 0.15s"}}>
                  <div style={{fontSize:11,fontWeight:500,color:"var(--off-white)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:3}}>{e.report.startupName}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:9,color:"var(--muted)"}}>{FLAGS[e.country]||"🌍"} {e.country}</span>
                    <span style={{fontSize:9,color:"var(--hint)"}}>·</span>
                    <span style={{fontSize:9,fontWeight:600,color:e.report.overallScore>=68?"#5cb85c":e.report.overallScore>=48?"#d4841a":"#e05555"}}>{e.report.overallScore}/100</span>
                    <span style={{fontSize:9,color:"var(--hint)"}}>·</span>
                    <span style={{fontSize:9,color:"var(--hint)"}}>{e.report.verdict}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main style={{padding:"28px 24px",overflowY:"auto",position:"relative"}}>

          {/* Welcome */}
          {!report&&!loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",gap:36,padding:"2rem",textAlign:"center"}}>

              <div>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",background:"rgba(212,132,26,0.08)",border:"0.5px solid rgba(212,132,26,0.2)",borderRadius:99,fontSize:11,color:"var(--amber-3)",marginBottom:24,letterSpacing:"0.04em"}}>
                  ✦ Multi-agent AI · 6 agents · 3 models
                </div>

                <h1 className="display-xl" style={{marginBottom:16}}>
                  <span className="grad-text">Startup Intelligence</span><br/>
                  <span style={{color:"var(--hint)",fontWeight:300,fontSize:"clamp(28px,3.5vw,52px)"}}>that thinks like a VC</span>
                </h1>

                <p style={{fontSize:15,color:"var(--muted)",maxWidth:500,lineHeight:1.75,margin:"0 auto"}}>
                  Enter your idea, country & capital. Get a brutally honest VC-grade report — market sizing, competitor map, scores, revenue projections, and a step-by-step launch roadmap.
                </p>
              </div>

              {/* Noon-style feature grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:560}}>
                {[
                  {icon:"⚡",name:"Groq / Llama",sub:"270 tok/s · Market research",color:"#d4841a"},
                  {icon:"◆",name:"Claude / Haiku",sub:"Best reasoning · Synthesis",color:"#c0a060"},
                  {icon:"✦",name:"Gemini / Flash",sub:"Creative strategy",color:"#50b4b4"},
                ].map(m=>(
                  <div key={m.name} className="glass glass-hover" style={{padding:"18px 16px",borderRadius:14,textAlign:"center",cursor:"default"}}>
                    <div style={{fontSize:22,marginBottom:8,filter:`drop-shadow(0 0 8px ${m.color}66)`}}>{m.icon}</div>
                    <div style={{fontSize:11,fontWeight:600,color:m.color,marginBottom:4,letterSpacing:"0.02em"}}>{m.name}</div>
                    <div style={{fontSize:9,color:"var(--hint)",lineHeight:1.4}}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Feature tags */}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",maxWidth:560}}>
                {["📈 Market sizing","⚔️ Competitors","🛡️ SWOT","⚠️ Risk mitigation","💡 Bootstrap guide","💰 Business models","📊 Score breakdown","📉 Revenue chart","🥧 Capital allocation","🏆 Investment verdict","📧 Email report"].map(f=>(
                  <span key={f} className="chip chip-white" style={{fontSize:10}}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"80vh",gap:28}}>
              {/* Noon-style triple spinner */}
              <div style={{position:"relative",width:72,height:72}}>
                <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(212,132,26,0.15)",borderTopColor:"#d4841a",animation:"spin 0.9s linear infinite"}}/>
                <div style={{position:"absolute",inset:8,borderRadius:"50%",border:"1.5px solid transparent",borderLeftColor:"#f5a623",animation:"spin 1.5s linear infinite reverse"}}/>
                <div style={{position:"absolute",inset:16,borderRadius:"50%",border:"1px solid transparent",borderRightColor:"#c96b12",animation:"spin 2.2s linear infinite"}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🧠</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:6,color:"var(--off-white)"}}>{si>=0?STAGES[si]:"Initializing agents…"}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{FLAGS[country]||"🌍"} {country} · {market} market</div>
              </div>
              <div style={{width:260,height:1.5,background:"var(--black-5)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#c96b12,#d4841a,#f5a623)",borderRadius:2,transition:"width 0.5s ease",boxShadow:"0 0 8px rgba(212,132,26,0.5)"}}/>
              </div>
              <div style={{fontSize:10,color:"var(--hint)",letterSpacing:"0.06em"}}>{prog}% — 6 AGENTS RUNNING IN PARALLEL</div>
            </div>
          )}

          {/* Report */}
          {report&&!loading&&<ReportView report={report} idea={cIdea} capital={cCap} country={cCountry} market={cMarket}/>}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

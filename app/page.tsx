"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import InputPage from "./components/InputPage";
import LoadingPage from "./components/LoadingPage";
import ResultsPage from "./components/ResultsPage";

const FLAGS: Record<string,string> = {India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦",Netherlands:"🇳🇱",Nigeria:"🇳🇬",Kenya:"🇰🇪"};

type Stage = "input"|"loading"|"results";

export default function Home() {
  const [stage,setStage]=useState<Stage>("input");
  const [idea,setIdea]=useState(""); const [capital,setCapital]=useState("");
  const [country,setCountry]=useState("India"); const [market,setMarket]=useState<"domestic"|"international">("domestic");
  const [progress,setProg]=useState(0); const [stageIdx,setStageIdx]=useState(-1);
  const [report,setReport]=useState<any>(null);
  const [cIdea,setCIdea]=useState(""); const [cCap,setCCap]=useState(""); const [cCountry,setCCountry]=useState("India"); const [cMarket,setCMarket]=useState("domestic");
  const [history,setHistory]=useState<any[]>([]);
  const [error,setError]=useState("");

  async function analyze(){
    if(!idea.trim())return;
    setError("");setStage("loading");setProg(0);setStageIdx(-1);
    const sp=[15,30,47,62,78,93];let idx=0;
    const iv=setInterval(()=>{ if(idx<6){setStageIdx(idx);setProg(sp[idx]);idx++;} },2200);
    try{
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea,capital:capital||"Not specified",country,market})});
      clearInterval(iv);
      if(!res.ok){const e=await res.json();throw new Error(e.details||e.error||"API error");}
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setProg(100);setStageIdx(5);
      const entry={idea,capital,country,market,report:data.report,ts:Date.now()};
      setHistory(p=>[entry,...p]);
      setReport(data.report);setCIdea(idea);setCCap(capital);setCCountry(country);setCMarket(market);
      setTimeout(()=>setStage("results"),500);
    }catch(err){
      clearInterval(iv);
      const msg=String(err).replace("Error:","").trim();
      setError(msg.length>140?msg.slice(0,140)+"…":msg);
      setStage("input");
    }
  }

  function loadHistory(i:number){
    const e=history[i];
    setReport(e.report);setCIdea(e.idea);setCCap(e.capital);setCCountry(e.country);setCMarket(e.market);
    setStage("results");
  }

  function newAnalysis(){
    setIdea("");setCapital("");setError("");
    setStage("input");
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--black)",position:"relative",overflow:"hidden"}}>

      {/* ── Ambient amber waves (Noon-style, persistent) ── */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div className="amber-orb" style={{width:700,height:500,background:"radial-gradient(ellipse,rgba(212,132,26,0.18) 0%,rgba(180,90,10,0.08) 50%,transparent 70%)",top:-180,right:-150,animationDuration:"20s"}}/>
        <div className="amber-orb" style={{width:500,height:400,background:"radial-gradient(ellipse,rgba(240,160,60,0.08) 0%,transparent 65%)",top:"30%",left:"20%",animationDuration:"28s",animationDelay:"-8s"}}/>
        <div className="amber-orb" style={{width:600,height:300,background:"radial-gradient(ellipse,rgba(200,100,20,0.06) 0%,transparent 70%)",bottom:-100,left:"10%",animationDuration:"24s",animationDelay:"-14s"}}/>
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

      <AnimatePresence mode="wait">
        {stage==="input" && (
          <InputPage
            idea={idea} setIdea={setIdea}
            capital={capital} setCapital={setCapital}
            country={country} setCountry={setCountry}
            market={market} setMarket={setMarket}
            error={error} onAnalyze={analyze}
            history={history} onLoadHistory={loadHistory}
          />
        )}
        {stage==="loading" && (
          <LoadingPage country={country} market={market} flag={FLAGS[country]||"🌍"} progress={progress} stageIdx={stageIdx}/>
        )}
        {stage==="results" && report && (
          <ResultsPage report={report} idea={cIdea} capital={cCap} country={cCountry} market={cMarket} onNewAnalysis={newAnalysis}/>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

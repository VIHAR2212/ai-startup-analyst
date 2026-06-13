"use client";
import { motion } from "framer-motion";

const PRESETS: Record<string,string[]> = {
  India:["₹10K–₹50K","₹50K–₹2L","₹2L–₹10L","₹10L–₹50L","₹50L+"],
  USA:["$1K–$5K","$5K–$25K","$25K–$100K","$100K+"],
  UK:["£1K–£10K","£10K–£50K","£50K+"],
  Germany:["€2K–€10K","€10K–€50K","€50K+"],
  default:["$1K–$5K","$5K–$25K","$25K–$100K","$100K+"],
};
const COUNTRIES = ["India","USA","UK","Germany","France","Australia","Canada","Singapore","UAE","Japan","Brazil","South Africa","Netherlands","Nigeria","Kenya"];
const FLAGS: Record<string,string> = {India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦",Netherlands:"🇳🇱",Nigeria:"🇳🇬",Kenya:"🇰🇪"};

interface Props {
  idea:string; setIdea:(v:string)=>void;
  capital:string; setCapital:(v:string)=>void;
  country:string; setCountry:(v:string)=>void;
  market:"domestic"|"international"; setMarket:(v:"domestic"|"international")=>void;
  email:string; setEmail:(v:string)=>void;
  error:string; onAnalyze:()=>void;
  history:any[]; onLoadHistory:(i:number)=>void;
}

export default function InputPage({idea,setIdea,capital,setCapital,country,setCountry,market,setMarket,email,setEmail,error,onAnalyze,history,onLoadHistory}:Props){
  const presets=PRESETS[country]||PRESETS.default;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <motion.div
      key="input"
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      exit={{opacity:0,y:-20,scale:0.98}}
      transition={{duration:0.4,ease:"easeOut"}}
      style={{minHeight:"calc(100vh - 54px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",position:"relative",zIndex:1}}
    >
      {/* Hero */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{textAlign:"center",marginBottom:24,maxWidth:640}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",background:"rgba(212,132,26,0.08)",border:"0.5px solid rgba(212,132,26,0.2)",borderRadius:99,fontSize:11,color:"var(--amber-3)",marginBottom:16,letterSpacing:"0.04em"}}>
          ✦ Multi-agent AI · 6 agents · 3 models
        </div>
        <h1 className="display-xl" style={{marginBottom:10}}>
          <span className="grad-text">Startup Intelligence</span><br/>
          <span style={{color:"var(--hint)",fontWeight:300,fontSize:"clamp(22px,3vw,42px)"}}>that thinks like a VC</span>
        </h1>
        <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,maxWidth:480,margin:"0 auto"}}>
          Enter your idea, country & capital for a brutally honest VC-grade report — market sizing, competitors, scores, revenue projections, and a launch roadmap.
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass" style={{padding:28,width:"100%",maxWidth:520,borderRadius:20}}>

        <div className="field-label">Your startup idea</div>
        <textarea className="input-field" value={idea} onChange={e=>setIdea(e.target.value)} onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&onAnalyze()} placeholder="Describe your startup idea in detail…" rows={4} style={{minHeight:96}}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
          <div>
            <div className="field-label">Country</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",zIndex:1}}>{FLAGS[country]||"🌍"}</span>
              <select className="input-field" value={country} onChange={e=>{setCountry(e.target.value);setCapital("");}} style={{paddingLeft:34}}>
                {COUNTRIES.map(c=><option key={c} value={c}>{FLAGS[c]||"🌍"} {c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="field-label">Market type</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {(["domestic","international"] as const).map(m=>(
                <button key={m} onClick={()=>setMarket(m)} style={{padding:"10px 0",fontSize:11,fontWeight:500,borderRadius:10,border:`0.5px solid ${market===m?"rgba(212,132,26,0.4)":"var(--glass-border)"}`,background:market===m?"rgba(212,132,26,0.1)":"var(--black-3)",color:market===m?"var(--amber-3)":"var(--muted)",cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit"}}>
                  {m==="domestic"?"🏠 Domestic":"🌍 Global"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-label" style={{marginTop:16}}>Available capital</div>
        <input className="input-field" value={capital} onChange={e=>setCapital(e.target.value)} placeholder={presets[1]||"e.g. $10,000"}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
          {presets.map(p=>(
            <button key={p} onClick={()=>setCapital(p)} style={{fontSize:10,padding:"4px 9px",borderRadius:99,background:capital===p?"rgba(212,132,26,0.12)":"var(--black-4)",color:capital===p?"var(--amber-3)":"var(--hint)",border:`0.5px solid ${capital===p?"rgba(212,132,26,0.3)":"var(--glass-border)"}`,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{p}</button>
          ))}
        </div>

        <div className="field-label" style={{marginTop:16}}>Email for your report</div>
        <input
          className="input-field"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&onAnalyze()}
          placeholder="you@example.com"
        />
        <div style={{fontSize:9,color:"var(--hint)",marginTop:6,lineHeight:1.5}}>
          Your VC-grade report will be emailed here once analysis completes.
        </div>

        <button className="btn-primary" style={{width:"100%",marginTop:22,padding:"14px 0",fontSize:15}} onClick={onAnalyze} disabled={!idea.trim()||!emailValid}>
          🚀 Analyze Startup
        </button>

        {error&&<div style={{marginTop:12,padding:"10px 12px",background:"rgba(224,85,85,0.07)",border:"0.5px solid rgba(224,85,85,0.2)",borderRadius:10,fontSize:11,color:"#e05555",lineHeight:1.5}}>⚠️ {error}</div>}

        <div style={{fontSize:9,color:"var(--hint)",textAlign:"center",marginTop:12,letterSpacing:"0.04em"}}>Ctrl+Enter to run analysis</div>
      </motion.div>

      {/* History */}
      {history.length>0&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="glass" style={{marginTop:28,padding:16,width:"100%",maxWidth:520,borderRadius:16}}>
          <div className="field-label" style={{marginBottom:10}}>Previous analyses</div>
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:200,overflowY:"auto"}}>
            {history.map((e,i)=>(
              <button key={e.ts} onClick={()=>onLoadHistory(i)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:10,border:"0.5px solid transparent",background:"transparent",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
                onMouseOver={e2=>{(e2.currentTarget as HTMLElement).style.background="var(--black-4)";}}
                onMouseOut={e2=>{(e2.currentTarget as HTMLElement).style.background="transparent";}}>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"var(--off-white)"}}>{e.report.startupName}</div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{FLAGS[e.country]||"🌍"} {e.country} · {e.capital||"—"}</div>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:e.report.overallScore>=68?"#5cb85c":e.report.overallScore>=48?"#d4841a":"#e05555"}}>{e.report.overallScore}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

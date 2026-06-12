"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  { icon:"📈", label:"Researching market & demand…",      sub:"Groq/Llama analyzing TAM, SAM, SOM" },
  { icon:"⚔️", label:"Finding real competitors…",          sub:"Claude mapping competitive landscape" },
  { icon:"♟️", label:"Building growth strategy…",          sub:"Groq generating business models" },
  { icon:"📊", label:"Computing viability scores…",        sub:"Groq scoring market, team, financials" },
  { icon:"💡", label:"Crafting bootstrap roadmap…",        sub:"Claude building your launch plan" },
  { icon:"🛡️", label:"Building SWOT & forecasting revenue…",sub:"Claude synthesizing final report" },
];

interface Props { country:string; market:string; flag:string; progress:number; stageIdx:number; }

export default function LoadingPage({country,market,flag,progress,stageIdx}:Props){
  const [dots,setDots]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setDots(d=>(d+1)%4),400);return()=>clearInterval(t);},[]);
  const stage = STAGES[Math.max(0,stageIdx)] || STAGES[0];

  return (
    <motion.div
      key="loading"
      initial={{opacity:0,scale:0.97}}
      animate={{opacity:1,scale:1}}
      exit={{opacity:0,scale:1.02}}
      transition={{duration:0.4,ease:"easeOut"}}
      style={{minHeight:"calc(100vh - 54px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1,padding:20}}
    >
      {/* Rotating ring loader */}
      <div style={{position:"relative",width:120,height:120,marginBottom:36}}>
        <motion.div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(212,132,26,0.12)",borderTopColor:"#d4841a"}} animate={{rotate:360}} transition={{duration:1.1,repeat:Infinity,ease:"linear"}}/>
        <motion.div style={{position:"absolute",inset:12,borderRadius:"50%",border:"2px solid transparent",borderLeftColor:"#f5a623"}} animate={{rotate:-360}} transition={{duration:1.8,repeat:Infinity,ease:"linear"}}/>
        <motion.div style={{position:"absolute",inset:24,borderRadius:"50%",border:"1.5px solid transparent",borderRightColor:"#c96b12"}} animate={{rotate:360}} transition={{duration:2.6,repeat:Infinity,ease:"linear"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <AnimatePresence mode="wait">
            <motion.div key={stage.icon} initial={{opacity:0,scale:0.5,rotate:-90}} animate={{opacity:1,scale:1,rotate:0}} exit={{opacity:0,scale:0.5,rotate:90}} transition={{duration:0.3}} style={{fontSize:36}}>
              {stage.icon}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Stage text */}
      <AnimatePresence mode="wait">
        <motion.div key={stageIdx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}} style={{textAlign:"center",marginBottom:8}}>
          <div style={{fontSize:18,fontWeight:600,color:"var(--off-white)",letterSpacing:"-0.01em"}}>
            {stage.label}{".".repeat(dots)}
          </div>
          <div style={{fontSize:12,color:"var(--muted)",marginTop:6}}>{stage.sub}</div>
        </motion.div>
      </AnimatePresence>

      <div style={{fontSize:11,color:"var(--hint)",marginBottom:28}}>{flag} {country} · {market} market</div>

      {/* Progress bar */}
      <div style={{width:320,height:2,background:"var(--black-5)",borderRadius:2,overflow:"hidden"}}>
        <motion.div style={{height:"100%",background:"linear-gradient(90deg,#c96b12,#d4841a,#f5a623)",borderRadius:2,boxShadow:"0 0 10px rgba(212,132,26,0.5)"}} animate={{width:`${progress}%`}} transition={{duration:0.5,ease:"easeOut"}}/>
      </div>
      <div style={{fontSize:10,color:"var(--hint)",marginTop:10,letterSpacing:"0.08em"}}>{progress}% — 6 AGENTS · 3 MODELS</div>

      {/* Stage dots */}
      <div style={{display:"flex",gap:8,marginTop:32}}>
        {STAGES.map((s,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <motion.div
              animate={{
                background: i<stageIdx ? "#5cb85c" : i===stageIdx ? "#d4841a" : "rgba(255,255,255,0.08)",
                scale: i===stageIdx ? 1.3 : 1,
              }}
              transition={{duration:0.3}}
              style={{width:7,height:7,borderRadius:"50%"}}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

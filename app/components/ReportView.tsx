"use client";
import ScoreGauge from "./ScoreGauge";
import BootstrapAdvisor from "./BootstrapAdvisor";
import EmailReport from "./EmailReport";
import RevenueChart from "./RevenueChart";
import FundingPieChart from "./FundingPieChart";

interface Props { report:any; idea:string; capital:string; country:string; market:string; }

const VERDICT = {
  invest: { label:"Strong Invest", chip:"chip-green",  titleColor:"#4ade80", bg:"rgba(74,222,128,0.06)",  border:"rgba(74,222,128,0.2)",  title:"Strong Investment Candidate" },
  watch:  { label:"Watch",         chip:"chip-amber",  titleColor:"#ffb347", bg:"rgba(255,179,71,0.06)",  border:"rgba(255,179,71,0.2)",  title:"Monitor & Revisit" },
  pass:   { label:"Pass",          chip:"chip-red",    titleColor:"#ff6b6b", bg:"rgba(255,107,107,0.06)", border:"rgba(255,107,107,0.2)", title:"Not Recommended at This Stage" },
};
const SEV_COLOR: Record<string,string> = { high:"#ff6b6b", medium:"#ffb347", low:"#4ade80" };
const FLAGS: Record<string,string> = { India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦" };

function SCard({icon,title,accent,children}:{icon:string;title:string;accent?:string;children:React.ReactNode}) {
  return (
    <div className="section-card fade-up">
      <div className="section-header" style={{background:"var(--black-3)"}}>
        <span style={{fontSize:16}}>{icon}</span>
        <span>{title}</span>
        {accent && <span className="chip chip-violet" style={{marginLeft:"auto",fontSize:10}}>{accent}</span>}
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function buildHTML(r:any,idea:string,capital:string):string{
  const vc=VERDICT[r.verdict as keyof typeof VERDICT]||VERDICT.watch;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${r.startupName}</title>
<style>body{font-family:Inter,sans-serif;background:#06060a;color:#f0f0f8;margin:0;padding:24px;font-size:13px;line-height:1.6}
.card{background:#0d0d14;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:14px;overflow:hidden}
.card-h{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);font-weight:500;font-size:13px}
.card-b{padding:16px 18px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.m{background:#12121c;padding:12px;border-radius:8px}.ml{font-size:10px;color:#6b6b8a;margin-bottom:2px}.mv{font-size:16px;font-weight:600}.mr{font-size:10px;color:#4a4a6a;margin-top:3px;font-style:italic}
.swot{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cell{padding:10px;border-radius:8px}
.S{background:#4ade8010;border:1px solid #4ade8030}.W{background:#ff6b6b10;border:1px solid #ff6b6b30}.O{background:#5b8fff10;border:1px solid #5b8fff30}.T{background:#ffb34710;border:1px solid #ffb34730}
.cl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.S .cl{color:#4ade80}.W .cl{color:#ff6b6b}.O .cl{color:#5b8fff}.T .cl{color:#ffb347}
li{font-size:11px;margin-bottom:3px}.verd{padding:16px;border-radius:10px;background:${vc.bg};border:1px solid ${vc.border}}
.vt{font-size:14px;font-weight:600;color:${vc.titleColor};margin-bottom:8px}
</style></head><body>
<div class="card"><div class="card-b">
<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">${r.startupName}</h1>
<p style="color:#6b6b8a;margin:0 0 10px;font-size:12px">${r.tagline}</p>
<p style="font-size:11px;color:#6b6b8a">Idea: ${idea} | Capital: ${capital} | Country: ${r.country} | Industry: ${r.industry}</p>
<p style="font-size:28px;font-weight:700;margin:10px 0 0;color:${r.overallScore>=68?"#4ade80":r.overallScore>=48?"#ffb347":"#ff6b6b"}">${r.overallScore}<span style="font-size:14px;color:#6b6b8a">/100</span></p>
${r.capitalGap?`<p style="font-size:11px;color:#ffb347;margin-top:6px">💰 ${r.capitalGap}</p>`:""}
</div></div>
<div class="card"><div class="card-h">📈 Market Research</div><div class="card-b">
<div class="grid">
<div class="m"><div class="ml">TAM — Total Addressable Market</div><div class="mv">${r.marketResearch?.tam}</div>${r.marketResearch?.tamReasoning?`<div class="mr">${r.marketResearch.tamReasoning}</div>`:""}</div>
<div class="m"><div class="ml">SAM — Serviceable Addressable Market</div><div class="mv">${r.marketResearch?.sam}</div>${r.marketResearch?.samReasoning?`<div class="mr">${r.marketResearch.samReasoning}</div>`:""}</div>
<div class="m"><div class="ml">SOM — Serviceable Obtainable Market</div><div class="mv">${r.marketResearch?.som}</div>${r.marketResearch?.somReasoning?`<div class="mr">${r.marketResearch.somReasoning}</div>`:""}</div>
<div class="m"><div class="ml">CAGR</div><div class="mv">${r.marketResearch?.cagr}</div></div>
</div><p style="font-size:12px">${r.marketResearch?.summary||""}</p>
</div></div>
<div class="card"><div class="card-h">🛡️ SWOT</div><div class="card-b"><div class="swot">
<div class="cell S"><div class="cl">Strengths</div><ul>${(r.swot?.strengths||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell W"><div class="cl">Weaknesses</div><ul>${(r.swot?.weaknesses||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell O"><div class="cl">Opportunities</div><ul>${(r.swot?.opportunities||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell T"><div class="cl">Threats</div><ul>${(r.swot?.threats||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
</div></div></div>
<div class="card"><div class="card-h">🏆 Investment Verdict</div><div class="card-b">
<div class="verd"><div class="vt">${vc.title}</div><p style="font-size:12px">${r.investmentSummary}</p></div>
</div></div>
<p style="text-align:center;color:#3a3a54;font-size:10px;margin-top:20px">AI Startup Intelligence Analyst · ${new Date().toLocaleDateString()}</p>
</body></html>`;
}

export default function ReportView({report:r,idea,capital,country,market}:Props){
  const vc = VERDICT[r.verdict as keyof typeof VERDICT]||VERDICT.watch;
  const html = buildHTML(r,idea,capital);

  const scores=[
    ["market",     "Market Potential",   "Size & demand opportunity"],
    ["team",       "Team Strength",      "Founder readiness"],
    ["product",    "Product Viability",  "Solution–market fit"],
    ["traction",   "Traction",           "Early momentum signals"],
    ["financials", "Financials",         "Capital & unit economics"],
  ];

  function dlJSON(){const blob=new Blob([JSON.stringify(r,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${r.startupName?.replace(/\s+/g,"_")}_analysis.json`;a.click();}

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:1000,margin:"0 auto"}}>

      {/* ── Report header ── */}
      <div className="section-card fade-up" style={{background:"linear-gradient(135deg,rgba(124,107,255,0.06),rgba(77,137,255,0.04))"}}>
        <div style={{padding:"24px 26px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:20,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              {/* Name + verdict */}
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
                <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em",margin:0}}>{r.startupName}</h1>
                <span className={`chip ${vc.chip}`} style={{fontSize:12,padding:"4px 12px"}}>{vc.label}</span>
              </div>
              <p style={{fontSize:14,color:"var(--muted)",margin:"0 0 14px",lineHeight:1.6}}>{r.tagline||idea}</p>

              {/* Meta chips */}
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
                {[[FLAGS[country]||"🌍",country],[" 🏭",r.industry],["🚀",r.stage],["💰",capital||"—"],["📅",new Date().toLocaleDateString("en-IN")]].map(([icon,val])=>(
                  <span key={String(val)} className="chip" style={{background:"var(--black-4)",borderColor:"var(--glass-border)",color:"var(--muted)",fontSize:11}}>{icon} {val}</span>
                ))}
              </div>

              {/* Capital gap */}
              {r.capitalGap && (
                <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",background:"rgba(255,179,71,0.08)",border:"0.5px solid rgba(255,179,71,0.2)",borderRadius:10,fontSize:12,color:"#ffb347"}}>
                  💰 {r.capitalGap}
                </div>
              )}
            </div>

            {/* Score gauge */}
            <ScoreGauge score={r.overallScore} size={120}/>
          </div>

          {/* Action bar */}
          <div style={{marginTop:20,paddingTop:18,borderTop:"0.5px solid var(--glass-border)"}}>
            <EmailReport reportHtml={html} startupName={r.startupName}/>
            <button onClick={dlJSON} className="btn-ghost" style={{marginTop:8,fontSize:12}}>⬇ Export JSON</button>
          </div>
        </div>
      </div>

      {/* ── Market Research ── */}
      <SCard icon="📈" title="Market Research" accent={r.marketResearch?.cagr ? `${r.marketResearch.cagr} CAGR` : undefined}>
        {/* TAM/SAM/SOM/CAGR */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:18}}>
          {[
            ["TAM","Total Addressable Market",r.marketResearch?.tam,r.marketResearch?.tamReasoning,"#7c6bff"],
            ["SAM","Serviceable Addressable Market",r.marketResearch?.sam,r.marketResearch?.samReasoning,"#5b8fff"],
            ["SOM","Serviceable Obtainable Market",r.marketResearch?.som,r.marketResearch?.somReasoning,"#4dd9d9"],
            ["CAGR","Compound Annual Growth Rate",r.marketResearch?.cagr,"Annual market growth","#4ade80"],
          ].map(([abbr,full,val,reason,color])=>(
            <div key={abbr} className="metric-card">
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:10,fontWeight:700,color:color as string,fontFamily:"monospace"}}>{abbr}</span>
                <span style={{fontSize:9,color:"var(--hint)"}}>{full}</span>
              </div>
              <div style={{fontSize:18,fontWeight:700,marginBottom:4,color:"var(--white)"}}>{val}</div>
              {reason && <div style={{fontSize:10,color:"var(--hint)",lineHeight:1.4,fontStyle:"italic"}}>{reason as string}</div>}
            </div>
          ))}
        </div>

        <p style={{fontSize:13,lineHeight:1.7,color:"var(--muted)",marginBottom:14}}>{r.marketResearch?.summary}</p>

        {/* Target + Cultural */}
        {(r.marketResearch?.targetDemographic||r.marketResearch?.culturalInsight)&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {r.marketResearch?.targetDemographic&&(
              <div style={{padding:"12px 14px",background:"rgba(74,222,128,0.06)",borderRadius:12,border:"0.5px solid rgba(74,222,128,0.15)"}}>
                <div style={{fontSize:10,color:"#4ade80",fontWeight:600,letterSpacing:"0.06em",marginBottom:5}}>🎯 TARGET DEMOGRAPHIC</div>
                <p style={{fontSize:12,margin:0,lineHeight:1.5,color:"var(--muted)"}}>{r.marketResearch.targetDemographic}</p>
              </div>
            )}
            {r.marketResearch?.culturalInsight&&(
              <div style={{padding:"12px 14px",background:"rgba(255,179,71,0.06)",borderRadius:12,border:"0.5px solid rgba(255,179,71,0.15)"}}>
                <div style={{fontSize:10,color:"#ffb347",fontWeight:600,letterSpacing:"0.06em",marginBottom:5}}>🧠 CULTURAL INSIGHT</div>
                <p style={{fontSize:12,margin:0,lineHeight:1.5,color:"var(--muted)"}}>{r.marketResearch.culturalInsight}</p>
              </div>
            )}
          </div>
        )}

        {/* Trends */}
        <div style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.08em",fontWeight:500,marginBottom:10}}>KEY MARKET TRENDS</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {r.marketResearch?.keyTrends?.map((t:string,i:number)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:13}}>
              <span style={{minWidth:22,height:22,borderRadius:"50%",background:"rgba(124,107,255,0.15)",color:"var(--violet)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</span>
              <span style={{color:"var(--muted)",lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>

        {r.marketResearch?.demandSignals&&(
          <div style={{marginTop:14,padding:"12px 14px",background:"var(--black-3)",borderRadius:10,border:"0.5px solid var(--glass-border)"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.06em",marginBottom:5}}>📡 DEMAND SIGNALS</div>
            <p style={{fontSize:12,margin:0,lineHeight:1.5,color:"var(--muted)"}}>{r.marketResearch.demandSignals}</p>
          </div>
        )}
      </SCard>

      {/* ── Revenue Projection ── */}
      {r.revenueProjection&&(
        <SCard icon="📉" title="Revenue projection">
          <RevenueChart data={r.revenueProjection} verdict={r.verdict}/>
          {r.projectedRevenue&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
              {[["Year 1",r.projectedRevenue.year1],["Year 2",r.projectedRevenue.year2],["Year 3",r.projectedRevenue.year3]].map(([l,v])=>(
                <div key={l} className="metric-card" style={{textAlign:"center"}}>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:700,color:"var(--violet)"}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {r.projectedRevenue?.assumptions&&<div style={{marginTop:10,fontSize:11,color:"var(--hint)",fontStyle:"italic"}}>📝 {r.projectedRevenue.assumptions}</div>}
        </SCard>
      )}

      {/* ── Score Breakdown ── */}
      <SCard icon="📊" title="Score breakdown">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
          {scores.map(([key,label,desc])=>{
            const v=Number((r.scores||{})[key]??0);
            const color=v>=68?"#4ade80":v>=48?"#ffb347":"#ff6b6b";
            return(
              <div key={key} className="metric-card">
                <div style={{fontSize:10,color:"var(--muted)",marginBottom:1,fontWeight:500}}>{label}</div>
                <div style={{fontSize:9,color:"var(--hint)",marginBottom:8}}>{desc}</div>
                <div style={{fontSize:32,fontWeight:700,color,lineHeight:1,marginBottom:4}}>{v}</div>
                <div className="score-bar"><div className="score-bar-fill" style={{width:`${v}%`,background:color}}/></div>
                {r.scoreReasoning?.[key]&&<div style={{fontSize:10,color:"var(--hint)",marginTop:8,fontStyle:"italic",lineHeight:1.4}}>{r.scoreReasoning[key]}</div>}
              </div>
            );
          })}
        </div>
      </SCard>

      {/* ── Capital Allocation ── */}
      {r.fundingBreakdown&&(
        <SCard icon="🥧" title="Capital allocation">
          <FundingPieChart data={r.fundingBreakdown} capital={capital}/>
        </SCard>
      )}

      {/* ── Bootstrap Guide ── */}
      {r.bootstrap&&(
        <SCard icon="💡" title="How to start — Bootstrap guide">
          <BootstrapAdvisor data={r.bootstrap} capital={capital||"Not specified"}/>
        </SCard>
      )}

      {/* ── Competitors ── */}
      <SCard icon="⚔️" title="Competitor landscape">
        <p style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.6}}>{r.competitorSummary}</p>
        <div style={{overflowX:"auto"}}>
          <table className="data-table">
            <thead><tr>{["Company","Country","Type","Strength","Weakness","Share","Threat"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {r.competitors?.map((c:any,i:number)=>(
                <tr key={i}>
                  <td style={{fontWeight:500}}>{c.name}</td>
                  <td style={{color:"var(--muted)",fontSize:11}}>{c.country||"—"}</td>
                  <td><span className={`chip ${c.type==="direct"?"chip-red":"chip-cyan"}`} style={{fontSize:10}}>{c.type}</span></td>
                  <td style={{color:"var(--muted)",maxWidth:140}}>{c.strength}</td>
                  <td style={{color:"var(--muted)",maxWidth:140}}>{c.weakness}</td>
                  <td style={{fontWeight:500,color:"var(--violet)"}}>{c.marketShare||"—"}</td>
                  <td><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:7,height:7,borderRadius:"50%",background:SEV_COLOR[c.threat]||"#888",boxShadow:`0 0 6px ${SEV_COLOR[c.threat]||"#888"}66`}}/>{c.threat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>

      {/* ── SWOT ── */}
      <SCard icon="🛡️" title="SWOT analysis">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {([["S","Strengths","#4ade80",r.swot?.strengths],["W","Weaknesses","#ff6b6b",r.swot?.weaknesses],["O","Opportunities","#5b8fff",r.swot?.opportunities],["T","Threats","#ffb347",r.swot?.threats]] as [string,string,string,string[]][]).map(([key,label,color,items])=>(
            <div key={key} style={{padding:"14px 16px",borderRadius:12,background:color+"08",border:`0.5px solid ${color}20`}}>
              <div style={{fontSize:10,fontWeight:700,color,letterSpacing:"0.08em",marginBottom:10}}>{label.toUpperCase()}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {items?.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"var(--muted)",lineHeight:1.4}}>
                    <span style={{color,flexShrink:0,marginTop:1}}>›</span>{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SCard>

      {/* ── Risks ── */}
      <SCard icon="⚠️" title="Risk analysis & mitigation">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {r.risks?.map((risk:any,i:number)=>(
            <div key={i} style={{padding:"14px 16px",background:"var(--black-3)",borderRadius:12,border:"0.5px solid var(--glass-border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:16,flexShrink:0}}>{risk.severity==="high"?"🔴":risk.severity==="medium"?"🟡":"🟢"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>{risk.name}</div>
                  <span className="chip" style={{fontSize:10,padding:"1px 7px",background:(SEV_COLOR[risk.severity]||"#888")+"15",color:SEV_COLOR[risk.severity]||"#888",borderColor:(SEV_COLOR[risk.severity]||"#888")+"30",marginTop:3,display:"inline-flex"}}>{risk.severity} severity</span>
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--muted)",margin:"0 0 10px",lineHeight:1.5}}>{risk.description}</p>
              {risk.mitigation&&(
                <div style={{padding:"8px 12px",background:"rgba(74,222,128,0.06)",borderRadius:8,border:"0.5px solid rgba(74,222,128,0.15)",fontSize:12}}>
                  <span style={{color:"#4ade80",fontWeight:500}}>✓ Mitigation: </span>
                  <span style={{color:"var(--muted)"}}>{risk.mitigation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </SCard>

      {/* ── Business Models ── */}
      <SCard icon="💰" title="Business model suggestions">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:14}}>
          {r.businessModels?.map((bm:any,i:number)=>(
            <div key={i} className="metric-card glass-hover">
              <div style={{fontSize:13,fontWeight:500,marginBottom:5}}>{bm.name}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:10,lineHeight:1.4}}>{bm.description}</div>
              {bm.revenueEstimate&&<div style={{fontSize:11,color:"var(--violet)",marginBottom:8,fontWeight:500}}>Est. {bm.revenueEstimate}</div>}
              <span className={`chip ${bm.potential==="high"?"chip-green":"chip-cyan"}`} style={{fontSize:10}}>{bm.potential} potential</span>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[[" 🌱","GROWTH STRATEGY",r.growthStrategy],["🏰","COMPETITIVE MOAT",r.moat]].map(([icon,label,text])=>(
            <div key={label} className="metric-card">
              <div style={{fontSize:10,color:"var(--muted)",letterSpacing:"0.06em",marginBottom:8}}>{icon} {label}</div>
              <p style={{fontSize:12,margin:0,lineHeight:1.6,color:"var(--muted)"}}>{text as string}</p>
            </div>
          ))}
        </div>
      </SCard>

      {/* ── Verdict ── */}
      <div className="fade-up" style={{padding:"24px 26px",borderRadius:20,background:vc.bg,border:`0.5px solid ${vc.border}`}}>
        <div style={{fontSize:18,fontWeight:700,color:vc.titleColor,marginBottom:12,letterSpacing:"-0.01em"}}>🏆 {vc.title}</div>
        <p style={{fontSize:14,lineHeight:1.7,color:"var(--white)",margin:0}}>{r.investmentSummary}</p>
        {r.projectedRevenue&&(
          <div style={{marginTop:16,display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Year 1",r.projectedRevenue.year1],["Year 2",r.projectedRevenue.year2],["Year 3",r.projectedRevenue.year3]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:10,color:vc.titleColor,opacity:0.7,marginBottom:2}}>{l}</div>
                <div style={{fontSize:16,fontWeight:700,color:vc.titleColor}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

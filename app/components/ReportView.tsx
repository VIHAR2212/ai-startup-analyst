"use client";
import ScoreGauge from "./ScoreGauge";
import BootstrapAdvisor from "./BootstrapAdvisor";
import EmailReport from "./EmailReport";
import RevenueChart from "./RevenueChart";
import FundingPieChart from "./FundingPieChart";

interface Props { report:any; idea:string; capital:string; country:string; market:string; }

const V = {
  invest:{ label:"Strong Invest", chipBg:"rgba(92,184,92,0.1)",  chipColor:"#5cb85c", chipBorder:"rgba(92,184,92,0.22)",  hdrColor:"#5cb85c", bg:"rgba(92,184,92,0.05)",  border:"rgba(92,184,92,0.18)",  title:"Strong Investment Candidate" },
  watch: { label:"Watch",         chipBg:"rgba(212,132,26,0.1)", chipColor:"#d4841a", chipBorder:"rgba(212,132,26,0.22)", hdrColor:"#d4841a", bg:"rgba(212,132,26,0.05)", border:"rgba(212,132,26,0.18)", title:"Monitor & Revisit" },
  pass:  { label:"Pass",          chipBg:"rgba(224,85,85,0.1)",  chipColor:"#e05555", chipBorder:"rgba(224,85,85,0.22)",  hdrColor:"#e05555", bg:"rgba(224,85,85,0.05)",  border:"rgba(224,85,85,0.18)",  title:"Not Recommended at This Stage" },
};
const SEV:Record<string,string>={high:"#e05555",medium:"#d4841a",low:"#5cb85c"};
const FLAGS:Record<string,string>={India:"🇮🇳",USA:"🇺🇸",UK:"🇬🇧",Germany:"🇩🇪",France:"🇫🇷",Australia:"🇦🇺",Canada:"🇨🇦",Singapore:"🇸🇬",UAE:"🇦🇪",Japan:"🇯🇵",Brazil:"🇧🇷","South Africa":"🇿🇦"};

function SC({icon,title,tag,children}:{icon:string;title:string;tag?:string;children:React.ReactNode}){
  return(
    <div className="section-card fade-up">
      <div className="section-header">
        <span style={{fontSize:15}}>{icon}</span>
        <span style={{flex:1}}>{title}</span>
        {tag&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:99,background:"rgba(212,132,26,0.08)",color:"var(--amber-3)",border:"0.5px solid rgba(212,132,26,0.18)",letterSpacing:"0.06em"}}>{tag}</span>}
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function buildHTML(r:any,idea:string,capital:string):string{
  const vc=V[r.verdict as keyof typeof V]||V.watch;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${r.startupName}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body{font-family:Inter,sans-serif;background:#000;color:#f5f5f0;margin:0;padding:28px;font-size:13px;line-height:1.6}
.c{background:#0a0a08;border:1px solid rgba(255,255,255,0.07);border-radius:14px;margin-bottom:14px;overflow:hidden}
.ch{padding:13px 20px;border-bottom:1px solid rgba(255,255,255,0.07);font-weight:500;font-size:12px;background:#111110}
.cb{padding:18px 20px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.m{background:#111110;padding:12px;border-radius:10px}.ml{font-size:9px;color:#8a8778;margin-bottom:2px;text-transform:uppercase;letter-spacing:.06em}.mv{font-size:16px;font-weight:700;margin-bottom:3px}.mr{font-size:9px;color:#4a4840;font-style:italic;line-height:1.4}
.swot{display:grid;grid-template-columns:1fr 1fr;gap:8px}.cell{padding:12px;border-radius:10px}
.S{background:rgba(92,184,92,0.07);border:1px solid rgba(92,184,92,0.18)}.W{background:rgba(224,85,85,0.07);border:1px solid rgba(224,85,85,0.18)}.O{background:rgba(80,138,255,0.07);border:1px solid rgba(80,138,255,0.18)}.T{background:rgba(212,132,26,0.07);border:1px solid rgba(212,132,26,0.18)}
.cl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.S .cl{color:#5cb85c}.W .cl{color:#e05555}.O .cl{color:#508aff}.T .cl{color:#d4841a}
li{font-size:11px;margin-bottom:4px;color:#8a8778}
.vb{padding:18px;border-radius:12px;background:${vc.bg};border:1px solid ${vc.border}}
.vt{font-size:14px;font-weight:700;color:${vc.hdrColor};margin-bottom:8px}
p{font-size:12px;color:#8a8778;margin:0 0 8px}
</style></head><body>
<div class="c"><div class="cb">
<h1 style="font-size:22px;font-weight:700;margin:0 0 5px;letter-spacing:-.02em">${r.startupName}</h1>
<p style="color:#8a8778;font-size:12px;margin-bottom:10px">${r.tagline||idea}</p>
<p style="font-size:11px;color:#4a4840">Idea: ${idea} · Capital: ${capital} · Country: ${r.country||""} · Industry: ${r.industry||""}</p>
<div style="font-size:32px;font-weight:700;margin:12px 0 0;color:${r.overallScore>=68?"#5cb85c":r.overallScore>=48?"#d4841a":"#e05555"}">${r.overallScore}<span style="font-size:14px;color:#4a4840">/100</span></div>
${r.capitalGap?`<p style="font-size:11px;color:#d4841a;margin-top:6px">💰 ${r.capitalGap}</p>`:""}
</div></div>
<div class="c"><div class="ch">📈 Market Research</div><div class="cb">
<div class="g4">
<div class="m"><div class="ml">TAM — Total Addressable Market</div><div class="mv">${r.marketResearch?.tam||"—"}</div><div class="mr">${r.marketResearch?.tamReasoning||""}</div></div>
<div class="m"><div class="ml">SAM — Serviceable Addressable Market</div><div class="mv">${r.marketResearch?.sam||"—"}</div><div class="mr">${r.marketResearch?.samReasoning||""}</div></div>
<div class="m"><div class="ml">SOM — Serviceable Obtainable Market</div><div class="mv">${r.marketResearch?.som||"—"}</div><div class="mr">${r.marketResearch?.somReasoning||""}</div></div>
<div class="m"><div class="ml">CAGR</div><div class="mv">${r.marketResearch?.cagr||"—"}</div></div>
</div><p>${r.marketResearch?.summary||""}</p></div></div>
<div class="c"><div class="ch">🛡️ SWOT Analysis</div><div class="cb"><div class="swot">
<div class="cell S"><div class="cl">Strengths</div><ul>${(r.swot?.strengths||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell W"><div class="cl">Weaknesses</div><ul>${(r.swot?.weaknesses||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell O"><div class="cl">Opportunities</div><ul>${(r.swot?.opportunities||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell T"><div class="cl">Threats</div><ul>${(r.swot?.threats||[]).map((s:string)=>`<li>${s}</li>`).join("")}</ul></div>
</div></div></div>
<div class="c"><div class="ch">🏆 Investment Verdict</div><div class="cb"><div class="vb"><div class="vt">${vc.title}</div><p>${r.investmentSummary||""}</p></div></div></div>
<p style="text-align:center;color:#2a2820;font-size:10px;margin-top:24px;letter-spacing:.06em">AI STARTUP INTELLIGENCE ANALYST · ${new Date().toLocaleDateString()}</p>
</body></html>`;
}

export default function ReportView({report:r,idea,capital,country,market}:Props){
  const vc=V[r.verdict as keyof typeof V]||V.watch;
  const html=buildHTML(r,idea,capital);
  const scores=[["market","Market Potential","Size & demand opportunity"],["team","Team Strength","Founder readiness"],["product","Product Viability","Solution–market fit"],["traction","Traction","Early momentum"],["financials","Financials","Capital & economics"]];

  function dlJSON(){const b=new Blob([JSON.stringify(r,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`${r.startupName?.replace(/\s+/g,"_")}_report.json`;a.click();}

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:960,margin:"0 auto"}}>

      {/* ── Header card ── */}
      <div className="section-card fade-up" style={{background:"linear-gradient(135deg,rgba(212,132,26,0.05),rgba(180,90,10,0.03),transparent)"}}>
        <div style={{padding:"24px 26px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:20,flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
                <h1 style={{fontSize:24,fontWeight:700,letterSpacing:"-0.025em",margin:0,color:"var(--off-white)"}}>{r.startupName}</h1>
                <span style={{fontSize:11,padding:"4px 12px",borderRadius:99,background:vc.chipBg,color:vc.chipColor,border:`0.5px solid ${vc.chipBorder}`,fontWeight:600}}>{vc.label}</span>
              </div>
              <p style={{fontSize:13,color:"var(--muted)",margin:"0 0 14px",lineHeight:1.65}}>{r.tagline||idea}</p>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:r.capitalGap?12:0}}>
                {[[FLAGS[country]||"🌍",country],[" 🏭",r.industry],["🚀",r.stage],["💰",capital||"—"],["📅",new Date().toLocaleDateString("en-IN")]].map(([icon,val])=>(
                  <span key={String(val)} className="chip chip-white" style={{fontSize:10}}>{icon} {val}</span>
                ))}
              </div>
              {r.capitalGap&&<div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",background:"rgba(212,132,26,0.07)",border:"0.5px solid rgba(212,132,26,0.18)",borderRadius:10,fontSize:11,color:"#d4841a",marginTop:4}}>💰 {r.capitalGap}</div>}
            </div>
            <ScoreGauge score={r.overallScore} size={120}/>
          </div>
          {/* Actions */}
          <div style={{marginTop:20,paddingTop:18,borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
            <EmailReport reportHtml={html} startupName={r.startupName}/>
            <button onClick={dlJSON} className="btn-ghost" style={{marginTop:8,fontSize:11}}>⬇ Export JSON</button>
          </div>
        </div>
      </div>

      {/* ── Market Research ── */}
      <SC icon="📈" title="Market Research" tag={r.marketResearch?.cagr?`${r.marketResearch.cagr} CAGR`:undefined}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10,marginBottom:18}}>
          {[["TAM","Total Addressable Market",r.marketResearch?.tam,r.marketResearch?.tamReasoning,"#d4841a"],
            ["SAM","Serviceable Addressable Market",r.marketResearch?.sam,r.marketResearch?.samReasoning,"#c0a060"],
            ["SOM","Serviceable Obtainable Market",r.marketResearch?.som,r.marketResearch?.somReasoning,"#50b4b4"],
            ["CAGR","Compound Annual Growth Rate",r.marketResearch?.cagr,"Annual market growth","#5cb85c"]
          ].map(([abbr,full,val,reason,color])=>(
            <div key={abbr as string} className="metric-card">
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{fontSize:10,fontWeight:700,color:color as string,fontFamily:"monospace",letterSpacing:"0.05em"}}>{abbr}</span>
                <span style={{fontSize:9,color:"var(--hint)",lineHeight:1.2}}>{full}</span>
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"var(--off-white)",marginBottom:5,letterSpacing:"-0.01em"}}>{val||"—"}</div>
              {reason&&<div style={{fontSize:9,color:"var(--hint)",fontStyle:"italic",lineHeight:1.4}}>{reason as string}</div>}
            </div>
          ))}
        </div>
        <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.75,marginBottom:14}}>{r.marketResearch?.summary}</p>
        {(r.marketResearch?.targetDemographic||r.marketResearch?.culturalInsight)&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {r.marketResearch?.targetDemographic&&(
              <div style={{padding:"12px 14px",background:"rgba(92,184,92,0.05)",borderRadius:10,border:"0.5px solid rgba(92,184,92,0.14)"}}>
                <div style={{fontSize:9,color:"#5cb85c",fontWeight:600,letterSpacing:"0.08em",marginBottom:6}}>🎯 TARGET DEMOGRAPHIC</div>
                <p style={{fontSize:12,margin:0,color:"var(--muted)",lineHeight:1.5}}>{r.marketResearch.targetDemographic}</p>
              </div>
            )}
            {r.marketResearch?.culturalInsight&&(
              <div style={{padding:"12px 14px",background:"rgba(212,132,26,0.05)",borderRadius:10,border:"0.5px solid rgba(212,132,26,0.14)"}}>
                <div style={{fontSize:9,color:"var(--amber-3)",fontWeight:600,letterSpacing:"0.08em",marginBottom:6}}>🧠 CULTURAL INSIGHT</div>
                <p style={{fontSize:12,margin:0,color:"var(--muted)",lineHeight:1.5}}>{r.marketResearch.culturalInsight}</p>
              </div>
            )}
          </div>
        )}
        <div style={{fontSize:9,color:"var(--hint)",letterSpacing:"0.08em",fontWeight:600,marginBottom:10}}>KEY MARKET TRENDS</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {r.marketResearch?.keyTrends?.map((t:string,i:number)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:13}}>
              <span style={{minWidth:20,height:20,borderRadius:"50%",background:"rgba(212,132,26,0.1)",color:"var(--amber-3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0,marginTop:2,border:"0.5px solid rgba(212,132,26,0.2)"}}>{i+1}</span>
              <span style={{color:"var(--muted)",lineHeight:1.55}}>{t}</span>
            </div>
          ))}
        </div>
        {r.marketResearch?.demandSignals&&(
          <div style={{marginTop:14,padding:"12px 14px",background:"var(--black-3)",borderRadius:10,border:"0.5px solid var(--glass-border)"}}>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:"0.08em",fontWeight:600,marginBottom:5}}>📡 DEMAND SIGNALS</div>
            <p style={{fontSize:12,margin:0,color:"var(--muted)",lineHeight:1.5}}>{r.marketResearch.demandSignals}</p>
          </div>
        )}
      </SC>

      {/* ── Revenue Chart ── */}
      {r.revenueProjection&&(
        <SC icon="📉" title="Revenue projection">
          <RevenueChart data={r.revenueProjection} verdict={r.verdict}/>
          {r.projectedRevenue&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
              {[["Year 1",r.projectedRevenue.year1],["Year 2",r.projectedRevenue.year2],["Year 3",r.projectedRevenue.year3]].map(([l,v])=>(
                <div key={l} className="metric-card" style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"var(--muted)",marginBottom:5,letterSpacing:"0.06em"}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:700,color:"var(--amber-3)"}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {r.projectedRevenue?.assumptions&&<div style={{marginTop:10,fontSize:10,color:"var(--hint)",fontStyle:"italic"}}>📝 {r.projectedRevenue.assumptions}</div>}
        </SC>
      )}

      {/* ── Score Breakdown ── */}
      <SC icon="📊" title="Score breakdown">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:10}}>
          {scores.map(([key,label,desc])=>{
            const v=Number((r.scores||{})[key]??0);
            const color=v>=68?"#5cb85c":v>=48?"#d4841a":"#e05555";
            return(
              <div key={key} className="metric-card">
                <div style={{fontSize:10,color:"var(--muted)",fontWeight:500,marginBottom:1}}>{label}</div>
                <div style={{fontSize:9,color:"var(--hint)",marginBottom:9}}>{desc}</div>
                <div style={{fontSize:30,fontWeight:700,color,lineHeight:1,marginBottom:5,filter:`drop-shadow(0 0 8px ${color}44)`}}>{v}</div>
                <div className="score-bar"><div className="score-bar-fill" style={{width:`${v}%`,background:`linear-gradient(90deg,${color}88,${color})`}}/></div>
                {r.scoreReasoning?.[key]&&<div style={{fontSize:9,color:"var(--hint)",marginTop:7,fontStyle:"italic",lineHeight:1.4}}>{r.scoreReasoning[key]}</div>}
              </div>
            );
          })}
        </div>
      </SC>

      {/* ── Capital Allocation ── */}
      {r.fundingBreakdown&&(
        <SC icon="🥧" title="Capital allocation">
          <FundingPieChart data={r.fundingBreakdown} capital={capital}/>
        </SC>
      )}

      {/* ── Bootstrap ── */}
      {r.bootstrap&&(
        <SC icon="💡" title="How to start — Bootstrap guide">
          <BootstrapAdvisor data={r.bootstrap} capital={capital||"Not specified"}/>
        </SC>
      )}

      {/* ── Competitors ── */}
      <SC icon="⚔️" title="Competitor landscape">
        <p style={{fontSize:13,color:"var(--muted)",marginBottom:16,lineHeight:1.65}}>{r.competitorSummary}</p>
        <div style={{overflowX:"auto"}}>
          <table className="data-table">
            <thead><tr>{["Company","Country","Type","Strength","Weakness","Share","Threat"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {r.competitors?.map((c:any,i:number)=>(
                <tr key={i}>
                  <td style={{fontWeight:500,color:"var(--off-white)"}}>{c.name}</td>
                  <td style={{color:"var(--muted)",fontSize:11}}>{c.country||"—"}</td>
                  <td><span className={`chip ${c.type==="direct"?"chip-red":"chip-cyan"}`} style={{fontSize:9}}>{c.type}</span></td>
                  <td style={{color:"var(--muted)",maxWidth:130,fontSize:11}}>{c.strength}</td>
                  <td style={{color:"var(--muted)",maxWidth:130,fontSize:11}}>{c.weakness}</td>
                  <td style={{fontWeight:600,color:"var(--amber-3)",fontSize:11}}>{c.marketShare||"—"}</td>
                  <td><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:6,height:6,borderRadius:"50%",background:SEV[c.threat]||"#888",flexShrink:0,boxShadow:`0 0 5px ${SEV[c.threat]||"#888"}66`}}/>{c.threat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SC>

      {/* ── SWOT ── */}
      <SC icon="🛡️" title="SWOT analysis">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {([["S","Strengths","#5cb85c",r.swot?.strengths],["W","Weaknesses","#e05555",r.swot?.weaknesses],["O","Opportunities","#508aff",r.swot?.opportunities],["T","Threats","#d4841a",r.swot?.threats]] as [string,string,string,string[]][]).map(([key,label,color,items])=>(
            <div key={key} style={{padding:"14px 16px",borderRadius:12,background:color+"08",border:`0.5px solid ${color}18`}}>
              <div style={{fontSize:9,fontWeight:700,color,letterSpacing:"0.1em",marginBottom:10}}>{label.toUpperCase()}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {items?.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"var(--muted)",lineHeight:1.45}}>
                    <span style={{color,flexShrink:0,marginTop:1,fontSize:10}}>›</span>{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SC>

      {/* ── Risks ── */}
      <SC icon="⚠️" title="Risk analysis & mitigation">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {r.risks?.map((risk:any,i:number)=>(
            <div key={i} style={{padding:"14px 16px",background:"var(--black-3)",borderRadius:12,border:"0.5px solid var(--glass-border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:15}}>{risk.severity==="high"?"🔴":risk.severity==="medium"?"🟡":"🟢"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--off-white)"}}>{risk.name}</div>
                  <span style={{fontSize:9,padding:"1px 7px",borderRadius:99,background:(SEV[risk.severity]||"#888")+"12",color:SEV[risk.severity]||"#888",border:`0.5px solid ${SEV[risk.severity]||"#888"}22`,marginTop:2,display:"inline-flex",letterSpacing:"0.04em"}}>{risk.severity} severity</span>
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--muted)",margin:"0 0 10px",lineHeight:1.55}}>{risk.description}</p>
              {risk.mitigation&&(
                <div style={{padding:"8px 12px",background:"rgba(92,184,92,0.05)",borderRadius:8,border:"0.5px solid rgba(92,184,92,0.14)",fontSize:11}}>
                  <span style={{color:"#5cb85c",fontWeight:600}}>✓ Mitigation: </span>
                  <span style={{color:"var(--muted)"}}>{risk.mitigation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </SC>

      {/* ── Business Models ── */}
      <SC icon="💰" title="Business model suggestions">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10,marginBottom:14}}>
          {r.businessModels?.map((bm:any,i:number)=>(
            <div key={i} className="metric-card glass-hover" style={{cursor:"default"}}>
              <div style={{fontSize:13,fontWeight:500,color:"var(--off-white)",marginBottom:5}}>{bm.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:10,lineHeight:1.5}}>{bm.description}</div>
              {bm.revenueEstimate&&<div style={{fontSize:10,color:"var(--amber-3)",marginBottom:8,fontWeight:500}}>Est. {bm.revenueEstimate}</div>}
              <span className={`chip ${bm.potential==="high"?"chip-green":"chip-cyan"}`} style={{fontSize:9}}>{bm.potential} potential</span>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["🌱","GROWTH STRATEGY",r.growthStrategy],["🏰","COMPETITIVE MOAT",r.moat]].map(([icon,label,text])=>(
            <div key={label as string} className="metric-card">
              <div style={{fontSize:9,color:"var(--muted)",letterSpacing:"0.08em",fontWeight:600,marginBottom:8}}>{icon} {label}</div>
              <p style={{fontSize:12,margin:0,lineHeight:1.65,color:"var(--muted)"}}>{text as string}</p>
            </div>
          ))}
        </div>
      </SC>

      {/* ── Verdict ── */}
      <div className="fade-up" style={{padding:"26px 28px",borderRadius:20,background:vc.bg,border:`0.5px solid ${vc.border}`}}>
        <div style={{fontSize:18,fontWeight:700,color:vc.hdrColor,marginBottom:12,letterSpacing:"-0.015em"}}>🏆 {vc.title}</div>
        <p style={{fontSize:14,lineHeight:1.75,color:"var(--off-white)",margin:0}}>{r.investmentSummary}</p>
        {r.projectedRevenue&&(
          <div style={{marginTop:18,display:"flex",gap:24,flexWrap:"wrap",paddingTop:16,borderTop:`0.5px solid ${vc.border}`}}>
            {[["Year 1",r.projectedRevenue.year1],["Year 2",r.projectedRevenue.year2],["Year 3",r.projectedRevenue.year3]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,color:vc.hdrColor,opacity:0.7,marginBottom:3,letterSpacing:"0.06em"}}>{l}</div>
                <div style={{fontSize:18,fontWeight:700,color:vc.hdrColor}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

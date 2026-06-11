"use client";
import ScoreGauge from "./ScoreGauge";
import BootstrapAdvisor from "./BootstrapAdvisor";
import EmailReport from "./EmailReport";
import RevenueChart from "./RevenueChart";
import FundingPieChart from "./FundingPieChart";

interface Report {
  startupName: string; tagline: string; industry: string; stage: string;
  country?: string; marketType?: string; capitalRequired?: string; capitalProvided?: string; capitalGap?: string;
  overallScore: number; verdict: "invest"|"watch"|"pass"; investmentSummary: string;
  projectedRevenue?: { year1:string; year2:string; year3:string; assumptions:string; };
  marketResearch: {
    summary: string; tam: string; tamReasoning?: string; sam: string; samReasoning?: string;
    som: string; somReasoning?: string; cagr: string; keyTrends: string[];
    demandSignals: string; targetDemographic?: string; culturalInsight?: string; marketScope?: string;
  };
  competitors: Array<{name:string;type:string;strength:string;weakness:string;threat:string;country?:string;marketShare?:string}>;
  competitorSummary: string;
  swot: {strengths:string[];weaknesses:string[];opportunities:string[];threats:string[]};
  localAdvantages?: string; culturalOpportunities?: string;
  risks: Array<{name:string;description:string;severity:string;mitigation?:string}>;
  businessModels: Array<{name:string;description:string;potential:string;revenueEstimate?:string}>;
  growthStrategy: string; moat: string;
  scores: Record<string,number>;
  scoreReasoning?: Record<string,string>;
  revenueProjection?: {months:number[];revenue:number[];unit:string};
  marketShareProjection?: {labels:string[];you:number[];competitor1:{name:string;values:number[]};competitor2:{name:string;values:number[]};unit:string};
  fundingBreakdown?: {categories:string[];percentages:number[];amounts:string[]};
  bootstrap?: {capitalTier:"low"|"medium"|"high";capitalAssessment:string;currency:string;howToStart:any[];minimumViableSetup:string;firstMonthGoal:string;bootstrapTips:string[];fundingOptions:any[];warningIfLowCapital:string|null;localResources?:any[];culturalLaunchTips?:string};
  agentsUsed?: string[];
}

interface Props { report: Report; idea: string; capital: string; country: string; market: string; }

const verdictConfig = {
  invest: { label:"Strong Invest", bg:"#4ade8015", border:"#4ade8040", text:"#4ade80", title:"Strong Investment Candidate" },
  watch:  { label:"Watch",         bg:"#f59e0b15", border:"#f59e0b40", text:"#f59e0b", title:"Monitor & Revisit" },
  pass:   { label:"Pass",          bg:"#ef444415", border:"#ef444440", text:"#ef4444", title:"Not Recommended at This Stage" },
};
const severityColors: Record<string,string> = {high:"#ef4444",medium:"#f59e0b",low:"#4ade80"};
const threatColors:   Record<string,string> = {high:"#ef4444",medium:"#f59e0b",low:"#4ade80"};

function SectionCard({icon,title,children}:{icon:string;title:string;children:React.ReactNode}) {
  return (
    <div className="card fade-up" style={{overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"0.5px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}>{icon}</span>
        <span style={{fontSize:14,fontWeight:500}}>{title}</span>
      </div>
      <div style={{padding:"18px"}}>{children}</div>
    </div>
  );
}

function buildReportHTML(report: Report, idea: string, capital: string): string {
  const vc = verdictConfig[report.verdict]||verdictConfig.watch;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${report.startupName} — Analysis</title>
<style>body{font-family:Inter,sans-serif;background:#0a0a0f;color:#e8e8f0;margin:0;padding:24px;font-size:14px;line-height:1.6}
.card{background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:16px;overflow:hidden}
.card-header{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);font-weight:500}
.card-body{padding:16px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.metric{background:#1a1a24;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08)}
.metric-label{font-size:11px;color:#888;margin-bottom:2px}
.metric-value{font-size:16px;font-weight:600}
.metric-reason{font-size:10px;color:#666;margin-top:3px;font-style:italic}
.swot{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.s{background:#4ade8010;border:1px solid #4ade8030}.w{background:#ef444410;border:1px solid #ef444430}
.o{background:#60a5fa10;border:1px solid #60a5fa30}.t{background:#f59e0b10;border:1px solid #f59e0b30}
.cell{padding:10px 12px;border-radius:8px}.cell-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.s .cell-label{color:#4ade80}.w .cell-label{color:#ef4444}.o .cell-label{color:#60a5fa}.t .cell-label{color:#f59e0b}
li{font-size:12px;margin-bottom:3px}
.verdict-box{padding:16px;border-radius:10px;background:${vc.bg};border:1px solid ${vc.border}}
.verdict-title{font-size:15px;font-weight:600;color:${vc.text};margin-bottom:8px}
</style></head><body>
<div class="card"><div class="card-body">
<h1 style="font-size:22px;font-weight:600;margin:0 0 4px">${report.startupName} <span style="font-size:12px;padding:3px 10px;border-radius:99px;background:${vc.bg};color:${vc.text};border:1px solid ${vc.border}">${vc.label}</span></h1>
<p style="color:#888;margin:0 0 10px">${report.tagline}</p>
<p style="font-size:12px;color:#888">Idea: ${idea} | Capital: ${capital} | Country: ${report.country} | Industry: ${report.industry}</p>
<p style="font-size:24px;font-weight:700;color:${report.overallScore>=68?"#4ade80":report.overallScore>=48?"#f59e0b":"#ef4444"}">Score: ${report.overallScore}/100</p>
${report.capitalGap?`<p style="font-size:12px;color:#f59e0b">💰 Capital assessment: ${report.capitalGap}</p>`:""}
</div></div>
<div class="card"><div class="card-header">📈 Market Research</div><div class="card-body">
<div class="grid">
<div class="metric"><div class="metric-label">TAM — Total Addressable Market</div><div class="metric-value">${report.marketResearch?.tam}</div>${report.marketResearch?.tamReasoning?`<div class="metric-reason">${report.marketResearch.tamReasoning}</div>`:""}</div>
<div class="metric"><div class="metric-label">SAM — Serviceable Addressable Market</div><div class="metric-value">${report.marketResearch?.sam}</div>${report.marketResearch?.samReasoning?`<div class="metric-reason">${report.marketResearch.samReasoning}</div>`:""}</div>
<div class="metric"><div class="metric-label">SOM — Serviceable Obtainable Market</div><div class="metric-value">${report.marketResearch?.som}</div>${report.marketResearch?.somReasoning?`<div class="metric-reason">${report.marketResearch.somReasoning}</div>`:""}</div>
<div class="metric"><div class="metric-label">CAGR — Annual Growth Rate</div><div class="metric-value">${report.marketResearch?.cagr}</div></div>
</div>
<p>${report.marketResearch?.summary}</p>
${report.marketResearch?.targetDemographic?`<p><strong>Target:</strong> ${report.marketResearch.targetDemographic}</p>`:""}
</div></div>
<div class="card"><div class="card-header">🛡️ SWOT</div><div class="card-body"><div class="swot">
<div class="cell s"><div class="cell-label">Strengths</div><ul>${(report.swot?.strengths||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell w"><div class="cell-label">Weaknesses</div><ul>${(report.swot?.weaknesses||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell o"><div class="cell-label">Opportunities</div><ul>${(report.swot?.opportunities||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
<div class="cell t"><div class="cell-label">Threats</div><ul>${(report.swot?.threats||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
</div></div></div>
<div class="card"><div class="card-header">🏆 Investment Verdict</div><div class="card-body">
<div class="verdict-box"><div class="verdict-title">${vc.title}</div><p>${report.investmentSummary}</p></div>
</div></div>
<p style="text-align:center;color:#444;font-size:11px;margin-top:20px">AI Startup Intelligence Analyst · ${new Date().toLocaleDateString()}</p>
</body></html>`;
}

export default function ReportView({ report, idea, capital, country, market }: Props) {
  const vc = verdictConfig[report.verdict]||verdictConfig.watch;
  const reportHTML = buildReportHTML(report, idea, capital);

  const scoreEntries = [
    ["market",     "Market Potential",   "Size & demand opportunity",  report.scoreReasoning?.market],
    ["team",       "Team Strength",      "Founder readiness",          report.scoreReasoning?.team],
    ["product",    "Product Viability",  "Solution–market fit",        report.scoreReasoning?.product],
    ["traction",   "Traction",           "Early momentum signals",     report.scoreReasoning?.traction],
    ["financials", "Financials",         "Capital & revenue model",    report.scoreReasoning?.financials],
  ];

  function exportJSON() {
    const blob = new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.startupName.replace(/\s+/g,"_")}_analysis.json`;
    a.click();
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Header */}
      <div className="card fade-up" style={{padding:"20px 22px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
              <h1 style={{fontSize:20,fontWeight:600,margin:0}}>{report.startupName}</h1>
              <span style={{fontSize:12,padding:"3px 10px",borderRadius:99,background:vc.bg,color:vc.text,border:`0.5px solid ${vc.border}`,fontWeight:500}}>{vc.label}</span>
            </div>
            <p style={{fontSize:13,color:"var(--muted)",margin:"0 0 10px"}}>{report.tagline||idea}</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {[["🏭",report.industry],["🚀",report.stage],["💰",capital||"—"],["🌍",country],["📅",new Date().toLocaleDateString("en-IN")]].map(([icon,val])=>(
                <span key={String(val)} style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:"var(--surface-2)",border:"0.5px solid var(--border)",color:"var(--muted)"}}>{icon} {val}</span>
              ))}
            </div>
            {/* Capital gap warning */}
            {report.capitalGap && (
              <div style={{padding:"8px 12px",background:"#f59e0b12",borderRadius:8,border:"0.5px solid #f59e0b30",fontSize:12,color:"#f59e0b",marginBottom:10}}>
                💰 {report.capitalGap}
              </div>
            )}
          </div>
          <ScoreGauge score={report.overallScore} size={110} />
        </div>
        <div style={{marginTop:14,paddingTop:14,borderTop:"0.5px solid var(--border)"}}>
          <EmailReport reportHtml={reportHTML} startupName={report.startupName} />
          <button onClick={exportJSON} style={{marginTop:8,padding:"7px 14px",fontSize:12,border:"0.5px solid var(--border-md)",borderRadius:8,background:"var(--surface-2)",color:"var(--muted)",cursor:"pointer"}}>⬇ Export JSON</button>
        </div>
      </div>

      {/* Market Research */}
      <SectionCard icon="📈" title="Market Research">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
          {[
            ["TAM","Total Addressable Market",report.marketResearch?.tam,report.marketResearch?.tamReasoning],
            ["SAM","Serviceable Addressable Market",report.marketResearch?.sam,report.marketResearch?.samReasoning],
            ["SOM","Serviceable Obtainable Market",report.marketResearch?.som,report.marketResearch?.somReasoning],
            ["CAGR","Compound Annual Growth Rate",report.marketResearch?.cagr,"Yearly market growth rate"],
          ].map(([abbr,full,val,reason])=>(
            <div key={abbr} style={{background:"var(--surface-2)",borderRadius:8,padding:"12px 14px",border:"0.5px solid var(--border)"}}>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:1}}>{abbr}</div>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,opacity:0.7}}>{full}</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{val}</div>
              {reason && <div style={{fontSize:10,color:"var(--muted)",fontStyle:"italic",lineHeight:1.4}}>{reason}</div>}
            </div>
          ))}
        </div>
        <p style={{fontSize:13,lineHeight:1.7,marginBottom:12}}>{report.marketResearch?.summary}</p>

        {(report.marketResearch?.targetDemographic||report.marketResearch?.culturalInsight) && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {report.marketResearch?.targetDemographic && (
              <div style={{padding:"11px 14px",background:"#4ade8010",borderRadius:10,border:"0.5px solid #4ade8030"}}>
                <div style={{fontSize:11,color:"#4ade80",fontWeight:600,marginBottom:5}}>🎯 TARGET DEMOGRAPHIC</div>
                <p style={{fontSize:12,margin:0,lineHeight:1.5}}>{report.marketResearch.targetDemographic}</p>
              </div>
            )}
            {report.marketResearch?.culturalInsight && (
              <div style={{padding:"11px 14px",background:"#f59e0b10",borderRadius:10,border:"0.5px solid #f59e0b30"}}>
                <div style={{fontSize:11,color:"#f59e0b",fontWeight:600,marginBottom:5}}>🧠 CULTURAL INSIGHT</div>
                <p style={{fontSize:12,margin:0,lineHeight:1.5}}>{report.marketResearch.culturalInsight}</p>
              </div>
            )}
          </div>
        )}

        <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>KEY TRENDS</div>
        {report.marketResearch?.keyTrends?.map((t,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,marginBottom:6}}>
            <span style={{width:20,height:20,borderRadius:"50%",background:"#4ade8015",color:"#4ade80",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,flexShrink:0}}>{i+1}</span>{t}
          </div>
        ))}
        {report.marketResearch?.demandSignals && (
          <div style={{marginTop:12,padding:"11px 14px",background:"var(--surface-2)",borderRadius:10,border:"0.5px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:5}}>📡 DEMAND SIGNALS</div>
            <p style={{fontSize:12,margin:0,lineHeight:1.5}}>{report.marketResearch.demandSignals}</p>
          </div>
        )}
      </SectionCard>

      {/* Revenue projection chart */}
      {report.revenueProjection && (
        <SectionCard icon="📉" title="Revenue projection">
          <RevenueChart data={report.revenueProjection} verdict={report.verdict} />
          {report.projectedRevenue && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
              {[["Year 1",report.projectedRevenue.year1],["Year 2",report.projectedRevenue.year2],["Year 3",report.projectedRevenue.year3]].map(([label,val])=>(
                <div key={label} style={{background:"var(--surface-2)",borderRadius:8,padding:"10px 14px",border:"0.5px solid var(--border)"}}>
                  <div style={{fontSize:11,color:"var(--muted)",marginBottom:3}}>{label}</div>
                  <div style={{fontSize:15,fontWeight:600}}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {report.projectedRevenue?.assumptions && (
            <div style={{marginTop:10,fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>📝 Assumptions: {report.projectedRevenue.assumptions}</div>
          )}
        </SectionCard>
      )}

      {/* Score Breakdown */}
      <SectionCard icon="📊" title="Score breakdown">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
          {scoreEntries.map(([key,label,desc,reason])=>{
            const v = Number((report.scores||{})[key as string]??0);
            const color = v>=70?"#4ade80":v>=45?"#f59e0b":"#ef4444";
            return (
              <div key={key} style={{background:"var(--surface-2)",borderRadius:8,padding:"12px 14px",border:"0.5px solid var(--border)"}}>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:1}}>{label as string}</div>
                <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,opacity:0.7}}>{desc as string}</div>
                <div style={{fontSize:26,fontWeight:600,color}}>{v}</div>
                <div style={{marginTop:6,height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${v}%`,height:"100%",background:color,borderRadius:2}}/>
                </div>
                {reason && <div style={{fontSize:10,color:"var(--muted)",marginTop:6,fontStyle:"italic",lineHeight:1.4}}>{reason as string}</div>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Capital allocation pie chart */}
      {report.fundingBreakdown && (
        <SectionCard icon="🥧" title="Capital allocation">
          <FundingPieChart data={report.fundingBreakdown} capital={capital} />
        </SectionCard>
      )}

      {/* Bootstrap guide */}
      {report.bootstrap && (
        <SectionCard icon="💡" title="How to start — Bootstrap guide">
          <BootstrapAdvisor data={report.bootstrap} capital={capital||"Not specified"} />
        </SectionCard>
      )}

      {/* Competitors */}
      <SectionCard icon="⚔️" title="Competitor landscape">
        <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>{report.competitorSummary}</p>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:"0.5px solid var(--border)"}}>
              {["Company","Country","Type","Strength","Weakness","Market Share","Threat"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"6px 10px",color:"var(--muted)",fontWeight:500}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {report.competitors?.map((c,i)=>(
                <tr key={i} style={{borderBottom:"0.5px solid var(--border)"}}>
                  <td style={{padding:"9px 10px",fontWeight:500}}>{c.name}</td>
                  <td style={{padding:"9px 10px",color:"var(--muted)",fontSize:11}}>{c.country||"—"}</td>
                  <td style={{padding:"9px 10px"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:c.type==="direct"?"#ef444418":"#60a5fa18",color:c.type==="direct"?"#ef4444":"#60a5fa"}}>{c.type}</span></td>
                  <td style={{padding:"9px 10px",color:"var(--muted)"}}>{c.strength}</td>
                  <td style={{padding:"9px 10px",color:"var(--muted)"}}>{c.weakness}</td>
                  <td style={{padding:"9px 10px",fontSize:11}}>{c.marketShare||"—"}</td>
                  <td style={{padding:"9px 10px"}}><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11}}><span style={{width:7,height:7,borderRadius:"50%",background:threatColors[c.threat]||"#888"}}/>{c.threat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* SWOT */}
      <SectionCard icon="🛡️" title="SWOT analysis">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {([["S","Strengths","#4ade80",report.swot?.strengths],["W","Weaknesses","#ef4444",report.swot?.weaknesses],["O","Opportunities","#60a5fa",report.swot?.opportunities],["T","Threats","#f59e0b",report.swot?.threats]] as [string,string,string,string[]][]).map(([key,label,color,items])=>(
            <div key={key} style={{padding:"12px 14px",borderRadius:10,background:color+"0f",border:`0.5px solid ${color}28`}}>
              <div style={{fontSize:11,fontWeight:600,color,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
              <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:5}}>
                {items?.map((item,i)=><li key={i} style={{fontSize:12,display:"flex",gap:6}}><span style={{color,flexShrink:0}}>›</span>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risks with mitigation */}
      <SectionCard icon="⚠️" title="Risk analysis & solutions">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {report.risks?.map((risk,i)=>(
            <div key={i} style={{padding:"12px 14px",background:"var(--surface-2)",borderRadius:10,border:"0.5px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontSize:16}}>{risk.severity==="high"?"🔴":risk.severity==="medium"?"🟡":"🟢"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>{risk.name}</div>
                  <span style={{fontSize:10,padding:"1px 7px",borderRadius:99,background:(severityColors[risk.severity]||"#888")+"18",color:severityColors[risk.severity]||"#888"}}>{risk.severity} severity</span>
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--muted)",margin:"0 0 8px",lineHeight:1.5}}>{risk.description}</p>
              {risk.mitigation && (
                <div style={{padding:"6px 10px",background:"#4ade8010",borderRadius:7,border:"0.5px solid #4ade8030",fontSize:12}}>
                  <span style={{color:"#4ade80",fontWeight:500}}>✓ Mitigation: </span>{risk.mitigation}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Business Models */}
      <SectionCard icon="💰" title="Business model suggestions">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:14}}>
          {report.businessModels?.map((bm,i)=>(
            <div key={i} style={{padding:"12px 14px",background:"var(--surface-2)",borderRadius:10,border:"0.5px solid var(--border)"}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{bm.name}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:8,lineHeight:1.4}}>{bm.description}</div>
              {bm.revenueEstimate && <div style={{fontSize:11,color:"#4ade80",marginBottom:6}}>Est: {bm.revenueEstimate}</div>}
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:bm.potential==="high"?"#4ade8018":"#60a5fa18",color:bm.potential==="high"?"#4ade80":"#60a5fa"}}>{bm.potential} potential</span>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{padding:14,background:"var(--surface-2)",borderRadius:10,border:"0.5px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>GROWTH STRATEGY</div>
            <p style={{fontSize:13,margin:0,lineHeight:1.5}}>{report.growthStrategy}</p>
          </div>
          <div style={{padding:14,background:"var(--surface-2)",borderRadius:10,border:"0.5px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>COMPETITIVE MOAT</div>
            <p style={{fontSize:13,margin:0,lineHeight:1.5}}>{report.moat}</p>
          </div>
        </div>
      </SectionCard>

      {/* Verdict */}
      <div className="fade-up" style={{padding:"20px 22px",borderRadius:12,background:vc.bg,border:`0.5px solid ${vc.border}`}}>
        <div style={{fontSize:16,fontWeight:600,color:vc.text,marginBottom:8}}>🏆 {vc.title}</div>
        <p style={{fontSize:14,lineHeight:1.7,color:"var(--foreground)",margin:0}}>{report.investmentSummary}</p>
        {report.projectedRevenue && (
          <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
            {[["Year 1",report.projectedRevenue.year1],["Year 2",report.projectedRevenue.year2],["Year 3",report.projectedRevenue.year3]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:10,color:vc.text,opacity:0.7}}>{l}</div>
                <div style={{fontSize:14,fontWeight:600,color:vc.text}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

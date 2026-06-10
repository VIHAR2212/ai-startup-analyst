"use client";
import ScoreGauge from "./ScoreGauge";
import BootstrapAdvisor from "./BootstrapAdvisor";
import EmailReport from "./EmailReport";

interface Report {
  startupName: string; tagline: string; industry: string; stage: string;
  capitalRequired?: string;
  overallScore: number; verdict: "invest" | "watch" | "pass"; investmentSummary: string;
  marketResearch: { summary: string; tam: string; sam: string; som: string; cagr: string; keyTrends: string[]; demandSignals: string; };
  competitors: Array<{ name: string; type: string; strength: string; weakness: string; threat: string }>;
  competitorSummary: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  risks: Array<{ name: string; description: string; severity: string }>;
  businessModels: Array<{ name: string; description: string; potential: string }>;
  growthStrategy: string; moat: string;
  scores: Record<string, number>;
  bootstrap?: {
    capitalTier: "low" | "medium" | "high";
    capitalAssessment: string;
    howToStart: Array<{ step: number; title: string; description: string; cost: string; timeline: string }>;
    minimumViableSetup: string;
    firstMonthGoal: string;
    bootstrapTips: string[];
    fundingOptions: Array<{ name: string; description: string; amount: string }>;
    warningIfLowCapital: string | null;
  };
  agentsUsed?: string[];
}

interface Props { report: Report; idea: string; capital: string; country: string; market: string; }

const verdictConfig = {
  invest: { label: "Strong Invest", bg: "#4ade8015", border: "#4ade8040", text: "#4ade80", title: "Strong Investment Candidate" },
  watch:  { label: "Watch",         bg: "#f59e0b15", border: "#f59e0b40", text: "#f59e0b", title: "Monitor & Revisit" },
  pass:   { label: "Pass",          bg: "#ef444415", border: "#ef444440", text: "#ef4444", title: "Not Recommended at This Stage" },
};
const severityColors: Record<string,string> = { high: "#ef4444", medium: "#f59e0b", low: "#4ade80" };
const threatColors:   Record<string,string> = { high: "#ef4444", medium: "#f59e0b", low: "#4ade80" };

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card fade-up" style={{ overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );
}

function buildReportHTML(report: Report, idea: string, capital: string): string {
  const vc = verdictConfig[report.verdict] || verdictConfig.watch;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${report.startupName} — Startup Analysis Report</title>
<style>
  body{font-family:Inter,sans-serif;background:#0a0a0f;color:#e8e8f0;margin:0;padding:24px;line-height:1.6;font-size:14px}
  .header{background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:20px}
  h1{font-size:22px;margin:0 0 6px;font-weight:600}
  .badge{display:inline-block;padding:3px 12px;border-radius:99px;font-size:12px;font-weight:500;background:${vc.bg};color:${vc.text};border:1px solid ${vc.border}}
  .section{background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:16px;overflow:hidden}
  .section-header{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);font-weight:500;font-size:14px}
  .section-body{padding:18px}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
  .metric{background:#1a1a24;border-radius:8px;padding:12px;border:1px solid rgba(255,255,255,0.08)}
  .metric-label{font-size:11px;color:#888899;margin-bottom:4px}
  .metric-value{font-size:18px;font-weight:600}
  .swot-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .swot-cell{padding:12px;border-radius:8px}
  .S{background:#4ade8010;border:1px solid #4ade8030}.W{background:#ef444410;border:1px solid #ef444430}
  .O{background:#60a5fa10;border:1px solid #60a5fa30}.T{background:#f59e0b10;border:1px solid #f59e0b30}
  .swot-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
  .S .swot-label{color:#4ade80}.W .swot-label{color:#ef4444}.O .swot-label{color:#60a5fa}.T .swot-label{color:#f59e0b}
  li{margin-bottom:4px;font-size:12px}
  .step{display:flex;gap:12px;padding:10px;background:#1a1a24;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px}
  .step-num{width:26px;height:26px;border-radius:50%;background:#4ade8015;color:#4ade80;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0}
  .tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;margin-right:6px}
  .tag-green{background:#4ade8015;color:#4ade80}.tag-blue{background:#60a5fa15;color:#60a5fa}
  .verdict-box{padding:18px;border-radius:10px;background:${vc.bg};border:1px solid ${vc.border}}
  .verdict-title{font-size:15px;font-weight:600;color:${vc.text};margin-bottom:8px}
  p{margin:0 0 8px}
</style>
</head>
<body>
<div class="header">
  <h1>${report.startupName} <span class="badge">${vc.label}</span></h1>
  <p style="color:#888899;margin:4px 0 12px">${report.tagline}</p>
  <p><strong>Idea:</strong> ${idea} &nbsp;|&nbsp; <strong>Capital:</strong> ${capital} &nbsp;|&nbsp; <strong>Industry:</strong> ${report.industry} &nbsp;|&nbsp; <strong>Stage:</strong> ${report.stage}</p>
  <p style="font-size:22px;font-weight:700;color:${report.overallScore>=70?"#4ade80":report.overallScore>=45?"#f59e0b":"#ef4444"}">Viability Score: ${report.overallScore}/100</p>
</div>

<div class="section">
  <div class="section-header">📈 Market Research</div>
  <div class="section-body">
    <div class="grid-4">
      <div class="metric"><div class="metric-label">TAM</div><div class="metric-value">${report.marketResearch?.tam}</div></div>
      <div class="metric"><div class="metric-label">SAM</div><div class="metric-value">${report.marketResearch?.sam}</div></div>
      <div class="metric"><div class="metric-label">SOM</div><div class="metric-value">${report.marketResearch?.som}</div></div>
      <div class="metric"><div class="metric-label">CAGR</div><div class="metric-value">${report.marketResearch?.cagr}</div></div>
    </div>
    <p>${report.marketResearch?.summary}</p>
  </div>
</div>

<div class="section">
  <div class="section-header">🛡️ SWOT Analysis</div>
  <div class="section-body">
    <div class="swot-grid">
      <div class="swot-cell S"><div class="swot-label">Strengths</div><ul>${(report.swot?.strengths||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-cell W"><div class="swot-label">Weaknesses</div><ul>${(report.swot?.weaknesses||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-cell O"><div class="swot-label">Opportunities</div><ul>${(report.swot?.opportunities||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
      <div class="swot-cell T"><div class="swot-label">Threats</div><ul>${(report.swot?.threats||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
    </div>
  </div>
</div>

${report.bootstrap ? `
<div class="section">
  <div class="section-header">💡 How to Start — Bootstrap Guide</div>
  <div class="section-body">
    <p>${report.bootstrap.capitalAssessment}</p>
    ${report.bootstrap.warningIfLowCapital ? `<p style="color:#ef4444">⚠️ ${report.bootstrap.warningIfLowCapital}</p>` : ""}
    ${(report.bootstrap.howToStart||[]).map(s=>`
    <div class="step">
      <div class="step-num">${s.step}</div>
      <div>
        <strong>${s.title}</strong><br/>
        <span style="font-size:12px;color:#888899">${s.description}</span><br/>
        <span class="tag tag-green">💰 ${s.cost}</span><span class="tag tag-blue">⏱ ${s.timeline}</span>
      </div>
    </div>`).join("")}
  </div>
</div>` : ""}

<div class="section">
  <div class="section-header">🏆 Investment Verdict</div>
  <div class="section-body">
    <div class="verdict-box">
      <div class="verdict-title">${vc.title}</div>
      <p>${report.investmentSummary}</p>
    </div>
  </div>
</div>

<p style="text-align:center;color:#444;font-size:11px;margin-top:24px">Generated by AI Startup Intelligence Analyst · ${new Date().toLocaleDateString()}</p>
</body></html>`;
}

export default function ReportView({ report, idea, capital, country, market }: Props) {
  const vc = verdictConfig[report.verdict] || verdictConfig.watch;
  const reportHTML = buildReportHTML(report, idea, capital);

  function exportJSON() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.startupName.replace(/\s+/g, "_")}_analysis.json`;
    a.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div className="card fade-up" style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{report.startupName}</h1>
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: vc.bg, color: vc.text, border: `0.5px solid ${vc.border}`, fontWeight: 500 }}>{vc.label}</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>{report.tagline || idea}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["🏭", report.industry], ["🚀", report.stage], ["💰", capital || "Not specified"], ["📅", new Date().toLocaleDateString("en-IN")]].map(([icon, val]) => (
                <span key={String(val)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "var(--surface-2)", border: "0.5px solid var(--border)", color: "var(--muted)" }}>{icon} {val}</span>
              ))}
            </div>
          </div>
          <ScoreGauge score={report.overallScore} size={110} />
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border)" }}>
          <EmailReport reportHtml={reportHTML} startupName={report.startupName} />
          <button onClick={exportJSON} style={{ marginTop: 8, padding: "7px 14px", fontSize: 12, border: "0.5px solid var(--border-md)", borderRadius: 8, background: "var(--surface-2)", color: "var(--muted)", cursor: "pointer" }}>⬇ Export JSON</button>
        </div>
      </div>

      {/* Market Research */}
      <SectionCard icon="📈" title="Market Research">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 14 }}>
          {[["TAM", report.marketResearch?.tam, "Total addressable"],["SAM", report.marketResearch?.sam, "Serviceable"],["SOM", report.marketResearch?.som, "Obtainable"],["CAGR", report.marketResearch?.cagr, "Growth rate"]].map(([l,v,s])=>(
            <div key={l} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 14px", border: "0.5px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{v}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{report.marketResearch?.summary}</p>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>KEY TRENDS</div>
        {report.marketResearch?.keyTrends?.map((t,i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#4ade8015", color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{i+1}</span>{t}
          </div>
        ))}
      </SectionCard>

      {/* Score Breakdown */}
      <SectionCard icon="📊" title="Score breakdown">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
          {Object.entries(report.scores || {}).map(([k, v]) => {
            const color = v >= 70 ? "#4ade80" : v >= 45 ? "#f59e0b" : "#ef4444";
            return (
              <div key={k} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 14px", border: "0.5px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color }}>{v}</div>
                <div style={{ marginTop: 6, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${v}%`, height: "100%", background: color, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Bootstrap Advisor — NEW */}
      {report.bootstrap && (
        <SectionCard icon="💡" title="How to start — Bootstrap guide">
          <BootstrapAdvisor data={report.bootstrap} capital={capital || "Not specified"} />
        </SectionCard>
      )}

      {/* Competitors */}
      <SectionCard icon="⚔️" title="Competitor landscape">
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{report.competitorSummary}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ borderBottom: "0.5px solid var(--border)" }}>
              {["Company","Type","Strength","Weakness","Threat"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "var(--muted)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {report.competitors?.map((c,i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--border)" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "9px 10px" }}><span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: c.type==="direct"?"#ef444418":"#60a5fa18", color: c.type==="direct"?"#ef4444":"#60a5fa" }}>{c.type}</span></td>
                  <td style={{ padding: "9px 10px", color: "var(--muted)" }}>{c.strength}</td>
                  <td style={{ padding: "9px 10px", color: "var(--muted)" }}>{c.weakness}</td>
                  <td style={{ padding: "9px 10px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: threatColors[c.threat]||"#888" }} />{c.threat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* SWOT */}
      <SectionCard icon="🛡️" title="SWOT analysis">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {([["S","Strengths","#4ade80",report.swot?.strengths],["W","Weaknesses","#ef4444",report.swot?.weaknesses],["O","Opportunities","#60a5fa",report.swot?.opportunities],["T","Threats","#f59e0b",report.swot?.threats]] as [string,string,string,string[]][]).map(([key,label,color,items])=>(
            <div key={key} style={{ padding: "12px 14px", borderRadius: 10, background: color+"0f", border: `0.5px solid ${color}28` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {items?.map((item,i) => <li key={i} style={{ fontSize: 12, display: "flex", gap: 6 }}><span style={{ color, flexShrink: 0 }}>›</span>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risks */}
      <SectionCard icon="⚠️" title="Risk analysis">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {report.risks?.map((risk,i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{risk.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{risk.description}</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: (severityColors[risk.severity]||"#888")+"18", color: severityColors[risk.severity]||"#888", flexShrink: 0, fontWeight: 500 }}>{risk.severity}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Business Models */}
      <SectionCard icon="💰" title="Business model suggestions">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
          {report.businessModels?.map((bm,i) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{bm.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{bm.description}</div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: bm.potential==="high"?"#4ade8018":"#60a5fa18", color: bm.potential==="high"?"#4ade80":"#60a5fa" }}>{bm.potential} potential</span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>GROWTH STRATEGY</div>
            <p style={{ fontSize: 13, margin: 0 }}>{report.growthStrategy}</p>
          </div>
          <div style={{ padding: 14, background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>COMPETITIVE MOAT</div>
            <p style={{ fontSize: 13, margin: 0 }}>{report.moat}</p>
          </div>
        </div>
      </SectionCard>

      {/* Verdict */}
      <div className="fade-up" style={{ padding: "20px 22px", borderRadius: 12, background: vc.bg, border: `0.5px solid ${vc.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: vc.text, marginBottom: 8 }}>🏆 {vc.title}</div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--foreground)", margin: 0 }}>{report.investmentSummary}</p>
      </div>

    </div>
  );
}

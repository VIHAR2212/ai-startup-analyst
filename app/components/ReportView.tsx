"use client";

import ScoreGauge from "./ScoreGauge";

interface Report {
  startupName: string;
  tagline: string;
  industry: string;
  stage: string;
  overallScore: number;
  verdict: "invest" | "watch" | "pass";
  investmentSummary: string;
  marketResearch: {
    summary: string;
    tam: string;
    sam: string;
    som: string;
    cagr: string;
    keyTrends: string[];
    demandSignals: string;
  };
  competitors: Array<{ name: string; type: string; strength: string; weakness: string; threat: string }>;
  competitorSummary: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  risks: Array<{ name: string; description: string; severity: string }>;
  businessModels: Array<{ name: string; description: string; potential: string }>;
  growthStrategy: string;
  moat: string;
  scores: Record<string, number>;
}

interface Props {
  report: Report;
  idea: string;
}

const verdictConfig = {
  invest: { label: "Strong Invest", bg: "#4ade8015", border: "#4ade8040", text: "#4ade80", title: "Strong Investment Candidate" },
  watch:  { label: "Watch",        bg: "#f59e0b15", border: "#f59e0b40", text: "#f59e0b", title: "Monitor & Revisit" },
  pass:   { label: "Pass",         bg: "#ef444415", border: "#ef444440", text: "#ef4444", title: "Not Recommended at This Stage" },
};

const severityColors = { high: "#ef4444", medium: "#f59e0b", low: "#4ade80" };
const threatColors   = { high: "#ef4444", medium: "#f59e0b", low: "#4ade80" };

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

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 14px", border: "0.5px solid var(--border)" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function ReportView({ report, idea }: Props) {
  const vc = verdictConfig[report.verdict] || verdictConfig.watch;

  function exportJSON() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.startupName.replace(/\s+/g, "_")}_analysis.json`;
    a.click();
  }

  function exportPDF() { window.print(); }

  function shareReport() {
    const text = `🧠 AI Startup Analysis: ${report.startupName}\n📊 Score: ${report.overallScore}/100\n💡 Verdict: ${vc.label}\n\nAnalyzed with AI Startup Intelligence Analyst`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
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
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>{report.tagline || idea}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["🏭", report.industry], ["🚀", report.stage], ["📅", new Date().toLocaleDateString("en-IN")]].map(([icon, val]) => (
                <span key={String(val)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "var(--surface-2)", border: "0.5px solid var(--border)", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  {icon} {val}
                </span>
              ))}
            </div>
          </div>
          <ScoreGauge score={report.overallScore} size={110} />
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "0.5px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={exportPDF} style={{ fontSize: 12, padding: "7px 14px" }}>📄 Export PDF</button>
          <button className="btn-ghost" onClick={exportJSON}>⬇ JSON</button>
          <button className="btn-ghost" onClick={shareReport}>📤 Share</button>
        </div>
      </div>

      {/* Market Research */}
      <SectionCard icon="📈" title="Market Research">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 16 }}>
          <MetricCard label="TAM" value={report.marketResearch?.tam} sub="Total addressable" />
          <MetricCard label="SAM" value={report.marketResearch?.sam} sub="Serviceable" />
          <MetricCard label="SOM" value={report.marketResearch?.som} sub="Obtainable" />
          <MetricCard label="CAGR" value={report.marketResearch?.cagr} sub="Growth rate" />
        </div>
        <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.7, marginBottom: 14 }}>{report.marketResearch?.summary}</p>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>KEY MARKET TRENDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {report.marketResearch?.keyTrends?.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: 12, background: "var(--surface-2)", borderRadius: 8, border: "0.5px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>DEMAND SIGNALS</div>
          <p style={{ fontSize: 13, margin: 0 }}>{report.marketResearch?.demandSignals}</p>
        </div>
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

      {/* Competitors */}
      <SectionCard icon="⚔️" title="Competitor landscape">
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>{report.competitorSummary}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
                {["Company", "Type", "Strength", "Weakness", "Threat"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "var(--muted)", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.competitors?.map((c, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--border)" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: c.type === "direct" ? "#ef444418" : "#60a5fa18", color: c.type === "direct" ? "#ef4444" : "#60a5fa" }}>{c.type}</span>
                  </td>
                  <td style={{ padding: "9px 10px", color: "var(--muted)" }}>{c.strength}</td>
                  <td style={{ padding: "9px 10px", color: "var(--muted)" }}>{c.weakness}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: (threatColors as Record<string,string>)[c.threat] || "#888" }} />
                      {c.threat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* SWOT */}
      <SectionCard icon="🛡️" title="SWOT analysis">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {([
            ["S", "Strengths",     "#4ade80", report.swot?.strengths],
            ["W", "Weaknesses",    "#ef4444", report.swot?.weaknesses],
            ["O", "Opportunities", "#60a5fa", report.swot?.opportunities],
            ["T", "Threats",       "#f59e0b", report.swot?.threats],
          ] as [string, string, string, string[]][]).map(([key, label, color, items]) => (
            <div key={key} style={{ padding: "12px 14px", borderRadius: 10, background: color + "0f", border: `0.5px solid ${color}28` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {items?.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, display: "flex", gap: 6 }}>
                    <span style={{ color, flexShrink: 0 }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risks */}
      <SectionCard icon="⚠️" title="Risk analysis">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {report.risks?.map((risk, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{risk.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{risk.description}</div>
              </div>
              <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: ((severityColors as Record<string,string>)[risk.severity] || "#888") + "18", color: (severityColors as Record<string,string>)[risk.severity] || "#888", flexShrink: 0, fontWeight: 500 }}>
                {risk.severity}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Business Models */}
      <SectionCard icon="💰" title="Business model suggestions">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
          {report.businessModels?.map((bm, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{bm.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{bm.description}</div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: bm.potential === "high" ? "#4ade8018" : "#60a5fa18", color: bm.potential === "high" ? "#4ade80" : "#60a5fa" }}>
                {bm.potential} potential
              </span>
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

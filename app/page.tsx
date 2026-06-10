"use client";
import { useState } from "react";
import AgentPanel from "./components/AgentPanel";
import ReportView from "./components/ReportView";

type AgentState = "idle" | "running" | "done" | "error";
interface HistoryEntry { idea: string; capital: string; report: Report; ts: number; }
interface Report {
  startupName: string; tagline: string; industry: string; stage: string; capitalRequired?: string;
  overallScore: number; verdict: "invest" | "watch" | "pass"; investmentSummary: string;
  marketResearch: { summary: string; tam: string; sam: string; som: string; cagr: string; keyTrends: string[]; demandSignals: string; };
  competitors: Array<{ name: string; type: string; strength: string; weakness: string; threat: string }>;
  competitorSummary: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  risks: Array<{ name: string; description: string; severity: string }>;
  businessModels: Array<{ name: string; description: string; potential: string }>;
  growthStrategy: string; moat: string; scores: Record<string, number>;
  bootstrap?: { capitalTier: "low"|"medium"|"high"; capitalAssessment: string; howToStart: any[]; minimumViableSetup: string; firstMonthGoal: string; bootstrapTips: string[]; fundingOptions: any[]; warningIfLowCapital: string|null; };
  agentsUsed?: string[];
}

const AGENTS_CONFIG = [
  { name: "Market Research",     description: "Trends & demand",    color: "#4ade80", icon: "📈", model: "Groq",   modelColor: "#f97316" },
  { name: "Competitor Analysis", description: "Landscape mapping",  color: "#60a5fa", icon: "⚔️",  model: "Claude", modelColor: "#a78bfa" },
  { name: "Business Strategy",   description: "Growth & models",    color: "#f59e0b", icon: "♟️",  model: "Groq",   modelColor: "#f97316" },
  { name: "Scoring Agent",       description: "Viability 0–100",    color: "#f472b6", icon: "📊", model: "Groq",   modelColor: "#f97316" },
  { name: "Bootstrap Advisor",   description: "How to start lean",  color: "#4ade80", icon: "💡", model: "Claude", modelColor: "#a78bfa" },
  { name: "Synthesizer",         description: "Final report build", color: "#a78bfa", icon: "🧠", model: "Claude", modelColor: "#a78bfa" },
];

const STAGE_LABELS = [
  "⚡ Groq scanning market trends…",
  "🔮 Claude mapping competitors…",
  "⚡ Groq building growth strategy…",
  "⚡ Groq scoring viability & risks…",
  "🔮 Claude crafting bootstrap guide…",
  "🧠 Claude synthesizing final report…",
];

const CAPITAL_PRESETS = ["₹10,000–₹50,000","₹50,000–₹2L","₹2L–₹10L","₹10L–₹50L","₹50L+","$1K–$5K","$5K–$50K","$50K+"];
const EXAMPLES = [
  "AI-powered personal finance coach for Gen Z",
  "Marketplace for micro-influencers in tier-2 cities",
  "SaaS for college exam prep using spaced repetition",
  "On-demand home services for Tier-3 Indian cities",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [capital, setCapital] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<AgentState[]>(["idle","idle","idle","idle","idle","idle"]);
  const [report, setReport] = useState<Report | null>(null);
  const [currentIdea, setCurrentIdea] = useState("");
  const [currentCapital, setCurrentCapital] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [error, setError] = useState("");

  const agents = AGENTS_CONFIG.map((a, i) => ({ ...a, state: agentStates[i] }));

  async function analyze() {
    if (!idea.trim() || loading) return;
    setError(""); setLoading(true); setReport(null); setActiveIdx(null);
    setAgentStates(["idle","idle","idle","idle","idle","idle"]);
    setProgress(0); setStageIdx(-1);

    const stageProgress = [15,30,47,62,78,92];
    let si = 0;
    const interval = setInterval(() => {
      if (si < AGENTS_CONFIG.length) {
        setStageIdx(si); setProgress(stageProgress[si]);
        if (si > 0) setAgentStates(prev => prev.map((s,i) => i===si-1 ? "done" : s));
        setAgentStates(prev => prev.map((s,i) => i===si ? "running" : s));
        si++;
      }
    }, 2000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, capital: capital || "Not specified" }),
      });
      clearInterval(interval);
      if (!res.ok) { const e = await res.json(); throw new Error(e.details || e.error || "API error"); }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAgentStates(["done","done","done","done","done","done"]);
      setProgress(100); setStageIdx(6);
      const entry = { idea, capital, report: data.report, ts: Date.now() };
      setHistory(prev => [entry, ...prev]);
      setReport(data.report); setCurrentIdea(idea); setCurrentCapital(capital);
      setActiveIdx(0);
    } catch (err) {
      clearInterval(interval);
      const msg = String(err).replace("Error: ","");
      setError(msg.length > 120 ? msg.slice(0,120)+"…" : msg);
      setAgentStates(prev => prev.map(s => s==="running" ? "error" : s));
    }
    setLoading(false);
  }

  function loadHistory(i: number) {
    const e = history[i];
    setReport(e.report); setCurrentIdea(e.idea); setCurrentCapital(e.capital); setActiveIdx(i);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ padding: "0 20px", height: 54, borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#4ade8020", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🧠</div>
        <span style={{ fontWeight: 600, fontSize: 14 }}>AI Startup Intelligence Analyst</span>
        <div style={{ display: "flex", gap: 5, marginLeft: 8 }}>
          {[["⚡","Groq","#f97316"],["🔮","Claude","#a78bfa"],["✨","Gemini","#60a5fa"]].map(([icon,name,color]) => (
            <span key={name} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: (color as string)+"18", color: color as string, border: `0.5px solid ${color}30` }}>{icon} {name}</span>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 9px", borderRadius: 99, background: "#4ade8015", color: "#4ade80", border: "0.5px solid #4ade8030" }}>⚡ 6 agents · 3 models</span>
      </header>

      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 54px)" }}>
        <aside className="sidebar" style={{ borderRight: "0.5px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Startup idea</div>
            <textarea
              value={idea} onChange={e => setIdea(e.target.value)}
              onKeyDown={e => e.key==="Enter" && e.ctrlKey && analyze()}
              placeholder="Describe your startup idea…"
              style={{ width: "100%", background: "var(--surface-2)", border: "0.5px solid var(--border-md)", borderRadius: 8, padding: "9px 11px", color: "var(--foreground)", fontSize: 13, resize: "none", minHeight: 80, fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor="#4ade8060"} onBlur={e => e.target.style.borderColor="var(--border-md)"}
            />

            {/* Capital input */}
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 6px" }}>Available capital</div>
            <input
              value={capital} onChange={e => setCapital(e.target.value)}
              placeholder="e.g. ₹50,000 or $5,000"
              style={{ width: "100%", background: "var(--surface-2)", border: "0.5px solid var(--border-md)", borderRadius: 8, padding: "8px 11px", color: "var(--foreground)", fontSize: 13, fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor="#4ade8060"} onBlur={e => e.target.style.borderColor="var(--border-md)"}
            />
            {/* Capital presets */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {CAPITAL_PRESETS.map(p => (
                <button key={p} onClick={() => setCapital(p)} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: capital===p?"#4ade8020":"var(--surface-3)", color: capital===p?"#4ade80":"var(--muted)", border: `0.5px solid ${capital===p?"#4ade8040":"var(--border)"}`, cursor: "pointer" }}>{p}</button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "var(--muted)", margin: "8px 0" }}>Ctrl+Enter to run</div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={analyze} disabled={loading || !idea.trim()}>
              {loading ? "🔄 Agents running…" : "🚀 Analyze startup"}
            </button>
            {error && <div style={{ marginTop: 8, fontSize: 11, color: "#ef4444", padding: "8px 10px", background: "#ef444410", borderRadius: 6, lineHeight: 1.5 }}>⚠️ {error}</div>}
          </div>

          <div className="card" style={{ padding: 10 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Try an example</div>
            {EXAMPLES.map((ex,i) => (
              <button key={i} onClick={() => setIdea(ex)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "0.5px solid transparent", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "var(--muted)", cursor: "pointer", transition: "all 0.15s", marginBottom: 2 }}
                onMouseOver={e => { (e.target as HTMLElement).style.background="var(--surface-2)"; (e.target as HTMLElement).style.color="var(--foreground)"; }}
                onMouseOut={e => { (e.target as HTMLElement).style.background="transparent"; (e.target as HTMLElement).style.color="var(--muted)"; }}>
                {ex}
              </button>
            ))}
          </div>

          <AgentPanel agents={agents} />

          {loading && stageIdx >= 0 && (
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 8 }}>{STAGE_LABELS[stageIdx] || "Finalizing…"}</div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#f97316,#a78bfa,#60a5fa)", borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>{progress}% complete</div>
            </div>
          )}

          {history.length > 0 && (
            <div className="card" style={{ padding: 10 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>History</div>
              {history.map((e,i) => (
                <button key={e.ts} onClick={() => loadHistory(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: i===activeIdx?"0.5px solid #4ade8040":"0.5px solid transparent", background: i===activeIdx?"#4ade8010":"transparent", cursor: "pointer", marginBottom: 3, transition: "all 0.15s" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.report.startupName}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>Score {e.report.overallScore}/100 · {e.capital || "—"}</div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main style={{ padding: "20px 22px", overflowY: "auto" }}>
          {!report && !loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: 48 }}>🧠</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Multi-model AI startup analyst</h2>
              <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 400, lineHeight: 1.7, margin: 0 }}>
                Enter your startup idea + available capital. Get a full VC report plus a personalised bootstrap guide on how to start from your budget.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {["📈 Market sizing","⚔️ Competitors","🛡️ SWOT","⚠️ Risks","💡 How to start","💰 Business models","🏆 Verdict","📧 Email report"].map(f=>(
                  <span key={f} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 99, background: "var(--surface-2)", border: "0.5px solid var(--border)", color: "var(--muted)" }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", gap: 20 }}>
              <div style={{ position: "relative", width: 56, height: 56 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "#f97316", animation: "spin 0.8s linear infinite", position: "absolute" }} />
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid transparent", borderLeftColor: "#a78bfa", animation: "spin 1.2s linear infinite reverse", position: "absolute" }} />
              </div>
              <div style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 500 }}>{stageIdx >= 0 ? STAGE_LABELS[stageIdx] : "Initializing agents…"}</div>
              <div style={{ width: 240, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#f97316,#a78bfa,#60a5fa)", borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{progress}% — 6 agents running</div>
            </div>
          )}

          {report && !loading && <ReportView report={report} idea={currentIdea} capital={currentCapital} />}
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

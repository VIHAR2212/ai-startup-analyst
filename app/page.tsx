"use client";

import { useState } from "react";
import AgentPanel from "./components/AgentPanel";
import ReportView from "./components/ReportView";

type AgentState = "idle" | "running" | "done" | "error";
interface HistoryEntry { idea: string; report: Report; ts: number; }
interface Report {
  startupName: string; tagline: string; industry: string; stage: string;
  overallScore: number; verdict: "invest" | "watch" | "pass"; investmentSummary: string;
  marketResearch: { summary: string; tam: string; sam: string; som: string; cagr: string; keyTrends: string[]; demandSignals: string; };
  competitors: Array<{ name: string; type: string; strength: string; weakness: string; threat: string }>;
  competitorSummary: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  risks: Array<{ name: string; description: string; severity: string }>;
  businessModels: Array<{ name: string; description: string; potential: string }>;
  growthStrategy: string; moat: string;
  scores: Record<string, number>;
}

const AGENTS = [
  { name: "Market Research", description: "Trends & demand analysis", color: "#4ade80", icon: "📈" },
  { name: "Competitor Analysis", description: "Landscape mapping", color: "#60a5fa", icon: "⚔️" },
  { name: "Business Strategy", description: "Monetization & growth", color: "#f59e0b", icon: "♟️" },
  { name: "Scoring Agent", description: "Viability scoring 0–100", color: "#f472b6", icon: "📊" },
];

const AGENT_STAGES = [
  "Market Research Agent scanning trends…",
  "Competitor Analysis Agent mapping landscape…",
  "Business Strategy Agent building growth plan…",
  "Scoring Agent computing viability score…",
];

const EXAMPLE_IDEAS = [
  "AI-powered personal finance coach for Gen Z",
  "Marketplace for micro-influencers in tier-2 Indian cities",
  "SaaS platform for college exam preparation using spaced repetition",
  "On-demand home services app for Tier-3 Indian cities",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<AgentState[]>(["idle","idle","idle","idle"]);
  const [report, setReport] = useState<Report | null>(null);
  const [currentIdea, setCurrentIdea] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeHistoryIdx, setActiveHistoryIdx] = useState<number | null>(null);
  const [error, setError] = useState("");

  const agents = AGENTS.map((a, i) => ({ ...a, state: agentStates[i] }));

  const setAgentState = (idx: number, state: AgentState) =>
    setAgentStates(prev => prev.map((s, i) => i === idx ? state : s));

  async function analyze() {
    if (!idea.trim() || loading) return;
    setError("");
    setLoading(true);
    setReport(null);
    setActiveHistoryIdx(null);
    setAgentStates(["idle","idle","idle","idle"]);
    setProgress(5);

    const stageProgress = [20, 45, 70, 90];
    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < AGENT_STAGES.length) {
        setLoadingStage(AGENT_STAGES[stageIdx]);
        setProgress(stageProgress[stageIdx]);
        if (stageIdx > 0) setAgentState(stageIdx - 1, "done");
        setAgentState(stageIdx, "running");
        stageIdx++;
      }
    }, 1600);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      clearInterval(interval);

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAgentStates(["done","done","done","done"]);
      setProgress(100);
      setLoadingStage("Building your report…");

      const entry = { idea, report: data.report, ts: Date.now() };
      setHistory(prev => [entry, ...prev]);
      setReport(data.report);
      setCurrentIdea(idea);
      setActiveHistoryIdx(0);
    } catch (err) {
      clearInterval(interval);
      setError("Analysis failed. Check your API key and try again.");
      setAgentStates(prev => prev.map(s => s === "running" ? "error" : s));
      console.error(err);
    }
    setLoading(false);
  }

  function loadHistory(idx: number) {
    const e = history[idx];
    setReport(e.report);
    setCurrentIdea(e.idea);
    setActiveHistoryIdx(idx);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top nav */}
      <header style={{ padding: "0 20px", height: 56, borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#4ade8022", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
        <span style={{ fontWeight: 600, fontSize: 15 }}>AI Startup Intelligence Analyst</span>
        <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#4ade8015", color: "#4ade80", border: "0.5px solid #4ade8030" }}>⚡ 4 agents online</span>
      </header>

      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <aside className="sidebar" style={{ borderRight: "0.5px solid var(--border)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {/* Input card */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Startup idea</div>
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && analyze()}
              placeholder="Describe your startup idea in detail…"
              style={{ width: "100%", background: "var(--surface-2)", border: "0.5px solid var(--border-md)", borderRadius: 8, padding: "10px 12px", color: "var(--foreground)", fontSize: 13, resize: "none", minHeight: 100, fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "#4ade8060"}
              onBlur={e => e.target.style.borderColor = "var(--border-md)"}
            />
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, marginBottom: 10 }}>Ctrl+Enter to analyze</div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={analyze} disabled={loading || !idea.trim()}>
              {loading ? "⏳ Analyzing…" : "🚀 Analyze startup"}
            </button>
            {error && <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)", padding: "8px 10px", background: "#ef444410", borderRadius: 6 }}>{error}</div>}
          </div>

          {/* Examples */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Try an example</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {EXAMPLE_IDEAS.map((ex, i) => (
                <button key={i} onClick={() => setIdea(ex)} style={{ textAlign: "left", background: "transparent", border: "0.5px solid transparent", borderRadius: 6, padding: "6px 8px", fontSize: 12, color: "var(--muted)", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseOver={e => { (e.target as HTMLButtonElement).style.background = "var(--surface-2)"; (e.target as HTMLButtonElement).style.color = "var(--foreground)"; (e.target as HTMLButtonElement).style.borderColor = "var(--border)"; }}
                  onMouseOut={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "var(--muted)"; (e.target as HTMLButtonElement).style.borderColor = "transparent"; }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Agent panel */}
          <AgentPanel agents={agents} />

          {/* Loading progress */}
          {loading && (
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{loadingStage}</div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card" style={{ padding: 12, flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {history.map((e, i) => (
                  <button key={e.ts} onClick={() => loadHistory(i)} style={{ textAlign: "left", padding: "8px 10px", borderRadius: 8, border: i === activeHistoryIdx ? "0.5px solid #4ade8040" : "0.5px solid var(--border)", background: i === activeHistoryIdx ? "#4ade8010" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.report.startupName}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Score: {e.report.overallScore}/100 · {e.report.verdict}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ padding: "20px 22px", overflowY: "auto" }}>
          {!report && !loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: 52 }}>🧠</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Drop your startup idea</h2>
              <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 360, lineHeight: 1.7, margin: 0 }}>
                Our four-agent council runs a full VC-grade analysis — market sizing, competitive landscape, SWOT, risk scan, and investment verdict.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
                {["📈 Market sizing", "⚔️ Competitors", "🛡️ SWOT", "⚠️ Risks", "💰 Business models", "🏆 Investment verdict"].map(f => (
                  <span key={f} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: "var(--surface-2)", border: "0.5px solid var(--border)", color: "var(--muted)" }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "#4ade80", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 14, color: "var(--muted)" }}>{loadingStage}</div>
              <div style={{ width: 220, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {report && !loading && <ReportView report={report} idea={currentIdea} />}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

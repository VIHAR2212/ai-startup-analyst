"use client";

interface BootstrapData {
  capitalTier: "low" | "medium" | "high";
  capitalAssessment: string;
  howToStart: Array<{ step: number; title: string; description: string; cost: string; timeline: string }>;
  minimumViableSetup: string;
  firstMonthGoal: string;
  bootstrapTips: string[];
  fundingOptions: Array<{ name: string; description: string; amount: string }>;
  warningIfLowCapital: string | null;
}

interface Props { data: BootstrapData; capital: string; }

const tierConfig = {
  low:    { label: "Low capital",    color: "#ef4444", bg: "#ef444412", border: "#ef444430", icon: "💡" },
  medium: { label: "Medium capital", color: "#f59e0b", bg: "#f59e0b12", border: "#f59e0b30", icon: "🚀" },
  high:   { label: "High capital",   color: "#4ade80", bg: "#4ade8012", border: "#4ade8030", icon: "💎" },
};

export default function BootstrapAdvisor({ data, capital }: Props) {
  const tier = tierConfig[data.capitalTier] || tierConfig.medium;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Capital Assessment */}
      <div style={{ padding: "14px 16px", borderRadius: 10, background: tier.bg, border: `0.5px solid ${tier.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{tier.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: tier.color }}>{tier.label} — {capital}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>Capital assessment</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--foreground)", margin: 0, lineHeight: 1.6 }}>{data.capitalAssessment}</p>
        {data.warningIfLowCapital && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#ef444415", borderRadius: 8, border: "0.5px solid #ef444430" }}>
            <span style={{ fontSize: 12, color: "#ef4444" }}>⚠️ {data.warningIfLowCapital}</span>
          </div>
        )}
      </div>

      {/* How to Start — Step by step */}
      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Step-by-step launch plan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.howToStart?.map((step) => (
            <div key={step.step} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: tier.bg, border: `0.5px solid ${tier.border}`, color: tier.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                {step.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 6 }}>{step.description}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#4ade8015", color: "#4ade80" }}>💰 {step.cost}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#60a5fa15", color: "#60a5fa" }}>⏱ {step.timeline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MVP + First month */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>MINIMUM VIABLE SETUP</div>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{data.minimumViableSetup}</p>
        </div>
        <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>FIRST MONTH GOAL</div>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{data.firstMonthGoal}</p>
        </div>
      </div>

      {/* Bootstrap Tips */}
      <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>BOOTSTRAP TIPS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.bootstrapTips?.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "flex-start" }}>
              <span style={{ color: tier.color, flexShrink: 0, marginTop: 1 }}>→</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Funding Options */}
      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Funding options to explore</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {data.fundingOptions?.map((f, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{f.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, lineHeight: 1.4 }}>{f.description}</div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#4ade8015", color: "#4ade80" }}>{f.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

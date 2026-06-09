"use client";

interface Props {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 100 }: Props) {
  const r = 38;
  const cx = 50, cy = 50;
  const angle = (Math.min(Math.max(score, 0), 100) / 100) * Math.PI;
  const x = cx - r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  const color = score >= 70 ? "#4ade80" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg viewBox="0 0 100 55" width={size} height={size * 0.6} role="img" aria-label={`Viability score: ${score} out of 100`}>
        <path d="M12,50 A38,38 0 0,1 88,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeLinecap="round" />
        <path d={`M12,50 A38,38 0 0,1 ${x.toFixed(2)},${y.toFixed(2)}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="5" fill={color} />
      </svg>
      <div style={{ fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>Viability score</div>
    </div>
  );
}

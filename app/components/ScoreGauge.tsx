"use client";
interface Props { score: number; size?: number; }

export default function ScoreGauge({ score, size = 110 }: Props) {
  const s = Math.min(Math.max(score, 0), 100);
  const r = 38, cx = 50, cy = 50;
  const angle = (s / 100) * Math.PI;
  const x = cx - r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  const color = s >= 68 ? "#5cb85c" : s >= 48 ? "#d4841a" : "#e05555";
  const glow  = s >= 68 ? "rgba(92,184,92,0.5)" : s >= 48 ? "rgba(212,132,26,0.6)" : "rgba(224,85,85,0.5)";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <svg viewBox="0 0 100 55" width={size} height={size*0.56}>
        <defs>
          <filter id="sg"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)"/>
          </linearGradient>
        </defs>
        <path d="M12,50 A38,38 0 0,1 88,50" fill="none" stroke="url(#track-grad)" strokeWidth="7" strokeLinecap="round"/>
        <path d={`M12,50 A38,38 0 0,1 ${x.toFixed(2)},${y.toFixed(2)}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" filter="url(#sg)"/>
        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="5.5" fill={color} filter="url(#sg)"/>
        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="2.5" fill="#000"/>
      </svg>
      <div style={{ fontSize: size > 100 ? 40 : 28, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric:"tabular-nums", filter:`drop-shadow(0 0 14px ${glow})` }}>{s}</div>
      <div style={{ fontSize: 9, color:"var(--hint)", letterSpacing:"0.12em", textTransform:"uppercase" }}>Viability Score</div>
    </div>
  );
}

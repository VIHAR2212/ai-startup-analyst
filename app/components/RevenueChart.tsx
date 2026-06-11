"use client";
import { useEffect, useRef } from "react";

interface Props {
  data: {
    months: number[];
    revenue: number[];
    unit: string;
  };
  verdict: "invest"|"watch"|"pass";
}

export default function RevenueChart({ data, verdict }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.months?.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 24, right: 20, bottom: 40, left: 60 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...data.revenue, 1);
    const color = verdict === "invest" ? "#4ade80" : verdict === "watch" ? "#f59e0b" : "#ef4444";

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      const val = maxVal - (maxVal / 4) * i;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(val >= 100 ? Math.round(val)+"" : val.toFixed(1), pad.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    data.months.forEach((m, i) => {
      const x = pad.left + (chartW / (data.months.length - 1)) * i;
      ctx.fillText(`M${m}`, x, H - pad.bottom + 16);
    });

    // Area fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "05");
    ctx.beginPath();
    data.revenue.forEach((v, i) => {
      const x = pad.left + (chartW / (data.revenue.length - 1)) * i;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    data.revenue.forEach((v, i) => {
      const x = pad.left + (chartW / (data.revenue.length - 1)) * i;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    data.revenue.forEach((v, i) => {
      const x = pad.left + (chartW / (data.revenue.length - 1)) * i;
      const y = pad.top + chartH - (v / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0f";
      ctx.fill();
    });

    // Unit label
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(data.unit, pad.left, pad.top - 6);

  }, [data, verdict]);

  if (!data?.months?.length) return null;

  const trend = data.revenue[data.revenue.length-1] > data.revenue[0];

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{fontSize:11,color:"var(--muted)"}}>Projected revenue trajectory ({data.unit})</div>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:trend?"#4ade8018":"#ef444418",color:trend?"#4ade80":"#ef4444"}}>
          {trend ? "📈 Growth trend" : "📉 Declining trend"}
        </span>
      </div>
      <canvas ref={canvasRef} style={{width:"100%",height:200,display:"block"}} />
    </div>
  );
}

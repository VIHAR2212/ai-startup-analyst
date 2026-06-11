"use client";
import { useEffect, useRef } from "react";

interface Props {
  data: {
    categories: string[];
    percentages: number[];
    amounts: string[];
  };
  capital: string;
}

const COLORS = ["#4ade80","#60a5fa","#f59e0b","#a78bfa","#f472b6","#34d399"];

export default function FundingPieChart({ data, capital }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.percentages?.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.38;
    const innerR = size * 0.22;

    // Normalize percentages
    const total = data.percentages.reduce((a,b) => a+b, 0);
    const normalized = data.percentages.map(p => (p/total)*360);

    let startAngle = -Math.PI / 2;

    normalized.forEach((angle, i) => {
      const endAngle = startAngle + (angle * Math.PI / 180);
      const midAngle = startAngle + (angle * Math.PI / 180) / 2;
      const isLarge = angle > 45;

      // Slight 3D effect — offset slice outward
      const offsetX = Math.cos(midAngle) * 4;
      const offsetY = Math.sin(midAngle) * 4;

      // Shadow
      ctx.shadowColor = COLORS[i] + "44";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(cx + offsetX, cy + offsetY);
      ctx.arc(cx + offsetX, cy + offsetY, outerR, startAngle, endAngle);
      ctx.arc(cx + offsetX, cy + offsetY, innerR, endAngle, startAngle, true);
      ctx.closePath();

      // Gradient fill
      const grad = ctx.createRadialGradient(cx+offsetX, cy+offsetY, innerR, cx+offsetX, cy+offsetY, outerR);
      grad.addColorStop(0, COLORS[i] + "cc");
      grad.addColorStop(1, COLORS[i]);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Percentage label for large slices
      if (isLarge) {
        const labelR = (outerR + innerR) / 2;
        const lx = cx + offsetX + Math.cos(midAngle) * labelR;
        const ly = cy + offsetY + Math.sin(midAngle) * labelR;
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${size*0.05}px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${Math.round(data.percentages[i])}%`, lx, ly);
      }

      startAngle = endAngle;
    });

    // Centre label
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `600 ${size*0.065}px Inter,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Capital", cx, cy - size*0.04);
    ctx.font = `${size*0.05}px Inter,sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Allocation", cx, cy + size*0.04);

  }, [data, capital]);

  if (!data?.percentages?.length) return null;

  return (
    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <canvas ref={canvasRef} style={{width:160,height:160,flexShrink:0}} />
      <div style={{flex:1,minWidth:140}}>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>How to allocate {capital}</div>
        {data.categories.map((cat,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:2,background:COLORS[i],flexShrink:0}} />
            <div style={{flex:1,fontSize:11,color:"var(--foreground)"}}>{cat}</div>
            <div style={{fontSize:11,color:COLORS[i],fontWeight:600}}>{data.amounts[i]}</div>
            <div style={{fontSize:10,color:"var(--muted)"}}>{data.percentages[i]}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

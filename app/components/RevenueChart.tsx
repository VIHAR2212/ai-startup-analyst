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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function RevenueChart({ data, verdict }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

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

    const maxVal = Math.max(...data.revenue, 1);
    const color = verdict === "invest" ? "#4ade80" : verdict === "watch" ? "#f59e0b" : "#9ca3af";

    const points = data.revenue.map((v, i) => ({
      x: pad.left + (chartW / (data.revenue.length - 1)) * i,
      y: pad.top + chartH - (v / maxVal) * chartH,
    }));

    const DURATION = 1000; // ms
    let start: number | null = null;

    function drawStaticLayers() {
      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (chartH / 4) * i;
        ctx!.beginPath();
        ctx!.strokeStyle = "rgba(255,255,255,0.06)";
        ctx!.lineWidth = 1;
        ctx!.moveTo(pad.left, y);
        ctx!.lineTo(pad.left + chartW, y);
        ctx!.stroke();
        const val = maxVal - (maxVal / 4) * i;
        ctx!.fillStyle = "rgba(255,255,255,0.35)";
        ctx!.font = "10px Inter, sans-serif";
        ctx!.textAlign = "right";
        ctx!.fillText(val >= 100 ? Math.round(val)+"" : val.toFixed(1), pad.left - 6, y + 4);
      }
      // X labels — convert months-from-now to calendar years
      ctx!.fillStyle = "rgba(255,255,255,0.35)";
      ctx!.font = "10px Inter, sans-serif";
      ctx!.textAlign = "center";
      const currentYear = new Date().getFullYear();
      data.months.forEach((m, i) => {
        const x = pad.left + (chartW / (data.months.length - 1)) * i;
        const yearOffset = Math.floor((m - 1) / 12);
        ctx!.fillText(`${currentYear + yearOffset}`, x, H - pad.bottom + 16);
      });
      // Unit label
      ctx!.fillStyle = "rgba(255,255,255,0.3)";
      ctx!.font = "10px Inter, sans-serif";
      ctx!.textAlign = "left";
      ctx!.fillText(data.unit, pad.left, pad.top - 6);
    }

    // Returns the point along the polyline at fractional progress [0,1],
    // plus the index of the last fully-passed vertex and the t within that segment.
    function getPathPoint(progress: number) {
      const totalSegments = points.length - 1;
      if (totalSegments <= 0) {
        return { x: points[0].x, y: points[0].y, upToIndex: 0, segT: 0 };
      }
      const segFloat = progress * totalSegments;
      const segIndex = Math.min(Math.floor(segFloat), totalSegments - 1);
      const segT = segFloat - segIndex;
      const p0 = points[segIndex];
      const p1 = points[segIndex + 1];
      return {
        x: p0.x + (p1.x - p0.x) * segT,
        y: p0.y + (p1.y - p0.y) * segT,
        upToIndex: segIndex,
        segT,
      };
    }

    function render(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const rawProgress = Math.min(elapsed / DURATION, 1);
      const progress = easeOutCubic(rawProgress);

      ctx!.clearRect(0, 0, W, H);
      drawStaticLayers();

      const { x: curX, y: curY, upToIndex, segT } = getPathPoint(progress);

      // Build the visible point list: all fully-passed vertices + current interpolated point
      const visiblePoints = points.slice(0, upToIndex + 1);
      if (segT > 0 || progress >= 1 || upToIndex === points.length - 1) {
        visiblePoints.push({ x: curX, y: curY });
      }

      if (visiblePoints.length >= 2) {
        // Area fill under the visible portion
        const gradient = ctx!.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        gradient.addColorStop(0, color + "40");
        gradient.addColorStop(1, color + "05");
        ctx!.beginPath();
        visiblePoints.forEach((p, i) => {
          i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        });
        ctx!.lineTo(visiblePoints[visiblePoints.length - 1].x, pad.top + chartH);
        ctx!.lineTo(visiblePoints[0].x, pad.top + chartH);
        ctx!.closePath();
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Line
        ctx!.beginPath();
        ctx!.strokeStyle = color;
        ctx!.lineWidth = 2.5;
        ctx!.lineJoin = "round";
        ctx!.lineCap = "round";
        visiblePoints.forEach((p, i) => {
          i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        });
        ctx!.stroke();
      } else if (visiblePoints.length === 1) {
        // Single point — just draw the dot below
      }

      // Dots only for vertices fully reached
      points.forEach((p, i) => {
        if (i <= upToIndex && (i < upToIndex || segT >= 0.999 || progress >= 1) ) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx!.fillStyle = "#0a0a0f";
          ctx!.fill();
        }
      });
      // Leading dot at the animated tip while still animating
      if (progress < 1) {
        ctx!.beginPath();
        ctx!.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(curX, curY, 2, 0, Math.PI * 2);
        ctx!.fillStyle = "#0a0a0f";
        ctx!.fill();
      }

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
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

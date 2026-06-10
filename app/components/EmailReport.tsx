"use client";
import { useState } from "react";

interface Props {
  reportHtml: string;
  startupName: string;
}

export default function EmailReport({ reportHtml, startupName }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  async function sendEmail() {
    if (!email.trim() || !email.includes("@")) { setErrMsg("Enter a valid email"); return; }
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportHtml, startupName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setErrMsg(String(e).replace("Error: ", ""));
    }
  }

  function downloadHTML() {
    const blob = new Blob([reportHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${startupName.replace(/\s+/g, "_")}_report.html`;
    a.click();
  }

  function downloadPDF() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(reportHtml);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  return (
    <div style={{ marginTop: 4 }}>
      {/* Action buttons row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={downloadHTML} style={{ padding: "7px 14px", fontSize: 12, background: "var(--surface-2)", border: "0.5px solid var(--border-md)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          📄 Download HTML
        </button>
        <button onClick={downloadPDF} style={{ padding: "7px 14px", fontSize: 12, background: "var(--surface-2)", border: "0.5px solid var(--border-md)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          🖨️ Save as PDF
        </button>
        <button onClick={() => { setShowPanel(!showPanel); setStatus("idle"); }} style={{ padding: "7px 14px", fontSize: 12, background: showPanel ? "#4ade8020" : "var(--surface-2)", border: `0.5px solid ${showPanel ? "#4ade8040" : "var(--border-md)"}`, borderRadius: 8, color: showPanel ? "#4ade80" : "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          📧 Email report
        </button>
      </div>

      {/* Email panel */}
      {showPanel && (
        <div style={{ marginTop: 10, padding: "14px 16px", background: "var(--surface-2)", borderRadius: 10, border: "0.5px solid var(--border)" }}>
          {status === "sent" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4ade80" }}>
              ✅ Report sent to {email} successfully!
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Send full HTML report to email</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendEmail()}
                  placeholder="your@email.com"
                  style={{ flex: 1, padding: "8px 12px", fontSize: 13, background: "var(--surface)", border: "0.5px solid var(--border-md)", borderRadius: 8, color: "var(--foreground)", outline: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#4ade8060"}
                  onBlur={e => e.target.style.borderColor = "var(--border-md)"}
                />
                <button onClick={sendEmail} disabled={status === "sending"} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "#4ade80", color: "#0a0a0f", border: "none", borderRadius: 8, cursor: "pointer", opacity: status === "sending" ? 0.6 : 1 }}>
                  {status === "sending" ? "Sending…" : "Send"}
                </button>
              </div>
              {errMsg && <div style={{ marginTop: 6, fontSize: 11, color: "#ef4444" }}>⚠️ {errMsg}</div>}
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                Requires N8N_WEBHOOK_URL or RESEND_API_KEY in Vercel env vars
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

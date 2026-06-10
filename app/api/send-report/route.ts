import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, reportHtml, startupName } = await req.json();
    if (!email || !reportHtml) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Use n8n webhook to send email if configured
    const n8nUrl = process.env.N8N_EMAIL_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email_report", email, reportHtml, startupName, timestamp: new Date().toISOString() }),
      });
      if (res.ok) return NextResponse.json({ success: true, method: "n8n" });
    }

    // Fallback: Resend API if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "AI Startup Analyst <reports@resend.dev>",
          to: [email],
          subject: `📊 Startup Analysis Report: ${startupName}`,
          html: reportHtml,
        }),
      });
      if (res.ok) return NextResponse.json({ success: true, method: "resend" });
    }

    return NextResponse.json({ error: "No email provider configured. Add N8N_WEBHOOK_URL or RESEND_API_KEY to Vercel env vars." }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

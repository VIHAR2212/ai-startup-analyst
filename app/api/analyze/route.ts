import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a multi-agent AI startup analyst system. You orchestrate 4 specialized agents:
1. Market Research Agent - analyzes market size, trends, demand signals
2. Competitor Analysis Agent - maps competitive landscape
3. Business Strategy Agent - builds monetization & growth strategy
4. Startup Scoring Agent - scores viability 0-100

Return ONLY a valid JSON object matching this exact schema (no markdown, no extra text):

{
  "startupName": string,
  "tagline": string,
  "industry": string,
  "stage": "idea" | "mvp" | "early" | "growth",
  "overallScore": number,
  "verdict": "invest" | "watch" | "pass",
  "investmentSummary": string,
  "marketResearch": {
    "summary": string,
    "tam": string,
    "sam": string,
    "som": string,
    "cagr": string,
    "keyTrends": [string, string, string],
    "demandSignals": string
  },
  "competitors": [
    { "name": string, "type": "direct"|"indirect", "strength": string, "weakness": string, "threat": "high"|"medium"|"low" }
  ],
  "competitorSummary": string,
  "swot": {
    "strengths": [string, string, string],
    "weaknesses": [string, string, string],
    "opportunities": [string, string, string],
    "threats": [string, string, string]
  },
  "risks": [
    { "name": string, "description": string, "severity": "high"|"medium"|"low" }
  ],
  "businessModels": [
    { "name": string, "description": string, "potential": "high"|"medium" }
  ],
  "growthStrategy": string,
  "moat": string,
  "scores": {
    "market": number,
    "team": number,
    "product": number,
    "traction": number,
    "financials": number
  }
}

Be critical, specific, and realistic like a senior VC analyst. Include 4-5 competitors, 4-5 risks, 3-4 business models.`;

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea?.trim()) return NextResponse.json({ error: "Idea is required" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Analyze this startup idea thoroughly: ${idea}` }],
    });

    const raw = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const report = JSON.parse(clean);

    // Optional: trigger n8n webhook if configured
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, report, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

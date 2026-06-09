import { NextRequest, NextResponse } from "next/server";

// ── Lazy client getters (safe at build time) ──────────────────────────────────
function getAnthropic() {
  const Anthropic = require("@anthropic-ai/sdk");
  return new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
}
function getGemini() {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}
function getGroq() {
  const Groq = require("groq-sdk");
  return new Groq.default({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
}

// ── Fallback helper ───────────────────────────────────────────────────────────
async function callWithFallback(
  fns: Array<() => Promise<string>>,
  agentName: string
): Promise<string> {
  for (const fn of fns) {
    try {
      const result = await fn();
      if (result?.trim()) return result;
    } catch (e) {
      console.warn(`[${agentName}] provider failed, trying next…`, (e as Error).message);
    }
  }
  throw new Error(`All providers failed for ${agentName}`);
}

// ── Agent 1: Market Research → Groq primary, Claude fallback ─────────────────
async function marketResearchAgent(idea: string): Promise<string> {
  const prompt = `You are a senior market research analyst. Analyze this startup idea and return ONLY a JSON object (no markdown, no extra text):
Startup idea: "${idea}"
Return exactly:
{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string}`;

  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800, temperature: 0.4,
      });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
    },
  ], "MarketResearch");
}

// ── Agent 2: Competitor Analysis → Claude primary, Groq fallback ──────────────
async function competitorAnalysisAgent(idea: string): Promise<string> {
  const prompt = `You are a competitive intelligence expert. Return ONLY a JSON object (no markdown):
Startup idea: "${idea}"
Return exactly:
{"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string}
Include 4-5 real competitors.`;

  return callWithFallback([
    async () => {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000, temperature: 0.3,
      });
      return res.choices[0]?.message?.content || "";
    },
  ], "CompetitorAnalysis");
}

// ── Agent 3: Business Strategy → Gemini primary, Claude fallback ──────────────
async function businessStrategyAgent(idea: string): Promise<string> {
  const prompt = `You are a startup business strategist. Return ONLY a JSON object (no markdown):
Startup idea: "${idea}"
Return exactly:
{"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string}
Include 3-4 business models.`;

  return callWithFallback([
    async () => {
      const geminiClient = getGemini();
      const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    async () => {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200, temperature: 0.5,
      });
      return res.choices[0]?.message?.content || "";
    },
  ], "BusinessStrategy");
}

// ── Agent 4: Scoring + Risks → Groq primary, Gemini fallback, Claude fallback ─
async function scoringAgent(idea: string, ctx: string): Promise<string> {
  const prompt = `You are a VC analyst. Based on this research, return ONLY a JSON object (no markdown):
Idea: "${idea}"
Research context: ${ctx.slice(0, 800)}
Return exactly:
{"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number}}
Include 4-5 risks. Be realistic.`;

  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 900, temperature: 0.3,
      });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const geminiClient = getGemini();
      const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    async () => {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 900,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
    },
  ], "Scoring");
}

// ── Agent 5: Synthesizer → Claude ─────────────────────────────────────────────
async function synthesizerAgent(idea: string, parts: {
  market: string; competitors: string; strategy: string; scoring: string;
}): Promise<string> {
  const prompt = `You are a senior VC partner. Synthesize this multi-agent research into ONE final JSON report. Return ONLY valid JSON (no markdown, no extra text):
Idea: "${idea}"
MARKET: ${parts.market.slice(0,600)}
COMPETITORS: ${parts.competitors.slice(0,600)}
STRATEGY: ${parts.strategy.slice(0,600)}
SCORING: ${parts.scoring.slice(0,600)}

Return this exact schema:
{"startupName":string,"tagline":string,"industry":string,"stage":"idea"|"mvp"|"early"|"growth","overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"marketResearch":{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string},"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string,"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string,"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number},"agentsUsed":["Groq/Llama3.3","Claude/Haiku","Gemini/Flash","Groq/Llama3.3","Claude/Haiku"]}`;

  return callWithFallback([
    async () => {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
    },
    async () => {
      const geminiClient = getGemini();
      const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  ], "Synthesizer");
}

function parseJSON(raw: string): Record<string, unknown> {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in response");
  return JSON.parse(match[0]);
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea?.trim()) return NextResponse.json({ error: "Idea is required" }, { status: 400 });

    // Agents 1-3 run in parallel
    const [marketRaw, competitorRaw, strategyRaw] = await Promise.all([
      marketResearchAgent(idea),
      competitorAnalysisAgent(idea),
      businessStrategyAgent(idea),
    ]);

    // Agent 4 uses output of 1-3 as context
    const ctx = `${marketRaw} ${competitorRaw} ${strategyRaw}`;
    const scoringRaw = await scoringAgent(idea, ctx);

    // Agent 5 synthesizes everything
    const finalRaw = await synthesizerAgent(idea, {
      market: marketRaw, competitors: competitorRaw,
      strategy: strategyRaw, scoring: scoringRaw,
    });

    const report = parseJSON(finalRaw);

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, report, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Multi-agent error:", err);
    return NextResponse.json({ error: "Analysis failed", details: String(err) }, { status: 500 });
  }
}

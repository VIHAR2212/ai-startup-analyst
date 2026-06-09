import { NextRequest, NextResponse } from "next/server";

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

async function callClaude(prompt: string, maxTokens = 1200): Promise<string> {
  const anthropic = getAnthropic();
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return res.content.map((b: {type:string;text?:string}) => b.type === "text" ? b.text : "").join("");
}

async function callGroq(prompt: string, maxTokens = 1200): Promise<string> {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.4,
  });
  return res.choices[0]?.message?.content || "";
}

async function callGemini(prompt: string): Promise<string> {
  const geminiClient = getGemini();
  const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callWithFallback(
  fns: Array<() => Promise<string>>,
  agentName: string
): Promise<string> {
  const errors: string[] = [];
  for (const fn of fns) {
    try {
      const result = await fn();
      if (result?.trim()) return result;
    } catch (e) {
      errors.push((e as Error).message?.slice(0, 100));
      console.warn(`[${agentName}] provider failed:`, (e as Error).message?.slice(0, 100));
    }
  }
  throw new Error(`All providers failed for ${agentName}. Errors: ${errors.join(" | ")}`);
}

function extractJSON(raw: string): string {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");
  return match[0];
}

// Agent 1: Market Research — Groq → Claude
async function marketResearchAgent(idea: string): Promise<string> {
  const prompt = `You are a senior market research analyst. Analyze this startup idea. Return ONLY a JSON object, no markdown, no explanation:
Idea: "${idea}"
Schema: {"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string}`;

  return callWithFallback([
    () => callGroq(prompt, 800),
    () => callClaude(prompt, 800),
  ], "MarketResearch");
}

// Agent 2: Competitor Analysis — Claude → Groq
async function competitorAnalysisAgent(idea: string): Promise<string> {
  const prompt = `You are a competitive intelligence expert. Analyze competitors for this startup. Return ONLY a JSON object, no markdown:
Idea: "${idea}"
Schema: {"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string}
Include exactly 4 competitors.`;

  return callWithFallback([
    () => callClaude(prompt, 1000),
    () => callGroq(prompt, 1000),
  ], "CompetitorAnalysis");
}

// Agent 3: Business Strategy — Claude primary, Gemini secondary, Groq tertiary
async function businessStrategyAgent(idea: string): Promise<string> {
  const prompt = `You are a startup business strategist. Return ONLY a JSON object, no markdown, no explanation:
Idea: "${idea}"
Schema: {"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string}
Include exactly 3 business models.`;

  return callWithFallback([
    () => callClaude(prompt, 1200),
    () => callGemini(prompt),
    () => callGroq(prompt, 1200),
  ], "BusinessStrategy");
}

// Agent 4: Scoring — Groq → Claude → Gemini
async function scoringAgent(idea: string, ctx: string): Promise<string> {
  const prompt = `You are a VC analyst scoring a startup. Return ONLY a JSON object, no markdown:
Idea: "${idea}"
Context: ${ctx.slice(0, 600)}
Schema: {"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number}}
Include exactly 4 risks. All scores 0-100.`;

  return callWithFallback([
    () => callGroq(prompt, 900),
    () => callClaude(prompt, 900),
    () => callGemini(prompt),
  ], "Scoring");
}

// Agent 5: Synthesizer — Claude → Groq
async function synthesizerAgent(idea: string, parts: {
  market: string; competitors: string; strategy: string; scoring: string;
}): Promise<string> {
  const prompt = `You are a senior VC partner. Combine this research into one final report. Return ONLY valid JSON, no markdown, no explanation:
Idea: "${idea}"
MARKET DATA: ${parts.market.slice(0, 500)}
COMPETITOR DATA: ${parts.competitors.slice(0, 500)}
STRATEGY DATA: ${parts.strategy.slice(0, 500)}
SCORING DATA: ${parts.scoring.slice(0, 500)}

Return this exact schema:
{"startupName":string,"tagline":string,"industry":string,"stage":"idea"|"mvp"|"early"|"growth","overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"marketResearch":{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string},"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string,"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string,"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number},"agentsUsed":["Groq/Llama3.3","Claude/Haiku","Claude/Haiku","Groq/Llama3.3","Claude/Haiku"]}`;

  return callWithFallback([
    () => callClaude(prompt, 3000),
    () => callGroq(prompt, 3000),
  ], "Synthesizer");
}

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea?.trim()) return NextResponse.json({ error: "Idea is required" }, { status: 400 });

    // Agents 1-3 parallel
    const [marketRaw, competitorRaw, strategyRaw] = await Promise.all([
      marketResearchAgent(idea),
      competitorAnalysisAgent(idea),
      businessStrategyAgent(idea),
    ]);

    // Agent 4 uses context from 1-3
    const scoringRaw = await scoringAgent(idea, marketRaw + " " + strategyRaw);

    // Agent 5 synthesizes all
    const finalRaw = await synthesizerAgent(idea, {
      market: marketRaw,
      competitors: competitorRaw,
      strategy: strategyRaw,
      scoring: scoringRaw,
    });

    const jsonStr = extractJSON(finalRaw);
    const report = JSON.parse(jsonStr);

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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

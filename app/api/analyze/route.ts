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

async function callWithFallback(fns: Array<() => Promise<string>>, agentName: string): Promise<string> {
  for (const fn of fns) {
    try {
      const result = await fn();
      if (result?.trim()) return result;
    } catch (e) {
      console.warn(`[${agentName}] failed:`, (e as Error).message);
    }
  }
  throw new Error(`All providers failed for ${agentName}`);
}

async function marketResearchAgent(idea: string, capital: string): Promise<string> {
  const prompt = `You are a senior market research analyst. Analyze this startup idea and return ONLY a JSON object (no markdown):
Startup idea: "${idea}"
Available capital: "${capital}"
Return exactly:
{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string}`;
  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:800, temperature:0.4 });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:800, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
  ], "MarketResearch");
}

async function competitorAnalysisAgent(idea: string): Promise<string> {
  const prompt = `You are a competitive intelligence expert. Return ONLY a JSON object (no markdown):
Startup idea: "${idea}"
Return exactly:
{"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string}
Include 4-5 real competitors.`;
  return callWithFallback([
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:1000, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:1000, temperature:0.3 });
      return res.choices[0]?.message?.content || "";
    },
  ], "CompetitorAnalysis");
}

async function businessStrategyAgent(idea: string, capital: string): Promise<string> {
  const prompt = `You are a startup business strategist. Return ONLY a JSON object (no markdown):
Startup idea: "${idea}"
Available capital: "${capital}"
Return exactly:
{"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string}
Include 3-4 business models relevant to the available capital.`;
  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:1200, temperature:0.5 });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const geminiClient = getGemini();
      const model = geminiClient.getGenerativeModel({ model:"gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:1200, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
  ], "BusinessStrategy");
}

async function scoringAgent(idea: string, capital: string, ctx: string): Promise<string> {
  const prompt = `You are a VC analyst. Return ONLY a JSON object (no markdown):
Idea: "${idea}", Capital: "${capital}"
Context: ${ctx.slice(0,800)}
Return exactly:
{"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number}}
Include 4-5 risks.`;
  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:900, temperature:0.3 });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const geminiClient = getGemini();
      const model = geminiClient.getGenerativeModel({ model:"gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:900, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
  ], "Scoring");
}

async function bootstrapAdvisorAgent(idea: string, capital: string, score: number): Promise<string> {
  const prompt = `You are a startup advisor specializing in bootstrapping and lean startups. A founder wants to start this business:
Idea: "${idea}"
Available capital: "${capital}"
Viability score: ${score}/100

Give practical, actionable advice tailored to their financial situation. Return ONLY a JSON object (no markdown):
{
  "capitalTier": "low"|"medium"|"high",
  "capitalAssessment": string (1-2 sentences on whether capital is sufficient),
  "howToStart": [
    {"step": number, "title": string, "description": string, "cost": string, "timeline": string}
  ],
  "minimumViableSetup": string (what is the absolute minimum to launch),
  "firstMonthGoal": string,
  "bootstrapTips": [string, string, string],
  "fundingOptions": [{"name": string, "description": string, "amount": string}],
  "warningIfLowCapital": string or null
}
Include 5-6 steps in howToStart. Be very specific about costs in Indian Rupees (₹) if capital suggests India context.`;

  return callWithFallback([
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:1500, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:1500, temperature:0.4 });
      return res.choices[0]?.message?.content || "";
    },
  ], "BootstrapAdvisor");
}

async function synthesizerAgent(idea: string, capital: string, parts: {
  market: string; competitors: string; strategy: string; scoring: string; bootstrap: string;
}): Promise<string> {
  const prompt = `Synthesize multi-agent research into ONE final JSON report. Return ONLY valid JSON (no markdown):
Idea: "${idea}", Capital: "${capital}"
MARKET: ${parts.market.slice(0,500)}
COMPETITORS: ${parts.competitors.slice(0,500)}
STRATEGY: ${parts.strategy.slice(0,500)}
SCORING: ${parts.scoring.slice(0,500)}
BOOTSTRAP: ${parts.bootstrap.slice(0,500)}

Return this exact schema:
{"startupName":string,"tagline":string,"industry":string,"stage":"idea"|"mvp"|"early"|"growth","capitalRequired":string,"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"marketResearch":{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string},"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low"}],"competitorSummary":string,"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string,"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number},"bootstrap":{"capitalTier":"low"|"medium"|"high","capitalAssessment":string,"howToStart":[{"step":number,"title":string,"description":string,"cost":string,"timeline":string}],"minimumViableSetup":string,"firstMonthGoal":string,"bootstrapTips":[string,string,string],"fundingOptions":[{"name":string,"description":string,"amount":string}],"warningIfLowCapital":string|null},"agentsUsed":["Groq/Llama3.3","Claude/Haiku","Groq/Llama3.3","Groq/Llama3.3","Claude/Haiku","Claude/Haiku"]}`;

  return callWithFallback([
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:4000, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:4000, temperature:0.2 });
      return res.choices[0]?.message?.content || "";
    },
  ], "Synthesizer");
}

function parseJSON(raw: string): Record<string, unknown> {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const { idea, capital = "Not specified" } = await req.json();
    if (!idea?.trim()) return NextResponse.json({ error: "Idea is required" }, { status: 400 });

    const [marketRaw, competitorRaw, strategyRaw] = await Promise.all([
      marketResearchAgent(idea, capital),
      competitorAnalysisAgent(idea),
      businessStrategyAgent(idea, capital),
    ]);

    const ctx = `${marketRaw} ${competitorRaw} ${strategyRaw}`;
    const scoringRaw = await scoringAgent(idea, capital, ctx);

    let scoreParsed: any = {};
    try { scoreParsed = parseJSON(scoringRaw); } catch {}
    const score = scoreParsed.overallScore || 50;

    const bootstrapRaw = await bootstrapAdvisorAgent(idea, capital, score);

    const finalRaw = await synthesizerAgent(idea, capital, {
      market: marketRaw, competitors: competitorRaw,
      strategy: strategyRaw, scoring: scoringRaw, bootstrap: bootstrapRaw,
    });

    const report = parseJSON(finalRaw);

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, capital, report, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Multi-agent error:", err);
    return NextResponse.json({ error: "Analysis failed", details: String(err) }, { status: 500 });
  }
}

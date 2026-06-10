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

// ── Illegal business guard ────────────────────────────────────────────────────
async function checkLegality(idea: string, country: string): Promise<{ legal: boolean; reason: string }> {
  const prompt = `You are a legal compliance checker. Is this business idea legal in ${country}?
Idea: "${idea}"
Also flag if this involves: drugs, weapons, human trafficking, illegal gambling, counterfeit goods, money laundering, hacking services, or any activity explicitly banned in ${country}.
Return ONLY JSON: {"legal": boolean, "reason": string}
If legal, reason = "". If illegal, reason = brief explanation.`;
  try {
    const groq = getGroq();
    const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:200, temperature:0.1 });
    const raw = res.choices[0]?.message?.content || '{"legal":true,"reason":""}';
    const clean = raw.replace(/```json|```/g,"").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { legal: true, reason: "" };
  } catch { return { legal: true, reason: "" }; }
}

const ctxLine = (idea: string, capital: string, country: string, market: string) =>
  `Startup: "${idea}" | Capital: ${capital} | Country: ${country} | Market: ${market}`;

// ── Cultural context helper ────────────────────────────────────────────────────
const culturalContext = (country: string, market: string) => `
CULTURAL & MARKET INTELLIGENCE for ${country}:
- Deeply consider the dominant religion(s), culture, traditions, festivals, and buying behaviour of ${country}.
- Example: an agarbatti/incense business in India targets Hindu households (80% of population) — mention this specific addressable audience, not the whole population.
- For food businesses: consider halal, vegetarian, vegan, kosher requirements based on ${country}'s demographics.
- For fashion: consider local dress codes, modesty norms, climate.
- For fintech: consider local payment methods (UPI/Razorpay for India, M-Pesa for Kenya, Alipay for China, etc.)
- For e-commerce: mention dominant local platforms (Flipkart/Meesho for India, Jumia for Africa, etc.)
- Be realistic about the ACTUAL target demographic — not the entire country.
- ${market === "international" ? `Also note cultural differences when expanding from ${country} to other markets.` : ""}`;

async function marketResearchAgent(idea: string, capital: string, country: string, market: string): Promise<string> {
  const prompt = `You are a senior market research analyst. Return ONLY a JSON object (no markdown):
${ctxLine(idea, capital, country, market)}
${culturalContext(country, market)}
- TAM/SAM/SOM must reflect the ACTUAL culturally relevant audience, not total population.
- ${market === "domestic" ? `Focus only on ${country}.` : `Include global scope with ${country} as launch market.`}
- All monetary values in local currency of ${country}.
Return exactly:
{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string,"targetDemographic":string,"culturalInsight":string,"marketScope":string}`;

  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:1000, temperature:0.4 });
      return res.choices[0]?.message?.content || "";
    },
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:1000, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
  ], "MarketResearch");
}

async function competitorAnalysisAgent(idea: string, country: string, market: string): Promise<string> {
  const prompt = `You are a competitive intelligence expert. Return ONLY a JSON object (no markdown):
Startup: "${idea}" | Country: ${country} | Market: ${market}
${culturalContext(country, market)}
- Include competitors ${market==="domestic"?`operating in ${country}`:"globally"} and note their cultural/local fit.
Return exactly:
{"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low","country":string}],"competitorSummary":string}
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

async function businessStrategyAgent(idea: string, capital: string, country: string, market: string): Promise<string> {
  const prompt = `You are a startup business strategist. Return ONLY a JSON object (no markdown):
${ctxLine(idea, capital, country, market)}
${culturalContext(country, market)}
- All strategies must respect local culture, regulations, and buying behaviour.
- All cost estimates in local currency of ${country}.
- For international market: plan expansion phases starting from ${country}.
Return exactly:
{"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string,"localAdvantages":string,"culturalOpportunities":string}
Include 3-4 business models.`;

  return callWithFallback([
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:1400, temperature:0.5 });
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
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:1400, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
  ], "BusinessStrategy");
}

async function scoringAgent(idea: string, capital: string, country: string, market: string, context: string): Promise<string> {
  const prompt = `You are a VC analyst. Return ONLY a JSON object (no markdown):
${ctxLine(idea, capital, country, market)}
Context: ${context.slice(0,900)}
- Score based on ${country} market context and actual target demographic size.
Return exactly:
{"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number}}
Include 4-5 risks including cultural/demographic risks.`;

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

async function bootstrapAdvisorAgent(idea: string, capital: string, country: string, market: string, score: number): Promise<string> {
  const currencyMap: Record<string,string> = { "India":"₹","USA":"$","UK":"£","Germany":"€","France":"€","Australia":"A$","Canada":"C$","Singapore":"S$","UAE":"AED","Japan":"¥","Brazil":"R$","South Africa":"R" };
  const currency = Object.entries(currencyMap).find(([k])=>country.toLowerCase().includes(k.toLowerCase()))?.[1] || "$";

  const prompt = `You are a startup advisor for ${country}. Return ONLY a JSON object (no markdown):
${ctxLine(idea, capital, country, market)}
Viability score: ${score}/100, Currency: ${currency}
${culturalContext(country, market)}
- Reference real local platforms, regulations, grants, incubators in ${country}.
- India: Startup India, MSME loans, Razorpay, UPI, Digital India schemes.
- USA: SBA loans, Y Combinator, Product Hunt launch.
- UK: Innovate UK, Startup Visa.
- Mention any cultural/religious considerations for launch timing (festivals, holidays).
Return exactly:
{"capitalTier":"low"|"medium"|"high","capitalAssessment":string,"currency":"${currency}","howToStart":[{"step":number,"title":string,"description":string,"cost":string,"timeline":string}],"minimumViableSetup":string,"firstMonthGoal":string,"bootstrapTips":[string,string,string],"fundingOptions":[{"name":string,"description":string,"amount":string}],"warningIfLowCapital":string|null,"localResources":[{"name":string,"description":string}],"culturalLaunchTips":string}
Include 5-6 steps, 3-4 funding options, 2-3 local resources.`;

  return callWithFallback([
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({ model:"claude-haiku-4-5-20251001", max_tokens:2000, messages:[{role:"user",content:prompt}] });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({ model:"llama-3.3-70b-versatile", messages:[{role:"user",content:prompt}], max_tokens:2000, temperature:0.4 });
      return res.choices[0]?.message?.content || "";
    },
  ], "BootstrapAdvisor");
}

async function synthesizerAgent(idea: string, capital: string, country: string, market: string, parts: {
  market: string; competitors: string; strategy: string; scoring: string; bootstrap: string;
}): Promise<string> {
  const prompt = `Synthesize research into ONE final JSON. Return ONLY valid JSON (no markdown):
${ctxLine(idea, capital, country, market)}
MARKET: ${parts.market.slice(0,420)}
COMPETITORS: ${parts.competitors.slice(0,420)}
STRATEGY: ${parts.strategy.slice(0,420)}
SCORING: ${parts.scoring.slice(0,420)}
BOOTSTRAP: ${parts.bootstrap.slice(0,420)}

Schema:
{"startupName":string,"tagline":string,"industry":string,"stage":"idea"|"mvp"|"early"|"growth","country":string,"marketType":"domestic"|"international","capitalRequired":string,"overallScore":number,"verdict":"invest"|"watch"|"pass","investmentSummary":string,"marketResearch":{"summary":string,"tam":string,"sam":string,"som":string,"cagr":string,"keyTrends":[string,string,string],"demandSignals":string,"targetDemographic":string,"culturalInsight":string,"marketScope":string},"competitors":[{"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low","country":string}],"competitorSummary":string,"swot":{"strengths":[string,string,string],"weaknesses":[string,string,string],"opportunities":[string,string,string],"threats":[string,string,string]},"localAdvantages":string,"culturalOpportunities":string,"risks":[{"name":string,"description":string,"severity":"high"|"medium"|"low"}],"businessModels":[{"name":string,"description":string,"potential":"high"|"medium"}],"growthStrategy":string,"moat":string,"scores":{"market":number,"team":number,"product":number,"traction":number,"financials":number},"bootstrap":{"capitalTier":"low"|"medium"|"high","capitalAssessment":string,"currency":string,"howToStart":[{"step":number,"title":string,"description":string,"cost":string,"timeline":string}],"minimumViableSetup":string,"firstMonthGoal":string,"bootstrapTips":[string,string,string],"fundingOptions":[{"name":string,"description":string,"amount":string}],"warningIfLowCapital":string|null,"localResources":[{"name":string,"description":string}],"culturalLaunchTips":string},"agentsUsed":["Groq","Claude","Groq","Groq","Claude","Claude"]}`;

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
  const clean = raw.replace(/```json|```/g,"").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const { idea, capital="Not specified", country="India", market="domestic" } = await req.json();
    if (!idea?.trim()) return NextResponse.json({ error:"Idea is required" }, { status:400 });

    // ── Legality check first ──────────────────────────────────────────────────
    const legalCheck = await checkLegality(idea, country);
    if (!legalCheck.legal) {
      return NextResponse.json({
        error: `This business idea cannot be analyzed.`,
        details: `This idea appears to involve illegal activities in ${country}: ${legalCheck.reason}. Please enter a legal business idea.`,
        illegal: true,
      }, { status: 400 });
    }

    // ── Run agents 1-3 in parallel ────────────────────────────────────────────
    const [marketRaw, competitorRaw, strategyRaw] = await Promise.all([
      marketResearchAgent(idea, capital, country, market),
      competitorAnalysisAgent(idea, country, market),
      businessStrategyAgent(idea, capital, country, market),
    ]);

    const ctxStr = `${marketRaw} ${competitorRaw} ${strategyRaw}`;
    const scoringRaw = await scoringAgent(idea, capital, country, market, ctxStr);

    let scoreParsed: any = {};
    try { scoreParsed = parseJSON(scoringRaw); } catch {}
    const score = scoreParsed.overallScore || 50;

    const bootstrapRaw = await bootstrapAdvisorAgent(idea, capital, country, market, score);

    const finalRaw = await synthesizerAgent(idea, capital, country, market, {
      market: marketRaw, competitors: competitorRaw,
      strategy: strategyRaw, scoring: scoringRaw, bootstrap: bootstrapRaw,
    });

    const report = parseJSON(finalRaw);

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ idea, capital, country, market, report, timestamp: new Date().toISOString() }),
      }).catch(()=>{});
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Multi-agent error:", err);
    return NextResponse.json({ error:"Analysis failed", details: String(err) }, { status:500 });
  }
}

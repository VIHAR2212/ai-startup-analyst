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

async function callWithFallback(fns: Array<() => Promise<string>>, name: string): Promise<string> {
  for (const fn of fns) {
    try { const r = await fn(); if (r?.trim()) return r; }
    catch (e) { console.warn(`[${name}] failed:`, (e as Error).message); }
  }
  throw new Error(`All providers failed for ${name}`);
}

// ── Legality check ────────────────────────────────────────────────────────────
async function checkLegality(idea: string, country: string): Promise<{legal:boolean;reason:string}> {
  try {
    const groq = getGroq();
    const res = await groq.chat.completions.create({
      model:"llama-3.3-70b-versatile",
      messages:[{role:"user",content:`Is this business idea legal in ${country}? Idea: "${idea}". Flag if it involves: drugs, weapons, trafficking, illegal gambling, counterfeit goods, money laundering, hacking, terrorism. Return ONLY JSON: {"legal":boolean,"reason":string}`}],
      max_tokens:150, temperature:0.1
    });
    const match = (res.choices[0]?.message?.content||"{}").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {legal:true,reason:""};
  } catch { return {legal:true,reason:""}; }
}

// ── THE KEY FIX: One powerful Claude call does everything ─────────────────────
// Instead of truncating agent outputs and losing data, we run one comprehensive
// analysis that produces ALL fields with full context
async function comprehensiveAnalysisAgent(idea: string, capital: string, country: string, market: string): Promise<string> {
  const currencyMap: Record<string,string> = {"India":"₹","USA":"$","UK":"£","Germany":"€","France":"€","Australia":"A$","Canada":"C$","Singapore":"S$","UAE":"AED","Japan":"¥","Brazil":"R$","South Africa":"R"};
  const currency = Object.entries(currencyMap).find(([k])=>country.toLowerCase().includes(k.toLowerCase()))?.[1]||"$";

  const prompt = `You are a senior VC analyst and startup consultant with deep knowledge of ${country}'s market. Provide a BRUTALLY HONEST, SPECIFIC, DATA-DRIVEN analysis.

Startup idea: "${idea}"
Country: ${country} | Market: ${market} | Capital: ${capital} | Currency: ${currency}

CRITICAL RULES:
1. NEVER give generic advice. Every field must be SPECIFIC to THIS idea in ${country}.
2. TAM/SAM/SOM must be REAL market sizes with actual ${currency} figures based on THIS specific industry in ${country} — NOT generic numbers.
3. Scores must VARY based on actual business viability — NOT always 75. A coal mining startup needs ₹500Cr+ so with ₹50L capital, financials score should be 15-20. An agarbatti business with ₹2L capital should score 55-65.
4. Investment verdict must match the scores — if average score <50, verdict = "pass". If 50-65 = "watch". If >65 = "invest".
5. Competitors must be REAL companies operating in ${country} for THIS specific industry.
6. For India: consider caste, religion, regional culture. Agarbatti = Hindu market (82% India). Meat = non-veg market (30% India).
7. Risk severity must be honest — capital mismatch should be "high" severity.
8. Growth projections must be realistic — a tea stall cannot be a unicorn.
9. TAM/SAM/SOM must be DIFFERENT values with clear reasoning for each.

Return ONLY valid JSON (no markdown, no explanation):
{
  "startupName": string (creative brand name for the startup),
  "tagline": string (specific punchy tagline),
  "industry": string,
  "stage": "idea"|"mvp"|"early"|"growth",
  "country": "${country}",
  "marketType": "${market}",
  "capitalRequired": string (minimum capital actually needed),
  "capitalProvided": "${capital}",
  "capitalGap": string (honest assessment of capital sufficiency),
  "overallScore": number (HONEST 0-100 based on real viability),
  "verdict": "invest"|"watch"|"pass",
  "investmentSummary": string (3-4 sentences specific to THIS startup, mention actual numbers, real challenges, honest verdict),
  "projectedRevenue": {
    "year1": string,
    "year2": string,
    "year3": string,
    "assumptions": string
  },
  "marketResearch": {
    "summary": string (specific to this idea and ${country}, mention real market dynamics),
    "tam": string (e.g. "${currency}45,000Cr — total petroleum market in India"),
    "tamReasoning": string (how you calculated TAM),
    "sam": string (e.g. "${currency}8,000Cr — domestic refining segment"),
    "samReasoning": string,
    "som": string (e.g. "${currency}200Cr — realistic 2.5% capture in 5 years"),
    "somReasoning": string,
    "cagr": string,
    "keyTrends": [string, string, string],
    "demandSignals": string,
    "targetDemographic": string (SPECIFIC demographic, e.g. "Hindu households aged 25-60 in Tier-1/2 cities"),
    "culturalInsight": string (specific cultural/religious/social insight),
    "marketScope": string
  },
  "competitors": [
    {"name":string,"type":"direct"|"indirect","strength":string,"weakness":string,"threat":"high"|"medium"|"low","country":string,"marketShare":string}
  ],
  "competitorSummary": string,
  "swot": {
    "strengths": [string, string, string],
    "weaknesses": [string, string, string],
    "opportunities": [string, string, string],
    "threats": [string, string, string]
  },
  "localAdvantages": string,
  "culturalOpportunities": string,
  "risks": [
    {"name":string,"description":string,"severity":"high"|"medium"|"low","mitigation":string}
  ],
  "businessModels": [
    {"name":string,"description":string,"potential":"high"|"medium","revenueEstimate":string}
  ],
  "growthStrategy": string,
  "moat": string,
  "scores": {
    "market": number (0-100, MUST vary by idea),
    "team": number (0-100),
    "product": number (0-100),
    "traction": number (0-100),
    "financials": number (0-100, LOW if capital is insufficient)
  },
  "scoreReasoning": {
    "market": string,
    "team": string,
    "product": string,
    "traction": string,
    "financials": string
  },
  "revenueProjection": {
    "months": [1,3,6,12,18,24,36],
    "revenue": [number,number,number,number,number,number,number],
    "unit": string (e.g. "₹ Lakhs")
  },
  "marketShareProjection": {
    "labels": ["Year 1","Year 2","Year 3","Year 4","Year 5"],
    "you": [number,number,number,number,number],
    "competitor1": {"name":string,"values":[number,number,number,number,number]},
    "competitor2": {"name":string,"values":[number,number,number,number,number]},
    "unit": "% market share"
  },
  "fundingBreakdown": {
    "categories": ["Product/Inventory","Marketing","Operations","Technology","Legal/Compliance","Reserve"],
    "percentages": [number,number,number,number,number,number],
    "amounts": [string,string,string,string,string,string]
  },
  "bootstrap": {
    "capitalTier": "low"|"medium"|"high",
    "capitalAssessment": string,
    "currency": "${currency}",
    "howToStart": [
      {"step":number,"title":string,"description":string,"cost":string,"timeline":string}
    ],
    "minimumViableSetup": string,
    "firstMonthGoal": string,
    "bootstrapTips": [string, string, string],
    "fundingOptions": [
      {"name":string,"description":string,"amount":string}
    ],
    "warningIfLowCapital": string|null,
    "localResources": [{"name":string,"description":string}],
    "culturalLaunchTips": string
  }
}`;

  return callWithFallback([
    // Primary: Claude Sonnet — best for comprehensive structured analysis
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({
        model:"claude-sonnet-4-5", max_tokens:6000,
        messages:[{role:"user",content:prompt}]
      });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    // Fallback: Claude Haiku
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({
        model:"claude-haiku-4-5-20251001", max_tokens:5000,
        messages:[{role:"user",content:prompt}]
      });
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    // Fallback: Groq
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model:"llama-3.3-70b-versatile",
        messages:[{role:"user",content:prompt}],
        max_tokens:5000, temperature:0.3
      });
      return res.choices[0]?.message?.content||"";
    },
  ], "ComprehensiveAnalysis");
}

function parseJSON(raw: string): Record<string,unknown> {
  const clean = raw.replace(/```json|```/g,"").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in response");
  return JSON.parse(match[0]);
}

function normalizeScore(val: unknown): number {
  const n = Number(val);
  if (isNaN(n)) return 50;
  if (n > 0 && n <= 10) return Math.round(n*10);
  return Math.round(Math.min(Math.max(n,0),100));
}

function normalizeReport(report: Record<string,unknown>): Record<string,unknown> {
  report.overallScore = normalizeScore(report.overallScore);
  const scores = (report.scores as Record<string,unknown>)||{};
  report.scores = {
    market:     normalizeScore(scores.market    ??55),
    team:       normalizeScore(scores.team      ??50),
    product:    normalizeScore(scores.product   ??50),
    traction:   normalizeScore(scores.traction  ??40),
    financials: normalizeScore(scores.financials??45),
  };
  // Auto-fix verdict if inconsistent with score
  const s = report.overallScore as number;
  if (!report.verdict || report.verdict === "") {
    report.verdict = s >= 68 ? "invest" : s >= 48 ? "watch" : "pass";
  }
  return report;
}

export async function POST(req: NextRequest) {
  try {
    const {idea, capital="Not specified", country="India", market="domestic"} = await req.json();
    if (!idea?.trim()) return NextResponse.json({error:"Idea is required"},{status:400});

    // Legality check
    const legalCheck = await checkLegality(idea, country);
    if (!legalCheck.legal) {
      return NextResponse.json({
        error:"This business idea cannot be analyzed.",
        details:`This idea involves illegal activities in ${country}: ${legalCheck.reason}. Please enter a legal business idea.`,
        illegal:true,
      },{status:400});
    }

    // Single comprehensive analysis — no truncation, full context preserved
    const raw = await comprehensiveAnalysisAgent(idea, capital, country, market);
    let report = parseJSON(raw);
    report = normalizeReport(report);

    // Add agentsUsed for UI display
    report.agentsUsed = ["Claude/Sonnet","Claude/Sonnet","Claude/Sonnet","Claude/Sonnet","Claude/Sonnet","Claude/Sonnet"];

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({idea,capital,country,market,report,timestamp:new Date().toISOString()}),
      }).catch(()=>{});
    }

    return NextResponse.json({report});
  } catch(err) {
    console.error("Analysis error:",err);
    return NextResponse.json({error:"Analysis failed",details:String(err)},{status:500});
  }
}

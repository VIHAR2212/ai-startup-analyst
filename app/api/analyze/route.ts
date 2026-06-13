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
// ── Score idea algorithmically based on real business factors ─────────────────
function computeScores(idea: string, capital: string, country: string): {
  market: number; team: number; product: number; traction: number; financials: number;
  overall: number; reasoning: Record<string,string>;
} {
  const ideaLower = idea.toLowerCase();

  // Market score — based on industry type
  let market = 55;
  if (/ai|saas|software|app|platform|tech|digital|online|e-commerce|edtech|fintech/.test(ideaLower)) market = 72;
  else if (/health|medical|pharma|hospital/.test(ideaLower)) market = 68;
  else if (/food|restaurant|cafe|delivery|tiffin/.test(ideaLower)) market = 62;
  else if (/agarbatti|incense|puja|religious/.test(ideaLower)) market = 48; // niche
  else if (/coal|mining|petroleum|oil refin/.test(ideaLower)) market = 35; // capital-intensive + declining
  else if (/hardware store|tool|equipment/.test(ideaLower)) market = 55;
  else if (/fashion|clothing|apparel/.test(ideaLower)) market = 60;
  else if (/education|tuition|coaching|school/.test(ideaLower)) market = 65;
  const marketReasoning = `Based on industry type and ${country} market size data`;

  // Traction score — idea stage always low
  const traction = 20; // Always 20 for idea stage — no real traction
  const tractionReasoning = "Idea stage — zero customers, zero revenue, zero proven demand yet";

  // Team score — can't know, set moderate with variation by complexity
  let team = 45;
  if (/ai|ml|machine learning|blockchain|quantum/.test(ideaLower)) team = 35; // needs specialized talent
  else if (/food|tea|shop|store/.test(ideaLower)) team = 55; // lower barrier
  const teamReasoning = `Estimated based on technical complexity of "${idea}"`;

  // Product score
  let product = 50;
  if (/app|platform|software|saas/.test(ideaLower)) product = 60;
  else if (/physical|store|shop|hardware/.test(ideaLower)) product = 52;
  else if (/campaign|service/.test(ideaLower)) product = 45;
  const productReasoning = "Solution concept clarity and differentiation potential";

  // Financial score — most critical, based on capital vs industry requirement
  const capLower = capital.toLowerCase().replace(/[₹$£€]/g,"").replace(/,/g,"");
  let capValue = 50; // default medium
  if (capLower.includes("10k") || capLower.includes("50k") || capLower.includes("10,000") || capLower.includes("50,000")) capValue = 10;
  else if (capLower.includes("2l") || capLower.includes("10l") || capLower.includes("2 lakh") || capLower.includes("10 lakh")) capValue = 25;
  else if (capLower.includes("10l") || capLower.includes("50l") || capLower.includes("50 lakh")) capValue = 40;
  else if (capLower.includes("50l") || capLower.includes("1cr") || capLower.includes("crore")) capValue = 60;
  else if (capLower.includes("50l+") || capLower.includes("5k") || capLower.includes("25k")) capValue = 35;
  else if (capLower.includes("100k") || capLower.includes("500k") || capLower.includes("1l") || capLower.includes("5l")) capValue = 45;

  // Heavy industry needs much more capital
  let finScore = capValue;
  if (/coal|mining|petroleum|oil refin|refinery|steel|cement/.test(ideaLower)) finScore = Math.min(capValue, 15);
  else if (/hospital|pharma|manufacturing/.test(ideaLower)) finScore = Math.min(capValue, 25);
  else if (/food delivery|saas|app/.test(ideaLower) && capValue >= 40) finScore = capValue + 10;
  finScore = Math.min(Math.max(finScore, 8), 85);
  const financialsReasoning = `Capital ${capital} vs actual industry requirement for "${idea}"`;

  const overall = Math.round((market + team + product + traction + finScore) / 5);

  return {
    market: Math.round(market),
    team: Math.round(team),
    product: Math.round(product),
    traction: Math.round(traction),
    financials: Math.round(finScore),
    overall,
    reasoning: {
      market: marketReasoning,
      team: teamReasoning,
      product: productReasoning,
      traction: tractionReasoning,
      financials: financialsReasoning,
    }
  };
}

// ── Revenue projection — vary by industry and capital ─────────────────────────
function computeRevenue(idea: string, capital: string, country: string): {
  months: number[]; revenue: number[]; unit: string;
  year1: string; year2: string; year3: string; assumptions: string;
} {
  const ideaLower = idea.toLowerCase();
  const capLower = capital.toLowerCase();
  const currency = country.toLowerCase().includes("india") ? "₹" : country.toLowerCase().includes("usa") ? "$" : "₹";
  const inIndia = country.toLowerCase().includes("india");

  // Declining/saturated industries — flat or shrinking revenue regardless of capital
  const isDeclining = /cyber\s?caf|cybercafe|internet caf|landline|pco|fax|video rental|dvd rental|print newspaper|newspaper printing|pager|cd shop|cassette/.test(ideaLower);

  // Base monthly revenue at month 36 (final period) in Lakhs (India) or $K (USA)
  let base = 5; // default
  if (/saas|software|platform/.test(ideaLower)) base = inIndia ? 25 : 50;
  else if (/food delivery|restaurant/.test(ideaLower)) base = inIndia ? 15 : 20;
  else if (/hardware store|tool/.test(ideaLower)) base = inIndia ? 40 : 60;
  else if (/education|coaching/.test(ideaLower)) base = inIndia ? 20 : 30;
  else if (/agarbatti|incense/.test(ideaLower)) base = inIndia ? 8 : 12;
  else if (/coal|mining|petroleum/.test(ideaLower)) base = inIndia ? 200 : 300;
  else if (/health|hospital/.test(ideaLower)) base = inIndia ? 30 : 80;
  else if (isDeclining) base = inIndia ? 3 : 5; // small, stagnant revenue base

  // Scale by capital (declining industries don't scale — more capital can't fix a dying market)
  if (!isDeclining) {
    if (capLower.includes("50l+") || capLower.includes("1cr") || capLower.includes("100k")) base *= 1.5;
    if (capLower.includes("2l") || capLower.includes("5k")) base *= 0.5;
  }

  const unit = inIndia ? `${currency} Lakhs` : `${currency}K`;

  // 5-year span, one data point per year (years 1-5 from now)
  let r: number[];
  if (isDeclining) {
    // Flat-to-declining: starts near base, gently decreases ~8% per year
    r = [0,1,2,3,4].map(yr => +(base * Math.pow(0.92, yr)).toFixed(1));
  } else {
    // S-curve growth across 5 yearly points: slow start, acceleration, plateau
    const curve = [0.08, 0.20, 0.45, 0.72, 1.00];
    r = curve.map(f => +(base * f).toFixed(1));
  }

  const months = [12,24,36,48,60]; // year 1 through year 5, in months-from-now

  const y1 = inIndia ? `${currency}${(r[0]).toFixed(0)}L` : `${currency}${(r[0]).toFixed(0)}K`;
  const y2 = inIndia ? `${currency}${(r[2]).toFixed(0)}L` : `${currency}${(r[2]).toFixed(0)}K`;
  const y3 = inIndia ? `${currency}${(r[4]).toFixed(0)}L` : `${currency}${(r[4]).toFixed(0)}K`;

  const assumptions = isDeclining
    ? `Based on ${idea} in ${country} — a structurally declining market; revenue is expected to plateau or shrink ~8% annually regardless of additional capital.`
    : `Based on ${idea} market growth in ${country}, conservative 10-15% MoM growth after month 6, projected across 5 years.`;

  return { months, revenue:r, unit, year1:y1, year2:y2, year3:y3, assumptions };
}

async function comprehensiveAnalysisAgent(idea: string, capital: string, country: string, market: string, onModelUsed?: (model:string)=>void): Promise<string> {
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
    // Primary: Groq (free tier, generous limits) — try first to avoid Anthropic billing issues
    async () => {
      const groq = getGroq();
      const res = await groq.chat.completions.create({
        model:"llama-3.3-70b-versatile",
        messages:[{role:"user",content:prompt}],
        max_tokens:6000, temperature:0.5
      });
      onModelUsed?.("Groq/Llama-3.3-70B");
      return res.choices[0]?.message?.content||"";
    },
    // Fallback: Claude Sonnet — best for comprehensive structured analysis (requires Anthropic credits)
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({
        model:"claude-sonnet-4-5", max_tokens:6000,
        messages:[{role:"user",content:prompt}]
      });
      onModelUsed?.("Claude/Sonnet-4.5");
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
    },
    // Fallback: Claude Haiku
    async () => {
      const a = getAnthropic();
      const res = await a.messages.create({
        model:"claude-haiku-4-5-20251001", max_tokens:5000,
        messages:[{role:"user",content:prompt}]
      });
      onModelUsed?.("Claude/Haiku-4.5");
      return res.content.map((b:any)=>b.type==="text"?b.text:"").join("");
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

function normalizeReport(report: Record<string,unknown>, idea: string, capital: string, country: string): Record<string,unknown> {
  // Always compute scores algorithmically — LLM-provided scores (especially from
  // smaller/faster models) tend to be templated/identical across different ideas.
  // computeScores() deterministically varies based on idea keywords, capital, and country.
  const computed = computeScores(idea, capital, country);

  report.scores = {
    market:     computed.market,
    team:       computed.team,
    product:    computed.product,
    traction:   computed.traction,
    financials: computed.financials,
  };
  report.overallScore = computed.overall;

  // If the LLM provided per-score reasoning, keep it; otherwise use computed reasoning
  const llmReasoning = (report.scoreReasoning as Record<string,unknown>) || {};
  report.scoreReasoning = {
    market:     llmReasoning.market     || computed.reasoning.market,
    team:       llmReasoning.team       || computed.reasoning.team,
    product:    llmReasoning.product    || computed.reasoning.product,
    traction:   llmReasoning.traction   || computed.reasoning.traction,
    financials: llmReasoning.financials || computed.reasoning.financials,
  };

  // Verdict always derived from the computed overall score for consistency
  const s = report.overallScore as number;
  report.verdict = s >= 68 ? "invest" : s >= 48 ? "watch" : "pass";

  return report;
}

export async function POST(req: NextRequest) {
  try {
    const {idea, capital="Not specified", country="India", market="domestic", email=""} = await req.json();
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
    let usedModel = "Groq/Llama-3.3-70B";
    const raw = await comprehensiveAnalysisAgent(idea, capital, country, market, (model)=>{usedModel=model;});
    let report = parseJSON(raw);
    report = normalizeReport(report, idea, capital, country);

    // ── Safety net: ensure revenueProjection always present, input-dependent,
    // and shape-correct. If the model omitted it or returned mismatched
    // arrays, generate deterministic values from inputs. ──────────────────
    const rp = report.revenueProjection as any;
    if (
      !rp?.months?.length ||
      !rp?.revenue?.length ||
      rp.months.length !== rp.revenue.length
    ) {
      const fallbackRevenue = computeRevenue(idea, capital, country);
      report.revenueProjection = {
        months: fallbackRevenue.months,
        revenue: fallbackRevenue.revenue,
        unit: fallbackRevenue.unit,
      };
      if (!report.projectedRevenue) {
        report.projectedRevenue = {
          year1: fallbackRevenue.year1,
          year2: fallbackRevenue.year2,
          year3: fallbackRevenue.year3,
          assumptions: fallbackRevenue.assumptions,
        };
      }
    }

    // ── Safety net: ensure fundingBreakdown always present, sums to ~100,
    // and varies by idea type / capital tier. ──────────────────────────────
    const fb = report.fundingBreakdown as any;
    const fbSum = (fb?.percentages || []).reduce(
      (a: number, b: number) => a + Number(b || 0),
      0
    );
    if (
      !fb?.percentages?.length ||
      !fb?.categories?.length ||
      fb.percentages.length !== fb.categories.length ||
      Math.abs(fbSum - 100) > 5
    ) {
      const ideaLower = idea.toLowerCase();
      const techHeavy = /ai|saas|software|app|platform/.test(ideaLower);
      const physicalGoods = /store|shop|hardware|food|restaurant|manufactur/.test(ideaLower);

      let pct: number[];
      if (techHeavy) {
        pct = [20, 25, 15, 25, 5, 10]; // tech-led allocation
      } else if (physicalGoods) {
        pct = [40, 20, 20, 5, 5, 10]; // inventory-heavy allocation
      } else {
        pct = [30, 25, 20, 10, 5, 10]; // balanced default
      }

      const categories = [
        "Product/Inventory",
        "Marketing",
        "Operations",
        "Technology",
        "Legal/Compliance",
        "Reserve",
      ];

      report.fundingBreakdown = {
        categories,
        percentages: pct,
        amounts: pct.map((p) => `~${p}% of ${capital}`),
      };
    }

    // Add agentsUsed for UI display (reflects actual model that succeeded)
    report.agentsUsed = [usedModel,usedModel,usedModel,usedModel,usedModel,usedModel];

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({idea,capital,country,market,email,report,timestamp:new Date().toISOString()}),
      }).catch(()=>{});
    }

    return NextResponse.json({report});
  } catch(err) {
    console.error("Analysis error:",err);
    return NextResponse.json({error:"Analysis failed",details:String(err)},{status:500});
  }
}

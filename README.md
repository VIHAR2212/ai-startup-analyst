# 🧠 AI Startup Intelligence Analyst

A multi-agent VC-grade startup analysis platform powered by Claude AI. Input any startup idea and get a complete investment-quality report in seconds.

## ✨ Features

- **4 Specialized AI Agents** — Market Research, Competitor Analysis, Business Strategy, Scoring
- **Full VC Report** — TAM/SAM/SOM, competitor landscape, SWOT, risk analysis, business models
- **Viability Score** — 0–100 score with visual gauge
- **Investment Verdict** — Invest / Watch / Pass with rationale
- **Session History** — All analyses saved locally
- **Export** — PDF & JSON export
- **n8n Ready** — Optional webhook for post-analysis automation

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/ai-startup-analyst.git
cd ai-startup-analyst
npm install
```

### 2. Set environment variables
```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

Get your API key at: https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## 🌐 Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# When prompted, add environment variable: ANTHROPIC_API_KEY
```

### Option B — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Click Deploy

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key |
| `N8N_WEBHOOK_URL` | ❌ Optional | n8n webhook for post-analysis automation |

## 🔄 n8n Integration (Optional)

When `N8N_WEBHOOK_URL` is set, every completed analysis fires a POST to your n8n webhook with:
```json
{
  "idea": "Your startup idea",
  "report": { /* full analysis JSON */ },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

**Example n8n workflows you can build:**
- 📧 Email report summary to yourself
- 📋 Log to Notion database
- 💬 Slack notification with score & verdict
- 📊 Google Sheets tracker

## 🏗️ Architecture

```
app/
├── api/analyze/route.ts   # Multi-agent Claude API orchestration
├── components/
│   ├── AgentPanel.tsx     # Live agent status sidebar
│   ├── ReportView.tsx     # Full report renderer
│   └── ScoreGauge.tsx     # Animated score arc
├── globals.css            # Dark glassmorphism design system
├── layout.tsx
└── page.tsx               # Main dashboard
```

## 📦 Tech Stack

- **Frontend** — Next.js 14 App Router, TypeScript
- **AI** — Anthropic Claude claude-sonnet-4-20250514 (multi-agent via structured prompts)
- **Styling** — Tailwind CSS + custom design system
- **Deployment** — Vercel (bom1 region — Mumbai)

## 📄 License

MIT

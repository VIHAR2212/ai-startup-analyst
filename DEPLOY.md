# Deployment Guide

## Step 1 — Push to GitHub

```bash
cd ai-startup-analyst
git init
git add .
git commit -m "feat: initial AI Startup Intelligence Analyst"
git branch -M main
git remote add origin https://github.com/VIHAR2212/ai-startup-analyst.git
git push -u origin main
```

## Step 2 — Deploy on Vercel

### via CLI (fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```
When prompted:
- Link to existing project? → N
- Project name → ai-startup-analyst
- Which directory? → ./
- Override settings? → N

Then set the secret:
```bash
vercel env add ANTHROPIC_API_KEY production
# Paste your key when prompted
vercel --prod
```

### via Dashboard
1. vercel.com/new → Import Git Repository
2. Select VIHAR2212/ai-startup-analyst
3. Framework: Next.js (auto-detected)
4. Environment Variables → Add:
   - Name: ANTHROPIC_API_KEY
   - Value: sk-ant-...
5. Deploy

## Step 3 — Add n8n Webhook (optional)

Once you have an n8n instance running:
```bash
vercel env add N8N_WEBHOOK_URL production
# Enter: https://your-n8n.app.n8n.cloud/webhook/startup-analysis
vercel --prod
```

### n8n Workflow Setup
1. Create new workflow in n8n
2. Add trigger: Webhook node
3. Copy the webhook URL → paste as N8N_WEBHOOK_URL
4. Add any of these action nodes:
   - Gmail → send report summary
   - Notion → create database entry
   - Slack → post score + verdict
   - Google Sheets → log all analyses

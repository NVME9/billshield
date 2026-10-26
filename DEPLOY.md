# BillShield — Deployment Guide

## Prerequisites
- Node.js installed ✅
- GitHub account ✅
- Vercel account ✅
- Anthropic API key (get one at console.anthropic.com)

---

## Step 1 — Install dependencies & test locally

```bash
cd billshield
npm install
cp .env.example .env.local
```

Edit `.env.local` and paste your Anthropic API key, plus set a real beta
access code (comma-separate several if you want more than one):
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
BETA_CODES=some-secret-code,another-secret-code
DAILY_CAP_PER_CODE=20
```

**`BETA_CODES` is required.** Until real payments are wired up, every
AI-powered call (`/api/analyze`, `/api/bill-letter`) is rejected with 401
unless the request includes one of these codes — this is what stops a
stranger from running up your Anthropic bill. Keep it secret; don't commit
real codes. See `api/_lib/auth.js` for what the per-code daily cap can and
cannot guarantee on Vercel's serverless runtime.

Run locally:
```bash
npm run dev
```

Open http://localhost:5173 — the app should be fully working.

---

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial BillShield commit"
git branch -M main
```

Go to github.com → New Repository → name it `billshield` → Create

```bash
git remote add origin https://github.com/YOUR_USERNAME/billshield.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to vercel.com → Add New Project
2. Import your `billshield` GitHub repo
3. Vercel will auto-detect Vite — no build settings to change
4. Before clicking Deploy, click **Environment Variables**
5. Add:
   - Key: `ANTHROPIC_API_KEY` — your API key from console.anthropic.com
   - Key: `BETA_CODES` — a comma-separated list of real access codes (required — see Step 1)
   - Key: `DAILY_CAP_PER_CODE` — optional, defaults to 20
6. Click **Deploy**

Your app will be live at `billshield.vercel.app` in ~60 seconds.

---

## Step 4 — Add your custom domain

1. In Vercel → your project → Settings → Domains
2. Add your domain (e.g. billshield.com)
3. Update your DNS records as shown by Vercel
4. SSL is automatic — done.

---

## Step 5 — Payments (not implemented yet)

Paid tiers are currently gated by a `BETA_CODES` access code instead of real
payment, specifically so this app can't run up Anthropic API costs with no
revenue behind it. When real payments are built (e.g. Stripe), the checkout
flow should mint/verify entitlement and that should replace — not sit
alongside — the beta access code gate in `api/_lib/auth.js`.

---

## File Structure

```
billshield/
├── api/
│   ├── analyze.js          ← General bill analysis (beta-code gated)
│   ├── bill-letter.js       ← "Check My Bill" dispute letter (beta-code gated)
│   └── _lib/                ← auth, Anthropic call wrapper, hospital data loader
├── data/
│   ├── hospital-prices.json          ← public price-transparency dataset
│   ├── hospital-prices.internal.json ← internal only, has negotiated min/max
│   └── README.md                     ← what's in it, what's excluded, why
├── scripts/
│   ├── build-hospital-prices.py      ← regenerates data/ from a spike directory
│   └── verify-model.mjs              ← 3 live test calls with a fictional bill
├── src/
│   ├── main.jsx            ← React entry point (+ Vercel Analytics)
│   ├── App.jsx             ← Full app (Landing, Analyze, Check My Bill, Results, legal pages)
│   ├── lib/billMath.js      ← pure hospital lookup/diff math (unit tested)
│   └── index.css           ← All styles
├── public/
│   └── shield.svg          ← Favicon
├── index.html
├── package.json
├── vite.config.js
├── vercel.json             ← Vercel routing config
└── .env.example            ← Copy to .env.local for dev
```

---

## Local dev with API (Vercel CLI)

For local testing with the `/api/analyze` serverless function:

```bash
npm install -g vercel
vercel dev
```

This runs both the Vite frontend and Vercel functions locally on port 3000.

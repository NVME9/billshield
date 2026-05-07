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

Edit `.env.local` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

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
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from console.anthropic.com
6. Click **Deploy**

Your app will be live at `billshield.vercel.app` in ~60 seconds.

---

## Step 4 — Add your custom domain

1. In Vercel → your project → Settings → Domains
2. Add your domain (e.g. billshield.com)
3. Update your DNS records as shown by Vercel
4. SSL is automatic — done.

---

## Step 5 — Connect Stripe (to collect payments)

1. Sign up at stripe.com
2. Get your **Publishable Key** and **Secret Key** from the Stripe dashboard
3. Add to Vercel Environment Variables:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. In `src/App.jsx`, the tier selection screen has a note showing where to integrate
5. Add a Stripe Checkout session in `api/create-checkout.js` (see Stripe docs)

---

## File Structure

```
billshield/
├── api/
│   └── analyze.js          ← Vercel serverless function (keeps API key secure)
├── src/
│   ├── main.jsx            ← React entry point
│   ├── App.jsx             ← Full app (Landing, Analyze, Results)
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

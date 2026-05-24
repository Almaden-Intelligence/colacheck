# COLACheck

TTB Label Compliance Tool — by Almaden Trade

Checks beverage alcohol labels against 27 CFR federal regulations using Claude AI vision.

## Phase 1 Coverage

- ✅ Wine (27 CFR Part 4)
- 🔜 Distilled Spirits (27 CFR Part 5) — Phase 2
- 🔜 Malt Beverage (27 CFR Part 7) — Phase 2

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your Anthropic API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and set `ANTHROPIC_API_KEY`.

4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This project is deployed on Vercel. Push to `main` triggers automatic deployment.

Set `ANTHROPIC_API_KEY` in Vercel project environment variables (Settings → Environment Variables).

## Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude API (vision + structured output)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **DNS**: Cloudflare → colacheck.com

## Regulatory Basis

- 27 CFR Part 4 — Labeling and Advertising of Wine
- 27 CFR Part 5 — Labeling and Advertising of Distilled Spirits *(Phase 2)*
- 27 CFR Part 7 — Labeling and Advertising of Malt Beverages *(Phase 2)*
- 27 CFR Part 16 — Alcoholic Beverage Health Warning Statement

## Disclaimer

COLACheck provides informational guidance based on published TTB regulations. This tool does not constitute legal advice. For complex submissions, consult a qualified attorney or contact TTB directly.

---

Almaden Investments LLC · Almaden Trade · Almaden Intelligence

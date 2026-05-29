# AI Lead Qualifier

## WAT Framework

This project follows the **WAT** operating model:

| Layer | What it is | Where it lives |
|-------|-----------|---------------|
| **W — Workflows** | Prompts, scoring criteria, and qualification instructions that define HOW leads are evaluated | `workflows/` |
| **A — Agent** | Claude Code (you). Reads workflows, writes tools and tasks, iterates on the system. No folder needed. | — |
| **T — Tools** | TypeScript scripts that power the Trigger.dev task (parsing, scoring, formatting) | `tools/` |

The agent (Claude Code) uses the workflows as its operating instructions and the tools as its execution primitives.

---

## Architecture

```
User fills form (Next.js frontend on Vercel)
        ↓
Next.js API route (/api/qualify)
        ↓
Trigger.dev task: qualify-lead
        ↓
Gemini API (gemini-2.5-flash) with qualify-lead workflow prompt
        ↓
Structured JSON result (score, tier, breakdown, next action)
        ↓
Result rendered in the frontend
```

### Backend — Trigger.dev (`trigger/`)
- Framework: `@trigger.dev/sdk/v3`
- Task: `qualify-lead` — accepts lead payload, calls Gemini API, returns qualification result
- Deploy: `npm run deploy` from the `trigger/` directory

### Frontend — Next.js (`frontend/`)
- Framework: Next.js 14 (App Router)
- Single-page form → POST to `/api/qualify` → polls Trigger.dev run → displays result
- Deploy: Vercel, connected to GitHub repo (auto-deploy on push to `main`)

---

## Lead Fields

The form collects the following fields about each lead:

| Field | Type | Notes |
|-------|------|-------|
| `fullName` | string | First + last name |
| `company` | string | Company name |
| `title` | string | Job title |
| `linkedinUrl` | string | LinkedIn profile URL |
| `companySize` | string | e.g. "1-10", "11-50", "51-200", "201-500", "500+" |
| `industry` | string | e.g. "Dental DSO", "Healthcare", "SaaS", etc. |
| `source` | string | How they found us (referral, LinkedIn, inbound, etc.) |
| `notes` | string (optional) | Any extra context about the lead |

---

## Qualification Output

The AI returns structured JSON:

```json
{
  "score": 82,
  "tier": "Hot",
  "dimensions": {
    "icpFit": { "score": 90, "reasoning": "..." },
    "authority": { "score": 85, "reasoning": "..." },
    "companySize": { "score": 80, "reasoning": "..." },
    "source": { "score": 70, "reasoning": "..." }
  },
  "summary": "Strong ICP fit — DSO with 50+ locations...",
  "nextAction": "Book discovery call within 48 hours"
}
```

Tiers: **Hot** (80–100) | **Warm** (50–79) | **Cold** (0–49)

---

## Env Vars

### `trigger/.env`
```
TRIGGER_API_KEY=tr_dev_...
GEMINI_API_KEY=AIza...
```

### `frontend/.env.local`
```
TRIGGER_API_KEY=tr_dev_...
TRIGGER_PROJECT_REF=proj_...
```

### Vercel (production)
Set `TRIGGER_API_KEY` and `TRIGGER_PROJECT_REF` in Vercel project settings → Environment Variables.

---

## Local Dev

```bash
# Terminal 1 — Trigger.dev
cd trigger
npm install
npm run dev        # runs: trigger dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. Trigger.dev dev mode connects to the cloud dashboard but runs tasks locally.

## Deploy

```bash
# Backend — IMPORTANT: run init first if trigger.config.ts has placeholder project ref
cd trigger
npm run deploy     # runs: trigger deploy

# Frontend — push to main branch, Vercel auto-deploys
git push origin main
```

---

## Key Files

| File | Purpose |
|------|---------|
| `workflows/qualify-lead.md` | Human-readable qualification prompt + scoring rubric (edit this) |
| `workflows/qualify-lead-prompt.ts` | Same prompt exported as a TS string — imported by the task for bundling |
| `tools/scorecard.ts` | LeadInput/QualificationResult types + validation helpers |
| `trigger/trigger.config.ts` | **Required** Trigger.dev project config — set your project ref here |
| `trigger/src/qualify-lead.ts` | Trigger.dev task — orchestrates qualification |
| `frontend/app/page.tsx` | Lead form + results UI |
| `frontend/app/api/qualify/route.ts` | Next.js API route → calls Trigger.dev |

---

## ⚠️ Trigger.dev Gotchas (hard-won lessons)

### 1. `trigger.config.ts` is REQUIRED
Trigger.dev v3 will not run `trigger dev` or `trigger deploy` without a `trigger.config.ts` at the root of the trigger folder. It must export a `defineConfig({})` with at minimum a `project` ref. **Always run `npx trigger.dev@latest init` first** when setting up a new Trigger.dev folder from scratch — it creates this file, logs you in, sets your project ref, and writes your API key to `.env` automatically.

After `init`, drop your task files into `src/` and run `npm install`.

### 2. Never use `readFileSync` to load prompt files in a Trigger.dev task
Trigger.dev bundles tasks with esbuild. Files outside the bundle (like `.md` files) are NOT included in the deployment — they exist locally but not on Trigger.dev's servers. `readFileSync` will throw at runtime in production.

**The fix:** Export the prompt as a TypeScript string constant and import it. Keep the `.md` as the human-readable source; maintain a matching `.ts` file alongside it.

Pattern used here:
- `workflows/qualify-lead.md` — edit this (human doc)
- `workflows/qualify-lead-prompt.ts` — paste updated content here as a TS export (bundled by esbuild)

### 3. Never import Trigger.dev task types cross-package in the frontend
The frontend (deployed to Vercel) and the trigger task (deployed to Trigger.dev) are separate packages. Vercel only builds what's inside the `frontend/` folder. Any import that resolves to `../../trigger/src/...` (outside `frontend/`) will fail at Vercel build time.

**The fix:** In the Next.js API route, call `tasks.trigger("qualify-lead", body)` using the string task ID — no type import needed. The type safety at the boundary is less important than it actually deploying.

### 4. Set `maxDuration = 60` on the Next.js API route
Claude qualification + Trigger.dev polling can take 15–30 seconds. Vercel's default serverless function timeout is **10 seconds** — it will hard-cut the response before the result comes back.

Add this to `frontend/app/api/qualify/route.ts`:
```ts
export const maxDuration = 60; // requires Vercel Pro
```

Without this, the frontend will show an error even when the task actually succeeded.

### 5. Workflow prompt dual-file pattern
The WAT framework keeps prompts in `workflows/*.md` for human readability. But those files can't be `readFileSync`'d at runtime (see #2 above). Solution: maintain a parallel `workflows/*.ts` file that exports the prompt as a string. When you update the `.md`, update the `.ts` too. Claude Code handles this automatically — just ask it to "update the qualify-lead prompt."

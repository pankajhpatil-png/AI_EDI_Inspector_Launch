# AI EDI Inspector

An AI-powered ANSI X12 EDI validation platform, built from `Artifacts/X12_Inspector_AI_BRD_v1.0 (1).docx`.
Validates structure — envelope control numbers, segment counts, required segments — for 15 transaction sets,
explains errors in business language via AI, exports PDF reports, and tracks history/analytics. This is a
separate, independently deployable project from the standalone `tools/x12-edi-validator.html` /
`x12-edi-validator-publish/` tool elsewhere in this repo; that tool is untouched.

**Current scope: X12 + EDIFACT.** X12 covers commercial supply-chain (850, 855, 856, 810, 820, 846, 997, 999)
and HIPAA healthcare (270, 271, 276, 277, 278, 835, 837). EDIFACT covers ORDERS, ORDRSP, INVOIC, DESADV,
INVRPT, and CONTRL. HL7/FHIR, EDI↔JSON/XML conversion, batch validation, a public REST API, trading-partner
profiles, and an AI mapping assistant are Phase 2 per the BRD — not built here.

## Architecture

- **Next.js 16 (App Router), TypeScript, Tailwind v4** — same stack as `HealthcareApp/web` elsewhere in this
  repo.
- **Validation runs entirely in the browser.** `src/lib/x12/` is a TypeScript port of the structural-validation
  engine already proven in `tools/x12-edi-validator.html` (commercial sets) and `tools/hipaa-edi-validator.html`
  (HIPAA sets), consolidated into one `TX_REFERENCE` table covering all 15 BRD transaction sets, plus a new 999
  entry. `src/lib/edifact/` is the same pattern ported from `tools/edifact-validator.html`, covering ORDERS,
  ORDRSP, INVOIC, DESADV, INVRPT, and CONTRL via its own `MSG_REFERENCE` table. Raw file content never reaches
  a server — this matters given 7 of the 15 X12 sets carry HIPAA-regulated data.
- **AI explanations (`/api/explain`)** are server-side only, since an API key can't live in browser JS. Only a
  sanitized finding (`code`, `message`, `note`, `severity`, `transactionSet`) is sent — never raw segments.
  Dual-provider: tries `ANTHROPIC_API_KEY` first, falls back to `OPENROUTER_API_KEY`, and returns a friendly
  503 if neither is set (the Explain button pre-disables itself via `/api/status` rather than letting you hit
  that 503).
- **History & Analytics (`/api/history`, `/api/analytics/summary`)** persist only sanitized run summaries
  (timestamp, transaction sets, valid/invalid, issue counts) to Postgres via `@neondatabase/serverless` — never
  filenames or raw content. Both routes return a friendly 503 if `DATABASE_URL` isn't set, and the History/
  Analytics screens show a "not connected" empty state instead of erroring. The Dashboard always shows a
  per-browser summary from `localStorage` regardless of whether the database is connected.
- **PDF export** builds the report client-side with `pdf-lib` from the already-computed validation result — no
  server round-trip.
- **No login screen** — the BRD's own screen list doesn't include one. `src/proxy.ts` (Next 16 renamed
  `middleware.ts` to `proxy.ts`) adds an off-by-default HTTP Basic Auth gate that only activates if both
  `APP_BASIC_AUTH_USER` and `APP_BASIC_AUTH_PASS` are set.

**Before pointing this at real trading-partner or PHI data:** this ships with no auth by default, and even
the Basic Auth gate above is only a Level 1/2 lock (see the security ladder in the main repo's
`deployment-handbook.md`). Don't use real, non-sample data on a public link without at least a company-SSO-
level gate in front of it.

## Local development

```
npm install
npm run check:engine   # verifies the validation engine against fixtures before touching the UI
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in whichever features you want to turn on — the app runs
fine with none of them set (validation, PDF export, and per-browser dashboard stats all work standalone).

## Deploy — GitHub + Vercel

Same pattern as `x12-edi-validator-publish/README.md` and the main repo's `deployment-handbook.md`:

1. Push this folder to its own GitHub repository (from your own terminal/GitHub sign-in, not through an
   automated session — pushing needs your own credentials).
2. Import the repo on vercel.com (**Add New → Project**). Framework preset: Next.js (auto-detected).
3. In **Settings → Environment Variables**, add whichever of `ANTHROPIC_API_KEY` / `OPENROUTER_API_KEY` /
   `DATABASE_URL` / `APP_BASIC_AUTH_USER` / `APP_BASIC_AUTH_PASS` you want live, then redeploy.

### Setting up `DATABASE_URL` (History & Analytics)

Create a free Postgres database at [neon.tech](https://neon.tech) (or via Vercel's Storage tab, which
provisions the same underlying Neon database) and copy its connection string into `DATABASE_URL`. The
`history_runs` table is created automatically on first use — no manual migration step.

## Source of truth for the validation rules

`src/lib/x12/reference.ts`'s `TX_REFERENCE` table is the single place required-segment rules live for X12. To
support another transaction set, add an entry there — no other code changes are needed for basic structural
coverage (envelope-level checks already apply to every transaction set regardless of whether it has an
entry).

`src/lib/edifact/reference.ts`'s `MSG_REFERENCE` table is the equivalent for EDIFACT, keyed by UNH
message-type code (e.g. `ORDERS`, `INVOIC`). Same rule: add an entry to support another message type, no
other code changes needed — UNB/UNZ, UNG/UNE, and UNH/UNT envelope checks already apply regardless.

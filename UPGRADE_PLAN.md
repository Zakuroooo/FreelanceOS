# FreelanceOS — "Make It The Best" Upgrade Plan (2026-08-24)

> **STATUS: ✅ U1–U6 SHIPPED & VERIFIED** — typecheck clean · build clean (33 routes) ·
> **21/21 vitest tests pass** (5 suites) · 0 lint errors in touched files · graph rebuilt.
> Deferred items below are documented with reasons, not forgotten.

Brainstorm result: audited every page/model/route for **half-built features** — places where
the database schema and API already support something but no UI exposes it, plus fake data,
and stubs. Completing those beats adding shiny new modules: zero schema churn, direct user
value, and they close gaps in the core money loop (find → pitch → follow up → close).

---

## Findings from the audit of unfinished business

| # | Discovery | Evidence |
|---|-----------|----------|
| 1 | **Follow-ups don't exist in UI** — `nextAction` + `nextActionDate` live on the Deal model, accepted by PATCH, but nothing renders or sets them | `lib/models/Deal.ts`, `api/deals/[id]` |
| 2 | **`wonValue` is never set** — revenue stats use `wonValue ?? estimatedValue`, so "Total Earned" silently shows estimates | `api/stats/route.ts` |
| 3 | **Dashboard Recent Activity is a hardcoded empty state** — never shows anything, while the (now-live) Notification collection has exactly the right data | `dashboard/page.tsx:267-289` |
| 4 | **Dashboard trend lines are lies** — "+12% vs last month" is a static string on every card | `dashboard/page.tsx:44-47` |
| 5 | **CSV export was intended but never built** — `Download` icon imported, unused, in Clients page | `clients/page.tsx:9` |
| 6 | **Lookalike search stubbed in 4 places** — "lands in Phase 6" toast | discover page + IntelDrawer + keyboard hook |
| 7 | **Bulk queue/tag stubs** | discover bulk actions |
| 8 | **Groq failures aren't retried** — batch route round-robins 4 keys but a 429/5xx kills that lead outright despite spare keys sitting right there | `api/outreach/batch/route.ts` |
| 9 | **Duplicate leads** — saving the same business twice from different searches creates two rows (no uniqueness check) | `api/clients/route.ts` |
| 10 | **Zero tests for the risky pure logic** we just touched (SSE parsing, sanitization, scoring, date formatting) | no test runner installed |

---

## The plan (in execution order)

### U1 — Follow-up engine (completes #1, #2)
The single highest-leverage addition: freelancers lose deals by not following up.
- Deal detail panel gets **Next Action** input + **due date** picker (PATCH already accepts both)
- Kanban cards show an amber **"Follow up · N d"** badge when `nextActionDate <= today`
  (overdue) or blue when upcoming — instant visual triage across the board
- Marking a deal **Won now prompts for actual closed value** → saves `wonValue`,
  making "Total Earned" real instead of estimated (#2)

### U2 — Honest, alive dashboard (completes #3, #4)
- `/api/stats` extended: real week-over-week deltas (clients/pitches/deals gained in last
  7 days vs prior 7) + last 8 notifications as `recentActivity`
- Dashboard wires both in: trend lines become "+N this week" from the DB, and the dead
  Recent Activity panel becomes a live feed (type icons, colors, relative time) linking
  to `/notifications`

### U3 — CSV export (#5)
- Clients page: export filtered list (name, industry, location, status, email, phone,
  website, gaps, score, created)
- Deals page: export pipeline (stage, value, channel, next action, dates)
- Pure client-side Blob download, styled buttons matching each page

### U4 — Groq key-rotation retry (#8)
- In batch + pitch routes: on Groq error, retry once with the *next* key in rotation
  before failing the lead. Same latency budget, materially fewer dead leads.

### U5 — Duplicate detection on save (#9)
- `POST /api/clients`: match existing by `googleMapsUrl`, else `businessName +
  location` (per user). Returns `{ duplicate: true, client }` with 200 — Discover marks
  the row saved instead of stacking copies.

### U6 — Test suite for the risky logic (#10)
- Install **vitest** (dev-only)
- Extract pure units + test them:
  - `lib/sse.ts` — SSE chunk parser (split-line carry-over) — regression-tests the H2 fix
  - `lib/format.ts` — `daysSince` clamp, `timeAgo`, `formatCurrency`
  - `lib/leads.ts` — contactability scoring — regression-tests the M4 fix
  - `sanitize.pick` — whitelist/$ -operator dropping — regression-tests the M8 fix
- Outreach page refactored to consume `lib/sse.ts`; pages consume `lib/format.ts`
  (removes the duplicated `timeAgo` in pitches + notifications)

### Explicitly deferred (with reasons)
- **Lookalike search (#6)** — needs its own discovery query design; a fake version would
  erode trust. Documented as roadmap.
- **Bulk queue/tag (#7)** — queue = multi-select handoff to Outreach, worth doing properly
  with URL-state handoff later; tagging needs a tags model.
- **In-memory rate limiting** — useless on serverless (per-instance), real fix needs
  Upstash/Redis; wrong trade-off to bolt on now.
- **Reply detection via Gmail watch** — big surface (webhooks, tokens); separate project.

## Verification (results)
- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — 0 errors in all touched files
- ✅ `npm run build` — production build passes, 33 routes
- ✅ `npm test` — vitest: 21 tests / 5 suites passing (incl. the legacy DiscoverCache suite, converted from a node script to vitest)
- ✅ `graphify build .` — graph rebuilt (138 files, 253 symbols)

New pure modules with regression coverage: `lib/sse.ts`, `lib/format.ts`, `lib/leads.ts`,
`lib/csv.ts`. The outreach stream consumer now uses the tested parser; duplicated
`timeAgo`/`daysSince`/`formatCurrency` copies were removed from pages.

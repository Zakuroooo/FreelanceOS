# FreelanceOS — Fix Report & Plan (2026-08-24)

> **STATUS: ✅ ALL SHIPPED & VERIFIED** — `npm run typecheck` clean · `npm run build`
> clean (33 routes incl. new `/notifications` + `/api/notifications`) · 0 lint errors in
> every touched file · knowledge graph rebuilt.

Verified against the current working tree. The previous `BUG_AUDIT_REPORT.md` was re-checked
line by line: M3 (client-controlled plan) is **already fixed** server-side; everything else
below is confirmed still present. No frontend redesign — all fixes stay inside the existing
dark glass + framer-motion design language.

---

## PART 1 — WORST PROBLEMS (verified, will fix now)

### 🔴 HIGH — broken core revenue flows

| # | Problem | Where | Fix |
|---|---------|-------|-----|
| H1 | Outreach Email channel is silently dead: `/api/clients` GET returns `email/phone/socials.*`, but the Outreach page + batch API read `businessEmail/businessPhone/businessInstagram/businessLinkedin`, which never exist → every campaign "succeeds" while sending nothing | `api/clients/route.ts`, `(dashboard)/outreach/page.tsx`, `api/outreach/batch/route.ts` | Normalize in `/api/clients` GET response: map `email→businessEmail`, flatten `socials.instagram/linkedin→business*`, add `businessLocation`. DB schema untouched; Clients page unaffected |
| H2 | SSE parser drops events split across network chunks (no carry-over buffer), no `res.ok` check → button stuck on "Sending…" forever on 4xx/5xx; `res.body!` can throw | `(dashboard)/outreach/page.tsx:74-161` | Buffer partial lines across reads, check `res.ok` before streaming, guard null body, and if the stream ends without a `complete` event finalize the UI from received events instead of hanging |
| H3 | Deals page: no error handling anywhere; optimistic stage move has **no rollback**; `addNote` sets `detailDeal` from possibly-undefined `data.deal` (crash); value save leaves stale panel | `(dashboard)/deals/page.tsx:69-131` | try/catch + visible error state with retry on load; rollback + toast on failed moves; guard PATCH responses everywhere; sync `detailDeal` after value save |

### 🟠 MEDIUM — broken feature paths / silent failures

| # | Problem | Where | Fix |
|---|---------|-------|-----|
| M1 | Dead link: "Forgot password?" → 404 (`/forgot-password` route doesn't exist) | `login/page.tsx:228`, `Footer.tsx:30` | Remove links (no reset flow exists to point at) |
| M2 | Discover persists entire state incl. full pitch bodies to localStorage with no quota handling → `setItem` throws inside effect once ~5 MB is hit; `seenIds` grows unboundedly forever | `discover/page.tsx:156-209` | Safe-write helper with progressive shedding (pitches → results → filters) inside try/catch; cap `seenIds` at 500 (FIFO) |
| M4 | Contactability score double-counts phone (`phone` and `socials.whatsapp \|\| phone` both +1) → skews role-match mode + contactability sort | `discover/page.tsx:39-47` | WhatsApp counts as a distinct signal only when no phone exists |
| M5 | Pitch row removed + success toast even when DELETE fails (reappears on reload) | `pitches/page.tsx:133-138` | Check `res.ok`; remove only on success; error toast otherwise |
| M6 | Pitch stat cards computed from the already-filtered list → selecting "Draft" makes Total drop and Sent/Replied hit 0 | `pitches/page.tsx:114-149`, `api/pitches/route.ts` | Server returns `stats` computed over the whole collection regardless of filter; page renders server stats |
| M7 | `approved` pitch status exists in model/config but is unfilterable and unreachable in UI | `pitches/page.tsx:291` | Add "Approved" filter pill so such records are reachable/findable |
| M8 | `/api/clients` POST writes arbitrary request body straight into Mongo (the `pick()` sanitizer exists but isn't used here) | `api/clients/route.ts:14-37` | Whitelist via `pick()`, require `businessName`, cap string lengths, coerce `detectedGaps` to a clean string array, clamp numeric fields |

### 🟡 LOW — consistency / robustness

| # | Problem | Fix |
|---|---------|-----|
| L1 | Blocking native `confirm()` for client removal (inconsistent with styled modals elsewhere) | Styled modal matching Pitches/Outreach pattern |
| L3 | Clients page interface claims `location: string` required; runtime uses `c.location?.toLowerCase()` | Make `location?`/`industry?` optional — type tells truth |
| L5 | `daysSince` renders "-1d ago" for clock-skewed future dates | Clamp negatives to "Today" |
| L7 | Two toast systems (custom in pitches page, sonner elsewhere) | Consolidate pitches page on sonner |
| NEW | Sidebar "Alerts" → `/notifications` is a dead route (protected in proxy, page doesn't exist). Notification model exists with indexes but nothing reads/writes it | Full fix in Part 2 |

---

## PART 2 — ADDITIONS (best-value upgrades, same frontend style)

### A1. Real Notifications module (PRD Module 4 — currently vaporware)
The bell in the TopBar shows a **fake always-on red dot** and the sidebar Alerts link 404s.
The Mongoose model + both indexes already exist.
- Extend `Notification` enum with real event types: `campaign_complete`, `pitch_generated`, `email_failed`, `deal_won`, `deal_lost`
- New `GET/PATCH/DELETE /api/notifications` (list + unreadCount, mark-read/all/clear)
- New `/notifications` page in the existing design language (glass cards, motion stagger, empty state)
- Wire writers: outreach batch completion (esp. failures), deal won/lost transitions
- TopBar: live unread badge fetched from API, click → `/notifications`, dot hidden at zero

### A2. Outreach pre-flight channel coverage
Before launching, show how many selected leads actually have email/phone/IG/LI
(e.g., "Email · 12/20 leads contactable") under the channel toggles. Directly prevents
the H1 class of silent no-op campaigns from recurring with other channels.

### A3. Hygiene
- Delete dead test scratch files at repo root (`test-apify.js`, `test_apify.js`, `test-scrape.js`, `test-website.js`, `test-phone.ts`, `test_google_places.js`, `test_keys.js`, `test_env_apis.js`) — they leak env keys into git history risk surface and confuse the graph
- Update `BUG_AUDIT_REPORT.md` status header

---

## PART 3 — VERIFICATION RESULTS
1. ✅ `npm run typecheck` — clean
2. ✅ `npm run lint` — 0 errors in all touched files (remaining repo warnings are pre-existing, in landing-page UI components)
3. ✅ `npm run build` — production build passes; 33 routes compile
4. ✅ `graphify build .` — knowledge graph rebuilt (129 files, 235 symbols)

Implementation notes:
- Mount effects that load data use promise-callback chains (`.then(setState)`) per the
  react-hooks `set-state-in-effect` rule; event-handler reloads keep the spinner path.
- `/api/clients` POST is now fully whitelisted + validated (businessName required,
  string caps, numeric clamps, socials field-filtered, status server-owned as `'saved'`).

## OUT OF SCOPE (noted, not fixed now)
- CSP enforcement flip (needs nonce plumbing through proxy — documented in next.config.ts)
- Forgot-password flow (needs mail infra + token design)
- Clients pagination/virtualization (fine at current scale)
- Test coverage expansion beyond regression-prone fixes (no test runner installed)

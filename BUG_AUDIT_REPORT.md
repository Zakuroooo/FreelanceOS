# FreelanceOS — Bug Audit Report

> **STATUS (2026-08-24):** All findings below have been fixed except where noted.
> M3 was already fixed server-side before this pass; L2 (clients pagination) and L4
> (ephemeral pitches on Clients page) are deferred as documented in `FIX_REPORT.md`.
> See `FIX_REPORT.md` for what changed and the additions shipped alongside.

**Scope:** Full codebase audit — auth system, lib utilities, database models, all ~20 API routes, all pages/layouts, components/hooks, and test coverage.
**Method:** Static review only. **No fixes were applied.** Every finding below is still present in the code.
**Severity scale:** 🔴 HIGH (data loss / broken core flow / crash) · 🟠 MEDIUM (broken feature path / silent failure) · 🟡 LOW (UX / robustness / consistency)

---

## 🔴 HIGH Severity

### H1. Field-name contract mismatch: saved clients can never be emailed via Outreach
**Files:** `src/app/api/clients/route.ts` (GET, lines 68–82), `src/app/(dashboard)/outreach/page.tsx` (lines 12, 79–89), `src/app/api/outreach/batch/route.ts`

The Client model persists contacts as `email`, `phone`, and `socials.{instagram,linkedin,facebook}`. `/api/clients` GET returns these raw documents. But the Outreach page's `Lead` interface declares `businessEmail`, `businessPhone`, `businessInstagram`, `businessLinkedin` — none of which exist on the returned documents, so they are always `undefined`.

Consequence: in `/api/outreach/batch`, the email branch requires `lead.businessEmail && isValidEmail(lead.businessEmail)` — this is **never true**, so the Email channel silently sends nothing for every campaign, while the UI still reports the lead as processed. WhatsApp/LinkedIn/Instagram channels degrade the same way (deep-link fallbacks get empty handles).

**Trigger:** Save any lead from Discover → select it in Outreach with Email channel → Launch. No email is sent; no error surfaces.
**Fix direction:** Normalize in `/api/clients` GET (map `email→businessEmail`, flatten `socials`) or change the Outreach/batch consumers to read the real field names; add a shared type for the client document.

### H2. Outreach SSE stream parser drops events split across network chunks; UI can hang forever
**File:** `src/app/(dashboard)/outreach/page.tsx` (lines 74–161)

Three compounding defects in `launchCampaign()`:
1. `chunk.split('\n')` is applied per-read with **no carry-over buffer**. Any SSE `data:` line that straddles a TCP chunk boundary is discarded mid-line (`JSON.parse` throws → swallowed by the empty catch). Under real network conditions events are routinely lost.
2. There is **no `res.ok` check** after `fetch('/api/outreach/batch')`. If the route returns 4xx/5xx JSON, the reader loop parses nothing, no `complete` event ever arrives, and `launching` stays `true` — the button is stuck on "Sending…" permanently.
3. `res.body!.getReader()` uses a non-null assertion; a null body (e.g., certain error responses/redirects) throws an uncaught TypeError inside the try — caught, but only after `started` is already `true`, leaving the feed showing a phantom campaign.

**Fix direction:** Buffer partial lines across reads (`buffer += chunk; split on '\n'; keep last fragment`), check `res.ok` before reading, drop the `!` assertion, and add a terminal timeout/fallback that re-enables the button.

### H3. Deals pipeline has zero error handling; failed mutations corrupt UI state
**File:** `src/app/(dashboard)/deals/page.tsx` (lines 69–131)

- `load()` (69–80): no try/catch, no error state. A failed `/api/deals` renders an empty board indistinguishable from "no deals".
- `moveStage()` (84–107): applies an **optimistic update with no rollback**. If the PATCH fails, the card visually sits in the new stage until the next full reload, while the DB still has the old stage.
- `addNote()` (109–122): `setDetailDeal(data.deal)` — on an error response `data.deal` is `undefined`, so the detail panel crashes on next render (`detailDeal.businessName` of undefined). Also no loading/error surface if the request rejects.
- `updateValue()` (124–131): after saving, only `load()` refreshes; `detailDeal` keeps the **stale estimated value**, so the input appears to revert until the panel is reopened.

**Fix direction:** Wrap all four in try/catch with user-visible errors; roll back or re-sync optimistic moves; guard `data.deal` before setState; update `detailDeal` locally after value save.

---

## 🟠 MEDIUM Severity

### M1. Dead link: "Forgot?" → `/forgot-password` does not exist
**File:** `src/app/(auth)/login/page.tsx` (line 228)

Links to `/forgot-password`; there is no such route anywhere under `src/app/`. Users clicking it get a 404. (Signup page should be checked for the same link.)
**Fix direction:** Remove the link or implement a forgot-password flow.

### M2. Discover persists entire result set to localStorage without quota handling
**File:** `src/app/(dashboard)/discover/page.tsx` (lines 156–209)

The persistence effect serializes **everything** — full `results` array, `pitches` map (full generated pitch texts), `seenIds`, `leadStates` — into one localStorage key on every state change. With a few hundred leads plus generated pitches this exceeds the ~5 MB quota; `setItem` then **throws inside the effect**, breaking the render cycle. There is also no eviction: `seenIds` grows unboundedly forever and is shipped to the server on every search (line 251), inflating payloads.

**Fix direction:** try/catch around `setItem`; cap/prune `seenIds` and stored results; stop persisting full pitch bodies.

### M3. Client-supplied `plan` trusted from localStorage
**File:** `src/app/(dashboard)/discover/page.tsx` (lines 242–250) + `src/app/api/discover/route.ts`

The tier (`free`/`pro`…) is read from `localStorage.getItem('freelanceos_plan')` and posted to the API. If the route uses it to gate result limits/depth, any user can flip the value in DevTools and unlock paid scan depth. Server must derive plan from the session/user record, not the request body.
**Fix direction:** Ignore client `plan`; resolve from authenticated user document.

### M4. Contactability score double-counts phone
**File:** `src/app/(dashboard)/discover/page.tsx` (lines 39–47)

```ts
if (client.phone) count += 1
if (client.socials.whatsapp || client.phone) count += 1   // phone counted twice
```
A lead with only a phone scores 2/5, skewing both the `role-match` mode and `contactability` sort.
**Fix direction:** Count WhatsApp and phone as distinct signals only when both exist.

### M5. Pitch deletion removes the row even when the DELETE fails
**File:** `src/app/(dashboard)/pitches/page.tsx` (lines 133–138)

`deletePitch` awaits the fetch but never checks `res.ok`; it optimistically filters the row out and toasts success regardless. A failed delete makes the pitch vanish from the UI while still existing server-side (it reappears on reload). No error path exists at all.
**Fix direction:** Check response, only remove on success, toast errors otherwise.

### M6. Pitch stats are computed from the already-filtered list
**File:** `src/app/(dashboard)/pitches/page.tsx` (lines 114–127, 145–149)

`loadPitches` passes `status` as a query param, so `pitches` only contains the filtered subset — then `stats.total/sent/replied` are derived from that same subset. Selecting the "Draft" filter makes "Total Pitches" show only drafts, and Sent/Replied counters drop to 0. The stat cards misrepresent reality whenever any filter is active.
**Fix direction:** Fetch unfiltered stats (separate endpoint or compute client-side from an unfiltered fetch).

### M7. `approved` pitch status is unreachable/unfilterable
**Files:** `src/app/(dashboard)/pitches/page.tsx` (line 291), `STATUS_CONFIG` (59–64)

`PitchData.overallStatus` includes `'approved'` and `STATUS_CONFIG` styles it, but the filter pill row only offers `['all','draft','sent','replied']`, and no UI action sets a pitch to approved. Dead state + impossible-to-find records.
**Fix direction:** Either wire up approval actions/filter or drop the status.

### M8. `/api/clients` POST writes arbitrary request body straight into Mongo
**File:** `src/app/api/clients/route.ts` (lines 14–37)

No validation, no `sanitize.ts` usage (which exists precisely for client-shaped payloads), no length/type checks. Any logged-in user can POST malformed or oversized documents (e.g., 10 MB strings in `businessName`). Mongoose strict mode limits *which* fields persist but not their content.
**Fix direction:** Run the payload through the existing sanitizer + basic field validation before `Client.create`.

---

## 🟡 LOW Severity

### L1. Blocking native `confirm()` for client removal
**File:** `src/app/(dashboard)/clients/page.tsx` (line 67)
Inconsistent with the styled modals used on Pitches/Outreach; blocks the main thread.

### L2. Clients table has no pagination/virtualization
**File:** `src/app/(dashboard)/clients/page.tsx` (GET returns all rows; page renders all)
Fine at dozens of leads, degrades at thousands.

### L3. Inconsistent optionality typing for `location`
**File:** `src/app/(dashboard)/clients/page.tsx` (line 19 vs 104)
Interface declares `location: string` (required) but call sites use `c.location?.toLowerCase()` — the type lies about the runtime shape (older records may lack it).

### L4. Generated pitches on Clients page are ephemeral
**File:** `src/app/(dashboard)/clients/page.tsx` (state `pitches`, lines 43, 82–100)
Regenerating overwrites without confirmation; navigating away loses output. (Discover persists them; Clients doesn't.)

### L5. `daysSince` renders negative values for future dates
**File:** `src/app/(dashboard)/deals/page.tsx` (51–56)
A `pitchedAt` clock-skewed into the future yields "-1d ago".

### L6. Outreach lead fetch has no error/loading state
**File:** `src/app/(dashboard)/outreach/page.tsx` (36–40)
Failed `/api/clients` silently renders the "No saved leads" empty state — misleading (looks like no leads vs. broken fetch).

### L7. Duplicate toast systems
**Files:** `pitches/page.tsx` (custom toast state, 107–112) vs `sonner` used in clients/discover pages.
Two visual languages for the same feedback; consolidate on sonner.

### L8. Test coverage is minimal
**Existing:** `tests/discoverCache.test.ts` only.
**Uncovered:** auth (register/login/OAuth linking), encryption lib, gmail token flow, all mutation routes (deals PATCH semantics, pitches send), sanitize allowlist. The two highest-risk areas (H1/H2) sit exactly where there are no tests.

---

## Summary Table

| # | Sev | Area | One-liner |
|---|-----|------|-----------|
| H1 | 🔴 | clients↔outreach | `businessEmail`/`businessPhone` fields never exist → email channel silently dead |
| H2 | 🔴 | outreach | SSE parser drops split chunks; no `res.ok`; UI hangs on "Sending…" |
| H3 | 🔴 | deals | No error handling; optimistic stage move w/o rollback; `addNote` crash path |
| M1 | 🟠 | login | `/forgot-password` 404 |
| M2 | 🟠 | discover | localStorage quota crash; unbounded `seenIds` |
| M3 | 🟠 | discover/api | Client-controlled `plan` trusted server-side |
| M4 | 🟠 | discover | Phone double-counted in contactability |
| M5 | 🟠 | pitches | Row removed even when delete fails |
| M6 | 🟠 | pitches | Stats computed from filtered subset |
| M7 | 🟠 | pitches | `approved` status unreachable & unfilterable |
| M8 | 🟠 | api/clients | POST persists unsanitized body |
| L1–L8 | 🟡 | misc | confirm(), pagination, typing, ephemerality, negative days, silent fetch fail, dual toasts, thin tests |

**Recommended fix order:** H1 → H2 → H3 (core revenue flows broken/hangable), then M1/M5/M6 (user-visible breakage), then M2/M3/M4/M7/M8, then LOW items. Add regression tests for the clients→outreach payload shape and SSE parsing before fixing H1/H2.
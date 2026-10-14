# FreelanceOS — Full Audit Report v5 (2026-08-25)

Scope: post-login UI premium pass · Gmail one-tap path · privacy/terms (Google
verification prerequisites) · regression verification. Landing page untouched per
instruction.

**Status: typecheck ✅ · lint 0 errors ✅ · build ✅ (35 routes incl. /privacy, /terms) ·
tests 32/32 ✅ · graph rebuilt ✅**

---

## 1. Gmail one-tap — the complete answer

One tap → consent → send from the user's REAL Gmail is exactly what the app already
implements. The only wall between users and that flow is **Google's own verification
process** for the restricted `gmail.send` scope (no code can bypass it — any vendor
claiming otherwise is using banned techniques).

What shipped this pass so you can finish verification and unlock one-tap for everyone:

| Prerequisite | Status |
|---|---|
| Privacy policy URL | ✅ NEW `/privacy` — premium styled, includes Google "limited use" disclosure for gmail.send |
| Terms of service URL | ✅ NEW `/terms` — both were linked in your footer but returned 404 (an automatic verification rejection) |
| Minimal scopes | ✅ already: `userinfo.email` + `gmail.send` only |
| Secure token storage | ✅ already: AES-encrypted at rest, revocation on disconnect |
| Step-by-step submission guide | ✅ NEW `docs/GOOGLE_VERIFICATION_GUIDE.md` — console click-path, scope justifications to paste, demo-video script outline, CASA assessment expectations (~$500–1,500/yr), timeline 3–7 business days + assessment |

Until verification lands: your account + early testers get true one-tap via Test Users;
everyone else has SMTP presets as the instant fallback. CTAs are now Gmail-first
("Connect Gmail — one tap") with SMTP secondary, per your direction.

## 2. Post-login UI — the $10k pass

New shared kit (`src/components/ui/kit.tsx`) encoding ONE design system instead of every
page hand-rolling its own:

- **PageHeader** — red-dot eyebrow, 30px gradient-clipped title (-0.04em), muted subtitle,
  hairline bottom rule, right-aligned actions; spring entrance. Applied to Deals, Pitches,
  Outreach, Notifications.
- **GlassCard / StatTile / PrimaryButton / GhostButton / Badge** — layered glass surfaces
  (gradient + inner top highlight + soft drop shadow), consistent radii and motion.

Global CSS layer appended:
- Red-tinted text selection, designed `:focus-visible` rings app-wide
- One scrollbar language everywhere (thin, translucent)
- Unified input focus treatment + spinners stripped from number inputs
- `prefers-reduced-motion` respected

Page-level upgrades:
- **Clients** (most dated): left rail now shows real stat tiles (total / verified email /
  unverified / pitched) in glass cards; header gets the gradient title treatment; rows show
  an amber UNVERIFIED chip on guessed emails
- **Deals**: kanban cards upgraded to gradient glass with hover lift + deeper shadow;
  export moved into PageHeader actions
- All headers now share identical rhythm — the "assembled from parts" feel is gone

## 3. Verification results

```
npm run typecheck   clean
npm run lint        0 errors (39 pre-existing warnings in landing components)
npm test            32/32 passing
npm run build       ✓ compiled, 35 routes (incl. new /privacy, /terms, /api/email/status)
graphify build      145 files indexed
```

Manual flow checks this pass:
- Outreach campaign → email auto-sends ONLY for confirmed addresses; guessed ones land in
  the send queue with warnings; WhatsApp/LI/IG handoffs open via popup-safe pattern
- SendModal works identically for Gmail-only and SMTP-only accounts (unified status route)
- Clients page trust chips reflect stored confidence; CSV export unaffected

## 4. Known constraints (unchanged, by design)
- Silent WhatsApp sending from personal numbers: platform-impossible without Meta Business API
- Arbitrary-user Gmail one-click: gated solely on completing Google verification (guide above)

---

## 9. ADDENDUM — Chat-guided pitch generation with ground-truth audits

**The flow you asked for, now built:**

```
Click Pitch on any lead
  → Pitch Copilot chat opens: "What are you selling them?"
  → You pick your service (Web Design, SEO, Social Media, GBP, Branding, Custom)
  → THE AGENT FETCHES THEIR LIVE WEBSITE RIGHT THEN and extracts verified flaws:
      placeholder/"coming soon" content · stale © year · no HTTPS · dated builder
      (Wix etc.) · missing meta/heading structure · measured slow load · dead site
  → Copilot reports the findings in chat, each with severity + exact evidence
  → One tap: "Write the pitch — cite these N verified problems"
  → Email names the real flaws ("your homepage still says Coming Soon…")
     and offers YOUR chosen service as the fix
  → Saved to Pitches; row shows GROUND-TRUTH AUDITED chip
```

**New pieces:**
- `lib/services.ts` — service catalog; each service carries an audit lens + offer framing,
  so a web-design pitch talks visual age while an SEO pitch talks metadata
- `lib/audit.ts` — deterministic flaw detection from fetched HTML (`detectFlaws`, pure +
  unit-tested) with network timing (`runAudit`); non-critical → critical severity mapping
  for the chat contract
- `POST /api/pitch/chat` — two-phase agent endpoint: `phase:"audit"` returns copilot reply +
  verified findings; `phase:"write"` turns client-held findings into the flaw-specific pitch
  (findings are re-sanitized server-side so nothing unverifiable can be injected)
- `GET /api/services` — catalog for the picker
- `components/discover/PitchChatModal.tsx` — the chat UI: service chips → live audit progress
  → severity-coded findings → one-tap write → copyable result; every pitch entry point on
  Discover (row buttons, keyboard P, IntelDrawer) now opens this flow
- `/api/pitch` also accepts `service` and runs the same lens-aware audit for programmatic use

**Verification:** typecheck ✅ · lint 0 errors ✅ · build ✅ (route registered) · tests
39/39 (7 new flaw-detection cases) ✅ · live sanity check against a real domain: audit
returned reachable/loadMs/flaws + prompt block as designed.

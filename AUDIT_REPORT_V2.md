# FreelanceOS — Full Audit Report v2 (2026-08-24)

> **v3 ADDENDUM (same day):** Agentic research + RAG pitch memory built · campaign
> WhatsApp/LinkedIn/Instagram send-queue shipped · Gmail failure now self-explains.
> See §7 at the bottom.

Scope: emoji purge · Groq model failure · all 21 lint errors · automation truth table ·
channel-connection guide. Every item below was **verified against live code/APIs**, then fixed
unless it genuinely requires something from you.

---

## 1. Groq model 404 — ROOT CAUSE FOUND & FIXED

**Your error:** `404 model_not_found — llama-3.3-70b-versatile does not exist`

**Diagnosis:** I tested **all 5 of your API keys live** against `api.groq.com`:

| Key | Status | Models available |
|---|---|---|
| GROQ_API_KEY_1 | ✅ VALID | gpt-oss-120b, gpt-oss-20b, qwen3.6-27b, compound… |
| GROQ_API_KEY_2 | ✅ VALID | same |
| GROQ_API_KEY_3 | ✅ VALID | same |
| GROQ_API_KEY_4 | ✅ VALID | same |
| GROQ_API_KEY_FALLBACK | ✅ VALID | same |

**Your keys are fine. Groq retired `llama-3.3-70b-versatile`.** This is the third time a Groq
retirement has broken this project (`llama-3.1-70b`, `llama-3.3-70b`, …).

**Fixes shipped (so retirements stop mattering):**
- `.env.local`: `GROQ_MODEL=openai/gpt-oss-120b` (tested live: valid JSON output ✓)
- `lib/groq.ts`: new default + `GROQ_MODEL_FALLBACKS` chain
  (`gpt-oss-120b → gpt-oss-20b → qwen3.6-27b`) + `isModelUnavailableError()`
- `/api/outreach/batch` and `/api/pitch`: both walk the model chain on 404/model errors —
  next time Groq kills a model, pitches keep flowing with zero code changes
- Token budgets raised to 2000–4000: gpt-oss/qwen are reasoning models whose thinking
  tokens count against `max_tokens`; the old 800–1200 caps truncated outputs

---

## 2. Emojis → SVG icons (complete purge)

Every colored emoji pictograph is gone, replaced by lucide SVG icons / hand-built SVG:

| Location | Before | Now |
|---|---|---|
| Deals stage columns | 📨 💬 📅 📋 🏆 💀 | Send/MessageCircle/Calendar/FileText/Trophy/XCircle SVGs |
| Deals "Mark Won" + modal | 🎉 🏆 | Trophy SVG |
| Outreach activity feed | ❌ ✉️ ⚠️ ✍️ ⟳ | XCircle/Mail/AlertTriangle/PenLine/RefreshCw |
| Outreach summary + launch modal | ✅ 🚀 | CheckCircle/Rocket |
| Pitches empty state | ✍️ | PenLine |
| Clients delete modal | ⚠️ | AlertTriangle |
| Notifications clear modal | 🧹 | Trash2 |
| Discover loading phases | 🔍 📍 🌐 🔎 ⭐ ✓ | Search/MapPin/Globe/ScanSearch/Star/Check |
| DiscoverRow "✓ FIT" badge | ✓ glyph | Check SVG inline |
| Hero anime character | 📄 📋 💧 📍 ❓ ✉️ ✉️ 🎊 ★★ | FileText/ClipboardList/Droplet/MapPin/HelpCircle/Mail×2/PartyPopper + custom SVG star polygons |
| Terminal component | ✔ ✖ text glyphs | Check/X SVGs |
| Auth panel typewriter lines | ✓ prefixes | removed (green styling already signals success) |
| Server-generated notification text | "🎉 Deal won" | plain text |
| Toast messages | ✅ Email sent… 🎉 Won at… | plain text |

Zero emojis remain in `src/`.

## 3. All 21 lint errors fixed (were pre-existing)

The React-compiler-era rules flagged 21 errors across landing/dashboard components.
All fixed: `AuthRightPanel`, `DiscoverRow`, `IntelDrawer` (also killed its `any` types with a
real `IntelData` interface), `AnimatedDashboard`, `Hero`, `HowItWorks` ×5, `Testimonials`,
`sparkles`. Pattern: state resets deferred out of synchronous effect bodies; random particle
generation kept out of render.

**Current status: typecheck ✅ · lint 0 errors ✅ · build ✅ (33 routes) · tests 21/21 ✅**

---

## 4. AUTOMATION — the honest truth table

### Email — YES, fully automated ✅
One click on "Launch Campaign" really does: generate pitch → save to DB → **send real email
from your own mailbox** → mark sent/failed → auto-create deal → notify feed. The recipient
gets a normal email in their inbox from your address.

**How a user connects their email (both already built, Settings page):**
1. **Gmail (recommended):** Settings → Connect Gmail → Google consent screen → done. Tokens
   auto-refresh; mail sends via Gmail API.
   - *Catch:* while the Google app is in "Testing" mode, only whitelisted test users can
     connect (see §5).
2. **Any other mailbox:** Settings → SMTP form → host/port/username/app-password. Works with
   Outlook, Zoho, iCloud, cPanel mail, anything. No approval needed.

### WhatsApp / LinkedIn / Instagram — semi-automated ⚠️
Today they are **one-click assisted**: the app generates the message, opens `wa.me/<phone>`
(or LinkedIn/IG profile) with text pre-filled/copied — you press send. **No platform allows
apps to silently DM strangers**: LinkedIn & Instagram have no sanctioned outbound-DM APIs,
and WhatsApp requires their official Business API. Anything claiming otherwise gets accounts
banned. This is an industry constraint, not a missing feature.

**To make WhatsApp truly zero-touch** (the one channel where it's officially possible):
you need Meta's **WhatsApp Business Cloud API**:
1. Create a Meta developer account → create a Business app
2. WhatsApp product → add a phone number (not your personal WA number) + verify
3. Business verification in Meta Business Manager
4. Submit **message templates** for approval (business-initiated messages must be templated)
5. Give me: `WHATSAPP_TOKEN` (permanent system-user token) + `WHATSAPP_PHONE_NUMBER_ID`
6. I build: template-based sender wired into the outreach engine (≈ half a day of work once
   you have the credentials)

### Reply detection (who responded?) — roadmap
Currently you mark replies manually in the deals pipeline. True inbound automation needs
a Gmail webhook/watch (Pub/Sub) or IMAP idle loop — designed, not built. Say the word and
it becomes the next upgrade.

---

## 5. WHAT I NEED FROM YOU

| Item | Why | How to get it | Urgency |
|---|---|---|---|
| **Nothing right now** | Everything above is already working with current env | — | — |
| Google OAuth: add test users | Gmail connect 403s for anyone not whitelisted while app is in Testing | console.cloud.google.com → APIs & Services → OAuth consent screen → Test users → add your gmail + any beta tester's gmail | Only if others will use Gmail connect |
| Google OAuth: Production verification | Removes the test-user wall permanently | Same console → Publish app → Google reviews (privacy policy URL + optional security assessment for `gmail.send`) | Later — SMTP covers everyone meanwhile |
| Meta WABA (optional) | Zero-touch WhatsApp sending | Steps 1–5 in §4 above → hand me token + phone-number-id | Optional feature decision |
| Fresh Groq keys if these die | Keys themselves verified working today | console.groq.com → API Keys → Create API Key (free tier, no card). Paste into `.env.local` as GROQ_API_KEY_1..4 + FALLBACK | Only when rate-limited/expired |

### Quick key-recreation cheat-sheet (since you forgot)
- **Groq:** console.groq.com → sign in → left sidebar *API Keys* → *Create API Key* → copy
  (shown once). Free tier gives generous per-minute limits; multiple keys = rotation headroom.
- **Google OAuth (email sign-in + Gmail send):** console.cloud.google.com → new project →
  *OAuth consent screen* (External) → *Credentials* → *Create OAuth Client ID* (Web app) →
  authorized redirect URI must exactly match `NEXTAUTH_URL + /api/auth/callback/google`.
  Download the client ID/secret into `.env.local` as `GOOGLE_CLIENT_ID/SECRET`.
  Enable *Google+ API* isn't needed; enable *Gmail API* in Library.
- **SMTP (fastest path):** don't create anything — use your existing mailbox. For Gmail
  specifically: myaccount.google.com → Security → 2FA on → *App passwords* → generate →
  paste into Settings → SMTP (host smtp.gmail.com, port 587).

---

## 6. Remaining known limitations (documented, deliberate)
- Lookalike search & bulk queue/tag remain stubs by design (need proper query design — fakes erode trust)
- Rate limiting needs Redis to mean anything on serverless
- CSP ships Report-Only until nonce plumbing lands (see next.config.ts comments)

---

## 7. v3 ADDENDUM — Agentic AI, RAG, WhatsApp & Gmail answers

### 7.1 "Can I send from my own personal WhatsApp?" — the honest engineering answer
**No API exists for personal WhatsApp. Period.** Meta's official sending APIs require a
WhatsApp Business Platform (Cloud API) number — your personal number cannot be automated by
ANY app without breaking WhatsApp's terms via unofficial bridges (whatsapp-web.js style QR
session hijacking), which gets numbers banned — sometimes permanently, and often exactly when
your pipeline is full of clients. I will not ship that as a default: it puts YOUR number at
risk and dies randomly in production.

**What I built instead — the Send Queue (shipped):** campaigns now emit ready-to-fire deep
links for every non-email channel. After Launch, a queue panel appears: each lead shows
channel + Copy message + Open. One tap opens `wa.me` (or LinkedIn/Instagram) with your text
pre-filled; you press its send button. It is the fastest legally-possible flow on a personal
number — a 20-lead WhatsApp run takes ~2 minutes instead of copy-pasting per client.

**If you later want true zero-touch:** get Meta's free WhatsApp Business Cloud API
(steps in §4) — it can even be linked to the WhatsApp Business APP on your phone, but the
API number must be separate from your personal one.

### 7.2 Agentic AI + RAG — YES, and now actually built

**Agentic observation (`lib/research.ts`, wired into both pitch pipelines):**
The pitch system was already multi-agent (Researcher → Copywriter → Critic → Perfecter) but
the Researcher only saw scraped metadata — it guessed. Now **Agent 0 performs live tool use**:
it fetches the business's real website moments before writing (timeout-capped, size-capped,
non-throwing), extracts title tag / meta / headings / tech stack / SSL state / social links /
homepage text, and feeds those facts into every downstream prompt. The result: hooks like
"your homepage still says Coming Soon" instead of generic flattery. A dead site is itself
surfaced as the outreach angle.

**RAG — Pitch Memory (`lib/memory.ts`):**
Every past pitch that produced a REPLY or a WIN is now retrievable context. Before generating,
the system scores your history by industry match + shared gaps + outcome weight
(won=3 > replied=2.4 > sent=0.6) and injects the top examples into the prompt:
"this pitch CLOSED THIS DEAL — match its voice, don't copy". Your wins compound; the model
learns your winning voice per-industry over time. No vector DB needed — categorical scoring
is the right retrieval here and runs on the existing Mongo.

Both features are unit-tested (`tests/research.test.ts`, `tests/memory.test.ts`) — suite now
32/32 green.

### 7.3 Gmail connection blocked — exact fix (2 minutes, needs your Google login)
What happened: your Google Cloud app is in **Testing** publishing mode, and `gmail.send` is a
restricted scope — Google silently blocks any account not whitelisted as a test user.
The app also never showed you why (fixed: the Pitches page now renders an actionable banner
with the fix steps whenever Google denies).

Your fix, click by click:
1. Open console.cloud.google.com (sign in with the Google account that owns the OAuth keys)
2. Top bar → select the project tied to your `GOOGLE_CLIENT_ID`
3. Left menu → **APIs & Services → OAuth consent screen**
4. If it shows "Publishing status: Testing" → find **Test users** → **+ Add users**
5. Add the Gmail address you're connecting → Save
6. Back in FreelanceOS → Settings → Connect Gmail again → it will pass

Also verify **Gmail API** is enabled: APIs & Services → Library → search "Gmail API" → Enable.
For other people to connect without whitelisting, you'd publish the app to Production
(requires verification); until then SMTP works for everyone with zero approval.

### 7.4 Premium product polish — what "premium" means here
Done this pass: consistent SVG iconography everywhere (zero emoji), actionable error states,
live-data dashboard, follow-up triage badges, CSV export, campaign send-queue, grounded AI
copy. The landing page sections were left untouched per your earlier instruction to keep the
current frontend; if you want a dedicated premium pass on typography/spacing/motion of the
marketing site, say so explicitly and it becomes its own focused task.

---

## 8. v4 ADDENDUM — the bugs you hit, root-caused and fixed

### 8.1 "Access blocked / 403 access_denied" on Gmail connect
**What it is:** Google's rule, not a bug in the app. Your Google Cloud app is in *Testing*
publishing status, and `gmail.send` is a RESTRICTED scope — Google refuses every account not
explicitly whitelisted as a test user. Completing full Google verification (needed for
arbitrary users) requires a privacy policy, domain ownership, and for `gmail.send` an annual
CASA security assessment (~$500–$40k/yr depending on tier). No code can skip this.

**Your three real options:**
1. **SMTP everywhere (RECOMMENDED, works today):** any mailbox, no Google involvement.
   The product now promotes SMTP first: Settings has provider presets (Gmail app-password,
   Outlook, Zoho, Yahoo, Brevo…), the Pitches banner and SendModal offer
   "Set up SMTP (instant)" as the primary CTA with Gmail OAuth demoted to secondary.
2. **Add yourself (+ any early users) as test users** — fine while it's just you/testing.
3. **Publish to Production + complete verification** — the long-term path if Gmail one-click
   becomes a hard requirement; budget months + assessment cost.

Also shipped: the OAuth failure now lands back with a clear actionable banner (it used to
fail silently), including the exact console path.

### 8.2 "Gmail does not exist" when sending — fake emails root-caused
Discovery's Layer-6 used to fabricate `info@{domain}` for EVERY lead with a website. Those
guessed addresses bounce ("address does not exist") and made sends look broken.

Fixed end-to-end:
- Guessing now requires the domain to have a **live MX record** (`dns.resolveMx`) — domains
  that can't receive mail get NO email at all
- New `emailConfidence` field ('confirmed' | 'guessed') persists on Client and flows through
  `/api/clients` → Outreach → SendModal
- Campaigns **never auto-send guessed addresses**: they land in the send queue flagged
  "unverified guess — confirm before sending", with a pre-flight warning showing how many
  selected leads have guessed emails

### 8.3 WhatsApp never opening / LinkedIn half-copied — two browser realities
1. **Popup blocking:** `window.open()` called after `await fetch(...)` is outside Chrome's
   user-gesture window → silently blocked → "nothing opened". Fixed with the claim-and-
   navigate pattern: the tab is claimed synchronously inside your click, then navigated when
   the URL is ready, with a plain-link fallback if even that is blocked.
2. **Silent clipboard failure:** `navigator.clipboard.writeText` fails without error when the
   page loses focus or permission is denied — the old code swallowed it and toasted success
   anyway ("half-copied" was often zero-copied). Fixed with `copyText()`: async API →
   execCommand fallback → explicit Copied/Failed state + always-visible message box so manual
   copy is guaranteed possible. Success toasts now only fire when the copy verifiably landed.

Plus: SendModal email is enabled for SMTP-only users (a gmail-only status check used to
disable it wrongly — new unified `/api/email/status` powers both the banner and the modal),
and disconnect is transport-aware.

The campaign send queue gained an "Open next → business" walkthrough button that advances
through every handoff in order.

### 8.4 Where is the agentic AI / RAG? It's live — now visible too
- `/api/pitch` returns `agent: { grounded, memoryHits, stages }`; Discover renders chips on
  each generated pitch: **LIVE-SITE GROUNDED** (researcher fetched the actual website) and
  **MEMORY ×N** (built using N of your past pitches that replied/won)
- Memory compounds automatically: move deals to Replied/Won and later pitches retrieve them
  as few-shot examples weighted by outcome

### 8.5 Remaining honest constraints
- Silent WhatsApp sending from a personal number: impossible without Meta Business API (§7.1)
- Arbitrary-user Gmail one-click: impossible until Google verification completes (§8.1)

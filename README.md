<h1 align="center">FreelanceOS</h1>

<p align="center">
  <strong>The all-in-one operating system for freelancers.</strong><br/>
  Find clients · Generate AI pitches · Run outreach · Track deals — from one dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## What is FreelanceOS?

Cold outreach is four tools and a spreadsheet. FreelanceOS is one app: search a city and a
business type, see which of those businesses have no website / no social presence / no video,
generate a pitch aimed at that specific gap, send it, and track what came back.

| Module | Status | What it does |
|---|---|---|
| **Client Discovery** — `/discover` | Working | Scrapes real businesses by type + location, detects gaps, scores opportunity, caches results for 30 days |
| **Lead Intel** — `/discover` drawer | Working | Per-lead AI brief: why this lead, service match, complexity, pitch angle, icebreaker |
| **AI Pitch Engine** — `/pitches` | Working | Four chained Groq calls — research, draft, critique, final — saved as a `draft` you can then send |
| **Outreach** — `/outreach` | Working | Email sends for real via Gmail **or** your own SMTP server; LinkedIn, Instagram and WhatsApp generate the message + a deep link to paste |
| **Deal Tracker** — `/deals` | CRUD only | Pipeline `pitched → responded → meeting → proposal → won / lost` |
| **Clients** — `/clients` | Working | Saved leads with status |
| **Notifications** | Schema only | `Notification` model exists; no page or API yet |
| **Settings** — `/settings` | Email only | Connect Gmail or your own SMTP server. Profile, pricing and plan tabs are not built |
| **Stripe escrow** | Not started | No Stripe code and no escrow fields on the `Deal` schema yet |

> **Honest note on outreach.** Email is the only channel that actually sends, through one of
> two transports — the Gmail API, or any SMTP server you own. LinkedIn, Instagram and WhatsApp
> return the composed message plus a `wa.me` / profile URL for you to paste, deliberately:
> automating DMs on those platforms violates their terms and gets accounts banned.
>
> **Why there are two email transports.** `gmail.send` is one of Google's *restricted* scopes.
> While your OAuth app's publishing status is *Testing*, only accounts you add by hand to the
> test-user list can connect a mailbox — everyone else gets `403 access_denied` on connect even
> though sign-in works fine, because sign-in asks only for the non-sensitive scopes. Getting to
> Production means OAuth verification **plus an annual paid third-party CASA security
> assessment**. That is not a workable requirement for a self-hosted app, so SMTP exists as a
> first-class equal: a user pastes the host, port and an app-specific password for a mailbox
> they already own, and sending works immediately with nobody's approval. See
> [Email sending](#email-sending).

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5, `strict` |
| UI | React 19, Tailwind CSS 4, Framer Motion, Radix primitives, Lenis smooth scroll |
| Database | MongoDB + Mongoose 9 |
| Auth | NextAuth v5 (Auth.js) — Google, GitHub, email + password |
| Sessions | JWT. **No database adapter** — see [Auth](#auth) |
| AI | Groq SDK, `llama-3.3-70b-versatile` |
| Email | Gmail API via user OAuth, **or** user-supplied SMTP over a hand-rolled `node:net`/`node:tls` client |
| Scraping | Apify, Google Places, plus a fallback chain of SERP/scrape providers |

---

## Project structure

```
src/
├── proxy.ts                    # Route protection. Next 16 renamed middleware.ts → proxy.ts
├── auth.ts                     # Full NextAuth config — Node runtime, touches Mongoose
├── auth.config.ts              # Edge-safe subset. Imported by proxy.ts. NEVER import Mongoose here
├── app/
│   ├── (auth)/                 # login, signup
│   ├── (dashboard)/            # dashboard, discover, clients, pitches, outreach, deals, settings
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── auth/register/      # Email + password signup
│   │   ├── discover/           # Business scraping + gap detection + cache
│   │   ├── intel/              # Per-lead AI brief
│   │   ├── clients/            # Saved-client CRUD
│   │   ├── pitch/  pitches/    # Generation + history
│   │   ├── outreach/           # email (Gmail or SMTP) · batch · linkedin · instagram · whatsapp
│   │   ├── gmail/              # OAuth connect / callback / status / disconnect
│   │   ├── settings/smtp/      # Bring-your-own SMTP credentials — verify, store, forget
│   │   ├── deals/              # Deal CRUD
│   │   └── stats/              # Dashboard counters
│   └── globals.css
├── components/
│   ├── layout/                 # Navbar, Footer, Sidebar
│   ├── sections/               # Landing page
│   ├── discover/               # DiscoverRow, IntelDrawer
│   ├── pitches/                # PitchPreviewPanel, SendModal
│   └── ui/
└── lib/
    ├── db.ts                   # Cached Mongoose connection, strictQuery: 'throw'
    ├── models/                 # User · Client · Pitch · Deal · Notification · DiscoverCache
    ├── encryption.ts           # AES-256-GCM for stored OAuth tokens and SMTP passwords
    ├── mailer.ts               # Picks the transport — Gmail if connected, else the user's SMTP
    ├── gmail.ts                # Gmail send + token refresh + MIME building + header hygiene
    ├── smtp.ts                 # SMTP submission client on node:net / node:tls. No dependencies
    ├── groq.ts                 # GROQ_MODEL — one place to change when Groq retires a model
    ├── sanitize.ts             # Request-body field whitelists
    └── utils.ts
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB cluster (Atlas or local)
- A Google Cloud OAuth client (used for both sign-in and Gmail sending)
- A Groq API key

### Install

```bash
git clone https://github.com/Zakuroooo/FreelanceOS.git
cd FreelanceOS
npm install
cp .env.example .env.local   # then fill it in — see below
npm run dev
```

Open <http://localhost:3000>.

### Scripts

```bash
npm run dev         # Turbopack dev server
npm run build       # production build
npm run start       # serve the build
npm run typecheck   # tsc --noEmit — must be 0 errors
npm run lint        # eslint
```

---

## Environment variables

Create `.env.local` in the project root. **It is gitignored — never commit it.**

### Required — the app will not run without these

```env
# MongoDB connection string
MONGODB_URI=

# NextAuth. Generate the secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth — sign-in AND Gmail sending both use this client
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Groq. At least one key is required; the pitch and intel routes rotate through
# them in order and fall through to the next on rate-limit or failure.
GROQ_API_KEY_1=
GROQ_API_KEY_2=
GROQ_API_KEY_3=
GROQ_API_KEY_4=
GROQ_API_KEY_FALLBACK=

# Optional. Overrides the hosted Groq chat model, centralised in src/lib/groq.ts.
# Groq retires models on its own schedule; when that happens every AI route starts
# returning 404 model_not_found. Set this instead of editing code. To list the
# models your key can actually reach:
#   curl -s https://api.groq.com/openai/v1/models \
#     -H "Authorization: Bearer $GROQ_API_KEY_1" | jq -r '.data[].id'
GROQ_MODEL=

# Encrypts stored Gmail refresh tokens and SMTP passwords at rest (AES-256-GCM).
# Must be exactly 64 hex characters = 32 bytes. Generate with:
#   openssl rand -hex 32
# Rotating this orphans every already-connected mailbox — Gmail and SMTP alike.
TOKEN_ENCRYPTION_KEY=
```

### Required for Gmail sending

Only if you want the Gmail transport. SMTP needs nothing here — the user supplies their own
server at `/settings`. See [Email sending](#email-sending).

```env
# Must match a redirect URI registered on the Google OAuth client, exactly
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback

# Where the Gmail callback redirects back to. Defaults to http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional — GitHub sign-in

```env
GITHUB_ID=
GITHUB_SECRET=
```

### Optional — client discovery providers

Discovery degrades instead of failing. With none of these set, `/discover` returns nothing;
each key you add improves coverage and enrichment. `APIFY_API_TOKEN` or
`GOOGLE_PLACES_API_KEY` is what actually finds businesses — the rest enrich them (find the
website, the email, the socials).

```env
APIFY_API_TOKEN=
GOOGLE_PLACES_API_KEY=

# Enrichment fallback chain, tried in roughly this order
SERPER_API_KEY=
SERPAPI_KEY=
GOOGLE_CSE_KEY=
GOOGLE_CSE_ID=
SCALESERP_KEY=
VALUESERP_KEY=
SERPSTACK_KEY=
SCRAPINGBEE_KEY=
SCRAPINGANT_KEY=
ZENROWS_KEY=
```

### Optional — n8n

```env
# Fired on signup, non-blocking. Unset = silently skipped.
N8N_SIGNUP_WEBHOOK_URL=
```

### Not yet used

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `RESEND_API_KEY` appeared in earlier
versions of this file. There is no Stripe or Resend code in the app today — leave them out
until those modules land.

---

## Email sending

Outreach needs a mailbox. There are two ways to give it one, and **SMTP is the one that works
for everybody** — connect either at `/settings`.

### Option 1 — your own SMTP server (no approval needed)

Works with any mailbox you already own: Gmail, Outlook, Zoho, Fastmail, your own domain, or a
sending service like Brevo / Mailgun / SendGrid. `/settings` has presets for the common ones so
you only type the username and password.

Almost every provider with two-factor auth wants an **app-specific password** here, not your
account password. Generate one in your mail provider's security settings.

| Provider | Host | Port |
|---|---|---|
| Gmail / Workspace | `smtp.gmail.com` | 465 |
| Outlook / Hotmail | `smtp-mail.outlook.com` | 587 |
| Zoho | `smtp.zoho.com` | 465 |
| Brevo | `smtp-relay.brevo.com` | 587 |
| SendGrid | `smtp.sendgrid.net` | 587 (user is literally `apikey`) |

Saving runs a real connection first — DNS, TCP, TLS, `EHLO`, `AUTH` — against the server you
named, and **nothing is written unless that succeeds**. A wrong password stored silently would
not surface until the middle of a batch run, as a string of per-lead failures with no obvious
common cause. The password is encrypted with `TOKEN_ENCRYPTION_KEY` before it is stored and is
never returned by the API.

`src/lib/smtp.ts` is a submission client written directly on Node's `node:net` and `node:tls` —
no `nodemailer`, no dependency. It does STARTTLS on 587 and implicit TLS on 465, `AUTH LOGIN`
and `AUTH PLAIN`, dot-stuffing per RFC 5321 §4.5.2, and base64 transfer-encoding so that a
long LLM-generated paragraph cannot breach the 1000-octet line limit. It **refuses to send
credentials over a connection with no STARTTLS** rather than quietly downgrading.

### Option 2 — Gmail API (one click, but gated by Google)

Nicer to set up — an OAuth click and no passwords — but `gmail.send` is a **restricted**
scope, so Google gates it:

- While your OAuth app's publishing status is **Testing**, only accounts you add by hand under
  **Test users** (100 max) can connect. Everyone else gets `403 access_denied` on connect while
  sign-in keeps working, because sign-in only asks for the non-sensitive `openid email profile`
  scopes through the same client.
- Reaching **Production** requires OAuth verification **plus an annual, paid, third-party CASA
  security assessment**. That is a real recurring cost, and it is why this app does not treat
  Gmail as the only path.

If Gmail is connected it wins over SMTP, so behaviour is unchanged for anyone already sending
that way. If its refresh token dies, `src/lib/mailer.ts` falls through to SMTP rather than
failing the send.

### Google Cloud setup

Only needed for sign-in (and for Gmail sending if you want option 2). Both run through one
OAuth client, so both redirect URIs must be registered on it.

1. **APIs & Services → Credentials → Create OAuth client ID → Web application**
2. **Authorized redirect URIs** — add both:
   - `http://localhost:3000/api/auth/callback/google` (sign-in)
   - `http://localhost:3000/api/gmail/callback` (Gmail send)
3. **Enable the Gmail API** under APIs & Services → Library — only if you want option 2.
4. **OAuth consent screen** → add `https://www.googleapis.com/auth/gmail.send` — again, only
   for option 2. Sign-in does not need it, and adding it does not restrict sign-in.
5. In production, add the same two paths under your real domain and set `NEXTAUTH_URL`,
   `GMAIL_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` to match.

A `redirect_uri_mismatch` error means the URI in the request differs from the registered one
by *something* — scheme, port, trailing slash, `localhost` vs `127.0.0.1`. They must match
byte for byte.

---

## Auth

Sessions are **JWT**, and there is deliberately **no** `@auth/mongodb-adapter`.

The adapter opened a second, independent MongoClient pool against the same database Mongoose
was already connected to, and it was never cached across serverless invocations — so every
request dialled a fresh connection. Worse, an adapter plus a `credentials` provider is a
combination NextAuth v5 does not support cleanly, which is what broke Google sign-in.

Instead, `src/auth.ts` upserts the user itself in the `jwt` callback and puts `id` and `role`
on the token. One Mongoose pool, one code path.

Two other things worth knowing:

- **`signIn` rejects unverified Google emails.** An unverified address can be a
  not-yet-owned one, and accepting it lets someone claim an account by email alone.
- **The split config is load-bearing.** `src/proxy.ts` runs on the Edge runtime and may only
  import `@/auth.config`, which has `providers: []` and no database code. `@/auth` — which
  imports Mongoose — must only ever be imported from API routes. Importing it into
  `auth.config.ts` or `proxy.ts` will break the Edge bundle.

Protected route prefixes live in `src/proxy.ts`. Anything else is public.

---

## Security

### Response headers

Set in [`next.config.ts`](next.config.ts) for every route:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb, interest-cohort all denied |
| `Strict-Transport-Security` | 2 years, `includeSubDomains; preload` — **production only** |
| `Content-Security-Policy-Report-Only` | see below |
| `Cache-Control` | `no-store, max-age=0` on `/api/*` |

`X-Powered-By` is off.

### The CSP ships in Report-Only mode — how to promote it

The policy is served as **`Content-Security-Policy-Report-Only`**, which means the browser
logs violations to the console and blocks nothing. That is intentional: an enforcing CSP that
is even slightly wrong takes the app down, and this one has not been exercised against a real
browser session yet.

To turn it on:

1. Run the app and click through, at minimum: sign-in (both Google and email), `/discover`
   with a real search, the intel drawer, `/pitches` generation, `/deals`, and a Gmail send.
2. Watch the browser console for `Report Only` violation messages.
3. Add whatever legitimate host they name to the matching directive in `CSP_DIRECTIVES`.
4. When a full pass is silent, rename the header in `securityHeaders`:

   ```diff
   - { key: 'Content-Security-Policy-Report-Only', value: CSP_DIRECTIVES },
   + { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
   ```

5. Repeat the click-through once enforcing, because a blocked request can fail differently
   from a reported one.

Two directives are loose on purpose and will stay that way for now:

- **`style-src 'unsafe-inline'`** — the UI is built almost entirely from React inline `style`
  props. Removing it means rewriting the frontend.
- **`script-src 'unsafe-inline'`** — Next streams the RSC payload through inline `<script>`
  tags. Tightening it needs a per-request nonce plumbed through `src/proxy.ts`.

`'unsafe-eval'` is added in development only; Turbopack requires it.

### Data handling

- **Gmail refresh tokens and SMTP passwords are encrypted at rest** with AES-256-GCM, stored as
  `v2:<iv>:<tag>:<ciphertext>`. GCM is authenticated, so tampering fails to decrypt rather
  than silently returning garbage. Ciphertexts written by the older CBC scheme still *read*,
  for migration; nothing writes CBC any more.
- **The SMTP host is validated before a socket opens.** The server performs a DNS lookup and a
  TCP connect to whatever hostname the request names, which is an SSRF primitive if left
  unconstrained. The value must be hostname-shaped — no scheme, port, path or credentials — and
  `localhost`, `*.localhost`, `*.internal` and `*.local` are rejected outright, because on a
  hosted deployment those resolve to something reachable from inside the network. The port is
  whitelisted to 25 / 465 / 587 / 2525.
- **Every write route whitelists fields.** Routes used to spread `...body` into
  `Model.create()` after the trusted fields, so a request could send
  `{"userId": "<someone else>"}` and win. `lib/sanitize.ts` copies only named keys, and drops
  any key starting with `$` or containing `.` so a body cannot smuggle a Mongo operator.
- **Every read and write is scoped to the session user** — `{ _id: id, userId: session.user.id }`,
  not `findById(id)`.
- **`strictQuery` is set to `'throw'`.** Mongoose used to drop filter keys that were not in
  the schema, which is how `Pitch.countDocuments({ status: 'sent' })` — the field is
  `overallStatus` — matched every document and made the dashboard read `0`. It now throws.
- **Outbound email headers are sanitized.** Subject and recipient go through CR/LF stripping
  and RFC 2047 encoding, so a pitch subject cannot inject extra headers.
- **n8n webhooks are fire-and-forget.** Never awaited in a request path.

---

## API routes

Everything except `/api/auth/*` requires a session and returns `401` without one.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Email + password signup |
| — | `/api/auth/[...nextauth]` | NextAuth handler (sign-in, callbacks, session) |
| `GET` `POST` `DELETE` | `/api/clients` | Saved clients |
| `POST` | `/api/discover` | Search businesses, detect gaps, score, cache |
| `POST` | `/api/intel` | AI brief for one lead |
| `POST` | `/api/pitch` | Generate a pitch (4 chained model calls) and save it as a `draft` |
| `GET` `POST` | `/api/pitches` | History (paginated, `?limit=` max 100) / create |
| `GET` `PATCH` `DELETE` | `/api/pitches/[id]` | Single pitch |
| `POST` | `/api/outreach/email` | Send through whichever transport the user has connected |
| `POST` | `/api/outreach/batch` | Streamed multi-send (SSE progress) |
| `POST` | `/api/outreach/linkedin` | Compose message + profile URL to paste |
| `POST` | `/api/outreach/instagram` | Compose DM + profile URL to paste |
| `POST` | `/api/outreach/whatsapp` | Compose message + `wa.me` link |
| `GET` | `/api/gmail/connect` | Begin Gmail OAuth |
| `GET` | `/api/gmail/callback` | Gmail OAuth callback |
| `GET` | `/api/gmail/status` | Is Gmail connected, and as which address |
| `DELETE` | `/api/gmail/disconnect` | Revoke and delete stored tokens |
| `GET` | `/api/settings/smtp` | Is SMTP configured, and as what. Never returns the password |
| `POST` | `/api/settings/smtp` | Verify credentials against the live server, then store them encrypted |
| `DELETE` | `/api/settings/smtp` | Forget the stored credentials |
| `GET` `POST` | `/api/deals` | List / create |
| `PATCH` `DELETE` | `/api/deals/[id]` | Update / delete |
| `GET` | `/api/stats` | Dashboard counters |

---

## Data models

`src/lib/models/` — all six export a typed `mongoose.Model<I…>`, which is what keeps
`.lean()` results from collapsing to `any`.

| Model | Notes |
|---|---|
| `User` | Credentials + OAuth identity, role, plan, encrypted `gmailOAuth` sub-document, encrypted `smtp` sub-document |
| `Client` | A saved lead. Indexed `{ userId, createdAt }` |
| `Pitch` | Per-channel bodies, `overallStatus`, `sentChannels.*`. Indexed `{ userId, overallStatus, createdAt }` |
| `Deal` | `stage`, price, deadline. No escrow fields yet |
| `Notification` | Schema only — nothing writes to it yet |
| `DiscoverCache` | Shared scrape cache. `placeId` unique, 30-day TTL on `updatedAt`. Holds **no per-user state** — lead state is merged client-side |

`User.email` intentionally has **no** `lowercase: true` setter. Mongoose applies string
setters to query *filters* as well as writes, which would silently defeat the mixed-case
fallback lookup in `src/auth.ts`.

Both credential sub-documents on `User` — `gmailOAuth` and `smtp` — declare every field
optional and are validated in their routes instead. Mongoose materialises a nested path as
`{}` whether or not anything was ever written to it, so presence is always tested on a leaf
field (`smtp.host`, `gmailOAuth.accessToken`) and never on the object.

Two routes write `Pitch` documents, and they differ in coverage:

- **`/api/pitch`** — one lead, four chained model calls, **email only**. Regenerating for
  the same lead updates that lead's existing `draft` rather than adding another row; a
  pitch that has already been sent is never overwritten, because its `sentChannels` record
  what the recipient actually received.
- **`/api/outreach/batch`** — many leads, one call each, **all four channel bodies**, and
  it sends as it goes.

---

## Design system

The frontend is hand-built and is the source of truth for its own styling — the tokens below
describe what is in the code, they are not a spec to conform it to.

- **Accent** — crimson: `#C41425` primary, `#E5484D` lighter/hover, `#C30101` deep
- **Background** — `#060608`; surfaces `#0F0F14`, `#0A0A0F`, `#0D0D12`
- **Success** — `#00C9A7`
- **Type** — Inter for UI, JetBrains Mono for code and terminal panels
- **Motion** — Framer Motion for scroll and entrance; CSS `@keyframes` for marquees, glow
  pulses, shimmer and floats; Lenis for smooth scrolling

---

## Roadmap

- [x] Landing page
- [x] Auth — Google, GitHub, email + password
- [x] Dashboard layout + real stats
- [x] Client discovery + gap detection + 30-day cache
- [x] Lead intel drawer
- [x] Pitch generation
- [x] Gmail OAuth + sending, batch send with live progress
- [x] Bring-your-own SMTP — so sending is not gated by Google's restricted-scope review
- [x] LinkedIn / Instagram / WhatsApp compose + deep link
- [x] Deal tracker (CRUD)
- [x] Token encryption at rest, security headers, request-body whitelists
- [ ] Notifications — page + API over the existing model
- [x] Settings — email transports
- [ ] Settings — profile, pricing, plan
- [ ] Stripe escrow — needs escrow fields on `Deal` first
- [ ] Enforcing CSP (currently Report-Only)
- [ ] Production deployment

---

## Contributing

`npm run typecheck` must report 0 errors before a PR. For anything large, open an issue first.

---

## License

[MIT](LICENSE)

---

<p align="center">Made with too much caffeine · <strong>FreelanceOS</strong></p>

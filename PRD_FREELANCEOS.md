# FreelanceOS — Product Requirements Document (PRD)
# Version 1.0 | Read this before writing any code

---

## PROJECT OVERVIEW

**Name:** FreelanceOS  
**Tagline:** "Your entire freelance business, on autopilot."  
**Type:** SaaS web app — B2C, freelancer-focused  
**Reference:** pitchsnap.me (same stack, same design DNA, red accent)  
**Developer:** Pranay Sarkar — github.com/Zakuroooo  
**Target deploy:** Vercel + custom domain  

---

## WHAT IT DOES

FreelanceOS is a complete freelancer operating system.  
PitchSnap = pitch writer (manual). FreelanceOS = entire automated business.

Full user flow:
1. Freelancer selects role (Web Dev, Video Creator, Designer, etc.)
2. Searches "dentists in Los Angeles" → gets real scraped business listings
3. System detects client gaps (no website / no social / no video)
4. AI generates personalised pitch based on role + detected gap
5. Pitch auto-sends via Email + LinkedIn DM + Instagram DM
6. Freelancer gets notified when client replies
7. Deal created → client pays into Stripe escrow
8. Freelancer delivers → client confirms → funds released minus commission
9. Platform takes 8% commission automatically

---

## WHO IT'S FOR

Primary: Freelance developers, video creators, designers, copywriters,
social media managers — anyone actively looking for clients.

Secondary: Small freelance agencies managing multiple clients.

Pain points solved:
- Hours wasted manually searching for potential clients
- Generic pitches that get ignored
- No automated follow-up system
- Getting scammed after delivering work (escrow solves this)
- No single tool that handles the full outreach-to-payment pipeline

---

## SUCCESS CRITERIA

- Freelancer can find 20+ real clients in their city in under 30 seconds
- AI generates complete pitch package in under 10 seconds
- Pitch auto-sends across 3 channels without manual copy-paste
- Freelancer gets notified within 60 seconds of a client reply
- Deal escrow prevents payment fraud on both sides
- Platform runs at 60fps with zero jitter on M2 Mac 8GB RAM
- npm run build passes with 0 errors before deploy
- Mobile responsive at 375px, 768px, 1024px, 1440px

---

## SIX MODULES — COMPLETE SPEC

### MODULE 1 — Client Discovery
**Page:** /discover  
**What it does:**
- Search bar: "business type" + "location" inputs
- On search: triggers Apify Web Scraper actor
- Returns real business listings with: name, industry, location,
  website URL, email, phone, LinkedIn, Instagram handles
- Gap detection on each result:
  - NO WEBSITE badge: HEAD request to URL returns error or no URL found
  - NO SOCIAL badge: no LinkedIn or Instagram handle found
  - NO VIDEO badge: no YouTube or video content detected
- User can star/save any client to their personal list
- Manual paste section: user pastes raw text from Manta or Google Maps
  → AI parses it into structured client record automatically
- Saved clients tab: full list with status tracking per client
- Filter by: industry, location, gap type, status

**Client statuses:** discovered → saved → pitched → replied → deal → closed

### MODULE 2 — AI Pitch Engine (extended from PitchSnap)
**Page:** /pitches  
**What it does:**
- Reuses lib/groq.ts from PitchSnap — extend, do NOT rewrite
- Auto pre-fills form from saved client data
- Role-aware: freelancer's selected role drives pitch tone + offering
- Tone selector: Professional / Friendly / Bold
- Outputs generated:
  1. Cold Email (subject + body, max 150 words)
  2. LinkedIn DM (max 80 words, conversational)
  3. Instagram DM (max 60 words, casual)
  4. WhatsApp message (max 50 words, direct)
  5. Full Proposal (400 words, scope + timeline + pricing)
  6. "Why this client needs you" (2 sentences, gap explanation)
  7. Quality Score (0-100% conversion probability, third Groq call)
- Edit mode: user can tweak any output before approving
- One-click "Approve & Queue" → sends to outreach queue

**Groq pipeline (same as PitchSnap dual pipeline):**
- Call 1: Generate all outputs
- Call 2: Self-correct and improve
- Call 3: Score conversion probability 0-100%

### MODULE 3 — Outreach Engine
**Page:** /outreach  
**What it does:**
- Queue table showing all approved pitches pending send
- Auto-sends on approval via n8n webhooks:
  - Email via Resend API
  - LinkedIn DM via LinkedIn Messaging API
  - Instagram DM via Meta Graph API
- Per-channel status badges: Queued / Sent / Delivered / Replied
- Daily send limit: 50 outreaches/day (anti-spam protection)
- Send window: configurable hours (e.g. 9am–5pm only)
- Full outreach log with timestamps per channel
- Pause/resume queue option

### MODULE 4 — Notifications + CRM
**Page:** /notifications  
**What it does:**
- Notification bell in sidebar with unread count badge
- Notifications page: all reply alerts, deal updates, reminders
- When client replies: n8n webhook fires → notification created in DB
- Each notification links to client record + full outreach thread
- Follow-up reminder: if no reply in 5 days → suggest follow-up
- Mark as read, delete, snooze options
- Reminder system: configurable follow-up intervals

### MODULE 5 — Deals + Escrow
**Page:** /deals  
**What it does:**
- Create Deal: title, scope description, price, deadline, client
- Deal status pipeline (visible on card):
  Proposed → Funded → In Progress → Delivered → Paid → Closed
- On deal creation: Stripe PaymentIntent created
  (capture_method: 'manual') — holds funds in escrow
- System generates Stripe payment link → sends to client
- Freelancer sees "Funds Secured — Safe to Start" badge when paid
- Freelancer marks "Delivered" → client gets notification to confirm
- Client confirms → funds captured minus 8% commission
- Platform commission: 8% (configurable in admin settings)
- Freelancer withdraws to bank via Stripe Connect
- Dispute button: available on both sides within 7 days of delivery

### MODULE 6 — Settings
**Page:** /settings  
**Sections:**
- Profile: name, avatar, role dropdown, speciality, portfolio URL, bio
- Pricing defaults: min rate, max rate, currency selector
- Connected accounts: LinkedIn OAuth, Instagram, custom SMTP email
- Outreach preferences: channel toggles, daily limit, send window
- Notification preferences: email vs in-app vs both
- Subscription: current plan, upgrade CTA
- Danger zone: delete account (with confirmation)

---

## LANDING PAGE SECTIONS

| # | Section | BG | Key Elements |
|---|---|---|---|
| 1 | Navbar | #08080F | Transparent → blur on scroll, RED CTA pill |
| 2 | Hero | #08080F | Headline + scroll character + CTAs + social proof |
| 3 | Logo Marquee | #08080F | Platform logos CSS infinite scroll |
| 4 | Problem | #0F0F1A | 3 pain point cards, scroll animations |
| 5 | How It Works | #08080F | 3 steps: Find→Pitch→Get Paid, connector line |
| 6 | Features Bento | #0F0F1A | 6 module cards, 3D spotlight |
| 7 | Success Numbers | #08080F | Animated counters on scroll |
| 8 | Testimonials | #0F0F1A | Dual-row marquee, opposite directions |
| 9 | Pricing | #08080F | Free/Pro/Agency, glassmorphism, RED badge |
| 10 | FAQ | #0F0F1A | shadcn accordion, 6 questions |
| 11 | Final CTA | #08080F | BackgroundBeams subtle, red button |
| 12 | Footer | #08080F | 4 columns, social icons |

---

## PRICING TIERS

| Plan | Price | Limits |
|---|---|---|
| Free | $0/month | 10 pitches/month, 3 client searches/day, email only |
| Pro | $19/month | Unlimited pitches, unlimited searches, all channels |
| Agency | $49/month | Everything in Pro + 5 team members + white label |

Platform commission: 8% on all closed deals (all tiers)

---

## SCROLL CHARACTER SPEC

File: components/anime/FreelancerCharacter.tsx  
Implementation: Pure SVG, Framer Motion useScroll + useTransform  
Floating elements: CSS @keyframes ONLY (not Framer Motion)  
Spring: stiffness: 200, damping: 30  

| State | Scroll | Visual | Speech Bubble | Color |
|---|---|---|---|---|
| 1 — LOST | 0-25% | Head down, slouched, papers flying | "Spending all day finding clients..." | #444444 gray |
| 2 — SEARCHING | 25-50% | Head up, curious, location pin appears | "Wait... I can automate this?!" | #888888, yellow glow |
| 3 — SENDING | 50-75% | Confident, typing, emails flying out | "Pitches sent!" | Red tint rgba(255,45,45,0.6) |
| 4 — PAID | 75-100% | Arms up, victory, money symbols | "Client paid!" | Full #FF2D2D, scale 1.05 |

---

## MONETIZATION + REVENUE

- Free tier drives sign-ups
- Pro tier ($19/month) converts active users
- Agency tier ($49/month) for power users
- 8% commission on every deal closed (automatic via Stripe)
- Revenue model: subscription + transaction commission

---

## CONSTRAINTS

- NEVER expose API keys client-side
- All Stripe operations server-side only
- Apify calls only in API routes (never browser)
- JWT check on every protected API route
- MongoDB connection singleton (lib/db.ts)
- n8n webhook calls must be non-blocking (no await)
- Daily outreach limit: 50/day enforced server-side
- Mobile-first: every page works at 375px
- Performance: 60fps on M2 8GB RAM — no canvas, no custom cursor
- shadcn/ui for ALL form components — no custom HTML forms
- lucide-react for ALL icons — no emoji as icons

---

## OUT OF SCOPE (v1)

- Mobile app (web only for v1)
- Video call integration
- Contract generation
- Invoice generation (only deal tracking)
- Team collaboration (Agency tier is planned but seats only)

---

*FreelanceOS PRD v1.0 — Single source of truth. Read before writing any code.*

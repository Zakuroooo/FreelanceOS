# FreelanceOS — Technical Requirements Document (TRD)
# Version 1.0 | Read alongside PRD_FREELANCEOS.md

---

## TECH STACK — COMPLETE LIST

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js + TypeScript | v16, App Router, Turbopack |
| Styling | Tailwind CSS + globals.css | v4, CSS variables for all tokens |
| Animations | Framer Motion | Section entries + character only |
| Database | MongoDB Atlas + Mongoose | Free M0 cluster, same as PitchSnap |
| Auth | NextAuth.js v5 | Google + GitHub + Email/Password + OTP |
| Email | Resend API | Transactional + automated outreach |
| AI | Groq SDK | llama-3.3-70b-versatile, dual pipeline |
| Scraping | Apify | Free tier, Web Scraper actor |
| Payments | Stripe | PaymentIntents + Connect |
| Outreach | LinkedIn API + Meta Graph API | DM automation |
| Automation | n8n | localhost:5678, 9 workflows |
| Components | shadcn/ui + Aceternity UI | Same as PitchSnap |
| Icons | Lucide React | No emoji as icons — ever |
| Deployment | Vercel + custom domain | Same workflow as PitchSnap |

---

## PERFORMANCE RULES (M2 8GB RAM — NON-NEGOTIABLE)

| Rule | Reason |
|---|---|
| NO canvas + requestAnimationFrame loops | Destroys performance |
| NO custom cursor tracking | Mouse jitter |
| NO SVG feTurbulence noise filter | CPU expensive |
| NO rotateX/rotateY on scroll | Expensive repaints |
| NO background canvas particles | Performance killer |
| ALL whileInView MUST have once:true | No re-trigger on re-enter |
| Max 2 Framer Motion effects per section | Memory budget |
| CSS @keyframes for ALL marquees + floats | GPU accelerated |
| Framer Motion ONLY for: character + section entries | Targeted usage |
| Lenis smooth scroll: lerp 0.08, duration 1.0 | Tuned for 8GB |
| Max 10 animated elements visible simultaneously | Frame budget |

---

## ANIMATION ARCHITECTURE

| Animation | Tool | Pattern |
|---|---|---|
| Section entry (all sections) | Framer Motion | opacity:0→1, y:40→0, once:true, 0.5s |
| Stagger children | Framer Motion | staggerChildren:0.08, delayChildren:0.1 |
| Scroll character states | Framer Motion | useScroll + useTransform + spring |
| Infinite marquee (logos) | CSS @keyframes | translateX -50%, no JS |
| Dual testimonials | CSS @keyframes | row1 left, row2 right |
| Counter animation | Framer Motion | useInView + animate 0→target, once:true |
| Connector line draw | Framer Motion | pathLength:0→1, whileInView, once:true |
| Card hover effects | CSS | translateY(-4px), 150ms ease |
| Character floating elements | CSS @keyframes | translateY -8px, infinite |
| Navbar blur | CSS | backdrop-blur-md on scroll past 50px |
| Smooth scroll | Lenis | lerp:0.08, duration:1.0, easeInOutCubic |

---

## FOLDER STRUCTURE

```
~/Desktop/FreelanceOS/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── dashboard/page.tsx      # Overview + stats
│   │   ├── discover/page.tsx       # Client discovery
│   │   ├── clients/page.tsx        # Saved clients list
│   │   ├── pitches/page.tsx        # Pitch generator
│   │   ├── outreach/page.tsx       # Outreach queue
│   │   ├── deals/page.tsx          # Deals + escrow
│   │   ├── notifications/page.tsx  # Reply alerts
│   │   └── settings/page.tsx       # User settings
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth routes
│   │   ├── clients/route.ts        # Client CRUD
│   │   ├── discover/route.ts       # Apify scraping
│   │   ├── pitch/route.ts          # Groq generation
│   │   ├── outreach/route.ts       # Send queue
│   │   ├── deals/route.ts          # Deal management
│   │   ├── deals/payment-link/     # Stripe link gen
│   │   ├── deals/release/          # Escrow release
│   │   ├── deals/payout/           # Stripe Connect
│   │   └── notifications/route.ts  # Notification CRUD
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Design tokens + keyframes
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx             # Text-only, no icons
│   ├── anime/
│   │   └── FreelancerCharacter.tsx # 4-state scroll SVG
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── LogoMarquee.tsx
│   │   ├── Problem.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── SuccessNumbers.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── FinalCTA.tsx
│   ├── dashboard/
│   │   ├── DiscoverySearch.tsx
│   │   ├── ClientResultCard.tsx
│   │   ├── ManualPaste.tsx
│   │   ├── PitchForm.tsx
│   │   ├── OutputTabs.tsx
│   │   ├── OutreachQueue.tsx
│   │   ├── DealCard.tsx
│   │   └── EscrowBadge.tsx
│   └── ui/
│       ├── SectionBadge.tsx        # 11px ALL CAPS accent
│       ├── WobbleCard.tsx          # Mouse tilt 8deg max
│       ├── AnimatedCounter.tsx     # Count up on view
│       └── SkeletonLoader.tsx      # Async loading state
├── lib/
│   ├── db.ts                       # MongoDB singleton (from PitchSnap)
│   ├── auth.ts                     # Cookie helpers (from PitchSnap)
│   ├── jwt.ts                      # JWT utilities (from PitchSnap)
│   ├── groq.ts                     # Groq dual pipeline (extend PitchSnap)
│   ├── apify.ts                    # Apify scraping client
│   ├── stripe.ts                   # Stripe escrow helpers
│   ├── n8n.ts                      # n8n webhook triggers
│   ├── lenis.ts                    # Smooth scroll singleton
│   ├── gapDetector.ts              # Client gap detection logic
│   └── models/
│       ├── User.ts
│       ├── Client.ts
│       ├── Pitch.ts
│       ├── OutreachRecord.ts
│       ├── Deal.ts
│       └── Notification.ts
├── hooks/
│   └── useScrollProgress.ts
├── types/
│   └── index.ts
├── public/
│   └── anime_states/               # state-1.png → state-4.png
├── auth.ts                         # NextAuth config (root)
├── middleware.ts                   # Route protection
├── tailwind.config.ts
├── CLAUDE.md                       # Full project bible
├── PRD_FREELANCEOS.md              # This PRD
├── TRD_FREELANCEOS.md              # This TRD
├── .env.local                      # All secrets — NEVER COMMIT
└── .gitignore                      # Must include .env.local
```

---

## COLOR SYSTEM — COMPLETE TOKENS

```css
/* globals.css — ALL colors as CSS variables — never hardcode */

:root {
  --color-bg:              #08080F;
  --color-surface:         #0F0F1A;
  --color-surface-2:       #161625;
  --color-border:          rgba(255,255,255,0.07);
  --color-border-hover:    rgba(255,255,255,0.14);
  --color-text-primary:    #F0EEF8;
  --color-text-secondary:  #9B97B2;
  --color-text-muted:      #5C5878;
  --color-accent:          #FF2D2D;
  --color-accent-dim:      rgba(255,45,45,0.12);
  --color-accent-border:   rgba(255,45,45,0.25);
  --color-success:         #00C9A7;
  --color-warning:         #F59E0B;
  --color-error:           #EF4444;
}
```

---

## TYPOGRAPHY SYSTEM

| Element | Size | Weight | Color |
|---|---|---|---|
| Display headline | 72-80px | 700 | --color-text-primary |
| Section heading | 40-48px | 600 | --color-text-primary |
| Sub-heading | 24-32px | 600 | --color-text-primary |
| Body text | 16-18px | 400 | --color-text-secondary |
| Caption/label | 11-13px | 500 | --color-text-secondary |
| Section badge | 11px | 600 | --color-accent |
| Button text | 14-15px | 500 | varies |
| Code | JetBrains Mono 13px | 400 | --color-accent |

Section badge style: `font-size:11px | letter-spacing:0.12em | ALL CAPS | color:var(--color-accent)`

---

## DATABASE MODELS — MONGOOSE SCHEMAS

### User
```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  passwordHash: string,
  name: string,
  avatar: string,
  role: enum['web-dev','video-creator','designer','copywriter',
             'social-media','ai-integrator','other'],
  speciality: string,
  minRate: number,
  maxRate: number,
  currency: string (default: 'USD'),
  connectedChannels: {
    linkedin: string,
    instagram: string,
    emailSmtp: string
  },
  plan: enum['free','pro','agency'] (default: 'free'),
  monthlyPitchCount: number (default: 0),
  monthlyPitchResetDate: Date,
  stripeAccountId: string,
  stripeCustomerId: string,
  createdAt: Date
}
```

### Client
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  businessName: string,
  industry: string,
  location: string,
  website: string,
  email: string,
  phone: string,
  socials: {
    linkedin: string,
    instagram: string,
    facebook: string
  },
  detectedGaps: string[] (['no-website','no-social','no-video']),
  source: enum['scraped','manual'],
  status: enum['discovered','saved','pitched','replied','deal','closed'],
  notes: string,
  createdAt: Date
}
```

### Pitch
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  clientId: ObjectId (ref: Client),
  emailSubject: string,
  emailBody: string,
  linkedinDm: string,
  instagramDm: string,
  whatsappMsg: string,
  fullProposal: string,
  whyThem: string,
  qualityScore: number (0-100),
  tone: enum['professional','friendly','bold'],
  status: enum['draft','approved','sent'],
  createdAt: Date
}
```

### OutreachRecord
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  clientId: ObjectId (ref: Client),
  pitchId: ObjectId (ref: Pitch),
  channel: enum['email','linkedin','instagram','whatsapp'],
  status: enum['queued','sent','delivered','opened','replied'],
  sentAt: Date,
  repliedAt: Date
}
```

### Deal
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  clientId: ObjectId (ref: Client),
  title: string,
  scope: string,
  price: number,
  currency: string,
  deadline: Date,
  status: enum['proposed','funded','in_progress',
               'delivered','paid','closed','disputed'],
  stripePaymentIntentId: string,
  stripePaymentLinkId: string,
  escrowAmount: number,
  commissionRate: number (default: 0.08),
  commissionAmount: number,
  payoutAmount: number,
  createdAt: Date,
  fundedAt: Date,
  deliveredAt: Date,
  paidAt: Date
}
```

### Notification
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: enum['reply','deal_funded','deal_paid','reminder','limit_warning'],
  message: string,
  clientId: ObjectId (ref: Client),
  dealId: ObjectId (ref: Deal),
  read: boolean (default: false),
  createdAt: Date
}
```

---

## API ROUTES — COMPLETE LIST

| Method | Route | Auth | What it does |
|---|---|---|---|
| POST | /api/auth/[...nextauth] | public | NextAuth handlers |
| GET | /api/clients | required | Get user's client list |
| POST | /api/clients | required | Save new client |
| DELETE | /api/clients/[id] | required | Delete client |
| POST | /api/discover | required | Trigger Apify scrape |
| POST | /api/pitch | required | Generate pitch (Groq) |
| GET | /api/pitch | required | Get pitch history |
| POST | /api/outreach | required | Add to outreach queue |
| GET | /api/outreach | required | Get queue status |
| POST | /api/deals | required | Create new deal |
| GET | /api/deals | required | Get user's deals |
| PATCH | /api/deals/[id] | required | Update deal status |
| POST | /api/deals/payment-link | required | Generate Stripe link |
| POST | /api/deals/release | required | Release escrow |
| POST | /api/deals/payout | required | Stripe Connect payout |
| GET | /api/notifications | required | Get notifications |
| PATCH | /api/notifications/[id] | required | Mark as read |
| POST | /api/webhooks/stripe | public | Stripe webhook handler |

All 'required' routes: check JWT/session first, return 401 if missing.

---

## STRIPE ESCROW FLOW — EXACT IMPLEMENTATION

```
1. Freelancer creates Deal in app
   → POST /api/deals
   → Create Stripe PaymentIntent (capture_method: 'manual', amount: price*100)
   → Save stripePaymentIntentId to Deal

2. Generate payment link for client
   → POST /api/deals/payment-link
   → Create Stripe Payment Link
   → Send to client via n8n email webhook

3. Client pays
   → Stripe fires payment_intent.amount_capturable_updated webhook
   → POST /api/webhooks/stripe catches it
   → Update deal status to 'funded'
   → Fire n8n deal-funded webhook → notify freelancer

4. Freelancer delivers work
   → PATCH /api/deals/[id] { status: 'delivered' }
   → Fire n8n → notify client to confirm

5. Client confirms
   → PATCH /api/deals/[id] { status: 'paid' }
   → POST /api/deals/release
   → Capture PaymentIntent (stripe.paymentIntents.capture)
   → Calculate: commission = price * 0.08
   → payoutAmount = price - commission
   → Transfer payoutAmount to freelancer's Stripe Connect account

6. Freelancer withdraws
   → POST /api/deals/payout
   → stripe.transfers.create to stripeAccountId
```

---

## N8N WORKFLOWS — ALL 9

| # | Name | ENV Var | Trigger | Action |
|---|---|---|---|---|
| 1 | welcome-email | N8N_SIGNUP_WEBHOOK_URL | User signs up | Send welcome email via Resend |
| 2 | outreach-email | N8N_PITCH_WEBHOOK_URL | Pitch approved email | Send cold email to client via Resend |
| 3 | outreach-linkedin | N8N_LINKEDIN_WEBHOOK_URL | Pitch approved LinkedIn | POST to LinkedIn Messaging API |
| 4 | outreach-instagram | N8N_INSTAGRAM_WEBHOOK_URL | Pitch approved Instagram | POST to Meta Graph API |
| 5 | reply-notify | N8N_REPLY_WEBHOOK_URL | Client replies | Create notification in MongoDB |
| 6 | deal-funded | N8N_DEAL_WEBHOOK_URL | Stripe payment captured | Update deal → funded in MongoDB |
| 7 | deal-paid | N8N_PAYOUT_WEBHOOK_URL | Client confirms delivery | Release escrow + notify freelancer |
| 8 | followup-reminder | scheduled | 5 days no reply | Alert freelancer in-app |
| 9 | limit-warning | N8N_SIGNUP_WEBHOOK_URL | 80% monthly limit | Email user to upgrade plan |

n8n helper in lib/n8n.ts:
```typescript
export async function triggerN8n(webhookUrl: string, data: object) {
  // Non-blocking — never await this in API routes
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {}) // Fail silently — never break main flow
}
```

---

## GROQ PITCH PROMPT — EXACT SYSTEM PROMPT

```
You are an expert freelance pitch writer who writes concise, personalised,
high-converting outreach. Every pitch references something specific about
the client and clearly explains what the freelancer can do for them.
Never use generic templates.

Freelancer role: {role}
Freelancer speciality: {speciality}
Client: {clientName} — {clientIndustry} in {clientLocation}
Client gap detected: {detectedGap}
Tone: {tone}

Generate a JSON object with EXACTLY these keys:
- email_subject (max 10 words)
- email_body (max 150 words)
- linkedin_dm (max 80 words, conversational)
- instagram_dm (max 60 words, casual)
- whatsapp_msg (max 50 words, direct)
- full_proposal (400 words: scope, timeline, pricing, deliverables)
- why_them (2 sentences explaining the detected gap)

Return ONLY valid JSON. No preamble. No markdown. No code fences.
```

---

## CODERABBIT CHECKLIST — FIX ALL FLAGS BEFORE NEXT TASK

- [ ] All colors use CSS variables (zero hardcoded hex)
- [ ] Red accent used max 3-4 times per section
- [ ] Every whileInView has once:true
- [ ] Zero canvas elements or requestAnimationFrame loops
- [ ] Zero custom cursor implementation
- [ ] Zero rotateX/rotateY on scroll
- [ ] All Stripe keys server-side only (no NEXT_PUBLIC_ for secrets)
- [ ] Apify calls only in API routes (never client-side)
- [ ] JWT/session check on every protected API route
- [ ] TypeScript strict mode — zero 'any' types
- [ ] Mobile: 375px no horizontal scroll
- [ ] Skeleton loaders on all async data
- [ ] No emoji as icons (lucide-react only)
- [ ] n8n webhooks non-blocking (no await)
- [ ] Stripe webhook signature verified before processing
- [ ] npm run build returns 0 errors

---

## ANTI-PATTERNS — NEVER DO THESE

| Forbidden | Reason |
|---|---|
| Blue/violet/purple gradients | Generic AI-generated SaaS look |
| Accent on every element | Loses meaning |
| canvas + requestAnimationFrame | Performance killer |
| Custom cursor | Mouse jitter |
| SVG feTurbulence | CPU expensive |
| rotateX/rotateY on scroll | Expensive repaints |
| Background canvas particles | Performance killer |
| whileInView without once:true | Re-triggers wastefully |
| Hardcoded hex colors | Use CSS variables only |
| Generic SaaS dashboard look | Must feel like Linear.app |
| Emoji as icons | Use lucide-react only |
| Changing spacing without being asked | Pranay will reject immediately |

---

## PROTECTED FILES — NEVER MODIFY ONCE WORKING

```
app/(auth)/          — auth pages
app/(dashboard)/     — all dashboard pages
app/api/auth/        — NextAuth routes
app/api/generate/    — Groq generation endpoint
lib/jwt.ts           — JWT utilities
lib/auth.ts          — cookie helpers
lib/db.ts            — MongoDB connection singleton
lib/models/          — all Mongoose schemas
auth.ts              — NextAuth config at project root
middleware.ts        — route protection
.env.local           — API keys, never commit ever
```

---

*FreelanceOS TRD v1.0 — Technical bible. Read alongside PRD_FREELANCEOS.md.*

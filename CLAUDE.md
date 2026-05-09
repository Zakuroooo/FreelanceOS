# FREELANCEOS — MASTER BUILD DOCUMENT
# Version 2.0 | The Single Source of Truth
# Read EVERY line before writing a single line of code.
# This document IS the project. Follow it exactly.

---

## CRITICAL RULES — VIOLATING ANY = TASK FAILURE

1. ONE task at a time. Confirm + commit + push after each. Never combine.
2. NEVER hardcode colors — CSS variables only, always.
3. NEVER touch protected files once working.
4. ALL whileInView MUST have once:true — no exceptions.
5. Max 3-4 red accent uses per page — not everywhere.
6. npx tsc --noEmit after every single task — must show 0 errors.
7. git add . && git commit -m "feat: TN — description" && git push after every task.
8. Use Stitch MCP before building every landing page section (T7–T16).
9. CSS @keyframes for ALL marquees and floating elements — never Framer Motion.
10. Framer Motion ONLY for: scroll character + section entries + counters.
11. NO canvas, NO custom cursor, NO SVG feTurbulence, NO rotateX/rotateY on scroll.
12. NO purple, blue, violet gradients — ever. Red accent only.
13. Mobile-first — every component works at 375px before moving on.
14. Fix ALL CodeRabbit flags before next task — zero exceptions.
15. Performance budget: max 2 Framer Motion effects per section.
16. shadcn/ui for ALL form components — no raw HTML form elements.
17. lucide-react for ALL icons — no emoji as icons ever.
18. Skeleton loaders on every async data component.
19. Toast (Sonner) on every user action — success, error, loading.
20. n8n webhook calls must be non-blocking — never await them in API routes.

---

## SECTION 1 — PROJECT IDENTITY

Name:        FreelanceOS
Tagline:     "Your entire freelance business, on autopilot."
Type:        SaaS web app — B2C, freelancer-focused
Developer:   Pranay Sarkar — github.com/Zakuroooo
Reference:   pitchsnap.me — study this before building anything
Repo:        https://github.com/Zakuroooo/FreelanceOS.git
Local:       ~/Desktop/FreelanceOS
Dev server:  localhost:3000
n8n:         localhost:5678
Deploy:      Vercel + custom domain

What already exists in the repo (DO NOT RECREATE):
- Next.js 16 initialized with TypeScript + Tailwind + App Router
- All npm packages installed
- globals.css with complete color system and keyframes
- tailwind.config.ts with all design tokens
- Navbar, Footer, Container, Sidebar components in components/layout/

---

## SECTION 2 — DESIGN SYSTEM (NON-NEGOTIABLE)

### Color Tokens
--color-bg:              #08080F
--color-surface:         #0F0F1A
--color-surface-2:       #161625
--color-border:          rgba(255,255,255,0.07)
--color-border-hover:    rgba(255,255,255,0.14)
--color-text-primary:    #F0EEF8
--color-text-secondary:  #9B97B2
--color-text-muted:      #5C5878
--color-accent:          #FF2D2D
--color-accent-dim:      rgba(255,45,45,0.12)
--color-accent-border:   rgba(255,45,45,0.25)
--color-success:         #00C9A7
--color-warning:         #F59E0B
--color-error:           #EF4444

### Typography
Font: Inter (all text)
Display:       72-80px / weight 700 / line-height 1.1
Section head:  40-48px / weight 600 / line-height 1.2
Sub-heading:   24-32px / weight 600 / line-height 1.3
Body:          16-18px / weight 400 / line-height 1.7
Caption:       11-13px / weight 500
Section badge: 11px / weight 600 / accent color / ALL CAPS / tracking 0.12em
Code:          JetBrains Mono 13px

### Section Badge Pattern
Every single section MUST have a SectionBadge above its heading.
Example: • FEATURES / • HOW IT WORKS / • PRICING

### Required UI Components
1.  SectionBadge        — 11px ALL CAPS red dot + label
2.  WobbleCard          — Aceternity mouse tilt max 8deg
3.  AnimatedCounter     — Framer Motion useInView count up once
4.  CardSpotlight       — Aceternity 3D depth on feature cards
5.  BackgroundBeams     — Aceternity, CTA section only, subtle
6.  CometCard           — Aceternity comet border on pricing
7.  SkeletonLoader      — shimmer on all async components
8.  ConnectorLine       — Framer Motion pathLength 0→1 once
9.  InfiniteMarquee     — CSS @keyframes only no JS

### Animation Rules
Section entry:    opacity 0→1, y 40→0, once:true, 0.5s duration
Stagger:          staggerChildren 0.08, delayChildren 0.1
Scroll character: Framer Motion useScroll + useTransform + spring
Marquees:         CSS @keyframes translateX only
Floating:         CSS @keyframes only
Counters:         Framer Motion useInView + animate once
Lenis:            lerp 0.08, duration 1.0, easeInOutCubic

### Anti-Patterns — NEVER
- Blue/violet/purple gradients
- Accent on every element (max 3-4 per page)
- canvas + requestAnimationFrame
- Custom cursor
- SVG feTurbulence
- rotateX/rotateY on scroll
- Canvas particles
- whileInView without once:true
- Hardcoded hex colors
- Emoji as icons
- Changing spacing without being asked

---

## SECTION 3 — PRODUCT SPEC (6 MODULES)

### MODULE 1 — Client Discovery (/discover)
Search: business type + location → Apify Web Scraper → real businesses
Each result: name, industry, location, website, email, phone, socials
Gap badges: NO WEBSITE / NO SOCIAL / NO VIDEO
Gap detection (lib/gapDetector.ts):
  NO WEBSITE: HEAD request fails or no URL in data
  NO SOCIAL: no LinkedIn AND no Instagram found
  NO VIDEO: no YouTube or video content found
Save: star to add to /clients list
Manual paste: textarea → Groq parses → structured Client object
Statuses: discovered → saved → pitched → replied → deal → closed

### MODULE 2 — AI Pitch Engine (/pitches)
Reuse + extend lib/groq.ts from PitchSnap
Auto pre-fills from saved client data
Role-aware: freelancer role drives pitch tone
Tone: Professional / Friendly / Bold
Outputs: Cold Email / LinkedIn DM / Instagram DM / WhatsApp / Full Proposal
Quality Score: 0-100% conversion probability (third Groq call)
Groq pipeline:
  Call 1: Generate all outputs
  Call 2: Self-correct and improve
  Call 3: Score conversion probability 0-100%
One-click "Approve & Queue" → outreach queue

### MODULE 3 — Outreach Engine (/outreach)
Queue table: approved pitches pending send
Auto-sends via n8n: Email (Resend) + LinkedIn API + Instagram API
Status: Queued / Sent / Delivered / Replied
Daily limit: 50 outreaches/day server-side
Send window: configurable hours

### MODULE 4 — Notifications + CRM (/notifications)
Bell in sidebar with red unread badge
Types: reply / deal_funded / deal_paid / reminder / limit_warning
n8n webhook fires on client reply → notification in DB
Follow-up: n8n scheduled, fires at 5 days no reply

### MODULE 5 — Deals + Escrow (/deals)
Create: title, scope, price, deadline, client
Pipeline: Proposed → Funded → In Progress → Delivered → Paid
Stripe PaymentIntent (capture_method: manual) → escrow hold
Payment link → sent to client
Funded: "Funds Secured" badge
Delivery → client confirms → release minus 8% commission
Stripe Connect payout to freelancer

### MODULE 6 — Settings (/settings)
Tabs: Profile / Pricing / Outreach / Connected / Plan / Danger
Profile: name, avatar, role, speciality, portfolio URL, bio
Pricing: min/max rate, currency
Outreach: channel toggles, daily limit, send window
Connected: LinkedIn OAuth, Instagram, custom SMTP

---

## SECTION 4 — LANDING PAGE (12 SECTIONS)

### Navbar (already built — T4)
Transparent → blur at 50px scroll
Logo: "Freelance" white + "OS" red
Links: Features / How It Works / Pricing
CTAs: Log in (ghost) + Get Started Free (red pill)
Mobile hamburger → slide-down menu
Hidden on dashboard routes

### Hero — T7
STITCH PROMPT: "Dark SaaS hero section for FreelanceOS freelancer automation
platform. Left 55%: large editorial headline 'Your entire freelance business,
on autopilot.' Subheadline about finding + pitching clients automatically.
Red primary CTA 'Get Started Free' + ghost CTA 'See How It Works'.
Social proof: 5 avatars + star rating + '2,400+ freelancers using FreelanceOS'.
Right 45%: anime character placeholder box 280x380px.
Dark #08080F background. Red #FF2D2D accent. Inter font. Linear.app minimal."

Layout: left 55% text + right 45% character
Headline line 1: "Your entire freelance business,"
Headline line 2: "on autopilot." — word "autopilot" in red
Subheadline: "Find clients, pitch automatically, get paid securely."
CTA 1: red "Get Started Free" → /signup
CTA 2: ghost "See How It Works" → /#how-it-works
Social proof: 5 avatar circles + star rating + freelancer count
Right: FreelancerCharacter component, scroll-driven

### Logo Marquee — T8
Label: "TRUSTED BY FREELANCERS ON"
CSS @keyframes only, single direction left, 25s loop
Logos: Upwork Fiverr Toptal LinkedIn Dribbble Freelancer Behance 99designs
SVG from simpleicons.org, white colored
Fade edges with mask-image gradient

### Problem — T9
STITCH PROMPT: "Dark editorial problem section for SaaS.
Section badge 'THE PROBLEM'. Heading: 'Manual outreach is broken.'
3 pain point cards in a row on dark #0F0F1A surface.
Card 1: '3 hours' stat — 'Wasted searching for clients every day'
Card 2: '2%' stat — 'Average reply rate on generic cold emails'
Card 3: '80%' stat — 'Of leads go cold without follow-up'
Large red stat numbers. WobbleCard hover effect. Inter font. Minimal."

SectionBadge: "THE PROBLEM"
Heading: "Manual outreach is broken."
3 WobbleCards with large red stat + title + description
Framer Motion stagger entry once:true

### How It Works — T10
STITCH PROMPT: "3-step horizontal process section for SaaS.
Section badge 'HOW IT WORKS'. Heading: 'Three steps to your next client.'
Step 01: Find Clients — search location and type, see real businesses.
Step 02: Generate Pitch — AI creates personalized pitch in 10 seconds.
Step 03: Get Paid — auto-send pitches, escrow payment, secure payout.
Large red step numbers. Connecting line between steps draws on scroll.
Dark #08080F bg. Inter font. Linear.app editorial style. Mobile-first."

SectionBadge: "HOW IT WORKS"
Heading: "Three steps to your next client."
3 steps with Framer Motion connector line pathLength 0→1 once:true
Step numbers in red, stagger entry animation

### Features Bento — T11
STITCH PROMPT: "Bento grid features for SaaS platform.
Section badge 'CAPABILITIES'. Heading: 'Everything you need to win clients.'
Left column: 2 large cards stacked.
Right column: 2x2 grid of 4 small cards.
Large card 1: Client Discovery — mock search interface inside.
Large card 2: AI Pitch Engine — mock output tabs inside.
Small cards: Outreach Engine / Deal Escrow / Notifications / Quality Score.
Dark #0F0F1A cards. 3D spotlight hover. Minimal editorial. Mobile-first."

SectionBadge: "CAPABILITIES"
Heading: "Everything you need to win clients."
Bento: 2 large left column + 4 small right 2x2 grid
CardSpotlight on all 6 cards
Mock UI previews inside large cards

### Success Numbers — T12
SectionBadge: "THE IMPACT"
3 AnimatedCounter components:
  2400+ → "Freelancers using FreelanceOS"
  94%   → "Average pitch open rate"
  12x   → "Faster than manual outreach"
useInView + count from 0 + once:true + 2s duration

### Testimonials — T13
SectionBadge: "PROVEN"
Heading: "Freelancers closing deals every day."
Row 1: CSS marquee LEFT at 35s
Row 2: CSS marquee-reverse RIGHT at 35s
8 testimonial cards per row, duplicated for infinity
CSS @keyframes ONLY — no Framer Motion
Pause on hover

### Pricing — T14
STITCH PROMPT: "3-tier SaaS pricing section.
Section badge 'PRICING'. Heading: 'Simple, transparent pricing.'
Free: $0/month — 10 pitches/month, 3 searches/day, email only.
Pro: $19/month — Unlimited pitches + searches + all channels. POPULAR.
Agency: $49/month — Everything + 5 team seats + white label.
Dark glassmorphism cards. Red accent border on Pro card. Red POPULAR badge.
Monthly/annual toggle (annual 20% off). CometCard effect. Inter font."

SectionBadge: "PRICING"
Heading: "Simple, transparent pricing."
Toggle: Monthly / Annual (annual = 20% off)
3 tiers: Free / Pro (Popular) / Agency
CometCard on all 3
Pro: red border + gradient-border-red + red Popular badge

### FAQ — T15
SectionBadge: "FAQ"
Heading: "Everything you need to know."
shadcn/ui Accordion, max-width 800px centered
8 questions covering: discovery, pitches, escrow, channels,
commission, mobile, difference from PitchSnap, free plan

### Final CTA — T16
STITCH PROMPT: "Full-width CTA section for SaaS.
Section badge 'GET STARTED'. Heading: 'Start winning clients today.'
Subheading: 'Join 2,400+ freelancers on autopilot. Free forever.'
Red CTA button 'Get Started Free — It's free'. Ghost button 'View GitHub'.
Dark #0F0F1A background with subtle animated beam effect.
Not overwhelming — very subtle. Inter font. Center aligned."

BackgroundBeams (Aceternity) — subtle
Heading: "Start winning clients today."
CTA: red "Get Started Free" + ghost "View GitHub"

### Footer (already built — T4)
4 columns: Product / Company / Legal / Connect

---

## SECTION 5 — SCROLL CHARACTER

File: components/anime/FreelancerCharacter.tsx
Pure SVG, Framer Motion useScroll + useTransform + spring
Size: 280x380px desktop / 200x270px mobile
Floating elements: CSS @keyframes ONLY
Spring: stiffness 200, damping 30

STATE 1 — LOST (0–25%): body #444444, head down, papers flying float-chaos,
sweat drop, speech "Spending all day finding clients...", no glow

STATE 2 — SEARCHING (25–50%): body #888888, head up curious, location pin
pin-bounce, question mark float-bob, speech "Wait... I can automate this?!",
subtle yellow glow rgba(255,220,0,0.06)

STATE 3 — SENDING (50–75%): body rgba(255,45,45,0.6), confident typing,
envelopes fly-right, laptop screen red, speech "Pitches sent!",
red glow rgba(255,45,45,0.08)

STATE 4 — PAID (75–100%): body #FF2D2D full, arms up victory, star eyes,
$ symbols float-up, confetti-fall, speech "Client paid!",
strong red glow, scale 1.05

Transitions:
scrollYProgress: useScroll({ target: heroRef, offset: ['start start','end end'] })
color: useTransform(scrollYProgress, [0,0.5,1], ['#444','#888','#FF2D2D'])
glow: useTransform(scrollYProgress, [0,0.5,1], [0, 0.06, 0.15])
scale: useTransform(scrollYProgress, [0,0.75,1], [1.0,1.0,1.05])
speech: Framer Motion animate with key prop

---

## SECTION 6 — AUTH SYSTEM

### Signup Page — app/(auth)/signup/page.tsx
Split layout: left 45% visual + right 55% form
Left: dark surface + logo + 3 feature bullets + character image
Right form: Google OAuth + GitHub OAuth + email divider +
  name + email + password (show/hide) + role dropdown + red submit
n8n welcome email trigger on success

### Login Page — app/(auth)/login/page.tsx
Same split layout
Form: Google + GitHub + email divider + email + password +
  forgot password + red submit

### auth.ts (project root)
NextAuth v5: Google + GitHub + Credentials providers
MongoDB adapter + JWT sessions
Session callback: includes user.id and user.role

### middleware.ts
Protected: /dashboard /discover /clients /pitches
           /outreach /deals /notifications /settings
Public: / /login /signup /api/auth/*

---

## SECTION 7 — DASHBOARD

### Layout — app/(dashboard)/layout.tsx
Sidebar fixed left 220px
Main content margin-left 220px
Top bar: page title + bell + avatar
Mobile: bottom tab bar at <768px
No Navbar or Footer (dashboard only)

### Overview — app/(dashboard)/dashboard/page.tsx
Stats cards (real MongoDB): Total Clients / Pitches Sent / Active Deals / Total Earned
Recent activity feed
Quick actions: Find Clients + New Pitch + View Deals
Skeleton loaders on all stats

---

## SECTION 8 — DATABASE MODELS

### lib/models/User.ts
email: String unique required
passwordHash: String
name: String required
avatar: String
role: enum [web-dev, video-creator, designer, copywriter,
            social-media, ai-integrator, other]
speciality: String
minRate: Number default 0
maxRate: Number default 0
currency: String default USD
connectedChannels: { linkedin, instagram, emailSmtp }
plan: enum [free, pro, agency] default free
monthlyPitchCount: Number default 0
monthlyPitchResetDate: Date
stripeAccountId: String
stripeCustomerId: String
createdAt: Date default now

### lib/models/Client.ts
userId: ObjectId ref User required
businessName: String required
industry: String
location: String
website: String
email: String
phone: String
socials: { linkedin, instagram, facebook }
detectedGaps: [String] — no-website / no-social / no-video
source: enum [scraped, manual] required
status: enum [discovered, saved, pitched, replied, deal, closed]
notes: String
createdAt: Date default now

### lib/models/Pitch.ts
userId: ObjectId ref User required
clientId: ObjectId ref Client required
emailSubject emailBody linkedinDm instagramDm
whatsappMsg fullProposal whyThem: String
qualityScore: Number 0-100
tone: enum [professional, friendly, bold]
status: enum [draft, approved, sent] default draft
createdAt: Date default now

### lib/models/OutreachRecord.ts
userId clientId pitchId: ObjectId required
channel: enum [email, linkedin, instagram, whatsapp]
status: enum [queued, sent, delivered, opened, replied]
sentAt repliedAt: Date

### lib/models/Deal.ts
userId clientId: ObjectId required
title scope: String
price: Number required
currency: String default USD
deadline: Date
status: enum [proposed, funded, in_progress, delivered, paid, closed, disputed]
stripePaymentIntentId stripePaymentLinkId: String
escrowAmount commissionRate(0.08) commissionAmount payoutAmount: Number
createdAt fundedAt deliveredAt paidAt: Date

### lib/models/Notification.ts
userId: ObjectId required
type: enum [reply, deal_funded, deal_paid, reminder, limit_warning]
message: String required
clientId dealId: ObjectId
read: Boolean default false
createdAt: Date default now

---

## SECTION 9 — API ROUTES

All protected routes check session first → 401 if missing

POST   /api/auth/[...nextauth]       NextAuth (public)
GET    /api/clients                  Get user clients
POST   /api/clients                  Save client
DELETE /api/clients/[id]             Delete client
PATCH  /api/clients/[id]             Update client
POST   /api/discover                 Apify scrape
POST   /api/discover/parse           Groq parse manual paste
POST   /api/pitch                    Generate pitch (3-call Groq)
GET    /api/pitch                    Pitch history
PATCH  /api/pitch/[id]               Update pitch status
GET    /api/outreach                 Get queue
POST   /api/outreach                 Add to queue
PATCH  /api/outreach/[id]            Update status
GET    /api/deals                    Get deals
POST   /api/deals                    Create deal + Stripe PaymentIntent
PATCH  /api/deals/[id]               Update deal
POST   /api/deals/payment-link       Generate Stripe link
POST   /api/deals/release            Capture escrow + commission
POST   /api/deals/payout             Stripe Connect transfer
GET    /api/notifications            Get notifications
PATCH  /api/notifications/[id]       Mark read
DELETE /api/notifications/[id]       Delete
PATCH  /api/notifications/read-all   Mark all read
GET    /api/stats                    Dashboard stats
POST   /api/webhooks/stripe          Stripe webhook (public, verify sig)

---

## SECTION 10 — GROQ PITCH PROMPTS

Model: llama-3.3-70b-versatile

CALL 1 — Generate:
System: "You are an expert freelance pitch writer. Write concise, personalised,
high-converting outreach. Every pitch references something specific about the
client. Never use generic templates.
Freelancer role: {role}
Speciality: {speciality}
Client: {clientName} — {clientIndustry} in {clientLocation}
Gap: {detectedGap}
Tone: {tone}
Return ONLY valid JSON no preamble no markdown:
{ email_subject, email_body, linkedin_dm, instagram_dm,
  whatsapp_msg, full_proposal, why_them }"

CALL 2 — Self-correct:
System: "You are a senior pitch reviewer. Improve this for higher conversion.
More specific, more compelling, more personalized.
Return same JSON structure with improvements."
User: [Call 1 output]

CALL 3 — Score:
System: "Score this pitch 0-100 on conversion probability.
Consider: personalization, specificity, clarity, value proposition, tone.
Return ONLY: { score: number, reason: string (1 sentence) }"
User: [Call 2 output]

---

## SECTION 11 — N8N WORKFLOWS (9 TOTAL)

lib/n8n.ts — fire and forget pattern:
export async function triggerN8n(url: string, data: object): Promise<void> {
  if (!url) return
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {})
}

1. welcome-email      N8N_SIGNUP_WEBHOOK_URL
   Trigger: user signup → send welcome email via Resend
   Data: { name, email, role }

2. outreach-email     N8N_PITCH_WEBHOOK_URL
   Trigger: pitch approved for email → send via Resend
   Data: { to_email, subject, body, from_name }

3. outreach-linkedin  N8N_LINKEDIN_WEBHOOK_URL
   Trigger: pitch approved for LinkedIn → LinkedIn API
   Data: { recipient_urn, message_text }

4. outreach-instagram N8N_INSTAGRAM_WEBHOOK_URL
   Trigger: pitch approved for Instagram → Meta Graph API
   Data: { recipient_id, message_text }

5. reply-notify       N8N_REPLY_WEBHOOK_URL
   Trigger: client replies → create Notification in MongoDB
   Data: { userId, clientId, message }

6. deal-funded        N8N_DEAL_WEBHOOK_URL
   Trigger: Stripe payment captured → update deal + notify
   Data: { dealId, amount, clientName }

7. deal-paid          N8N_PAYOUT_WEBHOOK_URL
   Trigger: client confirms delivery → release + notify
   Data: { dealId, payoutAmount, freelancerEmail }

8. followup-reminder  scheduled — daily 10am
   Check OutreachRecords older than 5 days status=sent no reply
   Create reminder Notification

9. limit-warning      N8N_SIGNUP_WEBHOOK_URL
   Trigger: user hits 80% monthly limit → upgrade email
   Data: { email, name, used, total, plan }

---

## SECTION 12 — STRIPE ESCROW FLOW

Step 1: Create PaymentIntent (capture_method: manual)
Step 2: Generate payment link → n8n sends to client
Step 3: Stripe webhook payment_intent.amount_capturable_updated
        → verify signature → update deal to funded
Step 4: Client confirms delivery → capture intent
        → commission = price * 0.08
        → payout = price - commission
Step 5: Stripe Connect transfer to freelancer stripeAccountId

Always verify Stripe webhook signature:
stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

---

## SECTION 13 — PROTECTED FILES

NEVER modify once working:
app/(auth)/           — auth pages
app/(dashboard)/      — dashboard pages
app/api/auth/         — NextAuth routes
lib/jwt.ts            — JWT utilities
lib/auth.ts           — cookie helpers
lib/db.ts             — MongoDB singleton
lib/models/           — all schemas
auth.ts               — NextAuth config
middleware.ts         — route protection
.env.local            — never commit

---

## SECTION 14 — STITCH MCP USAGE

Use BEFORE: Hero, Problem, HowItWorks, Features, Pricing, FinalCTA

How: Tell Antigravity: "Send this prompt to Stitch MCP in Experimental Mode
(Gemini 2.5 Pro). Use the generated mockup as visual reference before building."

Base format: "Dark SaaS [SECTION] for FreelanceOS freelancer automation.
Dark #08080F bg. Red #FF2D2D accent sparingly. Inter font.
Editorial minimal Linear.app style. Mobile-first. [SPECIFIC REQUIREMENTS]"

After Stitch generates → view at stitch.withgoogle.com →
use as reference → build in Next.js/Tailwind (don't copy Stitch HTML)

---

## SECTION 15 — CODERABBIT CHECKLIST

Fix ALL flags before next task:
[ ] Zero hardcoded hex (CSS variables only)
[ ] Red accent max 3-4 per section
[ ] Every whileInView has once:true
[ ] Zero canvas or requestAnimationFrame
[ ] Zero custom cursor
[ ] Zero rotateX/rotateY on scroll
[ ] Stripe keys server-side only (no NEXT_PUBLIC_ for secrets)
[ ] Apify only in API routes
[ ] Session check on every protected route before DB
[ ] TypeScript strict — zero any types
[ ] 375px no horizontal scroll
[ ] Skeleton on all async components
[ ] No emoji icons (lucide-react only)
[ ] n8n non-blocking (fire and forget)
[ ] Stripe webhook signature verified
[ ] npm run build 0 errors

---

## SECTION 16 — COMPLETE 48-TASK BUILD PLAN

PHASE 1 — FOUNDATION (DONE)
T1: Folder + deps + .env.local                          DONE
T2: globals.css color system + keyframes                DONE
T3: tailwind.config.ts design tokens                    DONE
T4: Navbar + Footer + Container + Sidebar               DONE

PHASE 2 — REUSABLE UI COMPONENTS
T5: SectionBadge + WobbleCard + AnimatedCounter
    components/ui/SectionBadge.tsx
    components/ui/WobbleCard.tsx
    components/ui/AnimatedCounter.tsx
    Verify: all 3 render correctly

T6: Scroll character 4 states
    components/anime/FreelancerCharacter.tsx
    Verify: all 4 states visible + scroll transitions smooth

PHASE 3 — LANDING PAGE
T7:  Hero (Stitch MCP first)             components/sections/Hero.tsx
T8:  Logo Marquee                        components/sections/LogoMarquee.tsx
T9:  Problem (Stitch MCP first)          components/sections/Problem.tsx
T10: How It Works (Stitch MCP first)     components/sections/HowItWorks.tsx
T11: Features Bento (Stitch MCP first)   components/sections/Features.tsx
T12: Success Numbers                     components/sections/SuccessNumbers.tsx
T13: Testimonials                        components/sections/Testimonials.tsx
T14: Pricing (Stitch MCP first)          components/sections/Pricing.tsx
T15: FAQ                                 components/sections/FAQ.tsx
T16: Final CTA (Stitch MCP first)        components/sections/FinalCTA.tsx
T17: Assemble page.tsx + Lenis           app/page.tsx + lib/lenis.ts

PHASE 4 — AUTH
T18: NextAuth config + MongoDB adapter   auth.ts + app/api/auth/
T19: Signup page + API                   app/(auth)/signup/
T20: Login page                          app/(auth)/login/
T21: Middleware + protected routes       middleware.ts
T22: n8n welcome email on signup

PHASE 5 — DASHBOARD
T23: Dashboard layout + top bar          app/(dashboard)/layout.tsx
T24: Dashboard overview real stats       app/(dashboard)/dashboard/

PHASE 6 — CLIENT DISCOVERY
T25: Discovery search UI                 app/(dashboard)/discover/
T26: Apify integration + results         app/api/discover/
T27: Gap detection                       lib/gapDetector.ts
T28: Manual paste + Groq parse           ManualPaste component
T29: Save clients to MongoDB             app/api/clients/

PHASE 7 — PITCH ENGINE
T30: Groq 3-call pipeline                lib/groq.ts
T31: Pitch form auto-fills               PitchForm component
T32: Output tabs + copy + approve        OutputTabs component

PHASE 8 — OUTREACH
T33: Outreach queue table                app/(dashboard)/outreach/
T34: n8n email send trigger
T35: n8n LinkedIn + Instagram triggers
T36: Daily rate limit enforcement

PHASE 9 — NOTIFICATIONS
T37: Notification bell + page            app/(dashboard)/notifications/
T38: n8n reply webhook → notification
T39: Follow-up reminder n8n scheduled

PHASE 10 — DEALS + ESCROW
T40: Deal creation form + list           app/(dashboard)/deals/
T41: Stripe PaymentIntent + escrow       app/api/deals/
T42: Payment link generation             app/api/deals/payment-link/
T43: Delivery confirm + release          app/api/deals/release/
T44: Stripe Connect payout               app/api/deals/payout/

PHASE 11 — SETTINGS
T45: Settings page all tabs              app/(dashboard)/settings/

PHASE 12 — POLISH + DEPLOY
T46: Mobile audit 375px 768px 1024px
T47: Skeleton loaders + Sonner toasts everywhere
T48: Final build + Vercel deploy

---

## SECTION 17 — RALPH LOOP CONFIGURATION

Task file: CLAUDE.md (this file in project root)
Mode: Balanced
Max iterations: 100
Git: enabled — commit after each verified task
Branch: ralph-loop/session-[date]

Instructions:
1. Read ENTIRE CLAUDE.md before starting
2. Check which tasks are DONE above
3. Pick next incomplete task
4. Use Stitch MCP for any landing section
5. Build completely
6. npx tsc --noEmit → must be 0 errors
7. npm run dev → visually verify in browser
8. Fix all issues before proceeding
9. Commit + push
10. Wait for CodeRabbit → fix ALL flags
11. Move to next task
STOP if: TypeScript errors exist / build fails /
Stitch not reviewed for landing sections

---

## SECTION 18 — GSD INSTRUCTIONS

Enforces one task at a time automatically.
Never manually combine tasks.
If a task feels large, split it smaller.
One task = one verifiable unit = one commit.

---

## SECTION 19 — OPENCODE BACKUP

When Antigravity quota hits:
cd ~/Desktop/FreelanceOS && opencode
Select: Qwen3.6 Plus Free (High variant)
Paste same prompt — CLAUDE.md context is same.

---

## SECTION 20 — START MESSAGE

When Pranay first messages, say:
"I have read the complete FreelanceOS master build document.
T1-T4 are done. Starting T5 now.
Stitch MCP for all landing sections.
One task. Zero errors. 110% perfection.
Here is the T5 prompt:"
[Give T5 prompt immediately]

---

*FreelanceOS CLAUDE.md v2.0*
*PitchSnap was the training. FreelanceOS is the mission.*

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

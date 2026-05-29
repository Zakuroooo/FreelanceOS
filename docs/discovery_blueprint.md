# FreelanceOS — /discover Discovery Console Blueprint
# Final Version — Validated by Antigravity + Codex + Claude Code
# Read before writing any /discover code

---

## PRODUCT GOAL

/discover is not a lead list. It is a **local client operating console**.

It does 5 jobs in one flow:
1. Find all relevant businesses in a locality (no hiding small businesses)
2. Prioritize the best outreach opportunities with role-aware scoring
3. Diagnose each business's likely digital/business problems
4. Tell the freelancer whether they can realistically do the work
5. Prepare the next action: pitch, save, ignore, or find similar

---

## CORE PHILOSOPHY (GOLDEN RULES)

- Scores **rank**, but never **exclude**. Every local business stays visible.
- Every lead must answer: *why this business? what is wrong? what can I offer? can I do this? what should I say?*
- The UI must feel like an **industrial terminal instrument panel**, not a generic SaaS dashboard.
- If screenshotted with the logo removed, the page must still be recognizable as FreelanceOS.
- **Zero-cost constraint:** Groq (free tier) + Google PageSpeed (25k/day free) + local n8n. No paid APIs.
- Performance budget: max 10 animated elements simultaneously. No canvas. No requestAnimationFrame loops.

---

## DIFFERENTIATION STATEMENT

Most tools say: *"Here are leads."*  
FreelanceOS says: *"Here are all businesses in this locality. Here are the ones to contact first. Here is what is wrong. Here is whether you can solve it. Here is exactly what to say."*

That is the moat.

---

## SYSTEM MODES

| Mode | Description |
|---|---|
| **Coverage Mode** | Show ALL businesses in the locality. No filtering by score. |
| **Priority Mode** | Sort by role-aware opportunity score. Best leads first. |
| **Hidden Gold Mode** | Filter for high real-world signals + weak digital execution. |
| **Role Match Mode** | Re-rank based on freelancer's professional role. |

---

## PAGE LAYOUT

### 1. Top Command Rail (sticky)
```
[ BUSINESS TYPE INPUT ] [ LOCALITY INPUT ] [ RADIUS ▾ ] [ DENTISTS ] [ SALONS ] [ REALTORS ] [ LAW FIRMS ] ... [ SCAN ▶ ]
                                [ COVERAGE | PRIORITY | GOLD | ROLE MATCH ] [ SORT ▾ ] [ SHOW IGNORED ]
```
- Mono font, hardware-style segmented toggles
- Niche presets: DENTISTS / SALONS / GYMS / REALTORS / CAFES / LAW FIRMS / COACHES / AGENCIES
- Radius: 5km / 10km / 25km / City / District
- Keyboard shortcut hints visible (subtle, right-aligned)

### 2. Live Status Strip
```
FOUND: 47  |  NEW: 23  |  CACHED: 24  |  HIDDEN GOLD: 3  |  INTEL READY: 12  |  ROLE MATCH: 8  |  API SAVED: 19
```
- Monospace font, uppercase labels
- Separated by thin vertical dividers
- Feels like a mission control readout
- Updates live as intel loads

### 3. Scan View (Main Results Surface)
- Desktop: dense tactical table/list hybrid
- Mobile: stacked intel cards with sticky quick-action row

### 4. Intel Drawer
- Desktop: slides in from right (replaces right column)
- Mobile: full-height bottom sheet
- Does NOT navigate away from results

### 5. Pitch Modal (from Intel Drawer)
- Two tabs: `[ AI DRAFT ]` and `[ MY PITCH ]`
- Both flow into the outreach queue

### 6. Bulk Action Bar
- Appears at bottom when ≥2 leads selected
- Actions: Bulk Save / Bulk Ignore / Bulk Queue / Bulk Generate Pitch / Bulk Tag

---

## RESULT ROW / CARD SPEC

Each row/card shows:

| Field | Detail |
|---|---|
| Business Name | Bold mono, truncated at 32 chars |
| Category | Muted label |
| Locality | Muted label |
| Score Ring | 8-segment SVG arc, steel→cyan→lime. NOT canvas. |
| Confidence Chip | `[ SCRAPED ]` `[ INFERRED ]` `[ VERIFIED ]` `[ GUESSED ]` |
| Badges | `[ HIDDEN GOLD ]` `[ GOOD FIT ]` `[ NEEDS MOBILE FIX ]` `[ LOW CONFIDENCE ]` |
| Issue Chips | `No CTA` `Slow Site` `Weak Social` `No Booking` `Dead Links` |
| Contact Icons | Globe / Email / Phone / Instagram / WhatsApp (lit = available) |
| Lead State Tag | `NEW` `SEEN` `SAVED` `PITCHED` `IGNORED` `WON` `LOST` |
| Intel Status | `LIGHT SCAN` `PREFETCHING` `INTEL READY` `INTEL STALE` |
| Quick Buttons | `INTEL` `PITCH` `SAVE` `IGNORE` `SIMILAR` |

---

## INTEL DRAWER SPEC

Opens from row without leaving page. Sections load with 40ms stagger (header first, then each panel).

### Section Order:

**1. Header**
- Business name, category, location, lead state badge
- Source confidence chip, score ring (large), intel freshness

**2. Why This Lead**
- One-paragraph Groq-generated summary
- Example: *"This clinic has 4.6 stars and consistent reviews but a broken mobile site, no booking CTA, and a dead Instagram link. High contactability via email."*

**3. Business Snapshot**
- Rating, review count, website status, active socials, phone/email, source origin, intel generated timestamp

**4. Detected Problems** (flat checklist)
- [ ] Slow mobile page (PageSpeed < 50)
- [ ] Weak or missing CTA
- [ ] No booking/contact funnel
- [ ] Missing social links
- [ ] Outdated branding signals
- [ ] No Google review strategy
- [ ] No SSL / poor mobile UX
- [ ] Dead social accounts

**5. Opportunity Summary**
- Opportunity Score (0-100)
- Confidence level
- Urgency (LOW / MEDIUM / HIGH)
- Contactability (LOW / MEDIUM / HIGH)
- Hidden Gold flag (yes/no)

**6. Service Match**
What the freelancer can offer this specific client:
- Website Redesign
- Landing Page Optimization
- Local SEO
- Social Media Setup
- Booking Funnel Fix
- Branding Cleanup
- Speed Optimization
- Automation Setup

**7. Freelancer Readiness Gate** *(First-class, not implied)*
Display clearly:
```
CAN YOU DO THIS WELL?
Service: Website Redesign + Mobile Optimization
Complexity: MEDIUM
Estimated Work: 2-3 weeks
```
Labels: `STRONG FIT` / `PARTIAL FIT` / `NOT YOUR LANE`
Reason text: *"You can pitch this if you offer web redesign + mobile optimization."*

**8. Requirements Needed**
What you'll need if the client says yes:
- [ ] Website/CMS access
- [ ] Hosting access
- [ ] Brand assets (logo, colors)
- [ ] Analytics access
- [ ] Social account access
- [ ] Current booking flow details
- [ ] Copy/product details

**9. Pitch Angle**
*"Lead with lost bookings from poor mobile UX, not visual aesthetics."*

**10. Icebreaker**
Short personalized opener Groq generates:
*"Noticed your clinic has great reviews but the mobile booking page takes 8 seconds to load — that's likely costing you new patients every week."*

**11. Action Cluster**
```
[ GENERATE PITCH ] [ WRITE MY PITCH ] [ SAVE TO OUTREACH ] [ FIND SIMILAR ] [ ADD NOTE ] [ IGNORE ]
```

---

## PITCH MODAL SPEC

Triggered from Intel Drawer `[ GENERATE PITCH ]` or `[ WRITE MY PITCH ]`.

**Two tabs:**

### Tab 1: `[ AI DRAFT ]`
- Pre-filled from Intel payload: pitch angle + business context + problem summary
- User can edit inline
- Word count shown per channel

### Tab 2: `[ MY PITCH ]`
- Clean textarea, blank or with template hint
- User writes their own or pastes external pitch

**Both tabs support:**
- Save Draft
- Queue to Outreach
- Mark as Pitched

---

## INTEL PAYLOAD — DATA MODEL

Fields to store per enriched lead:

```typescript
{
  opportunityScore: number,          // 0-100, role-aware
  confidence: number,                // 0-100
  painPoints: string[],              // flat list of detected issues
  problemSummary: string,            // 1-paragraph plain language
  hiddenGold: boolean,
  serviceMatch: string[],            // recommended services
  freelancerFit: 'strong' | 'partial' | 'none',
  freelancerFitReason: string,
  requirementsNeeded: string[],
  pitchAngle: string,
  icebreaker: string,
  urgency: 'low' | 'medium' | 'high',
  contactability: 'low' | 'medium' | 'high',
  sourceConfidence: 'verified' | 'scraped' | 'inferred' | 'guessed',
  sourceOrigin: string,              // "Apify" | "Google Places" | "SERP" | "cache"
  intelStatus: 'light_scan' | 'prefetching' | 'ready' | 'stale',
  intelGeneratedAt: Date,
  intelStaleAt: Date,                // intelGeneratedAt + 30 days
  leadState: 'new' | 'seen' | 'saved' | 'pitched' | 'responded' | 'won' | 'lost' | 'ignored',
  notes: string,
}
```

---

## SOURCE TRANSPARENCY — STRICT DEFINITIONS

| Label | Meaning |
|---|---|
| `VERIFIED` | Contact directly confirmed (Google My Business, responded ping) |
| `SCRAPED` | Found directly from platform/page — unconfirmed but direct |
| `INFERRED` | Derived from surrounding data (e.g., `info@domain.com` from site) |
| `GUESSED` | Pattern-generated from domain name — low confidence |

Visible on both row and in Intel Drawer header.

---

## DYNAMIC SCORING MODEL

Score is 0-100, **role-aware**. Same business gets different scores for different freelancer roles.

**Score inputs:**

| Signal | Weight |
|---|---|
| Digital weakness (no site, broken, slow) | High |
| Business demand signals (reviews, activity) | High |
| Service-role fit | High |
| Contactability | Medium |
| Locality relevance | Medium |
| Review/reputation signals | Medium |
| Website quality (PageSpeed) | Medium |
| Social presence gaps | Medium |
| CTA/booking weakness | Medium |
| Data freshness/confidence | Low |

**Rules:**
- Score = ranking tool only. Never hides a business.
- A web dev sees "Slow Mobile Site" leads ranked #1.
- A social media manager sees "No Instagram / No Engagement" leads ranked #1.

---

## PROGRESSIVE INTEL LOADING STRATEGY

1. Search returns → **light scan instantly** (cheap signals: cache, basic checks)
2. Lightweight score renders immediately
3. User **hovers row for 400ms** → silent Groq prefetch starts
4. User **clicks Intel** → intel is already loaded (feels instant)
5. If not ready → skeleton + staged section loading with 40ms stagger
6. Intel cached in MongoDB for 30 days (reuse across users)

**Intel Status Display:**
- `LIGHT SCAN` — basic signals only
- `INTEL PREFETCHING` — Groq call in flight
- `INTEL READY` — full payload available
- `INTEL STALE` — older than 30 days, regenerate on next open

---

## LEAD MEMORY STATES

Persistent across sessions:

| State | Color | Meaning |
|---|---|---|
| `NEW` | Ice cyan | Never seen before |
| `SEEN` | Steel gray | Viewed but no action |
| `SAVED` | Accent dim | Saved to client list |
| `PITCHED` | Warning amber | Pitch sent |
| `RESPONDED` | Success teal | Client replied |
| `WON` | Success teal (bold) | Deal closed |
| `LOST` | Error red (dim) | Opportunity gone |
| `IGNORED` | Muted | Deliberately skipped |

---

## LOOKALIKE ENGINE

Every strong lead has `[ FIND SIMILAR ]`:
- Same niche category
- Same locality radius
- Similar review/rating band
- Same digital weakness pattern

This allows the freelancer to scale proven niches infinitely.

---

## BULK ACTIONS (MULTI-SELECT)

When ≥2 rows selected, bottom bar appears:
```
[ BULK SAVE ] [ BULK IGNORE ] [ BULK QUEUE ] [ BULK GENERATE PITCH ] [ BULK TAG ▾ ]
```
Bulk pitch generation only for leads with `INTEL READY` status.

---

## KEYBOARD NAVIGATION LAYER

| Key | Action |
|---|---|
| `J` | Next row |
| `K` | Previous row |
| `I` | Open Intel Drawer |
| `Esc` | Close drawer |
| `P` | Generate Pitch (for focused row) |
| `S` | Save lead |
| `X` | Ignore lead |
| `F` | Find Similar |
| `Space` | Toggle select (for bulk) |
| `?` | Show keyboard shortcut help |

---

## TERMINAL EMPTY STATE

When 0 results found — do NOT show a sad illustration. Show:
```
> SCAN COMPLETE
> LOCALITY: "dentists in mumbai"
> RECORDS FOUND: 0
> SUGGESTION: BROADEN RADIUS OR CHECK NICHE SPELLING
> CACHE STATUS: MISS — NO PRIOR DATA FOR THIS QUERY
> TRY: [ DENTISTS ] [ SALONS ] [ GYMS ] or expand radius to 25km
```

---

## FRONTEND AESTHETIC — INDUSTRIAL UTILITARIAN + TACTICAL FUTURIST

**DFII Score: 15/15 — Execute Fully**

### Design Rules
- Background: near-black layered graphite (`#08080F` + `#0F0F1A`), never flat black
- Typography: **JetBrains Mono** for all control/metric/badge/dense UI elements
- Accent: `#FF2D2D` (red) for pain signals and urgency only (max 3-4x per section)
- Secondary: ice-cyan (`#22D3EE`) for intel states and active focus
- Success: `#00C9A7` for fit and gold signals
- Warning: `#F59E0B` for amber/pitched states
- Shapes: crisp corners, small radius (2-4px max), inset panels, beveled hardware buttons
- Borders: thin steel outlines (`rgba(255,255,255,0.07)`), glowing active border on focus

### Score Ring
- Pure SVG, 8 segments, CSS animation only
- Colors: steel-gray (low) → ice-cyan (mid) → accent-lime (high)
- **No canvas. Ever.**

### Motion Rules
- Row reveal: stagger on result load (40ms per row, opacity 0→1, y: 8→0)
- Score ring: sweep animation on render (`stroke-dashoffset`, CSS only)
- Intel drawer: slide-in with `cubic-bezier(0.16, 1, 0.3, 1)`, sections stagger 40ms
- Metric strip: count-up on change (Framer Motion, `once:true`)
- Badge pulse: only on `NEW` intel or `HIDDEN GOLD` (not decorative)
- Skeleton shimmer: CSS `@keyframes` only, for intel loading

### Forbidden
- No canvas or requestAnimationFrame loops
- No rotateX/rotateY on scroll  
- No custom cursor
- No blue/purple gradients
- No emoji as icons (lucide-react only)
- No rounded consumer-app button defaults

---

## IMPLEMENTATION PHASES

| Phase | Name | What Ships |
|---|---|---|
| **1** | Scan View Upgrade | Command rail, improved rows/cards, score badge, lead state tags, quick actions, bulk select, keyboard nav, terminal empty state |
| **2** | Intel Drawer | Full drawer with all 11 sections, skeleton loading, source transparency, fit check, requirements block |
| **3** | Progressive Loading | Hover/focus prefetch, cached intel lifecycle, freshness states, status indicators |
| **4** | Role-aware Scoring | Role input from user profile, scoring profiles per role, mode switching |
| **5** | Pitch Modal + Override | AI Draft tab, My Pitch tab, queue/save/send flow, pitch handoff to outreach |
| **6** | Lookalikes + Bulk Ops | Find Similar engine, bulk queue, bulk pitch, bulk tagging |
| **7** | Learning Layer | Track what converts, which pain points close, which angles work, niche performance |

---

## DECISION LOG

| Decision | Alternatives | Reason |
|---|---|---|
| Groq for Intel generation | OpenAI, Gemini | Free tier, fastest inference, already in stack |
| Hover-prefetch for Intel | On-click load, Bulk preload | Balances speed vs. API cost. Feels instant, stays free |
| SVG/CSS Score Ring | Canvas gauge, Chart.js | Zero canvas rule. Pure CSS is GPU-accelerated |
| Pitch Override: 2-tab modal | Separate page, inline edit | Keeps flow inside the Intel Drawer, no navigation away |
| Source confidence: 4 labels | Binary verified/unverified | More honest, helps trust, critical for legal safety |
| Keyboard navigation layer | Mouse-only | Power users judge tools by speed. Linear.app precedent |
| Terminal empty state | Sad illustration | Matches aesthetic, feels premium, gives actionable suggestions |
| Scoring ranks, never excludes | Score-gated visibility | Protects small businesses, matches freelancer real-world behavior |

---

*FreelanceOS Discovery Blueprint — Final Version — All agents aligned.*
*Implement Phase 1 first. Do not skip to Phase 3 without Phase 1-2 complete.*

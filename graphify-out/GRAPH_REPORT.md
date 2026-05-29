# Graph Report - FreelanceOS  (2026-05-12)

## Corpus Check
- 90 files · ~217,565 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 630 nodes · 686 edges · 47 communities (34 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10ceabe9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Layout Components|Layout Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Ui Components|Ui Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Src Components|Src Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Lib Components|Lib Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Module Components|Module Components]]
- [[_COMMUNITY_Sections Components|Sections Components]]
- [[_COMMUNITY_Anime Components|Anime Components]]
- [[_COMMUNITY_Ui Components|Ui Components]]
- [[_COMMUNITY_Ui Components|Ui Components]]
- [[_COMMUNITY_Ui Components|Ui Components]]
- [[_COMMUNITY_Layout Components|Layout Components]]
- [[_COMMUNITY_Freelanceos Components|Freelanceos Components]]
- [[_COMMUNITY_Freelanceos Components|Freelanceos Components]]
- [[_COMMUNITY_Eslint Components|Eslint Components]]
- [[_COMMUNITY_Freelanceos Components|Freelanceos Components]]
- [[_COMMUNITY_Auth Components|Auth Components]]
- [[_COMMUNITY_Next Components|Next Components]]
- [[_COMMUNITY_Readme Components|Readme Components]]
- [[_COMMUNITY_Agents Components|Agents Components]]
- [[_COMMUNITY_Claude Components|Claude Components]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `This document IS the project. Follow it exactly.` - 23 edges
2. `Read before writing any /discover code` - 21 edges
3. `cn()` - 20 edges
4. `Framer Motion Animations` - 20 edges
5. `Version 1.0 | Read alongside PRD_FREELANCEOS.md` - 15 edges
6. `fetch` - 13 edges
7. `FreelanceOS — Complete Project Status` - 13 edges
8. `SECTION 4 — LANDING PAGE (12 SECTIONS)` - 13 edges
9. `FreelanceOS — Project Documentation v1.0` - 12 edges
10. `Version 1.0 | Read this before writing any code` - 12 edges

## Surprising Connections (you probably didn't know these)
- `test()` --calls--> `fetch`  [INFERRED]
  test-scrape.js → test-apify.js
- `checkWebsite()` --calls--> `fetch`  [INFERRED]
  test-website.js → test-apify.js
- `run()` --calls--> `fetch`  [INFERRED]
  test_apify.js → test-apify.js
- `fetchViaApify()` --calls--> `fetch`  [INFERRED]
  src/app/api/discover/route.ts → test-apify.js
- `fetchViaSerpApi()` --calls--> `fetch`  [INFERRED]
  src/app/api/discover/route.ts → test-apify.js

## Communities (47 total, 13 thin omitted)

### Community 0 - "Layout Components"
Cohesion: 0.05
Nodes (42): BulkAction, BulkActionBar(), DiscoverEmpty(), QUICK_PRESETS, DiscoverFilters(), DiscoverMode, DiscoverSort, PRESETS (+34 more)

### Community 1 - "Sections Components"
Cohesion: 0.05
Nodes (43): 1. Top Command Rail (sticky), 2. Live Status Strip, 3. Scan View (Main Results Surface), 4. Intel Drawer, 5. Pitch Modal (from Intel Drawer), 6. Bulk Action Bar, BULK ACTIONS (MULTI-SELECT), code:block1 ([ BUSINESS TYPE INPUT ] [ LOCALITY INPUT ] [ RADIUS ▾ ] [ DE) (+35 more)

### Community 2 - "Ui Components"
Cohesion: 0.08
Nodes (25): LABELS, SourceChip(), SourceConfidence, STYLES, cn(), CARDS, EncryptedText(), EncryptedTextProps (+17 more)

### Community 3 - "Sections Components"
Cohesion: 0.05
Nodes (39): 10. KEY DECISIONS MADE, 11. NEXT STEPS (Priority Order), 12. WHAT TO KEEP DOING, 2. COMPONENTS BUILT, 3. ROUTES BUILT, 4. DATABASE MODELS, 5. ANIMATION DETAILS BY SECTION, 6. ANIME CHARACTER (FreelancerCharacter.tsx) (+31 more)

### Community 4 - "Sections Components"
Cohesion: 0.06
Nodes (34): ANIMATION ARCHITECTURE, ANTI-PATTERNS — NEVER DO THESE, API ROUTES — COMPLETE LIST, Client, code:block1 (~/Desktop/FreelanceOS/), code:typescript (export async function triggerN8n(webhookUrl: string, data: o), code:block11 (You are an expert freelance pitch writer who writes concise,), code:block12 (app/(auth)/          — auth pages) (+26 more)

### Community 5 - "Src Components"
Cohesion: 0.08
Nodes (19): DELETE(), GET(), POST(), client, clientOptions, dbConnect(), MongooseCache, ClientSchema (+11 more)

### Community 6 - "Sections Components"
Cohesion: 0.06
Nodes (30): Animation Roadmap, code:block1 (Background:     #060608 (near-black)), code:block2 (Display:  clamp(52px, 8vw, 96px) — 800 weight, -0.04em track), code:block3 (--radius-sm:  2px), code:block4 (Framework:      Next.js 16.2.3 (React 19.2.4)), code:block5 (section-badge      — Red dot + uppercase label), Colors, Core Components (+22 more)

### Community 7 - "Sections Components"
Cohesion: 0.1
Nodes (23): countSocials(), EnrichedClient, enrichPlace(), fetchViaApify(), fetchViaFoursquare(), fetchViaGooglePlaces(), fetchViaSerpApi(), guessHandle() (+15 more)

### Community 8 - "Lib Components"
Cohesion: 0.08
Nodes (10): inter, metadata, TerminalLine, terminals, DOCK_ITEMS, LINKS, DASHBOARD_PREFIXES, NAV_LINKS (+2 more)

### Community 9 - "Sections Components"
Cohesion: 0.07
Nodes (6): FAQS, FEATURES, FLIGHT_PATHS, LOGOS, monoFont, TESTIMONIALS

### Community 10 - "Module Components"
Cohesion: 0.09
Nodes (22): AnimatedDashboard (AnimatedDashboard.tsx), Animations — Complete Inventory, CSS Animations (globals.css), EncryptedText (encrypted-text.tsx), FAQ (FAQ.tsx), Features (Features.tsx), FinalCTA (FinalCTA.tsx), FloatingDock (floating-dock.tsx) (+14 more)

### Community 11 - "Sections Components"
Cohesion: 0.1
Nodes (9): C, CLIENTS, CTX, container, dashboardIn, fadeUp, ROLES, SparklesCore() (+1 more)

### Community 12 - "Anime Components"
Cohesion: 0.1
Nodes (19): CONSTRAINTS, FreelanceOS — Product Requirements Document (PRD), LANDING PAGE SECTIONS, MODULE 1 — Client Discovery, MODULE 2 — AI Pitch Engine (extended from PitchSnap), MODULE 3 — Outreach Engine, MODULE 4 — Notifications + CRM, MODULE 5 — Deals + Escrow (+11 more)

### Community 13 - "Ui Components"
Cohesion: 0.12
Nodes (17): CRITICAL RULES — VIOLATING ANY = TASK FAILURE, graphify, SECTION 10 — GROQ PITCH PROMPTS, SECTION 11 — N8N WORKFLOWS (9 TOTAL), SECTION 12 — STRIPE ESCROW FLOW, SECTION 13 — PROTECTED FILES, SECTION 14 — STITCH MCP USAGE, SECTION 15 — CODERABBIT CHECKLIST (+9 more)

### Community 14 - "Ui Components"
Cohesion: 0.14
Nodes (10): DashboardOverviewPage(), fadeDown, fadeUp(), QUICK_ACTIONS, SPRING, STAT_CARDS, StatsData, useTypingEffect() (+2 more)

### Community 15 - "Ui Components"
Cohesion: 0.18
Nodes (8): AVATARS, LEFT_CARDS, RIGHT_CARDS, CardBody(), CardContainer(), CardItem(), MouseEnterContext, MouseEnterContextType

### Community 16 - "Layout Components"
Cohesion: 0.15
Nodes (8): { auth }, config, isProtected, protectedRoutes, { auth }, config, isProtected, protectedRoutes

### Community 17 - "Freelanceos Components"
Cohesion: 0.15
Nodes (13): FAQ — T15, Features Bento — T11, Final CTA — T16, Footer (already built — T4), Hero — T7, How It Works — T10, Logo Marquee — T8, Navbar (already built — T4) (+5 more)

### Community 18 - "Freelanceos Components"
Cohesion: 0.18
Nodes (4): cardRow, getAudioContext(), playKeystroke(), STEPS

### Community 20 - "Freelanceos Components"
Cohesion: 0.2
Nodes (10): 1. DESIGN SYSTEM, Animation System, code:css (/* Logo marquee — horizontal scroll */), code:javascript (// tailwind.config.ts animation map), code:typescript (// Variants for staggered entry), Colors (CSS Variables in globals.css), CSS @keyframes (globals.css + tailwind.config.ts), Framer Motion (Hero.tsx example) (+2 more)

### Community 21 - "Auth Components"
Cohesion: 0.25
Nodes (6): Client Discovery Module, AI Pitch Engine Module, Outreach Engine Module, Notifications + CRM Module, Deals + Escrow Module, Settings Module

### Community 22 - "Next Components"
Cohesion: 0.29
Nodes (7): lib/models/Client.ts, lib/models/Deal.ts, lib/models/Notification.ts, lib/models/OutreachRecord.ts, lib/models/Pitch.ts, lib/models/User.ts, SECTION 8 — DATABASE MODELS

### Community 23 - "Readme Components"
Cohesion: 0.29
Nodes (7): Animation Rules, Anti-Patterns — NEVER, Color Tokens, Required UI Components, SECTION 2 — DESIGN SYSTEM (NON-NEGOTIABLE), Section Badge Pattern, Typography

### Community 24 - "Agents Components"
Cohesion: 0.29
Nodes (7): MODULE 1 — Client Discovery (/discover), MODULE 2 — AI Pitch Engine (/pitches), MODULE 3 — Outreach Engine (/outreach), MODULE 4 — Notifications + CRM (/notifications), MODULE 5 — Deals + Escrow (/deals), MODULE 6 — Settings (/settings), SECTION 3 — PRODUCT SPEC (6 MODULES)

### Community 25 - "Claude Components"
Cohesion: 0.29
Nodes (6): Assumptions, Decision Log, Discovery Pipeline: Cached Enrichment & Pagination, Final Design, Implementation Steps, Understanding Summary

### Community 27 - "Community 27"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (5): auth.ts (project root), Login Page — app/(auth)/login/page.tsx, middleware.ts, SECTION 6 — AUTH SYSTEM, Signup Page — app/(auth)/signup/page.tsx

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (3): FREELANCEOS — MASTER BUILD DOCUMENT, Read EVERY line before writing a single line of code., Version 2.0 | The Single Source of Truth

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (3): Layout — app/(dashboard)/layout.tsx, Overview — app/(dashboard)/dashboard/page.tsx, SECTION 7 — DASHBOARD

## Knowledge Gaps
- **326 isolated node(s):** `cheerio`, `config`, `config`, `cheerio`, `eslintConfig` (+321 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SourceChip()` connect `Ui Components` to `Layout Components`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `cheerio`, `config`, `config` to the rest of the system?**
  _326 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Layout Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Sections Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Ui Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Sections Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Sections Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
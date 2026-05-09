# Graph Report - .  (2026-05-10)

## Corpus Check
- 69 files · ~192,639 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 206 nodes · 217 edges · 26 communities (16 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 1,200 input · 800 output

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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 18 edges
2. `WorldMap()` - 4 edges
3. `EncryptedText()` - 3 edges
4. `POST()` - 2 edges
5. `latLngToXY()` - 2 edges
6. `isLand()` - 2 edges
7. `SparklesCore()` - 2 edges
8. `HoverBorderGradient()` - 2 edges
9. `CardContainer()` - 2 edges
10. `CardBody()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `HoverBorderGradient()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/hover-border-gradient.tsx → src/lib/utils.ts
- `FloatingDockMobile()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/floating-dock.tsx → src/lib/utils.ts
- `FloatingDockDesktop()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/floating-dock.tsx → src/lib/utils.ts
- `Navbar()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/resizable-navbar.tsx → src/lib/utils.ts
- `NavBody()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/resizable-navbar.tsx → src/lib/utils.ts

## Communities (26 total, 10 thin omitted)

### Community 0 - "Layout Components"
Cohesion: 0.07
Nodes (10): inter, metadata, TerminalLine, terminals, DOCK_ITEMS, LINKS, NAV_LINKS, navItems (+2 more)

### Community 1 - "Sections Components"
Cohesion: 0.07
Nodes (6): FAQS, FEATURES, FLIGHT_PATHS, LOGOS, monoFont, TESTIMONIALS

### Community 2 - "Ui Components"
Cohesion: 0.12
Nodes (18): cn(), FloatingDockDesktop(), FloatingDockItem, FloatingDockMobile(), HoverBorderGradient(), HoverBorderGradientProps, MobileNav(), MobileNavHeader() (+10 more)

### Community 3 - "Sections Components"
Cohesion: 0.18
Nodes (8): AVATARS, LEFT_CARDS, RIGHT_CARDS, CardBody(), CardContainer(), CardItem(), MouseEnterContext, MouseEnterContextType

### Community 4 - "Sections Components"
Cohesion: 0.18
Nodes (4): cardRow, getAudioContext(), playKeystroke(), STEPS

### Community 5 - "Src Components"
Cohesion: 0.18
Nodes (5): { handlers, signIn, signOut, auth }, { auth }, config, isProtected, protectedRoutes

### Community 6 - "Sections Components"
Cohesion: 0.18
Nodes (3): C, CLIENTS, CTX

### Community 7 - "Sections Components"
Cohesion: 0.22
Nodes (6): container, dashboardIn, fadeUp, ROLES, SparklesCore(), SparklesCoreProps

### Community 8 - "Lib Components"
Cohesion: 0.22
Nodes (7): client, clientOptions, dbConnect(), MongooseCache, IUser, UserSchema, POST()

### Community 9 - "Sections Components"
Cohesion: 0.25
Nodes (3): CARDS, EncryptedText(), EncryptedTextProps

### Community 10 - "Module Components"
Cohesion: 0.25
Nodes (6): Client Discovery Module, AI Pitch Engine Module, Outreach Engine Module, Notifications + CRM Module, Deals + Escrow Module, Settings Module

## Knowledge Gaps
- **65 isolated node(s):** `config`, `config`, `eslintConfig`, `nextConfig`, `{ auth }` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Ui Components` to `Sections Components`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `EncryptedText()` connect `Sections Components` to `Ui Components`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `config`, `config`, `eslintConfig` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Layout Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Sections Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Ui Components` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
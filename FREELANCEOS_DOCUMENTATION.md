# FreelanceOS — Project Documentation v1.0

## What We Built

FreelanceOS — a freelancer automation platform landing page. Dark, premium, Raycast-inspired. Everything documented below.

---

## Design System

### Colors
```
Background:     #060608 (near-black)
Surface:        #0D0D12
Surface-2:      #131319
Surface-3:      #1A1A22
Border:         rgba(255,255,255,0.06)
Border-hover:   rgba(255,255,255,0.12)
Text-primary:   #FAFAFA
Text-secondary: #8A8A9A
Text-muted:     #4A4A5A
Accent:         #c30101 (pure crimson red — PRIMARY accent)
Accent-dim:     rgba(196,20,37,0.12)
Accent-border:  rgba(196,20,37,0.25)
Success:        #00C9A7
Warning:        #F59E0B
Error:          #EF4444
```

### Typography
```
Display:  clamp(52px, 8vw, 96px) — 800 weight, -0.04em tracking
Heading:  clamp(32px, 4vw, 52px) — 700 weight, -0.03em tracking
Subhead:  clamp(16px, 2vw, 20px) — 400 weight
Body:     15px — 1.7 line-height
Caption:  12px
Mono:     'JetBrains Mono' — 13px, -0.01em
```

### Radius
```
--radius-sm:  2px
--radius:     4px
--radius-md:  6px
--radius-lg:  8px
--radius-pill: 9999px
```
Sharp corners everywhere. Zero rounded-pill buttons on main CTAs.

### Fonts
- **Inter** — all UI text, display, body
- **JetBrains Mono** — data, prices, code, terminal elements

### Grain Texture
Body has subtle SVG noise overlay at 3% opacity — gives premium tactile feel.

---

## Animations — Complete Inventory

### CSS Animations (globals.css)

| Name | Type | Description |
|------|------|-------------|
| `trail-drift` | Ambient | Diagonal crimson beam drift — hero light trails |
| `trail-drift-r` | Ambient | Reverse diagonal beam — second hero trail |
| `tab-progress` | Progress | Tab auto-cycle progress bar — fills 0→100% |
| `light-sweep` | Hover | Shimmer across card border on hover |
| `fade-up` | Entrance | Generic section entrance fade + translateY |
| `marquee` | Continuous | Logo marquee scroll left → infinite |
| `marquee-reverse` | Continuous | Marquee scroll right (unused) |
| `float-bob` | Ambient | Subtle Y-axis bob for floating elements |
| `float-chaos` | Ambient | Chaotic drift + rotation for character elements |
| `fly-right` | Exit | Element flies right and fades out |
| `float-up` | Exit | Element floats up and fades |
| `pin-bounce` | Ambient | Subtle bounce for pin/marker elements |
| `confetti-fall` | Celebration | Confetti drop animation |
| `sweat-drop` | Ambient | Sweat drop for character animations |
| `glow-pulse` | Ambient | Subtle opacity pulse for glow orbs — 6s loop |
| `shimmer` | Loading | Skeleton loader shimmer |
| `fade-in-down` | Entrance | Navbar entry animation |
| `scale-in` | Entrance | Subtle scale + fade entrance |
| `scroll-feed` | Continuous | Infinite vertical scroll for job listings |

### Framer Motion Animations

#### Hero (Hero.tsx)
- **TypewriterCycle** — cycles through roles: "Web Developers.", "Video Creators.", etc. 80ms typing speed, 2000ms pause, crimson color (#C41425), blinking cursor
- **Stagger container** — 0.09s delay between children, fadeUp variant (y: 20 → 0, 0.55s, custom ease)
- **Dashboard entrance** — delay 0.6s, y: 52 → 0, 0.75s, spring ease
- **Light trail drift** — CSS keyframes on diagonal crimson beams (halo + core)
- **Sparkles** — Crimson particles (120 density, 0.8 speed) behind headline, masked to ellipse
- **Grid background** — 72px grid, 1.2% opacity, masked radial to fade edges
- **Glow orb** — Pulsing crimson radial at top of hero
- **CTA buttons** — Scale 0.88 on hover, translateY -1px, enhanced box-shadow
- **Ghost CTA** — border-color + color + background transition on hover

#### Features (Features.tsx)
- **Section entrance** — fadeUp on scroll-into-view (once: true, -80px margin)
- **Card grid** — 3-column (2 on tablet, 1 on mobile), 12px gap
- **Card hover** — y: -4, border transparent, crimson border-box shadow, 0.3s
- **Card visuals** — each card has unique animated mini-visual:
  - Discovery: staggered x: -12 → 0, opacity fade in, 0.1s delay
  - Pitch: opacity fade 0.4s delay
  - Outreach: width expand 0 → % on scroll, 0.8s
  - Sequence: staggered fade-in
  - Pipeline: height expand bars 0 → calculated, 0.6s with stagger
  - Revenue: static number display

#### HowItWorks (HowItWorks.tsx)
- **Auto-cycling tabs** — 8 second interval, sound-enabled
- **Web Audio API keystroke** — synthesized click on character type, bandpass filter 3000-4500Hz, 40ms duration
- **Typewriter** — 35ms default, cursor blink (opacity pulse 0.7s), red cursor (#c30101)
- **Tab list** — 40% left, 60% right sticky layout
- **Active tab** — 3px left crimson border, blurred backdrop, crimson icon bg
- **Progress bar** — CSS animation fills width over tab duration, crimson
- **Mockup panel** — macOS traffic lights, glassmorphism, deep ambient red glow behind
- **5 unique mockups** per step — Discover, Pitch, Outreach, Pipeline, Paid
- **Discover**: Search bar typewriter → results stagger in
- **Pitch**: Multi-line typewriter with delays (0.5s, 8s, 13s)
- **Outreach**: Status typewriter → channel bars animate width
- **Pipeline**: Syncing typewriter → Kanban cards stagger in
- **Paid**: Escrow typewriter → amount reveal + scale animation

#### Testimonials (Testimonials.tsx)
- **Orbit system** — 8 testimonials on orbit paths, different radii (200-440px), speeds (-0.8 to 0.6)
- **useAnimationFrame** — mathematical angle + radius tracking for smooth orbit
- **Hover/Drag pause** — isHovered/isDragging motion values stop animation
- **Central card** — auto-cycles every 4 seconds with blur transition
- **Expand button** — triggers full orbit reveal with spring physics
- **Expand → collapse** — morphs to red core hub with rotate + scale
- **Orbit cards** — draggable, spring bounce on enter (0.6s, bounce 0.3), stagger 0.05s
- **Hover state** — crimson border + enhanced shadow

#### Pricing (Pricing.tsx)
- **Card entrances** — staggered fadeUp (0.05s delays)
- **Brutalist layout** — 3-column grid, text block floats in middle
- **Agency tier** — spans all 3 columns, bottom row
- **Button hover** — background invert on Free tier, color deepen on Pro

#### FAQ (FAQ.tsx)
- **Accordion** — AnimatePresence height 0→auto, 0.28s ease
- **Icon rotation** — Plus → X on open, color crimson
- **Hover state** — subtle bg overlay on non-open items
- **Glass panel** — 20px blur backdrop, inset top highlight

#### LogoMarquee (LogoMarquee.tsx)
- **Blur-flip logo** — rotateX 360° every 5s per logo, blur during flip
- **Stagger delay** — 700ms * index before starting interval
- **In-view animation** — fade-in on scroll entry

#### GlobeCTA (GlobeCTA.tsx)
- **WorldMap** — SVG dot grid for landmasses, latLngToXY projection
- **Flight paths** — curved paths (Q bezier), pathLength 0→1 animation, 1.5s delay per path
- **Dot glow** — scale pulse [1, 1.8, 1] + opacity pulse, 2s loop with stagger
- **Scale entrance** — 0 → 1 scale with 0.7s duration, 0.2s delay

#### FinalCTA (FinalCTA.tsx)
- **3D tilt cards** — Aceternity-style CardContainer, translateZ 100 for image, 20 for label
- **Avatar row** — scale 1.25 on hover, crimson border, -10px overlap
- **Stagger entrances** — 0.05s to 0.35s delays
- **Pill CTAs** — gradient crimson, box-shadow glow, translateY on hover

#### Problem (Problem.tsx)
- **Scrolling feed** — CSS infinite scroll 12s, mask gradient top/bottom
- **EncryptedText** — scramble reveal on hover (no trigger), 40ms per char
- **Invoice counter** — useEffect countdown 350ms intervals, reset at 0
- **Bento grid** — 3 cards, whileHover y: -6, crimson border glow

#### SuccessNumbers (SuccessNumbers.tsx)
- **AnimatedCounter** — counts from 0 to target on scroll-into-view, 2.5s duration
- **Stagger delay** — 0.15s between metrics
- **Gradient text** — white to 65% opacity, text-shadow glow
- **Vertical dividers** — linear gradient fades

#### AnimatedDashboard (AnimatedDashboard.tsx)
- **Full simulation loop** — cursor movement, typing, row selection, context menu, pitch panel, success toast
- **Cursor** — custom SVG arrow, 0.72s cubic-bezier transition, ripple on click
- **Typewriter** — 65ms typing speed, blinking cursor
- **Client list** — staggered opacity + translateY per row
- **Glassmorphism** — 32-48px blur, 150-200% saturate, low opacity bg (crimson bleeds through)
- **Context menu** — scale 0.93→1, opacity, 0.18s transition
- **Pitch panel** — fade-up animation, 0.3s
- **Success toast** — translateY -12→0, 0.3s, opacity
- **Ambient glows** — multiple radial gradients inside the canvas for depth
- **macOS menubar** — Apple logo SVG, full menu bar with status icons
- **Dock** — bottom floating dock with app icons

#### FloatingDock (floating-dock.tsx)
- **Desktop** — useMotionValue for mouse X, useTransform distance calculations
- **Spring physics** — mass 0.1, stiffness 150, damping 12 for icon scaling
- **Icon scale** — 40→70→40px based on mouse distance
- **Label tooltip** — opacity + y animation on hover
- **Mobile** — AnimatePresence, y: 10 stagger on open/close

#### Navbar (Navbar.tsx)
- **Scroll-responsive** — useScroll, maxWidth 860→1050, padding shrinks
- **Spring animation** — type: spring, stiffness: 200, damping: 30, mass: 0.8
- **layoutId nav-pill** — shared element transition on hover
- **Glassmorphism** — blur 32px, saturate 190%
- **Mobile menu** — AnimatePresence, y: -8→0

#### HoverBorderGradient (hover-border-gradient.tsx)
- **Rotating glow** — directions TOP/LEFT/BOTTOM/RIGHT, rotates on interval
- **Radial gradient maps** — 4 positions, clockwise or counter-clockwise
- **Hover state** — switches from rotation to static highlight
- **Framer motion** — animate background between positions

#### Sparkles (sparkles.tsx)
- **Particle system** — 150 max particles, random x/y/size/opacity/duration/delay
- **Opacity loop** — [0, opacity, 0] with easeInOut, repeat infinite
- **Scale loop** — [0, 1.2, 0] synced with opacity

#### EncryptedText (encrypted-text.tsx)
- **Scramble effect** — random chars replace until revealed
- **Character set** — A-Z, a-z, 0-9, !@#$%^&*
- **Trigger modes** — onView (default) or onMouseEnter

#### WobbleCard (wobble-card.tsx)
- **Mouse tracking** — 3° max tilt on X/Y axis
- **Spring physics** — stiffness 300, damping 40
- **3D perspective** — 1200px perspective on container

#### Terminal (terminal.tsx)
- **Typewriter typing** — char-by-char with keystroke sounds
- **Command history** — list of cmd + outputs
- **Output parsing** — checks for ✔/✖ icons
- **Blinking cursor** — opacity pulse when idle
- **Sound engine** — Audio element for keystroke .ogg

---

## UI Components

### Core Components
| Component | Purpose |
|-----------|---------|
| `Navbar` | Fixed floating pill navbar, scroll-responsive |
| `Footer` | Standard footer |
| `FloatingDock` | Desktop icon spring scale / Mobile hamburger menu |
| `Logo` | SVG FreelanceOS logo (star shape) |
| `Container` | Max-width wrapper |

### UI Primitives
| Component | Purpose |
|-----------|---------|
| `hover-border-gradient` | Crimson rotating glow border button |
| `floating-dock` | Magnetic dock with spring icons |
| `sparkles` | Particle sparkle system |
| `world-map` | SVG dot grid + animated flight paths |
| `encrypted-text` | Scramble-reveal text effect |
| `WobbleCard` | 3D tilt card on mouse move |
| `3d-card` | Aceternity-style CardContainer/CardBody/CardItem |
| `AnimatedCounter` | Number counter animation |
| `SectionBadge` | Red dot + uppercase label |
| `terminal` | macOS-style typewriter terminal |

---

## Sections (Landing Page)

1. **Hero** — Headline typewriter, sparkle particles, animated dashboard, light trails, grid bg
2. **LogoMarquee** — Blur-flip tech logos (Stripe, GitHub, Upwork, LinkedIn, Slack, Vercel)
3. **Problem** — 3-card bento: scrolling feed, encrypted proposals, invoice counter
4. **HowItWorks** — 5 tabs with live mockups, sound keystrokes, progress bars
5. **Features** — 6-card 3-column grid with animated mini-visuals
6. **SuccessNumbers** — 4 giant metric counters with gradient text
7. **Testimonials** — Orbiting testimonial cards, expandable ecosystem
8. **Pricing** — 3 tiers + agency row, brutalist grid layout
9. **FAQ** — Glass accordion, 6 questions
10. **FinalCTA** — 3D tilt cards, avatar stack, pill CTAs
11. **GlobeCTA** — World map with animated flight paths, global reach message

---

## Tech Stack

```
Framework:      Next.js 16.2.3 (React 19.2.4)
Styling:        Tailwind CSS v4 + inline styles (CSS-first approach)
Animation:      Framer Motion v12 + CSS keyframes
3D:             Three.js + @react-three/fiber + @react-three/drei
Database:       MongoDB + Mongoose
Auth:           Next-Auth v5 (beta) + @auth/mongodb-adapter
Payments:       Stripe + Stripe Connect
AI:             Groq SDK
Email:          Resend
UI:             Radix UI (Accordion, Dialog, Dropdown, Tabs)
Icons:          Lucide React
Smooth scroll:  Lenis
Utils:          class-variance-authority, clsx, tailwind-merge
```

---

## Pages

- `/` — Landing page (all sections)
- `/login` — Login page
- `/signup` — Signup page
- `(auth)/layout.tsx` — Auth layout with background

---

## CSS Classes Used

```
section-badge      — Red dot + uppercase label
btn-primary        — Crimson CTA button
btn-ghost          — Border ghost button
glass-panel        — 16px blur, inset top highlight
glass-panel-lg     — 24px blur, heavier shadow
glow-orb           — Radial crimson pulsing blob
glow-orb-sm        — Smaller pulse orb
light-trail        — Diagonal crimson beam
light-trail-halo   — Soft glow around beam
kbd                — Keyboard shortcut styling
section-entry      — Generic scroll fade-up
avatar-stack       — Overlapping avatar row
tab-progress-bar   — Auto-cycling progress indicator
sweep-border      — Shimmer on hover
marquee-wrapper    — Fade-masked marquee container
```

---

## Pending / To-Do

### High Priority
- [ ] Dashboard (real authenticated app) — the animated dashboard is just a demo
- [ ] Client Discovery Module — real n8n automation layer
- [ ] AI Pitch Engine — connect Groq SDK for real pitch generation
- [ ] Outreach Engine — email/LinkedIn/Instagram automation
- [ ] CRM / Pipeline UI — real deal tracking dashboard
- [ ] Stripe Escrow — real payment flow implementation
- [ ] User authentication flow — protect routes, session management
- [ ] Database models — User, Client, Pitch, Deal schemas

### Medium Priority
- [ ] Agency tier — white-label client portals
- [ ] Team management — multi-seat for agency
- [ ] Webhook integrations — custom platform support
- [ ] Analytics dashboard — real revenue analytics
- [ ] Notification system — CRM alerts, deal updates
- [ ] Email templates — Resend integration for outreach

### Low Priority
- [ ] Dark/light theme toggle (not needed — pure dark brand)
- [ ] Mobile app (React Native?)
- [ ] Browser extension
- [ ] API documentation

---

## Animation Roadmap

### Phase 1 — Landing Polish
- [ ] Parallax scroll effects on hero sections
- [ ] Magnetic button hover (cursor attraction)
- [ ] Text reveal on scroll (per-word or per-line)
- [ ] Custom cursor for entire site

### Phase 2 — Interactive Demo
- [ ] Convert AnimatedDashboard to real interactive preview
- [ ] Add drag-and-drop for pipeline cards
- [ ] Real-time pitch generation preview with AI typing

### Phase 3 — Full App
- [ ] Page transitions with shared element animations
- [ ] Toast notification system (slide in, dismiss)
- [ ] Modal animations (scale + blur backdrop)
- [ ] Loading states (skeleton shimmer everywhere)
- [ ] Success/error micro-interactions (button states, field validation)

### Phase 4 — Premium Polish
- [ ] 3D globe for world map (React Three Fiber)
- [ ] Particle trail following cursor
- [ ] Sound design (keystrokes, success chimes, notification pops)
- [ ] Haptic-like micro-animations on mobile

---

## UI/UX Principles Applied

1. **Raycast-inspired** — glassmorphism, floating pill navbar, command palette aesthetics
2. **Crimson accent** — pure red (#c30101) as primary action color, zero orange warmth
3. **Sharp corners** — minimal border-radius, brutalist elements where appropriate
4. **Editorial typography** — massive display numbers, tight tracking, Inter
5. **Mono for data** — prices, stats, code, terminal use JetBrains Mono
6. **Ambient glows** — radial crimson blobs behind sections for atmosphere
7. **Sound on demand** — keystrokes only play when section in view
8. **Scroll-triggered** — everything animates on scroll-into-view, plays once
9. **Spring physics** — spring-based animations for natural feel
10. **Progressive reveal** — typewriters, staggered lists, orbit systems

---

*Generated: 2026-05-10*
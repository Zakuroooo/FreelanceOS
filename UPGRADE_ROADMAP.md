# FreelanceOS — Product Upgrade Roadmap (brainstorm, prioritized)

## Shipped this pass — Brand & discoverability foundation
- Favicon: signal-arc mark as `icon.svg` + generated `apple-icon.png` (180px) +
  PWA icons 192/512 in /public — one consistent identity everywhere
- Full metadata: title template ("%s · FreelanceOS"), descriptions, keywords,
  OpenGraph + Twitter cards, theme-color, robots directives
- Dynamic branded OG card (`opengraph-image.tsx`, next/og) — renders the mark,
  wordmark and product chips at share time; nothing to keep in sync
- `manifest.webmanifest` → installable PWA baseline on Android/Chrome
- `robots.txt` + `sitemap.xml` covering exactly the public surfaces Google
  verification needs (landing, privacy, terms, auth pages)
- Per-page titles for all 9 dashboard segments

## Tier 1 — Highest leverage next (recommendation)
1. **Onboarding wizard** — first-login checklist: connect email → pick services →
   run first scan → send first pitch. Empty dashboards kill SaaS trials; a guided
   first win is the single biggest activation lever.
2. **Funnel analytics page** — discovered → saved → pitched → replied → won charted
   per member and over time (data already org-scoped; needs aggregation + charts).
3. **Global command palette (Cmd+K)** — navigate anywhere, trigger actions
   (new scan, generate pitch) without touching the mouse. Premium feel, cheap build.

## Tier 2 — Retention & depth
4. **Follow-up digest** — daily email summary of overdue deal reminders (the
   follow-up engine already tracks them server-side).
5. **Pitch tone selector** — formal/friendly/bold per campaign, persisted per user.
6. **Email signature builder** — agency-branded sign-offs appended to sends.
7. **Lead score explainability** — "why 42" tooltip breaking down opportunityScore.
8. **Activity feed page** — who did what across the team (notifications already carry
   attribution).

## Tier 3 — Scale & monetization
9. **Stripe self-serve billing** — plan upgrades from inside the app (seat plumbing
   already enforced).
10. **Usage meters** — visible Groq/email quota per workspace.
11. **Public API keys per workspace** — agencies integrate their own tools.
12. **White-label domain** — custom domain per agency (ties into Google verification).

## Technical debt queue (small but real)
- Rate limiting once Redis is provisioned
- CSP flip to enforcing after nonce plumbing
- Lookalike search + bulk queue/tag stubs

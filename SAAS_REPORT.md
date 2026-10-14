# FreelanceOS — SaaS Transformation Report (2026-08-25)

From single-user tool → **multi-tenant, team-ready SaaS** you can sell to agencies
(whitelist-style: they buy in, share an invite code with their team, everyone works one
shared pipeline; you track who did what).

---

## Architecture

### Tenancy model
```
Organization  (the agency workspace — what you sell)
 ├── ownerUserId, inviteCode (8-char, unambiguous alphabet), plan, seats
 └── Members: User[] via user.orgId + user.orgRole ('owner'|'admin'|'member')

Client / Pitch / Deal / Notification  ← every row carries orgId (+ userId as ATTRIBUTION)
```

- **Visibility is org-wide**: teammates share one lead pool, pitch library and deal
  pipeline — exactly how agencies actually work.
- **Attribution stays personal**: every record remembers which member created/sent it,
  powering the admin leaderboard.
- Mailboxes stay per-user (each member connects their own Gmail/SMTP) — correct by design.

### Zero-migration onboarding
`lib/scope.ts → ensureSessionScope()` runs at the top of every core API route:
1. First touch after this update? A solo "My Workspace" is provisioned automatically.
2. The same pass backfills `orgId` onto ALL of that user's historical rows once, lazily —
   no migration script, nothing breaks, old data simply becomes the founder's workspace.

## What got built

| Piece | Where |
|---|---|
| Organization model (plans, seat caps, rotating invite codes) | `lib/models/Organization.ts` |
| orgId + orgRole on users & all four data models (+ indexes) | `lib/models/*` |
| Scoping core: provisioning, lazy backfill, role helpers | `lib/scope.ts` |
| Org APIs | `GET/PATCH /api/org`, `POST /api/org/join`, `POST /api/org/invite`, `PATCH /api/org/members`, `GET /api/org/stats` |
| Per-member analytics engine (aggregations by userId) | `/api/org/stats` |
| Admin UI: leaderboard + invite management + role controls | `/team` (sidebar link added, proxy-protected) |
| Settings workspace card (rename/copy/rotate/join) | `components/settings/WorkspaceCard.tsx` |
| Org-scoped routes | clients, deals (+[id]), pitches (+[id]), stats, notifications, outreach/batch, pitch + pitch/chat |

## The admin view (/team)
Totals strip (pitches sent · replies · deals won · revenue across the whole team), then a
per-member table: **Saved · Generated · Sent · Replies · Active · Won · Revenue**, with
owner/admin controls to promote/demote/remove members. Members see the same board read-only.

## Selling it (whitelist model)
1. Agency buys → you flip their org's `plan` (`free`→`pro`→`agency`) — seat caps are
   enforced server-side at join time (3/10/100).
2. Owner shares the 8-char invite code; teammates join from Settings in seconds.
3. Code leaked? One click rotates it; old code dies instantly.

## Verification
```
typecheck   clean
lint        0 errors
build       44 routes incl. /team + 5 org endpoints
tests       43/43 (new: seat caps, invite-code format/uniqueness, attribution scoring)
graph       rebuilt (156+ files)
```

## Honest scope notes (next iterations if you want them)
- Billing is manual by design for whitelist selling (flip the plan field); Stripe wiring can
  come when you have your first paying agencies.
- Per-member filtering inside Deals/Pitches pages can reuse the `?member=` param already
  supported by GET /api/pitches — UI toggle not yet built.
- Removing a member detaches them; their historical rows keep their name attribution but a
  rejoin would start a fresh attribution stream (documented behavior).

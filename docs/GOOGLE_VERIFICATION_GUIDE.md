# Google OAuth Verification Guide — one-tap Gmail for every user

Goal: any user clicks "Connect Gmail" → Google consents → mail sends from their real
address. No test-user whitelist, no SMTP, no app passwords.

## Why it is blocked today
`gmail.send` is a **restricted scope**. While the Google Cloud app sits in *Testing* status,
only manually-added test users can consent (the `403: access_denied` you saw). Removing that
wall requires completing **Google OAuth verification**. There is no code shortcut — but the
process is fully doable. Everything the submission asks for now exists in this repo.

## What this repo already provides (verification prerequisites)
| Google requirement | Where it lives |
|---|---|
| Privacy policy URL | `/privacy` (src/app/privacy/page.tsx) — ships with a Gmail-specific section declaring limited use |
| Terms of service URL | `/terms` (src/app/terms/page.tsx) |
| Homepage URL | Your landing page `/` |
| Minimal scopes | Only `gmail.send` + `userinfo.email` requested (see src/app/api/gmail/connect/route.ts) |
| Token security | Refresh tokens AES-encrypted at rest (src/lib/encryption.ts), revocation on disconnect |

## Step-by-step (do this once)

### Phase 0 — prep (30 min)
1. Deploy the app to your production domain (Vercel). Verification needs live URLs.
2. console.cloud.google.com → your project → **OAuth consent screen**:
   - App name: `FreelanceOS`
   - User support email: your inbox
   - Application home page: `https://yourdomain.com`
   - Privacy Policy: `https://yourdomain.com/privacy`
   - Terms of Service: `https://yourdomain.com/terms`
   - Authorized domains: `yourdomain.com`
   - Developer contact: your email
3. Update env in Vercel:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `GMAIL_REDIRECT_URI=https://yourdomain.com/api/gmail/callback`
   - Add the same two URLs in Google Console → Credentials → your OAuth Client →
     "Authorized redirect URIs".

### Phase 1 — submit for verification
4. OAuth consent screen → **Publish app → Confirm**.
5. Click **Prepare for verification** / "Submit for verification":
   - Authorized domain + scopes justification. For each scope write plainly:
     - `.../auth/userinfo.email` — "To display which mailbox is connected."
     - `.../auth/gmail.send` — "To send outreach emails the user explicitly composes/
       launches through FreelanceOS, directly from their own Gmail account."
   - A 2–5 minute unlisted YouTube demo video showing: sign-in → Connect Gmail →
     composing/sending one pitch → nothing else touches the inbox.
6. Submit. Typical review: **3–7 business days**.

### Phase 2 — the restricted-scope extra step
7. Because `gmail.send` is restricted, Google also runs a **security assessment**
   (CASA Tier 2). Current reality: ~$500–$1,500 via an authorized lab for a small SaaS,
   renewed annually. Google emails you the link after the basic review passes. Until that
   assessment completes, Google may show users an "unverified app" interstitial with a
   working "Advanced → Go to FreelanceOS" path — functional, just not pretty.

## Interim mode (today → verification day)
- **You + early testers:** add their addresses under Test users; they get true one-tap.
- **Everyone else:** SMTP preset in Settings (instant, any provider) — the product treats
  both as first-class and shows whichever is connected.

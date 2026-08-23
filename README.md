<h1 align="center">
  <img src="public/logo.png" alt="FreelanceOS" width="48" style="vertical-align:middle" />
  FreelanceOS
</h1>

<p align="center">
  <strong>The all-in-one operating system for freelancers.</strong><br/>
  Discover clients · Generate AI pitches · Automate outreach · Close deals — all in one dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## ✨ What Is FreelanceOS?

FreelanceOS is a Next.js 16 SaaS platform built for freelancers who are tired of juggling 10 different tools. It brings together:

| Feature | Description |
|---|---|
| 🔍 **Client Discovery** | Search for high-value clients using Apify web scrapers |
| 🤖 **AI Pitch Engine** | Groq-powered pitch generation tailored per client |
| 📤 **Multi-Channel Outreach** | Send pitches via Gmail, WhatsApp, LinkedIn, Instagram |
| 💼 **Deal Tracker** | Full deal pipeline from prospect → signed → paid |
| 🔐 **Secure Auth** | NextAuth v5 with MongoDB adapter + bcrypt |
| 💳 **Stripe Payments** | Escrow-style payment management for deals |

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + Framer Motion |
| UI Library | shadcn/ui + Aceternity UI components |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (beta) |
| AI | Groq SDK (pitch generation) |
| Email | Gmail OAuth + Resend |
| Payments | Stripe |
| Scraping | Apify |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Overview + stats
│   │   ├── discover/         # Client discovery
│   │   ├── clients/          # Saved clients
│   │   ├── pitches/          # Pitch history + generation
│   │   ├── outreach/         # Outreach queue
│   │   └── deals/            # Deal pipeline
│   ├── api/
│   │   ├── auth/             # NextAuth endpoints
│   │   ├── deals/            # Deal CRUD API
│   │   ├── pitches/          # Pitch generation API
│   │   ├── outreach/         # Multi-channel send APIs
│   │   │   ├── email/
│   │   │   ├── gmail/
│   │   │   ├── whatsapp/
│   │   │   ├── linkedin/
│   │   │   └── instagram/
│   │   └── gmail/            # Gmail OAuth flow
│   ├── login/                # Auth pages
│   └── signup/
├── components/
│   ├── layout/               # Navbar, Footer, Sidebar
│   ├── sections/             # Landing page sections
│   ├── pitches/              # PitchPreviewPanel, SendModal
│   └── ui/                   # Reusable UI primitives
└── lib/
    ├── models/               # Mongoose schemas (User, Client, Deal, Pitch)
    ├── encryption.ts         # AES credential encryption
    ├── gmail.ts              # Gmail API helpers
    └── mongodb.ts            # DB connection
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster (or local)
- A `.env.local` file with required secrets (see below)

### Installation

```bash
git clone https://github.com/Zakuroooo/FreelanceOS.git
cd FreelanceOS
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file in the project root. **Never commit this file.**

```env
# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth (for sign-in + Gmail)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Groq AI
GROQ_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Apify (client discovery scraping)
APIFY_API_TOKEN=

# Encryption (32-char secret for AES-256)
ENCRYPTION_KEY=

# Resend (fallback email)
RESEND_API_KEY=
```

---

## 🎨 Design System

FreelanceOS uses a dark-mode-first design language:

- **Primary accent**: Crimson red `#c30101`
- **Background**: Deep dark `#060608`
- **Typography**: Inter (display) + JetBrains Mono (code)
- **Animations**: Framer Motion + custom CSS keyframes (marquee, glow-pulse, shimmer, fade-up)

---

## 📦 Key API Routes

| Method | Route | Description |
|---|---|---|
| `GET/POST` | `/api/deals` | List / create deals |
| `GET/PATCH/DELETE` | `/api/deals/[id]` | Single deal operations |
| `GET/POST` | `/api/pitches` | List / generate pitches |
| `GET/DELETE` | `/api/pitches/[id]` | Single pitch operations |
| `POST` | `/api/outreach/email` | Send via Resend |
| `POST` | `/api/outreach/gmail` | Send via Gmail OAuth |
| `POST` | `/api/outreach/whatsapp` | Send via WhatsApp |
| `POST` | `/api/outreach/linkedin` | Send via LinkedIn |
| `POST` | `/api/outreach/instagram` | Send via Instagram DM |
| `GET` | `/api/gmail/connect` | Start Gmail OAuth flow |
| `GET` | `/api/gmail/callback` | Gmail OAuth callback |
| `GET` | `/api/gmail/status` | Check Gmail connection |
| `DELETE` | `/api/gmail/disconnect` | Revoke Gmail access |

---

## 🗺 Roadmap

- [x] Landing page (all sections)
- [x] Authentication (login / signup)
- [x] Dashboard layout + sidebar
- [x] Deal tracker (CRUD)
- [x] Pitch generation (Groq AI)
- [x] Multi-channel outreach API (Gmail, WhatsApp, LinkedIn, Instagram)
- [x] Gmail OAuth integration
- [x] Credential encryption (AES-256)
- [ ] Client discovery (Apify integration)
- [ ] Notifications system
- [ ] Settings page
- [ ] Stripe escrow payments
- [ ] Animated freelancer character (scroll-driven)
- [ ] Production deployment (Vercel)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">Made with ❤️ and way too much caffeine · <strong>FreelanceOS</strong></p>

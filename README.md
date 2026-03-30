# 🏌️ Golf Charity Subscription Platform

> **Play with Purpose. Win for Good.**

A subscription-driven golf platform combining performance tracking, monthly prize draws, and charitable giving. Built with Next.js 16, Supabase, and deployed on Vercel.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Test Credentials](#test-credentials)
- [Test Card Numbers](#test-card-numbers)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Admin Setup](#admin-setup)
- [Deployment](#deployment)
- [Testing](#testing)

---

## Overview

Subscribers enter their latest golf scores (Stableford format, 1–45), which act as entries in a monthly prize draw. A percentage of each subscription goes to a charity of the subscriber's choice. The platform supports:

- **Monthly & yearly subscription plans** with simulated Stripe payment
- **Score management** — rolling 5-score window
- **Monthly prize draws** — random or algorithmic, with jackpot rollover
- **Charity directory** — browse, select, and contribute
- **Admin dashboard** — user management, draw execution, charity CRUD, winner verification
- **Email notifications** — welcome, draw results, winner alerts, renewal reminders

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui (Radix UI primitives) |
| **Icons** | Lucide React |
| **Animation** | Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (JWT) |
| **Payments** | Simulated Stripe (mock API) |
| **Email** | Resend + React Email |
| **Storage** | Supabase Storage |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.17
- **npm** ≥ 9
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Resend** account for email ([resend.com](https://resend.com))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd site

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase and Resend credentials (see below)
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (use your Vercel URL in production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Stripe (optional — payment is simulated)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> ⚠️ **Security:** `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes (`app/api/`). It is never exposed in client bundles. The `.env.local` file is included in `.gitignore`.

---

## Database Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down the **Project URL**, **Anon Key**, and **Service Role Key**

### 2. Run Migrations

Execute the migration files in `supabase/migrations/` in order via the Supabase SQL Editor or CLI:

```
001_users.sql              — Users table with RLS
002_subscriptions.sql      — Subscriptions table with RLS
003_scores.sql             — Scores table with RLS
004_charities.sql          — Charities table with RLS
005_charity_contributions.sql — Contribution tracking
006_draws.sql              — Draws table with RLS
007_draw_entries.sql       — Draw entries with RLS
008_winners.sql            — Winners table with RLS
009_prize_pool.sql         — Prize pool tracking
010_users_fk_and_trigger.sql — Foreign keys and auth trigger
```

Or run the combined migration:
```
000_all_migrations_combined.sql — All tables in a single file
```

### 3. Configure Auth Settings

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** Your deployment URL (e.g., `https://your-app.vercel.app`)
- **Redirect URLs:** Add `https://your-app.vercel.app/api/auth/callback`

---

## Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Test Credentials

### Subscriber Account
Create via the signup flow at `/signup`, or insert directly into Supabase.

### Admin Account
To create an admin user:

1. Sign up normally through the app
2. In Supabase SQL Editor, update the user's role:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

Admin users have access to the `/admin` dashboard with full platform management capabilities.

---

## Test Card Numbers

The platform uses a simulated payment system. Use these test card numbers:

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

- **Expiry:** Any future date (e.g., `12/30`)
- **CVC:** Any 3 digits (e.g., `123`)
- **Name:** Any name

---

## Project Structure

```
site/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, forgot-password)
│   ├── (public)/                 # Public pages (homepage, charities, draws, how-it-works)
│   ├── admin/                    # Admin dashboard (users, draws, charities, winners, reports)
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin-only API endpoints
│   │   ├── auth/callback/        # Supabase auth callback
│   │   ├── draw/                 # Draw execution and retrieval
│   │   ├── email/                # Email trigger endpoints
│   │   ├── payment/              # Payment simulation and cancellation
│   │   ├── scores/               # Score CRUD
│   │   └── winners/              # Winner management
│   ├── dashboard/                # User dashboard (overview, scores, charity, winnings, settings)
│   ├── globals.css               # Global styles and design tokens
│   └── layout.tsx                # Root layout
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── homepage/             # Homepage sections
│   │   ├── payment/              # Payment flow components
│   │   └── scores/               # Score entry components
│   ├── layout/                   # Layout components (Navbar, Footer, Section)
│   └── ui/                       # Reusable UI (GoldButton, GlassCard, LightCard, etc.)
├── emails/                       # React Email templates
├── hooks/                        # Custom React hooks (useUser, useSubscription, useScores)
├── lib/
│   ├── draw-engine/              # Draw generation and prize pool logic
│   ├── supabase/                 # Supabase client configurations
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Utility functions
├── supabase/
│   └── migrations/               # Database migration SQL files
├── tests/
│   ├── e2e/                      # Playwright E2E tests
│   └── unit/                     # Vitest unit tests
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

---

## Key Features

### Route Map

| Route | Type | Access |
|---|---|---|
| `/` | Public | All |
| `/charities` | Public | All |
| `/charities/[id]` | Public | All |
| `/draws` | Public | All |
| `/draws/[month]` | Public | Published draws only |
| `/how-it-works` | Public | All |
| `/signup` | Auth | Unauthenticated |
| `/login` | Auth | Unauthenticated |
| `/subscribe` | Protected | Authenticated, no active subscription |
| `/dashboard` | Protected | Active subscriber |
| `/dashboard/scores` | Protected | Active subscriber |
| `/dashboard/charity` | Protected | Active subscriber |
| `/dashboard/winnings` | Protected | Active subscriber |
| `/dashboard/settings` | Protected | Active subscriber |
| `/admin` | Admin | `role === 'admin'` |
| `/admin/users` | Admin | `role === 'admin'` |
| `/admin/draw` | Admin | `role === 'admin'` |
| `/admin/charities` | Admin | `role === 'admin'` |
| `/admin/winners` | Admin | `role === 'admin'` |
| `/admin/reports` | Admin | `role === 'admin'` |

### Design System — "Dark Forest / Organic Luxury"

| Token | Value | Usage |
|---|---|---|
| Forest | `#1A2E1A` | Dark backgrounds, dark CTAs |
| Off-White | `#F9F9F6` | Light backgrounds, text on dark |
| Gold Main | `#D4AF37` | Accents, borders, icons |
| Gold Light | `#F1D570` | Gradient endpoints |
| Card Radius | `rounded-[2rem]` | All primary cards |
| Pill Radius | `rounded-full` | Badges, CTAs |
| Gold Glow | `shadow-[0_0_20px_rgba(212,175,55,0.4)]` | CTA hover |

---

## Deployment

### Vercel

1. Create a new Vercel account (or use existing)
2. Connect your GitHub repository
3. Set all environment variables in the Vercel dashboard (copy from `.env.local`)
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL
5. Deploy — Vercel auto-detects Next.js and handles the build

### Supabase Production Config

1. In Supabase Dashboard → Authentication → URL Configuration:
   - Set **Site URL** to your Vercel deployment URL
   - Add `https://your-app.vercel.app/api/auth/callback` to **Redirect URLs**
2. Verify all RLS policies are enabled on every table
3. Run all migrations in the production Supabase project

### Pre-Launch Checklist

- [x] No `console.log` debug statements in codebase
- [x] `SUPABASE_SERVICE_ROLE_KEY` only used in server-side API routes
- [x] `.env.local` is in `.gitignore`
- [x] `next build` passes with zero errors and zero warnings
- [x] Gold glow contrast verified for WCAG AA compliance

---

## Testing

```bash
# Run all tests
npm test

# Unit tests only (Vitest)
npm run test:unit

# Unit tests in watch mode
npm run test:unit:watch

# E2E tests (Playwright)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Unit Tests (`tests/unit/`)
- `draw-engine.test.ts` — Draw generation, match tiers, edge cases
- `score-logic.test.ts` — Rolling 5-score window, validation
- `prize-pool.test.ts` — Prize pool calculations, jackpot rollover

### E2E Tests (`tests/e2e/`)
- `signup-login.spec.ts` — Full auth flow
- `subscription.spec.ts` — Payment flow with test cards
- `score-entry.spec.ts` — Score management
- `draw-simulation.spec.ts` — Admin draw execution
- `charity-selection.spec.ts` — Charity management

---

## License

This project is proprietary. All rights reserved.

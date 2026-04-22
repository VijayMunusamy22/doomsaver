# FamilyBudget ₹

A full-stack family budget planning app built with Next.js 14, Prisma, PostgreSQL, NextAuth.js, shadcn/ui, Tailwind CSS, and Recharts.

---

## Tech Stack

| Layer        | Choice                              |
|--------------|-------------------------------------|
| Framework    | Next.js 14 App Router               |
| Auth         | NextAuth.js v4 (Credentials + Google OAuth) |
| Database     | PostgreSQL (Neon / Supabase)        |
| ORM          | Prisma                              |
| UI           | shadcn/ui + Tailwind CSS            |
| Charts       | Recharts                            |
| Currency     | INR (₹)                             |
| Deploy       | Vercel                              |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="from console.cloud.google.com"
GOOGLE_CLIENT_SECRET="from console.cloud.google.com"
```

### 3. Set up shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card dialog select separator badge toast avatar
```

### 4. Push database schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Setup

### Neon (recommended)
1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`

### Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI mode)
3. Copy to `DATABASE_URL`

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
6. Copy Client ID and Secret to `.env.local`

---

## Vercel Deployment

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your production domain (e.g. `https://familybudget.vercel.app`)
5. Deploy

---

## Project Structure

```
family-budget-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── auth/register/        # Email registration
│   │   ├── family/               # Create / get family
│   │   ├── family/join/          # Join via invite code
│   │   ├── income/               # Income CRUD
│   │   ├── income/[id]/
│   │   ├── categories/           # Category CRUD
│   │   ├── categories/[id]/
│   │   ├── subcategories/        # Subcategory CRUD
│   │   └── subcategories/[id]/
│   ├── auth/login/               # Login page
│   ├── auth/register/            # Register page
│   ├── dashboard/                # Main dashboard + charts
│   ├── income/                   # Income management page
│   ├── categories/               # Categories page
│   ├── family/                   # Family settings page
│   └── onboarding/               # Create / join family flow
├── components/
│   ├── nav/sidebar.tsx
│   ├── dashboard/                # Chart + card components
│   ├── income/income-manager.tsx
│   ├── categories/category-manager.tsx
│   └── family/family-panel.tsx
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # formatINR, generateInviteCode, etc.
├── prisma/schema.prisma
└── types/next-auth.d.ts
```

---

## Features

- **Multi-user family** — Create a family or join one with a shareable invite code (e.g. `FAM-AB1234`)
- **Solo mode** — Single-person budget without invites
- **Income management** — Add Spouse 1, Spouse 2, and Side Income sources with monthly + annual display
- **Custom categories** — Build your own category tree with color coding
- **Subcategory budgets** — Set monthly allocations per subcategory; totals roll up to category level
- **Dashboard charts** — Donut charts for income split and category allocation; horizontal bar chart for subcategory breakdown
- **Over-budget warning** — Red banner when total allocation exceeds income
- **Auth** — Email/password + Google OAuth via NextAuth.js

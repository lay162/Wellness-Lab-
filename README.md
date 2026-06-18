# Wellness Lab Platform

A production-ready dual-system platform built with React 19, Vite, Tailwind CSS, Supabase, and PWA support.

## Two Separate Systems

### 1. Public Wellness Website
Professional public-facing site for branding, education, blog, reviews, and compliance. **No products, prices, ordering, login, or PWA install buttons.**

Routes: `/`, `/about`, `/wellness`, `/how-it-works`, `/success-stories`, `/reviews`, `/blog`, `/aftercare`, `/faqs`, `/contact`, and legal pages.

### 2. Private Customer PWA Portal
Invite-only portal for approved customers. Access via private URL, QR code, or direct invite. **Not linked from the public website.**

Routes: `/private-portal/*` (customer) and `/private-admin/*` (administration).

---

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Supabase (Auth, PostgreSQL, Storage, RLS)
- Vite PWA Plugin (portal only)
- Vercel deployment

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase account (free tier)

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Generate placeholder assets

```bash
node scripts/generate-placeholders.mjs
```

Replace `public/logo-placeholder.png`, `public/favicon.png`, `public/app-icon-192.png`, and `public/app-icon-512.png` with your branded assets.

### 4. Run locally

```bash
npm run dev
```

Public site: `http://localhost:5173/`  
Portal login: `http://localhost:5173/private-portal/login`  
Admin: `http://localhost:5173/private-admin`

---

## Supabase Setup

### 1. Create a project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run SQL scripts (in order)

In **Supabase Dashboard → SQL Editor**, run:

1. `supabase/schema.sql` — tables, triggers, seed data
2. `supabase/rls.sql` — Row Level Security policies
3. `supabase/storage.sql` — storage buckets and policies

### 3. Enable Email Auth
In **Authentication → Providers**, ensure Email is enabled.

### 4. Storage buckets
The storage script creates: `product-images`, `coa-files`, `blog-images`, `review-images`, `success-story-images`, `branding`.

---

## Admin Setup

1. Register at `/private-portal/register`
2. In Supabase Dashboard → **Authentication → Users**, copy your user UUID
3. Run in SQL Editor (see `supabase/admin-setup.sql`):

```sql
UPDATE profiles
SET role = 'admin', status = 'approved'
WHERE email = 'your-admin@email.com';
```

4. Sign in at `/private-portal/login` — you'll be redirected to `/private-admin`

---

## Customer Registration Flow

1. Customer visits `/private-portal/register` (via private URL/QR/invite)
2. Fills in: name, email, password, phone, company (optional), reason for access
3. Accepts terms and compliance checkboxes
4. Status automatically set to **pending**
5. Admin approves in `/private-admin/customers`
6. Approved customer can access catalogue, orders, and PWA install

---

## QR Code Generation

Generate a QR code pointing to your portal registration URL:

```
https://yourdomain.com/private-portal/register
```

Free tools:
- [qr-code-generator.com](https://www.qr-code-generator.com/)
- [goqr.me](https://goqr.me/)

Share the QR code privately with invited customers only. **Never add it to the public website.**

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Wellness Lab platform"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Import to Vercel
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Framework preset: **Vite**
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 3. Deploy
Vercel uses `vercel.json` for SPA routing. Deploy automatically on push.

### 4. Build command
```
npm run build
```
Output directory: `dist`

---

## Custom Domain Setup

1. In Vercel → **Project Settings → Domains**, add your domain
2. Update DNS records as instructed by Vercel
3. SSL is provisioned automatically
4. Update Supabase **Authentication → URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/**`

---

## Branding Replacement Guide

Edit `src/config/brand.js`:

```javascript
export const brand = {
  name: 'Your Business Name',
  tagline: 'Your tagline',
  logo: '/logo-placeholder.png',      // Replace file in public/
  favicon: '/favicon.png',              // Replace file in public/
  appIcon192: '/app-icon-192.png',      // PWA icon 192x192
  appIcon512: '/app-icon-512.png',      // PWA icon 512x512
  colors: { primary: '#2D6A4F', ... },
  contact: { email, phone, address, hours },
  social: { instagram, facebook, linkedin },
}
```

Also update PWA manifest colours in `vite.config.js` if needed.

---

## Payment Workflow (No Stripe)

Flexible manual payment system:

| Method | Description |
|--------|-------------|
| Bank Transfer | Admin provides bank details |
| Cash on Collection | Pay when collecting |
| Cash on Delivery | Pay on delivery |
| SumUp Payment Link | Admin adds payment URL |
| Manual Payment | Other arrangements |

Admin selects payment method when processing orders in `/private-admin/orders`.

---

## Security

- Row Level Security on all tables
- Public users cannot access products or portal content
- Pending/rejected/suspended users blocked from portal
- Customers see only their own orders
- Admin controls all approvals, products, and orders
- No portal links on public website
- PWA install prompt only in private portal for approved users

---

## Project Structure

```
src/
├── config/brand.js          # Branding configuration
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── public/              # Public website layout
│   ├── portal/              # Customer portal layout + PWA
│   └── admin/               # Admin layout
├── context/                 # Auth + Cart providers
├── hooks/                   # usePWA and utilities
├── lib/                     # Supabase client + helpers
├── pages/
│   ├── public/              # Public website pages
│   ├── portal/              # Customer portal pages
│   └── admin/               # Admin portal pages
└── routes/                  # Protected route guards
supabase/
├── schema.sql               # Database schema
├── rls.sql                  # Row Level Security
├── storage.sql              # Storage buckets
└── admin-setup.sql          # Admin promotion guide
public/
├── offline.html             # PWA offline page
└── logo-placeholder.png     # Replace with your logo
```

---

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Support

For issues with Supabase setup, refer to [supabase.com/docs](https://supabase.com/docs).  
For Vercel deployment, refer to [vercel.com/docs](https://vercel.com/docs).

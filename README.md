## Next.js Meeting Scheduler – Setup & Run Guide

This app lets buyers book meetings with sellers and syncs events to Google Calendar. It uses Next.js App Router, NextAuth, Prisma, and Supabase Postgres.

### 1) Prerequisites
- Node.js 18+ and npm
- A Supabase project (Postgres)
- A Google Cloud project with OAuth consent set up

### 2) Local Environment Variables
Create a `.env.local` in the project root:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-32+ char string

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# Database (Supabase)
# For local dev you can use the direct (5432) connection with SSL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require

# Optional: if you’ll run migrations in CI, also add a DIRECT_URL for non-pooled
# DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require

# Encryption key for storing Google refresh tokens (32 bytes base64)
# Generate: openssl rand -base64 32
ENCRYPTION_KEY=base64-encoded-32-bytes
```

### 3) Google OAuth Configuration
In Google Cloud Console → APIs & Services → Credentials, create an OAuth 2.0 Client ID.
- Authorized JavaScript origins:
  - http://localhost:3000
- Authorized redirect URIs:
  - http://localhost:3000/api/auth/callback/google

For production you’ll add your Vercel domain later.

### 4) Database & Prisma
- Update `prisma/schema.prisma` if needed.
- Install deps and generate Prisma client:

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### 5) Run Locally

```bash
npm run dev
```

Open http://localhost:3000. Sign in with Google on first run. Sellers will store an encrypted Google refresh token to enable calendar actions.

### 6) Production (Vercel) Configuration
Set these environment variables in Vercel → Project → Settings → Environment (Production):

```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=replace-with-a-random-32+ char string
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# Use Supabase pooled connection (PgBouncer) for serverless
DATABASE_URL=postgresql://USER:PASSWORD@aws-1-<region>.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1

# Optional safety if you still see prepared statement issues
# PRISMA_DISABLE_PREPARED_STATEMENTS=true

ENCRYPTION_KEY=base64-encoded-32-bytes
```

Then in Google Cloud Console add production URLs:
- Authorized JavaScript origins:
  - https://your-domain.vercel.app
- Authorized redirect URIs:
  - https://your-domain.vercel.app/api/auth/callback/google

Redeploy the project and clear build cache if needed.

### 7) Common Issues
- Callback error on sign-in: verify `NEXTAUTH_URL`, Google OAuth URIs, and that your Google account is allowed (Test users vs Production).
- Database connection errors on Vercel: ensure pooled `DATABASE_URL` on port 6543 with `sslmode=require&pgbouncer=true&connection_limit=1`.
- Prepared statement errors (`42P05`): add `PRISMA_DISABLE_PREPARED_STATEMENTS=true` or ensure the pooled URL params above.
- Encrypted refresh token: `ENCRYPTION_KEY` must be a 32-byte base64 string.

### 8) Scripts
- `npm run dev` – start local dev server
- `npm run build` – production build
- `npm run start` – start production server locally

### 9) Project Structure (high-level)
- `src/app` – App Router routes (pages and API)
- `src/components` – UI components (BookingFlow, CalendarView, etc.)
- `src/lib` – Prisma client, auth, Google API helpers, crypto
- `prisma/` – Prisma schema & migrations

### 10) Security Notes
- Never commit or log OAuth tokens. Refresh tokens are encrypted at rest using `ENCRYPTION_KEY`.
- Rotate credentials and secrets if you suspect exposure.

---

If you get stuck, open an issue with the exact error and relevant logs (scrub secrets).

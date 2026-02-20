# Ampli5

Full-stack app with React frontend and Supabase backend. Deploy frontend to Render; Supabase handles Auth, Database, Storage, and Edge Functions.

**Repository:** https://github.com/ampli5-life/Ampli-life

## Prerequisites

- Node.js 18+
- Supabase account
- Stripe account (for subscriptions)

## Run locally

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations: `supabase db push` or apply `supabase/migrations/20240219000000_init_schema.sql` in SQL Editor
3. Deploy Edge Functions: `supabase functions deploy`
4. Set Edge Function secrets: Stripe keys, success/cancel URLs
5. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
6. Edit `.env` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`
7. Start frontend:
   ```bash
   cd frontend && npm install && npm run dev
   ```
8. Open http://localhost:5173

## Project layout

- **frontend/** – Vite/React UI (connects to Supabase)
- **supabase/**
  - **migrations/** – SQL schema and RLS policies
  - **functions/** – Edge Functions (stripe-checkout, stripe-webhook, confirm-subscription, video-signed-url, contact, create-user)
- **.env.example** – Template for env vars (copy to `.env`)

## Deploy

1. **Supabase**: Create project, run migrations, deploy Edge Functions, set secrets
2. **Render**: Deploy frontend static site. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID` in Render dashboard
3. Configure Stripe: see [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) (products, webhook, Supabase secrets, Render env)

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is used only in Edge Functions (server-side). Never expose it in frontend or `VITE_*` env vars.
- Frontend uses `VITE_SUPABASE_ANON_KEY` (public, RLS protects data)

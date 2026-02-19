# Supabase Migration Guide

This project uses Supabase as the backend (Auth, Database, Storage, Edge Functions). The frontend is deployed to Render.

## Setup

### 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note the Project URL and anon key (Settings → API)

### 2. Run migrations

Apply the schema in `supabase/migrations/20240219000000_init_schema.sql`:

- Option A: `supabase db push` (with Supabase CLI linked)
- Option B: Copy SQL and run in Supabase Dashboard → SQL Editor

### 3. Enable Auth providers

- Settings → Authentication → Providers
- Enable Email
- Enable Google: add Client ID and Client Secret from Google Cloud Console
- Add your frontend URL to Redirect URLs

### 4. Deploy Edge Functions

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy confirm-subscription
supabase functions deploy video-signed-url
supabase functions deploy contact
supabase functions deploy create-user
```

### 5. Set Edge Function secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_PRICE_SILVER=price_...
supabase secrets set STRIPE_PRICE_GOLD=price_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_SUCCESS_URL=https://your-frontend.onrender.com/subscription-success
supabase secrets set STRIPE_CANCEL_URL=https://your-frontend.onrender.com/
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided to Edge Functions.

### 6. Configure Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Events: `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 7. Frontend env vars (Render)

Set these in the Render dashboard for the frontend service:

- `VITE_SUPABASE_URL` – Project URL
- `VITE_SUPABASE_ANON_KEY` – anon/public key (safe for frontend)
- `VITE_GOOGLE_CLIENT_ID` – optional; not needed when using Supabase Google OAuth redirect

## Troubleshooting

### Login/sign up fails with "Cross-Origin-Opener-Policy would block the window.postMessage call"

This happens when the host (e.g. Render) sends a strict **Cross-Origin-Opener-Policy** (COOP) header (e.g. `same-origin`), which blocks the postMessage flow used by some auth flows. Fix it by either:

- **On the host:** Do not send a strict COOP header for the app, or set it to `unsafe-none` for the site (e.g. in Render: Headers for the static site, path `/*`).
- **In the app:** Google sign-in uses Supabase redirect OAuth (no popup/postMessage), so it is not affected by COOP once this flow is in use.

## Security

- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in frontend or `VITE_*` env vars
- The service role key is only used server-side in Edge Functions
- Row Level Security (RLS) policies protect all tables; anon key has limited access

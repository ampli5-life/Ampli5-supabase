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
supabase secrets set STRIPE_CANCEL_URL=https://your-frontend.onrender.com/pricing
```

**Production:** `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` must be set to your deployed frontend domain (e.g. Render). If unset, the function derives URLs from the request `Origin` header when present; otherwise it falls back to `http://localhost:5173`.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided to Edge Functions.

### 6. Configure Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 7. Frontend env vars (Render)

Set these in the Render dashboard for the frontend service:

- `VITE_SUPABASE_URL` – Project URL (required)
- `VITE_SUPABASE_ANON_KEY` – anon/public key (required; safe for frontend)
- `VITE_GOOGLE_CLIENT_ID` – optional; not needed when using Supabase Google OAuth redirect

### 8. Apply storage migration (admin video uploads)

Run all migrations so the `videos` storage bucket has RLS policies for admin uploads (e.g. `supabase db push` or run `supabase/migrations/20240219180000_storage_videos_admin.sql` in the SQL Editor).

## Production checklist

- **Stripe redirect URLs:** Set `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` in Supabase Edge Function secrets to your production frontend URL (e.g. `https://ampli5-frontend-xxx.onrender.com/subscription-success` and `.../pricing`). Without these, Stripe may redirect to localhost after checkout.
- **Render env (build-time):** Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Render before the build. These are baked into the bundle at build time. If missing or wrong, the frontend will call an empty or incorrect Supabase URL and Subscribe will timeout with no Edge Function logs. Trigger a **new deploy** (Clear build cache & Deploy) after adding or fixing env vars.
- **Debug logging:** Agent/debug logging to localhost is gated with `import.meta.env.DEV` and does not run in production builds.
- **Security:** RLS and admin checks are in place; avoid sending a strict COOP header on the host (see Troubleshooting).
- **Error handling:** Consider adding a React error boundary around the app for a friendly fallback on uncaught errors.

## Verification (end-to-end)

After deploying, validate these flows:

1. **Subscribe → Stripe → Success**
   - Log in, go to Pricing, click Subscribe.
   - Should redirect to Stripe checkout within ~15s (or show a timeout error).
   - Complete payment; Stripe redirects to `/subscription-success`.
   - `confirm-subscription` records the subscription; you are redirected home with active status.

2. **Content stability**
   - Browse Admin, Videos, Blog; leave the tab open 10+ minutes.
   - Content should not disappear or log you out unexpectedly (no false 401s from Edge Functions).

3. **Paid video playback**
   - Not subscribed: paid video returns 403 (subscription required).
   - Subscribed: paid video returns signed URL and plays.

## Troubleshooting

### Subscribe shows "Checkout is taking too long" with no stripe-checkout logs in Supabase

The request from the browser never reaches the Edge Function. Causes:

1. **Missing or wrong `VITE_SUPABASE_URL` at Render build time** – The built bundle calls an empty or incorrect URL. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Render Environment, then trigger a new deploy.
2. **Request blocked** – In DevTools → Network, check if a request to `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-checkout` appears when you click Subscribe. If no request appears, the frontend URL is wrong. If it appears but stays pending/failed, check CORS or network.

### Login/sign up fails with "Cross-Origin-Opener-Policy would block the window.postMessage call"

This happens when the host (e.g. Render) sends a strict **Cross-Origin-Opener-Policy** (COOP) header (e.g. `same-origin`), which blocks the postMessage flow used by some auth flows. Fix it by either:

- **On the host:** Do not send a strict COOP header for the app, or set it to `unsafe-none` for the site (e.g. in Render: Headers for the static site, path `/*`).
- **In the app:** Google sign-in uses Supabase redirect OAuth (no popup/postMessage), so it is not affected by COOP once this flow is in use.

## Security

- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in frontend or `VITE_*` env vars
- The service role key is only used server-side in Edge Functions
- Row Level Security (RLS) policies protect all tables; anon key has limited access

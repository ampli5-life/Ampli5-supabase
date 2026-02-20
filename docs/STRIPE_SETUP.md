# Stripe Payment Gateway Configuration from Scratch

This guide configures Stripe for the Ampli5 subscription flow (Silver $10/month, Gold $75/year). The app code is already wired; you only need to configure Stripe Dashboard, Supabase secrets, and Render env vars.

## Part 1: Stripe Dashboard Setup

### 1.1 Create Stripe account / switch to test mode

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up or log in. For development, use **Test mode** (toggle in top-right).
3. Get your keys: **Developers** → **API keys** → copy **Secret key** (sk_test_xxx or sk_live_xxx).

### 1.2 Create products and prices

1. **Products** → **Add product**
2. **Product 1 – Silver**
   - Name: `Silver Plan`
   - Description: `Full access to premium videos. Monthly subscription.`
   - Pricing: **Recurring** → **Monthly** → **$10**
   - Add product. Copy the **Price ID** (starts with `price_xxx`).
3. **Product 2 – Gold**
   - Name: `Gold Plan`
   - Description: `Best value. All content, billed annually.`
   - Pricing: **Recurring** → **Yearly** → **$75**
   - Add product. Copy the **Price ID**.

### 1.3 Create webhook endpoint

1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`  
   Replace `YOUR_PROJECT_REF` with your Supabase project reference (from Supabase Dashboard → Settings → API, or from your `VITE_SUPABASE_URL`, e.g. `dsxussocosuifwzbttjr`).
3. **Events to send:** Select:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Add endpoint**. Reveal and copy the **Signing secret** (whsec_xxx).

---

## Part 2: Supabase Secrets

Set these via Supabase Dashboard (Project → Edge Functions → Secrets) or CLI:

| Secret | Value | Source |
|--------|-------|--------|
| `STRIPE_SECRET_KEY` | sk_test_xxx or sk_live_xxx | Stripe → Developers → API keys |
| `STRIPE_PRICE_SILVER` | price_xxx | Stripe → Products → Silver price ID |
| `STRIPE_PRICE_GOLD` | price_xxx | Stripe → Products → Gold price ID |
| `STRIPE_WEBHOOK_SECRET` | whsec_xxx | Stripe → Webhooks → endpoint signing secret |
| `STRIPE_SUCCESS_URL` | https://your-frontend.onrender.com/subscription-success | Your Render URL |
| `STRIPE_CANCEL_URL` | https://your-frontend.onrender.com/pricing | Your Render URL |

For local dev you can leave success/cancel unset; the Edge Function derives them from the request Origin.

**CLI example (replace placeholders with your values):**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_PRICE_SILVER=price_...
supabase secrets set STRIPE_PRICE_GOLD=price_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_SUCCESS_URL=https://ampli5-frontend-c0iq.onrender.com/subscription-success
supabase secrets set STRIPE_CANCEL_URL=https://ampli5-frontend-c0iq.onrender.com/pricing
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to Edge Functions.

---

## Part 3: Render Environment (Frontend)

For the Pricing page to call the `stripe-checkout` Edge Function, the frontend must have Supabase URL and anon key set at **build time**:

| Env var | Value |
|---------|-------|
| `VITE_SUPABASE_URL` | https://YOUR_PROJECT_REF.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (Settings → API) |

In Render: **Environment** → add or correct these → **Clear build cache & Deploy**.

---

## Part 4: Deploy Edge Functions

From the project root:

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy confirm-subscription
```

---

## Part 5: Verification

1. **Local test**
   - Run frontend: `cd frontend && npm run dev`
   - Log in, go to `/pricing`, click Subscribe (Silver or Gold).
   - Should redirect to Stripe Checkout. Use test card `4242 4242 4242 4242`.
2. **Supabase function logs**
   - Supabase Dashboard → Edge Functions → select `stripe-checkout` / `stripe-webhook` → Logs.
   - Ensure no errors when starting checkout or after payment.
3. **Render**
   - After setting Render env vars and redeploying, repeat the Subscribe flow on the live site.

---

## Checklist

- [ ] Stripe products created (Silver, Gold) with correct prices
- [ ] Price IDs copied for Silver and Gold
- [ ] Webhook endpoint added with correct Supabase URL and events
- [ ] Webhook signing secret copied
- [ ] Supabase secrets set (6 vars)
- [ ] Render env vars set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Edge Functions deployed
- [ ] End-to-end test: Subscribe → Stripe Checkout → Success page → subscription active

# PayPal setup

For subscription (Silver/Gold) and profile features:

1. Create a PayPal app in the [Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Set in `.env`: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (sandbox/live), `PAYPAL_PLAN_SILVER`, `PAYPAL_PLAN_GOLD`.
3. Set `PAYPAL_RETURN_URL` and `PAYPAL_CANCEL_URL` to match where the app is served (e.g. `http://localhost/subscription-success` for local).
4. Set `VITE_PAYPAL_CLIENT_ID` for the frontend.

See `.env.example` for variable names.

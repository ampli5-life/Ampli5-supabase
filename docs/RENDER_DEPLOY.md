# Deploy Ampli5 to Render with Blueprint

This guide walks through deploying the database, backend, and frontend to [Render](https://render.com) using the **Blueprint** defined in `render.yaml`.

## Prerequisites

- A **GitHub** (or GitLab) repository with this Ampli5 project pushed.
- A **Render** account ([sign up](https://dashboard.render.com/register)).

## 1. Connect the repository and create a Blueprint

1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** and choose **Blueprint**.
2. Connect your Git provider if needed, then select the **repository** that contains this project.
3. Select the **branch** to deploy (e.g. `main`).
4. Render will detect `render.yaml` in the repo root. Click **Apply** (or **Create Blueprint Instance**) so Render creates the resources defined in the Blueprint.

Render will create:

- **ampli5-db** – PostgreSQL database
- **ampli5-backend** – Web service (Docker, Spring Boot)
- **ampli5-frontend** – Static site (Vite build)

## 2. Set environment variables (secrets)

After the first sync, set the following in the Render Dashboard so the app works correctly.

### Backend (ampli5-backend)

In the backend service → **Environment**:

| Key | Description |
|-----|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (same as in Google Cloud Console). |
| `PAYPAL_CLIENT_ID` | PayPal app Client ID. |
| `PAYPAL_CLIENT_SECRET` | PayPal app Client Secret. |
| `PAYPAL_MODE` | `sandbox` or `live`. |
| `PAYPAL_PLAN_SILVER` | PayPal plan ID for Silver subscription. |
| `PAYPAL_PLAN_GOLD` | PayPal plan ID for Gold subscription. |
| `PAYPAL_RETURN_URL` | e.g. `https://ampli5-frontend.onrender.com/subscription-success`. |
| `PAYPAL_CANCEL_URL` | e.g. `https://ampli5-frontend.onrender.com/`. |
| `CORS_ORIGINS` | Frontend URL, e.g. `https://ampli5-frontend.onrender.com` (so the API allows requests from the frontend). |
| `CONTACT_MAIL_USER` | SMTP user for contact form (optional). |
| `CONTACT_MAIL_PASSWORD` | SMTP password (optional). |
| `CONTACT_MAIL_RECIPIENT` | Email to receive contact form submissions (optional). |

`DATABASE_URL` and `JWT_SECRET` are set by the Blueprint (from the database and generated).

### Frontend (ampli5-frontend)

In the frontend service → **Environment**:

| Key | Description |
|-----|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth Client ID (for “Sign in with Google”). |
| `VITE_PAYPAL_CLIENT_ID` | Same PayPal Client ID (for frontend). |
| `VITE_API_URL` | **Backend URL**, e.g. `https://ampli5-backend.onrender.com` (no trailing slash). Required so the SPA calls the correct API. |

Replace `ampli5-backend.onrender.com` and `ampli5-frontend.onrender.com` with the actual URLs Render shows for your backend and frontend services.

## 3. Redeploy after setting env vars

1. **Backend**: Open the backend service → **Manual Deploy** → **Deploy latest commit** (so it picks up new env vars).
2. **Frontend**: Open the frontend service → **Manual Deploy** → **Deploy latest commit** (so the build gets `VITE_API_URL` and the other Vite vars).

## 4. Verify

1. Open the **frontend** URL (e.g. `https://ampli5-frontend.onrender.com`).
2. Test **Sign up** and **Log in** (email and, if configured, Google).
3. Confirm API calls work (e.g. loading data, subscription flow if you set up PayPal).
4. In the Render Dashboard, check the backend and database for errors or high load.

## 5. Optional

- **Custom domains**: In each service, add your domain under **Settings** → **Custom Domains**.
- **PayPal production**: Switch to `live` and set production plan IDs and return/cancel URLs to your production domain.
- **Branch**: The Blueprint uses the branch you selected; change it in the Blueprint or service settings if you want to deploy another branch.

## Troubleshooting

- **API calls fail (CORS or 404)**  
  Ensure backend **CORS_ORIGINS** includes the exact frontend URL (e.g. `https://ampli5-frontend.onrender.com`) and **VITE_API_URL** on the frontend is the exact backend URL.

- **“Sign in with Google (not configured)”**  
  Set **VITE_GOOGLE_CLIENT_ID** on the frontend and **GOOGLE_CLIENT_ID** on the backend, then redeploy the frontend so the new value is baked in.

- **Database connection errors**  
  The Blueprint links the backend to **ampli5-db** via `DATABASE_URL`. If the backend was created before the database, trigger a redeploy of the backend after the database is available.

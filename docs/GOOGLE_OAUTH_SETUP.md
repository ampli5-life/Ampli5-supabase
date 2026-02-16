# Google OAuth setup (Login / Sign up with Google)

To show the "Sign in with Google" option on the Login and Sign up pages:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized JavaScript origins**, add your origins (e.g. `http://localhost`, `https://yourdomain.com`).
3. Copy the **Client ID**.
4. In the project root `.env` (copy from `.env.example` if needed), set:
   - `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>` (frontend; required for the button to appear)
   - `GOOGLE_CLIENT_ID=<your-google-client-id>` (backend; same value, used for token verification)
5. Rebuild the frontend so the value is baked in:
   - Docker: `docker compose up --build -d` or rebuild the frontend service.
   - Local: restart `npm run dev` or run `npm run build`.

If `VITE_GOOGLE_CLIENT_ID` is not set, the Login and Sign up pages will show a placeholder instead of the Google button.

# Deployment

Deploy Ampli5 using Docker or your platform's Docker Compose support (e.g. Render, Railway).

1. Set environment variables (see `.env.example` and [PAYPAL_SETUP.md](PAYPAL_SETUP.md)).
2. For production, set `DATABASE_URL` (e.g. `postgresql://user:password@host:5432/database`) or use the individual DB vars.
3. Run `docker compose up --build -d` or use your host's equivalent.

Frontend: port 80. Backend: port 8081.

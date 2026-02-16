# Ampli5

Full-stack app with Spring Boot backend, React frontend, and PostgreSQL. Ready to run with Docker and to deploy (e.g. Render, Railway).

## Prerequisites

- Docker and Docker Compose

## Run locally

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set any required values (Google OAuth, PayPal, etc.).
3. Build and start all services:
   ```bash
   ./start.sh
   ```
   Or: `docker compose up --build -d`
4. Open:
   - **Frontend:** http://localhost
   - **Backend API:** http://localhost:8081
   - **Postgres:** localhost:5434 (internal use)

To pick up code changes, run `./start.sh` or `docker compose up --build -d` again.

## Project layout

- **backend/** – Spring Boot API
- **frontend/** – Vite/React UI
- **docs/** – [Deployment](docs/DEPLOY.md), [Render Blueprint](docs/RENDER_DEPLOY.md), [Google OAuth](docs/GOOGLE_OAUTH_SETUP.md), [PayPal setup](docs/PAYPAL_SETUP.md)
- **docker-compose.yml** – Postgres, backend, frontend
- **.env.example** – Template for env vars (copy to `.env`)

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md). For **Render** (database + backend + frontend from one Blueprint), see [docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md). For Google sign-in, see [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md). For PayPal/subscription setup, see [docs/PAYPAL_SETUP.md](docs/PAYPAL_SETUP.md). This repo is set up for deployment: use your platform’s Docker or Docker Compose support (e.g. Render, Railway). Set `DATABASE_URL` (or the individual DB vars) and the same env vars as in `.env.example` in your deployment environment.
# Ampli-life

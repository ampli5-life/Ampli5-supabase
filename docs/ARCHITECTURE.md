# Ampli5 Architecture

## Folder structure

```
oup copy/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── lib/
│   │   │   ├── supabase.ts   # Supabase client (anon key only)
│   │   │   └── api.ts        # Data fetching, Edge Function calls
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Supabase Auth
│   │   └── pages/
│   ├── package.json
│   └── Dockerfile
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20240219000000_init_schema.sql
│   └── functions/
│       ├── stripe-checkout/
│       ├── stripe-webhook/
│       ├── confirm-subscription/
│       ├── video-signed-url/
│       ├── contact/
│       └── create-user/
├── docs/
│   ├── SUPABASE_MIGRATION.md
│   └── ARCHITECTURE.md
├── render.yaml
├── docker-compose.yml
├── .env.example
└── README.md
```

## Security

- **service_role key**: Used only in Supabase Edge Functions (server-side). Never in frontend or `VITE_*` env vars.
- **anon key**: Safe for frontend. RLS policies enforce access control.
- **Stripe webhook**: Validates signature before processing.

## Data flow

- **Auth**: Supabase Auth (email/password, Google OAuth)
- **Content**: Supabase tables (videos, blog_posts, etc.) via anon client + RLS
- **Subscriptions**: Edge Functions create Stripe sessions; webhook updates `subscriptions` table
- **Video playback**: Free → YouTube embed; Paid → Supabase Storage signed URL (60s)
- **Contact form**: Edge Function inserts into `contact_submissions`

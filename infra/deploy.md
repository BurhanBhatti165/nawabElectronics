# Deployment Targets

## Frontend (Vercel)
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://api.yourdomain.com`
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`

## Backend (AWS)
- Recommended: AWS App Runner or ECS Fargate
- Start command:
  - `uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend`
- Environment variables from `backend/.env.example`
- Expose as `api.yourdomain.com`

## Supabase
- Run `infra/supabase/schema.sql` in SQL editor.
- Optionally run `infra/supabase/seed.sql` for demo data.
- Keep service role key only on backend.
- Enable RLS once auth flow is finalized.

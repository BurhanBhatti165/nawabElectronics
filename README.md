## Nawab: Vite + FastAPI + Supabase

This repository is now structured for:
- `frontend`: Vite + React app
- `backend`: FastAPI service
- `infra`: deployment and Supabase SQL

## Local Development

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2) Backend
```bash
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
copy backend/.env.example backend/.env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --app-dir backend
```

## Supabase Setup

1. Create a Supabase project.
2. Run SQL from `infra/supabase/schema.sql`.
3. Add credentials to:
   - `frontend/.env`
   - `backend/.env`

## Deploy

See `infra/deploy.md` for Vercel + AWS + Supabase deployment details.

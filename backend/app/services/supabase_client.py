from supabase import create_client, Client
from app.core.config import get_settings


def get_supabase_admin() -> Client:
    settings = get_settings()
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not settings.supabase_url or not key:
        raise RuntimeError("Supabase credentials are missing. Check backend/.env")
    return create_client(settings.supabase_url, key)

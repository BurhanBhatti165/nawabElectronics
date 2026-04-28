from fastapi import APIRouter, Depends, HTTPException
from app.schemas import BannerIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_manager_or_admin

router = APIRouter(prefix="/banners", tags=["banners"])

@router.get("")
def list_banners():
    supabase = get_supabase_admin()
    result = supabase.table("banners").select("*").order("created_at", desc=False).execute()
    return result.data or []

@router.post("")
def create_banner(payload: BannerIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    
    # Check limit of 4 banners
    existing = supabase.table("banners").select("id").execute()
    if existing.data and len(existing.data) >= 4:
        raise HTTPException(status_code=400, detail="Maximum limit of 4 banners reached.")

    body = payload.model_dump()
    result = supabase.table("banners").insert(body).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create banner")
    return result.data[0]

@router.put("/{banner_id}")
def update_banner(banner_id: str, payload: BannerIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    result = supabase.table("banners").update(body).eq("id", banner_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Banner not found")
    return result.data[0]

@router.delete("/{banner_id}")
def delete_banner(banner_id: str, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = supabase.table("banners").delete().eq("id", banner_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted successfully"}

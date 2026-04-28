from fastapi import APIRouter, Depends, HTTPException
from app.schemas import BrandIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_manager_or_admin

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("")
def list_brands():
    supabase = get_supabase_admin()
    result = supabase.table("brands").select("id,name,logo,created_at").order("name").execute()
    return result.data or []


@router.post("")
def create_brand(payload: BrandIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = supabase.table("brands").insert(payload.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create brand")
    return result.data[0]


@router.put("/{brand_id}")
def update_brand(brand_id: str, payload: BrandIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = supabase.table("brands").update(payload.model_dump()).eq("id", brand_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Brand not found")
    return result.data[0]


@router.delete("/{brand_id}")
def delete_brand(brand_id: str, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    try:
        result = supabase.table("brands").delete().eq("id", brand_id).execute()
    except Exception as exc:
        message = str(exc).lower()
        if "violates foreign key constraint" in message:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete brand because products are linked to it",
            ) from exc
        raise HTTPException(status_code=500, detail="Failed to delete brand") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted successfully"}

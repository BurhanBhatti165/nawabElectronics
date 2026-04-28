from fastapi import APIRouter, Depends, HTTPException
from app.schemas import CategoryIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_manager_or_admin

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories():
    supabase = get_supabase_admin()
    result = (
        supabase.table("categories")
        .select("id,name,description,show_on_home,home_description,created_at")
        .order("name")
        .execute()
    )
    return result.data or []


@router.post("")
def create_category(payload: CategoryIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    result = supabase.table("categories").insert(body).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create category")
    return result.data[0]


@router.get("/{category_id}")
def get_category(category_id: str):
    supabase = get_supabase_admin()
    result = (
        supabase.table("categories")
        .select("id,name,description,show_on_home,home_description,created_at")
        .eq("id", category_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")
    return result.data[0]


@router.put("/{category_id}")
def update_category(category_id: str, payload: CategoryIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    result = supabase.table("categories").update(body).eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")
    return result.data[0]


@router.delete("/{category_id}")
def delete_category(category_id: str, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = supabase.table("categories").delete().eq("id", category_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

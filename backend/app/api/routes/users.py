from fastapi import APIRouter, Depends, HTTPException
from app.schemas import ManagerIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_admin

from app.api.routes.auth import pwd_context

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/managers")
def list_managers(_: str = Depends(require_admin)):
    supabase = get_supabase_admin()
    result = (
        supabase.table("users")
        .select("id,email,name,phone,role,created_at")
        .eq("role", "manager")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/managers")
def create_manager(payload: ManagerIn, _: str = Depends(require_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    body["email"] = body["email"].strip().lower()
    body["role"] = "manager"
    body["password"] = pwd_context.hash(body["password"])
    result = supabase.table("users").insert(body).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create manager")
    return result.data[0]


@router.delete("/managers/{manager_id}")
def delete_manager(manager_id: str, _: str = Depends(require_admin)):
    supabase = get_supabase_admin()
    result = (
        supabase.table("users")
        .delete()
        .eq("id", manager_id)
        .eq("role", "manager")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Manager not found")
    return {"message": "Manager removed successfully"}

from fastapi import Header, HTTPException


ALLOWED_ROLES = {"customer", "manager", "admin"}


def normalize_role(role: str | None) -> str:
    if not role:
        return "customer"
    value = role.strip().lower()
    if value not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    return value


def get_role(x_user_role: str | None = Header(default=None)) -> str:
    return normalize_role(x_user_role)


def require_manager_or_admin(role: str = Header(default="customer", alias="x-user-role")) -> str:
    normalized = normalize_role(role)
    if normalized not in {"manager", "admin"}:
        raise HTTPException(status_code=403, detail="Manager or admin access required")
    return normalized


def require_admin(role: str = Header(default="customer", alias="x-user-role")) -> str:
    normalized = normalize_role(role)
    if normalized != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return normalized

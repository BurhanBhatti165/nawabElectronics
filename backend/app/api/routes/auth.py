from fastapi import APIRouter, HTTPException
from app.services.supabase_client import get_supabase_admin
from pydantic import BaseModel
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    phone: str = ""

@router.post("/login")
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    supabase = get_supabase_admin()
    
    # Check if user exists
    result = supabase.table("users").select("*").eq("email", email).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
        
    user = result.data[0]
    hashed_pw = user.get("password")
    
    if not hashed_pw:
         raise HTTPException(status_code=400, detail="Account does not have a password set. Contact admin.")

    if not pwd_context.verify(payload.password, hashed_pw):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Don't return the password
    user.pop("password", None)
    return user

@router.post("/register")
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    supabase = get_supabase_admin()
    
    # Check if already exists
    exists = supabase.table("users").select("id").eq("email", email).execute()
    if exists.data:
        raise HTTPException(status_code=400, detail="User already registered")
    
    body = payload.model_dump()
    body["password"] = pwd_context.hash(payload.password)
    body["role"] = "customer"
    
    result = supabase.table("users").insert(body).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Registration failed")
    
    user = result.data[0]
    user.pop("password", None)
    return user

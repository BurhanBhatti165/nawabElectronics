from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas import ProductIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_manager_or_admin

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    search: Optional[str] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    brand_id: Optional[str] = Query(default=None),
    min_price: Optional[float] = Query(default=None),
    max_price: Optional[float] = Query(default=None),
    ac_type: Optional[str] = Query(default=None),
    refrigerator_type: Optional[str] = Query(default=None),
    cubic_feet: Optional[str] = Query(default=None),
    cooling_type: Optional[str] = Query(default=None),
    technology: Optional[str] = Query(default=None),
    color: Optional[str] = Query(default=None),
    capacity: Optional[str] = Query(default=None),
    weight: Optional[str] = Query(default=None),
    in_stock: Optional[bool] = Query(default=None),
    sort_by: Optional[str] = Query(default="newest"),
    limit: Optional[int] = Query(default=None),
    offset: Optional[int] = Query(default=0),
    include_inactive: bool = Query(default=False),
):
    supabase = get_supabase_admin()
    # Query the view which adds effective_price = COALESCE(discount_price, price)
    query = supabase.table("products_with_effective_price").select(
        "id,name,description,specifications,price,discount_price,effective_price,stock,images,category_id,brand_id,is_featured,is_active,created_at,ac_type,refrigerator_type,cubic_feet,cooling_type,technology,color,capacity,weight,categories(id,name,description),brands(id,name,logo,created_at)"
    )
    
    # Filter for active products by default
    if not include_inactive:
        query = query.eq("is_active", True)
    if search:
        query = query.ilike("name", f"%{search.strip()}%")
    if category_id:
        query = query.eq("category_id", category_id)
    if brand_id:
        query = query.eq("brand_id", brand_id)
    # Use effective_price (discount_price if set, otherwise price) for range filtering
    if min_price is not None:
        query = query.gte("effective_price", min_price)
    if max_price is not None:
        query = query.lte("effective_price", max_price)
    if ac_type:
        query = query.eq("ac_type", ac_type)
    if refrigerator_type:
        query = query.eq("refrigerator_type", refrigerator_type)
    if cubic_feet:
        query = query.eq("cubic_feet", cubic_feet)
    if cooling_type:
        query = query.eq("cooling_type", cooling_type)
    if technology:
        query = query.eq("technology", technology)
    if color:
        query = query.eq("color", color)
    if capacity:
        query = query.eq("capacity", capacity)
    if weight:
        query = query.eq("weight", weight)
    if in_stock is True:
        query = query.gt("stock", 0)

    # Sorting & Pagination
    if sort_by == "discount":
        # Can't do computed column sort in DB, so fetch all filtered results
        # and sort by actual discount percentage in Python
        result = query.execute()
        data = result.data or []

        def discount_pct(p):
            price = float(p.get("price") or 0)
            dp = p.get("discount_price")
            if dp is None or price <= 0:
                return 0.0
            return (price - float(dp)) / price

        data.sort(key=discount_pct, reverse=True)

        # Manual pagination
        if limit is not None:
            data = data[offset: offset + limit]
        return data

    # All other sorts: DB-side ordering + pagination
    if sort_by == "price_asc":
        query = query.order("price", desc=False)
    elif sort_by == "price_desc":
        query = query.order("price", desc=True)
    elif sort_by == "name_asc":
        query = query.order("name", desc=False)
    else:  # newest (default)
        query = query.order("created_at", desc=True)

    if limit is not None:
        query = query.range(offset, offset + limit - 1)

    result = query.execute()
    return result.data or []



@router.post("")
def create_product(payload: ProductIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    body["discount_price"] = body.pop("discountPrice")
    body["category_id"] = body.pop("categoryId")
    body["brand_id"] = body.pop("brandId")
    body["is_featured"] = body.pop("isFeatured")
    result = supabase.table("products").insert(body).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create product")
    return result.data[0]


@router.get("/{product_id}")
def get_product(product_id: str):
    supabase = get_supabase_admin()
    result = (
        supabase.table("products")
        .select(
            "id,name,description,specifications,price,discount_price,stock,images,category_id,brand_id,is_featured,is_active,created_at,ac_type,refrigerator_type,cubic_feet,cooling_type,technology,color,capacity,weight,categories(id,name,description),brands(id,name,logo,created_at)"
        )
        .eq("id", product_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return result.data[0]


@router.put("/{product_id}")
def update_product(product_id: str, payload: ProductIn, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    body = payload.model_dump()
    body["discount_price"] = body.pop("discountPrice")
    body["category_id"] = body.pop("categoryId")
    body["brand_id"] = body.pop("brandId")
    body["is_featured"] = body.pop("isFeatured")
    result = supabase.table("products").update(body).eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return result.data[0]


@router.delete("/{product_id}")
def delete_product(product_id: str, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    # Soft delete: just set is_active to false
    result = supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found or already inactive")
    return {"message": "Product deactivated successfully"}

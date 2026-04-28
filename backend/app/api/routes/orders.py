from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.schemas import OrderIn
from app.services.supabase_client import get_supabase_admin
from app.core.auth import require_admin, require_manager_or_admin
from app.services.mail import send_order_confirmation

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("")
def list_orders(_: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = (
        supabase.table("orders")
        .select(
            "id,user_id,customer_name,customer_email,customer_phone,shipping_address,city,total_amount,payment_method,status,payment_status,created_at,order_items(id,order_id,product_id,quantity,price,products(name,price,discount_price))"
        )
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/summary")
def orders_summary(_: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    result = supabase.table("orders").select("id,total_amount").execute()
    orders = result.data or []
    return {
        "totalOrders": len(orders),
        "totalRevenue": sum(float(order.get("total_amount") or 0) for order in orders),
    }


@router.patch("/{order_id}")
def update_order_status(order_id: str, payload: dict, _: str = Depends(require_manager_or_admin)):
    supabase = get_supabase_admin()
    status = payload.get("status")
    payment_status = payload.get("payment_status")
    
    update_data = {}
    if status:
        update_data["status"] = status
    if payment_status:
        update_data["payment_status"] = payment_status
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No status provided")
        
    result = supabase.table("orders").update(update_data).eq("id", order_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data[0]


@router.post("")
async def create_order(payload: OrderIn, background_tasks: BackgroundTasks):
    supabase = get_supabase_admin()
    order_data = payload.model_dump()
    items = order_data.pop("items")
    order_data["customer_name"] = order_data.pop("customerName")
    order_data["customer_email"] = order_data.pop("customerEmail")
    order_data["customer_phone"] = order_data.pop("customerPhone")
    order_data["shipping_address"] = order_data.pop("shippingAddress")
    order_data["total_amount"] = order_data.pop("totalAmount")
    order_data["payment_method"] = order_data.pop("paymentMethod")

    order_resp = supabase.table("orders").insert(order_data).execute()
    if not order_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create order")

    order = order_resp.data[0]
    order_id = order["id"]
    mapped_items = [
        {
            "order_id": order_id,
            "product_id": item["productId"],
            "quantity": item["quantity"],
            "price": item["price"],
        }
        for item in items
    ]
    supabase.table("order_items").insert(mapped_items).execute()

    # Prepare data for email
    try:
        product_ids = [item["productId"] for item in items]
        prod_resp = supabase.table("products").select("id, name").in_("id", product_ids).execute()
        prod_map = {p["id"]: p["name"] for p in prod_resp.data} if prod_resp.data else {}
        
        email_items = []
        for item in items:
            email_items.append({
                "product_name": prod_map.get(item["productId"], "Product"),
                "quantity": item["quantity"],
                "price": item["price"]
            })
        
        background_tasks.add_task(send_order_confirmation, order, email_items)
    except Exception as e:
        print(f"⚠️ Error preparing order email: {str(e)}")

    return order

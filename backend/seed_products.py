import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Setup Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("Error: Supabase URL or Key not found in environment variables.")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

seed_products = [
    {
        "name": "1.5 Ton Wall Mounted Inverter",
        "description": "Premium 1.5 Ton Inverter AC with energy-saving features and fast cooling. Enjoy comfortable temperatures year-round.",
        "specifications": "Power Supply: 220-240V\nCooling Capacity: 18000 BTU\nRefrigerant: R410A\nCompressor Type: Rotary",
        "price": 230000,
        "discount_price": 225000,
        "stock": 10,
        "category_id": None, # Will be set if categories exist, otherwise requires a valid UUID
        "brand_id": None,    # Will be set if brands exist, otherwise requires a valid UUID
        "images": "[]",
        "is_featured": True,
        "ac_type": "Wall Mounted Split Ac",
        "cooling_type": "Heat And Cool",
        "technology": "Inverter",
        "color": "White",
        "capacity": "1.5 Ton(18000BTU)",
        "weight": "50 KG"
    },
    {
        "name": "91998 Signature Inverter Grey Twin Door Freezer",
        "description": "Spacious twin door deep freezer with inverter technology for maximum energy savings.",
        "specifications": "Type: Twin Door\nDefrost: Manual\nEnergy Rating: A++\nRefrigerant: R600a",
        "price": 104000,
        "discount_price": None,
        "stock": 5,
        "category_id": None,
        "brand_id": None,
        "images": "[]",
        "is_featured": True,
        "refrigerator_type": "Double Door",
        "technology": "Inverter",
        "color": "Charcoal Grey",
        "capacity": "15-CFT",
        "weight": "70 KG"
    }
]

def run_seed():
    print("Fetching categories and brands to associate...")
    
    # Try to get first category and brand to attach
    categories_res = supabase.table("categories").select("id").limit(1).execute()
    brands_res = supabase.table("brands").select("id").limit(1).execute()
    
    cat_id = categories_res.data[0]['id'] if categories_res.data else None
    brand_id = brands_res.data[0]['id'] if brands_res.data else None

    if not cat_id or not brand_id:
        print("Warning: No categories or brands found. Seeding might fail if these are required fields in your DB.")

    for prod in seed_products:
        prod["category_id"] = cat_id
        prod["brand_id"] = brand_id
        print(f"Inserting product: {prod['name']}")
        try:
            res = supabase.table("products").insert(prod).execute()
            print("Success!")
        except Exception as e:
            print(f"Failed to insert {prod['name']}: {e}")

if __name__ == "__main__":
    run_seed()
    print("Seed complete.")

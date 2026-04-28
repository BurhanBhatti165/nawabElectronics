import json
from typing import Optional
from pydantic import BaseModel, field_validator


class ProductIn(BaseModel):
    name: str
    description: str
    specifications: Optional[str] = ""
    price: float
    discountPrice: Optional[float] = None
    stock: int = 0
    categoryId: str
    brandId: str
    images: Optional[str] = "[]"
    isFeatured: bool = False
    # Filter fields
    ac_type: Optional[str] = ""
    refrigerator_type: Optional[str] = ""
    cubic_feet: Optional[str] = ""
    cooling_type: Optional[str] = ""
    technology: Optional[str] = ""
    color: Optional[str] = ""
    capacity: Optional[str] = ""
    weight: Optional[str] = ""

    @field_validator("images")
    @classmethod
    def validate_images(cls, value: Optional[str]) -> str:
        raw_value = value or "[]"
        try:
            parsed = json.loads(raw_value)
        except json.JSONDecodeError as exc:
            raise ValueError("images must be a valid JSON array string") from exc
        if not isinstance(parsed, list):
            raise ValueError("images must be a JSON array string")
        if len(parsed) > 4:
            raise ValueError("images supports up to 4 links")
        return raw_value


class CategoryIn(BaseModel):
    name: str
    description: Optional[str] = ""
    show_on_home: bool = False
    home_description: Optional[str] = ""


class ManagerIn(BaseModel):
    email: str
    password: str
    name: Optional[str] = ""
    phone: Optional[str] = ""


class BrandIn(BaseModel):
    name: str
    logo: Optional[str] = None


class OrderItemIn(BaseModel):
    productId: str
    quantity: int
    price: float


class OrderIn(BaseModel):
    customerName: str
    customerEmail: str
    customerPhone: str
    shippingAddress: str
    city: str
    totalAmount: float
    paymentMethod: str
    items: list[OrderItemIn]


class BannerIn(BaseModel):
    title: Optional[str] = ""
    subtitle: Optional[str] = ""
    image: str
    link_url: Optional[str] = ""

from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class FavoriteCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0)
    type: str = Field(..., pattern="^(INCOME|EXPENSE)$")
    category_id: str
    payment_method: str = Field("UPI", pattern="^(CASH|UPI|CARD|BANK_TRANSFER|OTHER)$")
    note: Optional[str] = Field(None, max_length=255)

class FavoriteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(None, gt=0)
    type: Optional[str] = Field(None, pattern="^(INCOME|EXPENSE)$")
    category_id: Optional[str] = None
    payment_method: Optional[str] = Field(None, pattern="^(CASH|UPI|CARD|BANK_TRANSFER|OTHER)$")
    note: Optional[str] = Field(None, max_length=255)

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    name: str
    amount: Decimal
    type: str
    category_id: str
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    payment_method: str
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime


class TransactionCreate(BaseModel):
    amount: Decimal = Field(
        ...,
        gt=0,
        decimal_places=2,
        description="Transaction amount with Decimal precision",
    )
    type: str = Field(..., pattern="^(INCOME|EXPENSE)$")
    category_id: str

    # V2: where the money exists / moved from or into
    account_id: str

    transaction_date: date
    payment_method: str = Field(
        default="CASH",
        pattern="^(CASH|UPI|CARD|BANK_TRANSFER|OTHER)$",
    )
    note: Optional[str] = None


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    type: Optional[str] = Field(None, pattern="^(INCOME|EXPENSE)$")
    category_id: Optional[str] = None

    # V2: allow moving a normal transaction to another owned account
    account_id: Optional[str] = None

    transaction_date: Optional[date] = None
    payment_method: Optional[str] = Field(
        None,
        pattern="^(CASH|UPI|CARD|BANK_TRANSFER|OTHER)$",
    )
    note: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    category_id: str

    # V2
    account_id: str
    account_name: Optional[str] = None

    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    type: str
    amount: Decimal
    transaction_date: date
    payment_method: str
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    pagination: PaginationMeta
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    account_type: str = Field(
        ...,
        pattern="^(CASH|BANK|WALLET|OTHER)$",
    )
    opening_balance: Decimal = Field(
        default=Decimal("0.00"),
        decimal_places=2,
    )


class AccountUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )


class AccountResponse(BaseModel):
    id: str
    user_id: str
    name: str
    account_type: str
    opening_balance: Decimal

    # Calculated from opening balance + transactions.
    current_balance: Decimal

    is_archived: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:

        from_attributes = True
class AccountSummaryResponse(BaseModel):
    account_id: str
    account_name: str
    account_type: str
    income: Decimal
    expense: Decimal
    current_balance: Decimal        
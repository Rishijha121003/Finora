from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    transfer_date: date
    note: str | None = None


class TransferResponse(BaseModel):
    id: str
    user_id: str

    from_account_id: str
    from_account_name: str

    to_account_id: str
    to_account_name: str

    amount: Decimal
    transfer_date: date
    note: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
        
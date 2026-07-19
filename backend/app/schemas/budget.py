from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime

class BudgetBase(BaseModel):
    category_id: Optional[str] = None
    amount: Decimal = Field(..., gt=0, description="Monthly budget limit amount")
    period: str = "MONTHLY"

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Updated monthly budget limit amount")

class BudgetResponse(BudgetBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    # Progress calculations
    current_spend: Decimal = Decimal("0.00")
    remaining_budget: Decimal = Decimal("0.00")
    percentage_used: float = 0.0
    is_exceeded: bool = False
    is_warning: bool = False  # >= 80%

    class Config:
        from_attributes = True

class BudgetSummary(BaseModel):
    overall_budget: Optional[BudgetResponse] = None
    category_budgets: list[BudgetResponse] = []
    total_budget_limit: Decimal = Decimal("0.00")
    total_budget_spend: Decimal = Decimal("0.00")
    overall_percentage_used: float = 0.0

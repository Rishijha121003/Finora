from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime, date

class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Goal title")
    target_amount: Decimal = Field(..., gt=0, description="Target savings amount")
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0, description="Currently saved amount")
    target_date: Optional[date] = None
    category: Optional[str] = "General"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    target_amount: Optional[Decimal] = Field(default=None, gt=0)
    current_amount: Optional[Decimal] = Field(default=None, ge=0)
    target_date: Optional[date] = None
    category: Optional[str] = None

class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    remaining_amount: Decimal = Decimal("0.00")
    percentage_completed: float = 0.0
    is_completed: bool = False

    class Config:
        from_attributes = True

class GoalsSummary(BaseModel):
    total_goals: int = 0
    total_target: Decimal = Decimal("0.00")
    total_saved: Decimal = Decimal("0.00")
    overall_progress: float = 0.0
    goals: list[GoalResponse] = []

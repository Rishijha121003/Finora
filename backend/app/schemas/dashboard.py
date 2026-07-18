from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from app.schemas.transaction import TransactionResponse

class DashboardSummaryMetrics(BaseModel):
    current_balance: Decimal
    total_income: Decimal
    total_expense: Decimal

class CategoryBreakdownItem(BaseModel):
    category_id: str
    category_name: str
    icon: str
    color: str
    total: Decimal
    percentage: float

class MonthlyTrendItem(BaseModel):
    month: str  # YYYY-MM
    income: Decimal
    expense: Decimal

class DashboardSummaryResponse(BaseModel):
    summary: DashboardSummaryMetrics
    category_breakdown: List[CategoryBreakdownItem]
    monthly_trends: List[MonthlyTrendItem]
    recent_transactions: List[TransactionResponse]

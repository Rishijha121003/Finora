from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class PulseFactorScore(BaseModel):
    """Individual factor breakdown for Pulse score"""
    name: str
    score: float = Field(..., ge=0, le=100, description="Factor score 0-100")
    weight: float = Field(..., ge=0, le=100, description="Weight percentage")
    explanation: str
    metric_value: Optional[str] = None


class PulseResponse(BaseModel):
    """Finora Pulse Financial Health Score Response"""
    overall_score: float = Field(..., ge=0, le=100, description="Overall score 0-100")
    score_label: str = Field(..., description="Excellent, Good, Fair, or Needs attention")
    score_color: str = Field(..., description="Color code for UI: green, blue, orange, red")
    
    # Factor breakdown
    factors: list[PulseFactorScore]
    
    # Summary explanation
    summary: str
    primary_insight: str
    
    # Optional context
    data_window: str = "3 months"
    has_sufficient_data: bool = True
    
    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    feedback_type: Literal["BUG", "FEATURE_REQUEST", "GENERAL"] = Field(..., description="Type of feedback")
    message: str = Field(..., min_length=5, max_length=2000, description="Feedback message")
    would_use_again: Literal["YES", "MAYBE", "NO"] = Field(..., description="Recommendation status")

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    rating: int
    feedback_type: str
    message: str
    would_use_again: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

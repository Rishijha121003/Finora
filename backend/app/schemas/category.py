from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: str = Field(..., pattern="^(INCOME|EXPENSE)$")
    icon: Optional[str] = Field(default="tag", max_length=50)
    color: Optional[str] = Field(default="#3b82f6", pattern="^#[0-9A-Fa-f]{6}$")

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")

class CategoryResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    type: str
    icon: str
    color: str
    is_system: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

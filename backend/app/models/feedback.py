import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    feedback_type = Column(String(50), nullable=False)  # BUG, FEATURE_REQUEST, GENERAL
    message = Column(Text, nullable=False)
    would_use_again = Column(String(20), nullable=False)  # YES, MAYBE, NO
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="feedback_entries")

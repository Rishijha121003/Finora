from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit user feedback.
    - Requires authentication.
    - user_id is automatically derived from the authenticated JWT token.
    """
    new_feedback = Feedback(
        user_id=current_user.id,
        rating=feedback_in.rating,
        feedback_type=feedback_in.feedback_type,
        message=feedback_in.message.strip(),
        would_use_again=feedback_in.would_use_again
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.pulse import PulseResponse
from app.utils.pulse_service import PulseScoreCalculator


router = APIRouter(
    prefix="/pulse",
    tags=["Pulse"]
)


@router.get("", response_model=PulseResponse)
def get_pulse(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PulseResponse:
    """
    Get Finora Pulse Financial Health Score
    
    Calculates a comprehensive financial health score (0-100) based on:
    - Saving Behavior: 35% (net savings ratio)
    - Expense Control: 30% (expense-to-income ratio)
    - Budget Discipline: 20% (budget adherence)
    - Balance Stability: 15% (account balance trends)
    
    Returns detailed score breakdown with explanations for each factor.
    """
    calculator = PulseScoreCalculator(current_user.id, db)
    pulse_score = calculator.calculate_pulse_score()
    return pulse_score
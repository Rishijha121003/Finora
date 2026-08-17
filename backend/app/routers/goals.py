from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalsSummary
from app.routers.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

def compute_goal_progress(goal: Goal) -> GoalResponse:
    target = Decimal(str(goal.target_amount))
    current = Decimal(str(goal.current_amount or 0))
    remaining = max(Decimal("0.00"), target - current)
    pct = float((current / target) * 100) if target > 0 else 0.0
    pct = min(100.0, max(0.0, pct))
    is_completed = current >= target

    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        target_amount=target,
        current_amount=current,
        target_date=goal.target_date,
        category=goal.category or "General",
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        remaining_amount=remaining,
        percentage_completed=round(pct, 1),
        is_completed=is_completed
    )

@router.get("", response_model=List[GoalResponse])
def get_user_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()
    return [compute_goal_progress(g) for g in goals]

@router.get("/summary", response_model=GoalsSummary)
def get_goals_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    responses = [compute_goal_progress(g) for g in goals]

    tot_target = sum((r.target_amount for r in responses), Decimal("0.00"))
    tot_saved = sum((r.current_amount for r in responses), Decimal("0.00"))
    overall_pct = float((tot_saved / tot_target) * 100) if tot_target > 0 else 0.0

    return GoalsSummary(
        total_goals=len(responses),
        total_target=tot_target,
        total_saved=tot_saved,
        overall_progress=round(min(100.0, max(0.0, overall_pct)), 1),
        goals=responses
    )

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_goal = Goal(
        user_id=current_user.id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        target_date=goal_in.target_date,
        category=goal_in.category or "General"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return compute_goal_progress(new_goal)

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if goal_in.title is not None:
        goal.title = goal_in.title
    if goal_in.target_amount is not None:
        goal.target_amount = goal_in.target_amount
    if goal_in.current_amount is not None:
        goal.current_amount = goal_in.current_amount
    if goal_in.target_date is not None:
        goal.target_date = goal_in.target_date
    if goal_in.category is not None:
        goal.category = goal_in.category

    db.commit()
    db.refresh(goal)
    return compute_goal_progress(goal)

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}

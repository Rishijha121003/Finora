from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, date

from app.database import get_db
from app.models.user import User
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetSummary
from app.routers.auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

def compute_budget_progress(budget: Budget, db: Session, user_id: str) -> BudgetResponse:
    now = datetime.utcnow()
    
    # Calculate current month's expenses for this category or overall
    query = db.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "EXPENSE",
            extract('year', Transaction.transaction_date) == now.year,
            extract('month', Transaction.transaction_date) == now.month
        )
        
    if budget.category_id:
        query = query.filter(Transaction.category_id == budget.category_id)
        
    current_spend = Decimal(str(query.scalar()))
    limit = Decimal(str(budget.amount))
    remaining = limit - current_spend
    pct = float((current_spend / limit) * 100) if limit > 0 else 0.0

    return BudgetResponse(
        id=budget.id,
        user_id=budget.user_id,
        category_id=budget.category_id,
        amount=limit,
        period=budget.period,
        created_at=budget.created_at,
        updated_at=budget.updated_at,
        current_spend=current_spend,
        remaining_budget=remaining,
        percentage_used=round(pct, 1),
        is_exceeded=current_spend > limit,
        is_warning=pct >= 80.0
    )

@router.get("", response_model=List[BudgetResponse])
def get_user_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    return [compute_budget_progress(b, db, current_user.id) for b in budgets]

@router.get("/summary", response_model=BudgetSummary)
def get_budget_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    overall = next((b for b in budgets if b.category_id is None), None)
    category_budgets = [b for b in budgets if b.category_id is not None]

    overall_res = compute_budget_progress(overall, db, current_user.id) if overall else None
    cat_res = [compute_budget_progress(b, db, current_user.id) for b in category_budgets]

    tot_limit = Decimal("0.00")
    tot_spend = Decimal("0.00")
    
    if overall_res:
        tot_limit = overall_res.amount
        tot_spend = overall_res.current_spend
    else:
        for c in cat_res:
            tot_limit += c.amount
            tot_spend += c.current_spend

    overall_pct = float((tot_spend / tot_limit) * 100) if tot_limit > 0 else 0.0

    return BudgetSummary(
        overall_budget=overall_res,
        category_budgets=cat_res,
        total_budget_limit=tot_limit,
        total_budget_spend=tot_spend,
        overall_percentage_used=round(overall_pct, 1)
    )

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if budget_in.category_id:
        cat = db.query(Category).filter(
            Category.id == budget_in.category_id,
            (Category.user_id == current_user.id) | (Category.is_system == True)
        ).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")

    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == budget_in.category_id
    ).first()

    if existing:
        existing.amount = budget_in.amount
        existing.period = budget_in.period
        db.commit()
        db.refresh(existing)
        return compute_budget_progress(existing, db, current_user.id)

    new_budget = Budget(
        user_id=current_user.id,
        category_id=budget_in.category_id,
        amount=budget_in.amount,
        period=budget_in.period
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return compute_budget_progress(new_budget, db, current_user.id)

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}

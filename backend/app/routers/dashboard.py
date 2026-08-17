import calendar
from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc

from app.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse, DashboardSummaryMetrics, CategoryBreakdownItem, MonthlyTrendItem, DailySafeSpendResponse
)
from app.models.account import Account
from app.schemas.transaction import TransactionResponse
from app.routers.deps import get_current_user
from app.utils.balance import calculate_total_balance

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/daily-safe-spend", response_model=DailySafeSpendResponse)
def get_daily_safe_spend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    remaining_days = max(1, (days_in_month - today.day) + 1)

    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    if not budget or budget.amount <= 0:
        return DailySafeSpendResponse(
            has_budget=False,
            daily_safe_spend=Decimal("0.00"),
            remaining_budget=Decimal("0.00"),
            month_total_budget=Decimal("0.00"),
            current_month_spent=Decimal("0.00"),
            remaining_days=remaining_days,
            is_budget_exceeded=False
        )

    month_start = today.replace(day=1)
    month_spent = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "EXPENSE",
        Transaction.transaction_date >= month_start,
        Transaction.transaction_date <= today
    ).scalar() or Decimal("0.00")

    month_spent_dec = Decimal(str(month_spent))
    monthly_limit_dec = Decimal(str(budget.amount))


    remaining_budget = monthly_limit_dec - month_spent_dec
    is_exceeded = remaining_budget <= 0

    if is_exceeded:
        safe_spend = Decimal("0.00")
        remaining_budget = Decimal("0.00")
    else:
        safe_spend = (remaining_budget / Decimal(str(remaining_days))).quantize(Decimal("0.01"))

    return DailySafeSpendResponse(
        has_budget=True,
        daily_safe_spend=safe_spend,
        remaining_budget=remaining_budget.quantize(Decimal("0.01")),
        month_total_budget=monthly_limit_dec,
        current_month_spent=month_spent_dec.quantize(Decimal("0.01")),
        remaining_days=remaining_days,
        is_budget_exceeded=is_exceeded
    )


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    timeframe: str = Query("month", pattern="^(today|week|month|year|all|custom)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    filter_start: Optional[date] = None
    filter_end: Optional[date] = None

    if timeframe == "today":
        filter_start = today
        filter_end = today
    elif timeframe == "week":
        filter_start = today - timedelta(days=today.weekday())
        filter_end = today
    elif timeframe == "month":
        filter_start = today.replace(day=1)
        filter_end = today
    elif timeframe == "year":
        filter_start = today.replace(month=1, day=1)
        filter_end = today
    elif timeframe == "custom":
        filter_start = start_date
        filter_end = end_date

    # Base query
    base_query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if filter_start:
        base_query = base_query.filter(Transaction.transaction_date >= filter_start)
    if filter_end:
        base_query = base_query.filter(Transaction.transaction_date <= filter_end)

    # Calculate Totals
    income_query = base_query.filter(Transaction.type == "INCOME")
    expense_query = base_query.filter(Transaction.type == "EXPENSE")

    total_income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "INCOME",
        Transaction.transaction_date >= filter_start if filter_start else True,
        Transaction.transaction_date <= filter_end if filter_end else True
    ).scalar() or Decimal("0.00")

    total_expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "EXPENSE",
        Transaction.transaction_date >= filter_start if filter_start else True,
        Transaction.transaction_date <= filter_end if filter_end else True
    ).scalar() or Decimal("0.00")

    total_income_dec = Decimal(str(total_income))
    total_expense_dec = Decimal(str(total_expense))

    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_archived == False,
    ).all()

    current_balance = calculate_total_balance(accounts, db)
    metrics = DashboardSummaryMetrics(
        current_balance=current_balance,
        total_income=total_income_dec,
        total_expense=total_expense_dec
    )

    # Category Breakdown (Expense percentage distribution)
    category_query = db.query(
        Transaction.category_id,
        Category.name,
        Category.icon,
        Category.color,
        func.sum(Transaction.amount).label("category_total")
    ).join(
        Category, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "EXPENSE"
    )

    if filter_start:
        category_query = category_query.filter(Transaction.transaction_date >= filter_start)
    if filter_end:
        category_query = category_query.filter(Transaction.transaction_date <= filter_end)

    category_results = category_query.group_by(
        Transaction.category_id, Category.name, Category.icon, Category.color
    ).order_by(desc("category_total")).all()

    category_breakdown = []
    for cat_id, cat_name, icon, color, cat_total in category_results:
        cat_total_dec = Decimal(str(cat_total))
        percentage = float((cat_total_dec / total_expense_dec * 100)) if total_expense_dec > 0 else 0.0
        category_breakdown.append(
            CategoryBreakdownItem(
                category_id=cat_id,
                category_name=cat_name,
                icon=icon or "tag",
                color=color or "#3b82f6",
                total=cat_total_dec,
                percentage=round(percentage, 1)
            )
        )

    # Monthly Trends (Last 6 Months)
    six_months_ago = today - timedelta(days=180)
    year_col = extract('year', Transaction.transaction_date)
    month_col = extract('month', Transaction.transaction_date)
    trend_rows = db.query(
        year_col.label('yr'),
        month_col.label('mo'),
        Transaction.type,
        func.sum(Transaction.amount).label('sum_amount')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= six_months_ago
    ).group_by(year_col, month_col, Transaction.type).all()

    monthly_dict = {}
    for yr, mo, t_type, sum_amt in trend_rows:
        month_key = f"{int(yr):04d}-{int(mo):02d}"
        if month_key not in monthly_dict:
            monthly_dict[month_key] = {"income": Decimal("0.00"), "expense": Decimal("0.00")}
        if t_type == "INCOME":
            monthly_dict[month_key]["income"] += Decimal(str(sum_amt))
        else:
            monthly_dict[month_key]["expense"] += Decimal(str(sum_amt))

    monthly_trends = [
        MonthlyTrendItem(
            month=m_key,
            income=data["income"],
            expense=data["expense"]
        ) for m_key, data in sorted(monthly_dict.items())
    ]

    # Recent 5 Transactions
    recent_txs = db.query(Transaction, Category).join(
        Category, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user.id
    ).order_by(
        desc(Transaction.transaction_date), desc(Transaction.created_at)
    ).limit(5).all()

    recent_responses = [
        TransactionResponse(
            id=tx.id,
            user_id=tx.user_id,
            category_id=tx.category_id,
            account_id=tx.account_id,
            category_name=cat.name,
            category_icon=cat.icon,
            category_color=cat.color,
            type=tx.type,
            amount=tx.amount,
            transaction_date=tx.transaction_date,
            payment_method=tx.payment_method,
            note=tx.note,
            created_at=tx.created_at
        ) for tx, cat in recent_txs
    ]

    return DashboardSummaryResponse(
        summary=metrics,
        category_breakdown=category_breakdown,
        monthly_trends=monthly_trends,
        recent_transactions=recent_responses
    )

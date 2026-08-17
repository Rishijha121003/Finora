from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.schemas.account import (
    AccountCreate,
    AccountResponse,
    AccountSummaryResponse,
)

from app.database import get_db
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.account import AccountCreate, AccountResponse
from app.models.transfer import Transfer
from app.utils.balance import calculate_account_balance


router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("", response_model=list[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accounts = (
        db.query(Account)
        .filter(
            Account.user_id == current_user.id,
            Account.is_archived == False,
        )
        .order_by(Account.created_at.asc())
        .all()
    )

    result = []

    for account in accounts:
        balance = calculate_account_balance(account, db)

        result.append({
            "id": account.id,
            "user_id": account.user_id,
            "name": account.name,
            "account_type": account.account_type,
            "opening_balance": account.opening_balance,
            "current_balance": balance,
            "is_archived": account.is_archived,
            "created_at": account.created_at,
            "updated_at": account.updated_at,
        })

    return result


@router.post(
    "",
    response_model=AccountResponse,
    status_code=201,
)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = Account(
        user_id=current_user.id,
        name=account_in.name.strip(),
        account_type=account_in.account_type.upper(),
        opening_balance=account_in.opening_balance,
        is_archived=False,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return {
        "id": account.id,
        "user_id": account.user_id,
        "name": account.name,
        "account_type": account.account_type,
        "opening_balance": account.opening_balance,
        "current_balance": calculate_account_balance(account, db),
        "is_archived": account.is_archived,
        "created_at": account.created_at,
        "updated_at": account.updated_at,
    }

@router.get(
    "/summary",
    response_model=list[AccountSummaryResponse],
)
def get_account_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accounts = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_archived == False,
    ).all()

    result = []

    for account in accounts:
        income = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.account_id == account.id,
            Transaction.type == "INCOME",
        ).scalar() or 0

        expense = db.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.account_id == account.id,
            Transaction.type == "EXPENSE",
        ).scalar() or 0

        result.append({
            "account_id": account.id,
            "account_name": account.name,
            "account_type": account.account_type,
            "income": Decimal(str(income)),
            "expense": Decimal(str(expense)),
            "current_balance": calculate_account_balance(account, db),
        })

    return result
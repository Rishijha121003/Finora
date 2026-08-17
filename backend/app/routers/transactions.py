import uuid
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from typing import Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from math import ceil

from app.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    PaginationMeta,
)
from app.routers.deps import get_current_user


router = APIRouter(prefix="/transactions", tags=["Transactions"])


def get_owned_active_account(
    account_id: str,
    db: Session,
    user_id: str,
) -> Account:
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user_id,
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or unauthorized.",
        )

    if account.is_archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archived accounts cannot be used for transactions.",
        )

    return account


@router.get("/export")
def export_transactions_csv(
    range_type: str = Query("all", pattern="^(all|month|custom)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction, Category, Account).join(
    Category,
    Transaction.category_id == Category.id,
    ).join(
    Account,
    Transaction.account_id == Account.id,
     ).filter(
    Transaction.user_id == current_user.id
    )

    if range_type == "month":
        today = date.today()
        first_day = today.replace(day=1)

        query = query.filter(
            Transaction.transaction_date >= first_day,
            Transaction.transaction_date <= today,
        )

    elif range_type == "custom":
        if start_date:
            query = query.filter(
                Transaction.transaction_date >= start_date
            )

        if end_date:
            query = query.filter(
                Transaction.transaction_date <= end_date
            )

    results = query.order_by(
        desc(Transaction.transaction_date)
    ).all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    writer.writerow([
        "Date",
        "Type",
        "Category",
        "Amount",
        "Currency",
        "Payment Method",
        "Note",
        "Created At",
    ])

    for tx, cat,account in results:
        writer.writerow([
            tx.transaction_date.strftime("%Y-%m-%d")
            if tx.transaction_date else "",
            tx.type,
            cat.name if cat else "Uncategorized",
            f"{tx.amount:.2f}",
            current_user.currency_code,
            tx.payment_method,
            tx.note or "",
            tx.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if tx.created_at else "",
        ])

    csv_data = output.getvalue()
    output.close()

    filename = (
        f"finora_transactions_"
        f"{date.today().strftime('%Y%m%d')}.csv"
    )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            f'attachment; filename="{filename}"'
        },
    )


@router.get("", response_model=TransactionListResponse)
def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    type: Optional[str] = Query(
        None,
        pattern="^(INCOME|EXPENSE)$",
    ),
    category_id: Optional[str] = None,

    # V2 account filter
    account_id: Optional[str] = None,

    payment_method: Optional[str] = Query(
        None,
        pattern="^(CASH|UPI|CARD|BANK_TRANSFER|OTHER)$",
    ),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("transaction_date"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction, Category, Account).join(
    Category,
    Transaction.category_id == Category.id,
    ).join(
    Account,
    Transaction.account_id == Account.id,
    ).filter(
    Transaction.user_id == current_user.id
    )

    if start_date:
        query = query.filter(
            Transaction.transaction_date >= start_date
        )

    if end_date:
        query = query.filter(
            Transaction.transaction_date <= end_date
        )

    if type:
        query = query.filter(
            Transaction.type == type.upper()
        )

    if category_id:
        query = query.filter(
            Transaction.category_id == category_id
        )

    if account_id:
        query = query.filter(
            Transaction.account_id == account_id
        )

    if payment_method:
        query = query.filter(
            Transaction.payment_method == payment_method.upper()
        )

    if search and search.strip():
        search_clean = search.strip()

        escaped_search = (
            search_clean
            .replace("/", "//")
            .replace("%", "/%")
            .replace("_", "/_")
        )

        search_pattern = f"%{escaped_search}%"

        query = query.filter(
            or_(
                Transaction.note.ilike(
                    search_pattern,
                    escape="/",
                ),
                Category.name.ilike(
                    search_pattern,
                    escape="/",
                ),
            )
        )

    total = query.count()

    if sort_by == "amount":
        sort_col = Transaction.amount
    elif sort_by == "created_at":
        sort_col = Transaction.created_at
    else:
        sort_col = Transaction.transaction_date

    if order.lower() == "asc":
        query = query.order_by(
            asc(sort_col),
            asc(Transaction.created_at),
        )
    else:
        query = query.order_by(
            desc(sort_col),
            desc(Transaction.created_at),
        )

    offset = (page - 1) * limit

    results = query.offset(offset).limit(limit).all()

    tx_responses = []

    for tx, cat,account in results:
        tx_responses.append(
            TransactionResponse(
                id=tx.id,
                user_id=tx.user_id,
                category_id=tx.category_id,
                account_id=tx.account_id,
                account_name=account.name,
                category_name=cat.name if cat else None,
                category_icon=cat.icon if cat else None,
                category_color=cat.color if cat else None,
                type=tx.type,
                amount=tx.amount,
                transaction_date=tx.transaction_date,
                payment_method=tx.payment_method,
                note=tx.note,
                created_at=tx.created_at,
            )
        )

    total_pages = ceil(total / limit) if limit > 0 else 1

    return TransactionListResponse(
        transactions=tx_responses,
        pagination=PaginationMeta(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        ),
    )


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(
        Category.id == tx_in.category_id,
        or_(
            Category.user_id == current_user.id,
            Category.is_system == True,
        ),
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail=(
                "Selected category does not exist "
                "or unauthorized."
            ),
        )

    # V2: account must belong to current user
    get_owned_active_account(
        tx_in.account_id,
        db,
        current_user.id,
    )

    transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        category_id=tx_in.category_id,
        account_id=tx_in.account_id,
        type=tx_in.type.upper(),
        amount=tx_in.amount,
        transaction_date=tx_in.transaction_date,
        payment_method=tx_in.payment_method.upper(),
        note=tx_in.note.strip() if tx_in.note else None,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return TransactionResponse(
        id=transaction.id,
        user_id=transaction.user_id,
        category_id=transaction.category_id,
        account_id=transaction.account_id,
        category_name=category.name,
        category_icon=category.icon,
        category_color=category.color,
        type=transaction.type,
        amount=transaction.amount,
        transaction_date=transaction.transaction_date,
        payment_method=transaction.payment_method,
        note=transaction.note,
        created_at=transaction.created_at,
    )


@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: str,
    tx_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id,
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found or unauthorized.",
        )

    if tx_in.category_id is not None:
        category = db.query(Category).filter(
            Category.id == tx_in.category_id,
            or_(
                Category.user_id == current_user.id,
                Category.is_system == True,
            ),
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Selected category does not exist "
                    "or unauthorized."
                ),
            )

        transaction.category_id = tx_in.category_id

    # V2: transaction can only move to user's active account
    if tx_in.account_id is not None:
        get_owned_active_account(
            tx_in.account_id,
            db,
            current_user.id,
        )

        transaction.account_id = tx_in.account_id

    if tx_in.amount is not None:
        transaction.amount = tx_in.amount

    if tx_in.type is not None:
        transaction.type = tx_in.type.upper()

    if tx_in.transaction_date is not None:
        transaction.transaction_date = tx_in.transaction_date

    if tx_in.payment_method is not None:
        transaction.payment_method = (
            tx_in.payment_method.upper()
        )

    if tx_in.note is not None:
        transaction.note = (
            tx_in.note.strip()
            if tx_in.note
            else None
        )

    db.commit()
    db.refresh(transaction)

    cat = db.query(Category).filter(
        Category.id == transaction.category_id
    ).first()

    return TransactionResponse(
        id=transaction.id,
        user_id=transaction.user_id,
        category_id=transaction.category_id,
        account_id=transaction.account_id,
        category_name=cat.name if cat else None,
        category_icon=cat.icon if cat else None,
        category_color=cat.color if cat else None,
        type=transaction.type,
        amount=transaction.amount,
        transaction_date=transaction.transaction_date,
        payment_method=transaction.payment_method,
        note=transaction.note,
        created_at=transaction.created_at,
    )


@router.delete(
    "/{tx_id}",
    status_code=status.HTTP_200_OK,
)
def delete_transaction(
    tx_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id,
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found or unauthorized.",
        )

    db.delete(transaction)
    db.commit()

    return {
        "message": "Transaction deleted successfully."
    }
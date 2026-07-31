from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.transfer import Transfer
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.transfer import TransferCreate, TransferResponse


router = APIRouter(prefix="/transfers", tags=["Transfers"])


def calculate_balance(account: Account, db: Session) -> Decimal:
    income = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.account_id == account.id,
        Transaction.type == "INCOME",
    ).scalar()

    expense = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.account_id == account.id,
        Transaction.type == "EXPENSE",
    ).scalar()

    incoming = db.query(
        func.coalesce(func.sum(Transfer.amount), 0)
    ).filter(
        Transfer.to_account_id == account.id
    ).scalar()

    outgoing = db.query(
        func.coalesce(func.sum(Transfer.amount), 0)
    ).filter(
        Transfer.from_account_id == account.id
    ).scalar()

    return (
        Decimal(str(account.opening_balance))
        + Decimal(str(income))
        - Decimal(str(expense))
        + Decimal(str(incoming))
        - Decimal(str(outgoing))
    )


@router.get("", response_model=list[TransferResponse])
def get_transfers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transfers = (
        db.query(Transfer)
        .filter(Transfer.user_id == current_user.id)
        .order_by(
            Transfer.transfer_date.desc(),
            Transfer.created_at.desc(),
        )
        .all()
    )

    result = []

    for transfer in transfers:
        result.append(
            TransferResponse(
                id=transfer.id,
                user_id=transfer.user_id,
                from_account_id=transfer.from_account_id,
                from_account_name=transfer.from_account.name,
                to_account_id=transfer.to_account_id,
                to_account_name=transfer.to_account.name,
                amount=transfer.amount,
                transfer_date=transfer.transfer_date,
                note=transfer.note,
                created_at=transfer.created_at,
            )
        )

    return result


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if transfer_in.from_account_id == transfer_in.to_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination accounts must be different.",
        )

    from_account = db.query(Account).filter(
        Account.id == transfer_in.from_account_id,
        Account.user_id == current_user.id,
    ).first()

    to_account = db.query(Account).filter(
        Account.id == transfer_in.to_account_id,
        Account.user_id == current_user.id,
    ).first()

    if not from_account or not to_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found or unauthorized.",
        )

    if from_account.is_archived or to_account.is_archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archived accounts cannot be used for transfers.",
        )

    current_balance = calculate_balance(from_account, db)

    if transfer_in.amount > current_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient account balance.",
        )

    transfer = Transfer(
        user_id=current_user.id,
        from_account_id=from_account.id,
        to_account_id=to_account.id,
        amount=transfer_in.amount,
        transfer_date=transfer_in.transfer_date,
        note=transfer_in.note.strip() if transfer_in.note else None,
    )

    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    return TransferResponse(
        id=transfer.id,
        user_id=transfer.user_id,
        from_account_id=from_account.id,
        from_account_name=from_account.name,
        to_account_id=to_account.id,
        to_account_name=to_account.name,
        amount=transfer.amount,
        transfer_date=transfer.transfer_date,
        note=transfer.note,
        created_at=transfer.created_at,
    )


@router.delete("/{transfer_id}")
def delete_transfer(
    transfer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transfer = db.query(Transfer).filter(
        Transfer.id == transfer_id,
        Transfer.user_id == current_user.id,
    ).first()

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found.",
        )

    db.delete(transfer)
    db.commit()

    return {"message": "Transfer deleted successfully."}
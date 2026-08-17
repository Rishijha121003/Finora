"""
Shared account balance calculation utility.

This is the SINGLE canonical source of truth for computing an account's
balance. Every part of the backend that needs a balance (dashboard summary,
accounts list/summary, Finora Pulse) must call into this module instead of
re-implementing the formula, so all surfaces stay consistent.

Formula:
    balance = opening_balance + income - expense + transfers_in - transfers_out

`as_of_date`, when provided, restricts transactions/transfers to that date
(inclusive), enabling point-in-time balance snapshots (e.g. Finora Pulse's
monthly balance trend) using the exact same formula as the live balance.
"""
from decimal import Decimal
from datetime import date
from typing import Iterable, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.transaction import Transaction
from app.models.transfer import Transfer


def calculate_account_balance(
    account: Account,
    db: Session,
    as_of_date: Optional[date] = None,
) -> Decimal:
    """
    Calculate the balance of a single account.

    Includes all INCOME/EXPENSE transactions on the account plus all
    inter-account Transfers into/out of the account, on top of the
    account's opening_balance.

    :param account: The Account to calculate the balance for.
    :param db: Active SQLAlchemy session.
    :param as_of_date: If given, only include transactions/transfers dated
        on or before this date (inclusive). Omit for the current balance.
    """
    income_query = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.account_id == account.id,
        Transaction.type == "INCOME",
    )
    expense_query = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.account_id == account.id,
        Transaction.type == "EXPENSE",
    )
    incoming_transfers_query = db.query(
        func.coalesce(func.sum(Transfer.amount), 0)
    ).filter(
        Transfer.to_account_id == account.id
    )
    outgoing_transfers_query = db.query(
        func.coalesce(func.sum(Transfer.amount), 0)
    ).filter(
        Transfer.from_account_id == account.id
    )

    if as_of_date is not None:
        income_query = income_query.filter(Transaction.transaction_date <= as_of_date)
        expense_query = expense_query.filter(Transaction.transaction_date <= as_of_date)
        incoming_transfers_query = incoming_transfers_query.filter(
            Transfer.transfer_date <= as_of_date
        )
        outgoing_transfers_query = outgoing_transfers_query.filter(
            Transfer.transfer_date <= as_of_date
        )

    income = income_query.scalar() or 0
    expense = expense_query.scalar() or 0
    incoming_transfers = incoming_transfers_query.scalar() or 0
    outgoing_transfers = outgoing_transfers_query.scalar() or 0

    return (
        Decimal(str(account.opening_balance))
        + Decimal(str(income))
        - Decimal(str(expense))
        + Decimal(str(incoming_transfers))
        - Decimal(str(outgoing_transfers))
    )


def calculate_total_balance(
    accounts: Iterable[Account],
    db: Session,
    as_of_date: Optional[date] = None,
) -> Decimal:
    """
    Sum calculate_account_balance() across a collection of accounts.

    Used wherever a combined/total balance across ALL of a user's accounts
    is needed (dashboard summary, Pulse balance stability).
    """
    total = Decimal("0.00")
    for account in accounts:
        total += calculate_account_balance(account, db, as_of_date=as_of_date)
    return total

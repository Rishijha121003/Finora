"""link transactions to accounts

Revision ID: fa674c576e73
Revises: 8431946a9c55
Create Date: 2026-07-24 07:30:01.924890
"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


revision: str = "fa674c576e73"
down_revision: Union[str, Sequence[str], None] = "8431946a9c55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    op.create_table(
        "transfers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("from_account_id", sa.String(length=36), nullable=False),
        sa.Column("to_account_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("transfer_date", sa.Date(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["from_account_id"],
            ["accounts.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["to_account_id"],
            ["accounts.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_transfers_user_id"),
        "transfers",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_transfers_from_account_id"),
        "transfers",
        ["from_account_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_transfers_to_account_id"),
        "transfers",
        ["to_account_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_transfers_transfer_date"),
        "transfers",
        ["transfer_date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_transfers_transfer_date"),
        table_name="transfers",
    )
    op.drop_index(
        op.f("ix_transfers_to_account_id"),
        table_name="transfers",
    )
    op.drop_index(
        op.f("ix_transfers_from_account_id"),
        table_name="transfers",
    )
    op.drop_index(
        op.f("ix_transfers_user_id"),
        table_name="transfers",
    )
    op.drop_table("transfers")
"""Add favorite_transactions table

Revision ID: 3d9281a10599
Revises: 2c89f5a11048
Create Date: 2026-07-19 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '3d9281a10599'
down_revision: Union[str, Sequence[str], None] = '2c89f5a11048'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'favorite_transactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('type', sa.String(length=10), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('payment_method', sa.String(length=20), server_default='UPI', nullable=False),
        sa.Column('note', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_favorite_transactions_user_id'), 'favorite_transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_favorite_transactions_category_id'), 'favorite_transactions', ['category_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_favorite_transactions_category_id'), table_name='favorite_transactions')
    op.drop_index(op.f('ix_favorite_transactions_user_id'), table_name='favorite_transactions')
    op.drop_table('favorite_transactions')

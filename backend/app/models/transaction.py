import uuid
from sqlalchemy import Column, String, Date, Numeric, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    type = Column(String(10), nullable=False, index=True)  # 'INCOME' or 'EXPENSE'
    amount = Column(Numeric(precision=12, scale=2), nullable=False)  # Decimal precision NUMERIC(12, 2)
    transaction_date = Column(Date, nullable=False, index=True)
    payment_method = Column(String(20), nullable=False, default="CASH")  # CASH, UPI, CARD, BANK_TRANSFER, OTHER
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    account_id = Column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")

import uuid

from sqlalchemy import Column, String, Numeric, Date, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    from_account_id = Column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    to_account_id = Column(
        String(36),
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
    )

    transfer_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    note = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship("User")

    from_account = relationship(
        "Account",
        foreign_keys=[from_account_id],
    )

    to_account = relationship(
        "Account",
        foreign_keys=[to_account_id],
    )
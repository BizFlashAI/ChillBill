import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    category: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # home | personal | subscriptions
    bill_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # e.g. internet, rent, streaming
    provider: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # e.g. Comcast, Netflix
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    billing_date: Mapped[date] = mapped_column(Date, nullable=False)
    frequency: Mapped[str] = mapped_column(
        String(20), default="monthly"
    )  # once | weekly | monthly | yearly
    is_agent_allowed: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    reminders: Mapped[list["Reminder"]] = relationship(
        back_populates="bill", cascade="all, delete-orphan"
    )
    insights: Mapped[list["AgentInsight"]] = relationship(
        back_populates="bill", cascade="all, delete-orphan"
    )


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    bill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("bills.id", ondelete="CASCADE"), nullable=False
    )
    days_before: Mapped[int] = mapped_column(nullable=False)
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    last_triggered: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    bill: Mapped["Bill"] = relationship(back_populates="reminders")


class AgentInsight(Base):
    __tablename__ = "agent_insights"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    bill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("bills.id", ondelete="CASCADE"), nullable=False
    )
    potential_savings: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    finding_details: Mapped[str] = mapped_column(Text, nullable=False)
    action_script: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="active"
    )  # active | applied | dismissed

    bill: Mapped["Bill"] = relationship(back_populates="insights")

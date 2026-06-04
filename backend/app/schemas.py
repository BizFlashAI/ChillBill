from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class CategoryEnum(str, Enum):
    home = "home"
    personal = "personal"
    subscriptions = "subscriptions"


class FrequencyEnum(str, Enum):
    once = "once"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class InsightStatusEnum(str, Enum):
    active = "active"
    applied = "applied"
    dismissed = "dismissed"


# --- Bill Schemas ---


class BillCreate(BaseModel):
    category: CategoryEnum
    bill_type: str = Field(..., min_length=1, max_length=50)
    provider: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    billing_date: date
    frequency: FrequencyEnum = FrequencyEnum.monthly
    is_agent_allowed: bool = True


class BillUpdate(BaseModel):
    category: CategoryEnum | None = None
    bill_type: str | None = Field(None, min_length=1, max_length=50)
    provider: str | None = Field(None, min_length=1, max_length=100)
    amount: float | None = Field(None, gt=0)
    billing_date: date | None = None
    frequency: FrequencyEnum | None = None
    is_agent_allowed: bool | None = None


class BillResponse(BaseModel):
    id: str
    category: str
    bill_type: str
    provider: str
    amount: float
    billing_date: date
    frequency: str
    is_agent_allowed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Reminder Schemas ---


class ReminderCreate(BaseModel):
    bill_id: str
    days_before: int = Field(..., gt=0)


class ReminderResponse(BaseModel):
    id: str
    bill_id: str
    days_before: int
    is_sent: bool
    last_triggered: datetime | None

    model_config = {"from_attributes": True}


# --- Insight Schemas ---


class InsightResponse(BaseModel):
    id: str
    bill_id: str
    potential_savings: float
    finding_details: str
    action_script: str | None
    status: str

    model_config = {"from_attributes": True}


class InsightStatusUpdate(BaseModel):
    status: InsightStatusEnum

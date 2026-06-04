from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bill, Reminder
from app.schemas import ReminderCreate, ReminderResponse

router = APIRouter(prefix="/api/v1/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderResponse])
def get_reminders(bill_id: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Reminder)
    if bill_id:
        query = query.filter(Reminder.bill_id == bill_id)
    return query.all()


@router.post("", response_model=ReminderResponse, status_code=201)
def create_reminder(data: ReminderCreate, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == data.bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    reminder = Reminder(**data.model_dump())
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: str, db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()

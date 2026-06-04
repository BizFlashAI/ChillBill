from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bill
from app.schemas import BillCreate, BillResponse, BillUpdate, CategoryEnum

router = APIRouter(prefix="/api/v1/bills", tags=["bills"])


@router.get("", response_model=list[BillResponse])
def get_bills(category: CategoryEnum | None = None, db: Session = Depends(get_db)):
    query = db.query(Bill)
    if category:
        query = query.filter(Bill.category == category.value)
    return query.order_by(Bill.billing_date).all()


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.post("", response_model=BillResponse, status_code=201)
def create_bill(bill_data: BillCreate, db: Session = Depends(get_db)):
    bill = Bill(**bill_data.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: str, bill_data: BillUpdate, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    update_fields = bill_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        if isinstance(value, CategoryEnum):
            value = value.value
        setattr(bill, field, value)

    db.commit()
    db.refresh(bill)
    return bill


@router.delete("/{bill_id}", status_code=204)
def delete_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()

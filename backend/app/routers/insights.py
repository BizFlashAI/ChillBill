from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AgentInsight
from app.schemas import InsightResponse, InsightStatusUpdate

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


@router.get("", response_model=list[InsightResponse])
def get_insights(status: str | None = "active", db: Session = Depends(get_db)):
    query = db.query(AgentInsight)
    if status:
        query = query.filter(AgentInsight.status == status)
    return query.all()


@router.patch("/{insight_id}", response_model=InsightResponse)
def update_insight_status(
    insight_id: str, data: InsightStatusUpdate, db: Session = Depends(get_db)
):
    insight = db.query(AgentInsight).filter(AgentInsight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")

    insight.status = data.status.value
    db.commit()
    db.refresh(insight)
    return insight

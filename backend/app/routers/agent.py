import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AgentInsight, Bill

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


class AgentRunResponse(BaseModel):
    status: str
    message: str
    bill_id: str


class AgentRunResult(BaseModel):
    status: str
    bill_id: str
    has_savings: bool
    potential_savings: float
    finding_details: str
    action_script: str | None
    insight_id: str | None


def _run_agent_task(bill_id: str) -> None:
    """Background task that runs the optimization agent for a bill."""
    from app.database import SessionLocal
    from app.agent.engine import run_optimization_agent

    db = SessionLocal()
    try:
        bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if not bill:
            logger.error("Bill %s not found for agent run", bill_id)
            return

        logger.info(
            "Running optimization agent for bill %s (%s - %s)",
            bill_id,
            bill.provider,
            bill.bill_type,
        )

        result = run_optimization_agent(
            provider=bill.provider,
            bill_type=bill.bill_type,
            amount=float(bill.amount),
            category=bill.category,
            frequency=bill.frequency,
        )

        if result["has_savings"] and result["potential_savings"] > 0:
            insight = AgentInsight(
                bill_id=bill_id,
                potential_savings=result["potential_savings"],
                finding_details=result["finding_details"],
                action_script=result.get("action_script"),
                status="active",
            )
            db.add(insight)
            db.commit()
            logger.info(
                "Saved insight for bill %s: $%.2f/yr savings",
                bill_id,
                result["potential_savings"],
            )
        else:
            logger.info("No savings found for bill %s", bill_id)

    except Exception:
        logger.exception("Agent run failed for bill %s", bill_id)
    finally:
        db.close()


@router.post("/run/{bill_id}", response_model=AgentRunResponse)
def trigger_agent_run(
    bill_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Manually trigger the optimization agent for a specific bill."""
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if not bill.is_agent_allowed:
        raise HTTPException(
            status_code=403,
            detail="Agent optimization is disabled for this bill",
        )

    background_tasks.add_task(_run_agent_task, bill_id)

    return AgentRunResponse(
        status="accepted",
        message=f"Optimization agent started for {bill.provider} ({bill.bill_type})",
        bill_id=bill_id,
    )


@router.post("/run-sync/{bill_id}", response_model=AgentRunResult)
def trigger_agent_run_sync(
    bill_id: str,
    db: Session = Depends(get_db),
):
    """Run the optimization agent synchronously (for testing/demo)."""
    from app.agent.engine import run_optimization_agent

    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if not bill.is_agent_allowed:
        raise HTTPException(
            status_code=403,
            detail="Agent optimization is disabled for this bill",
        )

    result = run_optimization_agent(
        provider=bill.provider,
        bill_type=bill.bill_type,
        amount=float(bill.amount),
        category=bill.category,
        frequency=bill.frequency,
    )

    insight_id = None
    if result["has_savings"] and result["potential_savings"] > 0:
        insight = AgentInsight(
            bill_id=bill_id,
            potential_savings=result["potential_savings"],
            finding_details=result["finding_details"],
            action_script=result.get("action_script"),
            status="active",
        )
        db.add(insight)
        db.commit()
        db.refresh(insight)
        insight_id = insight.id

    return AgentRunResult(
        status="completed",
        bill_id=bill_id,
        has_savings=result["has_savings"],
        potential_savings=result["potential_savings"],
        finding_details=result["finding_details"],
        action_script=result.get("action_script"),
        insight_id=insight_id,
    )

import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def summary(db: Session = Depends(get_db)):
    bugs = db.query(models.Bug).all()
    total = len(bugs)
    open_count = sum(1 for b in bugs if b.status in (models.Status.open, models.Status.in_progress))
    resolved = [b for b in bugs if b.resolved_at is not None]

    avg_hours = None
    if resolved:
        total_hours = sum(
            (b.resolved_at - b.created_at).total_seconds() / 3600 for b in resolved
        )
        avg_hours = round(total_hours / len(resolved), 2)

    by_severity = {}
    by_team = {}
    by_status = {}
    for b in bugs:
        by_severity[b.predicted_severity.value] = by_severity.get(b.predicted_severity.value, 0) + 1
        by_team[b.predicted_team.value] = by_team.get(b.predicted_team.value, 0) + 1
        by_status[b.status.value] = by_status.get(b.status.value, 0) + 1

    return schemas.AnalyticsSummary(
        total_bugs=total,
        open_bugs=open_count,
        resolved_bugs=len(resolved),
        avg_resolution_hours=avg_hours,
        by_severity=by_severity,
        by_team=by_team,
        by_status=by_status,
    )


@router.get("/trend")
def resolution_trend(db: Session = Depends(get_db)):
    """Bugs created per day for the last 30 days — feeds the frontend
    trend chart. This is the ETL/analytics dashboard deliverable for
    Phase 4 of the delivery framework."""
    since = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    rows = (
        db.query(
            func.date(models.Bug.created_at).label("day"),
            func.count(models.Bug.id).label("count"),
        )
        .filter(models.Bug.created_at >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [{"day": str(r.day), "count": r.count} for r in rows]

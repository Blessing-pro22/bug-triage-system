import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from .. import models, schemas
from ..ml import classifier

router = APIRouter(prefix="/api/bugs", tags=["bugs"])


@router.post("", response_model=schemas.BugOut, status_code=201)
def submit_bug(payload: schemas.BugCreate, db: Session = Depends(get_db)):
    """Submit a new bug report. Runs it through the triage classifier
    immediately so the response already includes the predicted
    severity and owning team."""
    prediction = classifier.predict(payload.title, payload.description)

    bug = models.Bug(
        title=payload.title,
        description=payload.description,
        reporter=payload.reporter,
        predicted_severity=prediction["severity"],
        predicted_team=prediction["team"],
        severity_confidence=prediction["severity_confidence"],
        team_confidence=prediction["team_confidence"],
    )
    db.add(bug)
    db.commit()
    db.refresh(bug)
    return bug


@router.get("", response_model=list[schemas.BugOut])
def list_bugs(
    status: str | None = None,
    team: str | None = None,
    severity: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Bug)
    if status:
        query = query.filter(models.Bug.status == status)
    if team:
        query = query.filter(models.Bug.predicted_team == team)
    if severity:
        query = query.filter(models.Bug.predicted_severity == severity)
    return query.order_by(desc(models.Bug.created_at)).all()


@router.get("/{bug_id}", response_model=schemas.BugOut)
def get_bug(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    return bug


@router.patch("/{bug_id}", response_model=schemas.BugOut)
def update_bug(bug_id: int, payload: schemas.BugUpdate, db: Session = Depends(get_db)):
    """Update triage status, or override the auto-assigned severity/team.
    Overrides are how the system improves: disagreements are the
    signal that the model needs retraining on more representative data."""
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    if payload.status is not None:
        bug.status = payload.status
        if payload.status in (models.Status.resolved, models.Status.closed) and not bug.resolved_at:
            bug.resolved_at = datetime.datetime.utcnow()
    if payload.final_severity is not None:
        bug.final_severity = payload.final_severity
    if payload.final_team is not None:
        bug.final_team = payload.final_team

    db.commit()
    db.refresh(bug)
    return bug


@router.delete("/{bug_id}", status_code=204)
def delete_bug(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    db.delete(bug)
    db.commit()

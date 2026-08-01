import datetime
from typing import List
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

router = APIRouter(prefix="/api/bugs", tags=["Bugs"])

@router.get("", response_model=List[schemas.BugOut]) 
# Handles GET /api/bugs
def get_bugs(db: Session = Depends(get_db)):
    return db.query(models.Bug).order_by(models.Bug.created_at.desc()).all()

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

@router.post("", response_model=schemas.BugOut, status_code=status.HTTP_211_CREATED if hasattr(status, 'HTTP_211_CREATED') else 201)
@router.post("", response_model=schemas.BugOut, status_code=status.HTTP_201_CREATED)
def create_bug(bug_in: schemas.BugCreate, db: Session = Depends(get_db)):
    severity_pred, severity_conf = ml.predict_severity(bug_in.title, bug_in.description)
    team_pred, team_conf = ml.predict_team(bug_in.title, bug_in.description)

    db_bug = models.Bug(
        title=bug_in.title,
        description=bug_in.description,
        reporter=bug_in.reporter,
        predicted_severity=severity_pred,
        predicted_team=team_pred,
        severity_confidence=severity_conf,
        team_confidence=team_conf,
        status="new"
    )

    db.add(db_bug)
    db.commit()
    db.refresh(db_bug)

    return db_bug


@router.post("/{bug_id}/feedback", response_model=schemas.FeedbackOut)
def submit_feedback(bug_id: int, payload: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    if payload.corrected_severity:
        bug.final_severity = payload.corrected_severity
    if payload.corrected_team:
        bug.final_team = payload.corrected_team
    
    db.commit()
    db.refresh(bug)
    
    return {
        "id": bug_id,  
        "bug_id": bug_id,
        "original_severity": bug.predicted_severity.value,
        "original_team": bug.predicted_team.value,
        "corrected_severity": bug.final_severity.value if bug.final_severity else None,
        "corrected_team": bug.final_team.value if bug.final_team else None,
        "created_at": bug.created_at.isoformat(),
    }


@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db)):
    try:
        recent_bugs = (
            db.query(models.Bug)
            .order_by(models.Bug.created_at.desc())
            .limit(10)
            .all()
        )
        return recent_bugs
    except Exception as e:
        print(f"Error fetching activity feed: {e}")
        return []
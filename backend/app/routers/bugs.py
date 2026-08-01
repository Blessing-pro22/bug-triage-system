from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from .. import ml  # <--- FIX 1: Imports the ML module properly

router = APIRouter(prefix="/api/bugs", tags=["Bugs"])


@router.get("", response_model=List[schemas.BugOut])
def list_bugs(
    status: Optional[str] = None,
    team: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Bug)
    if status:
        query = query.filter(models.Bug.status == status.lower())
    if team:
        query = query.filter((models.Bug.final_team == team.lower()) | (models.Bug.predicted_team == team.lower()))
    if severity:
        query = query.filter((models.Bug.final_severity == severity.lower()) | (models.Bug.predicted_severity == severity.lower()))
    return query.order_by(models.Bug.created_at.desc()).all()


@router.post("", response_model=schemas.BugOut, status_code=status.HTTP_201_CREATED)
def create_bug(bug_in: schemas.BugCreate, db: Session = Depends(get_db)):
    try:
        # Run ML Predictions
        try:
            severity_pred, severity_conf = ml.predict_severity(bug_in.title, bug_in.description)
        except Exception as e:
            print(f"ML Severity prediction failed: {e}")
            severity_pred, severity_conf = "major", 0.50

        try:
            team_pred, team_conf = ml.predict_team(bug_in.title, bug_in.description)
        except Exception as e:
            print(f"ML Team prediction failed: {e}")
            team_pred, team_conf = "backend", 0.50

        db_bug = models.Bug(
            title=bug_in.title,
            description=bug_in.description,
            reporter=getattr(bug_in, "reporter", "Anonymous") or "Anonymous",
            predicted_severity=str(severity_pred).lower(),
            predicted_team=str(team_pred).lower(),
            severity_confidence=float(severity_conf or 0.5),
            team_confidence=float(team_conf or 0.5),
            status="new"
        )

        db.add(db_bug)
        db.commit()
        db.refresh(db_bug)

        return db_bug

    except Exception as err:
        db.rollback()
        print(f"CRITICAL ERROR IN POST /api/bugs: {err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create bug: {str(err)}"
        )


@router.get("/{bug_id}/similar")
def find_similar_bugs(bug_id: int, db: Session = Depends(get_db)):
    """Find similar historical bugs for a given bug ID."""
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    # Get historical bugs (excluding current bug)
    historical_bugs = db.query(models.Bug).filter(models.Bug.id != bug_id).order_by(models.Bug.created_at.desc()).limit(50).all()
    
    # Convert to dict format for similarity search
    historical_bugs_dict = [
        {
            'id': b.id,
            'title': b.title,
            'description': b.description,
            'predicted_severity': b.predicted_severity,
            'predicted_team': b.predicted_team,
            'status': b.status
        }
        for b in historical_bugs
    ]
    
    # Find similar bugs
    similar_bugs = ml.find_similar_bugs(bug.title, bug.description, historical_bugs_dict, top_k=5)
    
    # Format response
    return {
        'current_bug': {
            'id': bug.id,
            'title': bug.title,
            'predicted_severity': bug.predicted_severity,
            'predicted_team': bug.predicted_team
        },
        'similar_bugs': [
            {
                'bug': bug_dict,
                'similarity_score': round(score * 100, 2)
            }
            for bug_dict, score in similar_bugs
        ]
    }


@router.get("/{bug_id}/explanation")
def get_prediction_explanation(bug_id: int, db: Session = Depends(get_db)):
    """Get explanation for ML predictions for a given bug."""
    bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    
    explanation = ml.get_prediction_explanation(
        bug.title,
        bug.description,
        bug.predicted_severity,
        bug.predicted_team
    )
    
    return {
        'bug_id': bug.id,
        'title': bug.title,
        'explanation': explanation
    }


@router.patch("/{bug_id}", response_model=schemas.BugOut)
@router.put("/{bug_id}", response_model=schemas.BugOut)
def update_bug(bug_id: int, bug_update: schemas.BugUpdate, db: Session = Depends(get_db)):
    try:
        db_bug = db.query(models.Bug).filter(models.Bug.id == bug_id).first()
        if not db_bug:
            raise HTTPException(status_code=404, detail="Bug not found")

        if bug_update.status is not None:
            db_bug.status = str(bug_update.status).lower()
        if bug_update.final_severity is not None:
            db_bug.final_severity = str(bug_update.final_severity).lower()
        if bug_update.final_team is not None:
            db_bug.final_team = str(bug_update.final_team).lower()

        db.commit()
        db.refresh(db_bug)
        return db_bug
    except Exception as e:
        db.rollback()
        print(f"Error updating bug {bug_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update bug: {str(e)}")
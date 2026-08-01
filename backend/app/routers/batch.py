from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io

from ..database import get_db
from .. import models, schemas
from .. import ml

router = APIRouter(prefix="/api/batch", tags=["Batch Processing"])


@router.post("/upload-csv")
async def batch_predict_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file with bug reports for batch ML prediction.
    
    CSV format expected:
    title,description,reporter
    "Bug title","Bug description","Reporter name"
    """
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ['title', 'description']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process each row
        results = []
        for idx, row in df.iterrows():
            title = str(row['title'])
            description = str(row['description'])
            reporter = str(row.get('reporter', 'Batch Upload'))
            
            # Run ML predictions
            try:
                severity_pred, severity_conf = ml.predict_severity(title, description)
            except Exception as e:
                print(f"ML Severity prediction failed for row {idx}: {e}")
                severity_pred, severity_conf = "major", 0.50
            
            try:
                team_pred, team_conf = ml.predict_team(title, description)
            except Exception as e:
                print(f"ML Team prediction failed for row {idx}: {e}")
                team_pred, team_conf = "backend", 0.50
            
            # Create bug in database
            db_bug = models.Bug(
                title=title,
                description=description,
                reporter=reporter,
                predicted_severity=str(severity_pred).lower(),
                predicted_team=str(team_pred).lower(),
                severity_confidence=float(severity_conf or 0.5),
                team_confidence=float(team_conf or 0.5),
                status="new"
            )
            
            db.add(db_bug)
            db.commit()
            db.refresh(db_bug)
            
            results.append({
                'row': idx + 1,
                'bug_id': db_bug.id,
                'title': title,
                'predicted_severity': db_bug.predicted_severity,
                'predicted_team': db_bug.predicted_team,
                'severity_confidence': db_bug.severity_confidence,
                'team_confidence': db_bug.team_confidence
            })
        
        return {
            'status': 'success',
            'total_processed': len(results),
            'results': results
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV file: {str(e)}"
        )


@router.get("/template")
def get_csv_template():
    """
    Get a CSV template for batch bug upload.
    """
    template = """title,description,reporter
"Login page not loading on Chrome","Users report that the login page shows a blank screen when accessed via Chrome browser version 90+","john.doe@example.com"
"Database connection timeout","API endpoints are timing out when connecting to the PostgreSQL database during peak hours","jane.smith@example.com"
"Security vulnerability in auth token","JWT tokens are not being properly validated, allowing unauthorized access to user accounts","security-team@example.com"
"""
    
    return {
        'template': template,
        'instructions': 'Download this template, fill in your bug reports, and upload using the batch endpoint.'
    }

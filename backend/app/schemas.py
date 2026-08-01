import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BugCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=3)
    reporter: Optional[str] = None


class BugUpdate(BaseModel):
    status: Optional[str] = None
    final_severity: Optional[str] = None
    final_team: Optional[str] = None


class BugOut(BaseModel):
    id: int
    title: str
    description: str
    reporter: Optional[str]
    predicted_severity: str
    predicted_team: str
    severity_confidence: Optional[float]
    team_confidence: Optional[float]
    final_severity: Optional[str]
    final_team: Optional[str]
    status: str
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_bugs: int
    open_bugs: int
    resolved_bugs: int
    avg_resolution_hours: Optional[float]
    by_severity: dict
    by_team: dict
    by_status: dict


class FeedbackCreate(BaseModel):
    corrected_severity: Optional[str] = None
    corrected_team: Optional[str] = None


class FeedbackOut(BaseModel):
    id: int
    bug_id: int
    original_severity: str
    original_team: str
    corrected_severity: Optional[str]
    corrected_team: Optional[str]
    created_at: str

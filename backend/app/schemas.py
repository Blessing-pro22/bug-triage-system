import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .models import Severity, Team, Status


class BugCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=3)
    reporter: Optional[str] = None


class BugUpdate(BaseModel):
    status: Optional[Status] = None
    final_severity: Optional[Severity] = None
    final_team: Optional[Team] = None


class BugOut(BaseModel):
    id: int
    title: str
    description: str
    reporter: Optional[str]
    predicted_severity: Severity
    predicted_team: Team
    severity_confidence: Optional[float]
    team_confidence: Optional[float]
    final_severity: Optional[Severity]
    final_team: Optional[Team]
    status: Status
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

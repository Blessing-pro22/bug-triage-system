import enum
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Enum
from .database import Base


class Severity(str, enum.Enum):
    trivial = "trivial"
    minor = "minor"
    major = "major"
    critical = "critical"


class Team(str, enum.Enum):
    frontend = "frontend"
    backend = "backend"
    security = "security"


class Status(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class Bug(Base):
    __tablename__ = "bugs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    reporter = Column(String(120), nullable=True)

    # ML-assigned fields (auto-triage)
    predicted_severity = Column(Enum(Severity), nullable=False)
    predicted_team = Column(Enum(Team), nullable=False)
    severity_confidence = Column(Float, nullable=True)
    team_confidence = Column(Float, nullable=True)

    # Human-overridable fields — triage suggests, a person can correct
    final_severity = Column(Enum(Severity), nullable=True)
    final_team = Column(Enum(Team), nullable=True)

    status = Column(Enum(Status), default=Status.open, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

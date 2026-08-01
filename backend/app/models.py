import enum
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
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
    new = "new"
    triaged = "triaged"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"
    REOPENED = "reopened"


class Bug(Base):
    __tablename__ = "bugs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    reporter = Column(String(120), nullable=True)

    # ML-assigned fields (stored as Strings to avoid PostgreSQL enum locking)
    predicted_severity = Column(String(50), nullable=False)
    predicted_team = Column(String(50), nullable=False)
    severity_confidence = Column(Float, nullable=True)
    team_confidence = Column(Float, nullable=True)

    # Human-overridable fields
    final_severity = Column(String(50), nullable=True)
    final_team = Column(String(50), nullable=True)

    status = Column(String(50), default="new", nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
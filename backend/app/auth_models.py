import enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from .database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    triager = "triager"
    developer = "developer"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.viewer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, nullable=True)

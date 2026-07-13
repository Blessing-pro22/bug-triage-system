"""
Database configuration.

Defaults to local SQLite for zero-setup development. Swap DATABASE_URL
to a Postgres/Supabase connection string in production — the models
and queries are plain SQLAlchemy and require no code changes.

Example production value:
    DATABASE_URL=postgresql://user:password@host:5432/bug_triage
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bug_triage.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

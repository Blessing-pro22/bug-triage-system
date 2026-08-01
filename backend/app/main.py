import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .routers import bugs, analytics
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automated Bug Triage System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bugs.router)
app.include_router(analytics.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "bug-triage-api"}

@app.get("/api/activity")
def get_activity(db: Session = Depends(get_db)):
    try:
        return db.query(models.Bug).order_by(models.Bug.id.desc()).limit(10).all()
    except Exception as e:
        print(f"Error fetching activity: {e}")
        return []

@app.get("/debug-files")
def debug_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ml_models_dir = os.path.join(base_dir, "ml", "models")
    
    files_in_models = []
    if os.path.exists(ml_models_dir):
        files_in_models = os.listdir(ml_models_dir)
        
    return {
        "current_working_dir": os.getcwd(),
        "base_dir": base_dir,
        "ml_models_dir": ml_models_dir,
        "ml_models_dir_exists": os.path.exists(ml_models_dir),
        "files_found": files_in_models
    }
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from .database import Base, engine
# from .routers import bugs, analytics

# Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="Automated Bug Triage System API",
#     description="Classifies incoming bug reports by severity and owning team, "
#                 "then tracks resolution analytics.",
#     version="1.0.0",
# )

# # Enable CORS for all origins during development/demo
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows requests from any frontend domain
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows GET, POST, OPTIONS, PATCH, DELETE, etc.
#     allow_headers=["*"],  # Allows all headers
# )
# # Explicitly declare allowed origins including your Vercel app
# origins = [
#     "https://bug-triage-system-eight.vercel.app",
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "*"
# ]

# app.include_router(bugs.router)
# app.include_router(analytics.router)


# @app.get("/")
# def health_check():
#     return {"status": "ok", "service": "bug-triage-api"}
# # Make sure your API loads the new model filename
# MODEL_PATH = "app/ml/models/severity_model_gitbugs.joblib"

# import os

# @app.get("/debug-files")
# def debug_files():
#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     ml_models_dir = os.path.join(base_dir, "ml", "models")
    
#     files_in_models = []
#     if os.path.exists(ml_models_dir):
#         files_in_models = os.listdir(ml_models_dir)
        
#     return {
#         "current_working_dir": os.getcwd(),
#         "base_dir": base_dir,
#         "ml_models_dir": ml_models_dir,
#         "ml_models_dir_exists": os.path.exists(ml_models_dir),
#         "files_found": files_in_models
#     }

import os
from fastapi import FastAPI, Depends  # <--- Make sure Depends is imported here
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .routers import bugs, analytics
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bug Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bugs.router, prefix="/api/bugs", tags=["Bugs"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/api/activity")
def get_activity(db: Session = Depends(get_db)):
    try:
        return db.query(models.Bug).order_by(models.Bug.id.desc()).limit(10).all()
    except Exception as e:
        print(f"Error loading activity: {e}")
        return []
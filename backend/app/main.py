from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import bugs, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automated Bug Triage System API",
    description="Classifies incoming bug reports by severity and owning team, "
                "then tracks resolution analytics.",
    version="1.0.0",
)

# Enable CORS for all origins during development/demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, PATCH, DELETE, etc.
    allow_headers=["*"],  # Allows all headers
)
# Explicitly declare allowed origins including your Vercel app
origins = [
    "https://bug-triage-system-eight.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.include_router(bugs.router)
app.include_router(analytics.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "bug-triage-api"}
# Make sure your API loads the new model filename
MODEL_PATH = "app/ml/models/severity_model_gitbugs.joblib"
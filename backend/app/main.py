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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the deployed frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bugs.router)
app.include_router(analytics.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "bug-triage-api"}

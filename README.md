# Automated Bug Triage System — Project 76

**Pillar:** Algorithmic Thinking · **Framework phase covered:** 1–4 (MVP), scaffolding for 5–6

Classifies incoming bug reports by severity and owning team the moment they're
submitted, using a text classifier trained on historical triage decisions.

## Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind + Recharts | matches required React-based frontend |
| Backend | **FastAPI** (Python) | see *"About the backend swap"* below |
| Classifier | scikit-learn (TF-IDF + LinearSVC) | the Pillar 4 deliverable |
| Database | SQLite (dev) / PostgreSQL (prod, via `docker-compose`) | SQLAlchemy ORM, zero code changes to switch |
| Deployment | Docker, docker-compose | one command spins up db + backend + frontend |

### About the backend swap
The brief calls for **Spring** as the backend. This sandbox's network allowlist
covers `npm`/`pypi`/`github` but not Maven Central, so a Spring Boot project
can't actually be fetched, built, or verified here. I built the MVP on
**FastAPI** instead so every endpoint below is real and tested, not just
sketched. The API is a thin, framework-agnostic REST layer (routes → service
functions → ORM), so porting `backend/app` to a Spring Boot
`@RestController` / `@Service` / `@Entity` structure is a mechanical
1:1 translation — I'm happy to write that version too if you can run it
locally or in an environment with Maven access.

## How the pieces map to the delivery framework

| Phase | What's here |
|---|---|
| 1. Problem Framing | This README + the project brief (Pillar 4: Algorithmic Thinking) |
| 2. System Design | See architecture below; `backend/app/models.py` is the data model |
| 3. App Development | Working MVP: submit a bug → see it auto-triaged → manage it on the dashboard |
| 4. Data Pipeline | `sample_data.csv` → `train_model.py` → `/api/analytics/*` → dashboard charts |
| 5. Evaluation | `train_model.py` prints precision/recall/F1 per class on a held-out split |
| 6. Documentation | This file. Swap in your own report/paper for submission. |

## Architecture

```
┌─────────────┐      POST /api/bugs        ┌──────────────┐      predict()      ┌───────────────────┐
│   Next.js    │ ─────────────────────────▶ │   FastAPI    │ ──────────────────▶ │  TF-IDF + LinearSVC │
│  Dashboard   │ ◀───────────────────────── │   Backend    │ ◀────────────────── │  (severity, team)   │
│  + Submit    │      JSON (triaged bug)     │  + SQLAlchemy │                    └───────────────────┘
└─────────────┘                             └──────┬───────┘
                                                    │
                                             ┌──────▼───────┐
                                             │  SQLite /     │
                                             │  PostgreSQL   │
                                             └───────────────┘
```

## Running it locally

### 1. Backend
```bash
cd backend
pip install -r requirements.txt --break-system-packages   # or use a venv
python app/ml/train_model.py                               # trains + saves the two models
uvicorn app.main:app --reload --port 8000
```
API docs auto-generated at `http://localhost:8000/docs`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Open `http://localhost:3000`.

### 3. Or, everything via Docker
```bash
docker-compose up --build
```
Frontend on `:3000`, API on `:8000`, Postgres on `:5432`.

## API reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/bugs` | Submit a report; returns it with predicted severity/team |
| GET | `/api/bugs?status=&team=&severity=` | List/filter the queue |
| PATCH | `/api/bugs/{id}` | Update status, or override the model's severity/team |
| DELETE | `/api/bugs/{id}` | Remove a report |
| GET | `/api/analytics/summary` | Totals, breakdowns by severity/team/status, avg resolution time |
| GET | `/api/analytics/trend` | Reports per day, last 30 days |

## The algorithm (Pillar 4 focus)

`backend/app/ml/train_model.py` trains two independent classifiers sharing a
TF-IDF representation of `title + description`:

- **Severity** → `trivial | minor | major | critical`
- **Team** → `frontend | backend | security`

`LinearSVC` was chosen because bug reports are short, sparse, high-dimensional
text — a linear margin classifier fits that regime well and predicts in
milliseconds, which matters since triage happens synchronously on submit.
The script prints a classification report (precision/recall/F1) on a held-out
25% split for the evaluation phase, then refits on all data before saving.

**To improve accuracy:** replace `backend/app/ml/sample_data.csv` (currently
~40 synthetic examples) with real historical tickets exported from your
issue tracker, then rerun `train_model.py`. The pipeline doesn't change.

## Extending toward Phase 5–6

- Wire `PATCH /api/bugs/{id}` overrides back into a retraining loop —
  disagreements between `predicted_*` and `final_*` are labeled training data.
- Add a `/api/bugs/{id}/duplicates` endpoint using cosine similarity over the
  same TF-IDF vectors to catch duplicate reports (natural next step for the
  Pattern Recognition pillar).
- User testing: have QA/dev submit real tickets for a week, then compare
  auto-assigned severity/team against what a human triager would have chosen.

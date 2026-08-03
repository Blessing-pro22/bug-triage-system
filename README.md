# Bug Triage System

AI-powered bug classification and prioritization system with human-in-the-loop feedback.

## Features

✓ **Automated Bug Classification** - ML-powered severity and team assignment
✓ **Human-in-the-Loop Correction** - Developers can override AI predictions
✓ **Bug Lifecycle Management** - Full workflow: New → Triaged → Assigned → In Progress → Resolved → Closed
✓ **Analytics Dashboard** - Track bugs, severity, resolution times, and trends
✓ **AI Performance Metrics** - Classification accuracy, precision, recall, F1 score
✓ **Activity Logging** - Track all system events and user actions
✓ **Search & Filtering** - Real-time search across bug reports
✓ **Modern UI** - Glassmorphism design with loading skeletons and animations
✓ **Landing Page** - Professional introduction with feature highlights

##  Model Performance & Dataset Metrics

| Metric | Accuracy | Dataset Volume | Primary Model | Feature Extraction |
| :--- | :---: | :---: | :--- | :--- |
| **Severity Classifier** | **90.23%** | 4,706 Reports | LinearSVC (`class_weight='balanced'`) | TF-IDF (Unigrams + Bigrams) |
| **Team Routing Engine** | **77.81%** | 4,706 Reports | LinearSVC (`class_weight='balanced'`) | TF-IDF (Unigrams + Bigrams) |

###  Dataset Class Distribution

* ⚙️ **Backend**: `2,978` samples (63.2%)
* 🎨 **Frontend**: `1,371` samples (29.1%)
* 🔒 **Security**: `299` samples (6.3%)
* 📱 **Mobile**: `58` samples (1.2%)

### Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ML Model**: scikit-learn (TF-IDF + LinearSVC)

### Deployment
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL (production)

## Architecture

```
┌─────────────┐      POST /api/bugs        ┌──────────────┐      predict()      ┌───────────────────┐
│   Next.js    │ ─────────────────────────▶ │   FastAPI    │ ──────────────────▶ │  TF-IDF + LinearSVC │
│  Dashboard   │ ◀───────────────────────── │   Backend    │ ◀────────────────── │  (severity, team)   │
│  + Submit    │      JSON (triaged bug)     │  + SQLAlchemy │                    └───────────────────┘
│  + Analytics │                              └──────┬───────┘
│  + Landing   │                                     │
└─────────────┘                              ┌──────▼───────┐
                                             │  SQLite /     │
                                             │  PostgreSQL   │
                                             └───────────────┘
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd bug-triage-system

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app/ml/train_model.py  # Train the ML model
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## API Reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/bugs` | Submit a bug report with AI classification |
| GET | `/api/bugs?status=&team=&severity=` | List and filter bug reports |
| PATCH | `/api/bugs/{id}` | Update status or override AI predictions |
| DELETE | `/api/bugs/{id}` | Remove a bug report |
| POST | `/api/bugs/{id}/feedback` | Submit human correction feedback |
| GET | `/api/analytics/summary` | Get analytics summary and breakdowns |
| GET | `/api/analytics/trend` | Get bug reports trend (last 30 days) |
| GET | `/api/analytics/ai-performance` | Get AI model performance metrics |
| GET | `/api/activity` | Get recent activity log |

## Bug Status Workflow

The system implements a complete bug lifecycle:

```
NEW → TRIAGED → ASSIGNED → IN PROGRESS → RESOLVED → CLOSED
         ↑                                    ↓
         └──────────────── REOPENED ←──────────┘
```

## AI Classification

The ML model classifies bug reports into:

**Severity Levels:**
- Urgent / Critical
- Major
- Low
- Normal

**Teams:**
- Frontend
- Backend
- Security
- Mobile

**Confidence Indicators:**
- High confidence (≥80%)
- Medium confidence (60-79%)
- Low confidence (<60%)

## Human-in-the-Loop

Developers can:
1. Review AI predictions on bug details page
2. Mark classifications as correct or incorrect
3. Submit corrections for severity and/or team
4. View feedback confirmation
5. Track human corrections in analytics

## Pages

- **Landing Page** (`/landing`) - Introduction and feature overview
- **Dashboard** (`/dashboard`) - Main queue with statistics and filters
- **Bug Details** (`/bug/[id]`) - Full bug information with AI analysis
- **Analytics** (`/analytics`) - AI model performance metrics
- **Submit** (`/submit`) - Enhanced bug submission form

## Enhancing the Model

To improve classification accuracy:

1. Replace `backend/app/ml/sample_data.csv` with real historical data
2. Run `python backend/app/ml/train_model.py` to retrain
3. The model automatically saves to `backend/app/models/`
4. Human corrections can be used for active learning

## Future Enhancements

- Authentication and role-based access control
- Admin panel for user management
- Real-time notifications
- Duplicate detection using TF-IDF similarity
- Advanced ML models (BERT, transformers)
- Mobile app
- Integration with issue trackers (Jira, GitHub Issues)

## License

MIT License

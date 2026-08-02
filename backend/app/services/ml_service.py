import joblib
import re
from pathlib import Path

# Locate models directory dynamically depending on where the server is executed from
MODEL_DIR = Path("app/ml/models") if Path("app").exists() else Path("backend/app/ml/models")

# Load models ONCE when the module is loaded (fast response time for API requests)
try:
    severity_model = joblib.load(MODEL_DIR / "severity_model.joblib")
    team_model = joblib.load(MODEL_DIR / "team_model.joblib")
    print("✅ ML Models loaded successfully into API service.")
except Exception as e:
    print(f"⚠️ Warning: Could not load ML models from {MODEL_DIR}. Details: {e}")
    severity_model = None
    team_model = None

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def predict_bug_triage(summary: str, description: str) -> dict:
    if not severity_model or not team_model:
        raise RuntimeError("ML Models are not loaded. Please ensure training has been executed.")

    combined_text = clean_text(f"{summary} {description}")

    # Predict severity and team assignment
    predicted_severity = severity_model.predict([combined_text])[0]
    predicted_team = team_model.predict([combined_text])[0]

    return {
        "predicted_severity": str(predicted_severity),
        "predicted_team": str(predicted_team)
    }
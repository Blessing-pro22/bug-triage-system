import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

def load_model_file(filename: str):
    path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(path):
        try:
            model = joblib.load(path)
            print(f"✅ Loaded model successfully: {path}")
            return model
        except Exception as e:
            print(f"❌ Failed to load model binary at {path}: {e}")
            return None
    print(f"❌ Model file missing at: {path}")
    return None

severity_model = load_model_file("severity_model_gitbugs.joblib") or load_model_file("severity_model.joblib")
team_model = load_model_file("team_model_gitbugs.joblib") or load_model_file("team_model.joblib")

def predict_severity(title: str, description: str):
    if not severity_model:
        return "major", 0.85
    text = f"{title} {description}"
    try:
        prediction = severity_model.predict([text])[0]
        confidence = float(max(severity_model.predict_proba([text])[0])) if hasattr(severity_model, "predict_proba") else 0.85
        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"Severity prediction error: {e}")
        return "major", 0.50

def predict_team(title: str, description: str):
    if not team_model:
        return "backend", 0.85
    text = f"{title} {description}"
    try:
        prediction = team_model.predict([text])[0]
        confidence = float(max(team_model.predict_proba([text])[0])) if hasattr(team_model, "predict_proba") else 0.85
        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"Team prediction error: {e}")
        return "backend", 0.50
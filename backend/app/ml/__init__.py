import os
import joblib

# Dynamically build path relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load models safely
def load_model_file(filename: str):
    path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(path):
        print(f"✅ Loaded model: {path}")
        return joblib.load(path)
    print(f"❌ Model file missing at: {path}")
    return None

severity_model = load_model_file("severity_model_gitbugs.joblib") or load_model_file("severity_model.joblib")
team_model = load_model_file("team_model_gitbugs.joblib") or load_model_file("team_model.joblib")

def predict_severity(title: str, description: str):
    if not severity_model:
        raise ValueError("Severity model binary not loaded")
        
    text = f"{title} {description}"
    
    # Predict probabilities if supported by model/pipeline
    if hasattr(severity_model, "predict_proba"):
        probs = severity_model.predict_proba([text])[0]
        confidence = float(max(probs))
    else:
        confidence = 0.85

    prediction = severity_model.predict([text])[0]
    return str(prediction).lower(), round(confidence, 2)

def predict_team(title: str, description: str):
    if not team_model:
        raise ValueError("Team model binary not loaded")

    text = f"{title} {description}"

    if hasattr(team_model, "predict_proba"):
        probs = team_model.predict_proba([text])[0]
        confidence = float(max(probs))
    else:
        confidence = 0.85

    prediction = team_model.predict([text])[0]
    return str(prediction).lower(), round(confidence, 2)
    
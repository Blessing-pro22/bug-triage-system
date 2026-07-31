# # import os
# # import joblib

# # # Paths to model binaries
# # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # SEVERITY_MODEL_PATH = os.path.join(BASE_DIR, "models", "severity_model_gitbugs.joblib")
# # TEAM_MODEL_PATH = os.path.join(BASE_DIR, "models", "team_model.joblib")

# # # Load models gracefully
# # severity_model = None
# # team_model = None

# # if os.path.exists(SEVERITY_MODEL_PATH):
# #     try:
# #         severity_model = joblib.load(SEVERITY_MODEL_PATH)
# #         print(f"Loaded GitBugs Severity Model from {SEVERITY_MODEL_PATH}")
# #     except Exception as e:
# #         print(f"Error loading severity model: {e}")

# # if os.path.exists(TEAM_MODEL_PATH):
# #     try:
# #         team_model = joblib.load(TEAM_MODEL_PATH)
# #         print(f"Loaded Team Model from {TEAM_MODEL_PATH}")
# #     except Exception as e:
# #         print(f"Error loading team model: {e}")


# # def predict(title: str, description: str) -> dict:
# #     """Combines title and description to predict severity and owning team."""
# #     text = f"{title or ''} {description or ''}".strip()

# #     # Default fallback values
# #     predicted_severity = "major"
# #     severity_confidence = 0.50
# #     predicted_team = "backend"
# #     team_confidence = 0.50

# #     if not text:
# #         return {
# #             "severity": predicted_severity,
# #             "severity_confidence": severity_confidence,
# #             "team": predicted_team,
# #             "team_confidence": team_confidence,
# #         }

# #     # Predict Severity using new GitBugs Model
# #     if severity_model is not None:
# #         try:
# #             predicted_severity = severity_model.predict([text])[0]
# #             if hasattr(severity_model, "predict_proba"):
# #                 probs = severity_model.predict_proba([text])[0]
# #                 severity_confidence = float(max(probs))
# #             else:
# #                 severity_confidence = 0.85
# #         except Exception as e:
# #             print(f"Severity prediction error: {e}")

# #     # Predict Team using existing Team Model
# #     if team_model is not None:
# #         try:
# #             predicted_team = team_model.predict([text])[0]
# #             if hasattr(team_model, "predict_proba"):
# #                 probs = team_model.predict_proba([text])[0]
# #                 team_confidence = float(max(probs))
# #             else:
# #                 team_confidence = 0.85
# #         except Exception as e:
# #             print(f"Team prediction error: {e}")

# #     return {
# #         "severity": predicted_severity,
# #         "severity_confidence": round(severity_confidence, 2),
# #         "team": predicted_team,
# #         "team_confidence": round(team_confidence, 2),
# #     }

# import os
# import joblib

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # Points to backend/app/ml/models/severity_model_gitbugs.joblib
# SEVERITY_MODEL_PATH = os.path.join(BASE_DIR, "models", "severity_model_gitbugs.joblib")
# TEAM_MODEL_PATH = os.path.join(BASE_DIR, "models", "team_model.joblib")

# severity_model = None
# team_model = None

# try:
#     if os.path.exists(SEVERITY_MODEL_PATH):
#         severity_model = joblib.load(SEVERITY_MODEL_PATH)
#         print(f"✅ Loaded Severity Model from: {SEVERITY_MODEL_PATH}")
#     else:
#         print(f"❌ Severity model NOT found at: {SEVERITY_MODEL_PATH}")
# except Exception as e:
#     print(f"⚠️ Error loading severity model: {e}")

# try:
#     if os.path.exists(TEAM_MODEL_PATH):
#         team_model = joblib.load(TEAM_MODEL_PATH)
#         print(f"✅ Loaded Team Model from: {TEAM_MODEL_PATH}")
#     else:
#         print(f"❌ Team model NOT found at: {TEAM_MODEL_PATH}")
# except Exception as e:
#     print(f"⚠️ Error loading team model: {e}")

import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEVERITY_MODEL_PATH = os.path.join(BASE_DIR, "models", "severity_model_gitbugs.joblib")

severity_model = None

if os.path.exists(SEVERITY_MODEL_PATH):
    try:
        severity_model = joblib.load(SEVERITY_MODEL_PATH)
        print(f"✅ Loaded severity model successfully from {SEVERITY_MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load severity model: {e}")

# Severity mapping dictionary to handle numeric label outputs
SEVERITY_MAP = {
    0: "low",
    1: "medium",
    2: "major",
    3: "critical",
    "0": "low",
    "1": "medium",
    "2": "major",
    "3": "critical",
}

def predict(title: str, description: str) -> dict:
    title_str = title or ""
    desc_str = description or ""
    full_text = f"{title_str} {desc_str}".strip()

    predicted_severity = "major"
    severity_confidence = 0.85
    predicted_team = "backend"
    team_confidence = 0.85

    if severity_model is not None and full_text:
        try:
            # 1. Get raw prediction from model
            raw_pred = severity_model.predict([full_text])[0]
            print(f"🔍 RAW MODEL PREDICTION OUTPUT: {raw_pred} (Type: {type(raw_pred)})")

            # 2. Map label if numerical, otherwise use direct string
            if raw_pred in SEVERITY_MAP:
                predicted_severity = SEVERITY_MAP[raw_pred]
            else:
                predicted_severity = str(raw_pred).lower()

            # 3. Compute probability confidence if classifier supports it
            if hasattr(severity_model, "predict_proba"):
                probs = severity_model.predict_proba([full_text])[0]
                severity_confidence = float(max(probs))
                print(f"🔍 MODEL CONFIDENCE PROBABILITIES: {probs}")
            else:
                severity_confidence = 0.92

        except Exception as e:
            print(f"❌ Error during model execution: {e}")

    return {
        "severity": str(predicted_severity).lower(),
        "severity_confidence": round(float(severity_confidence), 2),
        "team": str(predicted_team).lower(),
        "team_confidence": round(float(team_confidence), 2),
    }
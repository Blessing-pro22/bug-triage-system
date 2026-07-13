"""
Thin inference wrapper around the two trained models.
Loads once at import time, exposes a single predict() call
used by the API layer.
"""
import os
import joblib

HERE = os.path.dirname(os.path.abspath(__file__))
SEVERITY_MODEL_PATH = os.path.join(HERE, "severity_model.joblib")
TEAM_MODEL_PATH = os.path.join(HERE, "team_model.joblib")

_severity_model = None
_team_model = None


def _ensure_loaded():
    global _severity_model, _team_model
    if _severity_model is None or _team_model is None:
        if not (os.path.exists(SEVERITY_MODEL_PATH) and os.path.exists(TEAM_MODEL_PATH)):
            raise RuntimeError(
                "Model files not found. Run `python app/ml/train_model.py` first."
            )
        _severity_model = joblib.load(SEVERITY_MODEL_PATH)
        _team_model = joblib.load(TEAM_MODEL_PATH)


def predict(title: str, description: str) -> dict:
    """Classify a bug report into (severity, team).

    Also returns a confidence-like margin score derived from the SVM
    decision function, normalized to look like a percentage. This is
    a distance-to-margin proxy, not a calibrated probability.
    """
    _ensure_loaded()
    text = f"{title} {description}"

    severity = _severity_model.predict([text])[0]
    team = _team_model.predict([text])[0]

    severity_confidence = _margin_confidence(_severity_model, text)
    team_confidence = _margin_confidence(_team_model, text)

    return {
        "severity": severity,
        "team": team,
        "severity_confidence": severity_confidence,
        "team_confidence": team_confidence,
    }


def _margin_confidence(pipeline, text: str) -> float:
    import numpy as np
    scores = pipeline.decision_function([text])[0]
    # decision_function returns a score per class (or a single value for binary)
    scores = np.atleast_1d(scores)
    # softmax-style normalization purely for a human-readable confidence %
    exp_scores = np.exp(scores - np.max(scores))
    probs = exp_scores / exp_scores.sum()
    return round(float(np.max(probs)) * 100, 1)

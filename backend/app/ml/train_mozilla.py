import json
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

DATA_PATH = Path("app/ml/data/processed/clean_mozilla.csv") if Path("app").exists() else Path("backend/app/ml/data/processed/clean_mozilla.csv")
MODELS_DIR = Path("app/ml/models") if Path("app").exists() else Path("backend/app/ml/models")

def filter_rare_classes(df, target_col, min_samples=2):
    """Filters out classes that have fewer than min_samples."""
    counts = df[target_col].value_counts()
    valid_classes = counts[counts >= min_samples].index
    filtered_df = df[df[target_col].isin(valid_classes)].copy()
    dropped = len(df) - len(filtered_df)
    if dropped > 0:
        print(f"  [Info] Dropped {dropped} rows with rare values (< {min_samples} occurrences) in '{target_col}'")
    return filtered_df

def train():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Loading cleaned dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)

    # ------------------- 1. Severity Model -------------------
    print("\n--- Training Severity Model ---")
    df_sev = filter_rare_classes(df, 'severity', min_samples=2)
    X_sev = df_sev['full_text']
    y_sev = df_sev['severity']

    # Removed stratify=y_sev to support small sample files
    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
        X_sev, y_sev, test_size=0.2, random_state=42
    )

    severity_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, ngram_range=(1, 2))),
        ('clf', LinearSVC(C=1.0, random_state=42, dual='auto'))
    ])

    severity_pipeline.fit(X_train_s, y_train_s)
    y_pred_s = severity_pipeline.predict(X_test_s)

    sev_acc = accuracy_score(y_test_s, y_pred_s)
    sev_report = classification_report(y_test_s, y_pred_s, output_dict=True, zero_division=0)

    # ------------------- 2. Team Routing Model -------------------
    print("\n--- Training Team Routing Model ---")
    df_team = filter_rare_classes(df, 'team', min_samples=2)
    X_team = df_team['full_text']
    y_team = df_team['team']

    # Removed stratify=y_team to support small sample files
    X_train_t, X_test_t, y_train_t, y_test_t = train_test_split(
        X_team, y_team, test_size=0.2, random_state=42
    )

    team_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, ngram_range=(1, 2))),
        ('clf', LinearSVC(C=1.0, random_state=42, dual='auto'))
    ])

    team_pipeline.fit(X_train_t, y_train_t)
    y_pred_t = team_pipeline.predict(X_test_t)

    team_acc = accuracy_score(y_test_t, y_pred_t)
    team_report = classification_report(y_test_t, y_pred_t, output_dict=True, zero_division=0)

    # ------------------- Save Artifacts -------------------
    # Extract classifier and vectorizer from pipelines
    sev_vec = severity_pipeline.named_steps['tfidf']
    sev_clf = severity_pipeline.named_steps['clf']

    team_vec = team_pipeline.named_steps['tfidf']
    team_clf = team_pipeline.named_steps['clf']

    # Save as (model, vectorizer) tuples matching your __init__.py loader
    joblib.dump((sev_clf, sev_vec), MODELS_DIR / "severity_model.joblib")
    joblib.dump((team_clf, team_vec), MODELS_DIR / "team_model.joblib")

    metrics = {
        "severity_accuracy": sev_acc,
        "team_accuracy": team_acc,
        "severity_metrics": sev_report,
        "team_metrics": team_report
    }

    with open(MODELS_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)

    print("\n================ Results ================")
    print(f"Severity Prediction Accuracy: {sev_acc * 100:.2f}%")
    print(f"Team Routing Accuracy:       {team_acc * 100:.2f}%")
    print("=========================================")
    print(f"Models and metrics saved in: {MODELS_DIR}")

if __name__ == "__main__":
    train()
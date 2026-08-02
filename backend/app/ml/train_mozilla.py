import os
import json
import joblib
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# 1. Define Base Directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Points to 'backend' directory
DATA_DIR = BASE_DIR / "app" / "ml" / "data"
MODELS_DIR = BASE_DIR / "app" / "ml" / "models"

# 2. Set Paths
PROCESSED_DATA_PATH = DATA_DIR / "processed" / "clean_combined.csv"
METRICS_PATH = MODELS_DIR / "metrics.json"

def train():
    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(f"Processed dataset not found at: {PROCESSED_DATA_PATH}. Run prepare_mozilla.py first!")

    print(f"Loading cleaned dataset from {PROCESSED_DATA_PATH}...")
    df = pd.read_csv(PROCESSED_DATA_PATH)

    # Ensure required columns exist
    df['full_text'] = df['full_text'].fillna('')
    df = df[df['full_text'].str.strip() != '']

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    metrics_output = {}

    # ==========================================
    # --- 1. Train Severity Model ---
    # ==========================================
    print("\n--- Training Severity Model ---")
    X_sev = df['full_text']
    y_sev = df['severity']

    X_train_sev, X_test_sev, y_train_sev, y_test_sev = train_test_split(
        X_sev, y_sev, test_size=0.2, random_state=42, stratify=y_sev
    )

    severity_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')),
        ('clf', LinearSVC(class_weight='balanced', C=1.0, random_state=42))
    ])

    severity_pipeline.fit(X_train_sev, y_train_sev)
    y_pred_sev = severity_pipeline.predict(X_test_sev)

    sev_acc = accuracy_score(y_test_sev, y_pred_sev)
    print(f"Severity Model Accuracy: {sev_acc * 100:.2f}%")
    metrics_output['severity_accuracy'] = round(sev_acc, 4)
    metrics_output['severity_report'] = classification_report(y_test_sev, y_pred_sev, output_dict=True)

    # ==========================================
    # --- 2. Train Team Routing Model ---
    # ==========================================
    print("\n--- Training Team Routing Model ---")
    
    # Filter out teams with less than 2 occurrences
    team_counts = df['team'].value_counts()
    valid_teams = team_counts[team_counts >= 2].index
    df_team = df[df['team'].isin(valid_teams)].copy()

    X_team = df_team['full_text']
    y_team = df_team['team']

    X_train_team, X_test_team, y_train_team, y_test_team = train_test_split(
        X_team, y_team, test_size=0.2, random_state=42, stratify=y_team
    )

    team_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')),
        ('clf', LinearSVC(class_weight='balanced', C=1.0, random_state=42))
    ])

    team_pipeline.fit(X_train_team, y_train_team)
    y_pred_team = team_pipeline.predict(X_test_team)

    team_acc = accuracy_score(y_test_team, y_pred_team)
    print(f"Team Routing Accuracy: {team_acc * 100:.2f}%")
    metrics_output['team_accuracy'] = round(team_acc, 4)
    metrics_output['team_report'] = classification_report(y_test_team, y_pred_team, output_dict=True)

    # ==========================================
    # --- 3. Save Models & Artifacts ---
    # ==========================================
    sev_vec = severity_pipeline.named_steps['tfidf']
    sev_clf = severity_pipeline.named_steps['clf']

    team_vec = team_pipeline.named_steps['tfidf']
    team_clf = team_pipeline.named_steps['clf']

    # Save both tuple format and pipeline format to cover all loaders
    joblib.dump((sev_clf, sev_vec), MODELS_DIR / "severity_model_improved.joblib")
    joblib.dump((team_clf, team_vec), MODELS_DIR / "team_model_improved.joblib")
    
    joblib.dump((sev_clf, sev_vec), MODELS_DIR / "severity_model.joblib")
    joblib.dump((team_clf, team_vec), MODELS_DIR / "team_model.joblib")

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_output, f, indent=4)

    print("\n================ Results ================")
    print(f"Severity Prediction Accuracy: {sev_acc * 100:.2f}%")
    print(f"Team Routing Accuracy:       {team_acc * 100:.2f}%")
    print("=========================================")
    print(f"✅ Models trained on clean_combined.csv and saved in: {MODELS_DIR}")

if __name__ == "__main__":
    train()
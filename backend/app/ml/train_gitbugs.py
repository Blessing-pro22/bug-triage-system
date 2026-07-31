"""
Train the Bug Triage severity model on REAL GitBugs data.

This script:
1. Loads the processed GitBugs CSV.
2. Builds TF-IDF features from title + description.
3. Trains LinearSVC.
4. Evaluates on a held-out test set using genuine sklearn metrics.
5. Saves the final model trained on all available training rows.
6. Saves machine-readable metrics for the dashboard.

It intentionally does NOT overwrite team_model.joblib because GitBugs does not
contain your application's frontend/backend/security team labels.
Keep the existing team model until a properly labelled team dataset is created.
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

HERE = Path(__file__).resolve().parent
DATA_PATH = HERE / "data" / "processed" / "bugs_training.csv"
MODEL_DIR = HERE / "models"
METRICS_DIR = HERE / "metrics"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


def build_pipeline() -> Pipeline:
    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.98,
                stop_words="english",
                sublinear_tf=True,
                max_features=200_000,
            ),
        ),
        ("clf", LinearSVC(class_weight="balanced", random_state=42)),
    ])


def main():
    df = pd.read_csv(DATA_PATH, low_memory=False)
    df["text"] = df["title"].fillna("") + " " + df["description"].fillna("")

    # A label needs at least two examples for a stratified split.
    counts = df["severity"].value_counts()
    df = df[df["severity"].isin(counts[counts >= 2].index)].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"],
        df["severity"],
        test_size=0.20,
        random_state=42,
        stratify=df["severity"],
    )

    evaluator = build_pipeline()
    evaluator.fit(X_train, y_train)
    preds = evaluator.predict(X_test)

    labels = sorted(df["severity"].unique())

    accuracy = accuracy_score(y_test, preds)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_test, preds, labels=labels, average="macro", zero_division=0
    )
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
        y_test, preds, labels=labels, average="weighted", zero_division=0
    )

    report = classification_report(
        y_test, preds, labels=labels, output_dict=True, zero_division=0
    )
    matrix = confusion_matrix(y_test, preds, labels=labels).tolist()

    metrics = {
        "model": "GitBugs severity classifier",
        "dataset": "GitBugs",
        "label_source": "Priority mapped to severity using documented proxy mapping",
        "rows_total": int(len(df)),
        "rows_train": int(len(X_train)),
        "rows_test": int(len(X_test)),
        "accuracy": round(float(accuracy), 6),
        "precision_macro": round(float(macro_p), 6),
        "recall_macro": round(float(macro_r), 6),
        "f1_macro": round(float(macro_f1), 6),
        "precision_weighted": round(float(weighted_p), 6),
        "recall_weighted": round(float(weighted_r), 6),
        "f1_weighted": round(float(weighted_f1), 6),
        "labels": labels,
        "classification_report": report,
        "confusion_matrix": matrix,
    }

    print("\n=== GitBugs Severity Model ===")
    print(classification_report(y_test, preds, labels=labels, zero_division=0))
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Macro F1: {macro_f1:.4f}")
    print(f"Weighted F1: {weighted_f1:.4f}")

    # Final production model uses all cleaned data.
    final_model = build_pipeline()
    final_model.fit(df["text"], df["severity"])

    model_path = MODEL_DIR / "severity_model_gitbugs.joblib"
    joblib.dump(final_model, model_path)

    metrics_path = METRICS_DIR / "severity_metrics.json"
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(f"\nSaved model: {model_path}")
    print(f"Saved metrics: {metrics_path}")
    print("\nThe existing team_model.joblib was intentionally left untouched.")


if __name__ == "__main__":
    main()

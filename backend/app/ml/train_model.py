"""
Bug Triage Classifier — Training Script
=========================================
Pillar 4 (Algorithmic Thinking) deliverable: designs and trains the
classification algorithm that automates bug triage before any of it
is wired into the app.

Approach
--------
Two independent multiclass classifiers share one TF-IDF text
representation built from the bug title + description:

  1. severity classifier  -> {trivial, minor, major, critical}
  2. team classifier      -> {frontend, backend, security}

Pipeline: TfidfVectorizer (uni+bigrams) -> LinearSVC
LinearSVC is chosen over e.g. k-NN or plain Naive Bayes because bug
reports are short, high-dimensional, sparse text — a linear margin
classifier handles that regime well and trains/predicts in
milliseconds, which matters for a "triage on submit" UX.

Run:
    python train_model.py
Produces:
    severity_model.joblib
    team_model.joblib
"""
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(HERE, "sample_data.csv")


def load_data():
    df = pd.read_csv(DATA_PATH)
    df["text"] = df["title"].fillna("") + " " + df["description"].fillna("")
    return df


def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            stop_words="english",
            sublinear_tf=True,
        )),
        ("clf", LinearSVC(class_weight="balanced")),
    ])


def train_and_evaluate(df, label_col, model_name):
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df[label_col],
        test_size=0.25, random_state=42, stratify=df[label_col]
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print(f"\n=== {label_col} classifier report ===")
    print(classification_report(y_test, preds, zero_division=0))

    # Refit on all data before saving so the shipped model uses every example
    final_pipeline = build_pipeline()
    final_pipeline.fit(df["text"], df[label_col])

    out_path = os.path.join(HERE, model_name)
    joblib.dump(final_pipeline, out_path)
    print(f"Saved {model_name}")
    return final_pipeline


def main():
    df = load_data()
    train_and_evaluate(df, "severity", "severity_model.joblib")
    train_and_evaluate(df, "team", "team_model.joblib")


if __name__ == "__main__":
    main()

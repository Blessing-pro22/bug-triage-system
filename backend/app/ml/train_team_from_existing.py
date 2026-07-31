"""
Optional compatibility trainer.

GitBugs does NOT provide frontend/backend/security labels, so do not fabricate
them from project names. This script retrains your existing team classifier
from the original sample_data.csv if you still need that model.
"""
from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

HERE = Path(__file__).resolve().parent
DATA = HERE / "sample_data.csv"
OUT = HERE / "models" / "team_model.joblib"

df = pd.read_csv(DATA)
df["text"] = df["title"].fillna("") + " " + df["description"].fillna("")

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        stop_words="english",
        sublinear_tf=True,
    )),
    ("clf", LinearSVC(class_weight="balanced")),
])

model.fit(df["text"], df["team"])
joblib.dump(model, OUT)
print(f"Saved existing team model -> {OUT}")

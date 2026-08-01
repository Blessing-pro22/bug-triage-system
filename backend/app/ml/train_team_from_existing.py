from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
import os
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

# Define target models folder
models_dir = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(models_dir, exist_ok=True)

# Save with compress=3 to avoid binary pickling corruptions
joblib.dump(model, os.path.join(models_dir, "team_model_gitbugs.joblib"), compress=3)
print("✅ Models saved cleanly with compression!")

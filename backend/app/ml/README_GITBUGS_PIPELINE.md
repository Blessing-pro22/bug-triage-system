# GitBugs training pipeline for Bug Triage System

This folder adds a reproducible pipeline for replacing the prototype training
data with real historical GitBugs bug reports.

## Source

GitBugs: https://github.com/av9ash/gitbugs

GitBugs contains 150,000+ bug reports from nine open-source projects and is
released under CC BY 4.0.

Citation:

Patil, Avinash. "GitBugs: Bug Reports for Duplicate Detection, Retrieval
Augmented Generation, Triage, and More." arXiv:2504.09651, 2025.

## Important label decision

GitBugs provides `Priority`, not a standardized `Severity` field.

Therefore this project derives the application's severity label using:

- blocker -> critical
- critical -> critical
- major -> major
- normal -> major
- minor -> minor
- trivial -> trivial

This is a proxy mapping and must be described as such in the project report.

GitBugs also does not contain the application's frontend/backend/security
team labels. Therefore this pipeline does NOT overwrite the existing team
model with invented labels.

## Windows setup

Open PowerShell in:

    backend/app/ml

Create/activate your virtual environment if you use one, then:

    pip install -r requirements-ml.txt

## 1. Download real data

Start with five projects:

    python download_gitbugs.py --projects cassandra firefox hadoop hbase vscode --limit 10000

This downloads up to 10,000 random rows per selected project.

For a larger run:

    python download_gitbugs.py --all --limit 50000

Or, after validating everything:

    python download_gitbugs.py --all

## 2. Clean and convert

    python prepare_gitbugs.py

Output:

    data/processed/bugs_training.csv

## 3. Train and evaluate

    python train_gitbugs.py

Outputs:

    models/severity_model_gitbugs.joblib
    metrics/severity_metrics.json

The metrics are genuine held-out test-set metrics calculated with
scikit-learn. They are NOT estimated or multiplied from accuracy.

## 4. Connect the new model to your application

Your current classifier expects:

    severity_model.joblib

Copy the generated model over the existing severity model:

    copy models\severity_model_gitbugs.joblib severity_model.joblib

PowerShell alternative:

    Copy-Item models\severity_model_gitbugs.joblib severity_model.joblib -Force

Do NOT replace team_model.joblib with the GitBugs severity model.

## 5. Verify

Run your backend normally and submit several bug reports.

Then verify that:

- severity is predicted
- team still predicts
- confidence is returned
- bugs are stored normally
- analytics still load

## Recommended next improvement

Your current classifier turns LinearSVC decision scores into a softmax-style
"confidence" percentage. That is a confidence-like score, not a calibrated
probability. For a future 10/10 version, use CalibratedClassifierCV and
evaluate calibration separately.

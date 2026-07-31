"""
Clean and convert GitBugs into the format used by Bug Triage System.

Important methodology:
GitBugs does not expose a standardized 'severity' field. It exposes Priority.
Therefore this script derives the application's severity label from Priority
using the explicit mapping below.

This is a documented proxy, NOT a claim that GitBugs contains severity labels.

Output columns:
    bug_id,title,description,priority,severity,project,status,resolution,created,resolved
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re

import pandas as pd

PRIORITY_TO_SEVERITY = {
    "blocker": "critical",
    "critical": "critical",
    "major": "major",
    "normal": "major",
    "minor": "minor",
    "trivial": "trivial",
    "p1": "critical",
    "p2": "major",
    "p3": "minor",
    "p4": "trivial",
    "p5": "trivial",
}

REQUIRED_ALIASES = {
    "summary": ["Summary", "summary", "Title", "title"],
    "issue_id": ["Issue id", "Issue ID", "issue_id", "id"],
    "priority": ["Priority", "priority"],
    "description": ["Description", "description", "Body", "body"],
    "status": ["Status", "status"],
    "resolution": ["Resolution", "resolution"],
    "created": ["Created", "created"],
    "resolved": ["Resolved", "resolved"],
    "project": ["Project", "project"],
}


def find_column(df: pd.DataFrame, aliases: list[str]) -> str | None:
    for name in aliases:
        if name in df.columns:
            return name
    lowered = {str(c).strip().lower(): c for c in df.columns}
    for name in aliases:
        if name.strip().lower() in lowered:
            return lowered[name.strip().lower()]
    return None


def clean_text(value) -> str:
    if pd.isna(value):
        return ""
    text = str(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def process_file(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, low_memory=False)

    cols = {}
    for target, aliases in REQUIRED_ALIASES.items():
        col = find_column(df, aliases)
        cols[target] = col

    missing = [k for k, v in cols.items() if v is None and k in ("summary", "issue_id", "priority", "description")]
    if missing:
        raise ValueError(f"{path.name}: missing required columns: {missing}. Found: {list(df.columns)}")

    out = pd.DataFrame()
    out["bug_id"] = df[cols["issue_id"]].astype(str)
    out["title"] = df[cols["summary"]].map(clean_text)
    out["description"] = df[cols["description"]].map(clean_text)
    out["priority"] = df[cols["priority"]].map(clean_text).str.lower()
    out["severity"] = out["priority"].map(PRIORITY_TO_SEVERITY)

    for field in ("status", "resolution", "created", "resolved", "project"):
        if cols[field]:
            out[field] = df[cols[field]]
        else:
            out[field] = ""

    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", default="data/raw")
    parser.add_argument("--output", default="data/processed/bugs_training.csv")
    parser.add_argument("--min-text", type=int, default=20)
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    paths = sorted(input_dir.glob("*.csv"))
    if not paths:
        raise SystemExit(f"No CSV files found in {input_dir}")

    frames = []
    for path in paths:
        try:
            frames.append(process_file(path))
            print(f"Processed {path.name}")
        except Exception as exc:
            print(f"[SKIP] {path.name}: {exc}")

    if not frames:
        raise SystemExit("No input files could be processed.")

    df = pd.concat(frames, ignore_index=True)

    df["text"] = (df["title"].fillna("") + " " + df["description"].fillna("")).str.strip()
    df = df[df["title"].str.len() > 0]
    df = df[df["text"].str.len() >= args.min_text]
    df = df[df["severity"].notna()]
    df = df.drop_duplicates(subset=["bug_id"])
    df = df.drop_duplicates(subset=["text"])

    # Keep labels that have enough examples for a stratified train/test split.
    counts = df["severity"].value_counts()
    valid_labels = counts[counts >= 5].index
    df = df[df["severity"].isin(valid_labels)]

    df = df.drop(columns=["text"])
    df.to_csv(output, index=False)

    print("\n=== Prepared GitBugs dataset ===")
    print(f"Rows: {len(df):,}")
    print("\nSeverity distribution:")
    print(df["severity"].value_counts())
    print(f"\nSaved: {output}")


if __name__ == "__main__":
    main()

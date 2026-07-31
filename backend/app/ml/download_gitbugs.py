"""
Download real GitBugs data from the official GitBugs GitHub repository.

Default:
    downloads the combined CSV for the selected projects.

Examples:
    python download_gitbugs.py --projects cassandra firefox
    python download_gitbugs.py --projects cassandra --limit 10000
    python download_gitbugs.py --all --limit 50000

The script does NOT invent labels. GitBugs Priority is preserved and is later
mapped to the application's severity field by prepare_gitbugs.py.
"""
from __future__ import annotations

import argparse
import io
from pathlib import Path

import pandas as pd
import requests

BASE = "https://raw.githubusercontent.com/av9ash/gitbugs/main"

PROJECT_FILES = {
    "cassandra": "cassandra/cassandra_bugs-combined.csv",
    "firefox": "firefox/Firefox_bugs-combined.csv",
    "hadoop": "hadoop/Hadoop_bugs-combined.csv",
    "hbase": "hbase/Hbase_bugs-combined.csv",
    "mozilla_core": "mozilla_core/Mozilla_Core_bugs-combined.csv",
    "vscode": "vscode/VSCode_bugs-combined.csv",
    "seamonkey": "seamonkey/Seamonkey_bugs-combined.csv",
    "spark": "spark/Spark_bugs-combined.csv",
    "thunderbird": "thunderbird/Thunderbird_bugs-combined.csv",
}

DEFAULT_PROJECTS = ["cassandra", "firefox", "hadoop", "hbase", "vscode"]

HERE = Path(__file__).resolve().parent
RAW_DIR = HERE / "data" / "raw"


def download_project(project: str, limit: int | None = None) -> Path:
    url = f"{BASE}/{PROJECT_FILES[project]}"
    print(f"Downloading {project}: {url}")

    response = requests.get(url, timeout=120)
    response.raise_for_status()

    out = RAW_DIR / f"{project}_bugs.csv"

    # Read in pandas so --limit works without storing a second giant file.
    df = pd.read_csv(io.BytesIO(response.content), low_memory=False)

    if limit is not None and len(df) > limit:
        df = df.sample(n=limit, random_state=42)

    df.to_csv(out, index=False)
    print(f"Saved {len(df):,} rows -> {out}")
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--projects", nargs="+", choices=PROJECT_FILES.keys())
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    projects = list(PROJECT_FILES.keys()) if args.all else (args.projects or DEFAULT_PROJECTS)

    RAW_DIR.mkdir(parents=True, exist_ok=True)

    for project in projects:
        try:
            download_project(project, args.limit)
        except Exception as exc:
            print(f"[ERROR] {project}: {exc}")

    print("\nDownload complete.")
    print("Next step:")
    print("  python prepare_gitbugs.py --input-dir data/raw --output data/processed/bugs_training.csv")


if __name__ == "__main__":
    main()

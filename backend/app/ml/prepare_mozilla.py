import pandas as pd
import re
from pathlib import Path

# Paths
DATA_DIR = Path("app/ml/data") if Path("app").exists() else Path("backend/app/ml/data")
RAW_MOZILLA = DATA_DIR / "raw/sample_mozilla_core.csv"
RAW_CASSANDRA = DATA_DIR / "raw/cassandra_bugs.csv"  # or your local cassandra file name
PROCESSED_PATH = DATA_DIR / "processed/clean_combined.csv"

COMPONENT_TEAM_MAP = {
    "DOM": "frontend", "CSS": "frontend", "Layout": "frontend", "Graphics": "frontend",
    "JS Engine": "backend", "Networking": "backend", "Storage": "backend", "Database": "backend",
    "Security": "security", "Crypto": "security",
    "Mobile": "mobile", "android": "mobile",
    "app": "mobile", "ios": "mobile","camera": "mobile"
}

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def prepare_combined_data():
    PROCESSED_PATH.parent.mkdir(parents=True, exist_ok=True)
    dfs = []

    # 1. Load Mozilla Data
    if RAW_MOZILLA.exists():
        print(f"Loading Mozilla dataset from {RAW_MOZILLA}...")
        df_moz = pd.read_csv(RAW_MOZILLA, low_memory=False)
        df_moz['Summary'] = df_moz['Summary'].fillna('')
        df_moz['Description'] = df_moz['Description'].fillna('')
        df_moz['full_text'] = (df_moz['Summary'] + " " + df_moz['Description']).apply(clean_text)
        df_moz['team'] = df_moz['Component'].map(COMPONENT_TEAM_MAP).fillna('backend')
        df_moz['severity'] = df_moz['Severity'].astype(str).str.lower().str.strip()
        df_moz = df_moz[~df_moz['severity'].isin(['nan', '--', 'n/a', 'none', ''])]
        dfs.append(df_moz[['full_text', 'severity', 'team']])

    # 2. Load Cassandra Data (if present)
    if RAW_CASSANDRA.exists():
        print(f"Loading Cassandra dataset from {RAW_CASSANDRA}...")
        df_cas = pd.read_csv(RAW_CASSANDRA, low_memory=False)
        # Adapt column names if your cassandra file uses title/description or summary/description
        title_col = 'title' if 'title' in df_cas.columns else 'summary'
        df_cas[title_col] = df_cas[title_col].fillna('')
        df_cas['description'] = df_cas['description'].fillna('')
        df_cas['full_text'] = (df_cas[title_col] + " " + df_cas['description']).apply(clean_text)
        
        # Standardize severity & team column names
        sev_col = 'severity' if 'severity' in df_cas.columns else 'priority'
        df_cas['severity'] = df_cas[sev_col].astype(str).str.lower().str.strip()
        df_cas['team'] = df_cas['team'].astype(str).str.lower().str.strip() if 'team' in df_cas.columns else 'backend'
        dfs.append(df_cas[['full_text', 'severity', 'team']])

    if not dfs:
        raise FileNotFoundError("No raw datasets found in app/ml/data/raw/")

    # Combine all loaded dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    combined_df = combined_df[combined_df['full_text'].str.len() > 10].copy()

    combined_df.to_csv(PROCESSED_PATH, index=False)
    print(f"\n✅ Combined dataset saved to {PROCESSED_PATH} ({len(combined_df)} total records)")

if __name__ == "__main__":
    prepare_combined_data()
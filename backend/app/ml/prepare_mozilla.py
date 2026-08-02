import pandas as pd
import re
from pathlib import Path

# Paths
DATA_DIR = Path("app/ml/data") if Path("app").exists() else Path("backend/app/ml/data")
RAW_MOZILLA = DATA_DIR / "raw/sample_mozilla_core.csv"
RAW_CASSANDRA = DATA_DIR / "raw/cassandra_bugs.csv"
PROCESSED_PATH = DATA_DIR / "processed/clean_combined.csv"

# Component -> Team mapping for Mozilla
COMPONENT_TEAM_MAP = {
    # Frontend / UI
    "DOM": "Frontend", "CSS": "Frontend", "Layout": "Frontend", "Graphics": "Frontend", "Theme": "Frontend",
    # Backend / Engine / Storage
    "JS Engine": "Backend", "Networking": "Backend", "Storage": "Backend", "IPC": "Backend", "Database": "Backend",
    # Security
    "Security": "Security", "Crypto": "Security", "PSM": "Security",
    # Mobile
    "Mobile": "Mobile", "Firefox for Android": "Mobile", "Android": "Mobile", "iOS": "Mobile", "GeckoView": "Mobile", "Widget": "Mobile", "app": "Mobile", "camera": "Mobile", "touch": "Mobile" , 
}

# Rule-based fallback for Cassandra (since Cassandra is a backend database project)
def infer_team_from_text(text: str) -> str:
    text = text.lower()
    if any(k in text for k in ["ui", "css", "layout", "web", "frontend", "display", "console"]):
        return "Frontend"
    elif any(k in text for k in ["auth", "security", "ssl", "tls", "permission", "encryption", "crypto"]):
        return "Security"
    elif any(k in text for k in ["mobile", "android", "ios", "apk", "touch", "camera"]):
        return "Mobile"
    return "Backend"  # Default for Cassandra distributed DB issues

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

    # 1. Process Mozilla Data (if available)
    if RAW_MOZILLA.exists():
        print(f"Loading Mozilla dataset from {RAW_MOZILLA}...")
        df_moz = pd.read_csv(RAW_MOZILLA, low_memory=False)
        
        summary_val = df_moz['Summary'].fillna('') if 'Summary' in df_moz.columns else ''
        desc_val = df_moz['Description'].fillna('') if 'Description' in df_moz.columns else ''
        
        df_moz['full_text'] = (summary_val + " " + desc_val).apply(clean_text)
        
        if 'Component' in df_moz.columns:
            df_moz['team'] = df_moz['Component'].map(COMPONENT_TEAM_MAP).fillna('Backend')
        else:
            df_moz['team'] = 'Backend'
            
        sev_col = 'Severity' if 'Severity' in df_moz.columns else 'Priority'
        df_moz['severity'] = df_moz[sev_col].astype(str).str.lower().str.strip()
        df_moz = df_moz[~df_moz['severity'].isin(['nan', '--', 'n/a', 'none', ''])]
        
        dfs.append(df_moz[['full_text', 'severity', 'team']])

    # 2. Process Cassandra Data
    if RAW_CASSANDRA.exists():
        print(f"Loading Cassandra dataset from {RAW_CASSANDRA}...")
        df_cas = pd.read_csv(RAW_CASSANDRA, low_memory=False)
        
        summary_val = df_cas['Summary'].fillna('') if 'Summary' in df_cas.columns else ''
        desc_val = df_cas['Description'].fillna('') if 'Description' in df_cas.columns else ''
        
        df_cas['full_text'] = (summary_val + " " + desc_val).apply(clean_text)
        
        # Severity from Priority
        df_cas['severity'] = df_cas['Priority'].astype(str).str.lower().str.strip()
        df_cas = df_cas[~df_cas['severity'].isin(['nan', '--', 'n/a', 'none', ''])]

        # Team inference from text
        df_cas['team'] = df_cas['full_text'].apply(infer_team_from_text)
        
        dfs.append(df_cas[['full_text', 'severity', 'team']])

    if not dfs:
        raise FileNotFoundError("No raw datasets found!")

    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    combined_df = combined_df[combined_df['full_text'].str.len() > 10].copy()

    combined_df.to_csv(PROCESSED_PATH, index=False)
    print(f"\n✅ Dataset successfully prepared and saved to: {PROCESSED_PATH}")
    print(f"Total valid training samples: {len(combined_df)}")
    print("\nTeam Distribution in Training Set:")
    print(combined_df['team'].value_counts())
    print("\nSeverity Distribution in Training Set:")
    print(combined_df['severity'].value_counts())

if __name__ == "__main__":
    prepare_combined_data()
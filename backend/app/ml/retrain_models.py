import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

def train_models():
    """Train improved ML models with better data."""
    
    # Load training data
    data_path = os.path.join(os.path.dirname(__file__), "training_data_improved.csv")
    df = pd.read_csv(data_path)
    
    print(f"Training with {len(df)} examples")
    print(f"Severity distribution:\n{df['severity'].value_counts()}")
    print(f"Team distribution:\n{df['team'].value_counts()}")
    
    # Combine title and description for better feature extraction
    df['combined_text'] = df['title'] + ' ' + df['description']
    
    # Train severity model
    print("\n=== Training Severity Model ===")
    X_sev = df['combined_text']
    y_sev = df['severity']
    
    # Use TF-IDF with better parameters for severity
    vectorizer_sev = TfidfVectorizer(
        max_features=2000,
        ngram_range=(1, 2),  # Use bigrams for better context
        min_df=1,
        max_df=0.9,
        stop_words='english'
    )
    
    X_sev_tfidf = vectorizer_sev.fit_transform(X_sev)
    
    # Split for evaluation
    X_train_sev, X_test_sev, y_train_sev, y_test_sev = train_test_split(
        X_sev_tfidf, y_sev, test_size=0.2, random_state=42, stratify=y_sev
    )
    
    # Train logistic regression with balanced class weights
    severity_model = LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42
    )
    
    severity_model.fit(X_train_sev, y_train_sev)
    
    # Evaluate
    y_pred_sev = severity_model.predict(X_test_sev)
    print("Severity Model Performance:")
    print(classification_report(y_test_sev, y_pred_sev))
    
    # Train team model
    print("\n=== Training Team Model ===")
    X_team = df['combined_text']
    y_team = df['team']
    
    # Use TF-IDF for team classification
    vectorizer_team = TfidfVectorizer(
        max_features=1500,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.9,
        stop_words='english'
    )
    
    X_team_tfidf = vectorizer_team.fit_transform(X_team)
    
    # Split for evaluation
    X_train_team, X_test_team, y_train_team, y_test_team = train_test_split(
        X_team_tfidf, y_team, test_size=0.2, random_state=42, stratify=y_team
    )
    
    # Train logistic regression
    team_model = LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42
    )
    
    team_model.fit(X_train_team, y_train_team)
    
    # Evaluate
    y_pred_team = team_model.predict(X_test_team)
    print("Team Model Performance:")
    print(classification_report(y_test_team, y_pred_team))
    
    # Save models
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    severity_model_path = os.path.join(models_dir, "severity_model_improved.joblib")
    team_model_path = os.path.join(models_dir, "team_model_improved.joblib")
    
    joblib.dump((severity_model, vectorizer_sev), severity_model_path)
    joblib.dump((team_model, vectorizer_team), team_model_path)
    
    print(f"\nModels saved to:")
    print(f"  - {severity_model_path}")
    print(f"  - {team_model_path}")
    
    return severity_model, vectorizer_sev, team_model, vectorizer_team

if __name__ == "__main__":
    train_models()

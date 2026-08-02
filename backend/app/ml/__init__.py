import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load ML models
models_dir = os.path.join(os.path.dirname(__file__), "models")

# Try to load improved severity model first, then fallback to original
severity_model_improved_path = os.path.join(models_dir, "severity_model_improved.joblib")
severity_model_path = os.path.join(models_dir, "severity_model.joblib")
severity_model_gitbugs_path = os.path.join(models_dir, "severity_model_gitbugs.joblib")

if os.path.exists(severity_model_improved_path):
    try:
        severity_model, severity_vectorizer = joblib.load(severity_model_improved_path)
        print(f"✅ Loaded improved severity model: {severity_model_improved_path}")
    except Exception as e:
        print(f"❌ Failed to load improved model at {severity_model_improved_path}: {e}")
        severity_model = None
        severity_vectorizer = None
elif os.path.exists(severity_model_path):
    try:
        severity_model, severity_vectorizer = joblib.load(severity_model_path)
        print(f"✅ Loaded model successfully: {severity_model_path}")
    except Exception as e:
        print(f"❌ Failed to load model binary at {severity_model_path}: {e}")
        severity_model = None
        severity_vectorizer = None
elif os.path.exists(severity_model_gitbugs_path):
    try:
        severity_model, severity_vectorizer = joblib.load(severity_model_gitbugs_path)
        print(f"✅ Loaded model successfully: {severity_model_gitbugs_path}")
    except Exception as e:
        print(f"❌ Failed to load model binary at {severity_model_gitbugs_path}: {e}")
        severity_model = None
        severity_vectorizer = None
else:
    print(f"❌ Model file missing at: {severity_model_path}")
    severity_model = None
    severity_vectorizer = None

# Try to load improved team model first, then fallback to original
team_model_improved_path = os.path.join(models_dir, "team_model_improved.joblib")
team_model_path = os.path.join(models_dir, "team_model.joblib")
team_model_gitbugs_path = os.path.join(models_dir, "team_model_gitbugs.joblib")

if os.path.exists(team_model_improved_path):
    try:
        team_model, team_vectorizer = joblib.load(team_model_improved_path)
        print(f"✅ Loaded improved team model: {team_model_improved_path}")
    except Exception as e:
        print(f"❌ Failed to load improved model at {team_model_improved_path}: {e}")
        team_model = None
        team_vectorizer = None
elif os.path.exists(team_model_path):
    try:
        team_model, team_vectorizer = joblib.load(team_model_path)
        print(f"✅ Loaded model successfully: {team_model_path}")
    except Exception as e:
        print(f"❌ Failed to load model binary at {team_model_path}: {e}")
        team_model = None
        team_vectorizer = None
elif os.path.exists(team_model_gitbugs_path):
    try:
        team_model, team_vectorizer = joblib.load(team_model_gitbugs_path)
        print(f"✅ Loaded model successfully: {team_model_gitbugs_path}")
    except Exception as e:
        print(f"❌ Failed to load model binary at {team_model_gitbugs_path}: {e}")
        team_model = None
        team_vectorizer = None
else:
    print(f"❌ Model file missing at: {team_model_path}")
    team_model = None
    team_vectorizer = None

def predict_severity(title: str, description: str):
    if severity_model is None or severity_vectorizer is None:
        return "major", 0.50
    text = f"{title} {description}"
    try:
        vec_text = severity_vectorizer.transform([text])
        prediction = severity_model.predict(vec_text)[0]
        
        # Calculate decision score confidence safely for LinearSVC
        if hasattr(severity_model, "predict_proba"):
            confidence = float(max(severity_model.predict_proba(vec_text)[0]))
        elif hasattr(severity_model, "decision_function"):
            scores = severity_model.decision_function(vec_text)[0]
            if isinstance(scores, np.ndarray) and scores.ndim > 0:
                exp_scores = np.exp(scores - np.max(scores))
                confidence = float(np.max(exp_scores / exp_scores.sum()))
            else:
                confidence = 0.85
        else:
            confidence = 0.85

        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"❌ Severity prediction error: {e}")
        return "major", 0.50

def predict_team(title: str, description: str):
    if team_model is None or team_vectorizer is None:
        return "backend", 0.50
    text = f"{title} {description}"
    try:
        vec_text = team_vectorizer.transform([text])
        prediction = team_model.predict(vec_text)[0]
        
        # Calculate decision score confidence safely for LinearSVC
        if hasattr(team_model, "predict_proba"):
            confidence = float(max(team_model.predict_proba(vec_text)[0]))
        elif hasattr(team_model, "decision_function"):
            scores = team_model.decision_function(vec_text)[0]
            if isinstance(scores, np.ndarray) and scores.ndim > 0:
                exp_scores = np.exp(scores - np.max(scores))
                confidence = float(np.max(exp_scores / exp_scores.sum()))
            else:
                confidence = 0.85
        else:
            confidence = 0.85

        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"❌ Team prediction error: {e}")
        return "backend", 0.50

# Initialize TF-IDF vectorizer for similarity search
tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')

def find_similar_bugs(title: str, description: str, historical_bugs: list, top_k: int = 5):
    """
    Find similar historical bugs using TF-IDF cosine similarity.
    
    Args:
        title: Current bug title
        description: Current bug description
        historical_bugs: List of historical bug objects with 'title' and 'description'
        top_k: Number of similar bugs to return
    
    Returns:
        List of tuples (bug, similarity_score) sorted by similarity
    """
    if not historical_bugs or len(historical_bugs) == 0:
        return []
    
    # Prepare current bug text
    current_text = f"{title} {description}"
    
    # Prepare historical bug texts
    historical_texts = [f"{bug.get('title', '')} {bug.get('description', '')}" for bug in historical_bugs]
    
    # Add current text to the corpus for vectorization
    all_texts = [current_text] + historical_texts
    
    try:
        # Fit and transform all texts
        tfidf_matrix = tfidf_vectorizer.fit_transform(all_texts)
        
        # Get similarity scores between current bug (index 0) and all historical bugs
        similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        
        # Get top-k most similar bugs
        top_indices = np.argsort(similarity_scores)[::-1][:top_k]
        
        # Return (bug, score) pairs
        similar_bugs = []
        for idx in top_indices:
            if similarity_scores[idx] > 0.1:  # Only return bugs with meaningful similarity
                similar_bugs.append((historical_bugs[idx], float(similarity_scores[idx])))
        
        return similar_bugs
    except Exception as e:
        print(f"Similarity search error: {e}")
        return []

def get_prediction_explanation(title: str, description: str, severity: str, team: str):
    """
    Generate explanation for ML predictions based on text features.
    This provides transparency into why the model made certain predictions.
    
    Args:
        title: Bug title
        description: Bug description
        severity: Predicted severity
        team: Predicted team
    
    Returns:
        Dictionary with explanation details
    """
    text = f"{title} {description}".lower()
    
    # Feature keywords that influence predictions
    severity_keywords = {
        'critical': ['crash', 'security', 'breach', 'exploit', 'vulnerability', 'hack', 'data loss', 'corruption'],
        'major': ['broken', 'fail', 'error', 'exception', 'timeout', 'performance', 'slow', 'memory'],
        'minor': ['typo', 'spelling', 'cosmetic', 'ui', 'display', 'format', 'style'],
        'trivial': ['documentation', 'comment', 'whitespace', 'naming', 'refactor']
    }
    
    team_keywords = {
        'frontend': ['ui', 'css', 'javascript', 'react', 'vue', 'angular', 'component', 'button', 'form', 'modal', 'responsive'],
        'backend': ['api', 'database', 'server', 'endpoint', 'auth', 'login', 'session', 'cache', 'queue', 'worker'],
        'security': ['auth', 'login', 'password', 'token', 'permission', 'access', 'role', 'encryption', 'ssl', 'https']
    }
    
    # Find matching keywords
    severity_matches = []
    for keyword in severity_keywords.get(severity, []):
        if keyword in text:
            severity_matches.append(keyword)
    
    team_matches = []
    for keyword in team_keywords.get(team, []):
        if keyword in text:
            team_matches.append(keyword)
    
    return {
        'severity': {
            'predicted': severity,
            'key_factors': severity_matches[:5],  # Top 5 matching keywords
            'confidence_reason': 'Based on presence of severity-related keywords in bug description'
        },
        'team': {
            'predicted': team,
            'key_factors': team_matches[:5],  # Top 5 matching keywords
            'confidence_reason': 'Based on technical domain keywords in bug description'
        }
    }

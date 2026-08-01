import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

def load_model_file(filename: str):
    path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(path):
        try:
            model = joblib.load(path)
            print(f"✅ Loaded model successfully: {path}")
            return model
        except Exception as e:
            print(f"❌ Failed to load model binary at {path}: {e}")
            return None
    print(f"❌ Model file missing at: {path}")
    return None

severity_model = load_model_file("severity_model_gitbugs.joblib") or load_model_file("severity_model.joblib")
team_model = load_model_file("team_model_gitbugs.joblib") or load_model_file("team_model.joblib")

def predict_severity(title: str, description: str):
    if not severity_model:
        return "major", 0.85
    text = f"{title} {description}"
    try:
        prediction = severity_model.predict([text])[0]
        confidence = float(max(severity_model.predict_proba([text])[0])) if hasattr(severity_model, "predict_proba") else 0.85
        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"Severity prediction error: {e}")
        return "major", 0.50

def predict_team(title: str, description: str):
    if not team_model:
        return "backend", 0.85
    text = f"{title} {description}"
    try:
        prediction = team_model.predict([text])[0]
        confidence = float(max(team_model.predict_proba([text])[0])) if hasattr(team_model, "predict_proba") else 0.85
        return str(prediction).lower(), round(confidence, 2)
    except Exception as e:
        print(f"Team prediction error: {e}")
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
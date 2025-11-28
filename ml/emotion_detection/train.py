# ML - Emotion Detection Model Training

import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

class EmotionDetector:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.is_trained = False
    
    def train(self, X_train, y_train):
        """Train emotion detection model"""
        self.model.fit(X_train, y_train)
        self.is_trained = True
        return {"status": "trained"}
    
    def predict(self, X):
        """Predict emotion from features"""
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        return self.model.predict(X)
    
    def save(self, path="./ml/models/emotion_model.pkl"):
        """Save trained model"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self.model, f)
        return {"saved": path}

if __name__ == "__main__":
    detector = EmotionDetector()
    # Synthetic data for demo
    X_train = np.random.rand(100, 5)  # 5 features: HR, HRV, timestamp, etc.
    y_train = np.random.randint(0, 2, 100)  # Binary: calm (0) or stressed (1)
    
    detector.train(X_train, y_train)
    detector.save()
    print("Emotion model trained and saved")

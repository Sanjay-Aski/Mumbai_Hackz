# ML - Spending Prediction Model

import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle

class SpendingPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
    
    def train(self, X_train, y_train):
        """Train spending prediction model"""
        X_scaled = self.scaler.fit_transform(X_train)
        # Placeholder: use a simple linear regression or LSTM
        from sklearn.linear_model import LinearRegression
        self.model = LinearRegression()
        self.model.fit(X_scaled, y_train)
        return {"status": "trained"}
    
    def predict(self, X):
        """Predict spending amount"""
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def save(self, path="./ml/models/spending_model.pkl"):
        """Save trained model"""
        with open(path, 'wb') as f:
            pickle.dump((self.model, self.scaler), f)
        return {"saved": path}

if __name__ == "__main__":
    predictor = SpendingPredictor()
    X_train = np.random.rand(100, 10)
    y_train = np.random.rand(100) * 10000
    
    predictor.train(X_train, y_train)
    predictor.save()
    print("Spending model trained and saved")

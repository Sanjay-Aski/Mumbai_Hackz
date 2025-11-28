# ML - Common Feature Engineering

import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle

class FeatureEngineering:
    def __init__(self):
        self.scaler = StandardScaler()
    
    @staticmethod
    def extract_time_features(timestamp):
        """Extract time-based features"""
        from datetime import datetime
        dt = datetime.fromisoformat(timestamp)
        return {
            "hour": dt.hour,
            "day_of_week": dt.weekday(),
            "is_weekend": dt.weekday() >= 5,
            "month": dt.month
        }
    
    @staticmethod
    def calculate_stress_score(hr: int, hrv: float) -> float:
        """Calculate stress score from HR and HRV"""
        # Simple formula: higher HR + lower HRV = more stress
        hr_normalized = (hr - 60) / 40  # Assume 60-100 resting range
        hrv_normalized = (100 - hrv) / 80  # Assume 20-100 HRV range
        
        stress = (hr_normalized * 0.4) + (hrv_normalized * 0.6)
        return min(1.0, max(0.0, stress))
    
    def scale_features(self, X):
        """Standardize features"""
        return self.scaler.fit_transform(X)

if __name__ == "__main__":
    fe = FeatureEngineering()
    
    # Test stress calculation
    stress = fe.calculate_stress_score(hr=95, hrv=25)
    print(f"Stress score: {stress:.2f}")
    
    # Test time features
    time_feat = fe.extract_time_features("2025-11-28T14:30:00")
    print(f"Time features: {time_feat}")

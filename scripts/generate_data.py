# Scripts - Generate Synthetic Data for Testing

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_synthetic_biometric_data(n_samples=1000):
    """Generate synthetic wearable biometric data"""
    timestamps = [datetime.now() - timedelta(hours=i) for i in range(n_samples)]
    data = {
        "timestamp": timestamps,
        "heart_rate": np.random.normal(80, 15, n_samples).astype(int),
        "hrv": np.random.normal(40, 10, n_samples),
        "stress_level": np.random.choice(["calm", "medium", "stressed"], n_samples)
    }
    return pd.DataFrame(data)

def generate_synthetic_spending_data(n_samples=500):
    """Generate synthetic spending data"""
    merchants = ["Amazon", "Myntra", "Flipkart", "Swiggy", "Uber"]
    categories = ["Shopping", "Food", "Transport", "Entertainment"]
    data = {
        "timestamp": [datetime.now() - timedelta(days=i) for i in range(n_samples)],
        "amount": np.random.exponential(2000, n_samples),
        "merchant": np.random.choice(merchants, n_samples),
        "category": np.random.choice(categories, n_samples),
        "emotion_state": np.random.choice(["calm", "stressed", "anxious"], n_samples)
    }
    return pd.DataFrame(data)

if __name__ == "__main__":
    bio_data = generate_synthetic_biometric_data()
    spend_data = generate_synthetic_spending_data()
    
    bio_data.to_csv("scripts/synthetic_biometric.csv", index=False)
    spend_data.to_csv("scripts/synthetic_spending.csv", index=False)
    
    print("Synthetic data generated successfully")
    print(f"Biometric data: {bio_data.shape}")
    print(f"Spending data: {spend_data.shape}")

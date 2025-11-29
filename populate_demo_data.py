#!/usr/bin/env python3
"""Populate database with demo data for testing"""

import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

sys.path.insert(0, 'finsphere-backend')

from app.core.database import SessionLocal, engine, Base
from app.models.database import (
    User, BiometricReading, Transaction, Intervention, GigWork, UserPermissions
)

def create_demo_data():
    """Create demo user with sample data"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@finsphere.com").first()
        if demo_user:
            print("✓ Demo user already exists")
            return
        
        # Create demo user
        demo_user = User(
            email="demo@finsphere.com",
            full_name="Demo User",
            hashed_password="$2b$12$demo",  # Dummy hash
            age=28,
            profession="Software Developer",
            location="Mumbai",
            income_monthly=80000,
            savings_target=500000,
            stress_baseline=0.3,
            created_at=datetime.utcnow()
        )
        db.add(demo_user)
        db.flush()
        
        print(f"✓ Created demo user: {demo_user.email}")
        
        # Add biometric readings for today
        now = datetime.utcnow()
        for i in range(5):
            reading = BiometricReading(
                user_id=demo_user.id,
                heart_rate=72 + (i * 5),
                hrv_ms=45.0 - (i * 2),
                stress_score=0.2 + (i * 0.1),
                source="demo_device",
                timestamp=now - timedelta(hours=i)
            )
            db.add(reading)
        
        print("✓ Added 5 biometric readings")
        
        # Add sample transactions
        transactions = [
            {"amount": 599, "merchant": "Amazon", "category": "Shopping"},
            {"amount": 1200, "merchant": "Zomato", "category": "Food"},
            {"amount": 2500, "merchant": "Myntra", "category": "Clothing"},
            {"amount": 450, "merchant": "Swiggy", "category": "Food"},
        ]
        
        for i, txn in enumerate(transactions):
            transaction = Transaction(
                user_id=demo_user.id,
                amount=txn["amount"],
                merchant=txn["merchant"],
                category=txn["category"],
                stress_at_time=0.3 + (i * 0.1),
                timestamp=now - timedelta(days=i)
            )
            db.add(transaction)
        
        print(f"✓ Added {len(transactions)} transactions")
        
        # Add sample interventions
        intervention = Intervention(
            user_id=demo_user.id,
            url="https://www.amazon.in/s?k=laptop",
            reason="Impulse purchase detected during elevated stress",
            severity="medium",
            user_action="snooze",
            delay_minutes=5,
            effectiveness="prevented_purchase",
            timestamp=now - timedelta(hours=2)
        )
        db.add(intervention)
        
        print("✓ Added intervention record")
        
        # Add permissions
        permissions = UserPermissions(
            user_id=demo_user.id,
            biometric_data=True,
            browsing_behavior=True,
            intervention_analytics=True
        )
        db.add(permissions)
        
        print("✓ Added user permissions")
        
        db.commit()
        print("\n✅ Demo data population complete!")
        print(f"   User: demo@finsphere.com")
        print(f"   User ID: {demo_user.id}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()

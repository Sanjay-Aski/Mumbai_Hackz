"""
Fake Data Stream Generator
Generates realistic real-time data for email sentiment and biometric readings
"""

import asyncio
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, AsyncGenerator
import json
from dataclasses import dataclass, asdict
from faker import Faker

fake = Faker()

@dataclass
class EmailData:
    """Email sentiment data structure"""
    timestamp: str
    sender: str
    subject: str
    content_preview: str
    sentiment_score: float  # -1 to 1
    sentiment_label: str   # positive, negative, neutral
    stress_trigger: bool
    priority: str         # low, medium, high
    category: str        # work, finance, personal, shopping, etc.
    emotional_impact: float  # 0 to 10
    
class BiometricData:
    """Biometric data structure"""
    def __init__(self):
        self.timestamp = datetime.now().isoformat()
        self.heart_rate = 0
        self.hrv_ms = 0
        self.stress_level = 0
        self.activity_level = ""
        self.recovery_score = 0
        self.sleep_quality = 0

class FakeDataStreamGenerator:
    """Generates realistic fake data streams"""
    
    def __init__(self):
        self.fake = Faker()
        
        # Email templates for different categories
        self.email_templates = {
            'work': [
                {"subject": "Urgent: Project Deadline Tomorrow", "stress": 0.8, "sentiment": -0.6},
                {"subject": "Meeting Rescheduled", "stress": 0.3, "sentiment": -0.2},
                {"subject": "Great job on the presentation!", "stress": 0.1, "sentiment": 0.8},
                {"subject": "Performance Review Scheduled", "stress": 0.7, "sentiment": -0.1},
                {"subject": "Team lunch invitation", "stress": 0.1, "sentiment": 0.5},
            ],
            'finance': [
                {"subject": "Credit Card Payment Due", "stress": 0.9, "sentiment": -0.7},
                {"subject": "Your investment gained 5%", "stress": 0.1, "sentiment": 0.9},
                {"subject": "Monthly Bank Statement", "stress": 0.4, "sentiment": 0.0},
                {"subject": "Loan Approval Notification", "stress": 0.6, "sentiment": 0.3},
                {"subject": "Suspicious Account Activity", "stress": 0.95, "sentiment": -0.8},
            ],
            'shopping': [
                {"subject": "Flash Sale: 50% Off Everything!", "stress": 0.5, "sentiment": 0.4},
                {"subject": "Your cart is waiting...", "stress": 0.3, "sentiment": 0.1},
                {"subject": "Order Shipped Successfully", "stress": 0.1, "sentiment": 0.7},
                {"subject": "Limited Time Offer Expires Soon", "stress": 0.6, "sentiment": 0.2},
                {"subject": "Product Back in Stock!", "stress": 0.4, "sentiment": 0.6},
            ],
            'personal': [
                {"subject": "Happy Birthday from Mom!", "stress": 0.1, "sentiment": 0.9},
                {"subject": "Doctor Appointment Reminder", "stress": 0.4, "sentiment": -0.1},
                {"subject": "Weekend Plans?", "stress": 0.1, "sentiment": 0.6},
                {"subject": "Family Dinner This Sunday", "stress": 0.2, "sentiment": 0.7},
                {"subject": "Your subscription expires tomorrow", "stress": 0.3, "sentiment": -0.2},
            ]
        }
        
        # Biometric patterns based on time of day
        self.biometric_patterns = {
            'morning': {'hr_range': (60, 80), 'hrv_range': (25, 45), 'stress_base': 0.3},
            'work_hours': {'hr_range': (70, 95), 'hrv_range': (15, 35), 'stress_base': 0.6},
            'evening': {'hr_range': (65, 85), 'hrv_range': (20, 40), 'stress_base': 0.4},
            'night': {'hr_range': (55, 75), 'hrv_range': (30, 50), 'stress_base': 0.2},
        }
        
        # Current baseline values for continuity
        self.current_hr = 72
        self.current_hrv = 28
        self.current_stress = 0.4
        
    def get_time_period(self) -> str:
        """Get current time period for realistic patterns"""
        hour = datetime.now().hour
        if 6 <= hour < 9:
            return 'morning'
        elif 9 <= hour < 17:
            return 'work_hours'
        elif 17 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def generate_email(self, user_id: int) -> EmailData:
        """Generate a single email with realistic content"""
        category = random.choice(list(self.email_templates.keys()))
        template = random.choice(self.email_templates[category])
        
        # Generate realistic sender
        senders = {
            'work': [f"{self.fake.first_name()}@company.com", "hr@company.com", "manager@company.com"],
            'finance': ["noreply@bank.com", "alerts@creditcard.com", "support@investment.com"],
            'shopping': ["deals@store.com", "noreply@amazon.com", "sales@retailer.com"],
            'personal': [self.fake.email(), f"{self.fake.first_name().lower()}@gmail.com"]
        }
        
        sender = random.choice(senders[category])
        
        # Generate content preview
        content_previews = {
            'work': [
                "Please review the attached documents before tomorrow's meeting...",
                "The client has requested some changes to the proposal...",
                "Congratulations on exceeding your quarterly targets...",
                "We need to discuss your upcoming performance review...",
            ],
            'finance': [
                "Your minimum payment of $450 is due in 3 days...",
                "Your portfolio has performed well this month...",
                "Please review your monthly spending summary...",
                "We detected unusual activity on your account...",
            ],
            'shopping': [
                "Don't miss out on these incredible savings...",
                "You left something in your cart - complete your purchase...",
                "Your order #12345 has been shipped via UPS...",
                "Only 2 hours left to grab this deal...",
            ],
            'personal': [
                "Hope you're doing well! Let's catch up soon...",
                "Your appointment is scheduled for next Tuesday at 2 PM...",
                "Looking forward to seeing you this weekend...",
                "Your Netflix subscription will auto-renew tomorrow...",
            ]
        }
        
        content = random.choice(content_previews[category])
        
        # Add some noise to template values
        stress_trigger = template['stress'] > 0.6
        sentiment_score = template['sentiment'] + random.uniform(-0.2, 0.2)
        sentiment_score = max(-1, min(1, sentiment_score))  # Clamp to [-1, 1]
        
        # Determine sentiment label
        if sentiment_score > 0.3:
            sentiment_label = "positive"
        elif sentiment_score < -0.3:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        # Determine priority
        if template['stress'] > 0.7:
            priority = "high"
        elif template['stress'] > 0.4:
            priority = "medium"
        else:
            priority = "low"
        
        return EmailData(
            timestamp=datetime.now().isoformat(),
            sender=sender,
            subject=template['subject'],
            content_preview=content,
            sentiment_score=round(sentiment_score, 3),
            sentiment_label=sentiment_label,
            stress_trigger=stress_trigger,
            priority=priority,
            category=category,
            emotional_impact=round(template['stress'] * 10, 1)
        )
    
    def generate_biometric(self, user_id: int) -> Dict:
        """Generate realistic biometric data with continuity"""
        time_period = self.get_time_period()
        pattern = self.biometric_patterns[time_period]
        
        # Generate heart rate with some continuity
        hr_target = random.randint(*pattern['hr_range'])
        self.current_hr += random.uniform(-3, 3)
        self.current_hr = 0.7 * self.current_hr + 0.3 * hr_target
        self.current_hr = max(50, min(120, self.current_hr))
        
        # Generate HRV inversely correlated with stress
        hrv_target = random.randint(*pattern['hrv_range'])
        self.current_hrv += random.uniform(-2, 2)
        self.current_hrv = 0.8 * self.current_hrv + 0.2 * hrv_target
        self.current_hrv = max(10, min(60, self.current_hrv))
        
        # Generate stress level
        stress_target = pattern['stress_base'] + random.uniform(-0.2, 0.3)
        self.current_stress += random.uniform(-0.1, 0.1)
        self.current_stress = 0.6 * self.current_stress + 0.4 * stress_target
        self.current_stress = max(0, min(1, self.current_stress))
        
        # Activity level based on heart rate
        if self.current_hr > 90:
            activity_level = "high"
        elif self.current_hr > 75:
            activity_level = "moderate"
        else:
            activity_level = "low"
        
        # Recovery score (higher HRV = better recovery)
        recovery_score = min(100, (self.current_hrv / 50) * 100)
        
        # Sleep quality (randomized but realistic)
        sleep_quality = random.uniform(6, 9) if time_period == 'night' else random.uniform(4, 7)
        
        return {
            'user_id': str(user_id),
            'timestamp': datetime.now().isoformat(),
            'heart_rate': round(self.current_hr, 1),
            'hrv_ms': round(self.current_hrv, 1),
            'stress_level': round(self.current_stress * 10, 1),  # Scale to 0-10
            'activity_level': activity_level,
            'recovery_score': round(recovery_score, 1),
            'sleep_quality': round(sleep_quality, 1),
            'source': 'apple_watch',
            'raw_stress_score': round(self.current_stress, 3)
        }
    
    async def email_stream(self, user_id: int, interval_seconds: int = 30) -> AsyncGenerator[EmailData, None]:
        """Generate continuous email stream"""
        while True:
            # Random interval between emails (15-60 minutes in real time, but faster for demo)
            await asyncio.sleep(interval_seconds)
            
            # Not every cycle generates an email (simulate realistic email frequency)
            if random.random() < 0.7:  # 70% chance of email
                yield self.generate_email(user_id)
    
    async def biometric_stream(self, user_id: int, interval_seconds: int = 5) -> AsyncGenerator[Dict, None]:
        """Generate continuous biometric stream"""
        while True:
            yield self.generate_biometric(user_id)
            await asyncio.sleep(interval_seconds)
    
    def generate_historical_emails(self, user_id: int, hours: int = 24, count: int = 20) -> List[EmailData]:
        """Generate historical email data"""
        emails = []
        start_time = datetime.now() - timedelta(hours=hours)
        
        for i in range(count):
            # Generate timestamp in the past
            timestamp = start_time + timedelta(
                seconds=random.randint(0, int(hours * 3600))
            )
            
            email = self.generate_email(user_id)
            email.timestamp = timestamp.isoformat()
            emails.append(email)
        
        # Sort by timestamp
        emails.sort(key=lambda x: x.timestamp)
        return emails
    
    def generate_historical_biometrics(self, user_id: int, hours: int = 24, count: int = 100) -> List[Dict]:
        """Generate historical biometric data"""
        biometrics = []
        start_time = datetime.now() - timedelta(hours=hours)
        
        for i in range(count):
            # Generate timestamp in the past
            timestamp = start_time + timedelta(
                seconds=random.randint(0, int(hours * 3600))
            )
            
            biometric = self.generate_biometric(user_id)
            biometric['timestamp'] = timestamp.isoformat()
            biometrics.append(biometric)
        
        # Sort by timestamp
        biometrics.sort(key=lambda x: x['timestamp'])
        return biometrics

# Global instance
fake_data_generator = FakeDataStreamGenerator()
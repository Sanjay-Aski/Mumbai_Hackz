from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from app.models.database import User, BiometricReading, Transaction, Intervention, GigWork
from app.models.schemas import DashboardStats
from app.core.database import get_db

class PostgreSQLUserDataService:
    """User data service using PostgreSQL instead of JSON files"""
    
    def __init__(self):
        self.db_dependency = get_db
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    def get_current_stress_level(self, db: Session, user_id: int) -> Tuple[str, float]:
        """Get current stress level based on recent biometric data"""
        # Get most recent biometric reading from last 24 hours
        recent_reading = db.query(BiometricReading).filter(
            and_(
                BiometricReading.user_id == user_id,
                BiometricReading.timestamp >= datetime.utcnow() - timedelta(hours=24)
            )
        ).order_by(desc(BiometricReading.timestamp)).first()
        
        if not recent_reading:
            # Fallback to user's baseline
            user = self.get_user_by_id(db, user_id)
            baseline = user.stress_baseline if user else 0.3
            return "Low", baseline
        
        stress_score = recent_reading.stress_score
        
        if stress_score > 0.7:
            return "High", stress_score
        elif stress_score > 0.4:
            return "Medium", stress_score
        else:
            return "Low", stress_score
    
    def get_spending_risk(self, db: Session, user_id: int) -> str:
        """Calculate spending risk based on user history"""
        stress_level, stress_score = self.get_current_stress_level(db, user_id)
        
        # Check recent high-stress purchases (last 7 days)
        recent_stress_purchases = db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.timestamp >= datetime.utcnow() - timedelta(days=7),
                Transaction.stress_at_time > 0.6
            )
        ).count()
        
        if recent_stress_purchases > 2 or stress_score > 0.7:
            return "Critical"
        elif recent_stress_purchases > 0 or stress_score > 0.4:
            return "Moderate"
        else:
            return "Safe"
    
    def get_intervention_effectiveness(self, db: Session, user_id: int) -> Dict:
        """Analyze intervention effectiveness for this user"""
        interventions = db.query(Intervention).filter(
            Intervention.user_id == user_id
        ).all()
        
        if not interventions:
            return {"success_rate": 0.5, "preferred_severity": "medium", "total_interventions": 0}
        
        successful = len([i for i in interventions if i.effectiveness == 'prevented_purchase'])
        total = len(interventions)
        success_rate = successful / total if total > 0 else 0.5
        
        # Determine preferred intervention severity
        snooze_actions = len([i for i in interventions if i.user_action == 'snooze'])
        proceed_actions = len([i for i in interventions if i.user_action == 'proceed'])
        
        if snooze_actions > proceed_actions:
            preferred_severity = "low"  # User responds well to gentle nudges
        else:
            preferred_severity = "high"  # User needs stronger interventions
        
        return {
            "success_rate": success_rate,
            "preferred_severity": preferred_severity,
            "total_interventions": total,
            "successful_interventions": successful
        }
    
    def should_intervene(self, db: Session, user_id: int, context_url: str) -> Dict:
        """Enhanced intervention decision logic using real user data"""
        stress_level, stress_score = self.get_current_stress_level(db, user_id)
        spending_risk = self.get_spending_risk(db, user_id)
        effectiveness = self.get_intervention_effectiveness(db, user_id)
        
        # Base intervention logic
        should_intervene = False
        intervention_severity = "low"
        delay_minutes = 3
        message = "Consider waiting before making this purchase."
        
        # Site-specific logic
        shopping_sites = ["amazon", "myntra", "flipkart", "swiggy", "zomato"]
        is_shopping = any(site in context_url.lower() for site in shopping_sites)
        
        gig_sites = ["upwork", "fiverr", "freelancer"]
        is_gig_work = any(site in context_url.lower() for site in gig_sites)
        
        if is_shopping and stress_score > 0.5:
            should_intervene = True
            if stress_score > 0.7:
                intervention_severity = "high"
                delay_minutes = 10
                message = f"🔴 HIGH STRESS ALERT: Your stress level is {stress_level}. Take a break before purchasing."
            elif stress_score > 0.4:
                intervention_severity = "medium" 
                delay_minutes = 5
                message = f"🟡 CAUTION: Elevated stress detected. Consider if this purchase aligns with your goals."
        
        elif is_gig_work and stress_score > 0.6:
            should_intervene = True
            intervention_severity = "medium"
            delay_minutes = 7
            message = "High stress detected. Review your pricing carefully to avoid undervaluing your work."
        
        # Adjust based on user's intervention history
        if effectiveness['success_rate'] < 0.3:
            # User often ignores interventions, try stronger approach
            if intervention_severity == "low":
                intervention_severity = "medium"
            delay_minutes += 2
        
        return {
            "should_intervene": should_intervene,
            "severity": intervention_severity,
            "delay_minutes": delay_minutes,
            "message": message,
            "user_context": {
                "stress_level": stress_level,
                "stress_score": stress_score,
                "spending_risk": spending_risk,
                "intervention_success_rate": effectiveness['success_rate']
            }
        }
    
    def get_dashboard_stats(self, db: Session, user_id: int) -> DashboardStats:
        """Get dashboard statistics for a user"""
        user = self.get_user_by_id(db, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        stress_level, stress_score = self.get_current_stress_level(db, user_id)
        spending_risk = self.get_spending_risk(db, user_id)
        
        # Calculate savings runway
        savings_runway = "Unknown"
        if user.income_monthly and user.savings_target:
            if user.income_monthly > 0:
                runway_months = (user.savings_target * 3) / user.income_monthly
                savings_runway = f"{runway_months:.1f} Mo"
        
        # Get recent interventions
        recent_interventions = []
        interventions = db.query(Intervention).filter(
            Intervention.user_id == user_id
        ).order_by(desc(Intervention.timestamp)).limit(3).all()
        
        for intervention in interventions:
            time_ago = self._format_time_ago(intervention.timestamp)
            site_name = self._extract_site_name(intervention.url)
            recent_interventions.append({
                "time": time_ago,
                "action": f"Intervention on {site_name}",
                "reason": intervention.reason
            })
        
        return DashboardStats(
            stress_level=stress_level,
            stress_score=stress_score,
            spending_risk=spending_risk,
            cognitive_load="High" if stress_score > 0.6 else "Normal",
            savings_runway=savings_runway,
            recent_interventions=recent_interventions
        )
    
    def log_intervention_result(self, db: Session, user_id: int, intervention_data: Dict):
        """Log intervention result to database"""
        intervention = Intervention(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            url=intervention_data.get('url', ''),
            reason=intervention_data.get('reason', ''),
            severity=intervention_data.get('severity', 'medium'),
            user_action=intervention_data.get('user_action', 'unknown'),
            delay_minutes=intervention_data.get('delay_minutes', 5),
            effectiveness=intervention_data.get('effectiveness', 'unknown')
        )
        
        db.add(intervention)
        db.commit()
    
    def add_biometric_reading(self, db: Session, user_id: int, heart_rate: int, hrv_ms: float, context: str = ""):
        """Add a new biometric reading"""
        # Calculate stress score (using the same logic as analyzer)
        hr_score = max(0, min(1, (heart_rate - 60) / 40))
        hrv_score = max(0, min(1, (100 - hrv_ms) / 80))
        stress_score = (hr_score * 0.4) + (hrv_score * 0.6)
        
        if heart_rate > 90 and hrv_ms < 35:
            stress_score = max(stress_score, 0.8)
        
        reading = BiometricReading(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            heart_rate=heart_rate,
            hrv_ms=hrv_ms,
            stress_score=stress_score,
            context=context
        )
        
        db.add(reading)
        db.commit()
        return reading
    
    def add_transaction(self, db: Session, user_id: int, amount: float, merchant: str, category: str):
        """Add a new transaction"""
        # Get current stress level
        stress_level, stress_score = self.get_current_stress_level(db, user_id)
        
        transaction = Transaction(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            amount=amount,
            currency="INR",
            merchant=merchant,
            category=category,
            stress_at_time=stress_score,
            intervention_shown=False,  # Will be updated by intervention system
            user_proceeded=True
        )
        
        db.add(transaction)
        db.commit()
        return transaction
    
    def _format_time_ago(self, timestamp: datetime) -> str:
        """Format timestamp as 'X hours ago' etc."""
        now = datetime.utcnow()
        diff = now - timestamp
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    
    def _extract_site_name(self, url: str) -> str:
        """Extract readable site name from URL"""
        if 'amazon' in url:
            return 'Amazon'
        elif 'myntra' in url:
            return 'Myntra'
        elif 'flipkart' in url:
            return 'Flipkart'
        elif 'upwork' in url:
            return 'Upwork'
        else:
            return 'Shopping Site'

# Global instance
postgresql_user_service = PostgreSQLUserDataService()
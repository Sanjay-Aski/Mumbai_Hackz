import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from app.models.schemas import DashboardStats

class UserDataService:
    def __init__(self):
        self.dataset_path = os.path.join(os.path.dirname(__file__), "../../../dataset")
        self.users_data = self._load_user_data()
        self.permissions_data = self._load_permissions_data()
    
    def _load_user_data(self) -> Dict:
        """Load user profiles from dataset"""
        try:
            with open(os.path.join(self.dataset_path, "user_profiles.json"), 'r') as f:
                data = json.load(f)
                # Convert to dict keyed by user_id for faster lookup
                return {user['user_id']: user for user in data}
        except FileNotFoundError:
            print("User dataset not found, using empty dataset")
            return {}
    
    def _load_permissions_data(self) -> Dict:
        """Load data permissions configuration"""
        try:
            with open(os.path.join(self.dataset_path, "data_permissions.json"), 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"data_collection_consent": {"permissions_required": []}}
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by ID"""
        return self.users_data.get(user_id)
    
    def get_current_stress_level(self, user_id: str) -> Tuple[str, float]:
        """Get current stress level based on recent biometric data"""
        user = self.users_data.get(user_id)
        if not user or 'biometric_history' not in user:
            return "Low", 0.2  # Default for unknown users
        
        # Get most recent biometric reading
        biometrics = user['biometric_history']
        if not biometrics:
            return "Low", user['profile'].get('stress_baseline', 0.3)
        
        # Sort by timestamp and get latest
        latest = max(biometrics, key=lambda x: x['timestamp'])
        stress_score = latest['stress_score']
        
        if stress_score > 0.7:
            return "High", stress_score
        elif stress_score > 0.4:
            return "Medium", stress_score
        else:
            return "Low", stress_score
    
    def get_spending_risk(self, user_id: str) -> str:
        """Calculate spending risk based on user history"""
        user = self.users_data.get(user_id)
        if not user:
            return "Safe"
        
        stress_level, stress_score = self.get_current_stress_level(user_id)
        
        # Check recent spending patterns
        spending_history = user.get('spending_history', [])
        if not spending_history:
            return "Safe"
        
        # Recent high-stress purchases
        recent_stress_purchases = [
            s for s in spending_history 
            if s.get('stress_at_time', 0) > 0.6
        ]
        
        if len(recent_stress_purchases) > 2 or stress_score > 0.7:
            return "Critical"
        elif len(recent_stress_purchases) > 0 or stress_score > 0.4:
            return "Moderate"
        else:
            return "Safe"
    
    def get_intervention_effectiveness(self, user_id: str) -> Dict:
        """Analyze intervention effectiveness for this user"""
        user = self.users_data.get(user_id)
        if not user or 'intervention_history' not in user:
            return {"success_rate": 0.5, "preferred_severity": "medium"}
        
        interventions = user['intervention_history']
        if not interventions:
            return {"success_rate": 0.5, "preferred_severity": "medium"}
        
        successful = len([i for i in interventions if i.get('effectiveness') == 'prevented_purchase'])
        total = len(interventions)
        success_rate = successful / total if total > 0 else 0.5
        
        # Determine preferred intervention severity
        user_responses = [i.get('user_action') for i in interventions]
        snooze_count = user_responses.count('snooze')
        proceed_count = user_responses.count('proceed')
        
        if snooze_count > proceed_count:
            preferred_severity = "low"  # User responds well to gentle nudges
        else:
            preferred_severity = "high"  # User needs stronger interventions
        
        return {
            "success_rate": success_rate,
            "preferred_severity": preferred_severity,
            "total_interventions": total,
            "successful_interventions": successful
        }
    
    def should_intervene(self, user_id: str, context_url: str) -> Dict:
        """Enhanced intervention decision logic using user history"""
        user = self.users_data.get(user_id)
        stress_level, stress_score = self.get_current_stress_level(user_id)
        spending_risk = self.get_spending_risk(user_id)
        effectiveness = self.get_intervention_effectiveness(user_id)
        
        # Base intervention logic
        should_intervene = False
        intervention_severity = "low"
        delay_minutes = 3
        message = "Consider waiting before making this purchase."
        
        # High stress + shopping site = likely intervention
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
    
    def log_intervention_result(self, user_id: str, intervention_data: Dict):
        """Log intervention result to user's history (in production, this would update database)"""
        # In a real system, this would update the database
        # For now, we'll just print for debugging
        print(f"Logging intervention for {user_id}: {intervention_data}")
    
    def get_dashboard_stats(self, user_id: str) -> DashboardStats:
        """Get dashboard statistics for a user"""
        user = self.users_data.get(user_id)
        stress_level, stress_score = self.get_current_stress_level(user_id)
        spending_risk = self.get_spending_risk(user_id)
        
        # Calculate savings runway
        savings_runway = "3.5 Mo"  # Default
        if user and 'profile' in user:
            monthly_income = user['profile'].get('income_monthly', 50000)
            savings_target = user['profile'].get('savings_target', 15000)
            if monthly_income > 0:
                runway_months = (savings_target * 3) / monthly_income  # Rough estimate
                savings_runway = f"{runway_months:.1f} Mo"
        
        # Get recent interventions
        recent_interventions = []
        if user and 'intervention_history' in user:
            interventions = user['intervention_history'][-3:]  # Last 3
            for intervention in interventions:
                recent_interventions.append({
                    "time": self._format_time_ago(intervention['timestamp']),
                    "action": f"Intervention on {self._extract_site_name(intervention['url'])}",
                    "reason": intervention['reason']
                })
        
        return DashboardStats(
            stress_level=stress_level,
            stress_score=stress_score,
            spending_risk=spending_risk,
            cognitive_load="High" if stress_score > 0.6 else "Normal",
            savings_runway=savings_runway,
            recent_interventions=recent_interventions
        )
    
    def _format_time_ago(self, timestamp_str: str) -> str:
        """Format timestamp as 'X hours ago' etc."""
        try:
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            now = datetime.now(timestamp.tzinfo)
            diff = now - timestamp
            
            if diff.days > 0:
                return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        except:
            return "Recently"
    
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
    
    def check_permissions(self, user_id: str, data_type: str) -> bool:
        """Check if user has granted permission for specific data type"""
        # In a real system, this would check user-specific permissions
        # For now, return True for required permissions
        required_types = {'biometric_data', 'browsing_behavior', 'intervention_analytics'}
        return data_type in required_types

# Global instance
user_data_service = UserDataService()
"""
Advanced Risk Override Engine - Production Implementation
Comprehensive rule-based system that adjusts ML recommendations based on real-time conditions
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from dataclasses import dataclass, asdict
import json

logger = logging.getLogger(__name__)

class RiskCategory(Enum):
    MARKET_RISK = "market_risk"
    USER_BEHAVIORAL_RISK = "user_behavioral_risk"
    LIQUIDITY_RISK = "liquidity_risk"
    SYSTEMIC_RISK = "systemic_risk"
    REGULATORY_RISK = "regulatory_risk"

class RiskSeverity(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class RiskEvent:
    category: RiskCategory
    severity: RiskSeverity
    description: str
    timestamp: str
    confidence: float
    affected_assets: List[str]
    recommended_action: str
    trigger_conditions: Dict[str, Any]

@dataclass
class RiskMetrics:
    overall_risk_score: float  # 0-10 scale
    category_risks: Dict[RiskCategory, float]
    active_risk_events: List[RiskEvent]
    risk_adjusted_allocation: Dict[str, float]
    confidence_adjustment: float
    monitoring_alerts: List[str]

class AdvancedRiskOverrideEngine:
    """
    Production-ready risk override engine with comprehensive rule sets
    """
    
    def __init__(self):
        self.risk_rules = self._initialize_comprehensive_rules()
        self.risk_thresholds = self._initialize_risk_thresholds()
        self.active_overrides = {}
        self.risk_history = []
        
    def _initialize_comprehensive_rules(self) -> Dict:
        """Initialize comprehensive risk override rules"""
        return {
            # Market Risk Rules
            'market_crash_protection': {
                'category': RiskCategory.MARKET_RISK,
                'conditions': {
                    'nifty_change': {'operator': '<', 'value': -3.0},
                    'sensex_change': {'operator': '<', 'value': -3.0}
                },
                'severity': RiskSeverity.HIGH,
                'actions': [
                    {'type': 'reduce_equity', 'percentage': 25},
                    {'type': 'increase_liquid', 'percentage': 15},
                    {'type': 'increase_debt', 'percentage': 10}
                ],
                'affected_assets': ['equity', 'liquid', 'debt'],
                'priority': 1,
                'cooldown_hours': 24
            },
            
            'high_volatility_protection': {
                'category': RiskCategory.MARKET_RISK,
                'conditions': {
                    'vix_level': {'operator': '>', 'value': 25},
                    'market_condition': {'operator': 'in', 'value': ['volatile', 'bear']}
                },
                'severity': RiskSeverity.MEDIUM,
                'actions': [
                    {'type': 'reduce_equity', 'percentage': 15},
                    {'type': 'increase_debt', 'percentage': 10},
                    {'type': 'increase_gold', 'percentage': 5}
                ],
                'affected_assets': ['equity', 'debt', 'gold'],
                'priority': 2,
                'cooldown_hours': 6
            },
            
            'sector_concentration_risk': {
                'category': RiskCategory.MARKET_RISK,
                'conditions': {
                    'sector_decline': {'operator': '>', 'value': -5.0},  # Any sector down >5%
                    'sector_count': {'operator': '>', 'value': 2}  # More than 2 sectors declining
                },
                'severity': RiskSeverity.MEDIUM,
                'actions': [
                    {'type': 'diversify_sectors', 'target': 'broad_market'},
                    {'type': 'reduce_sector_exposure', 'percentage': 20}
                ],
                'affected_assets': ['equity'],
                'priority': 3,
                'cooldown_hours': 12
            },
            
            # User Behavioral Risk Rules
            'high_stress_override': {
                'category': RiskCategory.USER_BEHAVIORAL_RISK,
                'conditions': {
                    'stress_baseline': {'operator': '>', 'value': 7},
                    'recent_interventions_ignored': {'operator': '>', 'value': 3}
                },
                'severity': RiskSeverity.HIGH,
                'actions': [
                    {'type': 'shift_conservative', 'intensity': 'high'},
                    {'type': 'increase_liquid', 'percentage': 20},
                    {'type': 'pause_new_investments', 'duration': 'weeks_2'}
                ],
                'affected_assets': ['equity', 'liquid'],
                'priority': 1,
                'cooldown_hours': 168  # 1 week
            },
            
            'impulsive_behavior_protection': {
                'category': RiskCategory.USER_BEHAVIORAL_RISK,
                'conditions': {
                    'behavioral_score': {'operator': '>', 'value': 0.7},
                    'recent_large_purchases': {'operator': '>', 'value': 2}
                },
                'severity': RiskSeverity.MEDIUM,
                'actions': [
                    {'type': 'reduce_risk_assets', 'percentage': 20},
                    {'type': 'enable_systematic_only', 'duration': 'weeks_4'},
                    {'type': 'increase_monitoring', 'frequency': 'daily'}
                ],
                'affected_assets': ['equity', 'gold'],
                'priority': 2,
                'cooldown_hours': 72
            },
            
            # Liquidity Risk Rules
            'emergency_fund_critical': {
                'category': RiskCategory.LIQUIDITY_RISK,
                'conditions': {
                    'emergency_fund_months': {'operator': '<', 'value': 2}
                },
                'severity': RiskSeverity.CRITICAL,
                'actions': [
                    {'type': 'prioritize_liquid', 'target_months': 6},
                    {'type': 'pause_long_term_investments', 'duration': 'until_emergency_fund'},
                    {'type': 'reduce_all_risk_assets', 'percentage': 40}
                ],
                'affected_assets': ['liquid', 'equity', 'debt', 'gold'],
                'priority': 1,
                'cooldown_hours': 24
            },
            
            'low_emergency_fund': {
                'category': RiskCategory.LIQUIDITY_RISK,
                'conditions': {
                    'emergency_fund_months': {'operator': '<', 'value': 6},
                    'emergency_fund_months': {'operator': '>=', 'value': 2}
                },
                'severity': RiskSeverity.MEDIUM,
                'actions': [
                    {'type': 'increase_liquid', 'percentage': 15},
                    {'type': 'reduce_equity', 'percentage': 10}
                ],
                'affected_assets': ['liquid', 'equity'],
                'priority': 2,
                'cooldown_hours': 48
            },
            
            # Systemic Risk Rules
            'financial_system_stress': {
                'category': RiskCategory.SYSTEMIC_RISK,
                'conditions': {
                    'banking_sector_decline': {'operator': '<', 'value': -8},
                    'credit_spread': {'operator': '>', 'value': 200},  # Credit spreads widening
                    'bond_yield_spike': {'operator': '>', 'value': 0.5}  # 50 bps spike
                },
                'severity': RiskSeverity.HIGH,
                'actions': [
                    {'type': 'flight_to_quality', 'target': 'government_bonds'},
                    {'type': 'reduce_credit_exposure', 'percentage': 30},
                    {'type': 'increase_gold', 'percentage': 10}
                ],
                'affected_assets': ['debt', 'equity', 'gold'],
                'priority': 1,
                'cooldown_hours': 48
            },
            
            'currency_devaluation_risk': {
                'category': RiskCategory.SYSTEMIC_RISK,
                'conditions': {
                    'usd_inr_spike': {'operator': '>', 'value': 2},  # 2% spike in single day
                    'usd_inr_level': {'operator': '>', 'value': 85}
                },
                'severity': RiskSeverity.MEDIUM,
                'actions': [
                    {'type': 'increase_gold', 'percentage': 10},
                    {'type': 'consider_international_funds', 'percentage': 5},
                    {'type': 'hedge_currency_risk', 'instruments': ['gold_etf', 'usd_funds']}
                ],
                'affected_assets': ['gold', 'equity'],
                'priority': 2,
                'cooldown_hours': 24
            }
        }
    
    def _initialize_risk_thresholds(self) -> Dict:
        """Initialize risk scoring thresholds"""
        return {
            'market_volatility': {
                'low': 15,     # VIX < 15
                'medium': 25,  # VIX 15-25
                'high': 35,    # VIX 25-35
                'critical': 35  # VIX > 35
            },
            'user_stress': {
                'low': 3,      # Stress < 3
                'medium': 6,   # Stress 3-6
                'high': 8,     # Stress 6-8
                'critical': 8  # Stress > 8
            },
            'market_decline': {
                'low': 2,      # < 2% decline
                'medium': 5,   # 2-5% decline
                'high': 10,    # 5-10% decline
                'critical': 10  # > 10% decline
            },
            'behavioral_risk': {
                'low': 0.3,    # Behavioral score < 0.3
                'medium': 0.6, # Behavioral score 0.3-0.6
                'high': 0.8,   # Behavioral score 0.6-0.8
                'critical': 0.8 # Behavioral score > 0.8
            }
        }
    
    async def analyze_comprehensive_risk(self, user_profile, market_data, 
                                       recent_transactions=None, biometric_data=None) -> RiskMetrics:
        """
        Perform comprehensive risk analysis across all categories
        """
        try:
            # Collect all risk events
            risk_events = []
            
            # Analyze market risks
            market_risks = await self._analyze_market_risks(market_data)
            risk_events.extend(market_risks)
            
            # Analyze user behavioral risks
            behavioral_risks = await self._analyze_behavioral_risks(
                user_profile, recent_transactions, biometric_data
            )
            risk_events.extend(behavioral_risks)
            
            # Analyze liquidity risks
            liquidity_risks = await self._analyze_liquidity_risks(user_profile)
            risk_events.extend(liquidity_risks)
            
            # Analyze systemic risks
            systemic_risks = await self._analyze_systemic_risks(market_data)
            risk_events.extend(systemic_risks)
            
            # Calculate overall risk metrics
            risk_metrics = self._calculate_risk_metrics(risk_events, user_profile)
            
            # Generate risk-adjusted allocation
            risk_adjusted_allocation = await self._generate_risk_adjusted_allocation(
                user_profile, risk_events
            )
            
            risk_metrics.risk_adjusted_allocation = risk_adjusted_allocation
            
            # Store in history for tracking
            self.risk_history.append({
                'timestamp': datetime.now().isoformat(),
                'risk_score': risk_metrics.overall_risk_score,
                'active_events': len(risk_events),
                'adjustments_made': len([e for e in risk_events if e.severity.value >= 3])
            })
            
            logger.info(f"Comprehensive risk analysis completed. Overall risk score: {risk_metrics.overall_risk_score}")
            return risk_metrics
            
        except Exception as e:
            logger.error(f"Error in comprehensive risk analysis: {e}")
            return self._get_default_risk_metrics()
    
    async def _analyze_market_risks(self, market_data) -> List[RiskEvent]:
        """Analyze market-related risk events"""
        risk_events = []
        
        try:
            # Market crash detection
            if (market_data.nifty_change < -3.0 and market_data.sensex_change < -3.0):
                risk_events.append(RiskEvent(
                    category=RiskCategory.MARKET_RISK,
                    severity=RiskSeverity.HIGH,
                    description=f"Market crash detected: Nifty {market_data.nifty_change:.1f}%, Sensex {market_data.sensex_change:.1f}%",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.9,
                    affected_assets=['equity'],
                    recommended_action="Reduce equity allocation by 25%",
                    trigger_conditions={'nifty_change': market_data.nifty_change, 'sensex_change': market_data.sensex_change}
                ))
            
            # High volatility detection
            if market_data.vix_level > 25:
                severity = RiskSeverity.HIGH if market_data.vix_level > 35 else RiskSeverity.MEDIUM
                risk_events.append(RiskEvent(
                    category=RiskCategory.MARKET_RISK,
                    severity=severity,
                    description=f"High market volatility: VIX {market_data.vix_level:.1f}",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.85,
                    affected_assets=['equity', 'debt'],
                    recommended_action="Shift to defensive allocation",
                    trigger_conditions={'vix_level': market_data.vix_level}
                ))
            
            # Sector concentration risk
            if hasattr(market_data, 'sector_performance'):
                declining_sectors = [sector for sector, perf in market_data.sector_performance.items() if perf < -5.0]
                if len(declining_sectors) >= 3:
                    risk_events.append(RiskEvent(
                        category=RiskCategory.MARKET_RISK,
                        severity=RiskSeverity.MEDIUM,
                        description=f"Multiple sector declines: {', '.join(declining_sectors)}",
                        timestamp=datetime.now().isoformat(),
                        confidence=0.8,
                        affected_assets=['equity'],
                        recommended_action="Diversify across broad market indices",
                        trigger_conditions={'declining_sectors': declining_sectors}
                    ))
            
        except Exception as e:
            logger.error(f"Error analyzing market risks: {e}")
        
        return risk_events
    
    async def _analyze_behavioral_risks(self, user_profile, recent_transactions=None, 
                                      biometric_data=None) -> List[RiskEvent]:
        """Analyze user behavioral risk events"""
        risk_events = []
        
        try:
            # High stress risk
            if user_profile.stress_baseline > 7:
                risk_events.append(RiskEvent(
                    category=RiskCategory.USER_BEHAVIORAL_RISK,
                    severity=RiskSeverity.HIGH,
                    description=f"High baseline stress level: {user_profile.stress_baseline:.1f}/10",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.9,
                    affected_assets=['equity', 'gold'],
                    recommended_action="Shift to conservative allocation",
                    trigger_conditions={'stress_baseline': user_profile.stress_baseline}
                ))
            
            # Impulsive behavior risk
            if user_profile.behavioral_score > 0.7:
                risk_events.append(RiskEvent(
                    category=RiskCategory.USER_BEHAVIORAL_RISK,
                    severity=RiskSeverity.MEDIUM,
                    description=f"High impulsive behavior score: {user_profile.behavioral_score:.2f}",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.85,
                    affected_assets=['equity', 'gold'],
                    recommended_action="Enable systematic investing only",
                    trigger_conditions={'behavioral_score': user_profile.behavioral_score}
                ))
            
            # Recent large purchases
            if recent_transactions:
                large_purchases = [t for t in recent_transactions if t.get('amount', 0) > 10000]
                if len(large_purchases) >= 2:
                    total_amount = sum(t.get('amount', 0) for t in large_purchases)
                    risk_events.append(RiskEvent(
                        category=RiskCategory.USER_BEHAVIORAL_RISK,
                        severity=RiskSeverity.MEDIUM,
                        description=f"Multiple large purchases detected: ₹{total_amount:,}",
                        timestamp=datetime.now().isoformat(),
                        confidence=0.8,
                        affected_assets=['liquid'],
                        recommended_action="Increase liquid allocation for cash flow",
                        trigger_conditions={'large_purchases_count': len(large_purchases), 'total_amount': total_amount}
                    ))
            
        except Exception as e:
            logger.error(f"Error analyzing behavioral risks: {e}")
        
        return risk_events
    
    async def _analyze_liquidity_risks(self, user_profile) -> List[RiskEvent]:
        """Analyze liquidity-related risk events"""
        risk_events = []
        
        try:
            # Critical emergency fund risk
            if user_profile.emergency_fund_months < 2:
                risk_events.append(RiskEvent(
                    category=RiskCategory.LIQUIDITY_RISK,
                    severity=RiskSeverity.CRITICAL,
                    description=f"Critical emergency fund shortage: {user_profile.emergency_fund_months:.1f} months",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.95,
                    affected_assets=['liquid', 'equity', 'debt', 'gold'],
                    recommended_action="Pause all investments, build emergency fund immediately",
                    trigger_conditions={'emergency_fund_months': user_profile.emergency_fund_months}
                ))
            
            # Low emergency fund risk
            elif user_profile.emergency_fund_months < 6:
                risk_events.append(RiskEvent(
                    category=RiskCategory.LIQUIDITY_RISK,
                    severity=RiskSeverity.MEDIUM,
                    description=f"Low emergency fund: {user_profile.emergency_fund_months:.1f} months (target: 6 months)",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.9,
                    affected_assets=['liquid', 'equity'],
                    recommended_action="Increase liquid allocation, reduce equity exposure",
                    trigger_conditions={'emergency_fund_months': user_profile.emergency_fund_months}
                ))
            
            # Low monthly surplus
            if user_profile.monthly_surplus < 2000:
                risk_events.append(RiskEvent(
                    category=RiskCategory.LIQUIDITY_RISK,
                    severity=RiskSeverity.MEDIUM,
                    description=f"Low monthly surplus: ₹{user_profile.monthly_surplus:,}",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.8,
                    affected_assets=['equity', 'debt'],
                    recommended_action="Focus on increasing income or reducing expenses",
                    trigger_conditions={'monthly_surplus': user_profile.monthly_surplus}
                ))
            
        except Exception as e:
            logger.error(f"Error analyzing liquidity risks: {e}")
        
        return risk_events
    
    async def _analyze_systemic_risks(self, market_data) -> List[RiskEvent]:
        """Analyze systemic risk events"""
        risk_events = []
        
        try:
            # Currency devaluation risk
            if market_data.usd_inr > 85:
                risk_events.append(RiskEvent(
                    category=RiskCategory.SYSTEMIC_RISK,
                    severity=RiskSeverity.MEDIUM,
                    description=f"Currency weakness: USD/INR at {market_data.usd_inr:.2f}",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.8,
                    affected_assets=['debt', 'gold'],
                    recommended_action="Consider gold and international exposure",
                    trigger_conditions={'usd_inr': market_data.usd_inr}
                ))
            
            # Interest rate risk
            if market_data.bond_yield_10y > 8.0:
                risk_events.append(RiskEvent(
                    category=RiskCategory.SYSTEMIC_RISK,
                    severity=RiskSeverity.MEDIUM,
                    description=f"High interest rates: 10Y yield at {market_data.bond_yield_10y:.2f}%",
                    timestamp=datetime.now().isoformat(),
                    confidence=0.85,
                    affected_assets=['debt', 'equity'],
                    recommended_action="Prefer short duration bonds, be cautious on equity valuations",
                    trigger_conditions={'bond_yield_10y': market_data.bond_yield_10y}
                ))
            
        except Exception as e:
            logger.error(f"Error analyzing systemic risks: {e}")
        
        return risk_events
    
    def _calculate_risk_metrics(self, risk_events: List[RiskEvent], user_profile) -> RiskMetrics:
        """Calculate comprehensive risk metrics"""
        
        # Calculate category-wise risks
        category_risks = {}
        for category in RiskCategory:
            category_events = [e for e in risk_events if e.category == category]
            if category_events:
                avg_severity = sum(e.severity.value for e in category_events) / len(category_events)
                category_risks[category] = min(10.0, avg_severity * 2.5)  # Scale to 0-10
            else:
                category_risks[category] = 0.0
        
        # Calculate overall risk score
        overall_risk = sum(category_risks.values()) / len(RiskCategory)
        
        # Adjust confidence based on risk level
        confidence_adjustment = 1.0
        if overall_risk > 7:
            confidence_adjustment = 0.7  # High risk reduces confidence
        elif overall_risk > 5:
            confidence_adjustment = 0.85  # Medium risk slightly reduces confidence
        
        # Generate monitoring alerts
        monitoring_alerts = []
        high_risk_events = [e for e in risk_events if e.severity.value >= 3]
        if high_risk_events:
            monitoring_alerts.append(f"{len(high_risk_events)} high-risk events detected")
        
        if overall_risk > 8:
            monitoring_alerts.append("Overall risk level CRITICAL - immediate review required")
        elif overall_risk > 6:
            monitoring_alerts.append("Overall risk level HIGH - enhanced monitoring recommended")
        
        return RiskMetrics(
            overall_risk_score=round(overall_risk, 2),
            category_risks=category_risks,
            active_risk_events=risk_events,
            risk_adjusted_allocation={},  # Will be filled by calling function
            confidence_adjustment=confidence_adjustment,
            monitoring_alerts=monitoring_alerts
        )
    
    async def _generate_risk_adjusted_allocation(self, user_profile, 
                                               risk_events: List[RiskEvent]) -> Dict[str, float]:
        """Generate risk-adjusted asset allocation"""
        
        # Start with base allocation
        base_allocation = self._get_base_allocation(user_profile.risk_appetite)
        adjusted_allocation = base_allocation.copy()
        
        # Apply risk event adjustments
        for event in risk_events:
            if event.severity.value >= 3:  # High or Critical severity
                adjusted_allocation = self._apply_risk_adjustment(
                    adjusted_allocation, event
                )
        
        # Normalize to 100%
        total = sum(adjusted_allocation.values())
        if total > 0:
            adjusted_allocation = {k: v/total for k, v in adjusted_allocation.items()}
        
        return adjusted_allocation
    
    def _get_base_allocation(self, risk_appetite) -> Dict[str, float]:
        """Get base allocation by risk appetite"""
        allocations = {
            'conservative': {'equity': 0.30, 'debt': 0.50, 'liquid': 0.15, 'gold': 0.05},
            'moderate': {'equity': 0.60, 'debt': 0.25, 'liquid': 0.10, 'gold': 0.05},
            'aggressive': {'equity': 0.80, 'debt': 0.10, 'liquid': 0.05, 'gold': 0.05}
        }
        return allocations.get(risk_appetite, allocations['moderate'])
    
    def _apply_risk_adjustment(self, allocation: Dict[str, float], 
                             risk_event: RiskEvent) -> Dict[str, float]:
        """Apply specific risk event adjustments to allocation"""
        
        adjusted = allocation.copy()
        
        if risk_event.category == RiskCategory.MARKET_RISK:
            if 'crash' in risk_event.description.lower():
                # Market crash: reduce equity significantly
                equity_reduction = adjusted['equity'] * 0.25
                adjusted['equity'] -= equity_reduction
                adjusted['debt'] += equity_reduction * 0.6
                adjusted['liquid'] += equity_reduction * 0.4
            
            elif 'volatility' in risk_event.description.lower():
                # High volatility: moderate equity reduction
                equity_reduction = adjusted['equity'] * 0.15
                adjusted['equity'] -= equity_reduction
                adjusted['debt'] += equity_reduction * 0.7
                adjusted['gold'] += equity_reduction * 0.3
        
        elif risk_event.category == RiskCategory.USER_BEHAVIORAL_RISK:
            if 'stress' in risk_event.description.lower():
                # High stress: shift to very conservative
                equity_reduction = adjusted['equity'] * 0.3
                adjusted['equity'] -= equity_reduction
                adjusted['liquid'] += equity_reduction * 0.6
                adjusted['debt'] += equity_reduction * 0.4
        
        elif risk_event.category == RiskCategory.LIQUIDITY_RISK:
            if 'critical' in risk_event.description.lower():
                # Critical liquidity: maximize liquid allocation
                other_total = sum(v for k, v in adjusted.items() if k != 'liquid')
                move_to_liquid = other_total * 0.4
                
                for key in adjusted:
                    if key != 'liquid':
                        adjusted[key] *= 0.6
                adjusted['liquid'] += move_to_liquid
        
        elif risk_event.category == RiskCategory.SYSTEMIC_RISK:
            if 'currency' in risk_event.description.lower():
                # Currency risk: increase gold allocation
                gold_increase = 0.1
                reduce_per_asset = gold_increase / 3
                
                adjusted['equity'] -= reduce_per_asset
                adjusted['debt'] -= reduce_per_asset
                adjusted['liquid'] -= reduce_per_asset
                adjusted['gold'] += gold_increase
        
        return adjusted
    
    def _get_default_risk_metrics(self) -> RiskMetrics:
        """Get default risk metrics when analysis fails"""
        return RiskMetrics(
            overall_risk_score=5.0,
            category_risks={category: 3.0 for category in RiskCategory},
            active_risk_events=[],
            risk_adjusted_allocation={'equity': 0.6, 'debt': 0.3, 'liquid': 0.1},
            confidence_adjustment=0.8,
            monitoring_alerts=['Risk analysis unavailable - using default metrics']
        )
    
    def get_risk_summary_for_user(self, risk_metrics: RiskMetrics) -> str:
        """Generate user-friendly risk summary"""
        
        risk_level = "Low"
        if risk_metrics.overall_risk_score > 7:
            risk_level = "High"
        elif risk_metrics.overall_risk_score > 5:
            risk_level = "Moderate"
        
        summary_parts = [
            f"Overall risk level: {risk_level} ({risk_metrics.overall_risk_score}/10)"
        ]
        
        # Add high-impact events
        critical_events = [e for e in risk_metrics.active_risk_events if e.severity.value >= 3]
        if critical_events:
            summary_parts.append(f"{len(critical_events)} critical risk factors detected")
        
        # Add top recommendations
        if risk_metrics.monitoring_alerts:
            summary_parts.extend(risk_metrics.monitoring_alerts[:2])
        
        return ". ".join(summary_parts)

# Global instance
advanced_risk_override_engine = AdvancedRiskOverrideEngine()
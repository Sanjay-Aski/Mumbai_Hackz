"""
Hybrid ML + Real-Time Market Intelligence System
Combines machine learning models with live market data for dynamic investment recommendations
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from dataclasses import dataclass, asdict
from enum import Enum

# Import advanced components
from .advanced_risk_override_engine import AdvancedRiskOverrideEngine, RiskMetrics
from .llm_reasoning_layer import LLMReasoningLayer, ReasoningContext, LLMResponse

logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"

class MarketCondition(Enum):
    BULL = "bull"
    BEAR = "bear"
    SIDEWAYS = "sideways"
    VOLATILE = "volatile"

@dataclass
class MarketData:
    """Real-time market data structure"""
    timestamp: str
    nifty_change: float  # % change
    sensex_change: float
    vix_level: float     # Volatility index
    gold_price: float
    usd_inr: float
    bond_yield_10y: float
    market_condition: MarketCondition
    sector_performance: Dict[str, float]
    
@dataclass
class UserProfile:
    """User behavior and preferences from ML analysis"""
    user_id: int
    risk_appetite: RiskLevel
    investment_horizon: str  # short, medium, long
    monthly_surplus: float
    spending_personality: str
    stress_baseline: float
    emergency_fund_months: float
    investment_goals: List[str]
    behavioral_score: float  # 0-1, tendency for emotional decisions
    
@dataclass
class MLPrediction:
    """Machine learning model predictions"""
    spending_forecast: float
    savings_potential: float
    risk_tolerance_score: float
    overspend_probability: float
    investment_readiness: float
    recommended_allocation: Dict[str, float]
    confidence_score: float
    
@dataclass
class InvestmentRecommendation:
    """Final investment recommendation with reasoning"""
    user_id: int
    recommended_allocation: Dict[str, float]
    risk_level: RiskLevel
    monthly_sip_amount: float
    specific_instruments: List[Dict]
    reasoning: str
    confidence_score: float
    market_context: str
    warnings: List[str]
    alternatives: List[Dict]
    review_date: str

class MarketDataFetcher:
    """Fetches real-time market data from various sources"""
    
    def __init__(self):
        self.cache_duration = 300  # 5 minutes cache
        self.last_fetch = {}
        self.data_cache = {}
    
    async def get_nse_data(self) -> Dict:
        """Fetch NSE/BSE indices data"""
        # Simulated market data - in production, use real APIs
        return {
            'nifty_50': {
                'current': 19800,
                'change_percent': np.random.uniform(-2.5, 2.5),
                'volume': np.random.uniform(0.8, 1.2) * 1000000
            },
            'sensex': {
                'current': 66500,
                'change_percent': np.random.uniform(-2.5, 2.5),
                'volume': np.random.uniform(0.8, 1.2) * 800000
            },
            'bank_nifty': {
                'current': 44500,
                'change_percent': np.random.uniform(-3.0, 3.0)
            }
        }
    
    async def get_vix_data(self) -> float:
        """Fetch India VIX (volatility index)"""
        # Simulate VIX values: 12-35 range
        return np.random.uniform(12, 35)
    
    async def get_commodity_data(self) -> Dict:
        """Fetch gold, silver, crude prices"""
        return {
            'gold_per_10g': np.random.uniform(62000, 68000),
            'silver_per_kg': np.random.uniform(74000, 82000),
            'crude_oil': np.random.uniform(75, 95)
        }
    
    async def get_forex_data(self) -> Dict:
        """Fetch currency rates"""
        return {
            'usd_inr': np.random.uniform(82.5, 84.5),
            'eur_inr': np.random.uniform(88, 92),
            'gbp_inr': np.random.uniform(102, 108)
        }
    
    async def get_bond_yields(self) -> Dict:
        """Fetch government bond yields"""
        return {
            '10y_yield': np.random.uniform(6.8, 7.5),
            '5y_yield': np.random.uniform(6.5, 7.2),
            '2y_yield': np.random.uniform(6.2, 6.8)
        }
    
    async def get_sector_performance(self) -> Dict[str, float]:
        """Fetch sector-wise performance"""
        sectors = ['IT', 'Banking', 'Pharma', 'Auto', 'FMCG', 'Metals', 'Energy', 'Realty']
        return {
            sector: np.random.uniform(-3.0, 3.0) 
            for sector in sectors
        }
    
    async def fetch_comprehensive_market_data(self) -> MarketData:
        """Fetch all market data and create MarketData object"""
        try:
            # Fetch all data in parallel
            nse_data, vix, commodities, forex, bonds, sectors = await asyncio.gather(
                self.get_nse_data(),
                self.get_vix_data(),
                self.get_commodity_data(),
                self.get_forex_data(),
                self.get_bond_yields(),
                self.get_sector_performance()
            )
            
            # Determine market condition
            nifty_change = nse_data['nifty_50']['change_percent']
            market_condition = self._determine_market_condition(nifty_change, vix)
            
            return MarketData(
                timestamp=datetime.now().isoformat(),
                nifty_change=nifty_change,
                sensex_change=nse_data['sensex']['change_percent'],
                vix_level=vix,
                gold_price=commodities['gold_per_10g'],
                usd_inr=forex['usd_inr'],
                bond_yield_10y=bonds['10y_yield'],
                market_condition=market_condition,
                sector_performance=sectors
            )
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return self._get_default_market_data()
    
    def _determine_market_condition(self, nifty_change: float, vix: float) -> MarketCondition:
        """Determine market condition based on indicators"""
        if vix > 25:
            return MarketCondition.VOLATILE
        elif nifty_change > 1.5:
            return MarketCondition.BULL
        elif nifty_change < -1.5:
            return MarketCondition.BEAR
        else:
            return MarketCondition.SIDEWAYS
    
    def _get_default_market_data(self) -> MarketData:
        """Return default market data if fetch fails"""
        return MarketData(
            timestamp=datetime.now().isoformat(),
            nifty_change=0.5,
            sensex_change=0.4,
            vix_level=18.0,
            gold_price=65000,
            usd_inr=83.2,
            bond_yield_10y=7.1,
            market_condition=MarketCondition.SIDEWAYS,
            sector_performance={'IT': 0.5, 'Banking': 0.3, 'Pharma': -0.2}
        )

class MLBehaviorAnalyzer:
    """Machine learning component for user behavior analysis"""
    
    def __init__(self):
        self.models_loaded = False
        self.user_clusters = {}
    
    async def analyze_user_behavior(self, user_id: int, historical_data: Dict) -> UserProfile:
        """Analyze user behavior and create profile"""
        try:
            # Simulate ML analysis - in production, use trained models
            spending_data = historical_data.get('transactions', [])
            biometric_data = historical_data.get('biometrics', [])
            intervention_data = historical_data.get('interventions', [])
            
            # Calculate behavior metrics
            risk_appetite = self._calculate_risk_appetite(spending_data, biometric_data)
            behavioral_score = self._calculate_behavioral_score(intervention_data, biometric_data)
            monthly_surplus = self._estimate_monthly_surplus(spending_data)
            
            return UserProfile(
                user_id=user_id,
                risk_appetite=risk_appetite,
                investment_horizon="medium",  # Default to medium term
                monthly_surplus=monthly_surplus,
                spending_personality=self._determine_spending_personality(spending_data),
                stress_baseline=self._calculate_stress_baseline(biometric_data),
                emergency_fund_months=self._estimate_emergency_fund(historical_data),
                investment_goals=["wealth_building", "tax_saving"],  # Default goals
                behavioral_score=behavioral_score
            )
            
        except Exception as e:
            logger.error(f"Error in ML behavior analysis: {e}")
            return self._get_default_user_profile(user_id)
    
    def _calculate_risk_appetite(self, spending_data: List, biometric_data: List) -> RiskLevel:
        """Calculate user's risk appetite based on behavior"""
        if not spending_data:
            return RiskLevel.MODERATE
        
        # Analyze spending patterns
        amounts = [t.get('amount', 0) for t in spending_data]
        if not amounts:
            return RiskLevel.MODERATE
            
        spending_variance = np.var(amounts) if len(amounts) > 1 else 0
        avg_spending = np.mean(amounts)
        
        # High variance in spending = higher risk tolerance
        risk_score = spending_variance / (avg_spending + 1)
        
        if risk_score > 2000:
            return RiskLevel.AGGRESSIVE
        elif risk_score > 500:
            return RiskLevel.MODERATE
        else:
            return RiskLevel.CONSERVATIVE
    
    def _calculate_behavioral_score(self, intervention_data: List, biometric_data: List) -> float:
        """Calculate behavioral score (0-1, higher = more emotional/impulsive)"""
        if not intervention_data:
            return 0.3  # Default moderate score
        
        # Count interventions that were ignored (proceeded anyway)
        ignored_interventions = sum(1 for i in intervention_data 
                                  if i.get('user_action') == 'proceeded')
        total_interventions = len(intervention_data)
        
        if total_interventions == 0:
            return 0.3
        
        # Higher ignore rate = higher behavioral score (more impulsive)
        ignore_rate = ignored_interventions / total_interventions
        
        # Factor in stress levels if available
        if biometric_data:
            avg_stress = np.mean([b.get('stress_level', 5) for b in biometric_data])
            stress_factor = avg_stress / 10.0  # Normalize to 0-1
            return min(1.0, ignore_rate * 0.7 + stress_factor * 0.3)
        
        return min(1.0, ignore_rate)
    
    def _estimate_monthly_surplus(self, spending_data: List) -> float:
        """Estimate monthly investable surplus"""
        if not spending_data:
            return 5000.0  # Default
        
        # Calculate monthly spending (simplified)
        monthly_spending = sum(t.get('amount', 0) for t in spending_data[-30:])  # Last 30 transactions
        
        # Assume 20% of spending can be surplus (very simplified)
        estimated_surplus = max(1000, monthly_spending * 0.2)
        
        return min(estimated_surplus, 50000)  # Cap at 50K
    
    def _determine_spending_personality(self, spending_data: List) -> str:
        """Determine spending personality"""
        if not spending_data:
            return "balanced"
        
        # Analyze categories and patterns
        categories = [t.get('category', 'other') for t in spending_data]
        
        # Count luxury/discretionary spending
        discretionary_categories = ['fashion', 'entertainment', 'dining', 'electronics']
        discretionary_count = sum(1 for cat in categories if cat.lower() in discretionary_categories)
        
        discretionary_ratio = discretionary_count / len(categories) if categories else 0
        
        if discretionary_ratio > 0.4:
            return "lifestyle"
        elif discretionary_ratio < 0.2:
            return "conservative"
        else:
            return "balanced"
    
    def _calculate_stress_baseline(self, biometric_data: List) -> float:
        """Calculate baseline stress level"""
        if not biometric_data:
            return 4.0  # Default moderate stress
        
        stress_levels = [b.get('stress_level', 5) for b in biometric_data]
        return float(np.mean(stress_levels)) if stress_levels else 4.0
    
    def _estimate_emergency_fund(self, historical_data: Dict) -> float:
        """Estimate emergency fund coverage in months"""
        # Simplified estimation
        return np.random.uniform(2.0, 8.0)  # 2-8 months coverage
    
    def _get_default_user_profile(self, user_id: int) -> UserProfile:
        """Default user profile if analysis fails"""
        return UserProfile(
            user_id=user_id,
            risk_appetite=RiskLevel.MODERATE,
            investment_horizon="medium",
            monthly_surplus=5000.0,
            spending_personality="balanced",
            stress_baseline=4.0,
            emergency_fund_months=4.0,
            investment_goals=["wealth_building"],
            behavioral_score=0.3
        )

class RiskOverrideEngine:
    """Rule-based system that adjusts ML recommendations based on real-time conditions"""
    
    def __init__(self):
        self.override_rules = self._initialize_rules()
    
    def _initialize_rules(self) -> Dict:
        """Initialize risk override rules"""
        return {
            'market_crash_rule': {
                'condition': lambda market: market.nifty_change < -3.0,
                'action': 'reduce_equity_20_percent',
                'priority': 1
            },
            'high_volatility_rule': {
                'condition': lambda market: market.vix_level > 25,
                'action': 'increase_debt_allocation',
                'priority': 2
            },
            'gold_surge_rule': {
                'condition': lambda market: market.gold_price > 66000,
                'action': 'add_gold_hedge_10_percent',
                'priority': 3
            },
            'high_stress_rule': {
                'condition': lambda user: user.stress_baseline > 7,
                'action': 'shift_to_conservative',
                'priority': 2
            },
            'low_emergency_fund_rule': {
                'condition': lambda user: user.emergency_fund_months < 3,
                'action': 'prioritize_liquid_funds',
                'priority': 1
            },
            'bear_market_rule': {
                'condition': lambda market: market.market_condition == MarketCondition.BEAR,
                'action': 'defensive_allocation',
                'priority': 2
            }
        }
    
    async def apply_risk_overrides(self, 
                                 base_allocation: Dict[str, float], 
                                 user_profile: UserProfile, 
                                 market_data: MarketData) -> Tuple[Dict[str, float], List[str]]:
        """Apply risk override rules to base allocation"""
        
        modified_allocation = base_allocation.copy()
        applied_rules = []
        
        # Sort rules by priority
        sorted_rules = sorted(
            self.override_rules.items(), 
            key=lambda x: x[1]['priority']
        )
        
        for rule_name, rule in sorted_rules:
            try:
                # Check market-based conditions
                if 'market' in rule_name and rule['condition'](market_data):
                    modified_allocation = self._apply_rule_action(
                        modified_allocation, rule['action'], market_data, user_profile
                    )
                    applied_rules.append(f"{rule_name}: {rule['action']}")
                
                # Check user-based conditions
                elif 'user' in rule_name and rule['condition'](user_profile):
                    modified_allocation = self._apply_rule_action(
                        modified_allocation, rule['action'], market_data, user_profile
                    )
                    applied_rules.append(f"{rule_name}: {rule['action']}")
                    
            except Exception as e:
                logger.error(f"Error applying rule {rule_name}: {e}")
                continue
        
        # Normalize allocation to 100%
        total = sum(modified_allocation.values())
        if total > 0:
            modified_allocation = {k: v/total for k, v in modified_allocation.items()}
        
        return modified_allocation, applied_rules
    
    def _apply_rule_action(self, allocation: Dict[str, float], action: str, 
                          market_data: MarketData, user_profile: UserProfile) -> Dict[str, float]:
        """Apply specific rule action to allocation"""
        
        if action == 'reduce_equity_20_percent':
            equity_reduction = allocation.get('equity', 0) * 0.2
            allocation['equity'] = max(0, allocation.get('equity', 0) - equity_reduction)
            allocation['debt'] = allocation.get('debt', 0) + equity_reduction * 0.7
            allocation['liquid'] = allocation.get('liquid', 0) + equity_reduction * 0.3
            
        elif action == 'increase_debt_allocation':
            equity_to_move = allocation.get('equity', 0) * 0.15
            allocation['equity'] = max(0, allocation.get('equity', 0) - equity_to_move)
            allocation['debt'] = allocation.get('debt', 0) + equity_to_move
            
        elif action == 'add_gold_hedge_10_percent':
            total_to_move = 0.10
            equity_move = allocation.get('equity', 0) * 0.05
            debt_move = allocation.get('debt', 0) * 0.05
            
            allocation['equity'] = max(0, allocation.get('equity', 0) - equity_move)
            allocation['debt'] = max(0, allocation.get('debt', 0) - debt_move)
            allocation['gold'] = allocation.get('gold', 0) + equity_move + debt_move
            
        elif action == 'shift_to_conservative':
            # Move everything to low-risk instruments
            total_risky = allocation.get('equity', 0) + allocation.get('gold', 0)
            allocation['equity'] = allocation.get('equity', 0) * 0.3  # Reduce equity significantly
            allocation['debt'] = allocation.get('debt', 0) + total_risky * 0.5
            allocation['liquid'] = allocation.get('liquid', 0) + total_risky * 0.2
            
        elif action == 'prioritize_liquid_funds':
            # Increase liquid allocation for emergency fund building
            other_total = sum(v for k, v in allocation.items() if k != 'liquid')
            move_to_liquid = other_total * 0.3
            
            for key in allocation:
                if key != 'liquid':
                    allocation[key] = max(0, allocation[key] * 0.7)
            allocation['liquid'] = allocation.get('liquid', 0) + move_to_liquid
            
        elif action == 'defensive_allocation':
            # Bear market defensive allocation
            allocation['equity'] = min(allocation.get('equity', 0), 0.3)
            allocation['debt'] = max(allocation.get('debt', 0), 0.4)
            allocation['liquid'] = max(allocation.get('liquid', 0), 0.2)
            allocation['gold'] = max(allocation.get('gold', 0), 0.1)
        
        return allocation

class HybridInvestmentEngine:
    """Main engine combining ML predictions with real-time market intelligence"""
    
    def __init__(self):
        self.market_fetcher = MarketDataFetcher()
        self.ml_analyzer = MLBehaviorAnalyzer()
        self.risk_engine = RiskOverrideEngine()  # Basic risk engine
        self.advanced_risk_engine = AdvancedRiskOverrideEngine()  # Advanced risk analysis
        self.llm_reasoning = LLMReasoningLayer()  # AI reasoning layer
        self.ollama_service = None  # Will be injected
        
    async def generate_investment_recommendation(self, 
                                               user_id: int, 
                                               historical_data: Dict,
                                               use_ollama: bool = True) -> InvestmentRecommendation:
        """Generate comprehensive investment recommendation"""
        
        try:
            # Step 1: Get user profile from ML analysis
            user_profile = await self.ml_analyzer.analyze_user_behavior(user_id, historical_data)
            
            # Step 2: Get real-time market data
            market_data = await self.market_fetcher.fetch_comprehensive_market_data()
            
            # Step 3: Generate base allocation using ML
            base_allocation = self._generate_base_allocation(user_profile)
            
            # Step 4: Perform comprehensive risk analysis
            risk_metrics = await self.advanced_risk_engine.analyze_comprehensive_risk(
                user_profile, market_data, historical_data.get('transactions', []), 
                historical_data.get('biometrics', [])
            )
            
            # Apply advanced risk overrides
            final_allocation = risk_metrics.risk_adjusted_allocation or base_allocation
            applied_rules = [event.description for event in risk_metrics.active_risk_events]
            
            # Step 5: Generate specific instrument recommendations
            instruments = self._recommend_specific_instruments(final_allocation, market_data)
            
            # Step 6: Calculate optimal SIP amount
            sip_amount = self._calculate_optimal_sip(user_profile, final_allocation)
            
            # Step 7: Generate advanced LLM reasoning and insights
            reasoning_context = ReasoningContext(
                user_profile=asdict(user_profile),
                market_data=asdict(market_data),
                investment_recommendation={
                    'recommended_allocation': final_allocation,
                    'monthly_sip_amount': self._calculate_optimal_sip(user_profile, final_allocation),
                    'confidence_score': self._calculate_confidence_score(user_profile, market_data, applied_rules)
                },
                risk_metrics=asdict(risk_metrics) if hasattr(risk_metrics, '__dict__') else risk_metrics.__dict__,
                purchase_context=historical_data.get('current_purchase')
            )
            
            llm_response = await self.llm_reasoning.generate_investment_explanation(reasoning_context)
            reasoning = llm_response.explanation
            warnings = llm_response.warnings + risk_metrics.monitoring_alerts
            alternatives = self._generate_alternatives(final_allocation, market_data)
            
            # Step 8: Calculate confidence score with risk adjustment
            base_confidence = self._calculate_confidence_score(user_profile, market_data, applied_rules)
            confidence = base_confidence * risk_metrics.confidence_adjustment
            
            return InvestmentRecommendation(
                user_id=user_id,
                recommended_allocation=final_allocation,
                risk_level=user_profile.risk_appetite,
                monthly_sip_amount=sip_amount,
                specific_instruments=instruments,
                reasoning=reasoning,
                confidence_score=confidence,
                market_context=self._summarize_market_context(market_data),
                warnings=warnings,
                alternatives=alternatives,
                review_date=(datetime.now() + timedelta(days=30)).isoformat(),
                # Additional advanced fields
                risk_analysis={
                    'overall_risk_score': risk_metrics.overall_risk_score,
                    'category_risks': {k.value: v for k, v in risk_metrics.category_risks.items()},
                    'active_events_count': len(risk_metrics.active_risk_events),
                    'risk_summary': self.advanced_risk_engine.get_risk_summary_for_user(risk_metrics)
                },
                llm_insights={
                    'key_points': llm_response.key_points,
                    'confidence': llm_response.confidence,
                    'generated_at': llm_response.generated_at
                }
            )
            
        except Exception as e:
            logger.error(f"Error generating investment recommendation: {e}")
            return self._generate_fallback_recommendation(user_id)
    
    def _generate_base_allocation(self, user_profile: UserProfile) -> Dict[str, float]:
        """Generate base asset allocation based on user profile"""
        
        # Base allocations by risk appetite
        base_allocations = {
            RiskLevel.CONSERVATIVE: {
                'equity': 0.30, 'debt': 0.50, 'liquid': 0.15, 'gold': 0.05
            },
            RiskLevel.MODERATE: {
                'equity': 0.60, 'debt': 0.25, 'liquid': 0.10, 'gold': 0.05
            },
            RiskLevel.AGGRESSIVE: {
                'equity': 0.80, 'debt': 0.10, 'liquid': 0.05, 'gold': 0.05
            }
        }
        
        allocation = base_allocations[user_profile.risk_appetite].copy()
        
        # Adjust based on behavioral score
        if user_profile.behavioral_score > 0.7:  # High emotional behavior
            # Reduce equity, increase stable instruments
            equity_reduce = 0.15
            allocation['equity'] = max(0.2, allocation['equity'] - equity_reduce)
            allocation['debt'] += equity_reduce * 0.7
            allocation['liquid'] += equity_reduce * 0.3
        
        # Adjust based on investment horizon
        if user_profile.investment_horizon == "short":
            allocation['liquid'] = min(0.4, allocation['liquid'] + 0.2)
            allocation['equity'] = max(0.2, allocation['equity'] - 0.2)
        
        return allocation
    
    def _recommend_specific_instruments(self, allocation: Dict[str, float], 
                                      market_data: MarketData) -> List[Dict]:
        """Recommend specific investment instruments"""
        
        instruments = []
        
        # Equity recommendations
        if allocation.get('equity', 0) > 0:
            if market_data.market_condition == MarketCondition.VOLATILE:
                instruments.extend([
                    {
                        'type': 'equity',
                        'name': 'Large Cap Index Fund',
                        'allocation': allocation['equity'] * 0.6,
                        'reason': 'Stable during volatile markets'
                    },
                    {
                        'type': 'equity', 
                        'name': 'Multi-Cap Fund',
                        'allocation': allocation['equity'] * 0.4,
                        'reason': 'Diversified equity exposure'
                    }
                ])
            else:
                instruments.extend([
                    {
                        'type': 'equity',
                        'name': 'Nifty 50 Index Fund',
                        'allocation': allocation['equity'] * 0.5,
                        'reason': 'Low-cost broad market exposure'
                    },
                    {
                        'type': 'equity',
                        'name': 'Mid & Small Cap Fund',
                        'allocation': allocation['equity'] * 0.3,
                        'reason': 'Higher growth potential'
                    },
                    {
                        'type': 'equity',
                        'name': 'International Fund',
                        'allocation': allocation['equity'] * 0.2,
                        'reason': 'Global diversification'
                    }
                ])
        
        # Debt recommendations
        if allocation.get('debt', 0) > 0:
            if market_data.bond_yield_10y > 7.2:  # High yield environment
                instruments.append({
                    'type': 'debt',
                    'name': 'Long Duration Fund',
                    'allocation': allocation['debt'] * 0.6,
                    'reason': 'Lock in high yields'
                })
            else:
                instruments.append({
                    'type': 'debt', 
                    'name': 'Short Duration Fund',
                    'allocation': allocation['debt'] * 0.7,
                    'reason': 'Lower interest rate risk'
                })
            
            instruments.append({
                'type': 'debt',
                'name': 'Corporate Bond Fund',
                'allocation': allocation['debt'] * 0.3,
                'reason': 'Higher yield than government bonds'
            })
        
        # Liquid recommendations
        if allocation.get('liquid', 0) > 0:
            instruments.append({
                'type': 'liquid',
                'name': 'Liquid Fund',
                'allocation': allocation['liquid'],
                'reason': 'Emergency fund and short-term goals'
            })
        
        # Gold recommendations
        if allocation.get('gold', 0) > 0:
            instruments.append({
                'type': 'gold',
                'name': 'Gold ETF',
                'allocation': allocation['gold'],
                'reason': 'Hedge against inflation and currency'
            })
        
        return instruments
    
    def _calculate_optimal_sip(self, user_profile: UserProfile, allocation: Dict[str, float]) -> float:
        """Calculate optimal SIP amount based on surplus and allocation"""
        
        # Use 80% of surplus for systematic investing
        available_for_sip = user_profile.monthly_surplus * 0.8
        
        # Adjust based on emergency fund status
        if user_profile.emergency_fund_months < 6:
            # Reserve more for emergency fund building
            available_for_sip *= 0.6
        
        # Minimum SIP amount
        return max(1000, min(available_for_sip, 25000))
    
    def _generate_reasoning(self, user_profile: UserProfile, market_data: MarketData, 
                          applied_rules: List[str], use_ollama: bool = True) -> str:
        """Generate human-readable reasoning for the recommendation"""
        
        reasoning_parts = []
        
        # User profile reasoning
        reasoning_parts.append(
            f"Based on your {user_profile.risk_appetite.value} risk profile and "
            f"monthly surplus of ₹{user_profile.monthly_surplus:,.0f}, "
            f"we recommend a balanced approach."
        )
        
        # Market context reasoning
        market_context = ""
        if market_data.market_condition == MarketCondition.VOLATILE:
            market_context = "Given current market volatility (VIX: {:.1f}), we've increased stable allocations.".format(market_data.vix_level)
        elif market_data.market_condition == MarketCondition.BEAR:
            market_context = "In the current bear market, we've adopted a defensive stance."
        elif market_data.nifty_change > 2:
            market_context = "With markets showing strong momentum, we maintain growth focus with risk management."
        
        if market_context:
            reasoning_parts.append(market_context)
        
        # Applied rules reasoning
        if applied_rules:
            rule_summary = f"Market conditions triggered {len(applied_rules)} risk adjustments: "
            rule_summary += "; ".join(applied_rules[:2])  # Show first 2 rules
            reasoning_parts.append(rule_summary)
        
        # Emergency fund reasoning
        if user_profile.emergency_fund_months < 6:
            reasoning_parts.append(
                f"Your emergency fund covers {user_profile.emergency_fund_months:.1f} months. "
                "We recommend building this to 6 months before aggressive investing."
            )
        
        return " ".join(reasoning_parts)
    
    def _generate_warnings(self, user_profile: UserProfile, market_data: MarketData, 
                         allocation: Dict[str, float]) -> List[str]:
        """Generate warnings based on conditions"""
        
        warnings = []
        
        # High behavioral score warning
        if user_profile.behavioral_score > 0.6:
            warnings.append(
                "⚠️ High emotional decision tendency detected. Consider systematic investing to avoid timing mistakes."
            )
        
        # High stress warning
        if user_profile.stress_baseline > 6:
            warnings.append(
                "⚠️ Elevated stress levels may affect investment decisions. Consider stress management techniques."
            )
        
        # Low emergency fund warning
        if user_profile.emergency_fund_months < 3:
            warnings.append(
                "🚨 Critical: Build emergency fund before investing. Aim for 6 months of expenses."
            )
        
        # Market volatility warning
        if market_data.vix_level > 25:
            warnings.append(
                "⚠️ High market volatility detected. Expect short-term fluctuations in portfolio value."
            )
        
        # High equity allocation in bear market
        if market_data.market_condition == MarketCondition.BEAR and allocation.get('equity', 0) > 0.6:
            warnings.append(
                "⚠️ High equity allocation during bear market. Consider reducing risk if needed."
            )
        
        return warnings
    
    def _generate_alternatives(self, allocation: Dict[str, float], 
                             market_data: MarketData) -> List[Dict]:
        """Generate alternative investment strategies"""
        
        alternatives = []
        
        # Conservative alternative
        alternatives.append({
            'name': 'Conservative Approach',
            'allocation': {'equity': 0.3, 'debt': 0.5, 'liquid': 0.2},
            'description': 'Lower risk, stable returns, suitable for risk-averse investors',
            'expected_return': '8-10% annually'
        })
        
        # Aggressive alternative
        alternatives.append({
            'name': 'Growth Focused',
            'allocation': {'equity': 0.8, 'debt': 0.1, 'liquid': 0.1},
            'description': 'Higher risk, higher potential returns, suitable for young investors',
            'expected_return': '12-15% annually'
        })
        
        # Defensive alternative (for volatile markets)
        if market_data.vix_level > 20:
            alternatives.append({
                'name': 'Market Defensive',
                'allocation': {'equity': 0.4, 'debt': 0.4, 'liquid': 0.15, 'gold': 0.05},
                'description': 'Defensive allocation for volatile market conditions',
                'expected_return': '9-11% annually'
            })
        
        return alternatives
    
    def _calculate_confidence_score(self, user_profile: UserProfile, market_data: MarketData, 
                                  applied_rules: List[str]) -> float:
        """Calculate confidence score for the recommendation"""
        
        confidence = 0.8  # Base confidence
        
        # Reduce confidence for high volatility
        if market_data.vix_level > 25:
            confidence -= 0.1
        
        # Reduce confidence for high behavioral score (unpredictable user)
        if user_profile.behavioral_score > 0.7:
            confidence -= 0.1
        
        # Increase confidence if multiple rules applied (more data-driven)
        if len(applied_rules) >= 2:
            confidence += 0.05
        
        # Reduce confidence for very low emergency fund
        if user_profile.emergency_fund_months < 2:
            confidence -= 0.15
        
        return max(0.5, min(0.95, confidence))
    
    def _summarize_market_context(self, market_data: MarketData) -> str:
        """Summarize current market context"""
        
        context_parts = []
        
        # Index performance
        nifty_direction = "up" if market_data.nifty_change > 0 else "down"
        context_parts.append(f"Nifty 50 {nifty_direction} {abs(market_data.nifty_change):.1f}%")
        
        # Volatility
        vix_level = "high" if market_data.vix_level > 25 else "moderate" if market_data.vix_level > 18 else "low"
        context_parts.append(f"volatility {vix_level} (VIX: {market_data.vix_level:.1f})")
        
        # Bond yields
        yield_trend = "elevated" if market_data.bond_yield_10y > 7.2 else "moderate"
        context_parts.append(f"bond yields {yield_trend} ({market_data.bond_yield_10y:.1f}%)")
        
        return "Market: " + ", ".join(context_parts) + f". Condition: {market_data.market_condition.value}."
    
    def _generate_fallback_recommendation(self, user_id: int) -> InvestmentRecommendation:
        """Generate fallback recommendation if main analysis fails"""
        
        return InvestmentRecommendation(
            user_id=user_id,
            recommended_allocation={'equity': 0.6, 'debt': 0.3, 'liquid': 0.1},
            risk_level=RiskLevel.MODERATE,
            monthly_sip_amount=5000,
            specific_instruments=[
                {
                    'type': 'equity',
                    'name': 'Nifty 50 Index Fund',
                    'allocation': 0.6,
                    'reason': 'Broad market exposure'
                }
            ],
            reasoning="Default balanced recommendation due to analysis error. Please review with financial advisor.",
            confidence_score=0.6,
            market_context="Unable to fetch current market data.",
            warnings=["⚠️ Recommendation generated with limited data. Please review."],
            alternatives=[],
            review_date=(datetime.now() + timedelta(days=7)).isoformat()
        )

# Global instance
hybrid_investment_engine = HybridInvestmentEngine()
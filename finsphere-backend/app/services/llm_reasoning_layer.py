"""
LLM Reasoning Layer - Production Implementation
Uses Ollama to provide natural language explanations and justifications for investment recommendations
"""

import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import requests

logger = logging.getLogger(__name__)

@dataclass
class ReasoningContext:
    user_profile: Dict[str, Any]
    market_data: Dict[str, Any]
    investment_recommendation: Dict[str, Any]
    risk_metrics: Dict[str, Any]
    purchase_context: Optional[Dict[str, Any]] = None
    user_query: Optional[str] = None

@dataclass
class LLMResponse:
    explanation: str
    key_points: List[str]
    warnings: List[str]
    confidence: float
    reasoning_type: str
    generated_at: str

class LLMReasoningLayer:
    """
    Production LLM reasoning layer for investment explanations
    """
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model = "qwen:7b"  # GPT-OSS:20-cloud equivalent
        self.reasoning_templates = self._initialize_reasoning_templates()
        self.context_enhancers = self._initialize_context_enhancers()
        
    def _initialize_reasoning_templates(self) -> Dict[str, str]:
        """Initialize reasoning prompt templates for different scenarios"""
        return {
            'investment_recommendation': """
As a certified financial advisor with expertise in Indian markets, provide a clear, personalized explanation for this investment recommendation.

USER PROFILE:
- Risk Appetite: {risk_appetite}
- Monthly Surplus: ₹{monthly_surplus:,}
- Emergency Fund: {emergency_fund_months:.1f} months
- Stress Level: {stress_baseline:.1f}/10
- Spending Personality: {spending_personality}
- Investment Experience: {investment_horizon}
- Behavioral Score: {behavioral_score:.2f} (higher = more impulsive)

CURRENT MARKET CONDITIONS:
- Nifty 50: {nifty_change:+.1f}% today
- Market Volatility (VIX): {vix_level:.1f}
- Market Phase: {market_condition}
- Bond Yields: {bond_yield_10y:.1f}%
- USD/INR: {usd_inr:.2f}
- Gold: ₹{gold_price:,}/10g

RECOMMENDED PORTFOLIO:
- Equity: {equity_percent:.0f}%
- Debt: {debt_percent:.0f}%  
- Liquid: {liquid_percent:.0f}%
- Gold: {gold_percent:.0f}%
- Monthly SIP: ₹{monthly_sip:,}

RISK ANALYSIS:
- Overall Risk Score: {overall_risk_score:.1f}/10
- Active Risk Events: {active_risk_events}
- Confidence Level: {confidence_score:.0f}%

CONTEXT: {context_description}

Provide a 3-4 sentence explanation that:
1. Explains WHY this allocation makes sense for this specific user
2. Addresses current market conditions and their impact
3. Highlights any important warnings or considerations
4. Uses simple, non-technical language

Focus on being helpful, personal, and actionable. Avoid generic advice.
""",

            'purchase_analysis': """
As a behavioral finance expert, analyze this purchase decision and provide actionable guidance.

USER FINANCIAL STATE:
- Monthly Income: ₹{monthly_income:,}
- Monthly Expenses: ₹{monthly_expenses:,}
- Savings Rate: {savings_rate:.1f}%
- Emergency Fund: {emergency_fund_months:.1f} months
- Current Stress: {current_stress:.1f}/10
- Recent Spending: ₹{recent_spending:,} (last 30 days)

PURCHASE DETAILS:
- Item: {product_name}
- Amount: ₹{purchase_amount:,}
- Category: {category}
- Website: {website}

BEHAVIORAL ANALYSIS:
- Spending Pattern: {spending_personality}
- Impulse Score: {behavioral_score:.2f}
- Recent Interventions: {recent_interventions}
- Time on Page: {time_on_page} seconds

INVESTMENT OPPORTUNITY:
If this ₹{purchase_amount:,} was invested instead:
- Monthly SIP equivalent: ₹{equivalent_sip:,}
- Potential 10-year value: ₹{projected_value:,} (assuming 12% returns)

MARKET CONTEXT: {market_context}

Provide a balanced 2-3 sentence analysis that:
1. Acknowledges the user's situation without being judgmental
2. Explains the opportunity cost in simple terms
3. Offers a practical recommendation (buy, wait, or find alternative)
4. Considers both emotional and financial factors

Be supportive and focus on long-term financial wellness.
""",

            'risk_explanation': """
As a risk management specialist, explain the current risk situation and recommended actions.

RISK ASSESSMENT:
- Overall Risk Level: {overall_risk_score:.1f}/10 ({risk_level})
- Market Risk: {market_risk:.1f}/10
- Behavioral Risk: {behavioral_risk:.1f}/10  
- Liquidity Risk: {liquidity_risk:.1f}/10
- Systemic Risk: {systemic_risk:.1f}/10

ACTIVE RISK EVENTS:
{risk_events_description}

CURRENT MARKET CONDITIONS:
- Market Phase: {market_condition}
- Volatility: {volatility_level}
- Recent Performance: {recent_performance}

RISK ADJUSTMENTS MADE:
{adjustments_made}

USER CONTEXT:
- Risk Tolerance: {risk_appetite}
- Financial Cushion: {emergency_fund_months:.1f} months
- Stress Level: {stress_level:.1f}/10

Provide a clear 2-3 sentence explanation that:
1. Summarizes the key risk factors in simple terms
2. Explains why the adjustments were made
3. Gives actionable guidance for the user
4. Reassures about the protective measures in place

Use calm, confident language that builds trust while acknowledging risks.
""",

            'market_update': """
As a market analyst, provide a concise market update and its implications for investors.

MARKET SNAPSHOT:
- Nifty 50: {nifty_current:,.0f} ({nifty_change:+.1f}%)
- Sensex: {sensex_current:,.0f} ({sensex_change:+.1f}%)
- VIX: {vix_level:.1f} ({volatility_interpretation})
- Market Condition: {market_condition}

SECTOR PERFORMANCE:
{sector_performance_summary}

ECONOMIC INDICATORS:
- 10Y Bond Yield: {bond_yield:.2f}%
- USD/INR: {usd_inr:.2f}
- Gold: ₹{gold_price:,}/10g

IMPLICATIONS FOR INVESTORS:
{market_implications}

Provide a 2-3 sentence market commentary that:
1. Summarizes the key market moves and their drivers
2. Explains what this means for different types of investors
3. Offers actionable guidance for portfolio management
4. Uses accessible language without market jargon

Focus on practical implications rather than technical analysis.
""",

            'goal_planning': """
As a financial planning expert, help explain how to achieve this financial goal.

FINANCIAL GOAL:
- Goal: {goal_name}
- Target Amount: ₹{target_amount:,}
- Time Horizon: {time_horizon} years
- Current Savings: ₹{current_savings:,}
- Gap to Fill: ₹{gap_amount:,}

USER PROFILE:
- Monthly Surplus: ₹{monthly_surplus:,}
- Risk Appetite: {risk_appetite}
- Current Age: {current_age}
- Target Age: {target_age}

RECOMMENDED STRATEGY:
- Monthly Investment: ₹{required_sip:,}
- Asset Allocation: {allocation_summary}
- Expected Return: {expected_return:.1f}% annually
- Probability of Success: {success_probability:.0f}%

MARKET CONDITIONS:
{market_context}

Provide a motivating 3-4 sentence plan that:
1. Confirms the goal is achievable with discipline
2. Explains the investment strategy in simple terms
3. Highlights key milestones or checkpoints
4. Addresses any challenges and how to overcome them

Use encouraging language that builds confidence in the plan.
"""
        }
    
    def _initialize_context_enhancers(self) -> Dict[str, callable]:
        """Initialize context enhancement functions"""
        return {
            'investment_recommendation': self._enhance_investment_context,
            'purchase_analysis': self._enhance_purchase_context,
            'risk_explanation': self._enhance_risk_context,
            'market_update': self._enhance_market_context,
            'goal_planning': self._enhance_goal_context
        }
    
    async def generate_investment_explanation(self, context: ReasoningContext) -> LLMResponse:
        """Generate natural language explanation for investment recommendation"""
        try:
            # Enhance context with additional details
            enhanced_context = self._enhance_investment_context(context)
            
            # Create prompt from template
            prompt = self.reasoning_templates['investment_recommendation'].format(**enhanced_context)
            
            # Query Ollama
            explanation = await self._query_ollama(prompt)
            
            # Extract key points and warnings
            key_points, warnings = self._extract_structured_insights(explanation, 'investment')
            
            return LLMResponse(
                explanation=explanation,
                key_points=key_points,
                warnings=warnings,
                confidence=enhanced_context.get('confidence_score', 80) / 100,
                reasoning_type='investment_recommendation',
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating investment explanation: {e}")
            return self._get_fallback_explanation('investment_recommendation', context)
    
    async def generate_purchase_analysis(self, context: ReasoningContext) -> LLMResponse:
        """Generate natural language analysis for purchase decisions"""
        try:
            enhanced_context = self._enhance_purchase_context(context)
            prompt = self.reasoning_templates['purchase_analysis'].format(**enhanced_context)
            
            explanation = await self._query_ollama(prompt)
            key_points, warnings = self._extract_structured_insights(explanation, 'purchase')
            
            return LLMResponse(
                explanation=explanation,
                key_points=key_points,
                warnings=warnings,
                confidence=0.85,
                reasoning_type='purchase_analysis',
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating purchase analysis: {e}")
            return self._get_fallback_explanation('purchase_analysis', context)
    
    async def generate_risk_explanation(self, context: ReasoningContext) -> LLMResponse:
        """Generate explanation for risk adjustments"""
        try:
            enhanced_context = self._enhance_risk_context(context)
            prompt = self.reasoning_templates['risk_explanation'].format(**enhanced_context)
            
            explanation = await self._query_ollama(prompt)
            key_points, warnings = self._extract_structured_insights(explanation, 'risk')
            
            return LLMResponse(
                explanation=explanation,
                key_points=key_points,
                warnings=warnings,
                confidence=0.9,
                reasoning_type='risk_explanation',
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating risk explanation: {e}")
            return self._get_fallback_explanation('risk_explanation', context)
    
    async def generate_market_commentary(self, context: ReasoningContext) -> LLMResponse:
        """Generate market update commentary"""
        try:
            enhanced_context = self._enhance_market_context(context)
            prompt = self.reasoning_templates['market_update'].format(**enhanced_context)
            
            explanation = await self._query_ollama(prompt)
            key_points, warnings = self._extract_structured_insights(explanation, 'market')
            
            return LLMResponse(
                explanation=explanation,
                key_points=key_points,
                warnings=warnings,
                confidence=0.8,
                reasoning_type='market_update',
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating market commentary: {e}")
            return self._get_fallback_explanation('market_update', context)
    
    async def generate_goal_planning_advice(self, context: ReasoningContext) -> LLMResponse:
        """Generate goal planning explanation"""
        try:
            enhanced_context = self._enhance_goal_context(context)
            prompt = self.reasoning_templates['goal_planning'].format(**enhanced_context)
            
            explanation = await self._query_ollama(prompt)
            key_points, warnings = self._extract_structured_insights(explanation, 'goal')
            
            return LLMResponse(
                explanation=explanation,
                key_points=key_points,
                warnings=warnings,
                confidence=0.85,
                reasoning_type='goal_planning',
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error generating goal planning advice: {e}")
            return self._get_fallback_explanation('goal_planning', context)
    
    def _enhance_investment_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """Enhance context for investment recommendation explanations"""
        
        user_profile = context.user_profile
        market_data = context.market_data
        recommendation = context.investment_recommendation
        risk_metrics = context.risk_metrics or {}
        
        # Calculate percentages for allocation
        allocation = recommendation.get('recommended_allocation', {})
        
        enhanced = {
            # User profile
            'risk_appetite': user_profile.get('risk_appetite', 'moderate'),
            'monthly_surplus': user_profile.get('monthly_surplus', 5000),
            'emergency_fund_months': user_profile.get('emergency_fund_months', 3),
            'stress_baseline': user_profile.get('stress_baseline', 5),
            'spending_personality': user_profile.get('spending_personality', 'balanced'),
            'investment_horizon': user_profile.get('investment_horizon', 'medium'),
            'behavioral_score': user_profile.get('behavioral_score', 0.3),
            
            # Market data
            'nifty_change': market_data.get('nifty_change', 0),
            'vix_level': market_data.get('vix_level', 18),
            'market_condition': market_data.get('market_condition', 'sideways'),
            'bond_yield_10y': market_data.get('bond_yield_10y', 7.1),
            'usd_inr': market_data.get('usd_inr', 83.2),
            'gold_price': market_data.get('gold_price', 65000),
            
            # Allocation percentages
            'equity_percent': allocation.get('equity', 0.6) * 100,
            'debt_percent': allocation.get('debt', 0.25) * 100,
            'liquid_percent': allocation.get('liquid', 0.1) * 100,
            'gold_percent': allocation.get('gold', 0.05) * 100,
            
            # Recommendation details
            'monthly_sip': recommendation.get('monthly_sip_amount', 5000),
            'confidence_score': recommendation.get('confidence_score', 0.8) * 100,
            
            # Risk metrics
            'overall_risk_score': risk_metrics.get('overall_risk_score', 5.0),
            'active_risk_events': len(risk_metrics.get('active_risk_events', [])),
            
            # Context
            'context_description': self._generate_context_description(context)
        }
        
        return enhanced
    
    def _enhance_purchase_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """Enhance context for purchase analysis"""
        
        user_profile = context.user_profile
        purchase_context = context.purchase_context or {}
        market_data = context.market_data
        
        purchase_amount = purchase_context.get('amount', 0)
        equivalent_sip = min(purchase_amount / 12, user_profile.get('monthly_surplus', 5000))
        projected_value = purchase_amount * (1.12 ** 10)  # 12% for 10 years
        
        enhanced = {
            # User financials
            'monthly_income': user_profile.get('monthly_income', user_profile.get('monthly_surplus', 5000) * 5),
            'monthly_expenses': user_profile.get('monthly_expenses', user_profile.get('monthly_surplus', 5000) * 4),
            'savings_rate': (user_profile.get('monthly_surplus', 5000) / (user_profile.get('monthly_surplus', 5000) * 5)) * 100,
            'emergency_fund_months': user_profile.get('emergency_fund_months', 3),
            'current_stress': user_profile.get('stress_baseline', 5),
            'recent_spending': purchase_context.get('recent_spending', purchase_amount * 2),
            
            # Purchase details
            'product_name': purchase_context.get('product_name', 'this item'),
            'purchase_amount': purchase_amount,
            'category': purchase_context.get('category', 'general'),
            'website': purchase_context.get('website', 'online store'),
            
            # Behavioral data
            'spending_personality': user_profile.get('spending_personality', 'balanced'),
            'behavioral_score': user_profile.get('behavioral_score', 0.3),
            'recent_interventions': purchase_context.get('recent_interventions', 0),
            'time_on_page': purchase_context.get('time_on_page', 60),
            
            # Investment opportunity
            'equivalent_sip': equivalent_sip,
            'projected_value': projected_value,
            
            # Market context
            'market_context': f"Current market: {market_data.get('market_condition', 'stable')}, Nifty {market_data.get('nifty_change', 0):+.1f}%"
        }
        
        return enhanced
    
    def _enhance_risk_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """Enhance context for risk explanations"""
        
        risk_metrics = context.risk_metrics or {}
        user_profile = context.user_profile
        market_data = context.market_data
        
        # Extract risk scores by category
        category_risks = risk_metrics.get('category_risks', {})
        
        # Determine risk level
        overall_risk = risk_metrics.get('overall_risk_score', 5.0)
        risk_level = 'High' if overall_risk > 7 else 'Moderate' if overall_risk > 4 else 'Low'
        
        enhanced = {
            'overall_risk_score': overall_risk,
            'risk_level': risk_level,
            'market_risk': category_risks.get('market_risk', 3.0),
            'behavioral_risk': category_risks.get('user_behavioral_risk', 3.0),
            'liquidity_risk': category_risks.get('liquidity_risk', 3.0),
            'systemic_risk': category_risks.get('systemic_risk', 3.0),
            
            'risk_events_description': self._summarize_risk_events(risk_metrics.get('active_risk_events', [])),
            'market_condition': market_data.get('market_condition', 'stable'),
            'volatility_level': self._interpret_volatility(market_data.get('vix_level', 18)),
            'recent_performance': f"Nifty {market_data.get('nifty_change', 0):+.1f}%",
            
            'adjustments_made': self._summarize_adjustments(risk_metrics.get('active_risk_events', [])),
            'risk_appetite': user_profile.get('risk_appetite', 'moderate'),
            'emergency_fund_months': user_profile.get('emergency_fund_months', 3),
            'stress_level': user_profile.get('stress_baseline', 5)
        }
        
        return enhanced
    
    def _enhance_market_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """Enhance context for market updates"""
        
        market_data = context.market_data
        
        enhanced = {
            'nifty_current': 19800 + (market_data.get('nifty_change', 0) / 100 * 19800),
            'nifty_change': market_data.get('nifty_change', 0),
            'sensex_current': 66500 + (market_data.get('sensex_change', 0) / 100 * 66500),
            'sensex_change': market_data.get('sensex_change', 0),
            'vix_level': market_data.get('vix_level', 18),
            'volatility_interpretation': self._interpret_volatility(market_data.get('vix_level', 18)),
            'market_condition': market_data.get('market_condition', 'sideways'),
            
            'sector_performance_summary': self._summarize_sectors(market_data.get('sector_performance', {})),
            'bond_yield': market_data.get('bond_yield_10y', 7.1),
            'usd_inr': market_data.get('usd_inr', 83.2),
            'gold_price': market_data.get('gold_price', 65000),
            
            'market_implications': self._generate_market_implications(market_data)
        }
        
        return enhanced
    
    def _enhance_goal_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """Enhance context for goal planning"""
        
        # This would be used for goal-specific explanations
        user_profile = context.user_profile
        goal_data = context.user_query or {}  # Goal details would be passed here
        
        enhanced = {
            'goal_name': goal_data.get('goal_name', 'Wealth Building'),
            'target_amount': goal_data.get('target_amount', 1000000),
            'time_horizon': goal_data.get('time_horizon', 10),
            'current_savings': goal_data.get('current_savings', 0),
            'gap_amount': goal_data.get('target_amount', 1000000) - goal_data.get('current_savings', 0),
            
            'monthly_surplus': user_profile.get('monthly_surplus', 5000),
            'risk_appetite': user_profile.get('risk_appetite', 'moderate'),
            'current_age': user_profile.get('age', 30),
            'target_age': user_profile.get('age', 30) + goal_data.get('time_horizon', 10),
            
            'required_sip': goal_data.get('required_sip', 5000),
            'allocation_summary': 'Equity-focused portfolio',
            'expected_return': 12,
            'success_probability': 85,
            
            'market_context': f"Current market conditions support long-term wealth building"
        }
        
        return enhanced
    
    async def _query_ollama(self, prompt: str) -> str:
        """Query Ollama API for natural language generation"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "top_k": 40
                    }
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error querying Ollama: {e}")
            return None
    
    def _extract_structured_insights(self, explanation: str, reasoning_type: str) -> tuple:
        """Extract key points and warnings from explanation"""
        
        # Simple extraction based on common patterns
        key_points = []
        warnings = []
        
        if not explanation:
            return key_points, warnings
        
        sentences = explanation.split('. ')
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Identify warnings
            warning_indicators = ['warning', 'caution', 'risk', 'careful', 'avoid', 'concern']
            if any(indicator in sentence.lower() for indicator in warning_indicators):
                warnings.append(sentence)
            # Identify key insights
            elif len(sentence) > 20 and ('because' in sentence.lower() or 'since' in sentence.lower() or 'due to' in sentence.lower()):
                key_points.append(sentence)
        
        # Ensure we have at least some content
        if not key_points and not warnings and sentences:
            key_points = [sentences[0]]  # Take first sentence as key point
            
        return key_points[:3], warnings[:2]  # Limit to most important
    
    def _generate_context_description(self, context: ReasoningContext) -> str:
        """Generate context description for the current situation"""
        
        if context.purchase_context:
            purchase = context.purchase_context
            return f"User considering ₹{purchase.get('amount', 0):,} purchase of {purchase.get('product_name', 'item')} - analyzing investment opportunity cost"
        else:
            return "Regular portfolio review and investment planning"
    
    def _summarize_risk_events(self, risk_events: List) -> str:
        """Summarize active risk events"""
        if not risk_events:
            return "No active risk events detected"
        
        high_priority = [e for e in risk_events if e.get('severity', 1) >= 3]
        if high_priority:
            return f"{len(high_priority)} high-priority risks including: {high_priority[0].get('description', 'market conditions')}"
        else:
            return f"{len(risk_events)} risk factors being monitored"
    
    def _interpret_volatility(self, vix_level: float) -> str:
        """Interpret VIX level in plain language"""
        if vix_level > 25:
            return "High volatility"
        elif vix_level > 18:
            return "Moderate volatility"
        else:
            return "Low volatility"
    
    def _summarize_adjustments(self, risk_events: List) -> str:
        """Summarize risk adjustments made"""
        if not risk_events:
            return "No adjustments needed"
        
        adjustments = []
        for event in risk_events[:2]:  # Top 2 events
            if 'equity' in event.get('affected_assets', []):
                adjustments.append("reduced equity allocation")
            if 'liquid' in event.get('affected_assets', []):
                adjustments.append("increased liquid funds")
        
        return ", ".join(adjustments) if adjustments else "Portfolio rebalancing applied"
    
    def _summarize_sectors(self, sector_performance: Dict) -> str:
        """Summarize sector performance"""
        if not sector_performance:
            return "Mixed sector performance"
        
        sorted_sectors = sorted(sector_performance.items(), key=lambda x: x[1], reverse=True)
        best = sorted_sectors[0] if sorted_sectors else ('IT', 1)
        worst = sorted_sectors[-1] if sorted_sectors else ('Banking', -1)
        
        return f"{best[0]} leading ({best[1]:+.1f}%), {worst[0]} lagging ({worst[1]:+.1f}%)"
    
    def _generate_market_implications(self, market_data: Dict) -> str:
        """Generate market implications summary"""
        condition = market_data.get('market_condition', 'sideways')
        
        implications = {
            'bull': 'Favorable for growth investments, maintain equity allocation',
            'bear': 'Defensive positioning recommended, focus on quality',
            'volatile': 'Emphasize diversification, avoid timing attempts',
            'sideways': 'Range-bound market, systematic investing preferred'
        }
        
        return implications.get(condition, 'Maintain balanced approach')
    
    def _get_fallback_explanation(self, reasoning_type: str, context: ReasoningContext) -> LLMResponse:
        """Generate fallback explanation when LLM is unavailable"""
        
        fallback_explanations = {
            'investment_recommendation': "This allocation balances growth potential with risk management based on your profile and current market conditions. The recommended systematic investment approach helps reduce market timing risks while building wealth over time.",
            
            'purchase_analysis': f"Consider if this purchase aligns with your financial goals. The same amount invested could grow significantly over time through systematic investing.",
            
            'risk_explanation': "Current risk levels require some portfolio adjustments to maintain appropriate balance between growth and safety. These changes help protect your investments during uncertain periods.",
            
            'market_update': "Mixed market conditions suggest maintaining a balanced investment approach. Focus on systematic investing rather than trying to time market movements.",
            
            'goal_planning': "Your financial goal is achievable with disciplined systematic investing and the right asset allocation. Stay consistent with your investment plan and review progress regularly."
        }
        
        return LLMResponse(
            explanation=fallback_explanations.get(reasoning_type, "Investment analysis completed with current market considerations."),
            key_points=["Balanced approach recommended", "Focus on systematic investing", "Regular review important"],
            warnings=["Market conditions may change", "Maintain emergency fund"],
            confidence=0.7,
            reasoning_type=reasoning_type,
            generated_at=datetime.now().isoformat()
        )

# Global instance
llm_reasoning_layer = LLMReasoningLayer()
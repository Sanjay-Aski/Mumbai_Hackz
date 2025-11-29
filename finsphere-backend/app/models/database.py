from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    profession = Column(String)
    location = Column(String)
    income_monthly = Column(Float)
    income_secondary = Column(Float, default=0.0)  # Freelance, side income
    expenses_fixed = Column(Float, default=0.0)     # Rent, EMIs, etc
    expenses_variable = Column(Float, default=0.0)  # Food, entertainment
    savings_current = Column(Float, default=0.0)    # Current savings amount
    savings_target = Column(Float)
    debt_total = Column(Float, default=0.0)         # Total debt amount
    financial_goal = Column(String)                 # Primary financial goal
    risk_tolerance = Column(String, default="medium") # low, medium, high
    spending_personality = Column(String)           # impulsive, planned, stress-driven
    stress_baseline = Column(Float, default=0.3)
    emotional_baseline = Column(Float, default=0.5) # 0-1 scale for emotional state
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    biometric_data = relationship("BiometricReading", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    interventions = relationship("Intervention", back_populates="user")
    gig_work = relationship("GigWork", back_populates="user")
    financial_goals = relationship("FinancialGoal")
    budget_categories = relationship("BudgetCategory")
    spending_insights = relationship("SpendingInsight")
    behavior_patterns = relationship("UserBehaviorPattern")

class BiometricReading(Base):
    __tablename__ = "biometric_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    heart_rate = Column(Integer, nullable=False)
    hrv_ms = Column(Float, nullable=False)
    stress_score = Column(Float, nullable=False)
    emotional_state = Column(String)  # anxious, excited, calm, frustrated
    energy_level = Column(Float)      # 0-1 scale for energy/fatigue
    sleep_quality = Column(Float)     # Previous night's sleep quality (0-1)
    location_type = Column(String)    # office, home, commute, social
    activity_type = Column(String)    # meeting, coding, exercise, eating
    social_context = Column(String)   # alone, with_colleagues, family, friends
    external_factors = Column(JSON)   # weather, events, deadlines
    context = Column(String)          # Detailed context description
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="biometric_data")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    merchant = Column(String, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String)      # More specific categorization
    necessity_level = Column(String)  # essential, important, nice-to-have, luxury
    purchase_trigger = Column(String) # stress, boredom, social, need, sale
    decision_time = Column(Integer)   # Seconds spent on decision
    comparison_shopping = Column(Boolean, default=False)  # Did user compare prices
    budget_category = Column(String)  # Which budget category this affects
    planned_purchase = Column(Boolean, default=False)    # Was this planned
    emotional_state = Column(String)  # User's emotional state during purchase
    stress_at_time = Column(Float)
    energy_at_time = Column(Float)    # Energy level during purchase
    social_influence = Column(String) # peer_pressure, recommendation, none
    payment_method = Column(String)   # credit_card, debit_card, cash, upi
    location_type = Column(String)    # online, physical_store, mobile_app
    intervention_shown = Column(Boolean, default=False)
    intervention_type = Column(String) # Type of intervention shown
    user_proceeded = Column(Boolean, default=True)
    regret_score = Column(Float)      # User's later regret about purchase (0-1)
    satisfaction_score = Column(Float) # User's satisfaction with purchase (0-1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="transactions")

class Intervention(Base):
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    url = Column(String, nullable=False)
    website_category = Column(String)         # ecommerce, food_delivery, travel
    product_category = Column(String)         # electronics, clothing, food
    estimated_amount = Column(Float)          # Estimated purchase amount
    reason = Column(String, nullable=False)   # Why intervention triggered
    trigger_factors = Column(JSON)            # List of factors that triggered
    severity = Column(String, nullable=False) # low, medium, high, critical
    intervention_type = Column(String)        # overlay, notification, delay, block
    message_shown = Column(Text)              # Actual message displayed
    personalization_factors = Column(JSON)    # What made this personal
    user_stress_level = Column(Float)         # Stress level at intervention
    user_emotional_state = Column(String)     # Emotional state at time
    decision_factors = Column(JSON)           # Factors that influenced decision
    user_action = Column(String)              # dismiss, snooze, proceed, cancel_purchase
    action_timestamp = Column(DateTime(timezone=True)) # When user took action
    delay_minutes = Column(Integer)           # Actual delay caused
    interaction_count = Column(Integer, default=1)    # How many times user interacted
    final_outcome = Column(String)            # purchased, delayed, cancelled, unknown
    effectiveness = Column(String)            # prevented_purchase, delayed_purchase, failed_prevention
    user_feedback = Column(String)            # User's feedback on intervention
    learning_data = Column(JSON)              # Data for ML improvement
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="interventions")

class GigWork(Base):
    __tablename__ = "gig_work"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    platform = Column(String, nullable=False)  # Upwork, Fiverr, etc.
    project_value = Column(Float, nullable=False)
    quoted_price = Column(Float, nullable=False)
    final_price = Column(Float)
    stress_at_time = Column(Float)
    intervention_shown = Column(Boolean, default=False)
    user_action = Column(String)  # revised_higher, kept_same, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="gig_work")

class UserPermissions(Base):
    __tablename__ = "user_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    biometric_data = Column(Boolean, default=True)
    browsing_behavior = Column(Boolean, default=True)
    transaction_data = Column(Boolean, default=False)
    communication_sentiment = Column(Boolean, default=False)
    intervention_analytics = Column(Boolean, default=True)
    financial_coaching = Column(Boolean, default=True)
    spending_insights = Column(Boolean, default=True)
    goal_tracking = Column(Boolean, default=True)
    data_retention_days = Column(Integer, default=90)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FinancialGoal(Base):
    __tablename__ = "financial_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_type = Column(String, nullable=False)        # emergency_fund, vacation, house, car
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime(timezone=True))
    priority = Column(String, default="medium")       # low, medium, high
    status = Column(String, default="active")         # active, paused, completed, cancelled
    monthly_contribution = Column(Float, default=0.0)
    automation_enabled = Column(Boolean, default=False)
    motivation_text = Column(Text)                    # User's motivation for this goal
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")

class BudgetCategory(Base):
    __tablename__ = "budget_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_name = Column(String, nullable=False)    # Groceries, Entertainment, etc
    monthly_limit = Column(Float, nullable=False)
    current_spent = Column(Float, default=0.0)
    alert_threshold = Column(Float, default=0.8)      # Alert when 80% spent
    category_type = Column(String)                    # essential, discretionary
    rollover_enabled = Column(Boolean, default=False) # Rollover unused budget
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")

class SpendingInsight(Base):
    __tablename__ = "spending_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_type = Column(String, nullable=False)     # pattern, anomaly, trend, recommendation
    category = Column(String)                         # Which spending category
    time_period = Column(String)                      # daily, weekly, monthly
    insight_text = Column(Text, nullable=False)       # Human readable insight
    data_points = Column(JSON)                        # Supporting data
    confidence_score = Column(Float)                  # How confident we are (0-1)
    action_suggested = Column(Text)                   # Recommended action
    user_acknowledged = Column(Boolean, default=False)
    user_feedback = Column(String)                    # helpful, not_helpful, misleading
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class UserBehaviorPattern(Base):
    __tablename__ = "user_behavior_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pattern_type = Column(String, nullable=False)     # stress_spending, impulse_buying
    pattern_data = Column(JSON, nullable=False)       # Detailed pattern information
    confidence_level = Column(Float)                  # How strong is this pattern
    frequency = Column(String)                        # daily, weekly, monthly, situational
    triggers = Column(JSON)                           # What triggers this pattern
    impact_score = Column(Float)                      # Financial impact (0-1)
    recommendations = Column(JSON)                    # Tailored recommendations
    last_occurrence = Column(DateTime(timezone=True))
    pattern_strength = Column(String)                 # weak, moderate, strong
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
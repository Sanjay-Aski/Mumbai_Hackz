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
    savings_target = Column(Float)
    stress_baseline = Column(Float, default=0.3)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    biometric_data = relationship("BiometricReading", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    interventions = relationship("Intervention", back_populates="user")
    gig_work = relationship("GigWork", back_populates="user")

class BiometricReading(Base):
    __tablename__ = "biometric_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    heart_rate = Column(Integer, nullable=False)
    hrv_ms = Column(Float, nullable=False)
    stress_score = Column(Float, nullable=False)
    context = Column(String)  # e.g., "Before standup meeting"
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
    stress_at_time = Column(Float)
    intervention_shown = Column(Boolean, default=False)
    user_proceeded = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="transactions")

class Intervention(Base):
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    url = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # low, medium, high
    user_action = Column(String)  # snooze, proceed
    delay_minutes = Column(Integer)
    effectiveness = Column(String)  # prevented_purchase, failed_prevention
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
    data_retention_days = Column(Integer, default=90)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
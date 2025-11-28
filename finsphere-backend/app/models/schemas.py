from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# --- Biometrics ---
class BiometricData(BaseModel):
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    heart_rate: int
    hrv_ms: float
    source: str = "wearable"
    metadata: Optional[Dict[str, Any]] = None

class StressAssessment(BaseModel):
    user_id: str
    timestamp: datetime
    is_stressed: bool
    stress_score: float  # 0.0 to 1.0
    trigger_event: Optional[str] = None

# --- Communication ---
class MessageInput(BaseModel):
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    channel: str  # email, upwork, slack
    sender: str
    content: str
    
class SentimentResult(BaseModel):
    score: float # -1.0 to 1.0
    label: str # positive, negative, neutral
    risk_flag: bool

# --- Transactions ---
class TransactionInput(BaseModel):
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    amount: float
    currency: str = "INR"
    merchant: str
    category: Optional[str] = None

# --- Intervention ---
class InterventionRequest(BaseModel):
    user_id: str
    context_url: Optional[str] = None
    current_activity: str

class InterventionResponse(BaseModel):
    should_intervene: bool
    intervention_type: Optional[str] = None # overlay, nudge, block
    message: Optional[str] = None
    delay_minutes: Optional[int] = 0

# --- Dashboard ---
class DashboardStats(BaseModel):
    stress_level: str # Low, Medium, High
    stress_score: float
    spending_risk: str # Safe, Warning, Critical
    cognitive_load: str
    savings_runway: str
    recent_interventions: List[Dict[str, Any]]

# --- Therapy ---
class TherapyMessage(BaseModel):
    user_id: str
    message: str # User's spoken/typed text

class TherapyResponse(BaseModel):
    response_text: str
    audio_url: Optional[str] = None # For future TTS integration

# --- Intervention Logging ---
class InterventionLog(BaseModel):
    user_id: str
    url: str
    reason: str
    severity: str  # low, medium, high
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class InterventionListResponse(BaseModel):
    interventions: List[Dict[str, Any]]
    total_count: int
    date: str

# --- Authentication Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    age: Optional[int] = None
    profession: Optional[str] = None
    location: Optional[str] = None
    income_monthly: Optional[float] = None
    savings_target: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    age: Optional[int]
    profession: Optional[str]
    location: Optional[str]
    income_monthly: Optional[float]
    savings_target: Optional[float]
    stress_baseline: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from app.models.schemas import (
    BiometricData, StressAssessment, 
    MessageInput, SentimentResult,
    TransactionInput,
    InterventionRequest, InterventionResponse,
    InterventionLog, InterventionListResponse,
    DashboardStats,
    TherapyMessage, TherapyResponse
)
from app.services.vector_db import vector_service
from app.services.analyzer import analyzer
from app.services.rag_service import rag_service
from app.services.postgresql_user_service import postgresql_user_service
from app.services.auth_service import get_current_user
from app.core.database import get_db
from app.core.config import settings
from app.models.database import User
from sqlalchemy.orm import Session
from typing import List
import uuid

router = APIRouter()


@router.post("/ingest/biometrics", response_model=StressAssessment)
async def ingest_biometrics(
    data: BiometricData, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest wearable data and return immediate stress assessment.
    """
    is_stressed, score = analyzer.assess_stress(data.heart_rate, data.hrv_ms)
    
    # Store in PostgreSQL
    reading = postgresql_user_service.add_biometric_reading(
        db, current_user.id, data.heart_rate, data.hrv_ms, "API ingestion"
    )
    
    # Async: Store in Vector DB for long-term pattern matching
    event_id = str(uuid.uuid4())
    desc = f"Biometric reading: HR {data.heart_rate} bpm, HRV {data.hrv_ms} ms. Stress Score: {score:.2f}"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": current_user.email,
            "type": "biometric",
            "timestamp": data.timestamp.isoformat(),
            "score": score,
            "is_stressed": is_stressed
        }
    )
        
    return StressAssessment(
        user_id=current_user.email,
        timestamp=data.timestamp,
        is_stressed=is_stressed,
        stress_score=score,
        trigger_event="Physiological Stress Detected" if is_stressed else None
    )

@router.post("/ingest/message", response_model=SentimentResult)
async def ingest_message(msg: MessageInput, background_tasks: BackgroundTasks):
    """
    Ingest communication to detect sentiment triggers.
    """
    score, label = analyzer.analyze_sentiment(msg.content)
    
    # Risk logic: Negative sentiment is a risk factor
    risk_flag = label == "negative" or score < -0.3
    
    # Async: Store in Vector DB
    event_id = str(uuid.uuid4())
    desc = f"Message on {msg.channel}: {msg.content}. Sentiment: {label} ({score:.2f})"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": msg.user_id,
            "type": "message",
            "timestamp": msg.timestamp.isoformat(),
            "score": score,
            "channel": msg.channel,
            "risk_flag": risk_flag
        }
    )
        
    return SentimentResult(score=score, label=label, risk_flag=risk_flag)

@router.post("/ingest/transaction")
async def ingest_transaction(
    txn: TransactionInput, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest financial transaction for pattern matching.
    """
    # Store in PostgreSQL
    transaction = postgresql_user_service.add_transaction(
        db, current_user.id, txn.amount, txn.merchant, txn.category
    )
    
    event_id = str(uuid.uuid4())
    desc = f"Transaction: Spent {txn.amount} {txn.currency} at {txn.merchant} ({txn.category})"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": current_user.email,
            "type": "transaction",
            "timestamp": txn.timestamp.isoformat(),
            "amount": txn.amount,
            "merchant": txn.merchant
        }
    )
    
    return {"status": "recorded", "id": event_id, "transaction_id": transaction.id}

@router.post("/intervention/check", response_model=InterventionResponse)
async def check_intervention(
    req: InterventionRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Called by Chrome Extension to check if we should intervene.
    Uses real PostgreSQL user data and smart intervention logic.
    """
    # Use PostgreSQL user data service for intervention decision
    decision = postgresql_user_service.should_intervene(db, current_user.id, req.context_url or "")
    
    return InterventionResponse(
        should_intervene=decision.get("should_intervene", False),
        intervention_type="overlay" if decision.get("should_intervene") else None,
        message=decision.get("message"),
        delay_minutes=decision.get("delay_minutes", 0)
    )

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Aggregate data for the frontend dashboard using PostgreSQL data.
    """
    # Use PostgreSQL user data service
    return postgresql_user_service.get_dashboard_stats(db, current_user.id)

@router.post("/therapy/chat", response_model=TherapyResponse)
async def therapy_chat(msg: TherapyMessage):
    """
    Endpoint for the Voice Therapy mode.
    Receives text (transcribed from voice) and returns empathetic AI response.
    """
    response_text = await rag_service.generate_therapy_response(msg.user_id, msg.message)
    return TherapyResponse(response_text=response_text)

@router.post("/intervention/log")
async def log_intervention(intervention: InterventionLog, background_tasks: BackgroundTasks):
    """
    Log intervention events for analytics and pattern tracking.
    Called by the Chrome Extension after performing an intervention.
    """
    event_id = str(uuid.uuid4())
    desc = f"Intervention: {intervention.reason} on {intervention.url}"
    
    # Store in Vector DB for future pattern analysis
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": intervention.user_id,
            "type": "intervention",
            "timestamp": intervention.timestamp.isoformat(),
            "url": intervention.url,
            "reason": intervention.reason,
            "severity": intervention.severity
        }
    )
    
    return {
        "status": "logged",
        "id": event_id,
        "timestamp": intervention.timestamp
    }

@router.post("/intervention/response")
async def log_intervention_response(data: dict, background_tasks: BackgroundTasks):
    """
    Log user's response to an intervention (accepted/snooze/proceed).
    Called by the Chrome Extension when user interacts with the intervention overlay.
    """
    event_id = str(uuid.uuid4())
    action = data.get('intervention_action', 'unknown')
    accepted = data.get('accepted', False)
    
    desc = f"User {action} intervention: {'Accepted' if accepted else 'Declined'} on {data.get('url', 'unknown')}"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": data.get('user_id'),
            "type": "intervention_response",
            "timestamp": data.get('timestamp'),
            "action": action,
            "accepted": accepted,
            "url": data.get('url')
        }
    )
    
    return {
        "status": "response_logged",
        "id": event_id,
        "action": action,
        "accepted": accepted
    }

@router.get("/interventions/{user_id}", response_model=InterventionListResponse)
async def get_interventions(user_id: str, limit: int = 10):
    """
    Get recent interventions for a user (for dashboard display).
    """
    recent = await vector_service.query_similar_events(
        user_id=user_id,
        query_text="intervention action",
        top_k=limit,
        filter_type="intervention"
    )
    
    interventions = []
    for event in recent:
        interventions.append({
            "id": event["id"],
            "timestamp": event["metadata"].get("timestamp"),
            "url": event["metadata"].get("url"),
            "reason": event["metadata"].get("reason"),
            "severity": event["metadata"].get("severity")
        })
    
    return InterventionListResponse(
        interventions=interventions,
        total_count=len(interventions),
        date=str(uuid.uuid4().hex[:8])  # Just a placeholder
    )

@router.post("/user/permissions")
async def update_user_permissions(user_id: str, permissions: dict):
    """
    Update user's data collection permissions.
    """
    # In a real system, this would update the database
    user_data_service.log_intervention_result(user_id, {
        "type": "permissions_update",
        "permissions": permissions,
        "timestamp": str(uuid.uuid4())
    })
    
    return {
        "status": "permissions_updated",
        "user_id": user_id,
        "permissions": permissions
    }

@router.get("/user/permissions/{user_id}")
async def get_user_permissions(user_id: str):
    """
    Get user's current data collection permissions and consent status.
    """
    return {
        "user_id": user_id,
        "permissions": user_data_service.permissions_data,
        "consent_given": True,  # In real system, check user-specific consent
        "data_types_collected": [
            "biometric_data",
            "browsing_behavior", 
            "intervention_analytics"
        ]
    }

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    from app.services.ollama_service import ollama_service
    
    # Check Ollama availability
    ollama_status = "available" if ollama_service.is_available() else "unavailable"
    
    # Check Qdrant availability
    qdrant_info = vector_service.get_collection_info()
    
    return {
        "status": "healthy",
        "service": "FinSphere API",
        "version": "0.1.0",
        "services": {
            "ollama": {
                "status": ollama_status,
                "model": settings.OLLAMA_MODEL,
                "embeddings_model": settings.OLLAMA_EMBEDDINGS_MODEL
            },
            "qdrant": qdrant_info
        }
    }

@router.get("/status")
async def system_status():
    """
    Detailed system status endpoint.
    """
    from app.services.ollama_service import ollama_service
    
    ollama_model_info = ollama_service.get_model_info()
    qdrant_info = vector_service.get_collection_info()
    
    return {
        "system": "FinSphere - Offline AI Financial Wellness",
        "components": {
            "ollama": {
                "available": ollama_service.is_available(),
                "endpoint": settings.OLLAMA_BASE_URL,
                "chat_model": settings.OLLAMA_MODEL,
                "embedding_model": settings.OLLAMA_EMBEDDINGS_MODEL,
                "model_info": ollama_model_info
            },
            "qdrant": {
                "host": f"{settings.QDRANT_HOST}:{settings.QDRANT_PORT}",
                "collection": settings.QDRANT_COLLECTION_NAME,
                "info": qdrant_info
            },
            "analyzer": {
                "sentiment": "TextBlob",
                "stress_algorithm": "HR/HRV heuristic"
            }
        }
    }

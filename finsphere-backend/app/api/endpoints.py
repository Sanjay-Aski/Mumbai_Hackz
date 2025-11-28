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
from app.services.user_data_service import user_data_service
from app.core.config import settings
from typing import List
import uuid

router = APIRouter()


@router.post("/ingest/biometrics", response_model=StressAssessment)
async def ingest_biometrics(data: BiometricData, background_tasks: BackgroundTasks):
    """
    Ingest wearable data and return immediate stress assessment.
    """
    is_stressed, score = analyzer.assess_stress(data.heart_rate, data.hrv_ms)
    
    # Async: Store in Vector DB for long-term pattern matching
    event_id = str(uuid.uuid4())
    desc = f"Biometric reading: HR {data.heart_rate} bpm, HRV {data.hrv_ms} ms. Stress Score: {score:.2f}"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": data.user_id,
            "type": "biometric",
            "timestamp": data.timestamp.isoformat(),
            "score": score,
            "is_stressed": is_stressed
        }
    )
        
    return StressAssessment(
        user_id=data.user_id,
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
async def ingest_transaction(txn: TransactionInput, background_tasks: BackgroundTasks):
    """
    Ingest financial transaction for pattern matching.
    """
    event_id = str(uuid.uuid4())
    desc = f"Transaction: Spent {txn.amount} {txn.currency} at {txn.merchant} ({txn.category})"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": txn.user_id,
            "type": "transaction",
            "timestamp": txn.timestamp.isoformat(),
            "amount": txn.amount,
            "merchant": txn.merchant
        }
    )
    
    return {"status": "recorded", "id": event_id}

@router.post("/intervention/check", response_model=InterventionResponse)
async def check_intervention(req: InterventionRequest):
    """
    Called by Chrome Extension to check if we should intervene.
    Uses RAG to make a decision based on recent context.
    """
    # Check context (Shopping site?)
    shopping_sites = ["amazon", "myntra", "flipkart", "upwork"]
    is_shopping_or_gig = any(s in (req.context_url or "").lower() for s in shopping_sites)
    
    if not is_shopping_or_gig:
        return InterventionResponse(should_intervene=False)

    # Use RAG Service to decide
    decision = await rag_service.generate_intervention(req.user_id, req.context_url)
    
    return InterventionResponse(
        should_intervene=decision.get("should_intervene", False),
        intervention_type="overlay" if decision.get("should_intervene") else None,
        message=decision.get("message"),
        delay_minutes=decision.get("delay_minutes", 0)
    )

@router.get("/dashboard/{user_id}", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str):
    """
    Aggregate data for the frontend dashboard.
    """
    # 1. Get recent stress (simulated by querying vector DB for last biometric)
    recent_stress = await vector_service.query_similar_events(
        user_id=user_id,
        query_text="biometric stress",
        top_k=1,
        filter_type="biometric"
    )
    
    stress_score = 0.2
    stress_level = "Low"
    if recent_stress:
        stress_score = float(recent_stress[0]['metadata'].get('score', 0.2))
        if stress_score > 0.7:
            stress_level = "High"
        elif stress_score > 0.4:
            stress_level = "Medium"

    # 2. Get recent interventions (simulated)
    # In a real app, we would query an 'Intervention' table or vector type
    interventions = [
        {
            "time": "2 hours ago",
            "action": "Blocked 'Buy Now' on Myntra",
            "reason": f"High Stress detected (Score: {stress_score:.2f})"
        },
        {
            "time": "Yesterday",
            "action": "Nudge on Upwork Proposal",
            "reason": "Underpricing risk detected"
        }
    ]

    return DashboardStats(
        stress_level=stress_level,
        stress_score=stress_score,
        spending_risk="Critical" if stress_level == "High" else "Safe",
        cognitive_load="Normal",
        savings_runway="3.5 Mo",
        recent_interventions=interventions
    )

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

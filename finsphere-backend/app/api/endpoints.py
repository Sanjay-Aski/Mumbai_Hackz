from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
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
from app.services.fake_data_stream import fake_data_generator
from app.core.database import get_db
from app.core.config import settings
from app.models.database import User, BiometricReading, Transaction, Intervention
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, AsyncGenerator
from datetime import datetime
import uuid
import json
import asyncio

router = APIRouter()


@router.post("/ingest/biometrics", response_model=StressAssessment)
async def ingest_biometrics(
    data: BiometricData, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Ingest wearable data and return immediate stress assessment.
    """
    is_stressed, score = analyzer.assess_stress(data.heart_rate, data.hrv_ms)
    
    # Get first user from database (for dev)
    user = db.query(User).first()
    if not user:
        user_id = 1
        user_email = "demo@finsphere.com"
    else:
        user_id = user.id
        user_email = user.email
    
    # Store in PostgreSQL
    reading = postgresql_user_service.add_biometric_reading(
        db, user_id, data.heart_rate, data.hrv_ms, "API ingestion"
    )
    
    # Async: Store in Vector DB for long-term pattern matching
    event_id = str(uuid.uuid4())
    desc = f"Biometric reading: HR {data.heart_rate} bpm, HRV {data.hrv_ms} ms. Stress Score: {score:.2f}"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": user_email,
            "type": "biometric",
            "timestamp": data.timestamp.isoformat(),
            "score": score,
            "is_stressed": is_stressed
        }
    )
        
    return StressAssessment(
        user_id=user_email,
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
    db: Session = Depends(get_db)
):
    """
    Ingest financial transaction for pattern matching.
    """
    # Get first user from database (for dev)
    user = db.query(User).first()
    if not user:
        user_id = 1
        user_email = "demo@finsphere.com"
    else:
        user_id = user.id
        user_email = user.email
    
    # Store in PostgreSQL
    transaction = postgresql_user_service.add_transaction(
        db, user_id, txn.amount, txn.merchant, txn.category
    )
    
    event_id = str(uuid.uuid4())
    desc = f"Transaction: Spent {txn.amount} {txn.currency} at {txn.merchant} ({txn.category})"
    
    background_tasks.add_task(
        vector_service.upsert_event,
        event_id=event_id,
        text_description=desc,
        metadata={
            "user_id": user_email,
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
    db: Session = Depends(get_db)
):
    """
    Called by Chrome Extension to check if we should intervene.
    Uses real PostgreSQL user data and smart intervention logic.
    """
    # Get first user from database (for dev)
    user = db.query(User).first()
    if not user:
        user_id = 1
    else:
        user_id = user.id
    
    # Use PostgreSQL user data service for intervention decision
    decision = postgresql_user_service.should_intervene(db, user_id, req.context_url or "")
    
    return InterventionResponse(
        should_intervene=decision.get("should_intervene", False),
        intervention_type="overlay" if decision.get("should_intervene") else None,
        message=decision.get("message"),
        delay_minutes=decision.get("delay_minutes", 0)
    )

@router.get("/users", response_model=List[dict])
async def get_users_list(
    db: Session = Depends(get_db)
):
    """
    Get list of all users with their data statistics for user selection.
    """
    try:
        users = db.query(User).all()
        user_stats = []
        
        for user in users:
            # Get data counts for each user
            biometric_count = db.query(BiometricReading).filter(BiometricReading.user_id == user.id).count()
            transaction_count = db.query(Transaction).filter(Transaction.user_id == user.id).count()
            intervention_count = db.query(Intervention).filter(Intervention.user_id == user.id).count()
            
            # Calculate total spending
            total_spending = db.query(Transaction).filter(
                Transaction.user_id == user.id,
                Transaction.user_proceeded == True
            ).with_entities(func.coalesce(func.sum(Transaction.amount), 0)).scalar() or 0
            
            user_stats.append({
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "profession": user.profession,
                "location": user.location,
                "spending_personality": user.spending_personality,
                "income_monthly": user.income_monthly,
                "savings_current": user.savings_current,
                "stress_baseline": user.stress_baseline,
                "data_stats": {
                    "biometric_readings": biometric_count,
                    "transactions": transaction_count,
                    "interventions": intervention_count,
                    "total_spending": round(total_spending, 2),
                    "data_richness": biometric_count + transaction_count + intervention_count
                }
            })
        
        # Sort by data richness (users with more data first)
        user_stats.sort(key=lambda x: x["data_stats"]["data_richness"], reverse=True)
        
        return user_stats[:5]  # Return top 5 users with most data
        
    except Exception as e:
        print(f"Users list error: {e}")
        return []

@router.get("/dashboard/{user_id}", response_model=DashboardStats)
async def get_dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Aggregate data for the frontend dashboard using PostgreSQL data for specific user.
    Fetches REAL data from the database.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Use PostgreSQL user data service to get REAL data
        return postgresql_user_service.get_dashboard_stats(db, user.id)
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        # Return mock data on error
        return DashboardStats(
            stress_level="Medium",
            stress_score=0.45,
            spending_risk="Warning",
            cognitive_load="Normal",
            savings_runway="8.5 Mo",
            recent_interventions=[]
        )

@router.get("/dashboard", response_model=DashboardStats)
async def get_default_dashboard_stats(
    db: Session = Depends(get_db)
):
    """
    Get dashboard stats for the first user (fallback for compatibility).
    """
    try:
        # Get first user from database (for dev)
        user = db.query(User).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="No users found")
        
        # Use PostgreSQL user data service to get REAL data
        return postgresql_user_service.get_dashboard_stats(db, user.id)
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        # Return mock data on error
        return DashboardStats(
            stress_level="Medium",
            stress_score=0.45,
            spending_risk="Warning",
            cognitive_load="Normal",
            savings_runway="8.5 Mo",
            recent_interventions=[]
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

@router.get("/user/{user_id}/financial-goals")
async def get_user_financial_goals(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user's financial goals and progress.
    """
    try:
        from app.models.database import FinancialGoal
        goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id).all()
        
        goal_data = []
        for goal in goals:
            progress = (goal.current_amount / goal.target_amount) * 100 if goal.target_amount > 0 else 0
            months_to_target = 0
            if goal.monthly_contribution > 0:
                remaining = goal.target_amount - goal.current_amount
                months_to_target = max(0, remaining / goal.monthly_contribution)
            
            goal_data.append({
                "id": goal.id,
                "goal_type": goal.goal_type,
                "target_amount": goal.target_amount,
                "current_amount": goal.current_amount,
                "monthly_contribution": goal.monthly_contribution,
                "priority": goal.priority,
                "status": goal.status,
                "progress_percentage": round(progress, 1),
                "months_to_target": round(months_to_target, 1),
                "motivation_text": goal.motivation_text
            })
        
        return {"goals": goal_data, "total_goals": len(goal_data)}
        
    except Exception as e:
        print(f"Financial goals error: {e}")
        return {"goals": [], "total_goals": 0}

@router.get("/user/{user_id}/budget-categories")
async def get_user_budget_categories(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user's budget categories and spending.
    """
    try:
        from app.models.database import BudgetCategory
        budgets = db.query(BudgetCategory).filter(BudgetCategory.user_id == user_id).all()
        
        # Calculate actual spending per category
        budget_data = []
        for budget in budgets:
            # Get actual spending for this category
            actual_spending = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.budget_category == budget.category_name,
                Transaction.user_proceeded == True
            ).with_entities(func.coalesce(func.sum(Transaction.amount), 0)).scalar() or 0
            
            utilization = (actual_spending / budget.monthly_limit) * 100 if budget.monthly_limit > 0 else 0
            status = "over_budget" if utilization > 100 else "warning" if utilization > budget.alert_threshold * 100 else "good"
            
            budget_data.append({
                "id": budget.id,
                "category_name": budget.category_name,
                "monthly_limit": budget.monthly_limit,
                "actual_spending": round(actual_spending, 2),
                "remaining": max(0, budget.monthly_limit - actual_spending),
                "utilization_percentage": round(utilization, 1),
                "category_type": budget.category_type,
                "alert_threshold": budget.alert_threshold,
                "status": status
            })
        
        return {"budget_categories": budget_data, "total_categories": len(budget_data)}
        
    except Exception as e:
        print(f"Budget categories error: {e}")
        return {"budget_categories": [], "total_categories": 0}

@router.get("/user/{user_id}/behavioral-insights")
async def get_user_behavioral_insights(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user's behavioral patterns and spending insights.
    """
    try:
        from app.models.database import UserBehaviorPattern, SpendingInsight
        
        # Get behavioral patterns
        patterns = db.query(UserBehaviorPattern).filter(UserBehaviorPattern.user_id == user_id).all()
        pattern_data = []
        for pattern in patterns:
            pattern_data.append({
                "id": pattern.id,
                "pattern_type": pattern.pattern_type,
                "confidence_level": pattern.confidence_level,
                "frequency": pattern.frequency,
                "triggers": pattern.triggers,
                "impact_score": pattern.impact_score,
                "recommendations": pattern.recommendations,
                "pattern_strength": pattern.pattern_strength,
                "pattern_data": pattern.pattern_data
            })
        
        # Get spending insights
        insights = db.query(SpendingInsight).filter(SpendingInsight.user_id == user_id).all()
        insight_data = []
        for insight in insights:
            insight_data.append({
                "id": insight.id,
                "insight_type": insight.insight_type,
                "category": insight.category,
                "time_period": insight.time_period,
                "insight_text": insight.insight_text,
                "confidence_score": insight.confidence_score,
                "action_suggested": insight.action_suggested,
                "data_points": insight.data_points
            })
        
        return {
            "behavioral_patterns": pattern_data,
            "spending_insights": insight_data,
            "total_patterns": len(pattern_data),
            "total_insights": len(insight_data)
        }
        
    except Exception as e:
        print(f"Behavioral insights error: {e}")
        return {
            "behavioral_patterns": [],
            "spending_insights": [],
            "total_patterns": 0,
            "total_insights": 0
        }

@router.get("/user/{user_id}/recent-activity")
async def get_user_recent_activity(
    user_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get user's recent transactions and interventions.
    """
    try:
        # Get recent transactions
        recent_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.timestamp.desc()).limit(limit).all()
        
        transaction_data = []
        for txn in recent_transactions:
            transaction_data.append({
                "id": txn.id,
                "timestamp": txn.timestamp.isoformat(),
                "amount": txn.amount,
                "merchant": txn.merchant,
                "category": txn.category,
                "subcategory": txn.subcategory,
                "necessity_level": txn.necessity_level,
                "purchase_trigger": txn.purchase_trigger,
                "stress_at_time": txn.stress_at_time,
                "emotional_state": txn.emotional_state,
                "intervention_shown": txn.intervention_shown,
                "user_proceeded": txn.user_proceeded,
                "satisfaction_score": txn.satisfaction_score,
                "regret_score": txn.regret_score
            })
        
        # Get recent interventions
        recent_interventions = db.query(Intervention).filter(
            Intervention.user_id == user_id
        ).order_by(Intervention.timestamp.desc()).limit(limit).all()
        
        intervention_data = []
        for intervention in recent_interventions:
            intervention_data.append({
                "id": intervention.id,
                "timestamp": intervention.timestamp.isoformat(),
                "url": intervention.url,
                "website_category": intervention.website_category,
                "estimated_amount": intervention.estimated_amount,
                "reason": intervention.reason,
                "severity": intervention.severity,
                "user_stress_level": intervention.user_stress_level,
                "user_action": intervention.user_action,
                "final_outcome": intervention.final_outcome,
                "effectiveness": intervention.effectiveness
            })
        
        return {
            "recent_transactions": transaction_data,
            "recent_interventions": intervention_data,
            "total_transactions": len(transaction_data),
            "total_interventions": len(intervention_data)
        }
        
    except Exception as e:
        print(f"Recent activity error: {e}")
        return {
            "recent_transactions": [],
            "recent_interventions": [],
            "total_transactions": 0,
            "total_interventions": 0
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

# === REAL-TIME DATA STREAMING ENDPOINTS ===

@router.get("/stream/biometrics/{user_id}")
async def stream_biometric_data(user_id: int):
    """Stream real-time biometric data for a user"""
    
    async def generate_biometric_stream() -> AsyncGenerator[str, None]:
        async for biometric_data in fake_data_generator.biometric_stream(user_id, interval_seconds=3):
            # Format as Server-Sent Events
            data_json = json.dumps(biometric_data)
            yield f"data: {data_json}\n\n"
    
    return StreamingResponse(
        generate_biometric_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.get("/stream/emails/{user_id}")
async def stream_email_data(user_id: int):
    """Stream real-time email sentiment data for a user"""
    
    async def generate_email_stream() -> AsyncGenerator[str, None]:
        async for email_data in fake_data_generator.email_stream(user_id, interval_seconds=15):
            # Convert dataclass to dict
            data_dict = {
                'timestamp': email_data.timestamp,
                'sender': email_data.sender,
                'subject': email_data.subject,
                'content_preview': email_data.content_preview,
                'sentiment_score': email_data.sentiment_score,
                'sentiment_label': email_data.sentiment_label,
                'stress_trigger': email_data.stress_trigger,
                'priority': email_data.priority,
                'category': email_data.category,
                'emotional_impact': email_data.emotional_impact
            }
            # Format as Server-Sent Events
            data_json = json.dumps(data_dict)
            yield f"data: {data_json}\n\n"
    
    return StreamingResponse(
        generate_email_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.get("/historical/biometrics/{user_id}")
async def get_historical_biometrics(
    user_id: int,
    hours: int = Query(24, description="Hours of historical data"),
    count: int = Query(100, description="Number of data points")
):
    """Get historical biometric data for a user"""
    biometric_data = fake_data_generator.generate_historical_biometrics(user_id, hours, count)
    return {
        "user_id": user_id,
        "time_range_hours": hours,
        "data_points": len(biometric_data),
        "biometrics": biometric_data
    }

@router.get("/historical/emails/{user_id}")
async def get_historical_emails(
    user_id: int,
    hours: int = Query(24, description="Hours of historical data"),
    count: int = Query(50, description="Number of emails")
):
    """Get historical email sentiment data for a user"""
    email_data = fake_data_generator.generate_historical_emails(user_id, hours, count)
    
    # Convert dataclass objects to dicts
    emails_dict = []
    for email in email_data:
        emails_dict.append({
            'timestamp': email.timestamp,
            'sender': email.sender,
            'subject': email.subject,
            'content_preview': email.content_preview,
            'sentiment_score': email.sentiment_score,
            'sentiment_label': email.sentiment_label,
            'stress_trigger': email.stress_trigger,
            'priority': email.priority,
            'category': email.category,
            'emotional_impact': email.emotional_impact
        })
    
    return {
        "user_id": user_id,
        "time_range_hours": hours,
        "email_count": len(emails_dict),
        "emails": emails_dict
    }

@router.get("/realtime/dashboard/{user_id}")
async def get_realtime_dashboard_summary(user_id: int):
    """Get real-time dashboard summary with current biometrics and recent emails"""
    
    # Get latest biometric reading
    current_biometric = fake_data_generator.generate_biometric(user_id)
    
    # Get recent emails (last 2 hours)
    recent_emails = fake_data_generator.generate_historical_emails(user_id, hours=2, count=10)
    
    # Calculate stress indicators
    stress_level = "Low" if current_biometric['stress_level'] < 4 else "Medium" if current_biometric['stress_level'] < 7 else "High"
    
    # Count high-stress emails
    stress_emails = len([e for e in recent_emails if e.stress_trigger])
    
    # Calculate spending risk based on email sentiment
    negative_emails = len([e for e in recent_emails if e.sentiment_score < -0.3])
    spending_risk = "Critical" if negative_emails > 5 else "Warning" if negative_emails > 2 else "Safe"
    
    return {
        "user_id": user_id,
        "timestamp": datetime.now().isoformat(),
        "current_biometric": current_biometric,
        "stress_level": stress_level,
        "stress_score": current_biometric['raw_stress_score'],
        "spending_risk": spending_risk,
        "cognitive_load": current_biometric['activity_level'].title(),
        "heart_rate": current_biometric['heart_rate'],
        "hrv": current_biometric['hrv_ms'],
        "recovery_score": current_biometric['recovery_score'],
        "recent_emails_count": len(recent_emails),
        "stress_trigger_emails": stress_emails,
        "recent_emails": [{
            'timestamp': email.timestamp,
            'sender': email.sender,
            'subject': email.subject,
            'sentiment_score': email.sentiment_score,
            'stress_trigger': email.stress_trigger,
            'priority': email.priority,
            'category': email.category
        } for email in recent_emails[-5:]]  # Last 5 emails
    }

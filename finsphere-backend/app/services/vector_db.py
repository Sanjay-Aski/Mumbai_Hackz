import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import ollama
from app.core.config import settings
import json
import uuid
import logging

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        # Initialize Qdrant (Local/Offline)
        try:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT
            )
            self.collection_name = settings.QDRANT_COLLECTION_NAME
            self._ensure_collection_exists()
            print(f"Qdrant initialized successfully on {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
        except Exception as e:
            print(f"Qdrant initialization failed: {e}. Vector DB disabled.")
            logger.error(f"Qdrant error: {e}")
            self.client = None

        # Initialize Ollama for embeddings (Local/Offline)
        try:
            # Test connection to Ollama
            ollama.list()
            print(f"Ollama initialized successfully at {settings.OLLAMA_BASE_URL}")
        except Exception as e:
            print(f"Ollama initialization failed: {e}. Embeddings will use mock data.")
            logger.error(f"Ollama error: {e}")

    def _ensure_collection_exists(self):
        """Create collection if it doesn't exist."""
        if not self.client:
            return
            
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=768,  # Dimension for nomic-embed-text
                        distance=Distance.COSINE
                    )
                )
                print(f"Created collection: {self.collection_name}")
                logger.info(f"Created Qdrant collection: {self.collection_name}")
        except Exception as e:
            print(f"Error ensuring collection exists: {e}")
            logger.error(f"Collection creation error: {e}")

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using Ollama."""
        try:
            response = ollama.embeddings(
                model=settings.OLLAMA_EMBEDDINGS_MODEL,
                prompt=text
            )
            return response['embedding']
        except Exception as e:
            print(f"Embedding error: {e}")
            logger.error(f"Embedding error: {e}")
            # Return mock embedding of correct size for nomic-embed-text
            return [0.1] * 768

    async def upsert_event(self, 
                           event_id: str, 
                           text_description: str, 
                           metadata: Dict[str, Any]):
        """
        Upsert an enhanced event into Qdrant with rich contextual data.
        Schema:
        - ID: event_id
        - Vector: embedding(text_description)
        - Metadata: comprehensive contextual and behavioral information
        """
        if not self.client:
            logger.warning("Qdrant client not available, skipping upsert")
            return
        
        try:
            vector = self.get_embedding(text_description)
            
            # Enrich metadata with additional context for better querying
            enriched_metadata = {
                **metadata,
                "created_at": datetime.now().isoformat(),
                "text_length": len(text_description),
                "description_hash": hash(text_description) % (2**31)  # For deduplication
            }
            
            # Add behavioral tags for easier filtering
            if metadata.get('type') == 'transaction':
                enriched_metadata['spending_tags'] = self._extract_spending_tags(metadata)
            elif metadata.get('type') == 'biometric':
                enriched_metadata['wellbeing_tags'] = self._extract_wellbeing_tags(metadata)
            elif metadata.get('type') == 'intervention':
                enriched_metadata['intervention_tags'] = self._extract_intervention_tags(metadata)
            
            # Create point for Qdrant
            point = PointStruct(
                id=event_id,
                vector=vector,
                payload=enriched_metadata
            )
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            logger.debug(f"Upserted enhanced event {event_id} to Qdrant")
        except Exception as e:
            logger.error(f"Error upserting event: {e}")

    async def query_similar_events(self, 
                                   user_id: str, 
                                   query_text: str, 
                                   top_k: int = 5,
                                   filter_type: Optional[str] = None,
                                   behavioral_context: Optional[Dict] = None) -> List[Dict]:
        """
        Retrieve similar past events with enhanced behavioral pattern matching.
        """
        if not self.client:
            logger.warning("Qdrant client not available, returning empty results")
            return []

        try:
            vector = self.get_embedding(query_text)
            
            # Build enhanced filter for Qdrant
            must_conditions = [
                FieldCondition(key="user_id", match=MatchValue(value=user_id))
            ]
            
            if filter_type:
                must_conditions.append(
                    FieldCondition(key="type", match=MatchValue(value=filter_type))
                )
            
            # Add behavioral context filters
            if behavioral_context:
                if behavioral_context.get('high_stress') and filter_type == 'transaction':
                    must_conditions.append(
                        FieldCondition(key="spending_tags", match=MatchValue(value="high_stress_purchase"))
                    )
                
                if behavioral_context.get('similar_amount_range') and filter_type == 'transaction':
                    # This would need range filtering in a real implementation
                    pass
                
                if behavioral_context.get('intervention_context') and filter_type == 'intervention':
                    must_conditions.append(
                        FieldCondition(key="intervention_tags", match=MatchValue(value="successful_intervention"))
                    )

            search_filter = Filter(must=must_conditions) if must_conditions else None

            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=vector,
                limit=top_k,
                query_filter=search_filter,
                with_payload=True
            )
            
            events = [
                {
                    "id": str(result.id),
                    "score": result.score,
                    "metadata": result.payload or {},
                    "relevance_score": self._calculate_behavioral_relevance(result.payload, behavioral_context)
                }
                for result in results
            ]
            
            # Sort by combined similarity + behavioral relevance
            events.sort(key=lambda x: (x['score'] + x['relevance_score']) / 2, reverse=True)
            
            logger.debug(f"Retrieved {len(events)} behaviorally-relevant events for {user_id}")
            return events
        except Exception as e:
            logger.error(f"Error querying similar events: {e}")
            return []
    
    def _calculate_behavioral_relevance(self, event_metadata: Dict, context: Optional[Dict]) -> float:
        """Calculate behavioral relevance score for an event"""
        if not context:
            return 0.0
        
        relevance_score = 0.0
        
        # Stress level similarity
        if context.get('current_stress') and event_metadata.get('stress_at_time'):
            stress_diff = abs(context['current_stress'] - event_metadata['stress_at_time'])
            relevance_score += max(0, 1 - stress_diff)  # Higher score for similar stress levels
        
        # Time of day similarity
        if context.get('current_hour') and event_metadata.get('timestamp'):
            try:
                from datetime import datetime
                event_time = datetime.fromisoformat(event_metadata['timestamp'].replace('Z', '+00:00'))
                hour_diff = abs(context['current_hour'] - event_time.hour)
                relevance_score += max(0, 1 - hour_diff / 12)  # Similar time of day
            except:
                pass
        
        # Behavioral pattern match
        if context.get('spending_personality') == 'impulsive' and 'unplanned' in event_metadata.get('spending_tags', []):
            relevance_score += 0.5
        
        return min(1.0, relevance_score)  # Cap at 1.0

    def _extract_spending_tags(self, metadata: Dict[str, Any]) -> List[str]:
        """Extract behavioral tags from transaction metadata"""
        tags = []
        
        # Stress-based tags
        stress_level = metadata.get('stress_at_time', 0)
        if stress_level > 0.7:
            tags.append('high_stress_purchase')
        elif stress_level > 0.4:
            tags.append('moderate_stress_purchase')
        else:
            tags.append('low_stress_purchase')
        
        # Amount-based tags
        amount = metadata.get('amount', 0)
        if amount > 10000:
            tags.append('large_purchase')
        elif amount > 2000:
            tags.append('medium_purchase')
        else:
            tags.append('small_purchase')
        
        # Behavioral tags
        if metadata.get('planned_purchase'):
            tags.append('planned')
        else:
            tags.append('unplanned')
            
        if metadata.get('necessity_level') == 'luxury':
            tags.append('luxury_item')
        elif metadata.get('necessity_level') == 'essential':
            tags.append('essential_item')
        
        # Trigger-based tags
        trigger = metadata.get('purchase_trigger', '')
        if trigger in ['stress', 'boredom', 'social']:
            tags.append(f'trigger_{trigger}')
        
        return tags
    
    def _extract_wellbeing_tags(self, metadata: Dict[str, Any]) -> List[str]:
        """Extract wellbeing tags from biometric metadata"""
        tags = []
        
        # Stress tags
        stress_level = metadata.get('stress_score', 0)
        if stress_level > 0.7:
            tags.extend(['high_stress', 'alert_needed'])
        elif stress_level > 0.4:
            tags.append('moderate_stress')
        else:
            tags.append('low_stress')
        
        # Energy tags
        energy_level = metadata.get('energy_level', 0.5)
        if energy_level > 0.7:
            tags.append('high_energy')
        elif energy_level < 0.3:
            tags.extend(['low_energy', 'fatigue'])
        
        # Context tags
        activity = metadata.get('activity_type', '')
        if activity:
            tags.append(f'activity_{activity}')
        
        location = metadata.get('location_type', '')
        if location:
            tags.append(f'location_{location}')
        
        emotional_state = metadata.get('emotional_state', '')
        if emotional_state in ['anxious', 'frustrated', 'overwhelmed']:
            tags.append('negative_emotion')
        elif emotional_state in ['calm', 'relaxed', 'content']:
            tags.append('positive_emotion')
        
        return tags
    
    def _extract_intervention_tags(self, metadata: Dict[str, Any]) -> List[str]:
        """Extract intervention effectiveness tags"""
        tags = []
        
        # Effectiveness tags
        effectiveness = metadata.get('effectiveness', '')
        if effectiveness == 'prevented_purchase':
            tags.append('successful_intervention')
        elif effectiveness == 'failed_prevention':
            tags.append('failed_intervention')
        
        # Severity tags
        severity = metadata.get('severity', '')
        if severity:
            tags.append(f'severity_{severity}')
        
        # User response tags
        user_action = metadata.get('user_action', '')
        if user_action:
            tags.append(f'user_{user_action}')
        
        # Stress context tags
        user_stress = metadata.get('user_stress_level', 0)
        if user_stress > 0.6:
            tags.append('high_stress_intervention')
        
        return tags
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection."""
        if not self.client:
            return {"status": "disabled", "message": "Qdrant client not available"}
            
        try:
            info = self.client.get_collection(self.collection_name)
            return {
                "status": "active",
                "collection_name": self.collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "config": {
                    "vector_size": info.config.params.vectors.size,
                    "distance": info.config.params.vectors.distance.name
                }
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {"status": "error", "message": str(e)}

    async def discover_behavioral_patterns(self, user_id: str, pattern_type: str = 'spending') -> List[Dict]:
        """Discover behavioral patterns from user's vector data"""
        if not self.client:
            return []
        
        try:
            # Query for different behavioral patterns
            patterns = []
            
            if pattern_type == 'spending':
                # High stress spending pattern
                stress_events = await self.query_similar_events(
                    user_id, "high stress purchase emotional spending", 
                    top_k=20, filter_type="transaction",
                    behavioral_context={'high_stress': True}
                )
                
                if len(stress_events) > 5:  # Pattern threshold
                    patterns.append({
                        'pattern_type': 'stress_spending',
                        'frequency': len(stress_events),
                        'confidence': min(1.0, len(stress_events) / 20),
                        'sample_events': stress_events[:3],
                        'description': 'User tends to spend more during high stress periods'
                    })
                
                # Impulse buying pattern
                impulse_events = await self.query_similar_events(
                    user_id, "unplanned purchase impulse buying luxury",
                    top_k=15, filter_type="transaction"
                )
                
                impulse_count = sum(1 for event in impulse_events 
                                  if 'unplanned' in event.get('metadata', {}).get('spending_tags', []))
                
                if impulse_count > 3:
                    patterns.append({
                        'pattern_type': 'impulse_buying',
                        'frequency': impulse_count,
                        'confidence': min(1.0, impulse_count / 15),
                        'sample_events': [e for e in impulse_events if 'unplanned' in e.get('metadata', {}).get('spending_tags', [])][:3],
                        'description': 'User frequently makes unplanned purchases'
                    })
            
            elif pattern_type == 'intervention':
                # Intervention effectiveness patterns
                successful_interventions = await self.query_similar_events(
                    user_id, "successful intervention prevented purchase",
                    top_k=20, filter_type="intervention"
                )
                
                success_count = sum(1 for event in successful_interventions 
                                  if 'successful_intervention' in event.get('metadata', {}).get('intervention_tags', []))
                
                if len(successful_interventions) > 0:
                    patterns.append({
                        'pattern_type': 'intervention_response',
                        'success_rate': success_count / len(successful_interventions),
                        'total_interventions': len(successful_interventions),
                        'description': f'User responds to interventions {success_count/len(successful_interventions)*100:.0f}% of the time'
                    })
            
            logger.debug(f"Discovered {len(patterns)} behavioral patterns for {user_id}")
            return patterns
            
        except Exception as e:
            logger.error(f"Error discovering patterns: {e}")
            return []
    
    async def get_contextual_insights(self, user_id: str, current_context: Dict) -> List[Dict]:
        """Get contextual insights based on current user state and historical patterns"""
        insights = []
        
        try:
            # Get similar historical contexts
            context_query = f"stress {current_context.get('stress_level', 0.5):.2f} {current_context.get('activity', '')} {current_context.get('emotional_state', '')}"
            
            similar_contexts = await self.query_similar_events(
                user_id, context_query, top_k=10,
                behavioral_context=current_context
            )
            
            if similar_contexts:
                # Analyze patterns in similar contexts
                spending_in_similar = [e for e in similar_contexts if e['metadata'].get('type') == 'transaction']
                
                if spending_in_similar:
                    avg_spending = sum(e['metadata'].get('amount', 0) for e in spending_in_similar) / len(spending_in_similar)
                    
                    insights.append({
                        'type': 'contextual_spending',
                        'insight': f"In similar situations, you typically spend around ₹{avg_spending:.0f}",
                        'confidence': 0.8,
                        'recommendation': "Consider this typical pattern when making purchase decisions"
                    })
                
                # Check for intervention patterns
                interventions_in_similar = [e for e in similar_contexts if e['metadata'].get('type') == 'intervention']
                successful_interventions = [e for e in interventions_in_similar 
                                         if 'successful_intervention' in e.get('metadata', {}).get('intervention_tags', [])]
                
                if interventions_in_similar and successful_interventions:
                    success_rate = len(successful_interventions) / len(interventions_in_similar)
                    insights.append({
                        'type': 'intervention_effectiveness',
                        'insight': f"You typically respond well to interventions in this context ({success_rate*100:.0f}% success rate)",
                        'confidence': 0.7,
                        'recommendation': "Consider taking a pause before making purchases"
                    })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating contextual insights: {e}")
            return []

# Singleton instance
vector_service = VectorService()

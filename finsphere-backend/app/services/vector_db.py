import os
from typing import List, Dict, Any, Optional
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
        Upsert an event (biometric, message, transaction) into Qdrant.
        Schema:
        - ID: event_id
        - Vector: embedding(text_description)
        - Metadata: user_id, type, timestamp, score, raw_text
        """
        if not self.client:
            logger.warning("Qdrant client not available, skipping upsert")
            return
        
        try:
            vector = self.get_embedding(text_description)
            
            # Create point for Qdrant
            point = PointStruct(
                id=event_id,
                vector=vector,
                payload=metadata
            )
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            logger.debug(f"Upserted event {event_id} to Qdrant")
        except Exception as e:
            logger.error(f"Error upserting event: {e}")

    async def query_similar_events(self, 
                                   user_id: str, 
                                   query_text: str, 
                                   top_k: int = 5,
                                   filter_type: Optional[str] = None) -> List[Dict]:
        """
        Retrieve similar past events for a user to find patterns.
        """
        if not self.client:
            logger.warning("Qdrant client not available, returning empty results")
            return []

        try:
            vector = self.get_embedding(query_text)
            
            # Build filter for Qdrant
            must_conditions = [
                FieldCondition(key="user_id", match=MatchValue(value=user_id))
            ]
            
            if filter_type:
                must_conditions.append(
                    FieldCondition(key="type", match=MatchValue(value=filter_type))
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
                    "metadata": result.payload or {}
                }
                for result in results
            ]
            logger.debug(f"Retrieved {len(events)} similar events for {user_id}")
            return events
        except Exception as e:
            logger.error(f"Error querying similar events: {e}")
            return []

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

# Singleton instance
vector_service = VectorService()

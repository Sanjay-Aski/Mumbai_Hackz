import os
from typing import List, Dict, Any, Optional
from pinecone import Pinecone
from openai import OpenAI
from app.core.config import settings
import json

class VectorService:
    def __init__(self):
        # Initialize Pinecone
        if settings.PINECONE_API_KEY and settings.PINECONE_API_KEY != "your_pinecone_api_key_here":
            try:
                self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                self.index = self.pc.Index(settings.PINECONE_INDEX_NAME)
                print("Pinecone initialized successfully.")
            except Exception as e:
                print(f"Pinecone initialization failed: {e}. Vector DB disabled.")
                self.pc = None
                self.index = None
        else:
            self.pc = None
            self.index = None
            print("WARNING: Pinecone API Key not set. Vector DB disabled.")

        # Initialize OpenAI for embeddings
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                self.openai = OpenAI(api_key=settings.OPENAI_API_KEY)
                print("OpenAI initialized successfully.")
            except Exception as e:
                print(f"OpenAI initialization failed: {e}. Embeddings disabled.")
                self.openai = None
        else:
            self.openai = None
            print("WARNING: OpenAI API Key not set. Embeddings disabled.")

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI."""
        if not self.openai:
            return [0.0] * 1536 # Mock embedding
        
        response = self.openai.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    async def upsert_event(self, 
                           event_id: str, 
                           text_description: str, 
                           metadata: Dict[str, Any]):
        """
        Upsert an event (biometric, message, transaction) into Pinecone.
        Schema:
        - ID: event_id
        - Vector: embedding(text_description)
        - Metadata: user_id, type, timestamp, score, raw_text
        """
        if not self.index:
            return
        
        vector = self.get_embedding(text_description)
        
        # Ensure metadata values are primitives (Pinecone requirement)
        clean_metadata = {
            k: str(v) if isinstance(v, (dict, list)) else v 
            for k, v in metadata.items()
        }
        
        self.index.upsert(vectors=[(event_id, vector, clean_metadata)])

    async def query_similar_events(self, 
                                   user_id: str, 
                                   query_text: str, 
                                   top_k: int = 5,
                                   filter_type: Optional[str] = None) -> List[Dict]:
        """
        Retrieve similar past events for a user to find patterns.
        """
        if not self.index:
            return []

        vector = self.get_embedding(query_text)
        
        filter_dict = {"user_id": user_id}
        if filter_type:
            filter_dict["type"] = filter_type

        results = self.index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
        ]

# Singleton instance
vector_service = VectorService()

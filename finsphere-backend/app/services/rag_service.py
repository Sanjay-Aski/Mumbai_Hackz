from typing import List, Dict, Any, Optional
from app.services.vector_db import vector_service
from app.core.config import settings
from app.core.prompts import INTERVENTION_SYSTEM_PROMPT, THERAPY_SYSTEM_PROMPT
from openai import OpenAI
import json

class RAGService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            print("WARNING: OpenAI API Key not found. RAG disabled.")

    async def generate_intervention(self, user_id: str, context_url: str) -> Dict[str, Any]:
        """
        Generates a personalized intervention using RAG.
        """
        if not self.client:
            return self._fallback_intervention()

        # 1. Retrieve Context
        stress_events = await vector_service.query_similar_events(
            user_id=user_id,
            query_text="high stress biometric reading",
            top_k=3,
            filter_type="biometric"
        )
        
        message_events = await vector_service.query_similar_events(
            user_id=user_id,
            query_text="negative sentiment message",
            top_k=2,
            filter_type="message"
        )

        # Format context
        context_str = "Recent User Context:\n"
        for e in stress_events:
            context_str += f"- [Biometric] {e['metadata'].get('timestamp')}: Score {e['metadata'].get('score')}\n"
        for e in message_events:
            context_str += f"- [Message] {e['metadata'].get('timestamp')}: {e['metadata'].get('raw_text', 'message')}\n"

        user_prompt = f"""
        Current Activity: Visiting {context_url}
        {context_str}
        
        Based on this, should we intervene?
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": INTERVENTION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._fallback_intervention()

    async def generate_therapy_response(self, user_id: str, user_message: str) -> str:
        """
        Generates an empathetic response for the voice therapy mode.
        """
        if not self.client:
            return "I'm here to listen, but my connection to the brain is down. Please tell me more."

        # Retrieve relevant financial context (optional, but good for grounding)
        # For now, we just use the system prompt + user message
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": THERAPY_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I understand this is difficult. I'm having trouble processing right now, but I'm listening."

    def _fallback_intervention(self):
        return {
            "should_intervene": True,
            "title": "Pause for a moment",
            "message": "We detected some stress signals. Let's take a 10-minute break before deciding.",
            "delay_minutes": 10
        }

rag_service = RAGService()

from typing import List, Dict, Any, Optional
from app.services.vector_db import vector_service
from app.services.ollama_service import ollama_service
from app.core.config import settings
from app.core.prompts import INTERVENTION_SYSTEM_PROMPT, THERAPY_SYSTEM_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.ollama = ollama_service
        logger.info(f"RAG Service initialized with Ollama model: {settings.OLLAMA_MODEL}")

    async def generate_intervention(self, user_id: str, context_url: str) -> Dict[str, Any]:
        """
        Generates a personalized intervention using RAG with Ollama.
        """
        if not self.ollama.is_available():
            logger.error("Ollama model not available")
            return self._fallback_intervention()

        try:
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
                context_str += f"- [Message] {e['metadata'].get('timestamp')}: Sentiment score {e['metadata'].get('score')}\n"

            user_prompt = f"""
Current Activity: Visiting {context_url}
{context_str}

Based on this context, should we intervene to protect this user's financial wellbeing?

Respond with a JSON object containing:
- should_intervene (boolean)
- title (string, max 50 chars)
- message (string, 1-2 sentences)
- delay_minutes (integer, 0-30)
"""

            # 2. Call Ollama for intervention decision
            messages = [
                {"role": "system", "content": INTERVENTION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ]
            
            response_text = self.ollama.chat(messages, temperature=0.3)
            
            # 3. Try to parse JSON response
            try:
                # Extract JSON from response (model might include extra text)
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    result = json.loads(json_str)
                    return result
            except json.JSONDecodeError as e:
                logger.warning(f"Could not parse intervention response: {e}")
                return self._fallback_intervention()
                
        except Exception as e:
            logger.error(f"Intervention generation error: {e}")
            return self._fallback_intervention()

    async def generate_therapy_response(self, user_id: str, user_message: str) -> str:
        """
        Generates an empathetic response for the voice therapy mode using Ollama.
        """
        if not self.ollama.is_available():
            return "I'm having trouble connecting to my AI brain right now. Please try again."

        try:
            messages = [
                {"role": "system", "content": THERAPY_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ]
            
            response = self.ollama.chat(messages, temperature=0.8)
            return response
            
        except Exception as e:
            logger.error(f"Therapy response error: {e}")
            return "I understand this is difficult. I'm having trouble processing right now, but I'm listening."

    def _fallback_intervention(self):
        return {
            "should_intervene": True,
            "title": "Pause for a moment",
            "message": "We detected some stress signals. Let's take a 10-minute break before deciding.",
            "delay_minutes": 10
        }

rag_service = RAGService()

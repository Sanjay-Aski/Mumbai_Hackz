"""
Ollama LLM Service
Handles all interactions with Ollama's local LLM models
"""

import requests
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.embeddings_model = settings.OLLAMA_EMBEDDINGS_MODEL
        self.chat_endpoint = f"{self.base_url}/api/chat"
        self.embeddings_endpoint = f"{self.base_url}/api/embeddings"
        self.models_endpoint = f"{self.base_url}/api/tags"
        
        # Test connection on initialization
        self._test_connection()
    
    def _test_connection(self):
        """Test if Ollama service is available"""
        try:
            response = requests.get(self.models_endpoint, timeout=5)
            if response.status_code == 200:
                logger.info("✓ Ollama service is running")
                self._log_available_models()
            else:
                logger.warning(f"Ollama service returned status {response.status_code}")
        except requests.exceptions.ConnectionError:
            logger.error(f"✗ Cannot connect to Ollama at {self.base_url}. Make sure Ollama is running.")
        except Exception as e:
            logger.error(f"Ollama connection error: {e}")
    
    def _log_available_models(self):
        """Log available models in Ollama"""
        try:
            response = requests.get(self.models_endpoint, timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name") for m in models]
                logger.info(f"Available Ollama models: {model_names}")
        except Exception as e:
            logger.debug(f"Could not fetch model list: {e}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using Ollama's embedding model
        
        Args:
            text: The text to embed
            
        Returns:
            Vector embedding (list of floats)
        """
        try:
            payload = {
                "model": self.embeddings_model,
                "prompt": text
            }
            
            response = requests.post(self.embeddings_endpoint, json=payload, timeout=30)
            
            if response.status_code == 200:
                embedding = response.json().get("embedding", [])
                logger.debug(f"Generated embedding with dimension: {len(embedding)}")
                return embedding
            else:
                logger.error(f"Embedding generation failed: {response.text}")
                return [0.0] * 384  # Return zero vector as fallback
                
        except requests.exceptions.Timeout:
            logger.error(f"Embedding request timed out for model {self.embeddings_model}")
            return [0.0] * 384
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return [0.0] * 384
    
    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7, top_p: float = 0.9) -> str:
        """
        Chat with the Ollama model
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature (0.0 to 2.0, higher = more creative)
            top_p: Nucleus sampling parameter
            
        Returns:
            Model's response text
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "top_p": top_p,
                    "num_predict": 256  # Limit output tokens for faster responses
                }
            }
            
            response = requests.post(self.chat_endpoint, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                message_content = result.get("message", {}).get("content", "")
                logger.debug(f"Chat response received: {len(message_content)} characters")
                return message_content
            else:
                logger.error(f"Chat request failed: {response.text}")
                return "I'm having trouble processing your request. Please try again."
                
        except requests.exceptions.Timeout:
            logger.error("Chat request timed out")
            return "I'm taking too long to think. Please try again."
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return f"Error occurred: {str(e)}"
    
    def chat_streaming(self, messages: List[Dict[str, str]]):
        """
        Chat with streaming response from Ollama
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            
        Yields:
            Response chunks as they arrive
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 256
                }
            }
            
            response = requests.post(self.chat_endpoint, json=payload, stream=True, timeout=60)
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            content = chunk.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            logger.debug("Skipped non-JSON line in stream")
            else:
                logger.error(f"Streaming chat failed: {response.text}")
                yield "Error: Could not get response from model"
                
        except requests.exceptions.Timeout:
            logger.error("Streaming chat timed out")
            yield "Timeout: Request took too long"
        except Exception as e:
            logger.error(f"Streaming chat error: {e}")
            yield f"Error: {str(e)}"
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        try:
            response = requests.get(self.models_endpoint, timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                for model in models:
                    if model.get("name") == self.model:
                        return model
                return {"model": self.model, "available": False}
            return {}
        except Exception as e:
            logger.error(f"Could not fetch model info: {e}")
            return {}
    
    def is_available(self) -> bool:
        """Check if Ollama and the required models are available"""
        try:
            response = requests.get(self.models_endpoint, timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name") for m in models]
                return self.model in model_names and self.embeddings_model in model_names
            return False
        except Exception:
            return False


# Global instance
ollama_service = OllamaService()

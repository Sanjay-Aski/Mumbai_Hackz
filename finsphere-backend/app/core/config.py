from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinSphere API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "development_secret_key_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Server Configuration
    BACKEND_HOST: str = "0.0.0.0"  # Allow network access
    BACKEND_PORT: int = 8000
    
    # Vector DB (Qdrant - Local/Network)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_NAME: str = "finsphere_context"
    
    # Ollama LLM Configuration (Local/Network)
    OLLAMA_HOST: str = "localhost"
    OLLAMA_PORT: int = 11434
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gpt-oss:20b-cloud"  # Using GPT-OSS 20B model
    OLLAMA_EMBEDDINGS_MODEL: str = "nomic-embed-text"  # For embeddings

    class Config:
        env_file = ".env"

settings = Settings()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database import Base
from app.core.config import settings
import os

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/finsphere_db"
)

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
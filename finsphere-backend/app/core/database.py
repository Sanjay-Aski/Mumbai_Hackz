from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database import Base
from app.core.config import settings
import os

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:123@localhost:5432/finsphere_db"
)

print(f"📡 Connecting to database: {DATABASE_URL}")

try:
    # Create engine with connection pool
    engine = create_engine(
        DATABASE_URL, 
        echo=False,  # Set to True for SQL debugging
        pool_pre_ping=True,  # Test connections before using them
        pool_size=10,
        max_overflow=20
    )
    
    # Test connection on startup
    with engine.connect() as conn:
        print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("⚠️  Backend will continue but database operations will fail")
    # Create a dummy engine that will fail later
    engine = None

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

def create_tables():
    """Create all database tables"""
    try:
        if engine is None:
            print("❌ Cannot create tables: No database connection")
            return
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

def get_db():
    """Get database session dependency"""
    if SessionLocal is None:
        raise Exception("Database not connected")
    
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {e}")
        raise
    finally:
        db.close()
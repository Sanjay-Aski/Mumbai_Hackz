from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import endpoints, auth
from app.core.database import create_tables

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for FinSphere: Autonomous Financial Coaching Agent"
)

# CORS - Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev
        "http://localhost:3001",  # Alternative frontend
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting FinSphere Backend...")
    create_tables()
    print("✅ Backend startup complete!")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "FinSphere API",
        "version": settings.VERSION,
        "cors_enabled": True
    }

@app.get("/api/v1/health")
async def api_health():
    return {
        "status": "ok",
        "service": "FinSphere API",
        "version": settings.VERSION
    }

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(endpoints.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to FinSphere API",
        "docs": "/docs",
        "version": settings.VERSION,
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🌐 Starting server on {settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    uvicorn.run("main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)

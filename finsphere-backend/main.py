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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(endpoints.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to FinSphere API", "docs": "/docs", "version": settings.VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)

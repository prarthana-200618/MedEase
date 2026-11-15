from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.documents import router as documents_router
from app.api.reminders import router as reminders_router
from app.api.chat import router as chat_router
from app.api.caregivers import router as caregivers_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist on startup
    Base.metadata.create_all(bind=engine)
    # Ensure upload directory exists
    Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MedEase - Healthcare document understanding platform designed for Malayalam-speaking patients, families, and caregivers.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(reminders_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(caregivers_router, prefix="/api")

@app.get("/")
def home():
    return {
        "project": settings.PROJECT_NAME,
        "message": "Welcome to MedEase API",
        "status": "operational",
        "database": "connected"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }

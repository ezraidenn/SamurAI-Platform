"""
Main FastAPI application for UCU Reporta.

This module initializes the FastAPI app, configures middleware,
includes routers, and sets up the database.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import engine, Base
from backend.routes import users as users_router
from backend.routes import reports as reports_router
from backend.routes import admin as admin_router
from backend.routes import name_change as name_change_router
from backend.routes import points_of_interest as pois_router
from backend.routes import announcements as announcements_router
from backend.config import CORS_ORIGINS
from pathlib import Path


# Create FastAPI application
app = FastAPI(
    title="UCU Reporta API",
    description="Civic reporting platform for municipalities in Yucatán",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS middleware
# Allow requests from frontend (loaded from .env)
# Note: When using wildcard (*), credentials must be False
print(f"🔧 Configurando CORS con origins: {CORS_ORIGINS}")
if CORS_ORIGINS == ["*"]:
    print("✅ Usando CORS wildcard (*) - permitiendo todos los orígenes")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    print(f"✅ Usando CORS específico para: {CORS_ORIGINS}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )


# Include routers with their respective prefixes
app.include_router(users_router.router)          # /auth endpoints
app.include_router(reports_router.router)        # /reports endpoints
app.include_router(admin_router.router)          # /admin endpoints
app.include_router(name_change_router.router)    # /name-change endpoints
app.include_router(pois_router.router)           # /points-of-interest endpoints
app.include_router(announcements_router.router)  # /announcements endpoints

# Mount static files for uploads
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    Note: Database tables are now managed by Alembic migrations.
    Run 'alembic upgrade head' to create/update tables.
    """
    # Tables are managed by Alembic - no auto-creation
    # Base.metadata.create_all(bind=engine)
    print("✓ UCU Reporta API is running")
    print("ℹ️  Use 'alembic upgrade head' to apply database migrations")


@app.get("/")
async def root():
    """
    Root endpoint.
    
    Returns basic API information and available endpoints.
    """
    return {
        "message": "Welcome to UCU Reporta API",
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "reports": "/reports",
            "admin": "/admin"
        }
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns the API health status.
    """
    return {"status": "healthy", "service": "UCU Reporta API"}


# Mount static files for serving uploaded photos
from fastapi.staticfiles import StaticFiles
import os

# Ensure static directory exists
os.makedirs("backend/static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="backend/static"), name="static")

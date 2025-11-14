"""
Main FastAPI application for UCU Reporta.

This module initializes the FastAPI app, configures middleware,
includes routers, and sets up the database.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import users_router, reports_router, admin_router


# Create FastAPI application
app = FastAPI(
    title="UCU Reporta API",
    description="Civic reporting platform for municipalities in Yucatán",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS middleware
# Allow requests from frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Include routers with their respective prefixes
app.include_router(users_router)      # /auth endpoints
app.include_router(reports_router)    # /reports endpoints
app.include_router(admin_router)      # /admin endpoints


@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    Creates all database tables on application startup.
    """
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
    print("✓ UCU Reporta API is running")


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

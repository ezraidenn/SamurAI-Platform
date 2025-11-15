"""
Database configuration for UCU Reporta.

This module sets up the database connection using SQLAlchemy.
It provides the Base class for models and a SessionLocal factory for database sessions.
Supports both SQLite (local) and PostgreSQL (Neon/production).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get database URL from environment variable
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./database/ucudigital.db"  # Fallback to SQLite if not set
)

# Ensure database directory exists (only for SQLite)
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    DATABASE_DIR = "./database"
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)

# Create SQLAlchemy engine
# connect_args is only needed for SQLite
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Neon) doesn't need check_same_thread
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal class for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


def get_db():
    """
    Dependency function for FastAPI to get database sessions.
    
    Yields a database session and ensures it's closed after use.
    
    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            # Use db here
            pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

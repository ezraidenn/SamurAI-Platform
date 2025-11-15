"""
Database configuration for UCU Reporta.

This module sets up the database connection using SQLAlchemy.
It provides the Base class for models and a SessionLocal factory for database sessions.
Supports both SQLite (local) and PostgreSQL (Neon/production).
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# CRITICAL: Load .env FIRST before anything else
# Get the directory where this file is located
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')

# Load .env from backend directory
load_dotenv(env_path)

# Get DATABASE_URL from environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/ucudigital.db")

# Debug: Print what we're using
print(f"🔍 database.py cargando .env desde: {env_path}")
print(f"🔍 DATABASE_URL: {SQLALCHEMY_DATABASE_URL[:60]}...")

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
    # PostgreSQL (Neon) con pool de conexiones optimizado
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=10,              # Número de conexiones en el pool
        max_overflow=20,           # Conexiones adicionales si se necesitan
        pool_timeout=30,           # Timeout para obtener conexión del pool
        pool_recycle=3600,         # Reciclar conexiones cada hora
        pool_pre_ping=True,        # Verificar conexión antes de usar
        connect_args={
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }
    )

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

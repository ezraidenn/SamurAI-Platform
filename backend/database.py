"""
Database configuration for UCU Reporta.

This module sets up the SQLite database connection using SQLAlchemy.
It provides the Base class for models and a SessionLocal factory for database sessions.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ensure database directory exists
DATABASE_DIR = "./database"
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)

# SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./database/ucudigital.db"

# Create SQLAlchemy engine
# connect_args is only needed for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
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

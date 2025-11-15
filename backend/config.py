"""
Configuration module for UCU Reporta backend.
Loads environment variables from .env file.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/ucudigital.db")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# CORS Configuration
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Print configuration on load (for debugging)
if ENVIRONMENT == "development":
    print("=" * 60)
    print("🔧 BACKEND CONFIGURATION")
    print("=" * 60)
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Database: {DATABASE_URL}")
    print(f"CORS Origins: {CORS_ORIGINS}")
    print(f"Environment: {ENVIRONMENT}")
    print("=" * 60)

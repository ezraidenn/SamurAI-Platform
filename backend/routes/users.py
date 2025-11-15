"""
User and authentication routes.

Handles user registration, login, and profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List
from backend.database import get_db
from backend.models.user import User
from backend.models.strike import Strike
from backend.schemas.user import UserCreate, UserLogin, UserResponse
from backend.auth.jwt_handler import create_access_token, get_current_user
from backend.utils.curp_validator import validate_curp


router = APIRouter(prefix="/auth", tags=["auth"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain text password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Validates CURP format, checks uniqueness of email and CURP,
    hashes the password, and creates the user with 'citizen' role by default.
    
    Args:
        user_data: User registration data (name, email, curp, password)
        db: Database session
        
    Returns:
        Created user data (without password)
        
    Raises:
        400: If CURP format is invalid
        400: If email or CURP already exists
    """
    # Validate CURP format
    if not validate_curp(user_data.curp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CURP format. CURP must follow the official Mexican format."
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if CURP already exists
    existing_curp = db.query(User).filter(User.curp == user_data.curp.upper()).first()
    if existing_curp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CURP already registered"
        )
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        curp=user_data.curp.upper(),
        hashed_password=hash_password(user_data.password),
        role="citizen"  # Default role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.
    
    Verifies email and password, then generates a JWT token.
    
    Args:
        login_data: Login credentials (email, password)
        db: Database session
        
    Returns:
        access_token: JWT token
        token_type: "bearer"
        user: User information
        
    Raises:
        401: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # DEBUG: Log login attempt
    print(f"\n🔐 Login attempt:")
    print(f"   Email: {login_data.email}")
    print(f"   User found: {user is not None}")
    if user:
        print(f"   User ID: {user.id}")
        print(f"   User role: {user.role}")
        print(f"   Hash (first 30): {user.hashed_password[:30]}")
        password_valid = verify_password(login_data.password, user.hashed_password)
        print(f"   Password valid: {password_valid}")
    
    # Verify user exists and password is correct
    if not user or not verify_password(login_data.password, user.hashed_password):
        print(f"   ❌ Login FAILED\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"   ✅ Login SUCCESS\n")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    
    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's profile.
    
    Requires valid JWT token in Authorization header.
    
    Args:
        current_user: Authenticated user from token
        
    Returns:
        Current user's profile information
    """
    return current_user


@router.get("/users/{user_id}/strikes")
async def get_user_strikes(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get strike history for a specific user.
    
    Only accessible by admin users.
    
    Args:
        user_id: ID of the user to get strikes for
        db: Database session
        current_user: Authenticated user (must be admin)
        
    Returns:
        List of strikes with details
        
    Raises:
        403: If user is not admin
        404: If user not found
    """
    # Check if current user is admin
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden ver el historial de strikes"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Get all strikes for this user
    strikes = db.query(Strike).filter(Strike.user_id == user_id).order_by(Strike.created_at.desc()).all()
    
    return {
        "user_id": user_id,
        "user_name": user.name,
        "user_email": user.email,
        "total_strikes": user.strike_count,
        "is_banned": user.is_banned,
        "ban_until": user.ban_until,
        "ban_reason": user.ban_reason,
        "strikes": [
            {
                "id": strike.id,
                "reason": strike.reason,
                "severity": strike.severity,
                "content_type": strike.content_type,
                "ai_detection": strike.ai_detection,
                "is_offensive": strike.is_offensive,
                "is_inappropriate": strike.is_inappropriate,
                "created_at": strike.created_at.isoformat()
            }
            for strike in strikes
        ]
    }

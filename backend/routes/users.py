"""
User and authentication routes.

Handles user registration, login, and profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from typing import List
from backend.database import get_db
from backend.models.user import User
from backend.models.strike import Strike
from backend.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, ChangePassword
from backend.auth.jwt_handler import create_access_token, get_current_user
from backend.utils.curp_validator import validate_curp


router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt."""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


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


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    
    Allows users to update their email address only.
    Name changes must be requested through an administrator.
    
    Args:
        profile_data: Updated profile data (email only)
        current_user: Authenticated user from token
        db: Database session
        
    Returns:
        Updated user profile
        
    Raises:
        400: If email is already in use by another user
    """
    # Check if email is being changed and if it's already in use
    if profile_data.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another user"
            )
    
    # Update email only
    current_user.email = profile_data.email
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.patch("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    Verifies current password before allowing change.
    
    Args:
        password_data: Current and new password
        current_user: Authenticated user from token
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        401: If current password is incorrect
        400: If new password is same as current
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Check if new password is different
    if verify_password(password_data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Update password
    current_user.hashed_password = hash_password(password_data.new_password)
    
    db.commit()
    
    return {
        "message": "Password changed successfully",
        "success": True
    }

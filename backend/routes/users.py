"""
User and authentication routes.

Handles user registration, login, and profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import get_db
from backend.models.user import User
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
    
    # Verify user exists and password is correct
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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

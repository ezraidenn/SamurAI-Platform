"""
User Pydantic schemas for request/response validation.

Defines validation models for user-related API operations.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """
    Base user schema with common fields.
    
    Attributes:
        name: User's full name
        email: Valid email address
        curp: CURP (Clave Única de Registro de Población)
    """
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    curp: str = Field(..., min_length=18, max_length=18)


class UserCreate(UserBase):
    """
    Schema for user registration.
    
    Extends UserBase with password field.
    
    Attributes:
        password: Plain text password (will be hashed before storage)
    """
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """
    Schema for user login.
    
    Attributes:
        email: User's email address
        password: User's password
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    Schema for user responses (excludes sensitive data like password).
    
    Attributes:
        id: User ID
        name: User's full name
        email: User's email
        curp: User's CURP
        role: User role (citizen or admin)
        created_at: Registration timestamp
    """
    id: int
    name: str
    email: str
    curp: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy models

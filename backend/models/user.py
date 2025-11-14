"""
User model for UCU Reporta.

Defines the User table structure with authentication and role information.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    """
    User model for storing user information and authentication data.
    
    Attributes:
        id: Primary key
        name: User's full name
        email: Unique email address for authentication
        curp: Unique CURP (Clave Única de Registro de Población)
        hashed_password: Bcrypt-hashed password
        role: User role (citizen or admin)
        created_at: Timestamp of user creation
        updated_at: Timestamp of last update
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    curp = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen", nullable=False)  # "citizen" or "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to reports
    reports = relationship("Report", back_populates="user")

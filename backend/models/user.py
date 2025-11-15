"""
User model for UCU Reporta.

Defines the User table structure with authentication and role information.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
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
        role: User role (citizen, operator, supervisor, or admin)
        created_at: Timestamp of user creation
        updated_at: Timestamp of last update
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    curp = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen", nullable=False)  # "citizen", "operator", "supervisor", or "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Moderation fields
    strike_count = Column(Integer, default=0, nullable=False)  # Total strikes
    is_banned = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    ban_until = Column(DateTime(timezone=True), nullable=True)  # When ban expires
    ban_reason = Column(Text, nullable=True)  # Why user was banned
    last_strike_at = Column(DateTime(timezone=True), nullable=True)  # Last strike timestamp
    
    # Relationships
    reports = relationship("Report", foreign_keys="Report.user_id", back_populates="user")
    strikes = relationship("Strike", back_populates="user", cascade="all, delete-orphan")
    points_of_interest = relationship("PointOfInterest", foreign_keys="PointOfInterest.user_id", back_populates="user")
    announcements = relationship("Announcement", back_populates="creator")

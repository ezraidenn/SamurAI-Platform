"""
Strike model for user moderation.

Tracks user infractions for inappropriate content, jokes, offensive material.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base


class Strike(Base):
    """
    Strike model for tracking user infractions.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        reason: Why the strike was issued
        severity: Severity level (low, medium, high, critical)
        content_type: What triggered it (photo, description, both)
        ai_detection: What the AI detected
        created_at: When the strike was issued
    """
    __tablename__ = "strikes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Strike details
    reason = Column(Text, nullable=False)  # Human-readable reason
    severity = Column(String, nullable=False)  # low, medium, high, critical
    content_type = Column(String, nullable=False)  # photo, description, both
    
    # AI detection details
    ai_detection = Column(Text, nullable=True)  # What AI detected
    is_offensive = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    is_joke = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    is_inappropriate = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    
    # Related report (if any)
    report_id = Column(Integer, nullable=True)  # ID of rejected report
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="strikes")

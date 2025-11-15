"""
Report model for UCU Reporta.

Defines the Report table structure for civic incident reporting.
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base


class Report(Base):
    """
    Report model for storing civic incident reports.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        category: Type of incident (bache, alumbrado, basura, drenaje, vialidad)
        description: Detailed description of the incident
        latitude: GPS latitude coordinate
        longitude: GPS longitude coordinate
        photo_url: Optional URL to uploaded photo evidence
        priority: Priority level (1-5, calculated automatically)
        status: Current status (pendiente, en_proceso, resuelto)
        created_at: Timestamp of report creation
        updated_at: Timestamp of last update
    """
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)  # Operator/Supervisor assigned
    category = Column(String, nullable=False)  # bache, alumbrado, basura, drenaje, vialidad
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_url = Column(String, nullable=True)
    priority = Column(Integer, default=1, nullable=False)  # 1 to 5
    status = Column(String, default="pendiente", nullable=False)  # pendiente, en_proceso, resuelto
    
    # AI Analysis fields
    ai_validated = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes (SQLite doesn't have boolean)
    ai_confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    ai_suggested_category = Column(String, nullable=True)
    ai_urgency_level = Column(String, nullable=True)  # low, medium, high, critical
    ai_keywords = Column(Text, nullable=True)  # JSON string of keywords
    ai_reasoning = Column(Text, nullable=True)
    
    # AI Image Analysis fields
    ai_image_valid = Column(Integer, default=1, nullable=True)  # 0=invalid, 1=valid
    ai_severity_score = Column(Integer, nullable=True)  # 1-10 scale
    ai_observed_details = Column(Text, nullable=True)  # What AI saw in the image
    ai_quantity_assessment = Column(String, nullable=True)  # mucho/moderado/poco
    ai_rejection_reason = Column(Text, nullable=True)  # Why image was rejected if invalid
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="reports")
    assigned_user = relationship("User", foreign_keys=[assigned_to], viewonly=True)

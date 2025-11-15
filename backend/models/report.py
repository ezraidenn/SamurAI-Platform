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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="reports")
    assigned_user = relationship("User", foreign_keys=[assigned_to], viewonly=True)

"""
Report Pydantic schemas for request/response validation.

Defines validation models for report-related API operations.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    """
    Base report schema with common fields.
    
    Attributes:
        category: Type of incident (bache, alumbrado, basura, drenaje, vialidad)
        description: Detailed description of the incident
        latitude: GPS latitude coordinate
        longitude: GPS longitude coordinate
        photo_url: Optional URL to photo evidence
    """
    category: str = Field(..., pattern="^(bache|alumbrado|basura|drenaje|vialidad)$")
    description: str = Field(..., min_length=10, max_length=1000)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    photo_url: Optional[str] = None


class ReportCreate(ReportBase):
    """
    Schema for creating a new report.
    
    Inherits all fields from ReportBase.
    Priority and status will be set automatically by the backend.
    """
    pass


class ReportResponse(BaseModel):
    """
    Schema for report responses.
    
    Attributes:
        id: Report ID
        user_id: ID of the user who created the report
        category: Type of incident
        description: Incident description
        latitude: GPS latitude
        longitude: GPS longitude
        photo_url: Optional photo URL
        priority: Priority level (1-5)
        status: Current status (pendiente, en_proceso, resuelto)
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    id: int
    user_id: int
    category: str
    description: str
    latitude: float
    longitude: float
    photo_url: Optional[str]
    priority: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy models

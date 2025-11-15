"""
Report Pydantic schemas for request/response validation.

Defines validation models for report-related API operations.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    """
    Base report schema with common fields.
    
    Attributes:
        category: Type of incident (via_mal_estado, infraestructura_danada, senalizacion_transito, iluminacion_visibilidad)
        description: Detailed description of the incident
        latitude: GPS latitude coordinate
        longitude: GPS longitude coordinate
        photo_url: Optional URL to photo evidence
    """
    category: str = Field(..., pattern="^(via_mal_estado|infraestructura_danada|senalizacion_transito|iluminacion_visibilidad)$")
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
        ai_validated: Whether AI validation was performed
        ai_confidence: AI confidence score (0-1)
        ai_suggested_category: AI suggested category
        ai_urgency_level: AI urgency assessment
        ai_keywords: AI extracted keywords (JSON string)
        ai_reasoning: AI reasoning for categorization
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
    ai_validated: int
    ai_confidence: Optional[float] = None
    ai_suggested_category: Optional[str] = None
    ai_urgency_level: Optional[str] = None
    ai_keywords: Optional[str] = None
    ai_reasoning: Optional[str] = None
    ai_image_valid: Optional[int] = None
    ai_severity_score: Optional[int] = None
    ai_observed_details: Optional[str] = None
    ai_quantity_assessment: Optional[str] = None
    ai_rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[Dict[str, Any]] = None  # User information
    
    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy models

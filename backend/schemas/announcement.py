"""
Pydantic schemas for Announcement validation.

Defines request/response models for announcement operations.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AnnouncementBase(BaseModel):
    """
    Base announcement schema with common fields.
    
    Attributes:
        title: Announcement title
        description: Announcement content
        type: Type (anuncio, aviso, reporte)
        priority: Display priority (1-5)
        expires_at: Optional expiration date
    """
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    type: str = Field(..., pattern="^(anuncio|aviso|reporte)$")
    priority: int = Field(default=1, ge=1, le=5)
    link_url: Optional[str] = Field(None, max_length=500)
    expires_at: Optional[datetime] = None


class AnnouncementCreate(AnnouncementBase):
    """
    Schema for creating a new announcement.
    
    Inherits all fields from AnnouncementBase.
    """
    pass


class AnnouncementUpdate(BaseModel):
    """
    Schema for updating an announcement.
    
    All fields are optional to allow partial updates.
    """
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    type: Optional[str] = Field(None, pattern="^(anuncio|aviso|reporte)$")
    priority: Optional[int] = Field(None, ge=1, le=5)
    link_url: Optional[str] = Field(None, max_length=500)
    active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(AnnouncementBase):
    """
    Complete announcement schema for API responses.
    
    Includes all fields plus metadata.
    """
    id: int
    active: bool
    created_by: int
    created_at: datetime
    creator_name: Optional[str] = None
    
    class Config:
        from_attributes = True

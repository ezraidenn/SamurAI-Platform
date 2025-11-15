"""
Announcement model for public announcements on the home page.

Allows admins and supervisors to create announcements that appear
on the public home page banner.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class Announcement(Base):
    """
    Announcement model for public notices.
    
    Attributes:
        id: Primary key
        title: Announcement title
        description: Announcement content
        type: Type of announcement (anuncio, aviso, reporte)
        priority: Display priority (1-5, higher = more important)
        active: Whether the announcement is currently active
        created_by: ID of user who created it
        created_at: Creation timestamp
        expires_at: Optional expiration date
    """
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default='anuncio')  # anuncio, aviso, reporte
    priority = Column(Integer, default=1)  # 1-5
    active = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=True)  # URL de imagen subida
    link_url = Column(String(500), nullable=True)  # Enlace externo opcional
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationship
    creator = relationship("User", back_populates="announcements")

"""
Point of Interest Model

Modelo para puntos de interés (negocios, lugares) en Ucú.
Incluye validación automática con IA y validación humana.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class PointOfInterest(Base):
    """
    Punto de Interés - Negocios y lugares en Ucú.
    
    Flujo:
    1. Usuario crea POI
    2. IA pre-valida (determina categoría, valida contenido)
    3. Si IA aprueba → Pasa a validación humana
    4. Admin/Supervisor valida
    5. Si aprueba → Aparece en mapa público
    """
    __tablename__ = "points_of_interest"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información básica
    nombre = Column(String(200), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    
    # Categoría (determinada por IA)
    categoria = Column(String(50), nullable=True, index=True)  # IA la determina
    subcategoria = Column(String(50), nullable=True)
    categoria_confidence = Column(Float, nullable=True)  # Confianza de IA en categoría
    categoria_manual_override = Column(Boolean, default=False)  # Si humano la cambió
    categoria_original_ia = Column(String(50), nullable=True)  # Categoría original de IA
    
    # Ubicación
    direccion = Column(String(500), nullable=False)
    colonia = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    # Contacto
    telefono = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    website = Column(String(200), nullable=True)
    facebook = Column(String(200), nullable=True)
    instagram = Column(String(200), nullable=True)
    
    # Horarios (JSON: {"lunes": "9:00-18:00", ...})
    horarios = Column(JSON, nullable=True)
    
    # Multimedia
    photo_url = Column(String(500), nullable=True)
    galeria = Column(JSON, nullable=True)  # Array de URLs
    
    # Validación IA
    ia_status = Column(String(20), default="pending_ia", nullable=False, index=True)
    # pending_ia, approved_ia, rejected_ia
    
    ia_validation_result = Column(JSON, nullable=True)  # Resultado completo de IA
    ia_confidence_score = Column(Float, nullable=True)  # 0.0 - 1.0
    ia_spam_level = Column(String(20), nullable=True)  # none, low, medium, high
    ia_spam_acceptable = Column(Boolean, nullable=True)
    ia_suggested_changes = Column(JSON, nullable=True)
    ia_warnings = Column(JSON, nullable=True)  # Advertencias (no bloquean)
    ia_rejection_reason = Column(Text, nullable=True)
    ia_validated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Validación Humana
    human_status = Column(String(20), default="pending", nullable=False, index=True)
    # pending, approved, rejected
    
    human_validator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    human_rejection_reason = Column(Text, nullable=True)
    human_validated_at = Column(DateTime(timezone=True), nullable=True)
    human_notes = Column(Text, nullable=True)  # Notas del validador
    
    # Estado Final
    status = Column(String(20), default="draft", nullable=False, index=True)
    # draft, pending, approved, rejected
    
    is_public = Column(Boolean, default=False, nullable=False, index=True)
    is_official = Column(Boolean, default=False, nullable=False, index=True)  # POIs oficiales (escuelas, hospitales, etc.)
    
    # Estadísticas
    views_count = Column(Integer, default=0, nullable=False)
    reports_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    user = relationship("User", foreign_keys=[user_id], back_populates="points_of_interest")
    validator = relationship("User", foreign_keys=[human_validator_id])

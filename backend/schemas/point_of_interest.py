"""
Point of Interest Pydantic Schemas

Schemas para validación de datos de POIs.
"""
from datetime import datetime
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# Schemas de Entrada
# ============================================================================

class POICreate(BaseModel):
    """
    Schema para crear un POI.
    Usuario NO proporciona categoría - IA la determina.
    """
    nombre: str = Field(..., min_length=3, max_length=200)
    descripcion: Optional[str] = Field(None, max_length=2000)
    
    # Ubicación
    direccion: str = Field(..., min_length=5, max_length=500)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=10)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    # Contacto (todo opcional)
    telefono: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    facebook: Optional[str] = Field(None, max_length=200)
    instagram: Optional[str] = Field(None, max_length=200)
    
    # Horarios
    horarios: Optional[Dict[str, str]] = None
    
    # Foto
    photo_url: Optional[str] = None


class POIPreValidate(BaseModel):
    """
    Schema para pre-validación con IA.
    Mismo que POICreate pero para endpoint de validación.
    """
    nombre: str
    descripcion: Optional[str] = None
    direccion: str
    telefono: Optional[str] = None
    photo_url: Optional[str] = None


class POIUpdate(BaseModel):
    """
    Schema para actualizar un POI.
    Todos los campos son opcionales.
    """
    nombre: Optional[str] = Field(None, min_length=3, max_length=200)
    descripcion: Optional[str] = Field(None, max_length=2000)
    direccion: Optional[str] = Field(None, min_length=5, max_length=500)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=10)
    telefono: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    facebook: Optional[str] = Field(None, max_length=200)
    instagram: Optional[str] = Field(None, max_length=200)
    horarios: Optional[Dict[str, str]] = None


class POIValidateHuman(BaseModel):
    """
    Schema para validación humana (admin/supervisor).
    """
    status: str = Field(..., pattern="^(approved|rejected)$")
    rejection_reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    
    # Admin puede cambiar categoría si IA se equivocó
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None


class POICategoryUpdate(BaseModel):
    """
    Schema para actualizar solo la categoría (admin).
    """
    categoria: str = Field(..., max_length=50)
    subcategoria: Optional[str] = Field(None, max_length=50)


# ============================================================================
# Schemas de Respuesta
# ============================================================================

class IAValidationResult(BaseModel):
    """
    Resultado de validación IA.
    """
    approved: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    
    # Categoría determinada por IA
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    confidence_categoria: Optional[float] = None
    
    # Análisis
    issues: List[str] = []
    warnings: List[str] = []
    
    # Sugerencias
    suggestions: Dict[str, Any] = {}
    
    # Spam
    spam_level: str = "none"  # none, low, medium, high
    spam_acceptable: bool = True
    
    # Rechazo
    rejection_reason: Optional[str] = None


class POIResponse(BaseModel):
    """
    Schema de respuesta completa de POI.
    """
    id: int
    user_id: int
    
    # Información básica
    nombre: str
    descripcion: Optional[str]
    
    # Categoría
    categoria: Optional[str]
    subcategoria: Optional[str]
    categoria_confidence: Optional[float]
    categoria_manual_override: bool
    
    # Ubicación
    direccion: str
    colonia: Optional[str]
    codigo_postal: Optional[str]
    latitude: float
    longitude: float
    
    # Contacto
    telefono: Optional[str]
    whatsapp: Optional[str]
    email: Optional[str]
    website: Optional[str]
    facebook: Optional[str]
    instagram: Optional[str]
    
    # Horarios y multimedia
    horarios: Optional[Dict[str, str]]
    photo_url: Optional[str]
    galeria: Optional[List[str]]
    
    # Validación IA
    ia_status: str
    ia_confidence_score: Optional[float]
    ia_spam_level: Optional[str]
    ia_spam_acceptable: Optional[bool]
    ia_warnings: Optional[List[str]]
    ia_rejection_reason: Optional[str]
    ia_validated_at: Optional[datetime]
    
    # Validación Humana
    human_status: str
    human_rejection_reason: Optional[str]
    human_validated_at: Optional[datetime]
    human_notes: Optional[str]
    
    # Estado
    status: str
    is_public: bool
    
    # Estadísticas
    views_count: int
    reports_count: int
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class POIPublicResponse(BaseModel):
    """
    Schema de respuesta pública (para mapa).
    Solo información esencial, sin datos de validación.
    """
    id: int
    nombre: str
    descripcion: Optional[str]
    categoria: Optional[str]
    subcategoria: Optional[str]
    direccion: str
    colonia: Optional[str]
    latitude: float
    longitude: float
    telefono: Optional[str]
    whatsapp: Optional[str]
    email: Optional[str]
    website: Optional[str]
    facebook: Optional[str]
    instagram: Optional[str]
    horarios: Optional[Dict[str, str]]
    photo_url: Optional[str]
    galeria: Optional[List[str]]
    views_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class PhotoUploadResponse(BaseModel):
    """
    Respuesta de upload de foto.
    """
    photo_url: str


class POIStatsResponse(BaseModel):
    """
    Estadísticas de POIs.
    """
    total: int
    pending_ia: int
    approved_ia: int
    rejected_ia: int
    pending_human: int
    approved: int
    rejected: int
    by_category: Dict[str, int]
    by_spam_level: Dict[str, int]

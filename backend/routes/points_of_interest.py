"""
Points of Interest API Routes

Endpoints para sistema de POIs con validación IA.
"""
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import SessionLocal
from backend.models.user import User
from backend.models.point_of_interest import PointOfInterest
from backend.schemas.point_of_interest import (
    POICreate, POIUpdate, POIValidateHuman, POIPreValidate,
    POIResponse, POIPublicResponse, PhotoUploadResponse,
    IAValidationResult, POIStatsResponse
)
from backend.routes.users import get_current_user
from backend.services.poi_validator import poi_validator

router = APIRouter(prefix="/points-of-interest", tags=["Points of Interest"])

# Configuración
UPLOAD_DIR = "backend/static/uploads/pois"
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_db():
    """Dependency para obtener sesión de BD."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin_or_supervisor(current_user: User = Depends(get_current_user)):
    """Dependency para requerir rol admin o supervisor."""
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo admins y supervisores pueden realizar esta acción"
        )
    return current_user


# ============================================================================
# Upload de Fotos
# ============================================================================

@router.post("/upload-photo", response_model=PhotoUploadResponse)
async def upload_poi_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload de foto para POI."""
    # Validar extensión
    file_ext = os.path.splitext(photo.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Permitidos: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Crear directorio si no existe
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generar nombre único
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Guardar archivo
    try:
        content = await photo.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archivo muy grande. Máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar archivo: {str(e)}"
        )
    
    return PhotoUploadResponse(photo_url=f"/static/uploads/pois/{unique_filename}")


# ============================================================================
# Pre-validación con IA
# ============================================================================

@router.post("/pre-validate", response_model=IAValidationResult)
async def pre_validate_poi(
    poi_data: POIPreValidate,
    current_user: User = Depends(get_current_user)
):
    """
    Pre-validación de POI con IA antes de crear.
    IA determina categoría y valida contenido.
    """
    try:
        # Obtener path de foto si existe
        photo_path = None
        if poi_data.photo_url:
            # photo_url ya incluye /static/uploads/pois/filename.ext
            photo_path = f"backend{poi_data.photo_url}"
        
        # Validar con IA
        result = await poi_validator.validate_poi(
            nombre=poi_data.nombre,
            descripcion=poi_data.descripcion,
            direccion=poi_data.direccion,
            telefono=poi_data.telefono,
            photo_path=photo_path
        )
        
        return IAValidationResult(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en validación IA: {str(e)}"
        )


# ============================================================================
# Crear POI
# ============================================================================

@router.post("/", response_model=POIResponse, status_code=status.HTTP_201_CREATED)
async def create_poi(
    poi_data: POICreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear nuevo POI.
    Automáticamente se valida con IA después de crear.
    """
    # Crear POI
    new_poi = PointOfInterest(
        user_id=current_user.id,
        nombre=poi_data.nombre,
        descripcion=poi_data.descripcion,
        direccion=poi_data.direccion,
        colonia=poi_data.colonia,
        codigo_postal=poi_data.codigo_postal,
        latitude=poi_data.latitude,
        longitude=poi_data.longitude,
        telefono=poi_data.telefono,
        whatsapp=poi_data.whatsapp,
        email=poi_data.email,
        website=poi_data.website,
        facebook=poi_data.facebook,
        instagram=poi_data.instagram,
        horarios=poi_data.horarios,
        photo_url=poi_data.photo_url,
        ia_status="pending_ia",
        human_status="pending",
        status="pending"
    )
    
    db.add(new_poi)
    db.commit()
    db.refresh(new_poi)
    
    # Validar con IA en background (por ahora síncrono)
    try:
        photo_path = None
        if new_poi.photo_url:
            photo_path = f"backend{new_poi.photo_url}"
        
        ia_result = await poi_validator.validate_poi(
            nombre=new_poi.nombre,
            descripcion=new_poi.descripcion,
            direccion=new_poi.direccion,
            telefono=new_poi.telefono,
            photo_path=photo_path
        )
        
        # Actualizar con resultado de IA
        new_poi.categoria = ia_result.get("categoria")
        new_poi.subcategoria = ia_result.get("subcategoria")
        new_poi.categoria_confidence = ia_result.get("confidence_categoria")
        new_poi.categoria_original_ia = ia_result.get("categoria")
        new_poi.ia_status = "approved_ia" if ia_result.get("approved") else "rejected_ia"
        new_poi.ia_confidence_score = ia_result.get("confidence")
        new_poi.ia_spam_level = ia_result.get("spam_level")
        new_poi.ia_spam_acceptable = ia_result.get("spam_acceptable")
        new_poi.ia_warnings = ia_result.get("warnings")
        new_poi.ia_suggested_changes = ia_result.get("suggestions")
        new_poi.ia_rejection_reason = ia_result.get("rejection_reason")
        new_poi.ia_validation_result = ia_result
        
        db.commit()
        db.refresh(new_poi)
        
    except Exception as e:
        print(f"❌ Error en validación IA: {e}")
        # Continuar aunque falle IA
    
    return new_poi


# ============================================================================
# Listar POIs
# ============================================================================

@router.get("/public", response_model=List[POIPublicResponse])
async def get_public_pois(
    categoria: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """
    Obtener POIs públicos (aprobados).
    Sin autenticación requerida.
    """
    query = db.query(PointOfInterest).filter(
        PointOfInterest.status == "approved",
        PointOfInterest.is_public == True
    )
    
    if categoria:
        query = query.filter(PointOfInterest.categoria == categoria)
    
    if search:
        query = query.filter(
            PointOfInterest.nombre.ilike(f"%{search}%")
        )
    
    pois = query.order_by(PointOfInterest.created_at.desc()).all()
    return pois


@router.get("/my-pois", response_model=List[POIResponse])
async def get_my_pois(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener POIs del usuario actual."""
    pois = db.query(PointOfInterest)\
        .filter(PointOfInterest.user_id == current_user.id)\
        .order_by(PointOfInterest.created_at.desc())\
        .all()
    
    return pois


@router.get("/pending-validation", response_model=List[POIResponse])
async def get_pending_validation(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_supervisor)
):
    """
    Obtener POIs pendientes de validación humana.
    Solo POIs que pasaron validación IA.
    """
    pois = db.query(PointOfInterest)\
        .filter(
            PointOfInterest.ia_status == "approved_ia",
            PointOfInterest.human_status == "pending"
        )\
        .order_by(PointOfInterest.created_at.desc())\
        .all()
    
    return pois


@router.get("/all", response_model=List[POIResponse])
async def get_all_pois(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_supervisor)
):
    """Obtener todos los POIs (admin)."""
    query = db.query(PointOfInterest)
    
    if status:
        query = query.filter(PointOfInterest.status == status)
    
    pois = query.order_by(PointOfInterest.created_at.desc()).all()
    return pois


# ============================================================================
# Validar POI (Humano)
# ============================================================================

@router.put("/{poi_id}/validate", response_model=POIResponse)
async def validate_poi(
    poi_id: int,
    validation: POIValidateHuman,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_supervisor)
):
    """
    Validar POI (admin/supervisor).
    Puede cambiar categoría si IA se equivocó.
    """
    poi = db.query(PointOfInterest).filter(PointOfInterest.id == poi_id).first()
    
    if not poi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="POI no encontrado"
        )
    
    # Actualizar estado humano
    poi.human_status = validation.status
    poi.human_validator_id = current_user.id
    poi.human_rejection_reason = validation.rejection_reason
    poi.human_notes = validation.notes
    poi.human_validated_at = func.now()
    
    # Actualizar categoría si admin la cambió
    if validation.categoria:
        if validation.categoria != poi.categoria:
            poi.categoria_manual_override = True
        poi.categoria = validation.categoria
        poi.subcategoria = validation.subcategoria
    
    # Actualizar estado final
    if validation.status == "approved":
        poi.status = "approved"
        poi.is_public = True
    else:
        poi.status = "rejected"
        poi.is_public = False
    
    db.commit()
    db.refresh(poi)
    
    return poi


# ============================================================================
# Actualizar POI
# ============================================================================

@router.put("/{poi_id}", response_model=POIResponse)
async def update_poi(
    poi_id: int,
    poi_data: POIUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar POI (owner o admin)."""
    poi = db.query(PointOfInterest).filter(PointOfInterest.id == poi_id).first()
    
    if not poi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="POI no encontrado"
        )
    
    # Verificar permisos
    if poi.user_id != current_user.id and current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar este POI"
        )
    
    # Actualizar campos
    for field, value in poi_data.dict(exclude_unset=True).items():
        setattr(poi, field, value)
    
    db.commit()
    db.refresh(poi)
    
    return poi


# ============================================================================
# Eliminar POI
# ============================================================================

@router.delete("/{poi_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_poi(
    poi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar POI (owner o admin)."""
    poi = db.query(PointOfInterest).filter(PointOfInterest.id == poi_id).first()
    
    if not poi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="POI no encontrado"
        )
    
    # Verificar permisos
    if poi.user_id != current_user.id and current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este POI"
        )
    
    # Eliminar fotos
    if poi.photo_url:
        photo_path = f"backend/static{poi.photo_url}"
        if os.path.exists(photo_path):
            try:
                os.remove(photo_path)
            except:
                pass
    
    db.delete(poi)
    db.commit()
    
    return None


# ============================================================================
# Estadísticas
# ============================================================================

@router.get("/stats", response_model=POIStatsResponse)
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_supervisor)
):
    """Obtener estadísticas de POIs."""
    total = db.query(PointOfInterest).count()
    pending_ia = db.query(PointOfInterest).filter(PointOfInterest.ia_status == "pending_ia").count()
    approved_ia = db.query(PointOfInterest).filter(PointOfInterest.ia_status == "approved_ia").count()
    rejected_ia = db.query(PointOfInterest).filter(PointOfInterest.ia_status == "rejected_ia").count()
    pending_human = db.query(PointOfInterest).filter(PointOfInterest.human_status == "pending").count()
    approved = db.query(PointOfInterest).filter(PointOfInterest.status == "approved").count()
    rejected = db.query(PointOfInterest).filter(PointOfInterest.status == "rejected").count()
    
    # Por categoría
    by_category = {}
    categories = db.query(
        PointOfInterest.categoria,
        func.count(PointOfInterest.id)
    ).group_by(PointOfInterest.categoria).all()
    
    for cat, count in categories:
        by_category[cat or "sin_categoria"] = count
    
    # Por spam level
    by_spam = {}
    spam_levels = db.query(
        PointOfInterest.ia_spam_level,
        func.count(PointOfInterest.id)
    ).group_by(PointOfInterest.ia_spam_level).all()
    
    for level, count in spam_levels:
        by_spam[level or "none"] = count
    
    return POIStatsResponse(
        total=total,
        pending_ia=pending_ia,
        approved_ia=approved_ia,
        rejected_ia=rejected_ia,
        pending_human=pending_human,
        approved=approved,
        rejected=rejected,
        by_category=by_category,
        by_spam_level=by_spam
    )

"""
Announcement routes for public notices.

Handles CRUD operations for announcements on the home page.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid
from backend.database import get_db
from backend.models.user import User
from backend.models.announcement import Announcement
from backend.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from backend.auth.jwt_handler import get_current_user


router = APIRouter(prefix="/announcements", tags=["announcements"])

# Configuración de subida de archivos
UPLOAD_DIR = Path("backend/uploads/announcements")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/test")
async def test_form(
    title: str = Form(...),
    description: str = Form(...),
):
    """Test endpoint para verificar que FormData funciona"""
    return {"title": title, "description": description, "status": "OK"}


def require_supervisor_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure user is a supervisor or admin.
    
    Args:
        current_user: Authenticated user
        
    Returns:
        User if they are supervisor or admin
        
    Raises:
        HTTPException 403: If user is not supervisor or admin
    """
    print(f" Auth check: User {current_user.name} (role: {current_user.role})")
    if current_user.role not in ['supervisor', 'admin']:
        print(f" Access denied for role: {current_user.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo supervisores y administradores pueden realizar esta acción"
        )
    print(f" Access granted")
    return current_user


@router.get("/public")
async def get_public_announcements(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get active announcements for public display (no authentication required).
    
    Returns only active announcements that haven't expired, ordered by priority
    and creation date.
    
    Args:
        limit: Maximum number of announcements to return
        db: Database session
        
    Returns:
        List of active announcements
    """
    now = datetime.utcnow()
    
    announcements = db.query(Announcement)\
        .filter(Announcement.active == True)\
        .filter(
            (Announcement.expires_at == None) | 
            (Announcement.expires_at > now)
        )\
        .order_by(Announcement.priority.desc(), Announcement.created_at.desc())\
        .limit(limit)\
        .all()
    
    # Add creator name to response
    result = []
    for announcement in announcements:
        ann_dict = {
            "id": announcement.id,
            "title": announcement.title,
            "description": announcement.description,
            "type": announcement.type,
            "priority": announcement.priority,
            "active": announcement.active,
            "image_url": announcement.image_url,
            "link_url": announcement.link_url,
            "created_by": announcement.created_by,
            "created_at": announcement.created_at,
            "expires_at": announcement.expires_at,
            "creator_name": announcement.creator.name if announcement.creator else "Sistema"
        }
        result.append(ann_dict)
    
    return result


@router.get("/")
async def get_all_announcements(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_supervisor_or_admin)
):
    """
    Get all announcements (supervisor/admin only).
    
    Args:
        include_inactive: Include inactive announcements
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of announcements
    """
    query = db.query(Announcement)
    
    if not include_inactive:
        query = query.filter(Announcement.active == True)
    
    announcements = query.order_by(
        Announcement.priority.desc(), 
        Announcement.created_at.desc()
    ).all()
    
    # Add creator name
    result = []
    for announcement in announcements:
        ann_dict = {
            "id": announcement.id,
            "title": announcement.title,
            "description": announcement.description,
            "type": announcement.type,
            "priority": announcement.priority,
            "active": announcement.active,
            "image_url": announcement.image_url,
            "link_url": announcement.link_url,
            "created_by": announcement.created_by,
            "created_at": announcement.created_at,
            "expires_at": announcement.expires_at,
            "creator_name": announcement.creator.name if announcement.creator else "Sistema"
        }
        result.append(ann_dict)
    
    return result


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=None)
async def create_announcement(
    title: str = Form(...),
    description: str = Form(...),
    announcement_type: str = Form(..., alias="type"),
    priority: str = Form("3"),
    link_url: Optional[str] = Form(""),
    expires_at: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_supervisor_or_admin)
):
    """
    Create a new announcement with optional image upload (supervisor/admin only).
    
    Args:
        title: Announcement title
        description: Announcement description
        type: Type (anuncio, aviso, reporte)
        priority: Priority level (1-5)
        link_url: Optional external link
        image: Optional image file
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created announcement
    """
    # Convertir priority a int
    try:
        priority_int = int(priority)
        if priority_int < 1 or priority_int > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La prioridad debe estar entre 1 y 5"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La prioridad debe ser un número"
        )
    
    # Limpiar link_url
    link_url_clean = link_url.strip() if link_url else None
    if link_url_clean == "":
        link_url_clean = None
    
    # Procesar expires_at
    from datetime import datetime
    expires_at_dt = None
    if expires_at:
        try:
            expires_at_dt = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        except Exception as e:
            print(f"⚠️ Error parsing expires_at: {e}")
    
    print(f"\n📝 Creating announcement:")
    print(f"   Title: {title}")
    print(f"   Description: {description[:50]}...")
    print(f"   Type: {announcement_type}")
    print(f"   Priority: {priority_int}")
    print(f"   Link URL: {link_url_clean}")
    print(f"   Expires at: {expires_at_dt}")
    print(f"   Image: {image.filename if image else 'None'}")
    print(f"   User: {current_user.name} (ID: {current_user.id})")
    
    try:
        # Validar imagen si se proporciona
        image_url = None
        if image and image.filename:
            # Validar extensión
            file_ext = Path(image.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Formato de imagen no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
                )
            
            # Validar tamaño
            contents = await image.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La imagen es demasiado grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            # Guardar archivo
            filename = f"{uuid.uuid4()}{file_ext}"
            file_path = UPLOAD_DIR / filename
            
            with open(file_path, "wb") as f:
                f.write(contents)
            
            image_url = f"/uploads/announcements/{filename}"
        
        # Crear anuncio
        new_announcement = Announcement(
            title=title,
            description=description,
            type=announcement_type,
            priority=priority_int,
            image_url=image_url,
            link_url=link_url_clean,
            expires_at=expires_at_dt,
            created_by=current_user.id
        )
        
        db.add(new_announcement)
        db.commit()
        db.refresh(new_announcement)
        
        return {
            "id": new_announcement.id,
            "title": new_announcement.title,
            "description": new_announcement.description,
            "type": new_announcement.type,
            "priority": new_announcement.priority,
            "active": new_announcement.active,
            "image_url": new_announcement.image_url,
            "link_url": new_announcement.link_url,
            "created_by": new_announcement.created_by,
            "created_at": new_announcement.created_at,
            "expires_at": new_announcement.expires_at,
            "creator_name": current_user.name
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating announcement: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el anuncio: {str(e)}"
        )


@router.patch("/{announcement_id}")
async def update_announcement(
    announcement_id: int,
    announcement_update: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_supervisor_or_admin)
):
    """
    Update an announcement (supervisor/admin only).
    
    Args:
        announcement_id: Announcement ID
        announcement_update: Fields to update
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated announcement
        
    Raises:
        404: If announcement not found
    """
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Update fields
    update_data = announcement_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    db.commit()
    db.refresh(announcement)
    
    return {
        "id": announcement.id,
        "title": announcement.title,
        "description": announcement.description,
        "type": announcement.type,
        "priority": announcement.priority,
        "active": announcement.active,
        "image_url": announcement.image_url,
        "link_url": announcement.link_url,
        "created_by": announcement.created_by,
        "created_at": announcement.created_at,
        "expires_at": announcement.expires_at,
        "creator_name": announcement.creator.name if announcement.creator else "Sistema"
    }


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_supervisor_or_admin)
):
    """
    Delete an announcement (supervisor/admin only).
    
    Args:
        announcement_id: Announcement ID
        db: Database session
        current_user: Authenticated user
        
    Raises:
        404: If announcement not found
    """
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    db.delete(announcement)
    db.commit()
    
    return None

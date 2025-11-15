"""
Report routes for citizen reporting.

Handles report creation, listing, photo uploads, and deletion.
"""
import os
import uuid
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.report import Report
from backend.schemas.report import ReportCreate, ReportResponse
from backend.auth.jwt_handler import get_current_user
from backend.utils.priority_engine import calculate_priority
from backend.services.ai_validator import get_ai_validator
from backend.services.moderation import get_moderation_service
from backend.middleware.ban_check import check_user_ban
from backend.config import AI_VALIDATION_ENABLED
from backend.utils.location_validator import validate_report_location


router = APIRouter(prefix="/reports", tags=["reports"])

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
UPLOAD_DIR = "backend/static/uploads"


@router.post("/validate-photo")
async def validate_photo_with_ai(
    photo: UploadFile = File(...),
    category: str = Query(...),
    description: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_user_ban)
):
    """
    Validate photo and text with AI BEFORE creating the report.
    
    This endpoint is called first to check if the photo and text are valid.
    Only if validation passes, the frontend will proceed to create the report.
    
    Returns:
        - 200: Content is valid, includes AI analysis
        - 422: Content is invalid (offensive text, invalid image, etc.)
    """
    if not AI_VALIDATION_ENABLED:
        return {"valid": True, "message": "AI validation disabled"}
    
    try:
        # STEP 1: Check text for offensive content FIRST
        validator = get_ai_validator()
        text_check = validator.check_offensive_text(description)
        
        if text_check.get("is_offensive") or text_check.get("is_inappropriate"):
            # Issue strike for offensive text
            moderation = get_moderation_service(db)
            
            severity = text_check.get("severity", "high")
            
            strike_info = moderation.issue_strike(
                user_id=current_user.id,
                reason=text_check.get("rejection_reason", "Lenguaje ofensivo detectado"),
                severity=severity,
                content_type="description",
                ai_detection=f"Palabras detectadas: {', '.join(text_check.get('detected_words', []))}",
                is_offensive=text_check.get("is_offensive", False),
                is_inappropriate=text_check.get("is_inappropriate", False)
            )
            
            print(f"⚠️  Strike issued for offensive text to user {current_user.id}: {strike_info}")
            
            # Return rejection with JSONResponse
            return JSONResponse(
                status_code=422,
                content={
                    "detail": {
                        "error": "offensive_text",
                        "message": "Texto rechazado por contenido ofensivo",
                        "rejection_reason": text_check.get("rejection_reason"),
                        "professional_feedback": text_check.get("professional_feedback"),
                        "detected_words": text_check.get("detected_words", []),
                        "offense_type": text_check.get("offense_type"),
                        "strike_issued": True,
                        "strike_count": strike_info["strike_count"],
                        "is_banned": strike_info["is_banned"],
                        "ban_until": strike_info["ban_until"].isoformat() if strike_info["ban_until"] else None,
                        "ban_reason": strike_info["ban_reason"],
                        "is_permanent_ban": strike_info["is_permanent"]
                    }
                }
            )
        
        # STEP 2: If text is clean, proceed with photo validation
        # Save photo temporarily
        file_ext = os.path.splitext(photo.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de imagen no permitido"
            )
        
        # Create temp filename
        temp_filename = f"temp_{uuid.uuid4()}{file_ext}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save file
        with open(temp_path, "wb") as buffer:
            content = await photo.read()
            buffer.write(content)
        
        # Validate with AI
        validator = get_ai_validator()
        ai_analysis = validator.analyze_report_with_image(
            category=category,
            description=description,
            image_path=temp_path
        )
        
        # Check ONLY for offensive/inappropriate content, NOT category mismatch
        # La IA sugerirá la categoría correcta automáticamente
        is_offensive = ai_analysis.get("is_offensive", False) if ai_analysis else False
        is_inappropriate = ai_analysis.get("is_inappropriate", False) if ai_analysis else False
        is_joke = ai_analysis.get("is_joke_or_fake", False) if ai_analysis else False
        
        # Solo rechazar si es contenido ofensivo, inapropiado o broma
        if is_offensive or is_inappropriate or is_joke:
            # Delete temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            requires_strike = ai_analysis.get("requires_strike", False)
            
            strike_info = None
            
            # Issue strike if content is offensive, inappropriate, or repeated joke
            if requires_strike or is_offensive or is_inappropriate:
                moderation = get_moderation_service(db)
                
                # Determine severity
                strike_severity = ai_analysis.get("strike_severity", "medium")
                if is_offensive:
                    strike_severity = "high"
                elif is_inappropriate:
                    strike_severity = "medium"
                elif is_joke:
                    strike_severity = "low"
                
                # Issue strike
                try:
                    strike_info = moderation.issue_strike(
                        user_id=current_user.id,
                        reason=ai_analysis.get("rejection_reason", "Contenido inapropiado detectado"),
                        severity=strike_severity,
                        content_type="photo",
                        ai_detection=ai_analysis.get("observed_details", ""),
                        is_offensive=is_offensive,
                        is_joke=is_joke,
                        is_inappropriate=is_inappropriate
                    )
                    print(f"⚠️  Strike issued to user {current_user.id}: {strike_info}")
                except Exception as e:
                    print(f"Error issuing strike: {e}")
            
            # Return rejection with strike info
            detail = {
                "error": "invalid_image",
                "message": "Imagen rechazada por validación de IA",
                "rejection_reason": ai_analysis.get("rejection_reason", "La imagen no es válida"),
                "professional_feedback": ai_analysis.get("professional_feedback", 
                    "Por favor, suba una fotografía que muestre claramente el problema reportado."),
                "ai_analysis": {
                    "image_valid": ai_analysis.get("image_valid", False),
                    "is_joke_or_fake": is_joke,
                    "is_offensive": is_offensive,
                    "is_inappropriate": is_inappropriate,
                    "observed_details": ai_analysis.get("observed_details", ""),
                    "matches_category": ai_analysis.get("image_matches_category", False)
                }
            }
            
            # Add strike info if issued
            if strike_info:
                detail["strike_issued"] = True
                detail["strike_count"] = strike_info["strike_count"]
                detail["is_banned"] = strike_info["is_banned"]
                detail["ban_until"] = strike_info["ban_until"].isoformat() if strike_info["ban_until"] else None
                detail["ban_reason"] = strike_info["ban_reason"]
                detail["is_permanent_ban"] = strike_info["is_permanent"]
            
            return JSONResponse(
                status_code=422,
                content={"detail": detail}
            )
        
        # Photo is valid - keep temp file and return path
        return {
            "valid": True,
            "temp_filename": temp_filename,
            "ai_analysis": {
                "confidence": ai_analysis.get("confidence"),
                "suggested_category": ai_analysis.get("suggested_category"),
                "severity_score": ai_analysis.get("severity_score"),
                "urgency_level": ai_analysis.get("urgency_level"),
                "observed_details": ai_analysis.get("observed_details")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating photo: {e}")
        # If validation fails, allow the photo (fallback)
        return {"valid": True, "message": "Validation failed, proceeding without AI check"}



@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new civic incident report with AI validation and location validation.
    
    Uses AI to:
    - Validate category selection
    - Suggest improved priority
    - Extract keywords
    - Determine urgency level
    
    Validates location to ensure it's in Mérida, Yucatán.
    
    Args:
        report_data: Report data (category, description, coordinates, optional photo_url)
        db: Database session
        current_user: Authenticated user creating the report
        
    Returns:
        Created report with AI-enhanced metadata
    """
    # STEP 1: Validate location (Mérida, Yucatán only)
    is_valid_location, location_message = validate_report_location({
        'description': report_data.description,
        'latitude': report_data.latitude,
        'longitude': report_data.longitude
    })
    
    if not is_valid_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "invalid_location",
                "message": "Ubicación no válida",
                "reason": location_message,
                "help": "Solo se aceptan reportes de Mérida, Yucatán. Verifica el código postal o la ubicación en el mapa."
            }
        )
    
    # STEP 2: AI Validation with Image Analysis
    ai_analysis = None
    if AI_VALIDATION_ENABLED:
        try:
            validator = get_ai_validator()
            
            # Use complete analysis if photo is provided
            if report_data.photo_url:
                # Convert photo_url to full path for analysis
                image_path = f"backend/static{report_data.photo_url}" if not report_data.photo_url.startswith('http') else report_data.photo_url
                ai_analysis = validator.analyze_report_with_image(
                    category=report_data.category,
                    description=report_data.description,
                    image_path=image_path
                )
                
                # REJECT report if image is invalid
                if ai_analysis and not ai_analysis.get("is_valid", True):
                    rejection_reason = ai_analysis.get("rejection_reason", "La imagen no es válida")
                    professional_feedback = ai_analysis.get("professional_feedback", 
                        "Por favor, suba una fotografía que muestre claramente el problema reportado.")
                    
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={
                            "error": "invalid_image",
                            "message": "Imagen rechazada por validación de IA",
                            "rejection_reason": rejection_reason,
                            "professional_feedback": professional_feedback,
                            "ai_analysis": {
                                "image_valid": ai_analysis.get("image_valid", False),
                                "is_joke_or_fake": ai_analysis.get("is_joke_or_fake", False),
                                "observed_details": ai_analysis.get("observed_details", "")
                            }
                        }
                    )
            else:
                # Text-only analysis
                ai_analysis = validator.analyze_report(
                    category=report_data.category,
                    description=report_data.description,
                    has_photo=False
                )
            
            print(f"🤖 AI Analysis: {ai_analysis}")
        except HTTPException:
            # Re-raise HTTP exceptions (image rejection)
            raise
        except Exception as e:
            print(f"⚠️  AI validation failed: {e}")
            ai_analysis = None
    
    # Calculate priority (use AI suggestion if available and confident)
    if ai_analysis and ai_analysis.get("confidence", 0) > 0.7:
        priority = ai_analysis["suggested_priority"]
    else:
        priority = calculate_priority(
            category=report_data.category,
            description=report_data.description,
            latitude=report_data.latitude,
            longitude=report_data.longitude
        )
    
    # Create new report with AI metadata
    new_report = Report(
        user_id=current_user.id,
        category=report_data.category,
        description=report_data.description,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        photo_url=report_data.photo_url,
        priority=priority,
        status="pendiente",
        # AI text analysis fields
        ai_validated=1 if ai_analysis else 0,
        ai_confidence=ai_analysis.get("confidence") if ai_analysis else None,
        ai_suggested_category=ai_analysis.get("suggested_category") if ai_analysis else None,
        ai_urgency_level=ai_analysis.get("urgency_level") if ai_analysis else None,
        ai_keywords=json.dumps(ai_analysis.get("keywords", []), ensure_ascii=False) if ai_analysis else None,
        ai_reasoning=ai_analysis.get("reasoning") if ai_analysis else None,
        # AI image analysis fields
        ai_image_valid=1 if ai_analysis and ai_analysis.get("image_valid", True) else 0,
        ai_severity_score=ai_analysis.get("severity_score") if ai_analysis else None,
        ai_observed_details=ai_analysis.get("observed_details") if ai_analysis else None,
        ai_quantity_assessment=ai_analysis.get("quantity_assessment") if ai_analysis else None,
        ai_rejection_reason=ai_analysis.get("rejection_reason") if ai_analysis else None
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return new_report


@router.get("/", response_model=List[ReportResponse])
async def get_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    min_priority: Optional[int] = Query(None, ge=1, le=5),
    max_priority: Optional[int] = Query(None, ge=1, le=5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get reports filtered by user role and optional query parameters.
    
    - Citizens see only their own reports
    - Admins see all reports
    
    Args:
        status_filter: Filter by status (pendiente, en_proceso, resuelto)
        category: Filter by category (bache, alumbrado, basura, drenaje, vialidad)
        min_priority: Minimum priority level (1-5)
        max_priority: Maximum priority level (1-5)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of reports matching the filters
    """
    # Base query
    query = db.query(Report)
    
    # Filter by role
    if current_user.role == "citizen":
        # Citizens only see their own reports
        query = query.filter(Report.user_id == current_user.id)
    # Admins see all reports (no additional filter needed)
    
    # Apply optional filters
    if status_filter:
        query = query.filter(Report.status == status_filter)
    
    if category:
        query = query.filter(Report.category == category)
    
    if min_priority is not None:
        query = query.filter(Report.priority >= min_priority)
    
    if max_priority is not None:
        query = query.filter(Report.priority <= max_priority)
    
    # Order by creation date (newest first)
    query = query.order_by(Report.created_at.desc())
    
    reports = query.all()
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single report by ID.
    
    Citizens can only access their own reports.
    Admins can access any report.
    
    Args:
        report_id: Report ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Report details
        
    Raises:
        404: If report not found
        403: If citizen tries to access another user's report
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check access permissions
    if current_user.role == "citizen" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this report"
        )
    
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a report.
    
    Citizens can only delete their own reports if status is 'pendiente'.
    Admins can delete any report.
    
    Args:
        report_id: Report ID to delete
        db: Database session
        current_user: Authenticated user
        
    Raises:
        404: If report not found
        403: If citizen tries to delete another user's report or non-pending report
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check permissions
    if current_user.role == "citizen":
        if report.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this report"
            )
        if report.status != "pendiente":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete reports with 'pendiente' status"
            )
    
    db.delete(report)
    db.commit()
    
    return None


@router.post("/{report_id}/upload-photo", response_model=ReportResponse)
async def upload_report_photo(
    report_id: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a photo for an existing report.
    
    Saves the image to static/uploads and updates the report's photo_url.
    Only the report owner or admin can upload photos.
    
    Args:
        report_id: Report ID
        photo: Image file to upload
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated report with photo_url
        
    Raises:
        404: If report not found
        403: If user doesn't have permission
        400: If file extension is not allowed
    """
    # Get report
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check permissions
    if current_user.role == "citizen" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload photo for this report"
        )
    
    # Validate file extension
    file_ext = os.path.splitext(photo.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await photo.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Update report with photo URL
    report.photo_url = f"/static/uploads/{unique_filename}"
    db.commit()
    db.refresh(report)
    
    return report

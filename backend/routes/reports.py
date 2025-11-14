"""
Report routes for citizen reporting.

Handles report creation, listing, photo uploads, and deletion.
"""
import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.report import Report
from backend.schemas.report import ReportCreate, ReportResponse
from backend.auth.jwt_handler import get_current_user
from backend.utils.priority_engine import calculate_priority


router = APIRouter(prefix="/reports", tags=["reports"])

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
UPLOAD_DIR = "backend/static/uploads"


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new civic incident report.
    
    Calculates priority automatically based on category and description.
    Sets status to 'pendiente' by default.
    
    Args:
        report_data: Report data (category, description, coordinates, optional photo_url)
        db: Database session
        current_user: Authenticated user creating the report
        
    Returns:
        Created report with auto-calculated priority
    """
    # Calculate priority based on category and description
    priority = calculate_priority(
        category=report_data.category,
        description=report_data.description,
        latitude=report_data.latitude,
        longitude=report_data.longitude
    )
    
    # Create new report
    new_report = Report(
        user_id=current_user.id,
        category=report_data.category,
        description=report_data.description,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        photo_url=report_data.photo_url,
        priority=priority,
        status="pendiente"
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

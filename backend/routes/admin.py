"""
Admin routes for report management.

Handles admin dashboard metrics and report status updates.
Only accessible to users with 'admin' role.
"""
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.user import User
from backend.models.report import Report
from backend.schemas.report import ReportResponse
from backend.auth.jwt_handler import get_current_user


router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure user is an admin.
    
    Args:
        current_user: Authenticated user
        
    Returns:
        User if they are an admin
        
    Raises:
        403: If user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


class StatusUpdate(BaseModel):
    """Schema for updating report status."""
    status: str = Field(..., pattern="^(pendiente|en_proceso|resuelto)$")
    comment: Optional[str] = Field(None, max_length=500)


@router.get("/reports/summary")
async def get_admin_summary(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Get high-level metrics for the admin dashboard.
    
    Returns statistics including:
    - Total reports
    - Reports by status
    - Reports by category
    - Average resolution time
    
    Args:
        db: Database session
        admin_user: Authenticated admin user
        
    Returns:
        Dictionary with dashboard metrics
    """
    # Total reports
    total_reports = db.query(Report).count()
    
    # Count by status
    status_counts = db.query(
        Report.status,
        func.count(Report.id)
    ).group_by(Report.status).all()
    
    count_by_status = {status: count for status, count in status_counts}
    
    resolved_reports = count_by_status.get("resuelto", 0)
    pending_reports = count_by_status.get("pendiente", 0)
    in_progress_reports = count_by_status.get("en_proceso", 0)
    
    # Count by category
    category_counts = db.query(
        Report.category,
        func.count(Report.id)
    ).group_by(Report.category).all()
    
    count_by_category = {category: count for category, count in category_counts}
    
    # Calculate average resolution time for resolved reports
    resolved_reports_data = db.query(Report).filter(
        Report.status == "resuelto"
    ).all()
    
    avg_resolution_hours = 0.0
    if resolved_reports_data:
        total_resolution_time = timedelta()
        for report in resolved_reports_data:
            resolution_time = report.updated_at - report.created_at
            total_resolution_time += resolution_time
        
        avg_resolution_time = total_resolution_time / len(resolved_reports_data)
        avg_resolution_hours = avg_resolution_time.total_seconds() / 3600  # Convert to hours
    
    return {
        "total_reports": total_reports,
        "resolved_reports": resolved_reports,
        "pending_reports": pending_reports,
        "in_progress_reports": in_progress_reports,
        "avg_resolution_time_hours": round(avg_resolution_hours, 2),
        "count_by_category": count_by_category,
        "count_by_status": count_by_status
    }


@router.patch("/reports/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Update the status of a report.
    
    Only admins can update report status.
    Updates the updated_at timestamp automatically.
    
    Args:
        report_id: Report ID to update
        status_update: New status and optional comment
        db: Database session
        admin_user: Authenticated admin user
        
    Returns:
        Updated report
        
    Raises:
        404: If report not found
    """
    # Get report
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update status
    report.status = status_update.status
    
    # Note: The comment field could be stored in a separate comments table
    # or added as a field to the Report model in future enhancements
    # For now, we're just updating the status
    
    db.commit()
    db.refresh(report)
    
    return report

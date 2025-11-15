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


class RoleUpdate(BaseModel):
    """Schema for updating user role."""
    role: str = Field(..., pattern="^(citizen|operator|supervisor|admin)$")


class AssignReport(BaseModel):
    """Schema for assigning report to user."""
    assigned_to: int = Field(..., description="User ID to assign the report to")


# Role hierarchy for permission checks
ROLE_HIERARCHY = {
    "citizen": 0,
    "operator": 1,
    "supervisor": 2,
    "admin": 3
}


def get_role_level(role: str) -> int:
    """Get numeric level for a role."""
    return ROLE_HIERARCHY.get(role, 0)


def can_manage_role(manager_role: str, target_role: str) -> bool:
    """Check if manager can manage target role."""
    return get_role_level(manager_role) > get_role_level(target_role)


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


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the role of a user.
    
    Permission rules:
    - Admin can assign: ALL roles (admin, supervisor, operator, citizen)
    - Supervisor can assign: operator, citizen
    - Operator can assign: citizen
    
    Args:
        user_id: User ID to update
        role_update: New role
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated user information
        
    Raises:
        403: If user doesn't have permission
        404: If user not found
        400: If trying to change own role
    """
    # Get user to update
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent user from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    # Admin can manage ALL roles (including other admins)
    if current_user.role == "admin":
        # Admin has full permissions - no additional checks needed
        pass
    else:
        # Non-admin users: check if they can manage the target role
        if not can_manage_role(current_user.role, role_update.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to assign the role '{role_update.role}'. You can only assign roles lower than your own."
            )
        
        # Check if current user can manage the user's current role
        if not can_manage_role(current_user.role, user.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to modify users with role '{user.role}'"
            )
    
    # Update role
    old_role = user.role
    user.role = role_update.role
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "previous_role": old_role,
        "message": f"User role updated from {old_role} to {role_update.role}"
    }


@router.patch("/reports/{report_id}/assign")
async def assign_report(
    report_id: int,
    assignment: AssignReport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign a report to an operator or supervisor.
    
    Only supervisors and admins can assign reports.
    
    Args:
        report_id: Report ID to assign
        assignment: User ID to assign to
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated report
        
    Raises:
        403: If user doesn't have permission
        404: If report or assigned user not found
        400: If trying to assign to citizen
    """
    # Check permission (supervisor or admin)
    if get_role_level(current_user.role) < get_role_level("supervisor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors and admins can assign reports"
        )
    
    # Get report
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Get assigned user
    assigned_user = db.query(User).filter(User.id == assignment.assigned_to).first()
    if not assigned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found"
        )
    
    # Check if assigned user has appropriate role
    if assigned_user.role == "citizen":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign reports to citizens. Assign to operator or supervisor."
        )
    
    # Assign report
    report.assigned_to = assignment.assigned_to
    
    db.commit()
    db.refresh(report)
    
    return {
        "id": report.id,
        "assigned_to": report.assigned_to,
        "assigned_user": {
            "id": assigned_user.id,
            "name": assigned_user.name,
            "email": assigned_user.email,
            "role": assigned_user.role
        },
        "message": f"Report assigned to {assigned_user.name}"
    }


@router.get("/users")
async def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all users in the system.
    
    Users can only see users with roles lower than or equal to their own.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of users
    """
    # Get all users
    users = db.query(User).all()
    
    # Filter users based on permission
    current_level = get_role_level(current_user.role)
    filtered_users = [
        user for user in users
        if get_role_level(user.role) <= current_level
    ]
    
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "curp": user.curp,
        "role": user.role,
        "created_at": user.created_at
    } for user in filtered_users]


@router.get("/staff")
async def list_staff_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List only staff users (operators, supervisors, admins).
    
    Useful for assigning reports.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of staff users
    """
    # Check permission (supervisor or admin)
    if get_role_level(current_user.role) < get_role_level("supervisor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors and admins can view staff list"
        )
    
    # Get staff users
    staff_users = db.query(User).filter(
        User.role.in_(["operator", "supervisor", "admin"])
    ).all()
    
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    } for user in staff_users]

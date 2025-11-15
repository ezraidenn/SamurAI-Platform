"""
Name Change Request routes.

Handles user name change requests and admin review.
"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.name_change_request import NameChangeRequest
from backend.schemas.name_change_request import (
    NameChangeRequestCreate,
    NameChangeRequestReview,
    NameChangeRequestResponse
)
from backend.auth.jwt_handler import get_current_user


router = APIRouter(prefix="/name-change", tags=["name-change"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform this action"
        )
    return current_user


@router.post("/request", response_model=NameChangeRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_name_change_request(
    request_data: NameChangeRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new name change request.
    
    Users can request to change their name by providing:
    - The new name they want
    - A reason for the change (minimum 10 characters)
    
    Args:
        request_data: Name change request data
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created name change request
        
    Raises:
        400: If user already has a pending request
    """
    # Check if user already has a pending request
    existing_request = db.query(NameChangeRequest).filter(
        NameChangeRequest.user_id == current_user.id,
        NameChangeRequest.status == "pending"
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending name change request. Please wait for it to be reviewed."
        )
    
    # Create new request
    new_request = NameChangeRequest(
        user_id=current_user.id,
        current_name=current_user.name,
        requested_name=request_data.requested_name,
        reason=request_data.reason,
        status="pending"
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request


@router.get("/my-requests", response_model=List[NameChangeRequestResponse])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all name change requests for the current user.
    
    Args:
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of user's name change requests
    """
    requests = db.query(NameChangeRequest).filter(
        NameChangeRequest.user_id == current_user.id
    ).order_by(NameChangeRequest.created_at.desc()).all()
    
    return requests


@router.get("/pending", response_model=List[NameChangeRequestResponse])
async def get_pending_requests(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all pending name change requests (admin only).
    
    Args:
        admin_user: Authenticated admin user
        db: Database session
        
    Returns:
        List of pending name change requests
    """
    requests = db.query(NameChangeRequest).filter(
        NameChangeRequest.status == "pending"
    ).order_by(NameChangeRequest.created_at.asc()).all()
    
    return requests


@router.get("/all", response_model=List[NameChangeRequestResponse])
async def get_all_requests(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all name change requests (admin only).
    
    Args:
        admin_user: Authenticated admin user
        db: Database session
        
    Returns:
        List of all name change requests
    """
    requests = db.query(NameChangeRequest).order_by(
        NameChangeRequest.created_at.desc()
    ).all()
    
    return requests


@router.patch("/{request_id}/review", response_model=NameChangeRequestResponse)
async def review_name_change_request(
    request_id: int,
    review_data: NameChangeRequestReview,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Review a name change request (admin only).
    
    Admin can approve or reject the request.
    If approved, the user's name will be updated automatically.
    
    Args:
        request_id: ID of the request to review
        review_data: Review decision and comment
        admin_user: Authenticated admin user
        db: Database session
        
    Returns:
        Updated name change request
        
    Raises:
        404: If request not found
        400: If request already reviewed
    """
    # Find request
    request = db.query(NameChangeRequest).filter(
        NameChangeRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Name change request not found"
        )
    
    # Check if already reviewed
    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request has already been {request.status}"
        )
    
    # Update request
    request.status = review_data.status
    request.reviewed_by = admin_user.id
    request.review_comment = review_data.review_comment
    request.reviewed_at = datetime.utcnow()
    
    # If approved, update user's name
    if review_data.status == "approved":
        user = db.query(User).filter(User.id == request.user_id).first()
        if user:
            user.name = request.requested_name
    
    db.commit()
    db.refresh(request)
    
    return request


@router.delete("/{request_id}")
async def cancel_name_change_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a pending name change request.
    
    Users can only cancel their own pending requests.
    
    Args:
        request_id: ID of the request to cancel
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        404: If request not found
        403: If request doesn't belong to user
        400: If request is not pending
    """
    # Find request
    request = db.query(NameChangeRequest).filter(
        NameChangeRequest.id == request_id
    ).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Name change request not found"
        )
    
    # Check ownership
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own requests"
        )
    
    # Check if pending
    if request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a request that has been {request.status}"
        )
    
    # Delete request
    db.delete(request)
    db.commit()
    
    return {
        "message": "Name change request cancelled successfully",
        "success": True
    }

"""
Name Change Request Pydantic schemas for request/response validation.

Defines validation models for name change request operations.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NameChangeRequestCreate(BaseModel):
    """
    Schema for creating a name change request.
    
    Attributes:
        requested_name: The new name being requested
        reason: Reason for the name change
    """
    requested_name: str = Field(..., min_length=2, max_length=100)
    reason: str = Field(..., min_length=10, max_length=500)


class NameChangeRequestReview(BaseModel):
    """
    Schema for reviewing a name change request.
    
    Attributes:
        status: Decision (approved or rejected)
        review_comment: Admin's comment on the decision
    """
    status: str = Field(..., pattern="^(approved|rejected)$")
    review_comment: Optional[str] = Field(None, max_length=500)


class NameChangeRequestResponse(BaseModel):
    """
    Schema for name change request responses.
    
    Attributes:
        id: Request ID
        user_id: ID of user who made the request
        current_name: User's current name
        requested_name: Requested new name
        reason: Reason for name change
        status: Request status
        reviewed_by: ID of admin who reviewed (if reviewed)
        review_comment: Admin's comment (if reviewed)
        created_at: Request creation timestamp
        reviewed_at: Review timestamp (if reviewed)
    """
    id: int
    user_id: int
    current_name: str
    requested_name: str
    reason: str
    status: str
    reviewed_by: Optional[int]
    review_comment: Optional[str]
    created_at: datetime
    reviewed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

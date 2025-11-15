"""
Name Change Request model for UCU Reporta.

Defines the NameChangeRequest table for managing user name change requests.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base


class NameChangeRequest(Base):
    """
    Name Change Request model for storing user name change requests.
    
    Users submit requests to change their name, which must be approved by an administrator.
    
    Attributes:
        id: Primary key
        user_id: ID of user requesting name change
        current_name: User's current name
        requested_name: Requested new name
        reason: Reason for name change
        status: Request status (pending, approved, rejected)
        reviewed_by: ID of admin who reviewed the request
        review_comment: Admin's comment on the decision
        created_at: Timestamp of request creation
        reviewed_at: Timestamp of review
    """
    __tablename__ = "name_change_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    current_name = Column(String, nullable=False)
    requested_name = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending", nullable=False)  # "pending", "approved", "rejected"
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="name_change_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

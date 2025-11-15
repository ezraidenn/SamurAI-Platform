"""
Database models for UCU Reporta.

This package contains SQLAlchemy models for the application.
"""
from backend.models.user import User
from backend.models.report import Report
from backend.models.strike import Strike

__all__ = ["User", "Report", "Strike"]

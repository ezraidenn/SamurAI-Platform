"""
Database models for UCU Reporta.

This package contains SQLAlchemy models for the application.
"""
from backend.models.user import User
from backend.models.report import Report

__all__ = ["User", "Report"]

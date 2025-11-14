"""
API routes for UCU Reporta.

This package contains all API endpoint routers.
"""
from backend.routes.users import router as users_router
from backend.routes.reports import router as reports_router
from backend.routes.admin import router as admin_router

__all__ = ["users_router", "reports_router", "admin_router"]

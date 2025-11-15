"""
Middleware to check if user is banned before allowing actions.
"""
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.auth.jwt_handler import get_current_user
from backend.services.moderation import get_moderation_service
from datetime import datetime


def check_user_ban(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Dependency to check if user is currently banned.
    
    Raises HTTPException if user is banned.
    Use this as a dependency on routes that should block banned users.
    
    Usage:
        @router.post("/reports")
        def create_report(
            ...,
            _: None = Depends(check_user_ban)
        ):
            # User is not banned, proceed
    """
    if not current_user.is_banned:
        return  # User is not banned
    
    # Check if ban has expired
    moderation = get_moderation_service(db)
    ban_status = moderation.check_ban_status(current_user.id)
    
    if not ban_status["is_banned"]:
        return  # Ban expired, user is now unbanned
    
    # User is still banned
    is_permanent = ban_status.get("is_permanent", False)
    
    if is_permanent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "user_banned",
                "message": "Tu cuenta ha sido suspendida permanentemente",
                "reason": ban_status.get("ban_reason", "Múltiples infracciones"),
                "is_permanent": True,
                "strike_count": ban_status.get("strike_count", 0)
            }
        )
    
    # Temporary ban
    ban_until = ban_status.get("ban_until")
    time_remaining = ban_status.get("time_remaining")
    
    # Format time remaining
    if time_remaining:
        days = time_remaining.days
        hours = time_remaining.seconds // 3600
        
        if days > 0:
            time_str = f"{days} día(s)"
        else:
            time_str = f"{hours} hora(s)"
    else:
        time_str = "desconocido"
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "user_banned",
            "message": f"Tu cuenta está suspendida temporalmente",
            "reason": ban_status.get("ban_reason", "Infracciones detectadas"),
            "is_permanent": False,
            "ban_until": ban_until.isoformat() if ban_until else None,
            "time_remaining": time_str,
            "strike_count": ban_status.get("strike_count", 0)
        }
    )

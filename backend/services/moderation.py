"""
Moderation Service for handling user strikes and bans.

Implements progressive ban system (más gradual):
- Strikes 1-2: Warning (no ban)
- Strike 3: 10 minutos ban
- Strike 4: 30 minutos ban
- Strike 5: 1 día ban
- Strike 6: 1 semana ban
- Strike 7+: Permanente
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.strike import Strike
from typing import Dict, Optional


class ModerationService:
    """Service for managing user moderation, strikes, and bans"""
    
    # Ban durations based on strike count (progresión más gradual)
    BAN_DURATIONS = {
        1: None,  # Warning only
        2: None,  # Warning only
        3: timedelta(minutes=10),  # 10 minutos
        4: timedelta(minutes=30),  # 30 minutos
        5: timedelta(days=1),      # 1 día
        6: timedelta(days=7),      # 1 semana
        7: None,  # Permanent (no expiration)
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def issue_strike(
        self,
        user_id: int,
        reason: str,
        severity: str,
        content_type: str,
        ai_detection: Optional[str] = None,
        is_offensive: bool = False,
        is_joke: bool = False,
        is_inappropriate: bool = False,
        report_id: Optional[int] = None
    ) -> Dict:
        """
        Issue a strike to a user and apply appropriate ban.
        
        Args:
            user_id: ID of the user to strike
            reason: Human-readable reason
            severity: low, medium, high, critical
            content_type: photo, description, both
            ai_detection: What AI detected
            is_offensive: Whether content was offensive
            is_joke: Whether it was a joke/meme
            is_inappropriate: Whether it was inappropriate
            report_id: Related report ID if any
            
        Returns:
            Dict with strike info and ban details
        """
        # Get user
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Create strike record
        strike = Strike(
            user_id=user_id,
            reason=reason,
            severity=severity,
            content_type=content_type,
            ai_detection=ai_detection,
            is_offensive=1 if is_offensive else 0,
            is_joke=1 if is_joke else 0,
            is_inappropriate=1 if is_inappropriate else 0,
            report_id=report_id
        )
        
        self.db.add(strike)
        
        # Update user strike count
        user.strike_count += 1
        user.last_strike_at = datetime.utcnow()
        
        # Determine ban duration
        ban_info = self._calculate_ban(user.strike_count, severity)
        
        # Apply ban if necessary
        if ban_info['should_ban']:
            user.is_banned = 1
            user.ban_until = ban_info['ban_until']
            user.ban_reason = ban_info['ban_reason']
        
        self.db.commit()
        
        return {
            "strike_id": strike.id,
            "strike_count": user.strike_count,
            "is_banned": bool(user.is_banned),
            "ban_until": user.ban_until,
            "ban_reason": user.ban_reason,
            "ban_duration_days": ban_info['duration_days'],
            "is_permanent": ban_info['is_permanent']
        }
    
    def _calculate_ban(self, strike_count: int, severity: str) -> Dict:
        """Calculate ban duration based on strike count and severity"""
        
        # Critical severity = instant permanent ban
        if severity == "critical":
            return {
                "should_ban": True,
                "ban_until": None,  # Permanent
                "ban_reason": "Contenido extremadamente inapropiado u ofensivo",
                "duration_days": None,
                "is_permanent": True
            }
        
        # Strikes 1-2 = warning only
        if strike_count <= 2:
            return {
                "should_ban": False,
                "ban_until": None,
                "ban_reason": None,
                "duration_days": 0,
                "is_permanent": False
            }
        
        # Strike 7+ = Permanent ban
        if strike_count >= 7:
            return {
                "should_ban": True,
                "ban_until": None,
                "ban_reason": "Múltiples infracciones - Ban permanente",
                "duration_days": None,
                "is_permanent": True
            }
        
        # Get ban duration for strikes 3-6
        duration = self.BAN_DURATIONS.get(strike_count)
        if duration:
            ban_until = datetime.utcnow() + duration
            
            # Format duration message
            if duration.days > 0:
                duration_text = f"{duration.days} día(s)"
            else:
                minutes = duration.seconds // 60
                duration_text = f"{minutes} minuto(s)"
            
            return {
                "should_ban": True,
                "ban_until": ban_until,
                "ban_reason": f"Strike {strike_count} - Ban temporal de {duration_text}",
                "duration_days": duration.days if duration.days > 0 else 0,
                "is_permanent": False
            }
        
        return {
            "should_ban": False,
            "ban_until": None,
            "ban_reason": None,
            "duration_days": 0,
            "is_permanent": False
        }
    
    def check_ban_status(self, user_id: int) -> Dict:
        """
        Check if user is currently banned.
        
        Returns:
            Dict with ban status and details
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Check if ban has expired
        if user.is_banned and user.ban_until:
            if datetime.utcnow() > user.ban_until:
                # Ban expired - lift it
                user.is_banned = 0
                user.ban_until = None
                user.ban_reason = None
                self.db.commit()
                
                return {
                    "is_banned": False,
                    "ban_expired": True,
                    "message": "Ban expirado - acceso restaurado"
                }
        
        if user.is_banned:
            # Still banned
            is_permanent = user.ban_until is None
            time_remaining = None
            
            if not is_permanent:
                time_remaining = user.ban_until - datetime.utcnow()
            
            return {
                "is_banned": True,
                "is_permanent": is_permanent,
                "ban_until": user.ban_until,
                "ban_reason": user.ban_reason,
                "time_remaining": time_remaining,
                "strike_count": user.strike_count
            }
        
        return {
            "is_banned": False,
            "strike_count": user.strike_count,
            "last_strike_at": user.last_strike_at
        }
    
    def get_user_strikes(self, user_id: int) -> list:
        """Get all strikes for a user"""
        strikes = self.db.query(Strike).filter(
            Strike.user_id == user_id
        ).order_by(Strike.created_at.desc()).all()
        
        return strikes
    
    def unban_user(self, user_id: int, admin_reason: str = "Unbanned by admin") -> bool:
        """
        Manually unban a user (admin action).
        
        Args:
            user_id: User to unban
            admin_reason: Reason for unbanning
            
        Returns:
            True if unbanned, False if user wasn't banned
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        if not user.is_banned:
            return False
        
        user.is_banned = 0
        user.ban_until = None
        user.ban_reason = f"Desbaneado por admin: {admin_reason}"
        self.db.commit()
        
        return True


def get_moderation_service(db: Session) -> ModerationService:
    """Get moderation service instance"""
    return ModerationService(db)

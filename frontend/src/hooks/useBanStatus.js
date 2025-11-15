/**
 * Hook to check user ban status
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useBanStatus() {
  const { user } = useAuth();
  const [banStatus, setBanStatus] = useState({
    isBanned: false,
    isPermanent: false,
    banUntil: null,
    banReason: null,
    strikeCount: 0,
    timeRemaining: null
  });

  useEffect(() => {
    if (user) {
      // Check if user has ban info
      const isBanned = user.is_banned === 1 || user.is_banned === true;
      
      if (isBanned) {
        const banUntil = user.ban_until ? new Date(user.ban_until) : null;
        const isPermanent = !banUntil;
        
        let timeRemaining = null;
        if (banUntil) {
          const now = new Date();
          const diff = banUntil - now;
          
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
              timeRemaining = `${days} día(s)`;
            } else {
              timeRemaining = `${hours} hora(s)`;
            }
          } else {
            // Ban expired
            setBanStatus({
              isBanned: false,
              isPermanent: false,
              banUntil: null,
              banReason: null,
              strikeCount: user.strike_count || 0,
              timeRemaining: null
            });
            return;
          }
        }
        
        setBanStatus({
          isBanned: true,
          isPermanent,
          banUntil,
          banReason: user.ban_reason,
          strikeCount: user.strike_count || 0,
          timeRemaining
        });
      } else {
        setBanStatus({
          isBanned: false,
          isPermanent: false,
          banUntil: null,
          banReason: null,
          strikeCount: user.strike_count || 0,
          timeRemaining: null
        });
      }
    }
  }, [user]);

  return banStatus;
}

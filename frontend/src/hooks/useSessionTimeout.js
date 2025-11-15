/**
 * Hook para manejar timeout de sesión por inactividad
 * 
 * Cierra la sesión automáticamente después de 30 minutos de inactividad.
 * Detecta: clicks, movimiento del mouse, scroll, y teclas presionadas.
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

export function useSessionTimeout() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const handleLogout = () => {
    console.log('Sesión cerrada por inactividad');
    logout();
    navigate('/login', { 
      state: { 
        message: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.' 
      } 
    });
  };

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    // Solo activar si el usuario está autenticado
    if (!isAuthenticated()) {
      return;
    }

    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Iniciar el timer
    resetTimer();

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated()]);

  return null;
}

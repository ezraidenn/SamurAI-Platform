/**
 * Reset Password Page
 * 
 * Allows users to set a new password using a valid reset token.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyResetToken, resetPassword } from '../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await verifyResetToken(token);
      
      if (response.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setTokenError(response.reason || 'Token inválido');
      }
    } catch (error) {
      setTokenValid(false);
      setTokenError('Error al verificar el token');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validations
    if (formData.password.length < 8) {
      setMessage({ 
        type: 'error', 
        text: 'La contraseña debe tener al menos 8 caracteres' 
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ 
        type: 'error', 
        text: 'Las contraseñas no coinciden' 
      });
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(token, formData.password);
      
      setMessage({ 
        type: 'success', 
        text: '✅ Contraseña actualizada exitosamente' 
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.' }
        });
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error al restablecer la contraseña' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-guinda via-guinda-dark to-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">⏳</div>
          <p>Verificando token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-guinda via-guinda-dark to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Token Inválido
            </h2>
            <p className="text-gray-600 mb-6">
              {tokenError}
            </p>
            <div className="space-y-3">
              <Link
                to="/recuperar-contraseña"
                className="block w-full bg-guinda hover:bg-guinda-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Solicitar nuevo enlace
              </Link>
              <Link
                to="/login"
                className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda via-guinda-dark to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">
              🏛️ Ucú Reporta
            </h1>
          </Link>
          <p className="text-white/80">
            Restablecer contraseña
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu nueva contraseña. Asegúrate de que sea segura.
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-guinda hover:bg-guinda-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>

          {/* Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-guinda hover:text-guinda-dark font-medium"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm"
        >
          <p className="font-medium mb-2">🔒 Consejos de seguridad:</p>
          <ul className="space-y-1 text-white/80 text-xs">
            <li>• Usa una combinación de letras, números y símbolos</li>
            <li>• No uses información personal obvia</li>
            <li>• No reutilices contraseñas de otras cuentas</li>
            <li>• Considera usar un gestor de contraseñas</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

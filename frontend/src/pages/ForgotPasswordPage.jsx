/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset link.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setDevToken('');

    try {
      const response = await forgotPassword(email);
      
      setMessage({ 
        type: 'success', 
        text: '✅ Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.' 
      });

      // Show dev token if in development mode
      if (response.dev_mode && response.dev_token) {
        setDevToken(response.dev_token);
      }

      setEmail('');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error al procesar la solicitud' 
      });
    } finally {
      setLoading(false);
    }
  };

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
              🏛️ UCU Reporta
            </h1>
          </Link>
          <p className="text-white/80">
            Recuperación de contraseña
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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

          {/* Reset Link */}
          {devToken && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm font-medium text-green-900 mb-3">
                ✅ Enlace de recuperación generado
              </p>
              <Link
                to={`/restablecer/${devToken}`}
                className="inline-block w-full text-center bg-guinda hover:bg-guinda-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Continuar con el restablecimiento →
              </Link>
              <p className="text-xs text-gray-600 mt-3 text-center">
                ⏱️ Este enlace expira en 1 hora
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-guinda hover:bg-guinda-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block text-sm text-guinda hover:text-guinda-dark font-medium"
            >
              ← Volver al inicio de sesión
            </Link>
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-guinda hover:text-guinda-dark font-medium">
                Regístrate
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm"
        >
          <p className="font-medium mb-2">ℹ️ Información importante:</p>
          <ul className="space-y-1 text-white/80 text-xs">
            <li>• El enlace de recuperación expira en 1 hora</li>
            <li>• Solo puedes tener un enlace activo a la vez</li>
            <li>• Si no recibes el correo, revisa tu carpeta de spam</li>
            <li>• Puedes solicitar un nuevo enlace en cualquier momento</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

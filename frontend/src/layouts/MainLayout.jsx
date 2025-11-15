/**
 * Main Layout Component
 * 
 * Provides the main application layout with responsive navigation.
 * Includes top navbar with logo and navigation links.
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBanStatus } from '../hooks/useBanStatus';

export default function MainLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanTooltip, setShowBanTooltip] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const banStatus = useBanStatus();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Función para manejar el clic en el logo
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user) {
      // Si hay sesión activa, redirigir al dashboard según el rol
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'citizen') {
        navigate('/panel');
      }
    } else {
      // Si no hay sesión, ir al home público
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-guinda text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="text-2xl font-bold">
                UCU Reporta
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  {/* Citizen Links */}
                  {user.role === 'citizen' && (
                    <>
                      {/* Reportar Button - Disabled if banned */}
                      <div className="relative">
                        {banStatus.isBanned ? (
                          <div
                            className="relative"
                            onMouseEnter={() => setShowBanTooltip(true)}
                            onMouseLeave={() => setShowBanTooltip(false)}
                          >
                            <button
                              disabled
                              className="px-3 py-2 rounded-lg bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                            >
                              🔒 Reportar
                            </button>
                            {showBanTooltip && (
                              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50">
                                <div className="font-bold mb-1">
                                  {banStatus.isPermanent ? '🔒 Cuenta Suspendida Permanentemente' : '⏰ Cuenta Suspendida'}
                                </div>
                                <div className="text-xs text-gray-300">
                                  {banStatus.isPermanent 
                                    ? 'Tu cuenta ha sido suspendida de forma permanente.'
                                    : `Tiempo restante: ${banStatus.timeRemaining || 'Calculando...'}`
                                  }
                                </div>
                                <div className="text-xs text-yellow-300 mt-1">
                                  Strikes: {banStatus.strikeCount}/5
                                </div>
                                {/* Arrow */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to="/reportar"
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              isActive('/reportar')
                                ? 'bg-white text-guinda font-semibold'
                                : 'hover:bg-guinda-light'
                            }`}
                          >
                            Reportar
                          </Link>
                        )}
                      </div>
                      
                      <Link
                        to="/panel"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/panel')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        Mis Reportes
                      </Link>
                      
                      <Link
                        to="/mapa-negocios"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/mapa-negocios')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        🗺️ Mapa
                      </Link>
                      
                      <Link
                        to="/registrar-poi"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/registrar-poi')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        ➕ Registrar
                      </Link>
                      
                      <Link
                        to="/mis-puntos"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/mis-puntos')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        📍 Mis Puntos
                      </Link>
                    </>
                  )}

                  {/* Admin Links */}
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/users"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin/users')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        Usuarios
                      </Link>
                      <Link
                        to="/admin/validar-pois"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin/validar-pois')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        ✅ Validar POIs
                      </Link>
                      <Link
                        to="/admin/gestionar-pois"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin/gestionar-pois')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        📋 Gestionar POIs
                      </Link>
                      <Link
                        to="/mapa-negocios"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/mapa-negocios')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        🗺️ Mapa
                      </Link>
                    </>
                  )}

                  {/* Supervisor Links */}
                  {user.role === 'supervisor' && (
                    <>
                      <Link
                        to="/supervisor"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/supervisor')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/validar-pois"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin/validar-pois')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        ✅ Validar POIs
                      </Link>
                      <Link
                        to="/admin/gestionar-pois"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/admin/gestionar-pois')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        📋 Gestionar POIs
                      </Link>
                      <Link
                        to="/mapa-negocios"
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive('/mapa-negocios')
                            ? 'bg-white text-guinda font-semibold'
                            : 'hover:bg-guinda-light'
                        }`}
                      >
                        🗺️ Mapa
                      </Link>
                    </>
                  )}

                  {/* Operator Links */}
                  {user.role === 'operator' && (
                    <Link
                      to="/operator"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive('/operator')
                          ? 'bg-white text-guinda font-semibold'
                          : 'hover:bg-guinda-light'
                      }`}
                    >
                      Dashboard Operador
                    </Link>
                  )}

                  {/* User Info & Logout */}
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/perfil"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive('/perfil')
                          ? 'bg-white text-guinda font-semibold'
                          : 'hover:bg-guinda-light'
                      }`}
                    >
                      👤 {user.name}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-guinda-dark hover:bg-black rounded-lg transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 hover:bg-guinda-light rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white text-guinda hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-guinda-light transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-guinda-dark overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors border-b border-guinda-light mb-2"
                    >
                      👤 Mi Perfil - {user.name}
                    </Link>
                    {user.role === 'citizen' && (
                      <>
                        <Link
                          to="/reportar"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          Reportar
                        </Link>
                        <Link
                          to="/panel"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          Mis Reportes
                        </Link>
                        <Link
                          to="/mapa-negocios"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          🗺️ Mapa de Negocios
                        </Link>
                        <Link
                          to="/registrar-poi"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          ➕ Registrar Negocio
                        </Link>
                        <Link
                          to="/mis-puntos"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          📍 Mis Puntos
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          Dashboard Admin
                        </Link>
                        <Link
                          to="/admin/validar-pois"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          ✅ Validar POIs
                        </Link>
                        <Link
                          to="/admin/gestionar-pois"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          📋 Gestionar POIs
                        </Link>
                        <Link
                          to="/mapa-negocios"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          🗺️ Mapa de Negocios
                        </Link>
                      </>
                    )}
                    {user.role === 'supervisor' && (
                      <>
                        <Link
                          to="/supervisor"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          Dashboard Supervisor
                        </Link>
                        <Link
                          to="/admin/validar-pois"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          ✅ Validar POIs
                        </Link>
                        <Link
                          to="/admin/gestionar-pois"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          📋 Gestionar POIs
                        </Link>
                        <Link
                          to="/mapa-negocios"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                        >
                          🗺️ Mapa de Negocios
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg hover:bg-guinda-light transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2024 UCU Reporta - Plataforma Ciudadana para Municipios de Yucatán
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects to login if not authenticated or shows access denied if wrong role.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, requireAdminOrSupervisor = false, requireMinRole = null }) {
  const { isAuthenticated, isAdmin, hasMinRole, loading, user } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access if required
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            Se requiere rol de administrador para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  // Check admin or supervisor access if required
  if (requireAdminOrSupervisor && user && !['admin', 'supervisor'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            Se requiere rol de administrador o supervisor para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Check minimum role if required
  if (requireMinRole && !hasMinRole(requireMinRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permisos Insuficientes</h2>
          <p className="text-gray-600 mb-6">
            No tienes el nivel de permisos necesario para acceder a esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
}

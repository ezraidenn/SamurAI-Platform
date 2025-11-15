/**
 * Negocios Page - Página Unificada de Puntos de Interés
 * 
 * Muestra diferentes opciones según el rol del usuario:
 * - Ciudadano: Registrar negocio, Ver mis negocios, Mapa público
 * - Admin/Supervisor: Validar negocios, Gestionar negocios, Mapa público
 * - Operador: Solo mapa público
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function NegociosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Opciones según rol
  const getOptionsForRole = () => {
    if (!user) return [];

    const commonOptions = [
      {
        id: 'mapa',
        title: '🗺️ Mapa de Negocios',
        description: 'Explora todos los negocios registrados en Ucú',
        path: '/mapa-negocios',
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600',
        roles: ['citizen', 'operator', 'supervisor', 'admin']
      }
    ];

    const citizenOptions = [
      {
        id: 'registrar',
        title: '🏪 Registrar Negocio',
        description: 'Registra tu negocio o un lugar de interés en Ucú',
        path: '/registrar-negocio',
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        roles: ['citizen']
      },
      {
        id: 'mis-negocios',
        title: '📍 Mis Negocios',
        description: 'Ver el estado de tus negocios registrados',
        path: '/mis-negocios',
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        roles: ['citizen']
      }
    ];

    const adminOptions = [
      {
        id: 'validar',
        title: '✅ Validar Negocios',
        description: 'Revisar y aprobar negocios pendientes',
        path: '/admin/validar-negocios',
        color: 'bg-yellow-500',
        hoverColor: 'hover:bg-yellow-600',
        roles: ['admin', 'supervisor']
      },
      {
        id: 'gestionar',
        title: '⚙️ Gestionar Negocios',
        description: 'Administrar todos los negocios del sistema',
        path: '/admin/gestionar-negocios',
        color: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        roles: ['admin']
      },
      {
        id: 'estadisticas',
        title: '📊 Estadísticas',
        description: 'Ver estadísticas de negocios registrados',
        path: '/admin/estadisticas-negocios',
        color: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600',
        roles: ['admin', 'supervisor']
      }
    ];

    const allOptions = [...citizenOptions, ...adminOptions, ...commonOptions];
    
    // Filtrar opciones según rol del usuario
    return allOptions.filter(option => option.roles.includes(user.role));
  };

  const options = getOptionsForRole();

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-guinda mb-4">
            🏪 Negocios de Ucú
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {user?.role === 'citizen' && 'Registra tu negocio y ayuda a la comunidad a descubrir lugares locales'}
            {user?.role === 'admin' && 'Administra y valida los negocios registrados por la comunidad'}
            {user?.role === 'supervisor' && 'Valida y supervisa los negocios registrados'}
            {user?.role === 'operator' && 'Explora el mapa de negocios de Ucú'}
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOptionClick(option.path)}
              className={`${option.color} ${option.hoverColor} rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-3">
                  {option.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {option.description}
                </p>
                
                {/* Arrow icon */}
                <div className="mt-4 flex justify-end">
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ℹ️ ¿Cómo funciona?
          </h2>
          
          {user?.role === 'citizen' && (
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start">
                <span className="text-green-500 font-bold mr-2">1.</span>
                <span><strong>Registra tu negocio:</strong> Completa el formulario con la información de tu negocio</span>
              </p>
              <p className="flex items-start">
                <span className="text-blue-500 font-bold mr-2">2.</span>
                <span><strong>Validación automática:</strong> Nuestra IA revisará la información automáticamente</span>
              </p>
              <p className="flex items-start">
                <span className="text-yellow-500 font-bold mr-2">3.</span>
                <span><strong>Validación humana:</strong> Un administrador revisará y aprobará tu negocio</span>
              </p>
              <p className="flex items-start">
                <span className="text-purple-500 font-bold mr-2">4.</span>
                <span><strong>¡Publicado!</strong> Tu negocio aparecerá en el mapa público de Ucú</span>
              </p>
            </div>
          )}

          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start">
                <span className="text-blue-500 font-bold mr-2">•</span>
                <span><strong>Validación IA:</strong> Los negocios son pre-validados automáticamente con IA</span>
              </p>
              <p className="flex items-start">
                <span className="text-yellow-500 font-bold mr-2">•</span>
                <span><strong>Tu rol:</strong> Revisar y aprobar/rechazar negocios que pasaron la validación IA</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-500 font-bold mr-2">•</span>
                <span><strong>Categorías:</strong> Puedes ajustar la categoría si la IA se equivocó</span>
              </p>
              <p className="flex items-start">
                <span className="text-red-500 font-bold mr-2">•</span>
                <span><strong>Gestión:</strong> Editar o eliminar negocios cuando sea necesario</span>
              </p>
            </div>
          )}

          {user?.role === 'operator' && (
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start">
                <span className="text-blue-500 font-bold mr-2">•</span>
                <span><strong>Mapa público:</strong> Explora todos los negocios aprobados en Ucú</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-500 font-bold mr-2">•</span>
                <span><strong>Información completa:</strong> Ver detalles, contacto y ubicación de cada negocio</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats Preview (solo para admin/supervisor) */}
        {(user?.role === 'admin' || user?.role === 'supervisor') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">--</div>
              <div className="text-sm text-gray-600 mt-1">Total Negocios</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">--</div>
              <div className="text-sm text-gray-600 mt-1">Pendientes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-green-600">--</div>
              <div className="text-sm text-gray-600 mt-1">Aprobados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-red-600">--</div>
              <div className="text-sm text-gray-600 mt-1">Rechazados</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

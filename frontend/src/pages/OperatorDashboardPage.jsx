/**
 * Operator Dashboard Page
 * 
 * Vista principal para operadores donde pueden ver sus reportes asignados,
 * actualizar el estado y planificar rutas óptimas.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReports } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OperatorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'map'
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0
  });

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchAssignedReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener reportes asignados al operador
      const data = await getReports({ assigned_to: user.id });
      setReports(data);
      
      // Calcular estadísticas
      calculateStats(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error al cargar los reportes asignados');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData) => {
    const stats = {
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pendiente').length,
      inProgress: reportsData.filter(r => r.status === 'en_proceso').length,
      completed: reportsData.filter(r => r.status === 'resuelto').length,
      highPriority: reportsData.filter(r => r.priority >= 4).length // 4 o 5 = alta prioridad
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.priority !== 'all') {
      // Mapear prioridad de texto a número
      const priorityMap = { critical: 5, high: 4, medium: 3, low: 2 };
      const targetPriority = priorityMap[filters.priority];
      filtered = filtered.filter(r => r.priority === targetPriority);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    // Ordenar por prioridad (número) y fecha
    filtered.sort((a, b) => {
      // Mayor prioridad primero (5 = crítico, 1 = bajo)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setFilteredReports(filtered);
  };

  const getPriorityColor = (priority) => {
    // priority es un número de 1-5
    const colors = {
      5: 'bg-red-100 text-red-800 border-red-300',      // Crítico
      4: 'bg-orange-100 text-orange-800 border-orange-300', // Alto
      3: 'bg-yellow-100 text-yellow-800 border-yellow-300', // Medio
      2: 'bg-green-100 text-green-800 border-green-300',    // Bajo
      1: 'bg-gray-100 text-gray-800 border-gray-300'        // Muy bajo
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      resuelto: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado'
    };
    return texts[status] || status;
  };

  const getPriorityText = (priority) => {
    // priority es un número de 1-5
    const texts = {
      5: 'Crítico',
      4: 'Alto',
      3: 'Medio',
      2: 'Bajo',
      1: 'Muy Bajo'
    };
    return texts[priority] || `Nivel ${priority}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bache: '🕳️',
      grieta: '⚡',
      hundimiento: '⬇️',
      señalización: '🚦'
    };
    return icons[category] || '🔧';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-guinda mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes asignados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel del Operador
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.name}. Aquí puedes gestionar tus reportes asignados.
          </p>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Asignados</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Prioridad</p>
                <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <div className="text-4xl">🚨</div>
            </div>
          </motion.div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-guinda focus:border-guinda"
                >
                  <option value="all">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-guinda focus:border-guinda"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-guinda focus:border-guinda"
                >
                  <option value="all">Todas</option>
                  <option value="bache">Bache</option>
                  <option value="vialidad">Vialidad</option>
                  <option value="alumbrado">Alumbrado</option>
                  <option value="basura">Basura</option>
                  <option value="drenaje">Drenaje</option>
                </select>
              </div>
            </div>

            {/* Vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-guinda text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-guinda text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗺️ Mapa
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Contenido */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay reportes asignados
                </h3>
                <p className="text-gray-600">
                  {filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                    ? 'Intenta cambiar los filtros para ver más reportes.'
                    : 'Cuando se te asignen reportes, aparecerán aquí.'}
                </p>
              </div>
            ) : (
              filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/operator/report/${report.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{getCategoryIcon(report.category)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Reporte #{report.id}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                              {getPriorityText(report.priority)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">🏷️ Categoría:</span> {report.category}
                          </p>
                          {report.latitude && report.longitude && (
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">📍 Coordenadas:</span> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            📅 Creado: {new Date(report.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>

                    {report.description && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <span className="font-medium">📝 Descripción:</span> {report.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {report.photo_url && (
                          <span className="flex items-center gap-1">
                            📸 Con foto
                          </span>
                        )}
                        {report.latitude && report.longitude && (
                          <span className="flex items-center gap-1">
                            🗺️ Ubicación GPS
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/operator/report/${report.id}`);
                        }}
                        className="text-guinda hover:text-guinda-dark font-medium flex items-center gap-1"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Mapa de Reportes y Ruta Óptima</h3>
            <p className="text-gray-600 mb-4">
              Vista de mapa con ruta optimizada - En desarrollo
            </p>
            {/* El componente de mapa se implementará después */}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperatorDashboardPage;

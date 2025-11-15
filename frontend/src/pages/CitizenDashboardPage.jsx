/**
 * Citizen Dashboard Page
 * 
 * Shows citizen's own reports with filters, statistics, and charts.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReports, getPhotoUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCategoryName } from '../utils/categoryFormatter';

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-green-100 text-green-800',
};

const priorityColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

// Iconos SVG para las 4 categorías englobadas
const categoryIcons = {
  via_mal_estado: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  infraestructura_danada: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  senalizacion_transito: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  iluminacion_visibilidad: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

const CHART_COLORS = ['#800020', '#a63a4a', '#FFA500', '#4169E1', '#32CD32'];

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports(filters);
      setReports(data);
      setError('');
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    pendiente: reports.filter((r) => r.status === 'pendiente').length,
    en_proceso: reports.filter((r) => r.status === 'en_proceso').length,
    resuelto: reports.filter((r) => r.status === 'resuelto').length,
  };

  // Data for charts
  const statusChartData = [
    { name: 'Pendiente', value: stats.pendiente },
    { name: 'En Proceso', value: stats.en_proceso },
    { name: 'Resuelto', value: stats.resuelto },
  ].filter((item) => item.value > 0);

  const categoryChartData = Object.entries(
    reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({
    name: formatCategoryName(category),
    cantidad: count,
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-guinda mb-2">Mis Reportes</h1>
              <p className="text-gray-600">Consulta el estado de tus reportes</p>
            </div>
            <Link
              to="/reportar"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-guinda text-white rounded-xl font-semibold hover:bg-guinda-dark transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Reporte
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'text-guinda', bg: 'bg-guinda/10' },
              { label: 'Pendientes', value: stats.pendiente, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'En Proceso', value: stats.en_proceso, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Resueltos', value: stats.resuelto, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bg} rounded-2xl shadow-md p-6`}
              >
                <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.label}</h3>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          {reports.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Por Estado</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Por Categoría</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#800020" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="bache">Bache</option>
                  <option value="alumbrado">Alumbrado</option>
                  <option value="basura">Basura</option>
                  <option value="drenaje">Drenaje</option>
                  <option value="vialidad">Vialidad</option>
                </select>
              </div>

              {(filters.status || filters.category) && (
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ status: '', category: '' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Historial de Reportes ({reports.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
                <p className="mt-4 text-gray-600">Cargando reportes...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">No tienes reportes todavía</p>
                <Link
                  to="/reportar"
                  className="inline-flex items-center px-6 py-3 bg-guinda text-white rounded-xl font-semibold hover:bg-guinda-dark transition-colors"
                >
                  Crear tu primer reporte
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="hidden md:table w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">#{report.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 text-guinda flex-shrink-0">
                              {categoryIcons[report.category] || categoryIcons['bache']}
                            </div>
                            <span>{formatCategoryName(report.category)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {report.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[report.priority]}`}>
                            {report.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-guinda hover:text-guinda-dark text-sm font-medium"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 text-guinda flex-shrink-0">
                            {categoryIcons[report.category] || categoryIcons['bache']}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{formatCategoryName(report.category)}</p>
                            <p className="text-xs text-gray-500">#{report.id}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[report.priority]}`}>
                            Prioridad {report.priority}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
                        </div>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-guinda text-sm font-medium"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Reporte #{selectedReport.id}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(selectedReport.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Categoría:</span>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="w-8 h-8 text-guinda flex-shrink-0">
                      {categoryIcons[selectedReport.category] || categoryIcons['bache']}
                    </div>
                    <p className="text-lg">{formatCategoryName(selectedReport.category)}</p>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedReport.status]}`}>
                      {selectedReport.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Prioridad:</span>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[selectedReport.priority]}`}>
                      Nivel {selectedReport.priority}
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Descripción:</span>
                  <p className="text-gray-900 mt-1">{selectedReport.description}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Ubicación:</span>
                  <p className="text-gray-900 mt-1">
                    {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                  </p>
                </div>

                {selectedReport.photo_url && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Foto:</span>
                    <img
                      src={getPhotoUrl(selectedReport.photo_url)}
                      alt="Reporte"
                      className="w-full h-auto rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

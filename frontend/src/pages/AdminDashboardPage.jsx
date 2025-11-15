/**
 * Admin Dashboard Page
 * 
 * Complete admin view with maps, charts, KPIs, and report management.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import L from 'leaflet';
import { getReports, getAdminSummary, updateReportStatus, getPhotoUrl, getUserStrikes } from '../services/api';
import { formatCategoryName } from '../utils/categoryFormatter';

// Marker colors by status
const getMarkerIcon = (status) => {
  const colors = {
    pendiente: '#EAB308', // yellow
    en_proceso: '#3B82F6', // blue
    resuelto: '#22C55E', // green
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[status] || '#6B7280'};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

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

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [userStrikes, setUserStrikes] = useState(null);
  const [loadingStrikes, setLoadingStrikes] = useState(false);
  
  // Map filters
  const [mapFilters, setMapFilters] = useState({
    pendiente: true,
    en_proceso: true,
    resuelto: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsData, summaryData] = await Promise.all([
        getReports({}),
        getAdminSummary(),
      ]);
      setReports(reportsData);
      setSummary(summaryData);
      setError('');
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStrikes = async (userId) => {
    setLoadingStrikes(true);
    try {
      const data = await getUserStrikes(userId);
      setUserStrikes(data);
    } catch (err) {
      console.error('Error fetching user strikes:', err);
      setUserStrikes(null);
    } finally {
      setLoadingStrikes(false);
    }
  };

  const handleReportClick = async (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
    // Load user strikes when opening details
    if (report.user_id) {
      await fetchUserStrikes(report.user_id);
    }
  };

  const toggleMapFilter = (status) => {
    setMapFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const filteredReports = reports.filter(report => mapFilters[report.status]);

  const handleStatusChange = async () => {
    if (!selectedReport || !statusUpdate.status) return;

    setUpdatingStatus(true);
    try {
      await updateReportStatus(selectedReport.id, {
        status: statusUpdate.status,
        comment: statusUpdate.comment,
      });
      
      // Refresh data
      await fetchData();
      
      setShowStatusModal(false);
      setSelectedReport(null);
      setStatusUpdate({ status: '', comment: '' });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado del reporte');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusModal = (report) => {
    setSelectedReport(report);
    setStatusUpdate({ status: report.status, comment: '' });
    setShowStatusModal(true);
  };

  const openDetailsModal = async (report) => {
    await handleReportClick(report);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryChartData = Object.entries(summary?.count_by_category || {}).map(([name, value]) => ({
    name: formatCategoryName(name),
    cantidad: value,
  }));

  const statusChartData = [
    { name: 'Pendiente', value: summary?.pending_reports || 0 },
    { name: 'En Proceso', value: summary?.in_progress_reports || 0 },
    { name: 'Resuelto', value: summary?.resolved_reports || 0 },
  ].filter((item) => item.value > 0);

  // Map center (Mérida, Yucatán)
  const mapCenter = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [20.9674, -89.5926];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-guinda mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-600">Vista general de todos los reportes</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
            {[
              { label: 'Total Reportes', value: summary?.total_reports || 0, color: 'text-guinda', bg: 'bg-guinda/10' },
              { label: 'Resueltos', value: summary?.resolved_reports || 0, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pendientes', value: summary?.pending_reports || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'En Proceso', value: summary?.in_progress_reports || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tiempo Prom.', value: `${summary?.avg_resolution_time_hours?.toFixed(1) || 0}h`, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${kpi.bg} rounded-2xl shadow-md p-4 md:p-6`}
              >
                <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">{kpi.label}</h3>
                <p className={`text-2xl md:text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Map and Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Mapa de Reportes ({filteredReports.length}/{reports.length})
                </h2>
                
                {/* Map Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMapFilter('pendiente')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      mapFilters.pendiente
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    🟡 Pendiente
                  </button>
                  <button
                    onClick={() => toggleMapFilter('en_proceso')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      mapFilters.en_proceso
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    🔵 En Proceso
                  </button>
                  <button
                    onClick={() => toggleMapFilter('resuelto')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      mapFilters.resuelto
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    🟢 Resuelto
                  </button>
                </div>
              </div>
              
              <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300 relative z-0">
                {filteredReports.length > 0 ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    scrollWheelZoom={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredReports.map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={getMarkerIcon(report.status)}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-5 h-5 text-guinda flex-shrink-0">
                                {categoryIcons[report.category] || categoryIcons['bache']}
                              </div>
                              <p className="font-semibold">{formatCategoryName(report.category)}</p>
                            </div>
                            <p className="text-gray-600 text-xs mb-1">{report.description.substring(0, 50)}...</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${statusColors[report.status]}`}>
                              {report.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-block ml-1 px-2 py-1 rounded text-xs ${priorityColors[report.priority]}`}>
                              P{report.priority}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">No hay reportes para mostrar</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-md p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reportes por Categoría</h2>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#800020" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">Sin datos</p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reportes por Estado</h2>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
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
                ) : (
                  <p className="text-gray-500 text-center py-8">Sin datos</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Todos los Reportes ({reports.length})
              </h2>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No hay reportes en el sistema</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
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
                            <div className="flex flex-col">
                              <span>{formatCategoryName(report.category)}</span>
                              {report.ai_validated === 1 && (
                                <span className="flex items-center text-xs text-purple-600 font-medium">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  IA {report.ai_confidence ? `${(report.ai_confidence * 100).toFixed(0)}%` : ''}
                                </span>
                              )}
                            </div>
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDetailsModal(report)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Ver detalles"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openStatusModal(report)}
                              className="text-guinda hover:text-guinda-dark text-sm font-medium"
                              title="Cambiar estado"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" onClick={() => setShowDetailsModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Reporte #{selectedReport.id}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Creado el {formatDate(selectedReport.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Report Info */}
                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 text-guinda flex-shrink-0">
                          {categoryIcons[selectedReport.category] || categoryIcons['bache']}
                        </div>
                        <p className="text-lg">{formatCategoryName(selectedReport.category)}</p>
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColors[selectedReport.status]}`}>
                          {selectedReport.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridad</label>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${priorityColors[selectedReport.priority]}`}>
                          Nivel {selectedReport.priority}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {selectedReport.description}
                      </p>
                    </div>

                    {/* AI Analysis Section */}
                    {selectedReport.ai_validated === 1 && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Análisis de IA</h4>
                            <p className="text-sm text-gray-600">Validación automática con GPT-4o-mini</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Confidence Score */}
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Nivel de Confianza</span>
                              <span className="text-lg font-bold text-purple-600">
                                {selectedReport.ai_confidence ? `${(selectedReport.ai_confidence * 100).toFixed(0)}%` : 'N/A'}
                              </span>
                            </div>
                            {selectedReport.ai_confidence && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    selectedReport.ai_confidence >= 0.8 ? 'bg-green-500' :
                                    selectedReport.ai_confidence >= 0.6 ? 'bg-yellow-500' :
                                    'bg-orange-500'
                                  }`}
                                  style={{ width: `${selectedReport.ai_confidence * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </div>

                          {/* Urgency Level */}
                          {selectedReport.ai_urgency_level && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Nivel de Urgencia</span>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                selectedReport.ai_urgency_level === 'critical' ? 'bg-red-100 text-red-800' :
                                selectedReport.ai_urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                                selectedReport.ai_urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {selectedReport.ai_urgency_level.toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Suggested Category */}
                          {selectedReport.ai_suggested_category && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Categoría Sugerida por IA</span>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                                  {selectedReport.ai_suggested_category}
                                </span>
                                {selectedReport.ai_suggested_category !== selectedReport.category && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    ⚠️ Difiere de la seleccionada ({selectedReport.category})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Keywords */}
                          {selectedReport.ai_keywords && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Palabras Clave Detectadas</span>
                              <div className="flex flex-wrap gap-2">
                                {JSON.parse(selectedReport.ai_keywords).map((keyword, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Severity Score */}
                          {selectedReport.ai_severity_score && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Severidad del Problema</span>
                              <div className="flex items-center space-x-3">
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Leve</span>
                                    <span className="font-bold text-lg">{selectedReport.ai_severity_score}/10</span>
                                    <span>Crítico</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className={`h-3 rounded-full ${
                                        selectedReport.ai_severity_score >= 8 ? 'bg-red-500' :
                                        selectedReport.ai_severity_score >= 6 ? 'bg-orange-500' :
                                        selectedReport.ai_severity_score >= 4 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${selectedReport.ai_severity_score * 10}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quantity Assessment */}
                          {selectedReport.ai_quantity_assessment && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Cantidad Detectada</span>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                selectedReport.ai_quantity_assessment === 'mucho' ? 'bg-red-100 text-red-800' :
                                selectedReport.ai_quantity_assessment === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {selectedReport.ai_quantity_assessment.toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Observed Details */}
                          {selectedReport.ai_observed_details && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">
                                🔍 Lo que Observó la IA en la Imagen
                              </span>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {selectedReport.ai_observed_details}
                              </p>
                            </div>
                          )}

                          {/* AI Reasoning */}
                          {selectedReport.ai_reasoning && (
                            <div className="bg-white p-3 rounded-lg">
                              <span className="text-sm font-semibold text-gray-700 block mb-2">Razonamiento de la IA</span>
                              <p className="text-sm text-gray-600 italic">
                                "{selectedReport.ai_reasoning}"
                              </p>
                            </div>
                          )}

                          {/* Rejection Reason (if invalid) */}
                          {selectedReport.ai_rejection_reason && (
                            <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <span className="text-sm font-bold text-red-800 block mb-1">⚠️ Imagen Rechazada</span>
                                  <p className="text-sm text-red-700">
                                    {selectedReport.ai_rejection_reason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Lat: {selectedReport.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Lng: {selectedReport.longitude.toFixed(6)}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Ver en Google Maps
                        </a>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fechas</label>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Creado:</span>
                          <span className="font-medium">{formatDate(selectedReport.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Actualizado:</span>
                          <span className="font-medium">{formatDate(selectedReport.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - User Info & Photo */}
                  <div className="space-y-4">
                    {/* User Info */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reportado por</label>
                      <div className="bg-gradient-to-br from-guinda to-guinda-dark p-6 rounded-lg text-white">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-guinda" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{selectedReport.user?.name || 'Usuario'}</p>
                            <p className="text-sm opacity-90">{selectedReport.user?.email || 'Sin email'}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="opacity-90">ID Usuario:</span>
                            <span className="font-medium">#{selectedReport.user_id}</span>
                          </div>
                          {selectedReport.user?.curp && (
                            <div className="flex justify-between">
                              <span className="opacity-90">CURP:</span>
                              <span className="font-medium font-mono text-xs">{selectedReport.user.curp}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="opacity-90">Rol:</span>
                            <span className="font-medium capitalize">
                              {selectedReport.user?.role === 'admin' ? 'Administrador' :
                               selectedReport.user?.role === 'supervisor' ? 'Supervisor' :
                               selectedReport.user?.role === 'operator' ? 'Operador' :
                               'Ciudadano'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Strikes History */}
                    {loadingStrikes ? (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-sm text-gray-500 text-center">Cargando historial de strikes...</p>
                      </div>
                    ) : userStrikes && userStrikes.strikes && userStrikes.strikes.length > 0 ? (
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg border-2 border-red-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <h4 className="text-lg font-bold text-red-900">Historial de Strikes</h4>
                          </div>
                          <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                            {userStrikes.total_strikes}/5
                          </span>
                        </div>

                        {userStrikes.is_banned === 1 && (
                          <div className="bg-red-100 border-l-4 border-red-600 p-3 mb-4 rounded">
                            <p className="text-sm font-bold text-red-900">
                              🔒 Usuario Suspendido
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              {userStrikes.ban_reason}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {userStrikes.strikes.map((strike, index) => (
                            <div key={strike.id} className="bg-white p-4 rounded-lg border border-red-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-red-600">#{userStrikes.strikes.length - index}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    strike.severity === 'critical' ? 'bg-red-600 text-white' :
                                    strike.severity === 'high' ? 'bg-orange-500 text-white' :
                                    strike.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                    'bg-gray-400 text-white'
                                  }`}>
                                    {strike.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {strike.content_type === 'image' ? '📷 Imagen' : '📝 Texto'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(strike.created_at).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-800 font-medium mb-2">
                                {strike.reason}
                              </p>
                              
                              {strike.ai_detection && (
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  🤖 {strike.ai_detection}
                                </p>
                              )}
                              
                              {(strike.is_offensive || strike.is_inappropriate) && (
                                <div className="flex gap-2 mt-2">
                                  {strike.is_offensive && (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                      🚨 Ofensivo
                                    </span>
                                  )}
                                  {strike.is_inappropriate && (
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                      ⚠️ Inapropiado
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : userStrikes && userStrikes.total_strikes === 0 ? (
                      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-semibold text-green-800">
                            ✅ Usuario sin infracciones
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Photo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Evidencia Fotográfica</label>
                      {selectedReport.photo_url ? (
                        <div className="relative group">
                          <img
                            src={getPhotoUrl(selectedReport.photo_url)}
                            alt="Evidencia del reporte"
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <a
                            href={getPhotoUrl(selectedReport.photo_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center"
                          >
                            <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Sin foto</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openStatusModal(selectedReport);
                    }}
                    className="px-6 py-2 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors font-medium"
                  >
                    Cambiar Estado
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Cambiar Estado - Reporte #{selectedReport.id}
                  </h3>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nuevo Estado
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      value={statusUpdate.comment}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                      rows="3"
                      placeholder="Agregar comentario sobre el cambio..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={updatingStatus}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleStatusChange}
                      disabled={updatingStatus}
                      className={`px-4 py-2 bg-guinda text-white rounded-lg transition-colors ${
                        updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-guinda-dark'
                      }`}
                    >
                      {updatingStatus ? 'Actualizando...' : 'Actualizar Estado'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

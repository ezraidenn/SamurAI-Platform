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
import { getReports, getAdminSummary, updateReportStatus, getPhotoUrl } from '../services/api';

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

const categoryIcons = {
  bache: '🕳️',
  alumbrado: '💡',
  basura: '🗑️',
  drenaje: '🚰',
  vialidad: '🚦',
};

const CHART_COLORS = ['#800020', '#a63a4a', '#FFA500', '#4169E1', '#32CD32'];

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
    name: name.charAt(0).toUpperCase() + name.slice(1),
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Mapa de Reportes ({reports.length})
              </h2>
              <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
                {reports.length > 0 ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reports.map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={getMarkerIcon(report.status)}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold mb-1">
                              {categoryIcons[report.category]} {report.category}
                            </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
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
                        <td className="px-6 py-4 text-sm text-gray-900">ID: {report.user_id}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="flex items-center">
                            <span className="text-xl mr-2">{categoryIcons[report.category]}</span>
                            <span className="capitalize">{report.category}</span>
                          </span>
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
                            onClick={() => openStatusModal(report)}
                            className="text-guinda hover:text-guinda-dark text-sm font-medium"
                          >
                            Cambiar Estado
                          </button>
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

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

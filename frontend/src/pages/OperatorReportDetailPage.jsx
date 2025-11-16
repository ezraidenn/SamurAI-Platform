/**
 * Operator Report Detail Page
 * 
 * Vista detallada de un reporte para que el operador pueda:
 * - Ver toda la información del reporte
 * - Actualizar el estado
 * - Agregar comentarios de seguimiento
 * - Ver ubicación en mapa
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReport, updateReportStatus, getPhotoUrl } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function OperatorReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado del formulario de actualización
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReport(id);
      setReport(data);
      setNewStatus(data.status);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Error al cargar el detalle del reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    
    if (!newStatus) {
      setError('Selecciona un estado');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await updateReportStatus(id, {
        status: newStatus,
        admin_comment: comment || undefined
      });

      setSuccess('Estado actualizado correctamente');
      setShowUpdateForm(false);
      setComment('');
      
      // Recargar el reporte
      await fetchReportDetail();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.detail || 'Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!window.confirm('¿Estás seguro de marcar este reporte como completado?')) {
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await updateReportStatus(id, {
        status: 'resuelto',
        admin_comment: 'Reporte completado por el operador'
      });

      setSuccess('¡Reporte marcado como completado!');
      await fetchReportDetail();
      
      setTimeout(() => {
        navigate('/operator');
      }, 2000);
    } catch (err) {
      console.error('Error marking as completed:', err);
      setError(err.response?.data?.detail || 'Error al completar el reporte');
    } finally {
      setUpdating(false);
    }
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
          <p className="text-gray-600">Cargando detalles del reporte...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate('/operator')}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            ← Volver al panel
          </button>
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
          className="mb-6"
        >
          <button
            onClick={() => navigate('/operator')}
            className="text-guinda hover:text-guinda-dark font-medium mb-4 flex items-center gap-2"
          >
            ← Volver al panel
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reporte #{report.id}
              </h1>
              <p className="text-gray-600">
                Detalles completos y seguimiento del reporte
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getPriorityColor(report.priority_level)}`}>
                🚨 {getPriorityText(report.priority_level)}
              </span>
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(report.status)}`}>
                {getStatusText(report.status)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mensajes */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            ✅ {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del reporte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">{getCategoryIcon(report.category)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {report.category}
                  </h2>
                  <p className="text-gray-600">Categoría del reporte</p>
                </div>
              </div>

              <div className="space-y-4">
                {report.latitude && report.longitude && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">📍 Ubicación GPS</h3>
                    <p className="text-gray-700">
                      Latitud: {report.latitude.toFixed(6)}, Longitud: {report.longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Descripción del Problema</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de creación</p>
                    <p className="font-medium text-gray-900">
                      {new Date(report.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última actualización</p>
                    <p className="font-medium text-gray-900">
                      {new Date(report.updated_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Foto del reporte */}
            {report.photo_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">📸 Evidencia Fotográfica</h3>
                <img
                  src={getPhotoUrl(report.photo_url)}
                  alt="Foto del reporte"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              </motion.div>
            )}

            {/* Mapa */}
            {report.latitude && report.longitude && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">🗺️ Ubicación en Mapa</h3>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                  <MapContainer
                    center={[report.latitude, report.longitude]}
                    zoom={16}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[report.latitude, report.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold">Reporte #{report.id}</p>
                          <p className="text-sm">{report.direccion}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  📍 Coordenadas: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </div>
              </motion.div>
            )}

            {/* Comentarios del admin */}
            {report.admin_comment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
              >
                <h3 className="font-semibold text-blue-900 mb-2">💬 Comentarios del Supervisor</h3>
                <p className="text-blue-800">{report.admin_comment}</p>
              </motion.div>
            )}
          </div>

          {/* Columna lateral - Acciones */}
          <div className="space-y-6">
            {/* Información del usuario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">👤 Reportado por</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Nombre:</span> {report.user?.name || 'Usuario'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {report.user?.email || 'N/A'}
                </p>
              </div>
            </motion.div>

            {/* Acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h3>
              <div className="space-y-3">
                {report.status !== 'resuelto' && (
                  <>
                    <button
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      🔄 Actualizar Estado
                    </button>
                    
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✅ Marcar como Completado
                    </button>
                  </>
                )}

                {report.latitude && report.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-guinda hover:bg-guinda-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    🧭 Abrir en Google Maps
                  </a>
                )}
              </div>
            </motion.div>

            {/* Formulario de actualización */}
            {showUpdateForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">📝 Actualizar Seguimiento</h3>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nuevo Estado *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-guinda focus:border-guinda"
                      required
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario / Nota de Avance
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      placeholder="Describe el avance o cualquier detalle relevante..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-guinda focus:border-guinda resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-guinda hover:bg-guinda-dark text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateForm(false);
                        setComment('');
                        setNewStatus(report.status);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorReportDetailPage;

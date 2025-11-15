/**
 * Validate POIs Page
 * 
 * Página para administradores y supervisores para validar POIs pendientes
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CATEGORIAS = {
  restaurante: '🍽️ Restaurante',
  tienda: '🏪 Tienda',
  servicio: '🔧 Servicio',
  salud: '⚕️ Salud',
  educacion: '📚 Educación',
  entretenimiento: '🎭 Entretenimiento',
  otro: '📍 Otro',
};

export default function ValidatePOIsPage() {
  const [pendingPOIs, setPendingPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationAction, setValidationAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingPOIs();
  }, []);

  const fetchPendingPOIs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/points-of-interest/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingPOIs(response.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener POIs pendientes:', err);
      setError('Error al cargar los puntos de interés pendientes');
    } finally {
      setLoading(false);
    }
  };

  const openValidationModal = (poi, action) => {
    setSelectedPOI(poi);
    setValidationAction(action);
    setRejectionReason('');
    setShowModal(true);
  };

  const handleValidation = async () => {
    if (validationAction === 'rechazar' && !rejectionReason.trim()) {
      alert('Por favor proporciona una razón para el rechazo');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/points-of-interest/${selectedPOI.id}/validate`,
        {
          estado_validacion: validationAction === 'aprobar' ? 'aprobado' : 'rechazado',
          motivo_rechazo: validationAction === 'rechazar' ? rejectionReason : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowModal(false);
      setSelectedPOI(null);
      setRejectionReason('');
      fetchPendingPOIs();
      
      alert(validationAction === 'aprobar' 
        ? '✅ POI aprobado exitosamente' 
        : '❌ POI rechazado exitosamente'
      );
    } catch (err) {
      console.error('Error al validar POI:', err);
      alert('❌ Error al validar el POI: ' + (err.response?.data?.detail || err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando POIs pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✅ Validar Puntos de Interés
          </h1>
          <p className="text-gray-600">
            Revisa y valida los puntos de interés registrados por los usuarios
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-800 font-medium">
              Hay <strong>{pendingPOIs.length}</strong> punto{pendingPOIs.length !== 1 ? 's' : ''} de interés pendiente{pendingPOIs.length !== 1 ? 's' : ''} de validación
            </p>
          </div>
        </motion.div>

        {/* POIs Grid */}
        {pendingPOIs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600">
              No hay puntos de interés pendientes de validación
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPOIs.map((poi, index) => (
              <motion.div
                key={poi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Imagen */}
                {poi.foto_url ? (
                  <img
                    src={`${API_BASE_URL}${poi.foto_url}`}
                    alt={poi.nombre}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {poi.nombre}
                    </h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Pendiente
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {CATEGORIAS[poi.categoria] || poi.categoria}
                  </p>

                  <p className="text-sm text-gray-700 mb-3">
                    📍 {poi.direccion}
                  </p>

                  {poi.descripcion && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {poi.descripcion}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Registrado por: Usuario #{poi.usuario_id}</p>
                    <p>Coordenadas: {poi.latitud.toFixed(6)}, {poi.longitud.toFixed(6)}</p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openValidationModal(poi, 'aprobar')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => openValidationModal(poi, 'rechazar')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Validación */}
      {showModal && selectedPOI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {validationAction === 'aprobar' ? '✅ Aprobar POI' : '❌ Rechazar POI'}
            </h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Nombre:</strong> {selectedPOI.nombre}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Categoría:</strong> {CATEGORIAS[selectedPOI.categoria]}
              </p>
              <p className="text-gray-700">
                <strong>Dirección:</strong> {selectedPOI.direccion}
              </p>
            </div>

            {validationAction === 'rechazar' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del rechazo *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  placeholder="Explica por qué se rechaza este punto de interés..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda resize-none"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPOI(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidation}
                disabled={processing}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  validationAction === 'aprobar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

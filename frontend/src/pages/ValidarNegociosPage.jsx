/**
 * Validar Negocios Page (Admin/Supervisor)
 * 
 * Validación humana de negocios que pasaron la IA.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPendingPOIs, validatePOI } from '../services/api';
import { POI_CATEGORIES } from '../constants/poiCategories';

export default function ValidarNegociosPage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationData, setValidationData] = useState({
    status: 'approved',
    rejection_reason: '',
    categoria: ''
  });

  useEffect(() => {
    fetchPendingPOIs();
  }, []);

  const fetchPendingPOIs = async () => {
    try {
      const data = await getPendingPOIs();
      setPois(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (poi, status) => {
    setSelectedPOI(poi);
    setValidationData({
      status,
      rejection_reason: '',
      categoria: poi.categoria || ''
    });
    setShowModal(true);
  };

  const handleValidate = async () => {
    try {
      await validatePOI(selectedPOI.id, validationData);
      setShowModal(false);
      fetchPendingPOIs();
      alert('✅ Negocio validado');
    } catch (err) {
      alert('Error al validar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-guinda mb-6">
          ✅ Validar Negocios
        </h1>

        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-800">
            <strong>{pois.length}</strong> negocio{pois.length !== 1 ? 's' : ''} pendiente{pois.length !== 1 ? 's' : ''} de validación
          </p>
        </div>

        {pois.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay negocios pendientes de validación
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map((poi) => (
              <motion.div
                key={poi.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow p-4"
              >
                {poi.photo_url && (
                  <img
                    src={`http://localhost:8000${poi.photo_url}`}
                    alt={poi.nombre}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}
                
                <h3 className="text-xl font-bold mb-2">{poi.nombre}</h3>
                
                <div className="mb-3 space-y-1 text-sm">
                  <p><strong>Categoría IA:</strong> {POI_CATEGORIES[poi.categoria]?.label || poi.categoria}</p>
                  <p><strong>Confianza:</strong> {(poi.ia_confidence_score * 100).toFixed(0)}%</p>
                  {poi.ia_spam_level && poi.ia_spam_level !== 'none' && (
                    <p><strong>Spam:</strong> {poi.ia_spam_level}</p>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{poi.descripcion}</p>
                <p className="text-sm text-gray-500 mb-4">📍 {poi.direccion}</p>

                {poi.ia_warnings?.length > 0 && (
                  <div className="mb-3 p-2 bg-yellow-50 rounded text-xs">
                    <strong>⚠️ Advertencias IA:</strong>
                    <ul className="list-disc list-inside">
                      {poi.ia_warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(poi, 'approved')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => openModal(poi, 'rejected')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedPOI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {validationData.status === 'approved' ? '✅ Aprobar' : '❌ Rechazar'} Negocio
              </h2>

              <p className="mb-4"><strong>{selectedPOI.nombre}</strong></p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Categoría (puedes ajustarla):
                </label>
                <select
                  value={validationData.categoria}
                  onChange={(e) => setValidationData({ ...validationData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {Object.entries(POI_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {validationData.status === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Razón del rechazo:
                  </label>
                  <textarea
                    value={validationData.rejection_reason}
                    onChange={(e) => setValidationData({ ...validationData, rejection_reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleValidate}
                  className="flex-1 bg-guinda hover:bg-guinda-dark text-white py-2 rounded-lg"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

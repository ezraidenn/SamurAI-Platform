/**
 * Mis Negocios Page
 * 
 * Lista de negocios registrados por el usuario actual.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyPOIs, deletePOI } from '../services/api';
import { getStatusInfo, getCategoryInfo } from '../constants/poiCategories';

export default function MisNegociosPage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPOIs();
  }, []);

  const fetchMyPOIs = async () => {
    try {
      setLoading(true);
      const data = await getMyPOIs();
      setPois(data);
    } catch (err) {
      setError('Error al cargar tus negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este negocio?')) return;
    
    try {
      await deletePOI(id);
      fetchMyPOIs();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-guinda mb-6">
          📍 Mis Negocios
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {pois.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No has registrado ningún negocio aún
            </p>
            <a
              href="/registrar-negocio"
              className="inline-block bg-guinda text-white px-6 py-3 rounded-lg hover:bg-guinda-dark"
            >
              Registrar Negocio
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map((poi) => {
              const statusInfo = getStatusInfo(poi.ia_status);
              const categoryInfo = getCategoryInfo(poi.categoria);

              return (
                <motion.div
                  key={poi.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
                >
                  {poi.photo_url && (
                    <img
                      src={`http://localhost:8000${poi.photo_url}`}
                      alt={poi.nombre}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {poi.nombre}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </span>
                    {poi.categoria && (
                      <span className="text-sm text-gray-600">
                        {categoryInfo.label}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-3">
                    📍 {poi.direccion}
                  </p>

                  {poi.ia_rejection_reason && (
                    <div className="mb-3 p-2 bg-red-50 rounded text-sm text-red-600">
                      <strong>IA:</strong> {poi.ia_rejection_reason}
                    </div>
                  )}

                  {poi.human_rejection_reason && (
                    <div className="mb-3 p-2 bg-red-50 rounded text-sm text-red-600">
                      <strong>Admin:</strong> {poi.human_rejection_reason}
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(poi.id)}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * My POIs Page
 * Página para ver los puntos de interés registrados por el usuario
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CATEGORIAS_EMOJI = {
  tienda: '🏪',
  servicio: '🔧',
  comercio: '🛒',
  oficina: '🏢',
  cafe: '☕',
  restaurante: '🍽️',
  gobierno: '🏛️',
  educacion: '🎓',
  salud: '🏥',
  deporte: '⚽',
  religion: '⛪',
  parque: '🌳',
  cultura: '🎭',
  otro: '📍',
};

const ESTADO_BADGE = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pendiente' },
  aprobado: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Aprobado' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rechazado' },
};

export default function MyPOIsPage() {
  const navigate = useNavigate();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyPOIs();
  }, []);

  const fetchMyPOIs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/points-of-interest/my-pois`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setPois(response.data);
    } catch (err) {
      console.error('Error al cargar POIs:', err);
      setError('Error al cargar tus puntos de interés');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-guinda mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Cargando tus puntos de interés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-guinda mb-2">
            📍 Mis Puntos de Interés
          </h1>
          <p className="text-gray-600">
            Puntos de interés que has registrado
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botón para registrar nuevo */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/registrar-poi')}
            className="bg-guinda hover:bg-guinda-dark text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            ➕ Registrar Nuevo Punto
          </button>
        </div>

        {/* Lista de POIs */}
        {pois.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No has registrado puntos de interés
            </h2>
            <p className="text-gray-600 mb-6">
              Comienza registrando negocios y lugares de interés en Ucú
            </p>
            <button
              onClick={() => navigate('/registrar-poi')}
              className="bg-guinda hover:bg-guinda-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Registrar Mi Primer Punto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map((poi) => (
              <motion.div
                key={poi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Foto */}
                {poi.photo_url ? (
                  <img
                    src={`${API_BASE_URL}${poi.photo_url}`}
                    alt={poi.nombre}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-guinda to-red-700 flex items-center justify-center">
                    <span className="text-6xl">
                      {CATEGORIAS_EMOJI[poi.categoria] || '📍'}
                    </span>
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  {/* Estado */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_BADGE[poi.estado_validacion].bg} ${ESTADO_BADGE[poi.estado_validacion].text}`}>
                      {ESTADO_BADGE[poi.estado_validacion].label}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {CATEGORIAS_EMOJI[poi.categoria]} {poi.nombre}
                  </h3>

                  {/* Categoría */}
                  <p className="text-sm text-gray-600 mb-2 capitalize">
                    {poi.categoria}
                  </p>

                  {/* Dirección */}
                  <p className="text-sm text-gray-600 mb-3">
                    📍 {poi.direccion}
                  </p>

                  {/* Descripción */}
                  {poi.descripcion && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {poi.descripcion}
                    </p>
                  )}

                  {/* Fecha */}
                  <p className="text-xs text-gray-500 mb-3">
                    Registrado: {new Date(poi.fecha_creacion).toLocaleDateString()}
                  </p>

                  {/* Comentario de rechazo */}
                  {poi.estado_validacion === 'rechazado' && poi.comentario_validacion && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        Motivo del rechazo:
                      </p>
                      <p className="text-sm text-red-700">
                        {poi.comentario_validacion}
                      </p>
                    </div>
                  )}

                  {/* Comentario de aprobación */}
                  {poi.estado_validacion === 'aprobado' && poi.comentario_validacion && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        💬 {poi.comentario_validacion}
                      </p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="mt-4 flex gap-2">
                    {poi.estado_validacion === 'aprobado' && (
                      <button
                        onClick={() => navigate('/mapa-negocios')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Ver en Mapa
                      </button>
                    )}
                    {poi.estado_validacion === 'pendiente' && (
                      <div className="flex-1 bg-yellow-100 text-yellow-800 text-sm font-semibold py-2 px-4 rounded-lg text-center">
                        En revisión...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {pois.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-guinda mb-2">
                {pois.length}
              </div>
              <div className="text-gray-600">Total Registrados</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {pois.filter(p => p.estado_validacion === 'aprobado').length}
              </div>
              <div className="text-gray-600">Aprobados</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {pois.filter(p => p.estado_validacion === 'pendiente').length}
              </div>
              <div className="text-gray-600">Pendientes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

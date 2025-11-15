/**
 * Public POIs Map Page
 * 
 * Mapa público de puntos de interés en Ucú
 * Muestra todos los POIs aprobados en el mapa
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Centro de Ucú
const UCU_CENTER = [21.0317, -89.7464];

// Polígono de Ucú
const UCU_POLYGON = [
  [21.0650, -89.7750],
  [21.0680, -89.7550],
  [21.0650, -89.7350],
  [21.0450, -89.7250],
  [21.0250, -89.7200],
  [21.0050, -89.7250],
  [20.9950, -89.7350],
  [20.9900, -89.7500],
  [20.9950, -89.7650],
  [21.0100, -89.7750],
  [21.0350, -89.7800],
  [21.0650, -89.7750],
];

const CATEGORIAS = {
  restaurante: { label: '🍽️ Restaurante', color: '#EF4444' },
  tienda: { label: '🏪 Tienda', color: '#3B82F6' },
  servicio: { label: '🔧 Servicio', color: '#8B5CF6' },
  salud: { label: '⚕️ Salud', color: '#10B981' },
  educacion: { label: '📚 Educación', color: '#F59E0B' },
  entretenimiento: { label: '🎭 Entretenimiento', color: '#EC4899' },
  otro: { label: '📍 Otro', color: '#6B7280' },
};

// Crear icono personalizado por categoría
const createCategoryIcon = (categoria) => {
  const categoryInfo = CATEGORIAS[categoria] || CATEGORIAS.otro;
  
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `<div style="
      background-color: ${categoryInfo.color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">${categoryInfo.label.split(' ')[0]}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function PublicPOIsMapPage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/points-of-interest/public`);
      setPois(response.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener POIs:', err);
      setError('Error al cargar los puntos de interés');
    } finally {
      setLoading(false);
    }
  };

  const filteredPOIs = selectedCategory === 'todos'
    ? pois
    : pois.filter(poi => poi.categoria === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando mapa...</p>
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
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🗺️ Mapa de Negocios de Ucú
          </h1>
          <p className="text-gray-600">
            Descubre negocios y lugares de interés en el municipio de Ucú, Yucatán
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-4 mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-700">Filtrar por:</span>
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'todos'
                  ? 'bg-guinda text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({pois.length})
            </button>
            {Object.entries(CATEGORIAS).map(([key, value]) => {
              const count = pois.filter(poi => poi.categoria === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-guinda text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value.label} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="h-[600px] relative">
            {filteredPOIs.length > 0 ? (
              <MapContainer
                center={UCU_CENTER}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredPOIs.map((poi) => (
                  <Marker
                    key={poi.id}
                    position={[poi.latitud, poi.longitud]}
                    icon={createCategoryIcon(poi.categoria)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        {poi.foto_url && (
                          <img
                            src={`${API_BASE_URL}${poi.foto_url}`}
                            alt={poi.nombre}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {poi.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {CATEGORIAS[poi.categoria]?.label || poi.categoria}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          📍 {poi.direccion}
                        </p>
                        {poi.descripcion && (
                          <p className="text-xs text-gray-600 italic">
                            {poi.descripcion}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    No hay puntos de interés en esta categoría
                  </p>
                  <button
                    onClick={() => setSelectedCategory('todos')}
                    className="text-guinda hover:text-guinda-dark font-medium"
                  >
                    Ver todos
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-guinda">{pois.length}</p>
            <p className="text-sm text-gray-600">Total de Negocios</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {Object.keys(CATEGORIAS).filter(cat => pois.some(poi => poi.categoria === cat)).length}
            </p>
            <p className="text-sm text-gray-600">Categorías</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{filteredPOIs.length}</p>
            <p className="text-sm text-gray-600">Mostrando</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">100%</p>
            <p className="text-sm text-gray-600">Verificados</p>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
        >
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                ¿Tienes un negocio en Ucú?
              </p>
              <p className="text-sm text-blue-700">
                Regístrate y agrega tu negocio al mapa para que más personas puedan encontrarte.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

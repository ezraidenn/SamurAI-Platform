/**
 * Mapa de Negocios Page
 * 
 * Mapa público con SOLO negocios (POIs).
 * NO muestra reportes de baches, alumbrado, etc.
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPublicPOIs, deletePOI, getPhotoUrl } from '../services/api';
import { POI_CATEGORIES } from '../constants/poiCategories';
import { useAuth } from '../context/AuthContext';

// Polígono de Ucú
const UCU_POLYGON = [
  [21.043611, -89.760833],
  [21.043611, -89.733333],
  [21.020833, -89.733333],
  [21.020833, -89.760833],
  [21.043611, -89.760833]
];

// Centro de Ucú
const UCU_CENTER = [21.0317, -89.7464];

// Crear iconos personalizados por categoría
const createCustomIcon = (categoria, isOfficial = false) => {
  const categoryInfo = POI_CATEGORIES[categoria] || POI_CATEGORIES.otro;
  const emoji = categoryInfo.label.split(' ')[0]; // Obtener solo el emoji
  
  // POIs oficiales tienen borde dorado y badge
  const borderColor = isOfficial ? '#FFD700' : 'white';
  const borderWidth = isOfficial ? '4px' : '3px';
  const badge = isOfficial ? '<div style="position: absolute; top: -5px; right: -5px; background: #FFD700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white;">✓</div>' : '';
  
  return L.divIcon({
    html: `<div style="position: relative;">
      <div style="
        background: ${categoryInfo.color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: ${borderWidth} solid ${borderColor};
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      ">${emoji}</div>
      ${badge}
    </div>`,
    className: 'custom-poi-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

export default function MapaNegociosPage() {
  const { user } = useAuth();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchPOIs();
  }, [selectedCategory]);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const filters = selectedCategory !== 'todos' ? { categoria: selectedCategory } : {};
      const data = await getPublicPOIs(filters);
      setPois(data);
    } catch (err) {
      console.error('Error al cargar negocios:', err);
      setError('Error al cargar los negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (poi) => {
    setSelectedPOI(poi);
    setShowModal(true);
  };

  const handleDelete = async (poiId) => {
    if (!confirm('¿Estás seguro de eliminar este negocio?')) return;
    
    try {
      await deletePOI(poiId);
      setShowModal(false);
      fetchPOIs();
      alert('✅ Negocio eliminado');
    } catch (err) {
      alert('❌ Error al eliminar');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando mapa de negocios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-guinda mb-2">
            🗺️ Mapa de Negocios de Ucú
          </h1>
          <p className="text-gray-600">
            Explora todos los negocios y lugares de interés registrados en Ucú
          </p>
        </motion.div>

        {/* Filtros de categoría */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por categoría:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'todos'
                  ? 'bg-guinda text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {Object.entries(POI_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === key
                    ? 'bg-guinda text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Mapa Interactivo */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4 bg-guinda text-white">
            <p className="font-semibold">
              📍 {pois.length} negocio{pois.length !== 1 ? 's' : ''} encontrado{pois.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ height: '600px', width: '100%' }}>
            <MapContainer
              center={UCU_CENTER}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Polígono de Ucú */}
              <Polygon
                positions={UCU_POLYGON}
                pathOptions={{
                  color: '#8B1538',
                  fillColor: '#8B1538',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />

              {/* Marcadores de negocios */}
              {pois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={[poi.latitude, poi.longitude]}
                  icon={createCustomIcon(poi.categoria, poi.is_official)}
                  eventHandlers={{
                    click: () => handleMarkerClick(poi)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      {poi.is_official && (
                        <div className="mb-1">
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                            ✓ Oficial
                          </span>
                        </div>
                      )}
                      <h3 className="font-bold text-lg">{poi.nombre}</h3>
                      <p className="text-sm text-gray-600">{POI_CATEGORIES[poi.categoria]?.label}</p>
                      <button
                        onClick={() => handleMarkerClick(poi)}
                        className="mt-2 text-guinda hover:underline text-sm"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Lista de negocios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pois.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No hay negocios registrados aún
              </p>
            </div>
          ) : (
            pois.map((poi) => (
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
                <p className="text-sm text-gray-600 mb-2">
                  {POI_CATEGORIES[poi.categoria]?.label || poi.categoria}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  📍 {poi.direccion}
                </p>
                {poi.telefono && (
                  <p className="text-sm text-gray-600">
                    📞 {poi.telefono}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Modal de Detalles */}
        {showModal && selectedPOI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-guinda text-white p-4 flex justify-between items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedPOI.nombre}</h2>
                  {selectedPOI.is_official && (
                    <span className="inline-block mt-1 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-bold">
                      ✓ LUGAR OFICIAL
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 text-2xl ml-4"
                >
                  ×
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Foto */}
                {selectedPOI.photo_url && (
                  <img
                    src={getPhotoUrl(selectedPOI.photo_url)}
                    alt={selectedPOI.nombre}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                {/* Categoría */}
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: POI_CATEGORIES[selectedPOI.categoria]?.color + '20',
                      color: POI_CATEGORIES[selectedPOI.categoria]?.color
                    }}
                  >
                    {POI_CATEGORIES[selectedPOI.categoria]?.label}
                  </span>
                </div>

                {/* Descripción */}
                {selectedPOI.descripcion && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
                    <p className="text-gray-600">{selectedPOI.descripcion}</p>
                  </div>
                )}

                {/* Dirección */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">📍 Dirección</h3>
                  <p className="text-gray-600">{selectedPOI.direccion}</p>
                  {selectedPOI.colonia && (
                    <p className="text-sm text-gray-500">Colonia: {selectedPOI.colonia}</p>
                  )}
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPOI.telefono && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">📞 Teléfono</h3>
                      <a href={`tel:${selectedPOI.telefono}`} className="text-guinda hover:underline">
                        {selectedPOI.telefono}
                      </a>
                    </div>
                  )}
                  {selectedPOI.whatsapp && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">💬 WhatsApp</h3>
                      <a
                        href={`https://wa.me/${selectedPOI.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        {selectedPOI.whatsapp}
                      </a>
                    </div>
                  )}
                </div>

                {/* Redes sociales */}
                {(selectedPOI.facebook || selectedPOI.instagram || selectedPOI.website) && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">🌐 Redes Sociales</h3>
                    <div className="flex gap-3">
                      {selectedPOI.facebook && (
                        <a
                          href={selectedPOI.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                      {selectedPOI.instagram && (
                        <a
                          href={selectedPOI.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                      {selectedPOI.website && (
                        <a
                          href={selectedPOI.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-guinda hover:underline"
                        >
                          Sitio Web
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Opciones de Admin */}
                {isAdmin && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">⚙️ Opciones de Administrador</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(selectedPOI.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                      >
                        🗑️ Eliminar Negocio
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          window.open(`/admin/gestionar-negocios`, '_blank');
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

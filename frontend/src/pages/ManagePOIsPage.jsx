/**
 * Manage POIs Page
 * 
 * Página para administradores y supervisores para ver, modificar y eliminar POIs
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CATEGORIAS = [
  { value: 'restaurante', label: '🍽️ Restaurante' },
  { value: 'tienda', label: '🏪 Tienda' },
  { value: 'servicio', label: '🔧 Servicio' },
  { value: 'salud', label: '⚕️ Salud' },
  { value: 'educacion', label: '📚 Educación' },
  { value: 'entretenimiento', label: '🎭 Entretenimiento' },
  { value: 'otro', label: '📍 Otro' },
];

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: '⏳ Pendiente' },
  { value: 'aprobado', label: '✅ Aprobado' },
  { value: 'rechazado', label: '❌ Rechazado' },
];

export default function ManagePOIsPage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPOI, setEditingPOI] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState(null);

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener todos los POIs (pendientes, aprobados y rechazados)
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/points-of-interest/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/points-of-interest/public`)
      ]);

      // Combinar todos los POIs
      const allPOIs = [...pendingRes.data, ...approvedRes.data];
      
      // Obtener POIs rechazados del usuario (si hay endpoint)
      try {
        const userPOIsRes = await axios.get(`${API_BASE_URL}/points-of-interest/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Agregar solo los rechazados que no estén ya en la lista
        const rejectedPOIs = userPOIsRes.data.filter(poi => 
          poi.estado_validacion === 'rechazado' && 
          !allPOIs.find(p => p.id === poi.id)
        );
        
        allPOIs.push(...rejectedPOIs);
      } catch (err) {
        console.log('No se pudieron obtener POIs del usuario');
      }

      setPois(allPOIs);
      setError('');
    } catch (err) {
      console.error('Error al obtener POIs:', err);
      setError('Error al cargar los puntos de interés');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (poi) => {
    setEditingPOI({
      ...poi,
      nombre: poi.nombre,
      categoria: poi.categoria,
      direccion: poi.direccion,
      descripcion: poi.descripcion || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_BASE_URL}/points-of-interest/${editingPOI.id}`,
        {
          nombre: editingPOI.nombre,
          categoria: editingPOI.categoria,
          direccion: editingPOI.direccion,
          descripcion: editingPOI.descripcion
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowEditModal(false);
      setEditingPOI(null);
      fetchPOIs();
      alert('✅ POI actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar POI:', err);
      alert('❌ Error al actualizar el POI: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = (poi) => {
    setPoiToDelete(poi);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${API_BASE_URL}/points-of-interest/${poiToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowDeleteModal(false);
      setPoiToDelete(null);
      fetchPOIs();
      alert('✅ POI eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar POI:', err);
      alert('❌ Error al eliminar el POI: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredPOIs = pois.filter(poi => {
    const matchEstado = filtroEstado === 'todos' || poi.estado_validacion === filtroEstado;
    const matchCategoria = filtroCategoria === 'todos' || poi.categoria === filtroCategoria;
    const matchSearch = poi.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       poi.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchEstado && matchCategoria && matchSearch;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pendiente: '⏳ Pendiente',
      aprobado: '✅ Aprobado',
      rechazado: '❌ Rechazado'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[estado]}`}>
        {labels[estado]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando puntos de interés...</p>
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
            📍 Gestión de Puntos de Interés
          </h1>
          <p className="text-gray-600">
            Ver, modificar y eliminar puntos de interés registrados
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o dirección..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                {ESTADOS.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="todos">Todas</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredPOIs.length} de {pois.length} puntos de interés
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabla de POIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPOIs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron puntos de interés
                    </td>
                  </tr>
                ) : (
                  filteredPOIs.map((poi) => (
                    <tr key={poi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {poi.foto_url && (
                            <img
                              src={`${API_BASE_URL}${poi.foto_url}`}
                              alt={poi.nombre}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {poi.nombre}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {poi.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {CATEGORIAS.find(c => c.value === poi.categoria)?.label || poi.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {poi.direccion}
                        </div>
                        <div className="text-xs text-gray-500">
                          {poi.latitud.toFixed(6)}, {poi.longitud.toFixed(6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(poi.estado_validacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(poi)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(poi)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal de Edición */}
        {showEditModal && editingPOI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✏️ Editar Punto de Interés
              </h2>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editingPOI.nombre}
                    onChange={(e) => setEditingPOI({ ...editingPOI, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={editingPOI.categoria}
                    onChange={(e) => setEditingPOI({ ...editingPOI, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={editingPOI.direccion}
                    onChange={(e) => setEditingPOI({ ...editingPOI, direccion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingPOI.descripcion}
                    onChange={(e) => setEditingPOI({ ...editingPOI, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPOI(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && poiToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Eliminar POI?
                </h2>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas eliminar "{poiToDelete.nombre}"?
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPoiToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Register Point of Interest Page
 * Formulario para registrar puntos de interés en Ucú
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UcuMapPicker from '../components/UcuMapPicker';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CATEGORIAS = [
  { value: 'tienda', label: '🏪 Tienda', icon: '🏪' },
  { value: 'servicio', label: '🔧 Servicio', icon: '🔧' },
  { value: 'comercio', label: '🛒 Comercio', icon: '🛒' },
  { value: 'oficina', label: '🏢 Oficina', icon: '🏢' },
  { value: 'cafe', label: '☕ Café', icon: '☕' },
  { value: 'restaurante', label: '🍽️ Restaurante', icon: '🍽️' },
  { value: 'gobierno', label: '🏛️ Gobierno', icon: '🏛️' },
  { value: 'educacion', label: '🎓 Educación', icon: '🎓' },
  { value: 'salud', label: '🏥 Salud', icon: '🏥' },
  { value: 'deporte', label: '⚽ Deporte', icon: '⚽' },
  { value: 'religion', label: '⛪ Religión', icon: '⛪' },
  { value: 'parque', label: '🌳 Parque', icon: '🌳' },
  { value: 'cultura', label: '🎭 Cultura', icon: '🎭' },
  { value: 'otro', label: '📍 Otro', icon: '📍' },
];

export default function RegisterPOIPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    direccion: '',
    location: null,
    photo: null,
  });
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'La imagen no debe superar 10MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };
  
  const handleLocationChange = (location) => {
    setFormData(prev => ({ ...prev, location }));
    setErrors(prev => ({ ...prev, location: '' }));
  };
  
  const handleLocationFound = (locationData) => {
    // Auto-llenar dirección cuando se usa "Usar mi ubicación"
    if (locationData.address) {
      const addr = locationData.address;
      
      // Construir dirección completa
      let direccionCompleta = '';
      if (addr.street) {
        direccionCompleta = addr.houseNumber 
          ? `${addr.street} ${addr.houseNumber}` 
          : addr.street;
      }
      
      // Agregar colonia/barrio si existe
      if (addr.suburb) {
        direccionCompleta += direccionCompleta ? `, ${addr.suburb}` : addr.suburb;
      }
      
      // Agregar ciudad
      direccionCompleta += direccionCompleta ? `, ${addr.city}` : addr.city;
      
      if (direccionCompleta) {
        setFormData(prev => ({
          ...prev,
          direccion: direccionCompleta
        }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim() || formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }
    
    if (!formData.location) {
      newErrors.location = 'Selecciona una ubicación en el mapa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. Subir foto si existe
      let photoUrl = null;
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);
        
        const photoResponse = await axios.post(
          `${API_BASE_URL}/points-of-interest/upload-photo`,
          photoFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        photoUrl = photoResponse.data.photo_url;
      }
      
      // 2. Crear punto de interés
      const poiData = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        descripcion: formData.descripcion || null,
        direccion: formData.direccion,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        photo_url: photoUrl,
      };
      
      await axios.post(
        `${API_BASE_URL}/points-of-interest/`,
        poiData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/mis-puntos');
      }, 3000);
      
    } catch (err) {
      console.error('Error al registrar POI:', err);
      
      if (err.response?.data?.detail?.error === 'invalid_location') {
        setError(err.response.data.detail.reason);
      } else {
        setError(err.response?.data?.detail || 'Error al registrar el punto de interés');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Punto Registrado!</h2>
          <p className="text-gray-600 mb-4">
            Tu punto de interés está pendiente de validación por un administrador.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-guinda mb-2">
              📍 Registrar Punto de Interés
            </h1>
            <p className="text-gray-600">
              Comparte negocios y lugares de interés en Ucú
            </p>
          </div>
          
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Negocio o Lugar *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Tienda Don Pepe"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>
            
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
              )}
            </div>
            
            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle 20 x 19 y 21, Centro, Ucú"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                  errors.direccion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
            </div>
            
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                placeholder="Describe brevemente el lugar..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda resize-none"
              />
            </div>
            
            {/* Mapa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación en el Mapa *
              </label>
              <UcuMapPicker
                value={formData.location ? [formData.location.lat, formData.location.lng] : null}
                onChange={handleLocationChange}
                onLocationFound={handleLocationFound}
                height="h-96"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
              {errors.photo && (
                <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
              )}
              {photoPreview && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
            
            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-guinda hover:bg-guinda-dark text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </>
              ) : (
                '📤 Registrar Punto de Interés'
              )}
            </button>
            
            {/* Nota de validación */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Nota:</strong> Tu punto de interés será revisado por un administrador antes de aparecer en el mapa público.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

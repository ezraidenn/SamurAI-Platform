/**
 * Mérida Report Form Page
 * 
 * Formulario de reporte con:
 * - Autocompletado por código postal (API COPOMEX)
 * - Autocompletado por coordenadas (reverse geocoding)
 * - Validación de ubicación en Mérida, Yucatán
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { createReport, uploadReportPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  getAndValidateAddressByCP,
  getAndValidateAddressByCoords,
  validateMeridaYucatan 
} from '../services/locationService';

export default function MeridaReportFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingCP, setLoadingCP] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const [formData, setFormData] = useState({
    codigoPostal: '',
    colonia: '',
    municipio: '',
    estado: '',
    direccion: '',
    referencias: '',
    location: null,
    photo: null,
  });

  const [colonias, setColonias] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [locationValidation, setLocationValidation] = useState(null);

  // Autocompletar por código postal
  const handleCodigoPostalChange = async (e) => {
    const cp = e.target.value;
    setFormData(prev => ({ ...prev, codigoPostal: cp }));
    
    // Limpiar errores previos
    setErrors(prev => ({ ...prev, codigoPostal: '', colonia: '', municipio: '', estado: '' }));
    setLocationValidation(null);

    // Validar formato básico
    if (cp.length !== 5 || !/^\d{5}$/.test(cp)) {
      if (cp.length === 5) {
        setErrors(prev => ({ ...prev, codigoPostal: 'Código postal inválido' }));
      }
      setColonias([]);
      setFormData(prev => ({ ...prev, colonia: '', municipio: '', estado: '' }));
      return;
    }

    // Consultar API
    setLoadingCP(true);
    try {
      const result = await getAndValidateAddressByCP(cp);
      
      if (!result.success) {
        setErrors(prev => ({ ...prev, codigoPostal: result.error }));
        setColonias([]);
        setFormData(prev => ({ ...prev, colonia: '', municipio: '', estado: '' }));
        setLocationValidation(null);
        return;
      }

      // Llenar datos
      setColonias(result.colonias);
      setFormData(prev => ({
        ...prev,
        municipio: result.municipio,
        estado: result.estado,
        colonia: result.colonias.length === 1 ? result.colonias[0] : ''
      }));

      // Validar ubicación
      setLocationValidation(result.validation);
      
      if (!result.validation.valid) {
        setErrors(prev => ({ 
          ...prev, 
          codigoPostal: result.validation.mensaje 
        }));
      }
    } catch (err) {
      console.error('Error al consultar código postal:', err);
      setErrors(prev => ({ ...prev, codigoPostal: 'Error al consultar el código postal' }));
    } finally {
      setLoadingCP(false);
    }
  };

  // Autocompletar por ubicación en mapa
  const handleLocationFound = async (locationData) => {
    if (!locationData || !locationData.address) return;

    setLoadingGeo(true);
    setErrors({});
    setLocationValidation(null);

    try {
      const { lat, lng } = locationData.position;
      const result = await getAndValidateAddressByCoords(lat, lng);

      if (!result.success) {
        setError('No se pudo obtener la dirección de esta ubicación');
        setLoadingGeo(false);
        return;
      }

      // Actualizar formulario con datos obtenidos
      setFormData(prev => ({
        ...prev,
        codigoPostal: result.codigoPostal || prev.codigoPostal,
        colonia: result.colonia || prev.colonia,
        municipio: result.municipio || prev.municipio,
        estado: result.estado || prev.estado,
        direccion: result.direccion || prev.direccion
      }));

      // Si hay código postal, obtener colonias
      if (result.codigoPostal) {
        const cpResult = await getAndValidateAddressByCP(result.codigoPostal);
        if (cpResult.success) {
          setColonias(cpResult.colonias);
        }
      }

      // Validar ubicación
      setLocationValidation(result.validation);
      
      if (!result.validation.valid) {
        setError(result.validation.mensaje);
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
      setError('Error al obtener la dirección');
    } finally {
      setLoadingGeo(false);
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    // Validar código postal
    if (!formData.codigoPostal) {
      newErrors.codigoPostal = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.codigoPostal)) {
      newErrors.codigoPostal = 'El código postal debe tener 5 dígitos';
    }

    // Validar colonia
    if (!formData.colonia) {
      newErrors.colonia = 'Selecciona una colonia';
    }

    // Validar municipio y estado
    if (!formData.municipio) {
      newErrors.municipio = 'El municipio es requerido';
    }
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
    }

    // Validar que sea Mérida, Yucatán
    const validation = validateMeridaYucatan(
      formData.municipio,
      formData.estado,
      formData.codigoPostal
    );

    if (!validation.valid) {
      newErrors.ubicacion = validation.mensaje;
      setLocationValidation(validation);
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    // Validar referencias
    if (!formData.referencias.trim()) {
      newErrors.referencias = 'Las referencias son requeridas';
    } else if (formData.referencias.length < 20) {
      newErrors.referencias = 'Proporciona más detalles (mínimo 20 caracteres)';
    }

    // Validar ubicación en mapa
    if (!formData.location) {
      newErrors.location = 'Selecciona una ubicación en el mapa';
    }

    // Validar foto
    if (!formData.photo) {
      newErrors.photo = 'La foto es requerida';
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
      // 1. Subir foto
      let photoUrl = null;
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);
        const photoResponse = await uploadReportPhoto(photoFormData);
        photoUrl = photoResponse.photo_url;
      }

      // 2. Crear reporte
      const reportData = {
        category: 'vialidad', // Categoría por defecto
        description: `${formData.referencias}\n\nDirección: ${formData.direccion}, ${formData.colonia}, CP: ${formData.codigoPostal}, ${formData.municipio}, ${formData.estado}`,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        photo_url: photoUrl,
      };

      await createReport(reportData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/panel');
      }, 3000);
    } catch (err) {
      console.error('Error al crear reporte:', err);
      setError(err.response?.data?.detail || 'Error al enviar el reporte. Intenta de nuevo.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reporte Enviado!</h2>
          <p className="text-gray-600 mb-4">Gracias por ayudarnos a mejorar Mérida.</p>
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
              Reportar Daño Vial - Mérida
            </h1>
            <p className="text-gray-600">
              Completa la información del reporte
            </p>
          </div>

          {/* Validación de Ubicación */}
          {locationValidation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border-l-4 ${
                locationValidation.valid
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3">
                  {locationValidation.valid ? (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{locationValidation.mensaje}</p>
                  {!locationValidation.valid && (
                    <p className="text-sm mt-1">
                      Solo se aceptan reportes de Mérida, Yucatán.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error General */}
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
            
            {/* Código Postal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleCodigoPostalChange}
                  maxLength="5"
                  placeholder="97000"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                    errors.codigoPostal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {loadingCP && (
                  <div className="absolute right-3 top-3">
                    <svg className="animate-spin h-6 w-6 text-guinda" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {errors.codigoPostal && (
                <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Ingresa el código postal y se autocompletarán los datos
              </p>
            </div>

            {/* Colonia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colonia *
              </label>
              <select
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                disabled={colonias.length === 0}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                  errors.colonia ? 'border-red-500' : 'border-gray-300'
                } ${colonias.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecciona una colonia</option>
                {colonias.map((colonia, index) => (
                  <option key={index} value={colonia}>
                    {colonia}
                  </option>
                ))}
              </select>
              {errors.colonia && (
                <p className="mt-1 text-sm text-red-600">{errors.colonia}</p>
              )}
            </div>

            {/* Municipio y Estado (readonly) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipio *
                </label>
                <input
                  type="text"
                  name="municipio"
                  value={formData.municipio}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección (Calle y Número) *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle 60 #450"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda ${
                  errors.direccion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
            </div>

            {/* Referencias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Problema *
              </label>
              <textarea
                name="referencias"
                value={formData.referencias}
                onChange={handleChange}
                rows="4"
                placeholder="Describe detalladamente el problema (mínimo 20 caracteres)"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda resize-none ${
                  errors.referencias ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.referencias && (
                <p className="mt-1 text-sm text-red-600">{errors.referencias}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.referencias.length}/20 caracteres mínimos
              </p>
            </div>

            {/* Mapa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación en el Mapa * {loadingGeo && <span className="text-guinda">(Obteniendo dirección...)</span>}
              </label>
              <MapPicker
                value={formData.location}
                onChange={handleLocationChange}
                onLocationFound={handleLocationFound}
                height="h-96"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                💡 Puedes hacer clic en el mapa o arrastrar el marcador. La dirección se autocompletará.
              </p>
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del Problema *
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

            {/* Error de ubicación */}
            {errors.ubicacion && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-800 font-semibold">{errors.ubicacion}</p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading || (locationValidation && !locationValidation.valid)}
              className="w-full bg-guinda hover:bg-guinda-dark text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Reporte
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

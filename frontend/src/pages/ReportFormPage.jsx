/**
 * Report Form Page
 * 
 * Formulario de reporte de daños en infraestructura vial del municipio de Ucú.
 * Diseñado con UX optimizada para usuarios de todas las edades.
 * Pantalla completa, diseño moderno y responsivo.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { createReport, uploadReportPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  COLONIAS_UCU, 
  CODIGOS_POSTALES_UCU, 
  validarCodigoPostalUcu, 
  validarColoniaUcu,
  getMensajeErrorCP,
  getMensajeErrorColonia 
} from '../config/ucuData';

// Categorías de daño vial simplificadas
const DAMAGE_CATEGORIES = [
  {
    id: 'via_mal_estado',
    title: 'Vía en mal estado',
    description: 'Baches, grietas, fisuras, hundimientos, deformaciones y topes irregulares',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'infraestructura_danada',
    title: 'Infraestructura dañada',
    description: 'Banquetas rotas, drenaje insuficiente, alcantarillas o tapas de registro dañadas',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'senalizacion_transito',
    title: 'Señalización y control de tránsito',
    description: 'Señalización dañada, semáforos fuera de servicio, pintura vial desgastada',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'iluminacion_visibilidad',
    title: 'Iluminación y visibilidad',
    description: 'Falta de alumbrado público, vegetación que obstruye visibilidad',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

// Las colonias ahora se importan desde ucuData.js

export default function ReportFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    damageCategory: '',
    colonia: '',
    direccion: '',
    codigoPostal: '',
    referencias: '',
    location: null,
    photo: null,
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Selección de daño, 2: Formulario

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setError('');
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      location,
    }));
    setErrors((prev) => ({
      ...prev,
      location: '',
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          photo: 'Por favor selecciona una imagen válida',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: 'La imagen no debe superar los 5MB',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({
        ...prev,
        photo: '',
      }));
    }
  };

  const handleLocationFound = (locationData) => {
    // Prellenar campos con datos de geolocalización
    if (locationData.address) {
      const addr = locationData.address;
      
      // Prellenar colonia/barrio
      if (addr.suburb || addr.neighbourhood || addr.quarter) {
        setFormData(prev => ({
          ...prev,
          colonia: addr.suburb || addr.neighbourhood || addr.quarter || ''
        }));
      }
      
      // Prellenar dirección
      const street = addr.road || addr.street || '';
      const houseNumber = addr.house_number || '';
      if (street) {
        setFormData(prev => ({
          ...prev,
          direccion: houseNumber ? `${street} ${houseNumber}` : street
        }));
      }
      
      // Prellenar código postal
      if (addr.postcode) {
        setFormData(prev => ({
          ...prev,
          codigoPostal: addr.postcode
        }));
      }
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, damageCategory: categoryId }));
    setCurrentStep(2);
  };

  const handleBackToCategories = () => {
    setCurrentStep(1);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.damageCategory) {
      newErrors.damageCategory = 'Selecciona un tipo de daño';
    }

    // Validar colonia
    if (!formData.colonia) {
      newErrors.colonia = 'Selecciona tu colonia';
    } else if (!validarColoniaUcu(formData.colonia)) {
      newErrors.colonia = getMensajeErrorColonia();
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    // Validar código postal
    if (!formData.codigoPostal.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    } else if (!/^\d{5}$/.test(formData.codigoPostal)) {
      newErrors.codigoPostal = 'El código postal debe tener 5 dígitos';
    } else if (!validarCodigoPostalUcu(formData.codigoPostal)) {
      newErrors.codigoPostal = getMensajeErrorCP();
    }

    if (!formData.referencias.trim()) {
      newErrors.referencias = 'Las referencias son requeridas';
    } else if (formData.referencias.length < 20) {
      newErrors.referencias = 'Por favor proporciona más detalles (mínimo 20 caracteres)';
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
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Obtener título de la categoría seleccionada
      const selectedCategory = DAMAGE_CATEGORIES.find(cat => cat.id === formData.damageCategory);
      
      // Crear descripción completa del reporte
      const descripcionCompleta = `TIPO DE DAÑO: ${selectedCategory?.title || 'No especificado'}\n` +
        `COLONIA: ${formData.colonia}\n` +
        `DIRECCIÓN: ${formData.direccion}\n` +
        `CÓDIGO POSTAL: ${formData.codigoPostal}\n` +
        `REFERENCIAS: ${formData.referencias}`;

      // Create report
      const reportData = {
        category: 'bache', // Categoría base para el backend
        description: descripcionCompleta,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
      };

      const createdReport = await createReport(reportData);

      // Upload photo if provided
      if (formData.photo) {
        await uploadReportPhoto(createdReport.id, formData.photo);
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/panel');
      }, 2000);
    } catch (err) {
      console.error('Error creating report:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al crear el reporte. Por favor intenta de nuevo.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reporte Enviado Exitosamente!</h2>
          <p className="text-gray-600 mb-4">Gracias por ayudarnos a mejorar nuestra infraestructura vial.</p>
          <p className="text-sm text-gray-500">Te redirigiremos a tu panel en unos segundos...</p>
        </motion.div>
      </div>
    );
  }

  // Renderizar selector de categorías
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-guinda/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-guinda rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Reportar Daño Vial
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Selecciona el tipo de daño que deseas reportar
            </p>
          </div>

          {/* Mensaje de restricción municipal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm"
          >
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Importante - Municipio de Ucú</p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Este sistema de reportes es únicamente para daños dentro del municipio de Ucú. Si el problema pertenece a otra zona, tu reporte no podrá ser procesado.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {DAMAGE_CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleCategorySelect(category.id)}
                className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-guinda focus:outline-none focus:ring-4 focus:ring-guinda/20"
              >
                {/* Icono */}
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-guinda group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                
                {/* Título */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-guinda transition-colors">
                  {category.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {category.description}
                </p>

                {/* Indicador de hover */}
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-guinda group-hover:bg-guinda transition-all duration-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Renderizar formulario (Step 2)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Botón volver */}
          <button
            onClick={handleBackToCategories}
            className="mb-4 flex items-center gap-2 text-guinda hover:text-guinda-dark font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a selección de daño
          </button>

          {/* Header del formulario */}
          <div className="mb-6 text-center">
            <div className="inline-block p-3 bg-guinda/10 rounded-full mb-3">
              <div className="w-12 h-12 text-guinda">
                {DAMAGE_CATEGORIES.find(cat => cat.id === formData.damageCategory)?.icon}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-guinda mb-2">
              {DAMAGE_CATEGORIES.find(cat => cat.id === formData.damageCategory)?.title}
            </h1>
            <p className="text-gray-600">
              Completa la información del reporte
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Nota informativa */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-base text-blue-800 font-medium">
                Completa todos los campos para ayudarnos a localizar más rápido el lugar del reporte.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-6 md:space-y-8">
            {/* Colonia - Dropdown */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Colonia *
                </span>
              </label>
              <select
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda transition-all appearance-none bg-white cursor-pointer ${
                  errors.colonia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Selecciona tu colonia</option>
                {COLONIAS_UCU.map(colonia => (
                  <option key={colonia} value={colonia}>
                    {colonia}
                  </option>
                ))}
              </select>
              {errors.colonia && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.colonia}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Dirección (Donde se ubica el problema) *
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Calle 60 entre 47 y 49, Av. Itzáes #234..."
                className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda transition-all ${
                  errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.direccion && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.direccion}
                </p>
              )}
            </div>

            {/* Código Postal */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Código Postal *
              </label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                placeholder="Ej: 97000"
                maxLength="5"
                className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda transition-all ${
                  errors.codigoPostal ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.codigoPostal && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.codigoPostal}
                </p>
              )}
            </div>

            {/* Map */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Ubicación en el Mapa *
              </label>
              <MapPicker 
                value={formData.location} 
                onChange={handleLocationChange}
                onLocationFound={handleLocationFound}
                height="h-80"
              />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.location}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                💡 Usa el botón azul para obtener tu ubicación actual o haz clic en el mapa
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Foto del Problema *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  id="photo-input"
                  className="hidden"
                />
                <label
                  htmlFor="photo-input"
                  className={`flex items-center justify-center w-full px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    errors.photo 
                      ? 'border-red-300 bg-red-50' 
                      : formData.photo
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    {formData.photo ? (
                      <>
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-base font-medium text-green-700">Foto seleccionada</p>
                        <p className="text-sm text-gray-600 mt-1">Haz clic para cambiar</p>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mt-2 text-base font-medium text-gray-700">📸 Subir o tomar foto</p>
                        <p className="text-sm text-gray-500 mt-1">Haz clic para seleccionar</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {errors.photo && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.photo}
                </p>
              )}

              {photoPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-auto max-h-80 object-contain rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                </motion.div>
              )}
            </div>

            {/* Referencias */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Referencias (Detalles adicionales) *
              </label>
              <textarea
                name="referencias"
                value={formData.referencias}
                onChange={handleChange}
                rows="6"
                placeholder="Describe con detalle el problema y puntos de referencia cercanos...&#10;&#10;Ejemplo:&#10;- Bache grande frente a la tienda Oxxo&#10;- Aproximadamente 2 metros de diámetro&#10;- Cerca de la esquina con semáforo&#10;- Representa peligro para motociclistas"
                className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-guinda focus:border-guinda transition-all resize-none ${
                  errors.referencias ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.referencias && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.referencias}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                💡 Procura incluir: tamaño del daño, puntos cercanos reconocibles, nivel de peligro, etc.
              </p>
            </div>

            {/* Nota final */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  <strong>Importante:</strong> Entre más completo y específico sea tu reporte, más rápido podremos localizar la falla y dar una solución más eficiente al problema.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-guinda text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-guinda-dark hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando reporte...
                </span>
              ) : (
                '✓ Enviar Reporte'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

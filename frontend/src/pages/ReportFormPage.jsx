/**
 * Report Form Page
 * 
 * Page for citizens to create new reports with map and photo upload.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { createReport, uploadReportPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: 'bache', label: 'Bache', icon: '🕳️' },
  { value: 'alumbrado', label: 'Alumbrado', icon: '💡' },
  { value: 'basura', label: 'Basura', icon: '🗑️' },
  { value: 'drenaje', label: 'Drenaje', icon: '🚰' },
  { value: 'vialidad', label: 'Vialidad', icon: '🚦' },
];

export default function ReportFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: null,
    photo: null,
  });

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
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
      // Create report
      const reportData = {
        category: formData.category,
        description: formData.description,
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reporte Creado!</h2>
          <p className="text-gray-600 mb-4">Tu reporte ha sido registrado exitosamente.</p>
          <p className="text-sm text-gray-500">Redirigiendo a tus reportes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-guinda mb-2">Crear Reporte</h1>
            <p className="text-gray-600">Reporta un problema en tu municipio</p>
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'category', value: cat.value } })}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.category === cat.value
                        ? 'border-guinda bg-guinda/5 ring-2 ring-guinda ring-offset-2'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe el problema con detalle (ej: tamaño, ubicación exacta, riesgos, etc.)..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tip: Palabras como "accidente", "riesgo", "niños", "peligro" aumentan la prioridad del reporte
              </p>
            </div>

            {/* Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación * (haz clic en el mapa)
              </label>
              <MapPicker value={formData.location} onChange={handleLocationChange} />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent ${
                  errors.photo ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.photo && (
                <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
              )}

              {photoPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-gray-200"
                  />
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-guinda text-white py-3 rounded-xl font-semibold transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-guinda-dark'
              }`}
            >
              {loading ? 'Creando reporte...' : 'Crear Reporte'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

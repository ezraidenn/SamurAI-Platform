/**
 * Report Form Page
 * 
 * Page for citizens to create new reports with map and photo upload.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { createReport, uploadReportPhoto, validatePhotoWithAI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBanStatus } from '../hooks/useBanStatus';

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
  const banStatus = useBanStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageRejection, setImageRejection] = useState(null);
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [strikeData, setStrikeData] = useState(null);
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
    setImageRejection(null);

    try {
      // STEP 1: Validate photo with AI FIRST (if photo provided)
      if (formData.photo) {
        console.log('🔍 Validando foto con IA...');
        
        try {
          const validationResult = await validatePhotoWithAI(
            formData.photo,
            formData.category,
            formData.description
          );
          
          console.log('✅ Foto validada:', validationResult);
          
          // If validation returned AI analysis, show it to user
          if (validationResult.ai_analysis) {
            console.log('📊 Análisis de IA:', validationResult.ai_analysis);
          }
          
        } catch (validationError) {
          // Photo was rejected by AI
          console.error('❌ Foto rechazada:', validationError);
          
          if (validationError.response?.data?.detail?.error === 'invalid_image') {
            const detail = validationError.response.data.detail;
            setStrikeData({
              type: 'image',
              message: detail.professional_feedback || detail.rejection_reason,
              details: detail.ai_analysis?.observed_details,
              isJoke: detail.ai_analysis?.is_joke_or_fake,
              isOffensive: detail.ai_analysis?.is_offensive,
              isInappropriate: detail.ai_analysis?.is_inappropriate,
              strikeIssued: detail.strike_issued,
              strikeCount: detail.strike_count,
              isBanned: detail.is_banned,
              banUntil: detail.ban_until,
              banReason: detail.ban_reason,
              isPermanentBan: detail.is_permanent_ban
            });
            setShowStrikeModal(true);
            setLoading(false);
            return; // STOP HERE - Don't create report
          }
          
          // Check if text is offensive
          if (validationError.response?.data?.detail?.error === 'offensive_text') {
            const detail = validationError.response.data.detail;
            setStrikeData({
              type: 'text',
              message: detail.professional_feedback || detail.rejection_reason,
              detectedWords: detail.detected_words,
              isOffensive: true,
              offenseType: detail.offense_type,
              strikeIssued: detail.strike_issued,
              strikeCount: detail.strike_count,
              isBanned: detail.is_banned,
              banUntil: detail.ban_until,
              banReason: detail.ban_reason,
              isPermanentBan: detail.is_permanent_ban
            });
            setShowStrikeModal(true);
            setLoading(false);
            return;
          }
          
          // Check if user is banned
          if (validationError.response?.data?.detail?.error === 'user_banned') {
            const detail = validationError.response.data.detail;
            setError(detail.message);
            setImageRejection({
              message: detail.reason,
              isBanned: true,
              isPermanentBan: detail.is_permanent,
              banUntil: detail.ban_until,
              timeRemaining: detail.time_remaining,
              strikeCount: detail.strike_count
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLoading(false);
            return;
          }
          
          // If it's another error, throw it
          throw validationError;
        }
      }

      // STEP 2: Create report (only if photo passed validation or no photo)
      console.log('📝 Creando reporte...');
      const reportData = {
        category: formData.category,
        description: formData.description,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
      };

      const createdReport = await createReport(reportData);
      console.log('✅ Reporte creado:', createdReport);

      // STEP 3: Upload photo if provided
      if (formData.photo) {
        console.log('📤 Subiendo foto...');
        await uploadReportPhoto(createdReport.id, formData.photo);
        console.log('✅ Foto subida');
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/panel');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error creating report:', err);
      
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : 'Error al crear el reporte');
      } else {
        setError('Error al crear el reporte. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Strike Modal
  if (showStrikeModal && strikeData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              strikeData.isOffensive ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              <svg className={`w-12 h-12 ${strikeData.isOffensive ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {strikeData.isOffensive ? '🚨 Contenido Ofensivo Detectado' : '⚠️ Contenido No Válido'}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-700 mb-6">
            {strikeData.message}
          </p>

          {/* Strike Warning */}
          {strikeData.strikeIssued && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-bold text-yellow-900 text-lg mb-1">
                    Strike Registrado ({strikeData.strikeCount}/5)
                  </p>
                  <p className="text-sm text-yellow-800">
                    {strikeData.strikeCount >= 5 ? '❌ Tu cuenta ha sido suspendida permanentemente.' :
                     strikeData.strikeCount >= 4 ? '⚠️ Próximo strike = suspensión permanente' :
                     strikeData.strikeCount >= 3 ? '🔒 Tu cuenta ha sido suspendida temporalmente' :
                     strikeData.strikeCount >= 2 ? '⚠️ Próximo strike = suspensión temporal' :
                     '⚠️ Por favor, evita que bloqueemos tu cuenta permanentemente'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ban Notice */}
          {strikeData.isBanned && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
              <p className="font-bold text-red-900 text-lg mb-2">
                {strikeData.isPermanentBan ? '🔒 Suspensión Permanente' : '⏰ Cuenta Suspendida'}
              </p>
              <p className="text-sm text-red-800 mb-2">
                {strikeData.banReason}
              </p>
              {!strikeData.isPermanentBan && strikeData.banUntil && (
                <p className="text-sm text-red-700">
                  Podrás volver a reportar después de que expire la suspensión.
                </p>
              )}
            </div>
          )}

          {/* Button */}
          <button
            onClick={() => {
              setShowStrikeModal(false);
              navigate('/panel');
            }}
            className="w-full py-3 px-6 bg-guinda text-white rounded-lg font-semibold hover:bg-guinda/90 transition-colors"
          >
            Entendido
          </button>
        </motion.div>
      </div>
    );
  }

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

          {/* Ban Banner */}
          {banStatus.isBanned && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {banStatus.isPermanent ? '🔒 Cuenta Suspendida Permanentemente' : '⏰ Tu cuenta está suspendida temporalmente'}
                  </h2>
                  <p className="text-white/90 mb-3">
                    {banStatus.banReason || 'Has acumulado múltiples infracciones en la plataforma.'}
                  </p>
                  
                  {!banStatus.isPermanent && banStatus.timeRemaining && (
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold">
                        ⏱️ Tiempo restante: <span className="text-yellow-300">{banStatus.timeRemaining}</span>
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        Podrás volver a crear reportes cuando expire la suspensión.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm bg-white/10 rounded-lg p-2 inline-block">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Strikes acumulados: <strong>{banStatus.strikeCount}/5</strong></span>
                  </div>
                  
                  <button
                    onClick={() => navigate('/panel')}
                    className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Volver a Mis Reportes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* imageRejection removed - now using modal */}
          {false && imageRejection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 bg-gradient-to-r ${
                imageRejection.isOffensive || imageRejection.isPermanentBan
                  ? 'from-red-100 to-red-50 border-red-500'
                  : 'from-red-50 to-orange-50 border-red-300'
              } border-2 rounded-2xl p-6 shadow-lg`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${
                    imageRejection.isOffensive ? 'bg-red-600' : 'bg-red-500'
                  } rounded-full flex items-center justify-center`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    {imageRejection.isOffensive ? '🚨 Contenido Ofensivo Detectado' :
                     imageRejection.isInappropriate ? '⛔ Contenido Inapropiado' :
                     imageRejection.isJoke ? '🚫 Imagen No Válida Detectada' : 
                     imageRejection.isBanned ? '🔒 Cuenta Suspendida' :
                     '⚠️ Imagen Rechazada'}
                  </h3>
                  
                  <p className="text-red-800 font-medium mb-3">
                    {imageRejection.message}
                  </p>
                  
                  {imageRejection.details && (
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Lo que detectó la IA:</span> {imageRejection.details}
                      </p>
                    </div>
                  )}
                  
                  {/* Strike Warning */}
                  {imageRejection.strikeIssued && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-bold text-yellow-800">
                            ⚠️ Strike Registrado ({imageRejection.strikeCount}/5)
                          </p>
                          <p className="text-sm text-yellow-700">
                            {imageRejection.strikeCount >= 5 ? 'Cuenta suspendida permanentemente' :
                             imageRejection.strikeCount >= 4 ? 'Próximo strike = suspensión permanente' :
                             imageRejection.strikeCount >= 3 ? 'Cuenta suspendida temporalmente' :
                             imageRejection.strikeCount >= 2 ? 'Próximo strike = suspensión temporal' :
                             'Advertencia - evita contenido inapropiado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Ban Notice */}
                  {imageRejection.isBanned && (
                    <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-3">
                      <p className="font-bold text-red-900 mb-1">
                        {imageRejection.isPermanentBan ? '🔒 Suspensión Permanente' : '⏰ Suspensión Temporal'}
                      </p>
                      <p className="text-sm text-red-800">
                        {imageRejection.banReason}
                      </p>
                      {!imageRejection.isPermanentBan && imageRejection.timeRemaining && (
                        <p className="text-sm text-red-700 mt-1">
                          Tiempo restante: {imageRejection.timeRemaining}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!imageRejection.isBanned && (
                    <div className="flex items-center space-x-2 text-sm mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">
                        Por favor, sube una fotografía que muestre claramente el problema reportado.
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setImageRejection(null)}
                    className={`mt-2 px-4 py-2 ${
                      imageRejection.isBanned ? 'bg-gray-600' : 'bg-red-600'
                    } text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm`}
                  >
                    {imageRejection.isBanned ? 'Entendido' : 'Entendido, cambiaré la foto'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-md p-6 space-y-6 ${banStatus.isBanned ? 'opacity-50 pointer-events-none' : ''}`}>
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

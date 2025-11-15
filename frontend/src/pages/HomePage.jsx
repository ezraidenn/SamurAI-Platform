/**
 * HomePage Component
 * 
 * Página de inicio con banner rotativo de reportes recientes
 * y información de contacto del gobierno municipal.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicApprovedReports, getPublicAnnouncements, createAnnouncement } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Iconos SVG para las 4 categorías
const categoryIcons = {
  via_mal_estado: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  infraestructura_danada: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  senalizacion_transito: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  iluminacion_visibilidad: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

function HomePage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'anuncio',
    priority: 3,
    link_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Cargar reportes y anuncios (público, sin autenticación)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsData, announcementsData] = await Promise.all([
          getPublicApprovedReports(5),
          getPublicAnnouncements(10)
        ]);
        setReports(reportsData);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setReports([]);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combinar anuncios y reportes para el banner
  const bannerItems = [...announcements, ...reports];

  // Rotación automática del banner cada 5 segundos
  useEffect(() => {
    if (bannerItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerItems.length]);

  const currentItem = bannerItems[currentIndex];
  const isAnnouncement = currentItem && !currentItem.category; // Los reportes tienen category

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Crear anuncio
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('priority', formData.priority.toString());
      // Solo agregar link_url si tiene valor
      if (formData.link_url && formData.link_url.trim()) {
        formDataToSend.append('link_url', formData.link_url);
      }
      // Solo agregar imagen si existe
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      // Debug: ver qué se está enviando
      console.log('📤 Enviando FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value);
      }

      await createAnnouncement(formDataToSend);
      
      // Recargar anuncios
      const announcementsData = await getPublicAnnouncements(10);
      setAnnouncements(announcementsData);
      
      // Cerrar modal y resetear formulario
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'anuncio',
        priority: 3,
        link_url: ''
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Error al crear anuncio:', err);
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al crear el anuncio';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // Si detail es un array (errores de validación)
        if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg className="w-10 h-10 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Bienvenido a UCU Reporta</h1>
          </div>
          <p className="text-lg text-gray-600">
            Plataforma Ciudadana de Reportes - Municipio de Ucú, Yucatán
          </p>
        </motion.div>

        {/* Banner Rotativo de Reportes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-12"
        >
          <div className="bg-gradient-to-r from-guinda to-guinda-dark p-4">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Reportes Recientes del Municipio</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-guinda mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reportes...</p>
            </div>
          ) : bannerItems.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">
                No hay contenido disponible en este momento
              </p>
            </div>
          ) : (
            <div className="relative h-[500px] md:h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  {/* Layout con imagen o sin imagen */}
                  <div className={`h-full ${currentItem?.image_url || currentItem?.photo_url ? 'grid md:grid-cols-2 gap-0' : 'flex items-center justify-center'}`}>
                    
                    {/* Imagen (si existe) */}
                    {(currentItem?.image_url || currentItem?.photo_url) && (
                      <div className="relative h-64 md:h-full overflow-hidden">
                        <img
                          src={currentItem?.image_url || currentItem?.photo_url}
                          alt={currentItem?.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="p-8 md:p-12 flex flex-col justify-between h-full">
                      <div>
                        {/* Badge y fecha */}
                        <div className="flex items-center justify-between mb-6">
                          {isAnnouncement ? (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-full shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              <span className="text-sm font-bold uppercase tracking-wide">
                                {currentItem?.type || 'ANUNCIO'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-guinda to-guinda-dark text-white px-5 py-2.5 rounded-full shadow-lg">
                              <div className="w-5 h-5">
                                {categoryIcons[currentItem?.category] || categoryIcons['via_mal_estado']}
                              </div>
                              <span className="text-sm font-bold uppercase tracking-wide">
                                {currentItem?.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'REPORTE'}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-500 text-sm font-medium">
                            {new Date(currentItem?.created_at).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Título */}
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {currentItem?.title || 'Sin título'}
                        </h3>

                        {/* Descripción */}
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                          {currentItem?.description?.substring(0, 150)}
                          {currentItem?.description?.length > 150 ? '...' : ''}
                        </p>

                        {/* Metadata */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">Municipio de Ucú, Yucatán</span>
                          </div>

                          {!isAnnouncement && (
                            <div className="flex items-center text-gray-600">
                              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Reportado por ciudadano</span>
                            </div>
                          )}
                          {isAnnouncement && currentItem?.creator_name && (
                            <div className="flex items-center text-gray-600">
                              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Publicado por: {currentItem.creator_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón Ver Más y Navegación */}
                      <div className="space-y-4">
                        <button
                          onClick={() => {
                            setSelectedItem(currentItem);
                            setShowDetailModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-guinda to-guinda-dark hover:from-guinda-dark hover:to-guinda text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                        >
                          <span>Ver Detalles Completos</span>
                          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>

                        {/* Indicadores de navegación */}
                        <div className="flex justify-center items-center space-x-2">
                      {bannerItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'w-8 bg-guinda'
                              : 'w-3 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Ir al reporte ${index + 1}`}
                        />
                      ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Información de Contacto del Gobierno */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg className="w-8 h-8 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h2 className="text-3xl font-bold text-guinda">Información de Contacto</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Presidencia Municipal</h3>
                  <p className="text-gray-600">
                    Calle Principal #123<br />
                    Centro, Ucú, Yucatán<br />
                    C.P. 97400
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Teléfonos</h3>
                  <p className="text-gray-600">
                    Oficina: (999) 123-4567<br />
                    Emergencias: 911<br />
                    WhatsApp: (999) 987-6543
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Correo Electrónico</h3>
                  <p className="text-gray-600">
                    contacto@ucu.gob.mx<br />
                    atencionciudadana@ucu.gob.mx
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Horario de Atención</h3>
                  <p className="text-gray-600">
                    Lunes a Viernes<br />
                    8:00 AM - 3:00 PM<br />
                    (Horario continuo)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Redes Sociales</h3>
                  <p className="text-gray-600">
                    Facebook: /MunicipioUcu<br />
                    Twitter: @UcuGobierno<br />
                    Instagram: @municipio_ucu
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Transparencia</h3>
                  <p className="text-gray-600">
                    Portal de Transparencia<br />
                    www.ucu.gob.mx/transparencia<br />
                    Solicitudes de Información
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Esta es información de contacto de ejemplo con fines demostrativos. 
              Para información oficial, consulte los canales oficiales del gobierno municipal.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-gray-500"
        >
          <p className="text-sm">© 2024 Municipio de Ucú, Yucatán - Todos los derechos reservados</p>
        </motion.div>
      </div>

      {/* Botón flotante para crear anuncios (solo admin/supervisor) */}
      {user && (user.role === 'admin' || user.role === 'supervisor') && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 bg-guinda hover:bg-guinda-dark text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden md:inline font-semibold">Crear Anuncio</span>
        </button>
      )}

      {/* Modal para crear anuncio */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Anuncio</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    minLength={5}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                    placeholder="Título del anuncio"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent resize-none"
                    placeholder="Descripción detallada del anuncio"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                  >
                    <option value="anuncio">Anuncio</option>
                    <option value="aviso">Aviso</option>
                    <option value="reporte">Reporte Especial</option>
                  </select>
                </div>

                {/* Subir Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-guinda file:text-white hover:file:bg-guinda-dark"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
                  </p>
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Enlace Externo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace Externo (opcional)
                  </label>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                    placeholder="https://ejemplo.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega un enlace para más información
                  </p>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad (1-5) *
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    min={1}
                    max={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Mayor prioridad = aparece primero en el banner
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-6 py-3 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creando...' : 'Crear Anuncio'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalles Completos */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Imagen destacada (si existe) */}
              {(selectedItem.image_url || selectedItem.photo_url) && (
                <div className="relative h-80 overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedItem.image_url || selectedItem.photo_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-colors shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Contenido */}
              <div className="p-8">
                {/* Header sin imagen */}
                {!(selectedItem.image_url || selectedItem.photo_url) && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Detalles Completos</h2>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Badge */}
                <div className="mb-4">
                  {!selectedItem.category ? (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-bold uppercase">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      {selectedItem.type || 'ANUNCIO'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-guinda to-guinda-dark text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-bold uppercase">
                      <div className="w-5 h-5">
                        {categoryIcons[selectedItem.category] || categoryIcons['via_mal_estado']}
                      </div>
                      {selectedItem.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedItem.title}</h1>

                {/* Fecha */}
                <p className="text-gray-500 mb-6">
                  {new Date(selectedItem.created_at).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {/* Descripción completa */}
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="border-t pt-6 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Municipio de Ucú, Yucatán</span>
                  </div>

                  {selectedItem.creator_name && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Publicado por: <strong>{selectedItem.creator_name}</strong></span>
                    </div>
                  )}

                  {selectedItem.priority && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Prioridad: <strong>{selectedItem.priority}/5</strong></span>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="mt-8 space-y-3">
                  {selectedItem.link_url && (
                    <a
                      href={selectedItem.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-guinda to-guinda-dark hover:from-guinda-dark hover:to-guinda text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <span>Ver Más Información</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;

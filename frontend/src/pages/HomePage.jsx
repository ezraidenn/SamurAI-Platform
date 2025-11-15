/**
 * HomePage Component
 * 
 * Página de inicio con banner rotativo de reportes recientes
 * y información de contacto del gobierno municipal.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicApprovedReports } from '../services/api';

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
  const [reports, setReports] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar reportes recientes aprobados (público, sin autenticación)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getPublicApprovedReports(5);
        setReports(data);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
        // Si hay error, simplemente no mostrar reportes
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Rotación automática del banner cada 5 segundos
  useEffect(() => {
    if (reports.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reports.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reports.length]);

  const currentReport = reports[currentIndex];

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
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">
                No hay reportes disponibles en este momento
              </p>
            </div>
          ) : (
            <div className="relative h-96">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 p-8"
                >
                  <div className="h-full flex flex-col justify-between">
                    {/* Contenido del reporte */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 bg-guinda text-white px-4 py-2 rounded-full">
                          <div className="w-5 h-5">
                            {categoryIcons[currentReport?.category] || categoryIcons['via_mal_estado']}
                          </div>
                          <span className="text-sm font-semibold">
                            {currentReport?.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {new Date(currentReport?.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {currentReport?.title || 'Sin título'}
                      </h3>

                      <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        {currentReport?.description?.substring(0, 200)}
                        {currentReport?.description?.length > 200 ? '...' : ''}
                      </p>

                      <div className="flex items-center text-gray-600 mb-2">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Municipio de Ucú, Yucatán</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Reportado por ciudadano de Ucú</span>
                      </div>
                    </div>

                    {/* Indicadores de navegación */}
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      {reports.map((_, index) => (
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
    </div>
  );
}

export default HomePage;

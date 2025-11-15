/**
 * HomePage Component
 * 
 * Página de inicio con banner rotativo de reportes recientes
 * y información de contacto del gobierno municipal.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicApprovedReports } from '../services/api';

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏛️ Bienvenido a UCU Reporta
          </h1>
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
            <h2 className="text-2xl font-bold text-white text-center">
              📢 Reportes Recientes del Municipio
            </h2>
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
                        <span className="inline-block bg-guinda text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {currentReport?.category || 'General'}
                        </span>
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

                      {currentReport?.location && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <span className="mr-2">📍</span>
                          <span>{currentReport.location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">👤</span>
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
          <h2 className="text-3xl font-bold text-guinda mb-6 text-center">
            📞 Información de Contacto
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-guinda/10 p-3 rounded-lg">
                  <span className="text-2xl">🏛️</span>
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
                  <span className="text-2xl">📞</span>
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
                  <span className="text-2xl">📧</span>
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
                  <span className="text-2xl">🕐</span>
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
                  <span className="text-2xl">🌐</span>
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
                  <span className="text-2xl">ℹ️</span>
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

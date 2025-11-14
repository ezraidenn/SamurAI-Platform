/**
 * Landing Page
 * 
 * Professional landing page for UCU Reporta platform.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    {
      icon: '📱',
      title: 'Reporta Fácilmente',
      description: 'Envía reportes de problemas urbanos en segundos desde tu dispositivo móvil o computadora.',
    },
    {
      icon: '🗺️',
      title: 'Geolocalización',
      description: 'Marca la ubicación exacta del problema en un mapa interactivo para una atención precisa.',
    },
    {
      icon: '📸',
      title: 'Adjunta Evidencias',
      description: 'Agrega fotos para documentar mejor el problema y facilitar su resolución.',
    },
    {
      icon: '📊',
      title: 'Seguimiento en Tiempo Real',
      description: 'Consulta el estado de tus reportes: pendiente, en proceso o resuelto.',
    },
    {
      icon: '⚡',
      title: 'Priorización Inteligente',
      description: 'Sistema automático que detecta emergencias y asigna prioridades según urgencia.',
    },
    {
      icon: '🏛️',
      title: 'Dashboard Administrativo',
      description: 'Herramientas completas para que los municipios gestionen reportes eficientemente.',
    },
  ];

  const categories = [
    { emoji: '🕳️', name: 'Baches', color: 'bg-orange-100' },
    { emoji: '💡', name: 'Alumbrado', color: 'bg-yellow-100' },
    { emoji: '🗑️', name: 'Basura', color: 'bg-green-100' },
    { emoji: '🚰', name: 'Drenaje', color: 'bg-blue-100' },
    { emoji: '🚦', name: 'Vialidad', color: 'bg-purple-100' },
  ];

  const stats = [
    { number: '100%', label: 'Gratis' },
    { number: '24/7', label: 'Disponible' },
    { number: '<1min', label: 'Para Reportar' },
    { number: '🇲🇽', label: 'Hecho en México' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda via-guinda-dark to-guinda">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">UCU Reporta</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-white/80 transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-guinda px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Tu Municipio,
                <br />
                <span className="text-yellow-300">Más Conectado</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Reporta problemas urbanos y da seguimiento en tiempo real.
                Ayuda a construir un municipio mejor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-guinda px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Comenzar Ahora →
                </Link>
                <Link
                  to="/login"
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all"
                >
                  Ver Demo
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-guinda mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa para conectar ciudadanos con su gobierno local
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-guinda mb-4">
              Categorías de Reportes
            </h2>
            <p className="text-xl text-gray-600">
              Reporta cualquier problema urbano que encuentres
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${category.color} px-6 py-4 rounded-full flex items-center space-x-3 shadow-md hover:shadow-lg transition-shadow`}
              >
                <span className="text-3xl">{category.emoji}</span>
                <span className="font-semibold text-gray-800">{category.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-guinda mb-4">
              Proceso Simple en 3 Pasos
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Regístrate',
                description: 'Crea tu cuenta con tu CURP en menos de 1 minuto.',
                icon: '👤',
              },
              {
                step: '2',
                title: 'Reporta',
                description: 'Selecciona la categoría, describe el problema y marca la ubicación en el mapa.',
                icon: '📝',
              },
              {
                step: '3',
                title: 'Da Seguimiento',
                description: 'Consulta el estado de tu reporte y recibe actualizaciones cuando sea resuelto.',
                icon: '✅',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-8"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-guinda text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl">{item.icon}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-guinda to-guinda-dark py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para Hacer la Diferencia?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Únete a miles de ciudadanos que están ayudando a mejorar su municipio
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-guinda px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              Crear Cuenta Gratis
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">UCU Reporta</h3>
              <p className="text-gray-400">
                Plataforma digital para reportar problemas urbanos y mejorar tu municipio.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">
                Para soporte técnico o preguntas:
                <br />
                <a href="mailto:soporte@ucureporta.gob.mx" className="hover:text-white transition-colors">
                  soporte@ucureporta.gob.mx
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UCU Reporta. Hecho con ❤️ para los municipios de Yucatán.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

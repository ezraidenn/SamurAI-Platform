/**
 * Settings Page
 * 
 * User preferences and account settings.
 * Includes notifications, appearance, privacy, and account management.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    notifyReportReceived: true,
    notifyReportInProgress: true,
    notifyReportResolved: true,
    notifyReportRejected: true,
    notifyNewComment: true,
    notifyNameChangeResponse: true,
    notifyStrike: true,

    // Privacy
    reportsPublic: true,

    // Account
    language: 'es',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load from localStorage (fallback)
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save to localStorage (fallback)
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // TODO: Save to backend when endpoint is ready
      // await updateUserSettings(settings);

      setMessage({ type: 'success', text: '✅ Configuración guardada exitosamente' });
      setHasChanges(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error al guardar configuración' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    alert('Funcionalidad de exportación en desarrollo');
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      '⚠️ ¿Estás seguro de que deseas eliminar tu cuenta?\n\n' +
      'Esta acción es PERMANENTE y no se puede deshacer.\n' +
      'Se eliminarán todos tus reportes, comentarios y datos personales.'
    );

    if (confirmed) {
      const doubleConfirm = confirm(
        '🚨 ÚLTIMA CONFIRMACIÓN\n\n' +
        'Escribe "ELIMINAR" en el siguiente prompt para confirmar.'
      );

      if (doubleConfirm) {
        const typed = prompt('Escribe "ELIMINAR" para confirmar:');
        if (typed === 'ELIMINAR') {
          // TODO: Implement account deletion
          alert('Funcionalidad de eliminación en desarrollo');
        }
      }
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'privacy', label: 'Privacidad', icon: '🔒' },
    { id: 'account', label: 'Cuenta', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuración</h1>
          <p className="mt-2 text-gray-600">
            Personaliza tu experiencia en UCU Reporta
          </p>
        </motion.div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-guinda text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      🔔 Notificaciones
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Configura cómo y cuándo quieres recibir notificaciones
                    </p>
                  </div>

                  {/* Channels */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Canales de notificación</h3>
                    
                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">📧 Email</div>
                        <div className="text-sm text-gray-600">Recibir notificaciones por correo electrónico</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">🔔 Push</div>
                        <div className="text-sm text-gray-600">Notificaciones en el navegador</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">📱 SMS</div>
                        <div className="text-sm text-gray-600">Mensajes de texto (próximamente)</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        disabled
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda opacity-50"
                      />
                    </label>
                  </div>

                  {/* Event Types */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-medium text-gray-900">Tipos de eventos</h3>
                    
                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Reporte recibido</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyReportReceived}
                        onChange={(e) => handleSettingChange('notifyReportReceived', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Reporte en proceso</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyReportInProgress}
                        onChange={(e) => handleSettingChange('notifyReportInProgress', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Reporte resuelto</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyReportResolved}
                        onChange={(e) => handleSettingChange('notifyReportResolved', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Reporte rechazado</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyReportRejected}
                        onChange={(e) => handleSettingChange('notifyReportRejected', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Nuevos comentarios</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyNewComment}
                        onChange={(e) => handleSettingChange('notifyNewComment', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Respuesta de cambio de nombre</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyNameChangeResponse}
                        onChange={(e) => handleSettingChange('notifyNameChangeResponse', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="text-sm text-gray-900">Strikes recibidos</div>
                      <input
                        type="checkbox"
                        checked={settings.notifyStrike}
                        onChange={(e) => handleSettingChange('notifyStrike', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      🔒 Privacidad
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Controla quién puede ver tu información
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Reportes públicos</div>
                        <div className="text-sm text-gray-600">
                          Permitir que otros usuarios vean tus reportes en el mapa comunitario
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.reportsPublic}
                        onChange={(e) => handleSettingChange('reportsPublic', e.target.checked)}
                        className="w-5 h-5 text-guinda rounded focus:ring-guinda"
                      />
                    </label>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2">ℹ️</span>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Sobre tu privacidad</p>
                          <p>
                            Tus datos personales (nombre, email, CURP) nunca se comparten públicamente.
                            Solo el municipio puede ver tu información de contacto.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      👤 Cuenta
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Gestiona tu cuenta y datos personales
                    </p>
                  </div>

                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rol:</span>
                      <span className="text-sm font-medium text-gray-900">{user?.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Miembro desde:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user?.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Idioma</h3>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                    >
                      <option value="es">🇲🇽 Español</option>
                      <option value="en" disabled>🇺🇸 English (Próximamente)</option>
                    </select>
                  </div>

                  {/* Data Management */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-medium text-gray-900">Gestión de datos</h3>
                    
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">📥 Exportar mis datos</div>
                          <div className="text-sm text-gray-600">Descargar toda tu información en formato JSON</div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="space-y-4 pt-6 border-t border-red-200">
                    <h3 className="font-medium text-red-600">⚠️ Zona de peligro</h3>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left"
                    >
                      <div>
                        <div className="font-medium">🗑️ Eliminar cuenta</div>
                        <div className="text-sm text-red-600">
                          Esta acción es permanente y no se puede deshacer
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t"
                >
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Guardando...' : '💾 Guardar cambios'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

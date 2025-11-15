/**
 * Name Change Request Modal
 * 
 * Modal for users to request a name change.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NameChangeModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    requested_name: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.requested_name.trim()) {
      newErrors.requested_name = 'El nombre es requerido';
    } else if (formData.requested_name.trim().length < 2) {
      newErrors.requested_name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'La razón es requerida';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'La razón debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      setFormData({ requested_name: '', reason: '' });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({ requested_name: '', reason: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Solicitar Cambio de Nombre
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Requested Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Nombre *
              </label>
              <input
                type="text"
                value={formData.requested_name}
                onChange={(e) => setFormData({ ...formData, requested_name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent ${
                  errors.requested_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu nuevo nombre completo"
              />
              {errors.requested_name && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_name}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón del Cambio * (mínimo 10 caracteres)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent resize-none ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explica por qué necesitas cambiar tu nombre..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.reason ? (
                  <p className="text-sm text-red-600">{errors.reason}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {formData.reason.length}/500 caracteres
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información Importante</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tu solicitud será revisada por un administrador</li>
                <li>• Recibirás una respuesta en un plazo de 3-5 días hábiles</li>
                <li>• Debes proporcionar una razón válida para el cambio</li>
                <li>• Solo puedes tener una solicitud pendiente a la vez</li>
              </ul>
            </div>

            {/* Demo Mode Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                💡 <span className="font-medium">Modo Demostración:</span> Si el servidor no está disponible, 
                la solicitud se simulará localmente para fines de demostración.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-guinda text-white rounded-lg hover:bg-guinda-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

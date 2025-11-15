/**
 * Registrar Negocio Page
 * 
 * Formulario para registrar un nuevo negocio/POI.
 * Con pre-validación IA.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { uploadPOIPhoto, preValidatePOI, createPOI } from '../services/api';
import MapPicker from '../components/MapPicker';

export default function RegistrarNegocioPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    latitude: 21.0317,
    longitude: -89.7464,
    telefono: '',
    whatsapp: '',
    email: '',
    photo_url: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [iaResult, setIaResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const result = await uploadPOIPhoto(file);
      setFormData({ ...formData, photo_url: result.photo_url });
    } catch (err) {
      setError('Error al subir la foto');
    }
  };

  const handlePreValidate = async () => {
    if (!formData.nombre || !formData.direccion) {
      setError('Por favor completa al menos el nombre y la dirección');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const result = await preValidatePOI({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        direccion: formData.direccion,
        telefono: formData.telefono,
        photo_url: formData.photo_url
      });

      setIaResult(result);
    } catch (err) {
      setError('Error en la validación IA');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createPOI(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/negocios');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar el negocio');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            ¡Negocio Registrado!
          </h2>
          <p className="text-gray-600">
            Tu negocio está siendo validado...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-guinda mb-2">
            🏪 Registrar Negocio
          </h1>
          <p className="text-gray-600 mb-6">
            Registra tu negocio o un lugar de interés en Ucú
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
              placeholder="Ej: Abarrotes Doña María"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
              placeholder="Describe tu negocio, productos, servicios, promociones..."
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <input
              type="text"
              required
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
              placeholder="Ej: Calle 20 x 15 y 17, Centro"
            />
          </div>

          {/* Ubicación en Mapa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Ubicación en el Mapa *
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Marca la ubicación exacta de tu negocio en el mapa. Puedes usar tu ubicación actual o buscar manualmente.
            </p>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <MapPicker
                value={{ lat: formData.latitude, lng: formData.longitude }}
                onChange={(location) => {
                  setFormData({
                    ...formData,
                    latitude: location.lat,
                    longitude: location.lng
                  });
                }}
                showUserLocation={true}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📌 Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </p>
          </div>

          {/* Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                placeholder="999-123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                placeholder="999-123-4567"
              />
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Negocio
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="mt-4 w-full h-64 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Pre-validación IA */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={handlePreValidate}
              disabled={validating}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {validating ? '🤖 Validando con IA...' : '🤖 Pre-validar con IA'}
            </button>

            {iaResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  iaResult.approved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <h3 className="font-bold mb-2">
                  {iaResult.approved ? '✅ Validación IA Aprobada' : '❌ Requiere Correcciones'}
                </h3>
                
                {iaResult.categoria && (
                  <p className="text-sm mb-2">
                    <strong>Categoría detectada:</strong> {iaResult.categoria}
                    {iaResult.subcategoria && ` → ${iaResult.subcategoria}`}
                  </p>
                )}

                {iaResult.warnings?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">⚠️ Advertencias:</p>
                    <ul className="text-sm list-disc list-inside">
                      {iaResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {iaResult.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Razón:</strong> {iaResult.rejection_reason}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (iaResult && !iaResult.approved)}
            className="w-full bg-guinda hover:bg-guinda-dark text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Registrando...' : '✅ Registrar Negocio'}
          </button>
        </form>
      </div>
    </div>
  );
}

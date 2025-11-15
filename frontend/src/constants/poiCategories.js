/**
 * Categorías de Puntos de Interés
 * 
 * Definición centralizada de categorías y subcategorías para POIs.
 */

export const POI_CATEGORIES = {
  tienda: {
    label: '🏪 Tienda',
    color: '#10B981', // green
    subcategorias: ['Abarrotes', 'Ropa', 'Electrónica', 'Ferretería', 'Papelería', 'Otro']
  },
  supermercado: {
    label: '🛒 Supermercado',
    color: '#3B82F6', // blue
    subcategorias: ['Cadena', 'Local']
  },
  restaurante: {
    label: '🍽️ Restaurante',
    color: '#EF4444', // red
    subcategorias: ['Comida Yucateca', 'Tacos', 'Pizza', 'Mariscos', 'Internacional', 'Otro']
  },
  cafe: {
    label: '☕ Café',
    color: '#92400E', // brown
    subcategorias: ['Café', 'Panadería', 'Postres']
  },
  salud: {
    label: '🏥 Salud',
    color: '#DC2626', // red-600
    subcategorias: ['Clínica', 'Farmacia', 'Consultorio', 'Laboratorio', 'Dentista', 'Otro']
  },
  educacion: {
    label: '🎓 Educación',
    color: '#7C3AED', // purple
    subcategorias: ['Escuela', 'Kinder', 'Universidad', 'Academia', 'Biblioteca']
  },
  belleza: {
    label: '💇 Belleza',
    color: '#EC4899', // pink
    subcategorias: ['Peluquería', 'Estética', 'Spa', 'Barbería']
  },
  taller: {
    label: '🔧 Taller',
    color: '#F59E0B', // amber
    subcategorias: ['Mecánico', 'Electrónica', 'Carpintería', 'Plomería', 'Otro']
  },
  oficina: {
    label: '🏢 Oficina',
    color: '#6366F1', // indigo
    subcategorias: ['Abogado', 'Contador', 'Arquitecto', 'Notaría', 'Otro']
  },
  financiero: {
    label: '🏦 Financiero',
    color: '#059669', // emerald
    subcategorias: ['Banco', 'Cajero', 'Casa de Cambio', 'Cooperativa']
  },
  gobierno: {
    label: '🏛️ Gobierno',
    color: '#1E40AF', // blue-800
    subcategorias: ['Oficina Municipal', 'Policía', 'Bomberos', 'Correos']
  },
  deporte: {
    label: '⚽ Deporte',
    color: '#16A34A', // green-600
    subcategorias: ['Gimnasio', 'Cancha', 'Parque Deportivo']
  },
  entretenimiento: {
    label: '🎭 Entretenimiento',
    color: '#DB2777', // pink-600
    subcategorias: ['Cine', 'Teatro', 'Eventos', 'Juegos']
  },
  religion: {
    label: '⛪ Religioso',
    color: '#7E22CE', // purple-700
    subcategorias: ['Iglesia', 'Templo', 'Capilla']
  },
  parque: {
    label: '🌳 Parque',
    color: '#15803D', // green-700
    subcategorias: ['Parque', 'Plaza', 'Jardín']
  },
  gasolinera: {
    label: '⛽ Gasolinera',
    color: '#EA580C', // orange-600
    subcategorias: ['Gasolinera', 'Gas LP']
  },
  hotel: {
    label: '🏨 Hospedaje',
    color: '#0891B2', // cyan-600
    subcategorias: ['Hotel', 'Hostal', 'Posada']
  },
  otro: {
    label: '📍 Otro',
    color: '#6B7280', // gray-500
    subcategorias: []
  }
};

// Estados de POI
export const POI_STATUS = {
  draft: {
    label: '📝 Borrador',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  },
  pending_ia: {
    label: '🤖 Validando con IA...',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  approved_ia: {
    label: '⏳ Pendiente de validación',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  rejected_ia: {
    label: '⚠️ Requiere correcciones',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  approved: {
    label: '✅ Aprobado',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  rejected: {
    label: '❌ Rechazado',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  }
};

// Niveles de spam
export const SPAM_LEVELS = {
  none: {
    label: 'Sin promociones',
    color: 'green',
    icon: '✅'
  },
  low: {
    label: 'Promociones sutiles',
    color: 'green',
    icon: '✅'
  },
  medium: {
    label: 'Promociones moderadas',
    color: 'yellow',
    icon: '⚠️'
  },
  high: {
    label: 'Spam excesivo',
    color: 'red',
    icon: '❌'
  }
};

// Obtener info de categoría
export const getCategoryInfo = (categoria) => {
  return POI_CATEGORIES[categoria] || POI_CATEGORIES.otro;
};

// Obtener info de estado
export const getStatusInfo = (status) => {
  return POI_STATUS[status] || POI_STATUS.draft;
};

// Obtener info de spam level
export const getSpamLevelInfo = (level) => {
  return SPAM_LEVELS[level] || SPAM_LEVELS.none;
};

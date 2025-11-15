/**
 * Utilidad para formatear nombres de categorías
 */

// Mapeo de categorías a nombres legibles
const CATEGORY_NAMES = {
  via_mal_estado: 'Vía en mal estado',
  infraestructura_danada: 'Infraestructura dañada',
  senalizacion_transito: 'Señalización y tránsito',
  iluminacion_visibilidad: 'Iluminación y visibilidad',
};

/**
 * Convierte el nombre técnico de una categoría a su nombre legible
 * @param {string} category - Nombre técnico (ej: 'via_mal_estado')
 * @returns {string} - Nombre legible (ej: 'Vía en mal estado')
 */
export const formatCategoryName = (category) => {
  return CATEGORY_NAMES[category] || category;
};

/**
 * Obtiene todas las categorías con sus nombres legibles
 * @returns {Array} - Array de objetos {id, name}
 */
export const getAllCategories = () => {
  return Object.entries(CATEGORY_NAMES).map(([id, name]) => ({
    id,
    name,
  }));
};

export default {
  formatCategoryName,
  getAllCategories,
  CATEGORY_NAMES,
};

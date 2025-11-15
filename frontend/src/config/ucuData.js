/**
 * Datos de validación para el municipio de Ucú, Yucatán
 * 
 * Contiene códigos postales válidos y colonias/localidades del municipio
 */

// Códigos postales válidos para Ucú, Yucatán
export const CODIGOS_POSTALES_UCU = [
  '97357', // Código postal principal de Ucú
  '97350', // Código postal alternativo
  '97358', // Código postal de algunas colonias
  '97359', // Código postal de localidades
];

/**
 * Valida si un código postal pertenece a Ucú
 * @param {string} codigoPostal - Código postal a validar
 * @returns {boolean} - true si es válido, false si no
 */
export function validarCodigoPostalUcu(codigoPostal) {
  return CODIGOS_POSTALES_UCU.includes(codigoPostal.trim());
}

/**
 * Obtiene el mensaje de error para código postal inválido
 * @returns {string} - Mensaje de error
 */
export function getMensajeErrorCP() {
  return `El código postal debe ser ${CODIGOS_POSTALES_UCU.join(' o ')} (municipio de Ucú)`;
}


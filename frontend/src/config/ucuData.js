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

// Colonias y localidades del municipio de Ucú
// Ucú es un municipio pequeño con pocas localidades
export const COLONIAS_UCU = [
  'Centro',
  'Cholul',
  'San Antonio Kaua',
  'San José Tzal',
  'Santa Cruz',
  'Xcunyá',
].sort();

/**
 * Valida si un código postal pertenece a Ucú
 * @param {string} codigoPostal - Código postal a validar
 * @returns {boolean} - true si es válido, false si no
 */
export function validarCodigoPostalUcu(codigoPostal) {
  return CODIGOS_POSTALES_UCU.includes(codigoPostal.trim());
}

/**
 * Valida si una colonia pertenece a Ucú
 * @param {string} colonia - Colonia a validar
 * @returns {boolean} - true si es válida, false si no
 */
export function validarColoniaUcu(colonia) {
  return COLONIAS_UCU.includes(colonia);
}

/**
 * Obtiene el mensaje de error para código postal inválido
 * @returns {string} - Mensaje de error
 */
export function getMensajeErrorCP() {
  return `El código postal debe ser ${CODIGOS_POSTALES_UCU.join(' o ')} (municipio de Ucú)`;
}

/**
 * Obtiene el mensaje de error para colonia inválida
 * @returns {string} - Mensaje de error
 */
export function getMensajeErrorColonia() {
  return 'La colonia seleccionada no pertenece al municipio de Ucú';
}

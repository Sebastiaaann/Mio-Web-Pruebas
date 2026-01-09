// utils/formateadores.js

/**
 * Formatea RUT chileno al formato XX.XXX.XXX-X
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 * @example
 * formatearRut('12345678K') // "12.345.678-K"
 * formatearRut('123456789') // "12.345.678-9"
 */
export function formatearRut(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  if (rutLimpio.length < 2) return rut;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  // Formato: 12.345.678-9
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

/**
 * Formatea número de teléfono chileno
 * @param {string} telefono - Número sin formato
 * @returns {string} Formato: +56 9 1234 5678
 * @example
 * formatearTelefono('912345678') // "+56 9 1234 5678"
 * formatearTelefono('221234567') // "+56 22 1234 567"
 */
export function formatearTelefono(telefono) {
  const limpio = telefono.replace(/\D/g, '');
  
  // Móvil: +56 9 XXXX XXXX
  if (limpio.length === 9 && limpio.startsWith('9')) {
    return `+56 ${limpio[0]} ${limpio.slice(1, 5)} ${limpio.slice(5)}`;
  }
  
  // Fijo Santiago: +56 22 XXXX XXX
  if (limpio.length === 9 && limpio.startsWith('2')) {
    return `+56 ${limpio.slice(0, 2)} ${limpio.slice(2, 6)} ${limpio.slice(6)}`;
  }
  
  return telefono;
}

/**
 * Formatea número como moneda chilena (CLP)
 * @param {number} monto - Monto a formatear
 * @returns {string} Formato: $1.234.567
 * @example
 * formatearMoneda(1234567) // "$1.234.567"
 * formatearMoneda(1500.50) // "$1.501"
 */
export function formatearMoneda(monto) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(monto);
}

/**
 * Formatea fecha a formato chileno DD/MM/YYYY
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Formato: 09/01/2026
 * @example
 * formatearFecha(new Date('2026-01-09')) // "09/01/2026"
 * formatearFecha('2026-01-09') // "09/01/2026"
 */
export function formatearFecha(fecha) {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Intl.DateTimeFormat('es-CL').format(fechaObj);
}

/**
 * Formatea fecha con hora en formato chileno
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Formato: 09/01/2026, 14:30
 * @example
 * formatearFechaHora(new Date()) // "09/01/2026, 14:30"
 */
export function formatearFechaHora(fecha) {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fechaObj);
}

/**
 * Limpia formato de RUT dejando solo números y K
 * @param {string} rut - RUT con o sin formato
 * @returns {string} RUT sin formato
 * @example
 * limpiarRut('12.345.678-K') // "12345678K"
 */
export function limpiarRut(rut) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Limpia número de teléfono dejando solo dígitos
 * @param {string} telefono - Teléfono con o sin formato
 * @returns {string} Solo dígitos
 * @example
 * limpiarTelefono('+56 9 1234 5678') // "912345678"
 */
export function limpiarTelefono(telefono) {
  return telefono.replace(/\D/g, '');
}
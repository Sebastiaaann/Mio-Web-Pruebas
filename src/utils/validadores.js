// utils/validadores.js

/**
 * Valida RUT chileno con dígito verificador
 * @param {string} rut - RUT en formato XX.XXX.XXX-X o sin formato
 * @returns {boolean} true si es válido
 * @example
 * validarRut('12.345.678-5') // true
 * validarRut('12345678-5') // true
 * validarRut('12.345.678-K') // depende del cálculo
 */
export function validarRut(rut) {
  // Limpiar formato - solo números y K
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 2) return false;
  
  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();
  
  // Calcular dígito verificador esperado
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : String(dvEsperado);
  
  return dv === dvFinal;
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 * @example
 * validarEmail('usuario@ejemplo.cl') // true
 * validarEmail('invalido@') // false
 */
export function validarEmail(email) {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email);
}

/**
 * Valida número de teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si es válido
 * @example
 * validarTelefono('912345678') // true (móvil)
 * validarTelefono('221234567') // true (fijo Santiago)
 * validarTelefono('12345') // false
 */
export function validarTelefono(telefono) {
  const limpio = telefono.replace(/\D/g, '');
  
  // Móvil: 9 dígitos comenzando con 9
  if (limpio.length === 9 && limpio.startsWith('9')) return true;
  
  // Fijo: 9 dígitos comenzando con 2
  if (limpio.length === 9 && limpio.startsWith('2')) return true;
  
  return false;
}

/**
 * Valida rango numérico
 * @param {number} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si está en rango
 * @example
 * validarRango(50, 0, 100) // true
 * validarRango(150, 0, 100) // false
 */
export function validarRango(valor, min, max) {
  return valor >= min && valor <= max;
}

/**
 * Valida longitud de texto
 * @param {string} texto - Texto a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean} true si está en rango
 * @example
 * validarLongitud('Hola', 2, 10) // true
 * validarLongitud('H', 2, 10) // false
 */
export function validarLongitud(texto, min, max) {
  const longitud = texto.length;
  return longitud >= min && longitud <= max;
}

// Re-exportar funciones de RUT desde rutValidator para consolidar en un solo archivo
// Esto mantiene compatibilidad con imports existentes
export {
  limpiarRut,
  calcularDv,
  formatearRut,
  formatRutOnInput,
  obtenerNumeroRut,
  obtenerDvRut,
  validarYFormatearRut,
  validateRut,
  formatRut,
  cleanRut,
  calculateDv
} from './rutValidator.js';
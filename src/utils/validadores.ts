// utils/validadores.ts

/**
 * Valida RUT chileno con dígito verificador
 */
export function validarRut(rut: string): boolean {
  // Limpiar formato - solo números y K
  const rutLimpio = rut.replace(/[^0-9kK]/g, '')

  if (rutLimpio.length < 2) return false

  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1).toLowerCase()

  // Calcular dígito verificador esperado
  let suma = 0
  let multiplicador = 2

  for (let i = numero.length - 1; i >= 0; i--) {
    suma += Number.parseInt(numero[i], 10) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const dvEsperado = 11 - (suma % 11)
  const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : String(dvEsperado)

  return dv === dvFinal
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)
}

/**
 * Valida número de teléfono chileno
 */
export function validarTelefono(telefono: string): boolean {
  const limpio = telefono.replace(/\D/g, '')

  // Móvil: 9 dígitos comenzando con 9
  if (limpio.length === 9 && limpio.startsWith('9')) return true

  // Fijo: 9 dígitos comenzando con 2
  if (limpio.length === 9 && limpio.startsWith('2')) return true

  return false
}

/**
 * Valida rango numérico
 */
export function validarRango(valor: number, min: number, max: number): boolean {
  return valor >= min && valor <= max
}

/**
 * Valida longitud de texto
 */
export function validarLongitud(texto: string, min: number, max: number): boolean {
  const longitud = texto.length
  return longitud >= min && longitud <= max
}

/**
 * Valida que un texto libre no contenga etiquetas HTML
 */
export function esTextoSeguro(texto: string): boolean {
  if (!texto) return true
  const patronPeligroso = /<[^>]*>/g
  return !patronPeligroso.test(texto)
}

/**
 * Valida texto libre con longitud máxima y seguridad básica
 */
export function validarTextoLibre(texto: string, max = 300): boolean {
  if (!texto) return true
  if (texto.length > max) return false
  return esTextoSeguro(texto)
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
} from './rutValidator'

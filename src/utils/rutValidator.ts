/**
 * Utilidades para validación y formateo de RUT chileno
 */

/**
 * Limpia el RUT removiendo puntos y guiones
 */
export function limpiarRut(rut: string | number | null | undefined): string {
  if (!rut) return ''
  return rut.toString().replace(/[.-]/g, '').trim()
}

/**
 * Calcula el dígito verificador de un RUT
 */
export function calcularDv(rutSinDv: string): string {
  if (!rutSinDv) return ''

  let suma = 0
  let multiplicador = 2

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutSinDv.length - 1; i >= 0; i--) {
    suma += Number.parseInt(rutSinDv[i], 10) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = suma % 11
  const dv = 11 - resto

  if (dv === 11) return '0'
  if (dv === 10) return 'K'
  return dv.toString()
}

/**
 * Valida si un RUT es válido
 */
export function validarRut(rut: string): boolean {
  if (!rut) return false

  const rutLimpio = limpiarRut(rut)

  // Verificar que tenga al menos 2 caracteres (número + dv)
  if (rutLimpio.length < 2) return false

  // Separar número y dígito verificador
  const rutSinDv = rutLimpio.slice(0, -1)
  const dvIngresado = rutLimpio.slice(-1).toUpperCase()

  // Verificar que el número sea válido
  if (!/^\d+$/.test(rutSinDv)) return false

  // Calcular y comparar dígito verificador
  const dvCalculado = calcularDv(rutSinDv)

  return dvIngresado === dvCalculado
}

/**
 * Formatea un RUT con puntos y guion (ej: 12.345.678-9)
 */
export function formatearRut(rut: string): string {
  if (!rut) return ''

  const rutLimpio = limpiarRut(rut)

  if (rutLimpio.length < 2) return rutLimpio

  // Separar número y dígito verificador
  const rutSinDv = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1).toUpperCase()

  // Formatear con puntos
  let rutFormateado = ''
  let contador = 0

  for (let i = rutSinDv.length - 1; i >= 0; i--) {
    if (contador === 3) {
      rutFormateado = '.' + rutFormateado
      contador = 0
    }
    rutFormateado = rutSinDv[i] + rutFormateado
    contador++
  }

  return `${rutFormateado}-${dv}`
}

/**
 * Formatea el RUT mientras el usuario escribe
 */
export function formatRutOnInput(rut: string): string {
  if (!rut) return ''

  // Limpiar el RUT
  const rutLimpio = limpiarRut(rut)

  // Si está vacío, retornar vacío
  if (!rutLimpio) return ''

  // Si tiene más de 9 caracteres, truncar
  const rutTruncado = rutLimpio.slice(0, 9)

  // Si tiene menos de 2 caracteres, retornar sin formato
  if (rutTruncado.length < 2) return rutTruncado

  // Formatear
  return formatearRut(rutTruncado)
}

/**
 * Obtiene el número del RUT sin dígito verificador
 */
export function obtenerNumeroRut(rut: string): string {
  if (!rut) return ''
  const rutLimpio = limpiarRut(rut)
  return rutLimpio.slice(0, -1)
}

/**
 * Obtiene el dígito verificador del RUT
 */
export function obtenerDvRut(rut: string): string {
  if (!rut) return ''
  const rutLimpio = limpiarRut(rut)
  return rutLimpio.slice(-1).toUpperCase()
}

/**
 * Valida y formatea un RUT
 */
export function validarYFormatearRut(rut: string): {
  valido: boolean
  rutFormateado: string
  error?: string
} {
  if (!rut) {
    return {
      valido: false,
      rutFormateado: '',
      error: 'RUT es requerido'
    }
  }

  const rutLimpio = limpiarRut(rut)

  if (rutLimpio.length < 2) {
    return {
      valido: false,
      rutFormateado: rut,
      error: 'RUT incompleto'
    }
  }

  const esValido = validarRut(rut)

  if (!esValido) {
    return {
      valido: false,
      rutFormateado: formatearRut(rut),
      error: 'RUT inválido'
    }
  }

  return {
    valido: true,
    rutFormateado: formatearRut(rut)
  }
}

// Exportar objeto con todas las funciones para uso alternativo
export default {
  limpiarRut,
  calcularDv,
  validarRut,
  formatearRut,
  formatRutOnInput,
  obtenerNumeroRut,
  obtenerDvRut,
  validarYFormatearRut
}

// Alias en inglés para compatibilidad con código existente
export const validateRut = validarRut
export const formatRut = formatearRut
export const cleanRut = limpiarRut
export const calculateDv = calcularDv

// utils/formateadores.ts

/**
 * Formatea RUT chileno al formato XX.XXX.XXX-X
 */
export function formatearRut(rut: string): string {
  const rutLimpio = rut.replace(/[^0-9kK]/g, '')
  if (rutLimpio.length < 2) return rut

  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1).toUpperCase()

  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
}

/**
 * Formatea numero de telefono chileno
 */
export function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '')

  if (limpio.length === 9 && limpio.startsWith('9')) {
    return `+56 ${limpio[0]} ${limpio.slice(1, 5)} ${limpio.slice(5)}`
  }

  if (limpio.length === 9 && limpio.startsWith('2')) {
    return `+56 ${limpio.slice(0, 2)} ${limpio.slice(2, 6)} ${limpio.slice(6)}`
  }

  return telefono
}

/**
 * Formatea numero como moneda chilena (CLP)
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(monto)
}

/**
 * Formatea fecha a formato chileno DD/MM/YYYY
 */
export function formatearFecha(fecha: Date | string): string {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha)
  return new Intl.DateTimeFormat('es-CL').format(fechaObj)
}

/**
 * Formatea fecha con hora en formato chileno
 */
export function formatearFechaHora(fecha: Date | string): string {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha)
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fechaObj)
}

/**
 * Limpia formato de RUT dejando solo numeros y K
 */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

/**
 * Limpia numero de telefono dejando solo digitos
 */
export function limpiarTelefono(telefono: string): string {
  return telefono.replace(/\D/g, '')
}

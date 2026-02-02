/**
 * Utilidades puras para formateo de fechas
 * 
 * Este archivo contiene funciones de formateo de fechas sin dependencias de Vue,
 * diseñadas para ser utilizadas tanto en composables como en utilidades standalone.
 * 
 * @example
 * ```ts
 * import { formatearFechaRelativa, formatearFechaCorta } from '@/utils/fecha'
 * 
 * const fecha = formatearFechaRelativa('2024-01-15')
 * const corta = formatearFechaCorta('2024-01-15')
 * ```
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/** Locale por defecto para formateo de fechas */
const LOCALE_DEFAULT = 'es-CL'

/** Opciones de formato para toLocaleDateString */
const OPCIONES_FECHA_CORTA: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short'
}

/** Opciones de formato para fechas largas */
const OPCIONES_FECHA_LARGA: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Convierte un valor de entrada a objeto Date
 * @param fecha - Fecha en formato string ISO, Date, o null
 * @returns Objeto Date o null si es inválido
 */
function parsearFecha(fecha: string | Date | null | undefined): Date | null {
  if (!fecha) return null
  
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return isNaN(d.getTime()) ? null : d
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
function diferenciaDias(fecha1: Date, fecha2: Date): number {
  const diffTime = fecha2.getTime() - fecha1.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula la diferencia en horas entre dos fechas
 */
function diferenciaHoras(fecha1: Date, fecha2: Date): number {
  const diffTime = fecha2.getTime() - fecha1.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60))
}

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/**
 * Formatea una fecha a formato relativo (Hoy, Ayer, Hace X días/semanas)
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String formateado en español
 * 
 * @example
 * ```ts
 * formatearFechaRelativa('2024-01-15T10:30:00') // "Hoy, 10:30"
 * formatearFechaRelativa('2024-01-14') // "Ayer"
 * formatearFechaRelativa('2024-01-10') // "Hace 5 días"
 * ```
 */
export function formatearFechaRelativa(
  fecha: string | Date | null | undefined,
  locale: string = LOCALE_DEFAULT
): string {
  const d = parsearFecha(fecha)
  if (!d) return fecha?.toString() || 'Sin fecha'

  const now = new Date()
  const diffDays = diferenciaDias(d, now)

  if (diffDays === 0) {
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `Hoy, ${hours}:${minutes}`
  } else if (diffDays === 1) {
    return 'Ayer'
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`
  }

  return d.toLocaleDateString(locale, OPCIONES_FECHA_CORTA)
}

/**
 * Formatea una fecha en formato corto (día mes)
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String formateado (ej: "15 ene")
 * 
 * @example
 * ```ts
 * formatearFechaCorta('2024-01-15') // "15 ene"
 * ```
 */
export function formatearFechaCorta(
  fecha: string | Date | null | undefined,
  locale: string = LOCALE_DEFAULT
): string {
  const d = parsearFecha(fecha)
  if (!d) return fecha?.toString() || ''

  return d.toLocaleDateString(locale, OPCIONES_FECHA_CORTA)
}

/**
 * Formatea una fecha en formato largo completo
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String formateado (ej: "15 de enero de 2024")
 * 
 * @example
 * ```ts
 * formatearFechaLarga('2024-01-15') // "15 de enero de 2024"
 * ```
 */
export function formatearFechaLarga(
  fecha: string | Date | null | undefined,
  locale: string = LOCALE_DEFAULT
): string {
  const d = parsearFecha(fecha)
  if (!d) return fecha?.toString() || ''

  return d.toLocaleDateString(locale, OPCIONES_FECHA_LARGA)
}

/**
 * Formatea una fecha con hora incluida
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String formateado (ej: "15 ene, 14:30")
 * 
 * @example
 * ```ts
 * formatearFechaHora('2024-01-15T14:30:00') // "15 ene, 14:30"
 * ```
 */
export function formatearFechaHora(
  fecha: string | Date | null | undefined,
  locale: string = LOCALE_DEFAULT
): string {
  const d = parsearFecha(fecha)
  if (!d) return fecha?.toString() || ''

  const fechaStr = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  const horas = d.getHours().toString().padStart(2, '0')
  const minutos = d.getMinutes().toString().padStart(2, '0')
  
  return `${fechaStr}, ${horas}:${minutos}`
}

/**
 * Calcula tiempo transcurrido desde una fecha hasta ahora
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String descriptivo del tiempo transcurrido
 * 
 * @example
 * ```ts
 * calcularTiempoTranscurrido('2024-01-15T10:00:00') // "Hace 2 horas"
 * ```
 */
export function calcularTiempoTranscurrido(
  fecha: string | Date | null | undefined
): string {
  const d = parsearFecha(fecha)
  if (!d) return ''

  const now = new Date()
  const diffHours = diferenciaHoras(d, now)

  if (diffHours < 1) {
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))
    if (diffMinutes < 1) return 'Hace un momento'
    return `Hace ${diffMinutes} minutos`
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} horas`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Hace 1 día'
  if (diffDays < 7) return `Hace ${diffDays} días`
  
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return 'Hace 1 semana'
  if (diffWeeks < 4) return `Hace ${diffWeeks} semanas`
  
  return d.toLocaleDateString(LOCALE_DEFAULT, OPCIONES_FECHA_CORTA)
}

/**
 * Formatea una fecha para uso en inputs de tipo date
 * 
 * @param fecha - Fecha en formato ISO string o Date
 * @returns String en formato YYYY-MM-DD
 * 
 * @example
 * ```ts
 * formatearParaInputDate('2024-01-15') // "2024-01-15"
 * ```
 */
export function formatearParaInputDate(
  fecha: string | Date | null | undefined
): string {
  const d = parsearFecha(fecha)
  if (!d) return ''

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Compara dos fechas sin considerar la hora
 * 
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha
 * @returns -1 si fecha1 < fecha2, 0 si iguales, 1 si fecha1 > fecha2
 */
export function compararFechas(
  fecha1: string | Date,
  fecha2: string | Date
): number {
  const d1 = parsearFecha(fecha1)
  const d2 = parsearFecha(fecha2)
  
  if (!d1 || !d2) return 0
  
  // Comparar solo la parte de fecha (sin hora)
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  
  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

/**
 * Verifica si una fecha está dentro de un rango
 * 
 * @param fecha - Fecha a verificar
 * @param inicio - Fecha de inicio del rango (inclusive)
 * @param fin - Fecha de fin del rango (inclusive)
 * @returns true si la fecha está dentro del rango
 */
export function estaEnRangoFechas(
  fecha: string | Date,
  inicio: string | Date,
  fin: string | Date
): boolean {
  const d = parsearFecha(fecha)
  const dInicio = parsearFecha(inicio)
  const dFin = parsearFecha(fin)
  
  if (!d || !dInicio || !dFin) return false
  
  const compInicio = compararFechas(fecha, inicio)
  const compFin = compararFechas(fecha, fin)
  
  return compInicio >= 0 && compFin <= 0
}

/**
 * Obtiene la fecha actual en formato ISO (solo fecha, sin hora)
 * 
 * @returns String en formato YYYY-MM-DD
 */
export function obtenerFechaActualISO(): string {
  return formatearParaInputDate(new Date())
}

/**
 * Agrega días a una fecha
 * 
 * @param fecha - Fecha base
 * @param dias - Cantidad de días a agregar (negativo para restar)
 * @returns Nueva fecha con los días agregados
 */
export function agregarDias(
  fecha: string | Date,
  dias: number
): Date {
  const d = parsearFecha(fecha)
  if (!d) return new Date()
  
  const resultado = new Date(d)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

/**
 * Genera un array de fechas formateadas para gráficos
 * 
 * @param fechas - Array de fechas en formato ISO
 * @param formato - Formato deseado ('corto' | 'medio')
 * @returns Array de strings formateados
 */
export function formatearFechasParaGrafico(
  fechas: string[],
  formato: 'corto' | 'medio' = 'corto',
  locale: string = LOCALE_DEFAULT
): string[] {
  return fechas.map(fecha => {
    const d = parsearFecha(fecha)
    if (!d) return fecha
    
    if (formato === 'corto') {
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    }
    
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: '2-digit' })
  })
}

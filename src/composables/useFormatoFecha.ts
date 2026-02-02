import { computed, type MaybeRefOrGetter, toValue } from 'vue'

interface OpcionesFormato {
  formato?: 'relativo' | 'corto' | 'largo'
  locale?: string
}

/**
 * Composable para formatear fechas de forma amigable
 * @param fecha - Fecha a formatear (string ISO, Date, o null)
 * @param opciones - Opciones de formato
 * @returns Fecha formateada
 */
export function useFormatoFecha(
  fecha: MaybeRefOrGetter<string | Date | null | undefined>,
  opciones: MaybeRefOrGetter<OpcionesFormato> = {}
) {
  const fechaFormateada = computed(() => {
    const fechaValor = toValue(fecha)
    const opts = { formato: 'relativo', locale: 'es-CL', ...toValue(opciones) }

    if (!fechaValor) return 'Sin fecha'

    const d = typeof fechaValor === 'string' ? new Date(fechaValor) : fechaValor
    if (isNaN(d.getTime())) return String(fechaValor)

    if (opts.formato === 'relativo') {
      const now = new Date()
      const diffTime = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

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
    }

    return d.toLocaleDateString(opts.locale, { day: 'numeric', month: 'short' })
  })

  const fechaCorta = computed(() => {
    const fechaValor = toValue(fecha)
    if (!fechaValor) return ''

    const d = typeof fechaValor === 'string' ? new Date(fechaValor) : fechaValor
    if (isNaN(d.getTime())) return String(fechaValor)

    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  })

  return {
    fechaFormateada,
    fechaCorta
  }
}

/**
 * Formatea una fecha a formato relativo (Hoy, Ayer, Hace X días)
 * @param dateStr - Fecha en formato ISO string
 * @returns String formateado
 */
export function formatDateFriendly(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Sin fecha'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const diffTime = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

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

  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

/**
 * Formatea una fecha simple
 * @param dateStr - Fecha en formato ISO string
 * @returns String formateado corto
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 24) return `Hace ${hours} horas`
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

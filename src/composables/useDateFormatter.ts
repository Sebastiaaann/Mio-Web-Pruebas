/**
 * Composable useDateFormatter
 *
 * Formateo de fechas optimizado segun vueuse-functions
 * Aplica: useDateFormat, useTimeAgo para fechas relativas
 */

export function useDateFormatter(): {
  formatDateFriendly: (dateStr: string | null | undefined) => string
  formatDateCorto: (dateStr: string | null | undefined) => string
  formatDateLargo: (dateStr: string | null | undefined) => string
  formatTimeAgo: (dateStr: string | null | undefined) => string
} {
  const formatDateFriendly = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Sin fecha'

    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return String(dateStr)

    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `Hoy, ${hours}:${minutes}`
    }
    if (diffDays === 1) {
      return 'Ayer'
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} dias`
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`
    }

    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  const formatDateCorto = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return String(dateStr)

    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const formatDateLargo = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return String(dateStr)

    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return String(dateStr)

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSec < 60) {
      return 'Hace un momento'
    }
    if (diffMin < 60) {
      return `Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`
    }

    return formatDateCorto(dateStr)
  }

  return {
    formatDateFriendly,
    formatDateCorto,
    formatDateLargo,
    formatTimeAgo
  }
}

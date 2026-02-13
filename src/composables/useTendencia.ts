/**
 * Composable useTendencia
 *
 * Calculo de tendencias de mediciones segun vue-best-practices
 * Aplica: funciones puras sin side effects
 */

import { useMemoize } from '@vueuse/core'
import type { TipoMedicion } from '@/types/salud'

type DireccionTendencia = 'up' | 'down' | 'stable'

interface Tendencia {
  direccion: DireccionTendencia
  cambio: number | null
  porcentaje: number | null
}

export function useTendencia(): {
  calcularTendencia: (current: string | null, previous: string | null, tipo: TipoMedicion) => Tendencia
  esTendenciaFavorable: (tendencia: Tendencia, tipo: TipoMedicion) => boolean
  getTendenciaColorClass: (tendencia: Tendencia, tipo: TipoMedicion) => string
  extraerValorNumerico: (valor: string | null, tipo: TipoMedicion) => number | null
} {
  const extraerValorNumerico = (valor: string | null, tipo: TipoMedicion): number | null => {
    if (!valor || valor === '--' || valor === 'N/A') {
      return null
    }

    if (tipo === 'presion' && valor.includes('/')) {
      const sistolica = Number.parseFloat(valor.split('/')[0])
      return Number.isNaN(sistolica) ? null : sistolica
    }

    const num = Number.parseFloat(valor)
    return Number.isNaN(num) ? null : num
  }

  const calcularTendencia = useMemoize((current: string | null, previous: string | null, tipo: TipoMedicion): Tendencia => {
    if (!current || !previous || current === '--' || previous === '--') {
      return { direccion: 'stable', cambio: null, porcentaje: null }
    }

    const valorActual = extraerValorNumerico(current, tipo)
    const valorAnterior = extraerValorNumerico(previous, tipo)

    if (valorActual === null || valorAnterior === null || valorAnterior === 0) {
      return { direccion: 'stable', cambio: null, porcentaje: null }
    }

    const diferencia = valorActual - valorAnterior
    const porcentaje = (diferencia / valorAnterior) * 100

    if (Math.abs(porcentaje) < 5) {
      return {
        direccion: 'stable',
        cambio: diferencia,
        porcentaje
      }
    }

    const direccion: DireccionTendencia = diferencia > 0 ? 'up' : 'down'

    return {
      direccion,
      cambio: diferencia,
      porcentaje
    }
  })

  const esTendenciaFavorable = (tendencia: Tendencia, tipo: TipoMedicion): boolean => {
    if (tipo === 'glucosa') {
      return tendencia.direccion === 'stable'
    }

    if (tipo === 'peso' || tipo === 'presion') {
      return tendencia.direccion === 'down' || tendencia.direccion === 'stable'
    }

    return true
  }

  const getTendenciaColorClass = (tendencia: Tendencia, tipo: TipoMedicion): string => {
    if (tendencia.direccion === 'stable') {
      return 'text-gray-400'
    }

    const esFavorable = esTendenciaFavorable(tendencia, tipo)
    return esFavorable ? 'text-green-500' : 'text-red-500'
  }

  return {
    calcularTendencia,
    esTendenciaFavorable,
    getTendenciaColorClass,
    extraerValorNumerico
  }
}

/**
 * Composable useEstadisticas
 *
 * Calculo de estadisticas optimizado segun vueuse-functions
 * Aplica: useMemoize para cache de calculos costosos
 */

import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useMemoize } from '@vueuse/core'
import type { HistorialMediciones, Medicion, TipoMedicion } from '@/types/salud'

interface EstadisticasMediciones {
  total: number
  promedio: number
  min: number
  max: number
  tendencia: number
  ultima: Medicion | null
  primera: Medicion | null
}

interface ConteosPorEstado {
  normal: number
  alerta: number
  critico: number
  total: number
}

export function useEstadisticas(
  historialRef: Ref<HistorialMediciones>,
  filtroIds: Ref<string[]> | null = null
): {
  estadisticas: ComputedRef<EstadisticasMediciones>
  estadisticasPorTipo: ComputedRef<(tipo: TipoMedicion) => EstadisticasMediciones>
  estadisticasPeso: ComputedRef<EstadisticasMediciones>
  estadisticasPresion: ComputedRef<EstadisticasMediciones>
  estadisticasGlucosa: ComputedRef<EstadisticasMediciones>
  conteosPorEstado: ComputedRef<ConteosPorEstado>
  calcularEstadisticas: (historial: HistorialMediciones, ids?: string[] | null) => EstadisticasMediciones
  calcularPorTipo: (historial: HistorialMediciones, tipo: TipoMedicion) => EstadisticasMediciones
} {
  const calcularEstadisticas = useMemoize((historial: HistorialMediciones, ids?: string[] | null): EstadisticasMediciones => {
    let todasMediciones = Object.values(historial).flat()

    if (ids && ids.length > 0) {
      todasMediciones = todasMediciones.filter(m => ids.includes(m.id))
    }

    if (todasMediciones.length === 0) {
      return {
        total: 0,
        promedio: 0,
        min: 0,
        max: 0,
        tendencia: 0,
        ultima: null,
        primera: null
      }
    }

    const ordenadas = [...todasMediciones].sort((a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )

    const ultima = ordenadas[0]
    const primera = ordenadas[ordenadas.length - 1]

    const valores = ordenadas
      .map(m => Number.parseFloat(String(m.valor)))
      .filter(v => !Number.isNaN(v))

    if (valores.length === 0) {
      return {
        total: ordenadas.length,
        promedio: 0,
        min: 0,
        max: 0,
        tendencia: 0,
        ultima,
        primera
      }
    }

    const total = ordenadas.length
    const promedio = valores.reduce((sum, v) => sum + v, 0) / valores.length
    const min = Math.min(...valores)
    const max = Math.max(...valores)

    const valorUltima = Number.parseFloat(String(ultima.valor)) || 0
    const valorPrimera = Number.parseFloat(String(primera.valor)) || 0
    const tendencia = valorUltima - valorPrimera

    return {
      total,
      promedio,
      min,
      max,
      tendencia,
      ultima,
      primera
    }
  })

  const calcularPorTipo = useMemoize((historial: HistorialMediciones, tipo: TipoMedicion): EstadisticasMediciones => {
    const mediciones = Object.values(historial)
      .flat()
      .filter(m => m.tipo === tipo)

    return calcularEstadisticas({ [tipo]: mediciones })
  })

  const estadisticas = computed(() => calcularEstadisticas(historialRef.value, filtroIds?.value))

  const estadisticasPorTipo = computed(() => (tipo: TipoMedicion) => {
    return calcularPorTipo(historialRef.value, tipo)
  })

  const estadisticasPeso = computed(() => calcularPorTipo(historialRef.value, 'peso'))
  const estadisticasPresion = computed(() => calcularPorTipo(historialRef.value, 'presion'))
  const estadisticasGlucosa = computed(() => calcularPorTipo(historialRef.value, 'glucosa'))

  const conteosPorEstado = computed<ConteosPorEstado>(() => {
    const mediciones = Object.values(historialRef.value).flat()

    return {
      normal: mediciones.filter(m => m.estado === 'normal').length,
      alerta: mediciones.filter(m => m.estado === 'alerta').length,
      critico: mediciones.filter(m => m.estado === 'critico').length,
      total: mediciones.length
    }
  })

  return {
    estadisticas,
    estadisticasPorTipo,
    estadisticasPeso,
    estadisticasPresion,
    estadisticasGlucosa,
    conteosPorEstado,
    calcularEstadisticas,
    calcularPorTipo
  }
}

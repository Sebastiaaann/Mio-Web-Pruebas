/**
 * Composable useMedicionesOptimizado
 *
 * Optimizacion de calculos de mediciones segun vue-best-practices y vueuse-functions
 * Aplica: useMemoize para cache
 */

import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useMemoize } from '@vueuse/core'
import type { HistorialMediciones, Medicion, TipoMedicion } from '@/types/salud'

export function useMedicionesOptimizado(historialRef: Ref<HistorialMediciones>): {
  medicionesPorTipo: ComputedRef<(tipo: TipoMedicion) => Medicion[]>
  ultimasMediciones: ComputedRef<(cantidad?: number) => Medicion[]>
  promedioPorTipo: ComputedRef<(tipo: TipoMedicion) => number>
  getMedicionesPorTipo: (tipo: TipoMedicion, historial: HistorialMediciones) => Medicion[]
  getUltimasMediciones: (cantidad: number, historial: HistorialMediciones) => Medicion[]
  getPromedioValores: (mediciones: Medicion[]) => number
} {
  const getMedicionesPorTipo = useMemoize((tipo: TipoMedicion, historial: HistorialMediciones): Medicion[] => {
    return Object.values(historial)
      .flat()
      .filter(m => m.tipo === tipo)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  })

  const getUltimasMediciones = useMemoize((cantidad: number, historial: HistorialMediciones): Medicion[] => {
    const todas = Object.values(historial).flat()
    return todas
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, cantidad)
  })

  const getPromedioValores = useMemoize((mediciones: Medicion[]): number => {
    if (!mediciones || mediciones.length === 0) return 0

    const valores = mediciones
      .map(m => Number.parseFloat(String(m.valor)))
      .filter(v => !Number.isNaN(v))

    if (valores.length === 0) return 0

    return valores.reduce((sum, v) => sum + v, 0) / valores.length
  })

  const medicionesPorTipo = computed(() => (tipo: TipoMedicion) => {
    return getMedicionesPorTipo(tipo, historialRef.value)
  })

  const ultimasMediciones = computed(() => (cantidad: number = 10) => {
    return getUltimasMediciones(cantidad, historialRef.value)
  })

  const promedioPorTipo = computed(() => (tipo: TipoMedicion) => {
    const mediciones = getMedicionesPorTipo(tipo, historialRef.value)
    return getPromedioValores(mediciones)
  })

  return {
    medicionesPorTipo,
    ultimasMediciones,
    promedioPorTipo,
    getMedicionesPorTipo,
    getUltimasMediciones,
    getPromedioValores
  }
}

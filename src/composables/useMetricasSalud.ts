/**
 * Composable para calcular métricas de salud basadas en el historial de mediciones
 *
 * Proporciona funcionalidades para:
 * - Calcular métricas por tipo de medición (presión, glicemia, peso)
 * - Determinar estado general de salud
 * - Calcular tendencias, promedios, mínimos y máximos
 * - Helpers de formateo para UI
 *
 * @example
 * ```ts
 * const {
 *   metricasPresion,
 *   metricasGlicemia,
 *   metricasPeso,
 *   estadoGeneral,
 *   getEstadoTexto,
 *   getEstadoClase,
 *   getEstadoDot
 * } = useMetricasSalud(historialMediciones)
 * ```
 */

import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from 'vue'
import type { Medicion, EstadoMedicion } from '@/types/salud'
import type { MetricasTipo } from '@/types/miSalud'

// ============================================================================
// TIPOS
// ============================================================================

/** Tipo de estado general de salud */
type EstadoGeneral = 'excelente' | 'bueno' | 'regular' | 'atencion'

/** Métricas calculadas para un tipo específico con validación */
interface MetricasCalculadas extends MetricasTipo {
  /** Indica si hay datos suficientes para el cálculo */
  tieneDatos: boolean
}

/** Retorno del composable useMetricasSalud */
interface RetornoUseMetricasSalud {
  /** Métricas calculadas para presión arterial */
  metricasPresion: ComputedRef<MetricasCalculadas>
  /** Métricas calculadas para glicemia */
  metricasGlicemia: ComputedRef<MetricasCalculadas>
  /** Métricas calculadas para peso corporal */
  metricasPeso: ComputedRef<MetricasCalculadas>
  /** Estado general de salud calculado */
  estadoGeneral: ComputedRef<EstadoGeneral>
  /** Obtiene texto legible para un estado */
  getEstadoTexto: (estado: EstadoMedicion | string) => string
  /** Obtiene clases CSS para un estado */
  getEstadoClase: (estado: EstadoMedicion | string) => string
  /** Obtiene color de indicador para un estado */
  getEstadoDot: (estado: EstadoMedicion | string) => string
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Rangos normales por tipo de medición */
const RANGOS_NORMALES = {
  presion: { min: 90, max: 120, diastolicaMax: 80 },
  glicemia: { min: 70, max: 100 },
  peso: { min: 40, max: 500 }
}

/** Mapeo de estados a texto legible */
const ESTADOS_TEXTO: Record<string, string> = {
  normal: 'Normal',
  green: 'Normal',
  success: 'Normal',
  warning: 'Observación',
  orange: 'Observación',
  alerta: 'Observación',
  red: 'Revisar',
  critico: 'Revisar',
  danger: 'Revisar',
  none: 'Pendiente',
  na: 'Sin evaluación'
}

/** Mapeo de estados a clases CSS */
const ESTADOS_CLASE: Record<string, string> = {
  normal: 'bg-emerald-50 text-emerald-600',
  green: 'bg-emerald-50 text-emerald-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  orange: 'bg-amber-50 text-amber-600',
  alerta: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  critico: 'bg-red-50 text-red-600',
  danger: 'bg-red-50 text-red-600',
  none: 'bg-gray-50 text-gray-500',
  na: 'bg-gray-50 text-gray-500'
}

/** Mapeo de estados a colores de indicador */
const ESTADOS_DOT: Record<string, string> = {
  normal: 'bg-emerald-500',
  green: 'bg-emerald-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  orange: 'bg-amber-500',
  alerta: 'bg-amber-500',
  red: 'bg-red-500',
  critico: 'bg-red-500',
  danger: 'bg-red-500',
  none: 'bg-gray-400',
  na: 'bg-gray-400'
}

/** Umbral de porcentaje para considerar tendencia estable */
const UMBRAL_ESTABLE = 2

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Valida si un valor de presión está en formato correcto (sistólica/diastólica)
 */
function esPresionValida(valor: string): boolean {
  if (!valor || !valor.includes('/')) return false
  const partes = valor.split('/')
  if (partes.length !== 2) return false
  const sistolica = parseFloat(partes[0].trim())
  const diastolica = parseFloat(partes[1].trim())
  return !isNaN(sistolica) && !isNaN(diastolica) && sistolica > 0 && diastolica > 0
}

/**
 * Extrae valor sistólico de una medición de presión
 */
function extraerSistolica(valor: string): number | null {
  if (!esPresionValida(valor)) return null
  const sistolica = parseFloat(valor.split('/')[0].trim())
  return isNaN(sistolica) ? null : sistolica
}

/**
 * Extrae valor numérico válido de una medición
 */
function extraerValorNumerico(valor: string, tipo: 'glicemia' | 'peso'): number | null {
  if (!valor || valor === '--' || valor === 'N/A') return null
  // Para glicemia, no debe contener '/'
  if (tipo === 'glicemia' && valor.includes('/')) return null
  const numero = parseFloat(valor)
  if (isNaN(numero)) return null
  // Para peso, debe ser menor a 500
  if (tipo === 'peso' && numero >= 500) return null
  return numero
}

/**
 * Calcula métricas estadísticas de un array de valores
 */
function calcularEstadisticas(valores: number[]): Omit<MetricasTipo, 'ultimoValor' | 'ultimaFecha' | 'estaEnRangoNormal'> | null {
  if (valores.length === 0) return null

  const promedio = valores.reduce((sum, v) => sum + v, 0) / valores.length
  const minimo = Math.min(...valores)
  const maximo = Math.max(...valores)

  return {
    promedio: Math.round(promedio * 10) / 10,
    minimo,
    maximo,
    totalMediciones: valores.length,
    tendencia: 'estable' as const,
    porcentajeCambio: null
  }
}

/**
 * Determina la tendencia comparando último valor con el anterior
 */
function calcularTendencia(valores: number[]): { tendencia: 'subiendo' | 'bajando' | 'estable', porcentajeCambio: number | null } {
  if (valores.length < 2) {
    return { tendencia: 'estable', porcentajeCambio: null }
  }

  const ultimo = valores[valores.length - 1]
  const anterior = valores[valores.length - 2]

  if (anterior === 0) {
    return { tendencia: 'estable', porcentajeCambio: null }
  }

  const diferencia = ultimo - anterior
  const porcentaje = (diferencia / anterior) * 100

  if (Math.abs(porcentaje) < UMBRAL_ESTABLE) {
    return { tendencia: 'estable', porcentajeCambio: porcentaje }
  }

  return {
    tendencia: diferencia > 0 ? 'subiendo' : 'bajando',
    porcentajeCambio: Math.round(porcentaje * 10) / 10
  }
}

/**
 * Verifica si un valor está dentro del rango normal
 */
function estaEnRangoNormal(valor: number, tipo: 'presion' | 'glicemia' | 'peso'): boolean {
  const rango = RANGOS_NORMALES[tipo]
  if (tipo === 'presion') {
    return valor >= rango.min && valor <= rango.max
  }
  return valor >= rango.min && valor <= rango.max
}

/**
 * Calcula métricas para mediciones de presión
 */
function calcularMetricasPresion(mediciones: Medicion[]): MetricasCalculadas {
  const valores: number[] = []
  const fechas: string[] = []

  for (const med of mediciones) {
    const sistolica = extraerSistolica(med.valor)
    if (sistolica !== null) {
      valores.push(sistolica)
      fechas.push(med.fecha)
    }
  }

  if (valores.length === 0) {
    return {
      promedio: 0,
      ultimoValor: null,
      ultimaFecha: null,
      minimo: 0,
      maximo: 0,
      totalMediciones: 0,
      tendencia: 'estable',
      porcentajeCambio: null,
      estaEnRangoNormal: null,
      tieneDatos: false
    }
  }

  const estadisticas = calcularEstadisticas(valores)
  const tendenciaData = calcularTendencia(valores)
  const ultimoValor = valores[valores.length - 1]
  const ultimaFecha = fechas[fechas.length - 1]

  return {
    promedio: estadisticas?.promedio ?? 0,
    ultimoValor,
    ultimaFecha,
    minimo: estadisticas?.minimo ?? 0,
    maximo: estadisticas?.maximo ?? 0,
    totalMediciones: estadisticas?.totalMediciones ?? 0,
    tendencia: tendenciaData.tendencia,
    porcentajeCambio: tendenciaData.porcentajeCambio,
    estaEnRangoNormal: estaEnRangoNormal(ultimoValor, 'presion'),
    tieneDatos: true
  }
}

/**
 * Calcula métricas para mediciones de glicemia
 */
function calcularMetricasGlicemia(mediciones: Medicion[]): MetricasCalculadas {
  const valores: number[] = []
  const fechas: string[] = []

  for (const med of mediciones) {
    const valor = extraerValorNumerico(med.valor, 'glicemia')
    if (valor !== null) {
      valores.push(valor)
      fechas.push(med.fecha)
    }
  }

  if (valores.length === 0) {
    return {
      promedio: 0,
      ultimoValor: null,
      ultimaFecha: null,
      minimo: 0,
      maximo: 0,
      totalMediciones: 0,
      tendencia: 'estable',
      porcentajeCambio: null,
      estaEnRangoNormal: null,
      tieneDatos: false
    }
  }

  const estadisticas = calcularEstadisticas(valores)
  const tendenciaData = calcularTendencia(valores)
  const ultimoValor = valores[valores.length - 1]
  const ultimaFecha = fechas[fechas.length - 1]

  return {
    promedio: estadisticas?.promedio ?? 0,
    ultimoValor,
    ultimaFecha,
    minimo: estadisticas?.minimo ?? 0,
    maximo: estadisticas?.maximo ?? 0,
    totalMediciones: estadisticas?.totalMediciones ?? 0,
    tendencia: tendenciaData.tendencia,
    porcentajeCambio: tendenciaData.porcentajeCambio,
    estaEnRangoNormal: estaEnRangoNormal(ultimoValor, 'glicemia'),
    tieneDatos: true
  }
}

/**
 * Calcula métricas para mediciones de peso
 */
function calcularMetricasPeso(mediciones: Medicion[]): MetricasCalculadas {
  const valores: number[] = []
  const fechas: string[] = []

  for (const med of mediciones) {
    const valor = extraerValorNumerico(med.valor, 'peso')
    if (valor !== null) {
      valores.push(valor)
      fechas.push(med.fecha)
    }
  }

  if (valores.length === 0) {
    return {
      promedio: 0,
      ultimoValor: null,
      ultimaFecha: null,
      minimo: 0,
      maximo: 0,
      totalMediciones: 0,
      tendencia: 'estable',
      porcentajeCambio: null,
      estaEnRangoNormal: null,
      tieneDatos: false
    }
  }

  const estadisticas = calcularEstadisticas(valores)
  const tendenciaData = calcularTendencia(valores)
  const ultimoValor = valores[valores.length - 1]
  const ultimaFecha = fechas[fechas.length - 1]

  return {
    promedio: estadisticas?.promedio ?? 0,
    ultimoValor,
    ultimaFecha,
    minimo: estadisticas?.minimo ?? 0,
    maximo: estadisticas?.maximo ?? 0,
    totalMediciones: estadisticas?.totalMediciones ?? 0,
    tendencia: tendenciaData.tendencia,
    porcentajeCambio: tendenciaData.porcentajeCambio,
    estaEnRangoNormal: estaEnRangoNormal(ultimoValor, 'peso'),
    tieneDatos: true
  }
}

/**
 * Determina el estado general de salud basado en todas las métricas
 */
function determinarEstadoGeneral(
  presion: MetricasCalculadas,
  glicemia: MetricasCalculadas,
  peso: MetricasCalculadas
): EstadoGeneral {
  const metricas = [presion, glicemia, peso]
  const metricasConDatos = metricas.filter((m) => m.tieneDatos)

  if (metricasConDatos.length === 0) {
    return 'atencion'
  }

  let puntosNegativos = 0
  let metricasFueraRango = 0

  for (const metrica of metricasConDatos) {
    if (metrica.estaEnRangoNormal === false) {
      metricasFueraRango++
      puntosNegativos += 2
    } else if (metrica.estaEnRangoNormal === null) {
      puntosNegativos += 1
    }

    // Penalizar tendencias negativas
    if (metrica.tendencia === 'subiendo' && metrica.ultimoValor && metrica.ultimoValor > 100) {
      puntosNegativos += 1
    }
  }

  // Determinar estado basado en puntos
  if (puntosNegativos === 0 && metricasFueraRango === 0) {
    return 'excelente'
  } else if (puntosNegativos <= 2 && metricasFueraRango <= 1) {
    return 'bueno'
  } else if (puntosNegativos <= 4 && metricasFueraRango <= 2) {
    return 'regular'
  } else {
    return 'atencion'
  }
}

// ============================================================================
// COMPOSABLE PRINCIPAL
// ============================================================================

/**
 * Composable para calcular métricas de salud
 *
 * @param historial - Historial de mediciones por tipo (reactivo o no)
 * @returns Objeto con métricas calculadas y helpers de formateo
 */
export function useMetricasSalud(
  historial: MaybeRefOrGetter<Record<string, Medicion[]>>
): RetornoUseMetricasSalud {
  /**
   * Obtiene todas las mediciones de un tipo específico del historial
   */
  const obtenerMedicionesPorTipo = (tipo: 'presion' | 'glucosa' | 'peso'): Medicion[] => {
    const historialValor = toValue(historial)
    const todasLasMediciones: Medicion[] = []

    Object.values(historialValor).forEach((mediciones) => {
      if (!Array.isArray(mediciones)) return
      mediciones.forEach((med) => {
        if (med.tipo === tipo) {
          todasLasMediciones.push(med)
        }
      })
    })

    // Ordenar por fecha (más reciente primero)
    return todasLasMediciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }

  /**
   * Métricas calculadas para presión arterial
   */
  const metricasPresion = computed<MetricasCalculadas>(() => {
    const mediciones = obtenerMedicionesPorTipo('presion')
    return calcularMetricasPresion(mediciones)
  })

  /**
   * Métricas calculadas para glicemia
   */
  const metricasGlicemia = computed<MetricasCalculadas>(() => {
    const mediciones = obtenerMedicionesPorTipo('glucosa')
    return calcularMetricasGlicemia(mediciones)
  })

  /**
   * Métricas calculadas para peso corporal
   */
  const metricasPeso = computed<MetricasCalculadas>(() => {
    const mediciones = obtenerMedicionesPorTipo('peso')
    return calcularMetricasPeso(mediciones)
  })

  /**
   * Estado general de salud calculado
   */
  const estadoGeneral = computed<EstadoGeneral>(() => {
    return determinarEstadoGeneral(
      metricasPresion.value,
      metricasGlicemia.value,
      metricasPeso.value
    )
  })

  /**
   * Obtiene texto legible para un estado de medición
   *
   * @param estado - Estado de la medición
   * @returns Texto descriptivo del estado
   */
  const getEstadoTexto = (estado: EstadoMedicion | string): string => {
    return ESTADOS_TEXTO[estado] || 'Sin evaluación'
  }

  /**
   * Obtiene clases CSS para un estado de medición
   *
   * @param estado - Estado de la medición
   * @returns Clases CSS para estilizar el estado
   */
  const getEstadoClase = (estado: EstadoMedicion | string): string => {
    return ESTADOS_CLASE[estado] || 'bg-gray-50 text-gray-500'
  }

  /**
   * Obtiene color de indicador para un estado de medición
   *
   * @param estado - Estado de la medición
   * @returns Clase CSS para el color del indicador
   */
  const getEstadoDot = (estado: EstadoMedicion | string): string => {
    return ESTADOS_DOT[estado] || 'bg-gray-400'
  }

  return {
    metricasPresion,
    metricasGlicemia,
    metricasPeso,
    estadoGeneral,
    getEstadoTexto,
    getEstadoClase,
    getEstadoDot
  }
}

export default useMetricasSalud

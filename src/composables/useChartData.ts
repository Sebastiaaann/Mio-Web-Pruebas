/**
 * Composable para procesar datos de mediciones y generar configuraciones de gráficos Chart.js
 *
 * Proporciona funcionalidades para:
 * - Procesar datos de presión arterial (sistólica/diastólica)
 * - Procesar datos de glicemia
 * - Procesar datos de peso corporal
 * - Generar configuraciones completas para Chart.js
 * - Calcular estadísticas (promedio, mínimo, máximo, tendencia)
 *
 * @example
 * ```ts
 * const { datosGrafico, estadisticas, configChart } = useChartData(
 *   mediciones,
 *   'presion'
 * )
 * ```
 */

import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from 'vue'
import type { Medicion, TipoMedicion, HistorialMediciones } from '@/types/salud'
import type { DatosGrafico, DatasetGrafico, MetricasTipo } from '@/types/miSalud'

// ============================================================================
// TIPOS DE ENTRADA FLEXIBLES (NUEVO)
// ============================================================================

/** Tipo de entrada flexible que acepta tanto un array plano de mediciones
 * como un historial agrupado por protocolo */
export type EntradaMediciones = Medicion[] | HistorialMediciones

/** Tipo para la firma del composable con entrada flexible */
export type MedicionesInput = MaybeRefOrGetter<EntradaMediciones>

// ============================================================================
// CONSTANTES
// ============================================================================

/** Colores para gráficos de presión arterial */
const COLORES_PRESION = {
  sistolica: '#DC2626',
  diastolica: '#F87171'
} as const

/** Colores para gráficos de glicemia */
const COLORES_GLICEMIA = {
  linea: '#3B82F6',
  area: 'rgba(59, 130, 246, 0.2)'
} as const

/** Colores para gráficos de peso */
const COLOR_PESO = '#FF9500' as const

/** Tensión de la línea para curvas suavizadas */
const TENSION_LINEA = 0.4

/** Umbral de porcentaje para determinar tendencia estable */
const UMBRAL_TENDENCIA_ESTABLE = 5

/** Valor mínimo válido para peso */
const PESO_MINIMO = 0

/** Valor máximo válido para peso */
const PESO_MAXIMO = 500

// ============================================================================
// TYPE GUARDS (NUEVO)
// ============================================================================

/**
 * Verifica si un valor es un array de mediciones
 * @param valor - Valor a verificar
 * @returns true si es un array de Medicion
 */
export function esArrayMediciones(valor: unknown): valor is Medicion[] {
  return Array.isArray(valor) && 
    (valor.length === 0 || (
      typeof valor[0] === 'object' && 
      valor[0] !== null &&
      'id' in valor[0] &&
      'tipo' in valor[0] &&
      'valor' in valor[0]
    ))
}

/**
 * Verifica si un valor es un HistorialMediciones (Record<string, Medicion[]>)
 * 
 * Un HistorialMediciones es un objeto donde:
 * - Las claves son strings (IDs de protocolo)
 * - Los valores son arrays de Medicion
 * 
 * @param valor - Valor a verificar
 * @returns true si es un HistorialMediciones
 */
export function esHistorialMediciones(valor: unknown): valor is HistorialMediciones {
  // Debe ser un objeto y no un array
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    return false
  }

  const entradas = Object.entries(valor)
  
  // Si está vacío, consideramos que es un historial válido
  if (entradas.length === 0) {
    return true
  }

  // Verificar que todas las claves sean strings y todos los valores sean arrays
  return entradas.every(([clave, valorArray]) => {
    // La clave debe ser string
    if (typeof clave !== 'string') return false
    
    // El valor debe ser un array
    if (!Array.isArray(valorArray)) return false
    
    // Si el array tiene elementos, verificar que sean mediciones
    if (valorArray.length > 0) {
      const primerElemento = valorArray[0]
      return (
        typeof primerElemento === 'object' &&
        primerElemento !== null &&
        'id' in primerElemento &&
        'tipo' in primerElemento &&
        'valor' in primerElemento
      )
    }
    
    return true
  })
}

/**
 * Detecta y normaliza el tipo de entrada de mediciones
 * 
 * @param valor - Valor a detectar (array o historial)
 * @returns Objeto con tipo detectado y datos normalizados
 */
export function detectarTipoEntrada(valor: EntradaMediciones): {
  tipo: 'array' | 'historial'
  datos: Medicion[]
  totalProtocolos: number
} {
  if (esArrayMediciones(valor)) {
    return {
      tipo: 'array',
      datos: valor,
      totalProtocolos: 0
    }
  }

  // Es HistorialMediciones - aplanar en una sola operación
  const todasLasMediciones: Medicion[] = []
  let totalProtocolos = 0
  
  for (const mediciones of Object.values(valor as HistorialMediciones)) {
    if (Array.isArray(mediciones) && mediciones.length > 0) {
      todasLasMediciones.push(...mediciones)
      totalProtocolos++
    }
  }

  return {
    tipo: 'historial',
    datos: todasLasMediciones,
    totalProtocolos
  }
}

// ============================================================================
// TIPOS
// ============================================================================

/** Tendencia posible de una medición */
export type TendenciaMedicion = 'subiendo' | 'bajando' | 'estable'

/** Estadísticas calculadas para un conjunto de mediciones */
export interface EstadisticasChart {
  promedio: number
  minimo: number
  maximo: number
  ultimoValor: number | null
  tendencia: TendenciaMedicion
  cambioPorcentaje: number | null
  valorAnterior: number | null
}

/** Configuración de Chart.js generada */
export interface ConfigChartJS {
  type: 'line'
  data: DatosGrafico
  options: {
    responsive: boolean
    maintainAspectRatio: boolean
    plugins: {
      legend: {
        display: boolean
        position: 'top' | 'bottom' | 'left' | 'right'
      }
      tooltip: {
        mode: 'index' | 'point'
        intersect: boolean
      }
    }
    scales: {
      x: {
        display: boolean
        grid: {
          display: boolean
        }
        ticks: {
          display: boolean
        }
      }
      y: {
        display: boolean
        beginAtZero: boolean
        grid: {
          display: boolean
        }
        ticks: {
          display: boolean
        }
      }
    }
    elements: {
      line: {
        tension: number
      }
      point: {
        radius: number
        hoverRadius: number
      }
    }
  }
}

/** Retorno del composable useChartData */
export interface RetornoUseChartData {
  /** Datos procesados listos para Chart.js */
  datosGrafico: ComputedRef<DatosGrafico>
  /** Estadísticas calculadas de las mediciones */
  estadisticas: ComputedRef<EstadisticasChart>
  /** Configuración completa para Chart.js */
  configChart: ComputedRef<ConfigChartJS>
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Filtra mediciones por tipo específico
 */
function filtrarPorTipo(mediciones: Medicion[], tipo: TipoMedicion): Medicion[] {
  return mediciones.filter((m) => m.tipo === tipo)
}

/**
 * Agrupa mediciones por fecha
 * Las mediciones del mismo día se agrupan juntas
 */
function agruparPorFecha(mediciones: Medicion[]): Map<string, Medicion[]> {
  const grupos = new Map<string, Medicion[]>()

  mediciones.forEach((medicion) => {
    const fecha = new Date(medicion.fecha).toISOString().split('T')[0]

    if (!grupos.has(fecha)) {
      grupos.set(fecha, [])
    }

    grupos.get(fecha)!.push(medicion)
  })

  return grupos
}

/**
 * Extrae valores de presión (sistólica/diastólica) de una medición
 * @returns Tupla [sistólica, diastólica] o null si el formato es inválido
 */
function extraerValoresPresion(valor: string): [number, number] | null {
  if (!valor.includes('/')) return null

  const partes = valor.split('/')
  if (partes.length !== 2) return null

  const sistolica = parseFloat(partes[0].trim())
  const diastolica = parseFloat(partes[1].trim())

  if (isNaN(sistolica) || isNaN(diastolica)) return null

  return [sistolica, diastolica]
}

/**
 * Extrae valor numérico de una medición
 * @returns El valor numérico o null si no es válido
 */
function extraerValorNumerico(valor: string): number | null {
  const numero = parseFloat(valor)
  return isNaN(numero) ? null : numero
}

/**
 * Genera etiquetas formateadas para el eje X (C1, C2, C3...)
 */
function generarLabels(cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, i) => `C${i + 1}`)
}

/**
 * Calcula el promedio de un array de números
 */
function calcularPromedio(valores: number[]): number {
  if (valores.length === 0) return 0
  return valores.reduce((sum, val) => sum + val, 0) / valores.length
}

/** Información completa de tendencia */
interface InfoTendencia {
  direccion: TendenciaMedicion
  cambioPorcentaje: number | null
  valorAnterior: number | null
}

/**
 * Calcula la tendencia comparando el último valor con el anterior
 * Retorna información completa incluyendo dirección y porcentaje de cambio
 */
function calcularTendencia(valores: number[]): InfoTendencia {
  if (valores.length < 2) {
    return {
      direccion: 'estable',
      cambioPorcentaje: null,
      valorAnterior: null
    }
  }

  const ultimo = valores[valores.length - 1]
  const anterior = valores[valores.length - 2]

  if (anterior === 0) {
    return {
      direccion: 'estable',
      cambioPorcentaje: null,
      valorAnterior: anterior
    }
  }

  const cambioPorcentaje = ((ultimo - anterior) / anterior) * 100

  if (Math.abs(cambioPorcentaje) < UMBRAL_TENDENCIA_ESTABLE) {
    return {
      direccion: 'estable',
      cambioPorcentaje,
      valorAnterior: anterior
    }
  }

  return {
    direccion: cambioPorcentaje > 0 ? 'subiendo' : 'bajando',
    cambioPorcentaje,
    valorAnterior: anterior
  }
}

// ============================================================================
// PROCESADORES DE DATOS
// ============================================================================

/**
 * Procesa datos para gráficos de presión arterial
 * Genera dos datasets: sistólica y diastólica
 */
function procesarDatosPresion(mediciones: Medicion[]): DatosGrafico {
  const medicionesPresion = filtrarPorTipo(mediciones, 'presion')

  if (medicionesPresion.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const grupos = agruparPorFecha(medicionesPresion)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valoresSistolica: number[] = []
  const valoresDiastolica: number[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!

    // Tomar el último valor del día para cada tipo
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]
    const valores = extraerValoresPresion(ultimaMedicion.valor)

    if (valores) {
      valoresSistolica.push(valores[0])
      valoresDiastolica.push(valores[1])
    }
  })

  return {
    labels: generarLabels(valoresSistolica.length),
    datasets: [
      {
        label: 'Presión Sistólica',
        data: valoresSistolica,
        borderColor: COLORES_PRESION.sistolica,
        backgroundColor: COLORES_PRESION.sistolica,
        tipo: 'linea'
      },
      {
        label: 'Presión Diastólica',
        data: valoresDiastolica,
        borderColor: COLORES_PRESION.diastolica,
        backgroundColor: COLORES_PRESION.diastolica,
        tipo: 'linea'
      }
    ]
  }
}

/**
 * Procesa datos para gráficos de glicemia
 * Filtra valores numéricos positivos sin formato de presión
 */
function procesarDatosGlicemia(mediciones: Medicion[]): DatosGrafico {
  const medicionesGlucosa = filtrarPorTipo(mediciones, 'glucosa')

  if (medicionesGlucosa.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const grupos = agruparPorFecha(medicionesGlucosa)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valores: number[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]

    // Filtrar valores que no contengan '/' (no son presión)
    if (!ultimaMedicion.valor.includes('/')) {
      const valorNumerico = extraerValorNumerico(ultimaMedicion.valor)
      if (valorNumerico !== null && valorNumerico > 0) {
        valores.push(valorNumerico)
      }
    }
  })

  return {
    labels: generarLabels(valores.length),
    datasets: [
      {
        label: 'Glicemia',
        data: valores,
        borderColor: COLORES_GLICEMIA.linea,
        backgroundColor: COLORES_GLICEMIA.area,
        tipo: 'area'
      }
    ]
  }
}

/**
 * Procesa datos para gráficos de peso
 * Filtra valores numéricos entre 0 y 500 kg
 */
function procesarDatosPeso(mediciones: Medicion[]): DatosGrafico {
  const medicionesPeso = filtrarPorTipo(mediciones, 'peso')

  if (medicionesPeso.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const grupos = agruparPorFecha(medicionesPeso)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valores: number[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]

    const valorNumerico = extraerValorNumerico(ultimaMedicion.valor)
    if (valorNumerico !== null && valorNumerico > PESO_MINIMO && valorNumerico <= PESO_MAXIMO) {
      valores.push(valorNumerico)
    }
  })

  return {
    labels: generarLabels(valores.length),
    datasets: [
      {
        label: 'Peso Corporal',
        data: valores,
        borderColor: COLOR_PESO,
        backgroundColor: COLOR_PESO,
        tipo: 'linea'
      }
    ]
  }
}

/**
 * Procesa datos según el tipo de medición
 */
function procesarDatos(mediciones: Medicion[], tipo: TipoMedicion): DatosGrafico {
  switch (tipo) {
    case 'presion':
      return procesarDatosPresion(mediciones)
    case 'glucosa':
      return procesarDatosGlicemia(mediciones)
    case 'peso':
      return procesarDatosPeso(mediciones)
    default:
      return {
        labels: [],
        datasets: []
      }
  }
}

// ============================================================================
// CALCULADORAS DE ESTADÍSTICAS
// ============================================================================

/**
 * Calcula estadísticas para datos de presión
 * Usa los valores sistólicos para el cálculo
 */
function calcularEstadisticasPresion(mediciones: Medicion[]): EstadisticasChart {
  const valoresSistolica: number[] = []

  mediciones.forEach((m) => {
    const valores = extraerValoresPresion(m.valor)
    if (valores) {
      valoresSistolica.push(valores[0])
    }
  })

  if (valoresSistolica.length === 0) {
    return {
      promedio: 0,
      minimo: 0,
      maximo: 0,
      ultimoValor: null,
      tendencia: 'estable',
      cambioPorcentaje: null,
      valorAnterior: null
    }
  }

  const infoTendencia = calcularTendencia(valoresSistolica)

  return {
    promedio: Math.round(calcularPromedio(valoresSistolica)),
    minimo: Math.min(...valoresSistolica),
    maximo: Math.max(...valoresSistolica),
    ultimoValor: valoresSistolica[valoresSistolica.length - 1],
    tendencia: infoTendencia.direccion,
    cambioPorcentaje: infoTendencia.cambioPorcentaje,
    valorAnterior: infoTendencia.valorAnterior
  }
}

/**
 * Calcula estadísticas para datos de glicemia
 */
function calcularEstadisticasGlicemia(mediciones: Medicion[]): EstadisticasChart {
  const valores: number[] = []

  mediciones.forEach((m) => {
    if (m.valor.includes('/')) return

    const valorNumerico = extraerValorNumerico(m.valor)
    if (valorNumerico !== null && valorNumerico > 0) {
      valores.push(valorNumerico)
    }
  })

  if (valores.length === 0) {
    return {
      promedio: 0,
      minimo: 0,
      maximo: 0,
      ultimoValor: null,
      tendencia: 'estable',
      cambioPorcentaje: null,
      valorAnterior: null
    }
  }

  const infoTendencia = calcularTendencia(valores)

  return {
    promedio: Math.round(calcularPromedio(valores)),
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
    ultimoValor: valores[valores.length - 1],
    tendencia: infoTendencia.direccion,
    cambioPorcentaje: infoTendencia.cambioPorcentaje,
    valorAnterior: infoTendencia.valorAnterior
  }
}

/**
 * Calcula estadísticas para datos de peso
 */
function calcularEstadisticasPeso(mediciones: Medicion[]): EstadisticasChart {
  const valores: number[] = []

  mediciones.forEach((m) => {
    const valorNumerico = extraerValorNumerico(m.valor)
    if (valorNumerico !== null && valorNumerico > PESO_MINIMO && valorNumerico <= PESO_MAXIMO) {
      valores.push(valorNumerico)
    }
  })

  if (valores.length === 0) {
    return {
      promedio: 0,
      minimo: 0,
      maximo: 0,
      ultimoValor: null,
      tendencia: 'estable',
      cambioPorcentaje: null,
      valorAnterior: null
    }
  }

  const infoTendencia = calcularTendencia(valores)

  return {
    promedio: parseFloat(calcularPromedio(valores).toFixed(1)),
    minimo: parseFloat(Math.min(...valores).toFixed(1)),
    maximo: parseFloat(Math.max(...valores).toFixed(1)),
    ultimoValor: parseFloat(valores[valores.length - 1].toFixed(1)),
    tendencia: infoTendencia.direccion,
    cambioPorcentaje: infoTendencia.cambioPorcentaje,
    valorAnterior: infoTendencia.valorAnterior
  }
}

/**
 * Calcula estadísticas según el tipo de medición
 */
function calcularEstadisticas(mediciones: Medicion[], tipo: TipoMedicion): EstadisticasChart {
  switch (tipo) {
    case 'presion':
      return calcularEstadisticasPresion(mediciones)
    case 'glucosa':
      return calcularEstadisticasGlicemia(mediciones)
    case 'peso':
      return calcularEstadisticasPeso(mediciones)
    default:
      return {
        promedio: 0,
        minimo: 0,
        maximo: 0,
        ultimoValor: null,
        tendencia: 'estable',
        cambioPorcentaje: null,
        valorAnterior: null
      }
  }
}

// ============================================================================
// GENERADORES DE CONFIGURACIÓN
// ============================================================================

/**
 * Genera la configuración completa para Chart.js
 */
function generarConfigChartJS(datos: DatosGrafico, tipo: TipoMedicion): ConfigChartJS {
  const esArea = tipo === 'glucosa'

  return {
    type: 'line',
    data: datos,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: datos.datasets.length > 1,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            display: true
          }
        },
        y: {
          display: true,
          beginAtZero: false,
          grid: {
            display: true
          },
          ticks: {
            display: true
          }
        }
      },
      elements: {
        line: {
          tension: TENSION_LINEA
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    }
  }
}

// ============================================================================
// COMPOSABLE PRINCIPAL
// ============================================================================

/**
 * Composable para procesar datos de mediciones y generar configuraciones de gráficos
 *
 * @param mediciones - Array de mediciones (puede ser ref, getter o valor plano)
 * @param tipo - Tipo de medición a procesar (puede ser ref, getter o valor plano)
 * @returns Objeto con datos procesados, estadísticas y configuración de Chart.js
 *
 * @example
 * ```ts
 * // Uso básico
 * const { datosGrafico, estadisticas, configChart } = useChartData(
 *   ref(mediciones),
 *   'presion'
 * )
 *
 * // Uso con getters
 * const { datosGrafico } = useChartData(
 *   () => store.mediciones,
 *   () => tipoSeleccionado.value
 * )
 * ```
 */
export function useChartData(
  mediciones: MedicionesInput,
  tipo: MaybeRefOrGetter<TipoMedicion>
): RetornoUseChartData {
  /**
   * Entrada normalizada - siempre retorna un array plano de mediciones
   * Se recalcula automáticamente cuando cambia la entrada
   * 
   * Optimización: Usa detectarTipoEntrada() que solo recorre el historial
   * una vez para aplanarlo, evitando múltiples recorridos.
   */
  const medicionesNormalizadas = computed<Medicion[]>(() => {
    const entrada = toValue(mediciones)
    
    if (!entrada) {
      return []
    }
    
    // Detectar tipo y normalizar a array plano
    const { datos } = detectarTipoEntrada(entrada)
    return datos
  })

  /**
   * Datos procesados para Chart.js
   * Se recalcula automáticamente cuando cambian las mediciones o el tipo
   */
  const datosGrafico = computed<DatosGrafico>(() => {
    const meds = medicionesNormalizadas.value
    const tipoMed = toValue(tipo)

    if (!meds || meds.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    return procesarDatos(meds, tipoMed)
  })

  /**
   * Estadísticas calculadas de las mediciones
   * Incluye promedio, mínimo, máximo, último valor y tendencia
   */
  const estadisticas = computed<EstadisticasChart>(() => {
    const meds = medicionesNormalizadas.value
    const tipoMed = toValue(tipo)

    if (!meds || meds.length === 0) {
      return {
        promedio: 0,
        minimo: 0,
        maximo: 0,
        ultimoValor: null,
        tendencia: 'estable',
        cambioPorcentaje: null,
        valorAnterior: null
      }
    }

    return calcularEstadisticas(meds, tipoMed)
  })

  /**
   * Configuración completa para Chart.js
   * Lista para ser usada directamente en un componente Chart
   */
  const configChart = computed<ConfigChartJS>(() => {
    const tipoMed = toValue(tipo)

    return generarConfigChartJS(datosGrafico.value, tipoMed)
  })

  return {
    datosGrafico,
    estadisticas,
    configChart
  }
}

export default useChartData

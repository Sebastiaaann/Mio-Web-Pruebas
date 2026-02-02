/**
 * Utilidades puras para procesamiento de mediciones de salud
 * 
 * Este archivo centraliza la lógica de procesamiento de mediciones que es
 * compartida entre múltiples composables (useMediciones, useChartData, etc.)
 * 
 * Proporciona funciones para:
 * - Extraer valores numéricos de diferentes formatos
 * - Calcular tendencias entre mediciones
 * - Filtrar y agrupar mediciones
 * - Normalizar datos para gráficos
 * 
 * @example
 * ```ts
 * import { 
 *   extraerValorNumerico, 
 *   calcularTendenciaMedicion,
 *   filtrarMedicionesPorTipo,
 *   agruparMedicionesPorFecha 
 * } from '@/utils/mediciones'
 * ```
 */

import type { Medicion, TipoMedicion, HistorialMediciones } from '@/types/salud'

// ============================================================================
// CONSTANTES
// ============================================================================

/** Umbral de porcentaje para considerar una tendencia estable */
export const UMBRAL_TENDENCIA_ESTABLE = 5

/** Valor mínimo válido para peso (en kg) */
export const PESO_MINIMO_VALIDO = 0

/** Valor máximo válido para peso (en kg) */
export const PESO_MAXIMO_VALIDO = 500

/** Valor mínimo válido para glicemia (en mg/dL) */
export const GLICEMIA_MINIMO_VALIDO = 0

/** Colores para gráficos de presión arterial */
export const COLORES_PRESION = {
  sistolica: '#DC2626',
  diastolica: '#F87171'
} as const

/** Colores para gráficos de glicemia */
export const COLORES_GLICEMIA = {
  linea: '#3B82F6',
  area: 'rgba(59, 130, 246, 0.2)'
} as const

/** Color para gráficos de peso */
export const COLOR_PESO = '#FF9500' as const

/** Tensión de la línea para curvas suavizadas en gráficos */
export const TENSION_LINEA_GRAFICO = 0.4

/** Número máximo de mediciones a mostrar en gráficos */
export const MAX_MEDICIONES_GRAFICO = 7

// ============================================================================
// TIPOS
// ============================================================================

/** Dirección de tendencia */
export type DireccionTendencia = 'up' | 'down' | 'stable' | 'subiendo' | 'bajando'

/** Información de tendencia calculada */
export interface InfoTendencia {
  direccion: DireccionTendencia
  cambio: number | null
  porcentaje: number | null
  valorAnterior: number | null
}

/** Valores de presión extraídos */
export interface ValoresPresion {
  sistolica: number
  diastolica: number
}

/** Medición con datos procesados para gráficos */
export interface MedicionResumen {
  valor: number
  fecha: string
  fechaStr: string
  altura?: number
  valorCompleto?: string
}

/** Datos resumen para gráficos */
export interface DatosResumenMediciones {
  promedio: string | number
  mediciones: MedicionResumen[]
  tieneDatos: boolean
}

/** Tipo de entrada flexible para mediciones */
export type EntradaMediciones = Medicion[] | HistorialMediciones

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Verifica si un valor es un array de mediciones
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
 * Verifica si un valor es un HistorialMediciones
 */
export function esHistorialMediciones(valor: unknown): valor is HistorialMediciones {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    return false
  }

  const entradas = Object.entries(valor)
  
  if (entradas.length === 0) {
    return true
  }

  return entradas.every(([clave, valorArray]) => {
    if (typeof clave !== 'string') return false
    if (!Array.isArray(valorArray)) return false
    
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
// EXTRACCIÓN DE VALORES
// ============================================================================

/**
 * Extrae valor numérico de una medición según su tipo
 * 
 * @param valor - Valor de la medición (string o number)
 * @param tipo - Tipo de medición
 * @returns Valor numérico extraído o null si no es válido
 */
export function extraerValorNumerico(
  valor: string | number | null | undefined,
  tipo: TipoMedicion
): number | null {
  if (valor === null || valor === undefined) return null
  if (typeof valor === 'number') return valor
  if (!valor || valor === '--' || valor === 'N/A') return null

  // Para presión, extraer valor sistólico (antes del /)
  if (tipo === 'presion' && valor.includes('/')) {
    const sistolica = parseFloat(valor.split('/')[0])
    return isNaN(sistolica) ? null : sistolica
  }

  const numero = parseFloat(valor)
  return isNaN(numero) ? null : numero
}

/**
 * Extrae valores sistólica y diastólica de una medición de presión
 * 
 * @param valor - Valor de presión en formato "120/80"
 * @returns Objeto con sistólica y diastólica, o null si el formato es inválido
 */
export function extraerValoresPresion(valor: string | number): ValoresPresion | null {
  const valorStr = typeof valor === 'number' ? valor.toString() : valor
  if (!valorStr.includes('/')) return null

  const partes = valorStr.split('/')
  if (partes.length !== 2) return null

  const sistolica = parseFloat(partes[0].trim())
  const diastolica = parseFloat(partes[1].trim())

  if (isNaN(sistolica) || isNaN(diastolica)) return null

  return { sistolica, diastolica }
}

/**
 * Valida si un valor de peso está dentro del rango válido
 */
export function esPesoValido(valor: number): boolean {
  return valor > PESO_MINIMO_VALIDO && valor <= PESO_MAXIMO_VALIDO
}

/**
 * Valida si un valor de glicemia es válido
 */
export function esGlicemiaValida(valor: number): boolean {
  return valor > GLICEMIA_MINIMO_VALIDO
}

// ============================================================================
// CÁLCULO DE TENDENCIAS
// ============================================================================

/**
 * Calcula la tendencia entre dos valores numéricos
 * 
 * @param actual - Valor actual
 * @param anterior - Valor anterior para comparación
 * @returns Objeto con información de tendencia
 */
export function calcularTendencia(
  actual: number | null,
  anterior: number | null
): InfoTendencia {
  if (actual === null || anterior === null || anterior === 0) {
    return {
      direccion: 'stable',
      cambio: null,
      porcentaje: null,
      valorAnterior: anterior
    }
  }

  const diferencia = actual - anterior
  const porcentaje = (diferencia / anterior) * 100

  // Umbral para considerar estable
  if (Math.abs(porcentaje) < UMBRAL_TENDENCIA_ESTABLE) {
    return {
      direccion: 'stable',
      cambio: diferencia,
      porcentaje,
      valorAnterior: anterior
    }
  }

  const direccion: DireccionTendencia = diferencia > 0 ? 'up' : 'down'

  return {
    direccion,
    cambio: diferencia,
    porcentaje,
    valorAnterior: anterior
  }
}

/**
 * Calcula tendencia para una medición específica considerando su tipo
 * 
 * @param actual - Valor actual de la medición
 * @param anterior - Valor anterior para comparación
 * @param tipo - Tipo de medición
 * @returns Información de tendencia
 */
export function calcularTendenciaMedicion(
  actual: string | number | null,
  anterior: string | number | null,
  tipo: TipoMedicion
): InfoTendencia {
  const valorActual = extraerValorNumerico(actual, tipo)
  const valorAnterior = extraerValorNumerico(anterior, tipo)
  
  return calcularTendencia(valorActual, valorAnterior)
}

/**
 * Calcula tendencia de un array de valores numéricos
 * Compara el último valor con el anterior
 */
export function calcularTendenciaDesdeArray(valores: number[]): InfoTendencia {
  if (valores.length < 2) {
    return {
      direccion: 'stable',
      cambio: null,
      porcentaje: null,
      valorAnterior: null
    }
  }

  const ultimo = valores[valores.length - 1]
  const anterior = valores[valores.length - 2]

  return calcularTendencia(ultimo, anterior)
}

// ============================================================================
// FILTRADO Y AGRUPAMIENTO
// ============================================================================

/**
 * Filtra mediciones por tipo específico
 */
export function filtrarMedicionesPorTipo(
  mediciones: Medicion[],
  tipo: TipoMedicion
): Medicion[] {
  return mediciones.filter((m) => m.tipo === tipo)
}

/**
 * Agrupa mediciones por fecha
 * Las mediciones del mismo día se agrupan juntas
 */
export function agruparMedicionesPorFecha(
  mediciones: Medicion[]
): Map<string, Medicion[]> {
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
 * Ordena mediciones por fecha (más reciente primero o último)
 */
export function ordenarMedicionesPorFecha(
  mediciones: Medicion[],
  orden: 'asc' | 'desc' = 'asc'
): Medicion[] {
  return [...mediciones].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime()
    const fechaB = new Date(b.fecha).getTime()
    return orden === 'asc' ? fechaA - fechaB : fechaB - fechaA
  })
}

/**
 * Obtiene la última medición de un tipo específico desde el historial
 */
export function obtenerUltimaMedicionPorTipo(
  historial: HistorialMediciones,
  tipo: TipoMedicion
): { actual: Medicion | null; anterior: Medicion | null } {
  let actual: Medicion | null = null
  let anterior: Medicion | null = null

  Object.values(historial).forEach((historialProtocolo) => {
    if (!Array.isArray(historialProtocolo)) return

    const medicionTipo = historialProtocolo.find((m) => m.tipo === tipo)
    if (!medicionTipo) return

    const fechaMedicion = new Date(medicionTipo.fecha)
    const fechaActual = actual ? new Date(actual.fecha) : null

    if (!fechaActual || fechaMedicion > fechaActual) {
      anterior = actual
      actual = medicionTipo
    }
  })

  return { actual, anterior }
}

// ============================================================================
// NORMALIZACIÓN PARA GRÁFICOS
// ============================================================================

/**
 * Normaliza valores para gráfico (escala 0-100%)
 */
export function normalizarAlturasGrafico(
  mediciones: MedicionResumen[]
): MedicionResumen[] {
  if (mediciones.length === 0) return mediciones

  const valores = mediciones.map((m) => m.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1

  return mediciones.map((m) => ({
    ...m,
    altura: Math.max(20, Math.min(100, ((m.valor - min) / rango) * 80 + 20))
  }))
}

/**
 * Calcula el promedio de un array de números
 */
export function calcularPromedio(valores: number[]): number {
  if (valores.length === 0) return 0
  return valores.reduce((sum, val) => sum + val, 0) / valores.length
}

/**
 * Genera etiquetas genéricas para el eje X (C1, C2, C3...)
 */
export function generarLabelsGenericos(cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, i) => `C${i + 1}`)
}

// ============================================================================
// PROCESAMIENTO ESPECÍFICO POR TIPO
// ============================================================================

/**
 * Procesa mediciones de presión arterial
 * Retorna valores sistólicos y diastólicos separados
 */
export function procesarMedicionesPresion(
  mediciones: Medicion[]
): { fechas: string[]; sistolica: number[]; diastolica: number[] } {
  const medicionesPresion = filtrarMedicionesPorTipo(mediciones, 'presion')
  
  if (medicionesPresion.length === 0) {
    return { fechas: [], sistolica: [], diastolica: [] }
  }

  const grupos = agruparMedicionesPorFecha(medicionesPresion)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valoresSistolica: number[] = []
  const valoresDiastolica: number[] = []
  const fechas: string[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]
    const valores = extraerValoresPresion(ultimaMedicion.valor)

    if (valores) {
      fechas.push(fecha)
      valoresSistolica.push(valores.sistolica)
      valoresDiastolica.push(valores.diastolica)
    }
  })

  return { fechas, sistolica: valoresSistolica, diastolica: valoresDiastolica }
}

/**
 * Procesa mediciones de peso
 * Filtra valores inválidos y retorna valores numéricos
 */
export function procesarMedicionesPeso(
  mediciones: Medicion[]
): { fechas: string[]; valores: number[] } {
  const medicionesPeso = filtrarMedicionesPorTipo(mediciones, 'peso')
  
  if (medicionesPeso.length === 0) {
    return { fechas: [], valores: [] }
  }

  const grupos = agruparMedicionesPorFecha(medicionesPeso)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valores: number[] = []
  const fechas: string[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]

    const valorNumerico = extraerValorNumerico(ultimaMedicion.valor, 'peso')
    if (valorNumerico !== null && esPesoValido(valorNumerico)) {
      fechas.push(fecha)
      valores.push(valorNumerico)
    }
  })

  return { fechas, valores }
}

/**
 * Procesa mediciones de glicemia
 * Filtra valores inválidos y de presión
 */
export function procesarMedicionesGlicemia(
  mediciones: Medicion[]
): { fechas: string[]; valores: number[] } {
  const medicionesGlucosa = filtrarMedicionesPorTipo(mediciones, 'glucosa')
  
  if (medicionesGlucosa.length === 0) {
    return { fechas: [], valores: [] }
  }

  const grupos = agruparMedicionesPorFecha(medicionesGlucosa)
  const fechasOrdenadas = Array.from(grupos.keys()).sort()

  const valores: number[] = []
  const fechas: string[] = []

  fechasOrdenadas.forEach((fecha) => {
    const medsDelDia = grupos.get(fecha)!
    const ultimaMedicion = medsDelDia[medsDelDia.length - 1]

    // Filtrar valores que no contengan '/' (no son presión)
    if (!String(ultimaMedicion.valor).includes('/')) {
      const valorNumerico = extraerValorNumerico(ultimaMedicion.valor, 'glucosa')
      if (valorNumerico !== null && esGlicemiaValida(valorNumerico)) {
        fechas.push(fecha)
        valores.push(valorNumerico)
      }
    }
  })

  return { fechas, valores }
}

// ============================================================================
// UTILIDADES DE FORMATEO
// ============================================================================

/**
 * Formatea un valor numérico según el tipo de medición
 */
export function formatearValorMedicion(
  valor: number,
  tipo: TipoMedicion
): string {
  switch (tipo) {
    case 'peso':
      return valor.toFixed(1)
    case 'presion':
      return Math.round(valor).toString()
    case 'glucosa':
      return Math.round(valor).toString()
    default:
      return valor.toString()
  }
}

/**
 * Obtiene la unidad de medida para un tipo
 */
export function obtenerUnidadPorTipo(tipo: TipoMedicion): string {
  const unidades: Record<TipoMedicion, string> = {
    peso: 'kg',
    presion: 'mmHg',
    glucosa: 'mg/dL',
    frecuencia: 'bpm',
    temperatura: '°C',
    general: ''
  }
  
  return unidades[tipo] || ''
}

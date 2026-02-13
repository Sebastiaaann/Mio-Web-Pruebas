/**
 * Composable para gestionar y procesar mediciones de salud
 *
 * Proporciona funcionalidades para:
 * - Mapear controles a display de mediciones
 * - Calcular datos resumen para gráficos (peso y presión)
 * - Calcular tendencias entre mediciones
 * - Generar paths SVG para gráficos
 *
 * @example
 * ```ts
 * const {
 *   medicionesDisplay,
 *   datosResumenPeso,
 *   datosResumenPresion,
 *   calcularTendencia,
 *   generarPathPresion,
 *   generarYUltimoPunto
 * } = useMediciones({
 *   controlesProximos,
 *   historialMediciones,
 *   ultimaMedicion
 * })
 * ```
 */

import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from 'vue'
import type { Control, Medicion, TipoMedicion, HistorialMediciones } from '@/types'
import { formatDateFriendly } from '@/composables/useFormatoFecha'
import {
  extraerValorNumerico,
  extraerValoresPresion,
  calcularTendencia,
  UMBRAL_TENDENCIA_ESTABLE,
  MAX_MEDICIONES_GRAFICO
} from '@/utils/mediciones'
import { formatearFechaCorta } from '@/utils/fecha'

// ============================================================================
// INTERFACES
// ============================================================================

/** Configuración de un control requerido para display */
interface ConfiguracionControl {
  id: string
  nombre: string
  tipo: TipoMedicion
  icono: string
  color: string
  bg: string
  unidad: string
}

/** Información de tendencia calculada */
export interface Tendencia {
  direccion: 'up' | 'down' | 'stable'
  cambio: number | null
  porcentaje: number | null
}

/** Datos de medición para display en UI */
export interface MedicionDisplay {
  key: string
  title: string
  icon: string
  color: string
  bg: string
  unit: string
  value: string | number
  status: string
  statusClass: string
  date: string
  tendencia: Tendencia | null
}

/** Datos de medición para gráficos */
interface MedicionResumen {
  valor: number
  fecha: string
  fechaStr: string
  altura?: number
  valorCompleto?: string
}

/** Datos resumen para gráficos */
export interface DatosResumen {
  promedio: string | number
  mediciones: MedicionResumen[]
  tieneDatos: boolean
}

/** Opciones del composable useMediciones */
export interface OpcionesUseMediciones {
  /** Lista de controles próximos del paciente */
  controlesProximos: MaybeRefOrGetter<Control[]>
  /** Historial de mediciones por protocolo */
  historialMediciones: MaybeRefOrGetter<HistorialMediciones>
  /** Última medición registrada */
  ultimaMedicion: MaybeRefOrGetter<Medicion | null>
}

/** Retorno del composable useMediciones */
export interface RetornoUseMediciones {
  /** Mediciones formateadas para display en UI */
  medicionesDisplay: ComputedRef<MedicionDisplay[]>
  /** Datos resumen para gráfico de peso */
  datosResumenPeso: ComputedRef<DatosResumen>
  /** Datos resumen para gráfico de presión */
  datosResumenPresion: ComputedRef<DatosResumen>
  /** Calcula tendencia entre dos valores */
  calcularTendencia: (actual: string | number | null, anterior: string | number | null, tipo: TipoMedicion) => Tendencia
  /** Genera path SVG para gráfico de presión */
  generarPathPresion: (mediciones: MedicionResumen[], areaCompleta?: boolean) => string
  /** Calcula coordenada Y del último punto para SVG */
  generarYUltimoPunto: (mediciones: MedicionResumen[]) => number
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Configuración de los 4 controles requeridos para display */
const CONTROLES_REQUERIDOS: ConfiguracionControl[] = [
  {
    id: 'peso',
    nombre: 'Control de Peso',
    tipo: 'peso',
    icono: 'scale',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    unidad: 'kg'
  },
  {
    id: 'presion',
    nombre: 'Control Presión Arterial',
    tipo: 'presion',
    icono: 'heart-pulse',
    color: 'text-alert-red',
    bg: 'bg-red-50',
    unidad: 'mmHg'
  },
  {
    id: 'glicemia',
    nombre: 'Glicemia',
    tipo: 'glucosa',
    icono: 'droplet',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    unidad: 'mg/dL'
  },
  {
    id: 'diabetes',
    nombre: 'Control Diabetes',
    tipo: 'glucosa',
    icono: 'activity',
    color: 'text-green-500',
    bg: 'bg-green-50',
    unidad: 'mg/dL'
  }
]

/** Mapeo de estados de medición a clases CSS */
const CLASES_ESTADO: Record<string, { texto: string; clase: string }> = {
  normal: { texto: 'Normal', clase: 'bg-health-green/10 text-health-green' },
  none: { texto: 'Normal', clase: 'bg-health-green/10 text-health-green' },
  alerta: { texto: 'Alerta', clase: 'bg-alert-red/10 text-alert-red' },
  alert: { texto: 'Alerta', clase: 'bg-alert-red/10 text-alert-red' },
  critico: { texto: 'Crítico', clase: 'bg-red-600/10 text-red-600' },
  critical: { texto: 'Crítico', clase: 'bg-red-600/10 text-red-600' }
}

// Nota: MAX_MEDICIONES_GRAFICO se importa desde @/utils/mediciones

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Busca un control real en la lista que coincida con el tipo requerido
 */
function buscarControlReal(
  controlesProximos: Control[],
  tipoBuscado: TipoMedicion
): Control | undefined {
  return controlesProximos.find((control) => {
    const nombreLower = control.nombre.toLowerCase()

    switch (tipoBuscado) {
      case 'peso':
        return nombreLower.includes('peso') || nombreLower.includes('masa')
      case 'presion':
        return nombreLower.includes('presi') || nombreLower.includes('arterial')
      case 'glucosa':
        return nombreLower.includes('gluc') || nombreLower.includes('glic') || nombreLower.includes('diabetes')
      default:
        return false
    }
  })
}

/**
 * Busca la última medición de un tipo específico en todo el historial
 * Recolecta TODAS las mediciones del tipo y devuelve la más reciente y la anterior
 */
function buscarMedicionEnHistorial(
  historial: HistorialMediciones,
  tipo: TipoMedicion
): { actual: Medicion | null; anterior: Medicion | null; todas: Medicion[] } {
  const todasLasMediciones: Medicion[] = []

  // Recolectar TODAS las mediciones del tipo de TODO el historial
  Object.values(historial).forEach((historialProtocolo) => {
    if (!Array.isArray(historialProtocolo)) return

    historialProtocolo.forEach((m) => {
      if (m.tipo === tipo) {
        todasLasMediciones.push(m)
      }
    })
  })

  // Ordenar por fecha (más reciente primero)
  todasLasMediciones.sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime()
    const fechaB = new Date(b.fecha).getTime()
    return fechaB - fechaA
  })

  return {
    actual: todasLasMediciones[0] || null,
    anterior: todasLasMediciones[1] || null,
    todas: todasLasMediciones
  }
}

/**
 * Normaliza valores para gráfico (escala 0-100%)
 */
function normalizarAlturas(mediciones: MedicionResumen[]): MedicionResumen[] {
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

// ============================================================================
// COMPOSABLE PRINCIPAL
// ============================================================================

/**
 * Composable para gestionar mediciones de salud
 *
 * @param opciones - Opciones de configuración con datos reactivos
 * @returns Objeto con datos procesados y funciones helper
 */
export function useMediciones(opciones: OpcionesUseMediciones): RetornoUseMediciones {
  const { controlesProximos, historialMediciones, ultimaMedicion } = opciones

  /**
   * Calcula la tendencia entre dos valores de medición
   *
   * @param actual - Valor actual de la medición
   * @param anterior - Valor anterior para comparación
   * @param tipo - Tipo de medición
   * @returns Objeto con dirección, cambio y porcentaje
   */
  const calcularTendencia = (
    actual: string | number | null,
    anterior: string | number | null,
    tipo: TipoMedicion
  ): Tendencia => {
    const valorActual = extraerValorNumerico(actual, tipo)
    const valorAnterior = extraerValorNumerico(anterior, tipo)

    if (valorActual === null || valorAnterior === null || valorAnterior === 0) {
      return { direccion: 'stable', cambio: null, porcentaje: null }
    }

    const diferencia = valorActual - valorAnterior
    const porcentaje = (diferencia / valorAnterior) * 100

    // Umbral para considerar estable
    if (Math.abs(porcentaje) < UMBRAL_TENDENCIA_ESTABLE) {
      return { direccion: 'stable', cambio: diferencia, porcentaje }
    }

    const direccion: 'up' | 'down' = diferencia > 0 ? 'up' : 'down'

    return { direccion, cambio: diferencia, porcentaje }
  }

  /**
   * Genera un path SVG suavizado para gráfico de presión
   *
   * @param mediciones - Lista de mediciones a graficar
   * @param areaCompleta - Si es true, genera path cerrado para área rellena
   * @returns String con el path SVG
   */
  const generarPathPresion = (mediciones: MedicionResumen[], areaCompleta = false): string => {
    if (mediciones.length < 2) return ''

    const valores = mediciones.map((m) => m.valor)
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const rango = max - min || 1

    // Normalizar valores a coordenadas Y (0-50, invertido) con padding superior
    const puntos = mediciones.map((m, idx) => {
      const x = (idx / (mediciones.length - 1)) * 100
      // Entre 10 y 40 (con padding de 10 arriba y 10 abajo)
      const y = 40 - ((m.valor - min) / rango) * 25 - 5
      return `${x},${y}`
    })

    // Crear path con curvas Bézier suavizadas
    let path = `M${puntos[0]}`

    for (let i = 1; i < puntos.length; i++) {
      const [prevX, prevY] = puntos[i - 1].split(',').map(Number)
      const [currX, currY] = puntos[i].split(',').map(Number)

      const cpx1 = prevX + (currX - prevX) / 2
      const cpy1 = prevY
      const cpx2 = prevX + (currX - prevX) / 2
      const cpy2 = currY

      path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${currX},${currY}`
    }

    // Si se solicita área completa, cerrar el path hacia abajo y volver al inicio
    if (areaCompleta) {
      const ultimoPunto = puntos[puntos.length - 1].split(',').map(Number)
      const primerPunto = puntos[0].split(',').map(Number)
      path += ` L${ultimoPunto[0]},50 L${primerPunto[0]},50 Z`
    }

    return path
  }

  /**
   * Calcula la coordenada Y del último punto para SVG
   *
   * @param mediciones - Lista de mediciones
   * @returns Coordenada Y normalizada
   */
  const generarYUltimoPunto = (mediciones: MedicionResumen[]): number => {
    if (mediciones.length === 0) return 25

    const ultimo = mediciones[mediciones.length - 1]
    const valores = mediciones.map((m) => m.valor)
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const rango = max - min || 1

    // Entre 10 y 40 (con padding)
    return 40 - ((ultimo.valor - min) / rango) * 25 - 5
  }

  /**
   * Mediciones formateadas para display en tarjetas
   */
  const medicionesDisplay = computed<MedicionDisplay[]>(() => {
    const controles = toValue(controlesProximos)
    const historial = toValue(historialMediciones)
    const ultima = toValue(ultimaMedicion)

    return CONTROLES_REQUERIDOS.map((config) => {
      // Buscar mediciones por tipo en todo el historial
      const { actual, anterior } = buscarMedicionEnHistorial(historial, config.tipo)

      // Fallback: usar última medición global si coincide el tipo y no hay en historial
      let medicionActual = actual
      if (!medicionActual && ultima && ultima.tipo === config.tipo) {
        medicionActual = ultima
      }

      // Formatear valor
      let value = medicionActual?.valor ?? '--'
      if (value === 'N/A' || value === null || value === undefined) {
        value = '--'
      }

      // Determinar unidad y fecha
      const unit = medicionActual?.unidad || config.unidad
      const date = medicionActual?.fecha ? formatDateFriendly(medicionActual.fecha) : 'Sin registros'

      // Determinar estado y clases
      let status = 'Pendiente'
      let statusClass = 'bg-gray-bg text-gray-text-light'

      if (value === '--') {
        status = 'Sin registrar'
      } else if (medicionActual) {
        const estado = medicionActual.estado || 'normal'
        const configEstado = CLASES_ESTADO[estado]

        if (configEstado) {
          status = configEstado.texto
          statusClass = configEstado.clase
        } else {
          status = 'Registrado'
          statusClass = 'bg-primary/10 text-primary'
        }
      }

      // Calcular tendencia
      const tendencia = calcularTendencia(
        medicionActual?.valor ?? null,
        anterior?.valor ?? null,
        config.tipo
      )

      return {
        key: config.id,
        title: config.nombre,
        icon: config.icono,
        color: config.color,
        bg: config.bg,
        unit,
        value,
        status,
        statusClass,
        date,
        tendencia
      }
    })
  })

  /**
   * Datos resumen para gráfico de peso
   */
  const datosResumenPeso = computed<DatosResumen>(() => {
    const historial = toValue(historialMediciones)
    const medicionesPorFecha = new Map<string, MedicionResumen & { timestamp: number }>()

    // Recolectar todas las mediciones de peso
    Object.values(historial).forEach((historialProtocolo) => {
      if (!Array.isArray(historialProtocolo)) return

      historialProtocolo.forEach((m) => {
        if (m.tipo !== 'peso') return

        const valorNumerico = extraerValorNumerico(m.valor, 'peso')
        if (valorNumerico === null) return

        const fechaObj = new Date(m.fecha)
        const fechaKey = fechaObj.toISOString().split('T')[0]
        const timestamp = fechaObj.getTime()
        const existente = medicionesPorFecha.get(fechaKey)

        if (!existente || timestamp > existente.timestamp) {
          medicionesPorFecha.set(fechaKey, {
            valor: valorNumerico,
            fecha: m.fecha,
            fechaStr: fechaObj.toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short'
            }),
            timestamp
          })
        }
      })
    })

    const medicionesPeso: MedicionResumen[] = Array.from(medicionesPorFecha.values()).map(({ timestamp, ...rest }) => rest)

    // Ordenar por fecha y tomar las últimas
    medicionesPeso.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    const ultimasMediciones = medicionesPeso.slice(-MAX_MEDICIONES_GRAFICO)

    if (ultimasMediciones.length === 0) {
      return {
        promedio: 0,
        mediciones: [],
        tieneDatos: false
      }
    }

    // Calcular promedio
    const promedio = ultimasMediciones.reduce((sum, m) => sum + m.valor, 0) / ultimasMediciones.length

    return {
      promedio: promedio.toFixed(1),
      mediciones: normalizarAlturas(ultimasMediciones),
      tieneDatos: true
    }
  })

  /**
   * Datos resumen para gráfico de presión
   */
  const datosResumenPresion = computed<DatosResumen>(() => {
    const historial = toValue(historialMediciones)
    const medicionesPresion: MedicionResumen[] = []

    // Recolectar todas las mediciones de presión
    Object.values(historial).forEach((historialProtocolo) => {
      if (!Array.isArray(historialProtocolo)) return

      historialProtocolo.forEach((m) => {
        if (m.tipo !== 'presion') return

        const valorSistolico = extraerValorNumerico(m.valor, 'presion')
        if (valorSistolico === null) return

  medicionesPresion.push({
    valor: valorSistolico,
    valorCompleto: String(m.valor),
          fecha: m.fecha,
          fechaStr: new Date(m.fecha).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short'
          })
        })
      })
    })

    // Ordenar por fecha y usar todas las mediciones disponibles
    medicionesPresion.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    const ultimasMediciones = medicionesPresion

    if (ultimasMediciones.length === 0) {
      return {
        promedio: 0,
        mediciones: [],
        tieneDatos: false
      }
    }

    // Calcular promedio
    const promedio = ultimasMediciones.reduce((sum, m) => sum + m.valor, 0) / ultimasMediciones.length

    return {
      promedio: Math.round(promedio),
      mediciones: ultimasMediciones,
      tieneDatos: true
    }
  })

  return {
    medicionesDisplay,
    datosResumenPeso,
    datosResumenPresion,
    calcularTendencia,
    generarPathPresion,
    generarYUltimoPunto
  }
}

export default useMediciones

/**
 * Composable para gestionar el filtrado y ordenamiento de mediciones
 *
 * Este composable proporciona funcionalidades completas de filtrado y ordenamiento
 * para listas de mediciones, incluyendo filtros por tipo, fecha, estado y búsqueda
 * de texto, así como ordenamiento configurable y rangos de fechas predefinidos.
 *
 * @example
 * ```typescript
 * const { medicionesFiltradas, filtroTipo, resetearFiltros } = useFiltrosMediciones(mediciones)
 * ```
 */

import { computed, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  RangoFechas
} from '@/types/miSalud'
import type {
  Medicion,
  TipoMedicion,
  EstadoMedicion
} from '@/types/salud'
import { useDebounce } from './useDebounce'

// ============================================================================
// TIPOS
// ============================================================================

/** Campos disponibles para ordenamiento de mediciones */
type CampoOrdenamiento = 'fecha' | 'valor' | 'estado' | 'tipo'

/** Dirección del ordenamiento */
type DireccionOrdenamiento = 'asc' | 'desc'

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica si una fecha está dentro de un rango especificado
 *
 * @param fecha - Fecha a verificar
 * @param desde - Fecha inicial del rango (inclusive) o null para sin límite
 * @param hasta - Fecha final del rango (inclusive) o null para sin límite
 * @returns true si la fecha está dentro del rango, false en caso contrario
 */
function fechaEnRango(fecha: Date, desde: Date | null, hasta: Date | null): boolean {
  if (desde && fecha < desde) {
    return false
  }
  if (hasta && fecha > hasta) {
    return false
  }
  return true
}

/**
 * Calcula la fecha de inicio según el rango predefinido especificado
 *
 * @param rango - Tipo de rango de fechas predefinido
 * @returns Fecha de inicio calculada desde el momento actual
 */
function calcularFechaInicio(rango: RangoFechas): Date {
  const ahora = new Date()
  const inicio = new Date(ahora)

  switch (rango) {
    case 'semana':
      inicio.setDate(ahora.getDate() - 7)
      break
    case 'mes':
      inicio.setDate(ahora.getDate() - 30)
      break
    case 'trimestre':
      inicio.setDate(ahora.getDate() - 90)
      break
    case 'semestre':
      inicio.setDate(ahora.getDate() - 180)
      break
    case 'anio':
      inicio.setDate(ahora.getDate() - 365)
      break
    case 'todo':
    default:
      // Para 'todo', retornar fecha mínima (sin límite)
      return new Date(0)
  }

  return inicio
}

/**
 * Extrae valor numérico de una medición para comparación
 * Maneja formatos especiales como presión arterial ("120/80")
 *
 * @param medicion - Medición de la cual extraer el valor
 * @returns Valor numérico extraído o 0 si no se puede parsear
 */
function extraerValorNumerico(medicion: Medicion): number {
  const valorLimpio = String(medicion.valor).replace(/[^\d./]/g, '')

  // Manejar formato de presión arterial (sistólica/diastólica)
  if (valorLimpio.includes('/')) {
    const partes = valorLimpio.split('/')
    const sistolica = parseFloat(partes[0])
    return isNaN(sistolica) ? 0 : sistolica
  }

  const valor = parseFloat(valorLimpio)
  return isNaN(valor) ? 0 : valor
}

/**
 * Compara dos mediciones según el campo y dirección especificados
 *
 * @param a - Primera medición a comparar
 * @param b - Segunda medición a comparar
 * @param campo - Campo por el cual ordenar
 * @param direccion - Dirección del ordenamiento ('asc' o 'desc')
 * @returns Número negativo si a < b, positivo si a > b, 0 si son iguales
 */
function compararMediciones(
  a: Medicion,
  b: Medicion,
  campo: CampoOrdenamiento,
  direccion: DireccionOrdenamiento
): number {
  let comparacion = 0

  switch (campo) {
    case 'fecha': {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      comparacion = fechaA - fechaB
      break
    }

    case 'valor': {
      const valorA = extraerValorNumerico(a)
      const valorB = extraerValorNumerico(b)
      comparacion = valorA - valorB
      break
    }

    case 'estado': {
      const prioridadEstado: Record<EstadoMedicion, number> = {
        critico: 0,
        alerta: 1,
        normal: 2,
        na: 3
      }
      comparacion = prioridadEstado[a.estado] - prioridadEstado[b.estado]
      break
    }

    case 'tipo': {
      comparacion = a.tipo.localeCompare(b.tipo)
      break
    }
  }

  // Invertir comparación si es orden descendente
  return direccion === 'desc' ? -comparacion : comparacion
}

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Composable para gestionar filtrado y ordenamiento de mediciones
 *
 * @param mediciones - Lista de mediciones a filtrar (puede ser ref, getter o valor plano)
 * @returns Objeto con filtros, ordenamiento, resultados y acciones
 */
export function useFiltrosMediciones(
  mediciones: MaybeRefOrGetter<Medicion[]>
) {
  // ============================================================================
  // ESTADO REACTIVO - FILTROS
  // ============================================================================

  /** Tipo de medición seleccionado para filtrar */
  const filtroTipo = ref<TipoMedicion | 'todos'>('todos')

  /** Fecha inicial del rango de filtrado */
  const filtroFechaDesde = ref<Date | null>(null)

  /** Fecha final del rango de filtrado */
  const filtroFechaHasta = ref<Date | null>(null)

  /** Estado de medición seleccionado para filtrar */
  const filtroEstado = ref<EstadoMedicion | 'todos'>('todos')

  /** Texto de búsqueda para filtrar por nombre o descripción (con debounce) */
  const filtroBusquedaRaw = ref('')
  const filtroBusqueda = useDebounce(filtroBusquedaRaw, 300)

  // ============================================================================
  // ESTADO REACTIVO - ORDENAMIENTO
  // ============================================================================

  /** Campo por el cual ordenar las mediciones */
  const ordenarPor = ref<CampoOrdenamiento>('fecha')

  /** Dirección del ordenamiento */
  const direccionOrden = ref<DireccionOrdenamiento>('desc')

  // ============================================================================
  // ESTADO REACTIVO - RANGO PREDEFINIDO
  // ============================================================================

  /** Rango de fechas predefinido seleccionado */
  const rangoFechas = ref<RangoFechas>('mes')

  // ============================================================================
  // COMPUTED - RESULTADOS
  // ============================================================================

  /**
   * Mediciones filtradas según todos los criterios activos
   * Aplica filtros de tipo, fecha, estado y búsqueda de texto
   */
  const medicionesFiltradas = computed(() => {
    const listaMediciones = toValue(mediciones)

    return listaMediciones.filter((medicion) => {
      // Filtro por tipo
      if (filtroTipo.value !== 'todos' && medicion.tipo !== filtroTipo.value) {
        return false
      }

      // Filtro por estado
      if (filtroEstado.value !== 'todos' && medicion.estado !== filtroEstado.value) {
        return false
      }

      // Filtro por rango de fechas
      const fechaMedicion = new Date(medicion.fecha)
      if (!fechaEnRango(fechaMedicion, filtroFechaDesde.value, filtroFechaHasta.value)) {
        return false
      }

      // Filtro por búsqueda de texto
      if (filtroBusqueda.value.trim()) {
        const terminoBusqueda = filtroBusqueda.value.toLowerCase().trim()
        const textoMedicion = `${medicion.nombre} ${medicion.valor} ${medicion.unidad}`.toLowerCase()

        if (!textoMedicion.includes(terminoBusqueda)) {
          return false
        }
      }

      return true
    })
  })

  /**
   * Mediciones ordenadas según el criterio de ordenamiento actual
   */
  const medicionesOrdenadas = computed(() => {
    return [...medicionesFiltradas.value].sort((a, b) =>
      compararMediciones(a, b, ordenarPor.value, direccionOrden.value)
    )
  })

  /**
   * Total de resultados después de aplicar filtros
   */
  const totalResultados = computed(() => medicionesFiltradas.value.length)

  // ============================================================================
  // ACCIONES
  // ============================================================================

  /**
   * Resetea todos los filtros a sus valores por defecto
   * - Tipo: 'todos'
   * - Fechas: null
   * - Estado: 'todos'
   * - Búsqueda: ''
   * - Rango: 'mes'
   * - Ordenamiento: fecha desc
   */
  const resetearFiltros = () => {
    filtroTipo.value = 'todos'
    filtroFechaDesde.value = null
    filtroFechaHasta.value = null
    filtroEstado.value = 'todos'
    filtroBusquedaRaw.value = ''
    rangoFechas.value = 'mes'
    ordenarPor.value = 'fecha'
    direccionOrden.value = 'desc'
  }

  /**
   * Aplica un rango de fechas predefinido
   * Calcula automáticamente las fechas desde y hasta según el rango seleccionado
   *
   * @param rango - Tipo de rango a aplicar
   */
  const aplicarRangoFechas = (rango: RangoFechas) => {
    rangoFechas.value = rango

    if (rango === 'todo') {
      filtroFechaDesde.value = null
      filtroFechaHasta.value = null
    } else {
      filtroFechaDesde.value = calcularFechaInicio(rango)
      filtroFechaHasta.value = new Date()
    }
  }

  /**
   * Cambia el campo de ordenamiento
   * Si se selecciona el mismo campo, alterna la dirección del orden
   *
   * @param campo - Campo por el cual ordenar
   */
  const cambiarOrdenamiento = (campo: CampoOrdenamiento) => {
    if (ordenarPor.value === campo) {
      // Alternar dirección si es el mismo campo
      direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Nuevo campo, establecer dirección por defecto
      ordenarPor.value = campo
      direccionOrden.value = 'desc'
    }
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  // Aplicar rango por defecto al inicializar
  aplicarRangoFechas('mes')

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Filtros
    filtroTipo,
    filtroFechaDesde,
    filtroFechaHasta,
    filtroEstado,
    filtroBusqueda: filtroBusquedaRaw, // Exportar el raw para v-model
    filtroBusquedaDebounced: filtroBusqueda, // Exportar el debounced para computeds
    rangoFechas,

    // Ordenamiento
    ordenarPor,
    direccionOrden,

    // Resultados
    medicionesFiltradas,
    medicionesOrdenadas,
    totalResultados,

    // Acciones
    resetearFiltros,
    aplicarRangoFechas,
    cambiarOrdenamiento
  }
}

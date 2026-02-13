/**
 * Tipos TypeScript para el módulo "Mi Salud"
 *
 * Este archivo define todas las interfaces y tipos utilizados específicamente
 * en el componente MiSaludView y sus composables asociados.
 * Proporciona tipado completo para gráficos, métricas, filtros y UI.
 */

import type { TipoMedicion, EstadoMedicion, Medicion } from './salud'

// ============================================================================
// 1. DATOS PARA GRÁFICOS
// ============================================================================

/**
 * Dataset individual para gráficos
 * Representa una serie de datos a visualizar
 */
export interface DatasetGrafico {
  /** Etiqueta descriptiva de la serie (ej: "Peso Corporal") */
  label: string
  /** Array de valores numéricos para el gráfico */
  data: number[]
  /** Color de la línea/borde en formato CSS (hex, rgb, rgba) */
  borderColor?: string
  /** Color de fondo/relleno en formato CSS (hex, rgb, rgba) */
  backgroundColor?: string
  /** Tipo de visualización del dataset */
  tipo: 'linea' | 'barra' | 'area'
}

/**
 * Datos procesados listos para renderizar en gráficos
 * Estructura compatible con Chart.js y bibliotecas similares
 */
export interface DatosGrafico {
  /** Etiquetas del eje X (fechas, períodos, etc.) */
  labels: string[]
  /** Conjuntos de datos a visualizar */
  datasets: DatasetGrafico[]
}

/**
 * Configuración completa para un gráfico de salud
 * Define apariencia, comportamiento y metadatos del gráfico
 */
export interface ConfiguracionGrafico {
  /** Tipo de medición que se está graficando */
  tipo: TipoMedicion
  /** Título descriptivo del gráfico */
  titulo: string
  /** Unidad de medida a mostrar en ejes y tooltips */
  unidad: string
  /** Rango de valores considerados normales para este tipo de medición */
  rangoNormal?: { min: number; max: number }
  /** Color primario para líneas y elementos principales */
  colorPrimario: string
  /** Color secundario para áreas de fondo o elementos auxiliares */
  colorSecundario?: string
  /** Indica si se debe mostrar la línea de promedio */
  mostrarPromedio: boolean
  /** Indica si se debe calcular y mostrar la tendencia */
  mostrarTendencia: boolean
  /** Indica si la curva debe ser suavizada (tensión) */
  curvaSuavizada: boolean
}

// ============================================================================
// 2. MÉTRICAS DE SALUD
// ============================================================================

/**
 * Métricas calculadas para un tipo específico de medición
 * Proporciona estadísticas y análisis de tendencias
 */
export interface MetricasTipo {
  /** Valor promedio de todas las mediciones */
  promedio: number
  /** Último valor registrado o null si no hay datos */
  ultimoValor: number | null
  /** Fecha del último registro en formato ISO 8601 o null */
  ultimaFecha: string | null
  /** Valor mínimo registrado */
  minimo: number
  /** Valor máximo registrado */
  maximo: number
  /** Cantidad total de mediciones disponibles */
  totalMediciones: number
  /** Dirección de la tendencia basada en los últimos valores */
  tendencia: 'subiendo' | 'bajando' | 'estable'
  /** Porcentaje de cambio desde el valor anterior o null */
  porcentajeCambio: number | null
  /** Indica si el último valor está dentro del rango normal o null si no aplica */
  estaEnRangoNormal: boolean | null
}

/**
 * Métricas generales de salud del paciente
 * Consolidación de métricas por tipo de medición
 */
export interface MetricasGenerales {
  /** Métricas de peso corporal */
  peso: MetricasTipo
  /** Métricas de presión arterial */
  presion: MetricasTipo
  /** Métricas de glucosa en sangre */
  glucosa: MetricasTipo
  /** Métricas de frecuencia cardíaca (opcional) */
  frecuencia?: MetricasTipo
  /** Estado general de salud calculado */
  estadoGeneral: 'excelente' | 'bueno' | 'regular' | 'atencion'
  /** Fecha de la última actualización de métricas en formato ISO 8601 */
  ultimaActualizacion: string | null
}

// ============================================================================
// 3. FILTRADO Y ORDENAMIENTO
// ============================================================================

/**
 * Opciones de filtrado para mediciones
 * Permite filtrar por múltiples criterios simultáneamente
 */
export interface FiltrosMedicion {
  /** Tipo de medición a filtrar o 'todos' para mostrar todos */
  tipo: TipoMedicion | 'todos'
  /** Fecha inicial del rango o null para sin límite */
  fechaDesde: Date | null
  /** Fecha final del rango o null para sin límite */
  fechaHasta: Date | null
  /** Estado de la medición a filtrar o 'todos' */
  estado: EstadoMedicion | 'todos'
  /** Texto de búsqueda para filtrar por nombre o descripción */
  busqueda: string
}

/**
 * Opciones de ordenamiento para listas de mediciones
 */
export interface OrdenamientoMedicion {
  /** Campo por el cual ordenar */
  campo: 'fecha' | 'valor' | 'estado' | 'tipo'
  /** Dirección del ordenamiento */
  direccion: 'asc' | 'desc'
}

/**
 * Rangos de fechas predefinidos para filtrado rápido
 */
export type RangoFechas = 'semana' | 'mes' | 'trimestre' | 'semestre' | 'anio' | 'todo'

// ============================================================================
// 4. ESTADO DEL COMPONENTE
// ============================================================================

/**
 * Estado completo del componente MiSaludView
 * Gestiona selecciones, estados de UI y modales
 */
export interface EstadoMiSalud {
  // Selecciones
  /** Tipo de gráfico actualmente seleccionado para visualización */
  tipoGraficoSeleccionado: TipoMedicion
  /** Rango de fechas seleccionado para filtrar datos */
  rangoFechas: RangoFechas

  // Estados de UI
  /** Indica si hay operaciones de carga en curso */
  cargando: boolean
  /** Mensaje de error actual o null si no hay error */
  error: string | null

  // Modales
  /** Indica si el modal de detalle está abierto */
  modalDetalleAbierto: boolean
  /** Indica si el modal de filtros está abierto */
  modalFiltrosAbierto: boolean
  /** Medición seleccionada para ver detalle o null */
  medicionSeleccionada: Medicion | null
}

// ============================================================================
// 5. DATOS PARA UI
// ============================================================================

/**
 * Datos estructurados para tarjetas de métricas en la UI
 * Optimizado para componentes de visualización
 */
export interface TarjetaMetrica {
  /** Título descriptivo de la métrica */
  titulo: string
  /** Valor a mostrar (puede ser número o texto formateado) */
  valor: string | number
  /** Unidad de medida */
  unidad: string
  /** Dirección de la tendencia para icono de flecha */
  tendencia: 'up' | 'down' | 'stable'
  /** Porcentaje de cambio o null si no aplica */
  cambioPorcentaje: number | null
  /** Clase CSS del icono (PrimeIcons) */
  icono: string
  /** Color temático de la tarjeta */
  color: string
  /** Descripción adicional o contexto de la métrica */
  descripcion: string
}

/**
 * Datos estructurados para items de lista de mediciones
 * Pre-formateado para renderizado eficiente en UI
 */
export interface ItemMedicionLista {
  /** Identificador único de la medición */
  id: string
  /** Tipo de medición */
  tipo: TipoMedicion
  /** Nombre descriptivo */
  nombre: string
  /** Valor formateado como string */
  valor: string
  /** Unidad de medida */
  unidad: string
  /** Fecha en formato ISO 8601 */
  fecha: string
  /** Fecha formateada para visualización */
  fechaFormateada: string
  /** Estado de la medición */
  estado: EstadoMedicion
  /** Clases CSS para el estado */
  estadoClass: string
  /** Clase CSS del icono (PrimeIcons) */
  icono: string
  /** Color temático */
  color: string
}

/**
 * Datos estructurados para controles próximos en la UI
 * Pre-calculado para mostrar información relevante al usuario
 */
export interface ControlProximoUI {
  /** Identificador único del control */
  id: string
  /** Nombre del control/protocolo */
  nombre: string
  /** Descripción del control */
  descripcion: string
  /** Fecha programada en formato ISO 8601 */
  fecha: string
  /** Fecha formateada para visualización */
  fechaFormateada: string
  /** Días restantes hasta el control (negativo si está vencido) */
  diasRestantes: number
  /** Indica si el control es urgente (próximo a vencer) */
  urgente: boolean
  /** Clase CSS del icono (PrimeIcons) */
  icono: string
  /** Color temático del control */
  color: string
}

// ============================================================================
// 6. RANGOS NORMALES
// ============================================================================

/**
 * Definición de rango normal para un tipo de medición
 * Incluye metadatos educativos para el usuario
 */
export interface RangoNormal {
  /** Tipo de medición al que aplica */
  tipo: TipoMedicion
  /** Valor mínimo del rango normal */
  min: number
  /** Valor máximo del rango normal */
  max: number
  /** Unidad de medida */
  unidad: string
  /** Descripción del rango (ej: "Rango saludable para adultos") */
  descripcion: string
  /** Recomendación cuando el valor está fuera del rango */
  recomendacion: string
}

/**
 * Categoría de estado según el valor de una medición
 * Permite clasificar valores en diferentes niveles de alerta
 */
export interface CategoriaEstado {
  /** Nombre de la categoría (ej: "Normal", "Alerta", "Crítico") */
  nombre: string
  /** Valor mínimo para esta categoría (inclusive) */
  min: number
  /** Valor máximo para esta categoría (inclusive) */
  max: number
  /** Color asociado a esta categoría */
  color: string
  /** Descripción de lo que significa estar en esta categoría */
  descripcion: string
}

// ============================================================================
// 7. RESPUESTAS Y ESTADOS DE COMPOSABLES
// ============================================================================

/**
 * Estado del composable useChartData
 * Gestiona datos procesados para gráficos y estadísticas
 */
export interface EstadoChartData {
  /** Datos del gráfico procesados y listos para renderizar */
  datosProcesados: DatosGrafico | null
  /** Estadísticas calculadas del tipo de medición actual */
  estadisticas: MetricasTipo | null
  /** Indica si hay operaciones de procesamiento en curso */
  cargando: boolean
  /** Mensaje de error o null */
  error: string | null
}

/**
 * Estado del composable useMetricasSalud
 * Gestiona métricas generales de salud del paciente
 */
export interface EstadoMetricasSalud {
  /** Métricas generales calculadas o null si no hay datos */
  metricas: MetricasGenerales | null
  /** Indica si se están calculando las métricas */
  cargando: boolean
  /** Mensaje de error o null */
  error: string | null
}

/**
 * Estado del composable useFiltrosMediciones
 * Gestiona filtrado y ordenamiento de mediciones
 */
export interface EstadoFiltrosMediciones {
  /** Filtros aplicados actualmente */
  filtros: FiltrosMedicion
  /** Configuración de ordenamiento actual */
  ordenamiento: OrdenamientoMedicion
  /** Resultados después de aplicar filtros y ordenamiento */
  resultadosFiltrados: Medicion[]
  /** Cantidad total de resultados filtrados */
  totalResultados: number
}

// ============================================================================
// 8. TIPOS AUXILIARES Y UTILITARIOS
// ============================================================================

/**
 * Opciones para exportación de datos de salud
 */
export interface OpcionesExportacion {
  /** Formato de exportación */
  formato: 'csv' | 'pdf' | 'json'
  /** Rango de fechas a exportar */
  rangoFechas: RangoFechas
  /** Tipos de medición a incluir */
  tipos: TipoMedicion[]
  /** Incluir métricas calculadas */
  incluirMetricas: boolean
  /** Incluir gráficos en la exportación (solo PDF) */
  incluirGraficos: boolean
}

/**
 * Configuración de notificaciones para alertas de salud
 */
export interface ConfiguracionNotificaciones {
  /** Notificar cuando una medición está fuera de rango */
  alertasFueraRango: boolean
  /** Notificar recordatorios de controles próximos */
  recordatoriosControles: boolean
  /** Días de anticipación para recordatorios */
  diasAnticipacion: number
  /** Notificar tendencias significativas */
  tendenciasSignificativas: boolean
  /** Umbral de cambio porcentual para considerar significativo */
  umbralCambio: number
}

/**
 * Eventos emitidos por el componente MiSaludView
 */
export interface EventosMiSalud {
  /** Emitido cuando se selecciona una medición para ver detalle */
  'ver-detalle': (medicion: Medicion) => void
  /** Emitido cuando se aplica un filtro */
  'filtrar': (filtros: FiltrosMedicion) => void
  /** Emitido cuando se cambia el tipo de gráfico */
  'cambiar-grafico': (tipo: TipoMedicion) => void
  /** Emitido cuando se solicita exportar datos */
  'exportar': (opciones: OpcionesExportacion) => void
  /** Emitido cuando se actualizan las métricas */
  'actualizar-metricas': () => void
}

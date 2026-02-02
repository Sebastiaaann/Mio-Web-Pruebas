/**
 * Punto central de exportación para todos los tipos TypeScript del proyecto
 * 
 * Este archivo permite importar cualquier tipo desde '@/types' en lugar de
 * tener que recordar la ruta específica de cada archivo de tipos.
 * 
 * @example
 * ```ts
 * // En lugar de:
 * import type { Medicion, TipoMedicion } from '@/types/salud'
 * import type { DatasetGrafico } from '@/types/miSalud'
 * import type { PerfilUsuario } from '@/types/perfil'
 * 
 * // Puedes usar:
 * import type { Medicion, TipoMedicion, DatasetGrafico, PerfilUsuario } from '@/types'
 * ```
 */

// ============================================================================
// TIPOS DE SALUD (src/types/salud.ts)
// ============================================================================

export type {
  EstadoControl,
  EstadoMedicion,
  TipoMedicion,
  CategoriaVideo,
  Control,
  Medicion,
  Video,
  Campana,
  HistorialMediciones,
  MapaControles,
  EstadoStoreBase,
  EstadoControles,
  EstadoMediciones,
  EstadoContenido,
  RespuestaAPI,
  ObservacionAPI,
  ProtocoloAPI,
  ServicioAPI,
  MaterialAudiovisualAPI,
  CampanaAPI,
  SessionMeta,
  AgregarMedicionFn,
  FetchHistorialFn,
  DeterminarTipoMedicionFn,
  FormatearDuracionFn,
  ResultadoOperacion,
  PromesaCarga
} from './salud'

export {
  MEDICION_SIN_DATOS,
  ESTADOS_MEDICION_UI,
  UNIDADES_POR_TIPO
} from './salud'

// ============================================================================
// TIPOS DE MI SALUD (src/types/miSalud.ts)
// ============================================================================

export type {
  DatasetGrafico,
  DatosGrafico,
  ConfiguracionGrafico,
  MetricasTipo,
  MetricasGenerales,
  FiltrosMedicion,
  OrdenamientoMedicion,
  RangoFechas,
  EstadoMiSalud,
  TarjetaMetrica,
  ItemMedicionLista,
  ControlProximoUI,
  RangoNormal,
  CategoriaEstado,
  EstadoChartData,
  EstadoMetricasSalud,
  EstadoFiltrosMediciones,
  OpcionesExportacion,
  ConfiguracionNotificaciones,
  EventosMiSalud
} from './miSalud'

// ============================================================================
// TIPOS DE PLAN (src/types/plan.ts)
// ============================================================================

export type {
  PlanType,
  PlanTheme,
  PlanAPI,
  PlanMeta,
  PlanManagerState,
  PlanManagerActions
} from './plan'

export { PLAN_THEMES } from './plan'

// ============================================================================
// TIPOS DE PERFIL (src/types/perfil.ts)
// ============================================================================

export type {
  PerfilUsuario,
  PlanActual,
  EstadisticasSalud,
  ControlProximo,
  Medicion as MedicionPerfil,
  PreferenciasUsuario,
  TemaAplicacion,
  EstadosUI,
  EstadosCarga,
  PlanThemeCompleto,
  PlanSalud,
  PlanConfig,
  PlanItem,
  PlanMeta as PlanMetaPerfil,
  EstadoSeleccionPlan,
  Notificacion,
  Servicio,
  ServicioItem,
  ProfileCardProps,
  PreferencesCardProps,
  SecurityCardProps,
  DataCardProps,
  ContactInfoCardProps,
  QuickActionsCardProps,
  AccionRapida,
  AnimationVariants,
  PlanesAPIResponse,
  IconMap,
  TipoPlan,
  PerfilState
} from './perfil'

// ============================================================================
// TIPOS DE SERVICIOS (src/types/service.ts)
// ============================================================================

export type {
  ServiceManagerState,
  ServiceManagerActions
} from './service'

// Nota: Servicio y ServicioItem se exportan desde perfil.ts para evitar duplicación

// ============================================================================
// TIPOS DE ANIMACIÓN (src/types/animation.ts)
// ============================================================================

export type {
  MotionVariants,
  SpringConfig,
  TweenConfig,
  CreateItemVariantsOptions,
  ModalType,
  ModalManagerState,
  ModalManagerActions
} from './animation'

// ============================================================================
// TIPOS DE COMPONENTES (src/types/componentes.d.ts)
// ============================================================================

// Nota: Los tipos de componentes.d.ts son declaraciones de módulos
// y no se pueden re-exportar directamente. Se mantienen en su archivo original.

// ============================================================================
// TIPOS DE UTILIDADES DE MEDICIONES (src/utils/mediciones.ts)
// ============================================================================

export type {
  DireccionTendencia,
  InfoTendencia,
  ValoresPresion,
  MedicionResumen,
  DatosResumenMediciones,
  EntradaMediciones
} from '../utils/mediciones'

export {
  UMBRAL_TENDENCIA_ESTABLE,
  PESO_MINIMO_VALIDO,
  PESO_MAXIMO_VALIDO,
  GLICEMIA_MINIMO_VALIDO,
  COLORES_PRESION,
  COLORES_GLICEMIA,
  COLOR_PESO,
  TENSION_LINEA_GRAFICO,
  MAX_MEDICIONES_GRAFICO,
  esArrayMediciones,
  esHistorialMediciones,
  detectarTipoEntrada,
  extraerValorNumerico,
  extraerValoresPresion,
  esPesoValido,
  esGlicemiaValida,
  calcularTendencia,
  calcularTendenciaMedicion,
  calcularTendenciaDesdeArray,
  filtrarMedicionesPorTipo,
  agruparMedicionesPorFecha,
  ordenarMedicionesPorFecha,
  obtenerUltimaMedicionPorTipo,
  normalizarAlturasGrafico,
  calcularPromedio,
  generarLabelsGenericos,
  procesarMedicionesPresion,
  procesarMedicionesPeso,
  procesarMedicionesGlicemia,
  formatearValorMedicion,
  obtenerUnidadPorTipo
} from '../utils/mediciones'

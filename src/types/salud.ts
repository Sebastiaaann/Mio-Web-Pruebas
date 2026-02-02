/**
 * Tipos TypeScript para el módulo de Salud
 * 
 * Este archivo define todas las interfaces y tipos utilizados en las stores de salud.
 * Proporciona tipado completo para entidades, estados y respuestas de API.
 */

// ============================================================================
// ENUMS Y TIPOS BÁSICOS
// ============================================================================

/** Estados posibles de un control médico */
export type EstadoControl = 'pendiente' | 'completado' | 'vencido';

/** Estados posibles de una medición */
export type EstadoMedicion = 'normal' | 'alerta' | 'critico' | 'na';

/** Tipos de medición soportados */
export type TipoMedicion = 'peso' | 'presion' | 'glucosa' | 'frecuencia' | 'temperatura' | 'general';

/** Categorías de videos educativos */
export type CategoriaVideo = 'educacion' | 'nutricion' | 'ejercicio' | 'general';

// ============================================================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ============================================================================

/**
 * Control médico/protocolo asignado al paciente
 */
export interface Control {
  /** Identificador único del control */
  id: string;
  /** Nombre descriptivo del control */
  nombre: string;
  /** Descripción detallada del propósito del control */
  descripcion: string;
  /** Clase CSS del icono (PrimeIcons) */
  icono: string;
  /** Color hexadecimal asociado al control (#RRGGBB) */
  color: string;
  /** Fecha programada para realizar el control (ISO 8601) o null */
  fechaProgramada: string | null;
  /** Estado actual del control */
  estado: EstadoControl;
}

/**
 * Medición individual de un indicador de salud
 */
export interface Medicion {
  /** Identificador único de la medición */
  id: string;
  /** Tipo de medición realizada */
  tipo: TipoMedicion;
  /** Nombre descriptivo de la medición */
  nombre: string;
  /** Valor medido (puede incluir formato como "120/80" para presión) */
  valor: string | number;
  /** Unidad de medida */
  unidad: string;
  /** Fecha de la medición en formato ISO 8601 */
  fecha: string;
  /** Estado/alerta de la medición */
  estado: EstadoMedicion;
  /** ID del tipo de observación en la API HOMA */
  observation_type_id?: number;
}

/**
 * Video educativo disponible para el paciente
 */
export interface Video {
  /** Identificador único del video */
  id: string;
  /** Título del video */
  titulo: string;
  /** Descripción del contenido del video */
  descripcion: string;
  /** URL de la miniatura del video */
  thumbnailUrl: string;
  /** URL del video para reproducir */
  videoUrl: string;
  /** Duración en formato "M:SS" o "H:MM:SS" */
  duracion: string;
  /** Categoría del video */
  categoria?: CategoriaVideo;
}

/**
 * Campaña de salud activa para el paciente
 */
export interface Campana {
  /** Identificador único de la campaña */
  id: string;
  /** Nombre de la campaña */
  nombre: string;
  /** Descripción de la campaña */
  descripcion: string;
  /** URL de la imagen/banner de la campaña */
  imagenUrl: string;
  /** Indica si la campaña está activa */
  activa: boolean;
  /** URL externa para más información (opcional) */
  url?: string | null;
  /** Fecha de inicio de la campaña (ISO 8601) */
  fechaInicio?: string | null;
  /** Fecha de fin de la campaña (ISO 8601) */
  fechaFin?: string | null;
}

// ============================================================================
// TIPOS DE COLECCIONES
// ============================================================================

/** Mapa de historial de mediciones por protocolo */
export type HistorialMediciones = Record<string, Medicion[]>;

/** Mapa de controles por ID */
export type MapaControles = Record<string, Control>;

// ============================================================================
// INTERFACES DE ESTADO DE STORES
// ============================================================================

/**
 * Estado base de cualquier store
 */
export interface EstadoStoreBase {
  /** Indica si hay una operación en curso */
  cargando: boolean;
  /** Mensaje de error si ocurrió alguno */
  error: string | null;
  /** Indica si los datos ya fueron inicializados */
  datosInicializados: boolean;
}

/**
 * Estado del store de Controles
 */
export interface EstadoControles extends EstadoStoreBase {
  /** Lista de controles próximos asignados al paciente */
  controlesProximos: Control[];
}

/**
 * Estado del store de Mediciones
 */
export interface EstadoMediciones extends EstadoStoreBase {
  /** Última medición registrada */
  ultimaMedicion: Medicion | null;
  /** Historial de mediciones por protocolo */
  historialMediciones: HistorialMediciones;
}

/**
 * Estado del store de Contenido
 */
export interface EstadoContenido {
  /** Lista de videos educativos disponibles */
  videos: Video[];
  /** Lista de campañas de salud */
  campanas: Campana[];
  /** Indica si se están cargando videos */
  cargandoVideos: boolean;
  /** Indica si se están cargando campañas */
  cargandoCampanas: boolean;
  /** Error al cargar videos */
  errorVideos: string | null;
  /** Error al cargar campañas */
  errorCampanas: string | null;
  /** Videos ya fueron cargados */
  videosInicializados: boolean;
  /** Campañas ya fueron cargadas */
  campanasInicializadas: boolean;
}

// ============================================================================
// INTERFACES DE RESPUESTAS API HOMA
// ============================================================================

/**
 * Estructura base de respuesta de API HOMA
 */
export interface RespuestaAPI<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos de la respuesta */
  data?: T;
  /** Mensaje de error si success es false */
  error?: string;
  /** Código de error HTTP */
  statusCode?: number;
}

/**
 * Observación individual desde la API
 */
export interface ObservacionAPI {
  /** ID de la observación */
  id?: string | number;
  observation_id?: string | number;
  /** Nombre del control/protocolo */
  name?: string;
  /** Tipo de observación */
  type?: string;
  observation_type?: string;
  /** ID del tipo de observación */
  observation_type_id?: number;
  /** Fecha de creación */
  created?: string;
  date?: string;
  created_at?: string;
  /** Valores específicos según tipo */
  glucose?: number | string;
  systolic?: number | string;
  diastolic?: number | string;
  weight?: number | string;
  bpm?: number | string;
  temperature?: number | string;
  value?: number | string;
  /** Evaluación del estado */
  evaluation?: string;
  status?: string | Record<string, string>;
  /** Observaciones anidadas */
  observation?: ObservacionAPI[];
  /** Fecha del último control */
  last_control?: string;
  /** ID del protocolo */
  protocol_id?: string | number;
}

/**
 * Protocolo desde la API
 */
export interface ProtocoloAPI {
  /** ID del protocolo */
  id?: string | number;
  protocol_id?: string | number;
  /** Nombre del protocolo */
  name?: string;
  nombre?: string;
  protocol_name?: string;
  title?: string;
  /** Descripción */
  description?: string;
  /** Fecha programada */
  due_date?: string;
  fecha_programada?: string;
  /** Opciones del protocolo */
  options?: ProtocoloAPI[];
}

/**
 * Servicio desde la API
 */
export interface ServicioAPI {
  /** ID del servicio */
  service_id?: number;
  id?: number | string;
  /** Nombre del servicio */
  name?: string;
  /** Opciones disponibles */
  options?: ProtocoloAPI[];
}

/**
 * Material audiovisual desde la API
 */
export interface MaterialAudiovisualAPI {
  /** ID del material */
  id?: string | number;
  audiovisual_id?: string | number;
  /** Título */
  title?: string;
  titulo?: string;
  /** Descripción */
  description?: string;
  main_text?: string;
  /** URLs */
  thumbnail_url?: string;
  url_thumbnail?: string;
  url?: string;
  video_url?: string;
  /** Duración */
  duration?: string | number;
  /** Categoría */
  category?: string;
  categoria?: string;
}

/**
 * Campaña desde la API
 */
export interface CampanaAPI {
  /** ID de la campaña */
  id?: string | number;
  campaign_id?: string | number;
  /** Nombre/Título */
  name?: string;
  title?: string;
  /** Descripción */
  description?: string;
  /** URLs */
  image_url?: string;
  banner_url?: string;
  url?: string;
  link?: string;
  /** Estado */
  active?: boolean;
  is_active?: boolean;
  /** Fechas */
  start_date?: string;
  fecha_inicio?: string;
  end_date?: string;
  fecha_fin?: string;
}

/**
 * Metadata de sesión almacenada en localStorage
 */
export interface SessionMeta {
  /** ID del paciente */
  patient_id: string | number;
  /** ID del plan de salud */
  health_plan_id?: string | number;
  /** Token de autenticación (solo metadata) */
  token?: string;
  /** Otros campos de metadata */
  [key: string]: any;
}

// ============================================================================
// TIPOS DE FUNCIONES
// ============================================================================

/** Función para agregar una medición */
export type AgregarMedicionFn = (controlId: string, medicion: Medicion) => void;

/** Función para cargar historial de un protocolo */
export type FetchHistorialFn = (protocolId: string) => Promise<void>;

/** Función para determinar tipo de medición */
export type DeterminarTipoMedicionFn = (obs: ObservacionAPI) => {
  tipo: TipoMedicion;
  valor: string;
  unidad: string;
};

/** Función para formatear duración de video */
export type FormatearDuracionFn = (duration: string | number) => string;

// ============================================================================
// TIPOS DE RETORNO
// ============================================================================

/** Resultado de operación asíncrona */
export interface ResultadoOperacion {
  success: boolean;
  error?: string;
  data?: any;
}

/** Promesa de carga de datos */
export type PromesaCarga = Promise<void> | null;

// ============================================================================
// CONSTANTES Y VALORES POR DEFECTO
// ============================================================================

/** Valor por defecto para medición sin datos */
export const MEDICION_SIN_DATOS: Medicion = {
  id: '0',
  tipo: 'general',
  nombre: 'Sin medición',
  valor: '--',
  unidad: '',
  fecha: new Date().toISOString(),
  estado: 'na'
};

/** Estados de medición para UI */
export const ESTADOS_MEDICION_UI: Record<EstadoMedicion, { texto: string; clase: string }> = {
  normal: { texto: 'Normal', clase: 'bg-health-green/10 text-health-green' },
  alerta: { texto: 'Alerta', clase: 'bg-alert-red/10 text-alert-red' },
  critico: { texto: 'Crítico', clase: 'bg-red-600/10 text-red-600' },
  na: { texto: 'Sin registrar', clase: 'bg-gray-bg text-gray-text-light' }
};

/** Unidades por tipo de medición */
export const UNIDADES_POR_TIPO: Record<TipoMedicion, string> = {
  peso: 'kg',
  presion: 'mmHg',
  glucosa: 'mg/dL',
  frecuencia: 'bpm',
  temperatura: '°C',
  general: ''
};

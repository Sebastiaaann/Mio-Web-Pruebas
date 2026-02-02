/**
 * Composable de helpers para la vista de Perfil
 * 
 * Proporciona funciones utilitarias puras para formateo de datos,
 * cálculos, helpers de UI y validaciones relacionadas con el perfil del usuario.
 * 
 * @module composables/usePerfilHelpers
 */

import type { 
  Medicion, 
  Control, 
  EstadoControl, 
  EstadoMedicion,
  HistorialMediciones 
} from '../types/salud'
import type { PlanTheme, PlanType } from '../types/plan'

// ============================================================================
// TIPOS ESPECÍFICOS DEL PERFIL
// ============================================================================

/** Datos de estadísticas de salud del usuario */
export interface EstadisticasSalud {
  /** Total de mediciones registradas */
  totalMediciones: number
  /** Controles completados */
  controlesCompletados: number
  /** Controles pendientes */
  controlesPendientes: number
  /** Última medición registrada */
  ultimaMedicion: Medicion | null
  /** Historial completo de mediciones */
  historialMediciones: HistorialMediciones
}

/** Información del usuario para el perfil */
export interface InfoUsuario {
  /** Nombre completo del usuario */
  nombre: string
  /** Email del usuario */
  email: string
  /** URL del avatar (opcional) */
  avatar?: string
  /** Fecha de creación de la cuenta */
  fechaCreacion?: string
  /** Plan actual del usuario */
  planActual?: string
}

/** Estado de salud calculado */
export interface EstadoSaludCalculado {
  /** Porcentaje de salud general (0-100) */
  porcentaje: number
  /** Etiqueta descriptiva del estado */
  etiqueta: string
  /** Color asociado al estado */
  color: string
  /** Indica si requiere atención */
  requiereAtencion: boolean
}

/** Resultado de validación de perfil */
export interface ValidacionPerfil {
  /** Indica si el perfil es válido */
  valido: boolean
  /** Lista de campos faltantes o con error */
  errores: string[]
  /** Porcentaje de completitud (0-100) */
  porcentajeCompletitud: number
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Paleta de colores para avatares */
const COLORES_AVATAR = [
  '#7D58E9', // Violeta
  '#00B6AE', // Turquesa
  '#C4D600', // Lima
  '#F59E0B', // Ámbar
  '#EF4444', // Rojo
  '#3B82F6', // Azul
  '#10B981', // Esmeralda
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#14B8A6', // Teal
]

/** Estados de salud predefinidos */
const ESTADOS_SALUD = {
  excelente: { min: 90, etiqueta: 'Excelente', color: '#10B981' },
  bueno: { min: 70, etiqueta: 'Bueno', color: '#3B82F6' },
  regular: { min: 50, etiqueta: 'Regular', color: '#F59E0B' },
  atencion: { min: 30, etiqueta: 'Requiere atención', color: '#EF4444' },
  critico: { min: 0, etiqueta: 'Crítico', color: '#DC2626' },
}

/** Meses en español */
const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

// ============================================================================
// FORMATEO DE DATOS
// ============================================================================

/**
 * Formatea una fecha a formato legible en español
 * @param fecha - Fecha en formato ISO 8601 o Date
 * @param opciones - Opciones de formateo adicionales
 * @returns Fecha formateada (ej: "15 de enero de 2024")
 */
export function formatearFecha(
  fecha: string | Date | null | undefined,
  opciones: { incluirHora?: boolean; formatoCorto?: boolean } = {}
): string {
  if (!fecha) return 'Sin fecha'

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  if (isNaN(date.getTime())) return 'Fecha inválida'

  const dia = date.getDate()
  const mes = MESES_ES[date.getMonth()]
  const anio = date.getFullYear()

  if (opciones.formatoCorto) {
    return `${dia} ${mes.substring(0, 3)}.`
  }

  let resultado = `${dia} de ${mes} de ${anio}`

  if (opciones.incluirHora) {
    const horas = date.getHours().toString().padStart(2, '0')
    const minutos = date.getMinutes().toString().padStart(2, '0')
    resultado += `, ${horas}:${minutos}`
  }

  return resultado
}

/**
 * Formatea la fecha de última medición con contexto temporal
 * @param fecha - Fecha de la última medición
 * @returns Texto descriptivo (ej: "Hace 2 horas", "Ayer", "15 de enero")
 */
export function formatearUltimaMedicion(fecha: string | Date | null | undefined): string {
  if (!fecha) return 'Sin mediciones'

  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = new Date()
  const diffMs = ahora.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'Justo ahora'
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  
  return formatearFecha(fecha, { formatoCorto: true })
}

/**
 * Calcula el progreso de salud basado en las estadísticas del usuario
 * @param estadisticas - Estadísticas de salud del usuario
 * @returns Porcentaje de progreso (0-100)
 */
export function calcularProgresoSalud(estadisticas: EstadisticasSalud): number {
  if (!estadisticas) return 0

  const { totalMediciones, controlesCompletados, controlesPendientes } = estadisticas
  const totalControles = controlesCompletados + controlesPendientes

  if (totalControles === 0) return 0

  // Peso de cada factor en el cálculo
  const pesoMediciones = 0.3
  const pesoCompletitud = 0.7

  // Factor de mediciones (más mediciones = mejor seguimiento)
  const factorMediciones = Math.min(totalMediciones / 10, 1) * 100

  // Factor de completitud de controles
  const factorCompletitud = (controlesCompletados / totalControles) * 100

  const progreso = Math.round(
    factorMediciones * pesoMediciones + factorCompletitud * pesoCompletitud
  )

  return Math.min(Math.max(progreso, 0), 100)
}

/**
 * Formatea estadísticas de salud para visualización
 * @param estadisticas - Estadísticas a formatear
 * @returns Objeto con estadísticas formateadas
 */
export function formatearEstadisticas(estadisticas: EstadisticasSalud): {
  totalMediciones: string
  controlesCompletados: string
  controlesPendientes: string
  progresoTexto: string
} {
  if (!estadisticas) {
    return {
      totalMediciones: '0',
      controlesCompletados: '0',
      controlesPendientes: '0',
      progresoTexto: 'Sin datos',
    }
  }

  const progreso = calcularProgresoSalud(estadisticas)

  return {
    totalMediciones: estadisticas.totalMediciones.toString(),
    controlesCompletados: estadisticas.controlesCompletados.toString(),
    controlesPendientes: estadisticas.controlesPendientes.toString(),
    progresoTexto: `${progreso}%`,
  }
}

// ============================================================================
// CÁLCULOS
// ============================================================================

/**
 * Calcula el porcentaje de completitud de un conjunto de items
 * @param items - Array de items con estado
 * @param estadoCompletado - Estado que considera un item como completado
 * @returns Porcentaje de completitud (0-100)
 */
export function calcularPorcentajeCompletitud<T extends { estado?: string }>(
  items: T[],
  estadoCompletado: string = 'completado'
): number {
  if (!items || items.length === 0) return 0

  const completados = items.filter(item => item.estado === estadoCompletado).length
  return Math.round((completados / items.length) * 100)
}

/**
 * Determina el estado de salud general basado en mediciones y controles
 * @param estadisticas - Estadísticas de salud
 * @returns Estado de salud calculado con etiqueta y color
 */
export function determinarEstadoSalud(estadisticas: EstadisticasSalud): EstadoSaludCalculado {
  const porcentaje = calcularProgresoSalud(estadisticas)

  let estado = ESTADOS_SALUD.critico

  if (porcentaje >= ESTADOS_SALUD.excelente.min) {
    estado = ESTADOS_SALUD.excelente
  } else if (porcentaje >= ESTADOS_SALUD.bueno.min) {
    estado = ESTADOS_SALUD.bueno
  } else if (porcentaje >= ESTADOS_SALUD.regular.min) {
    estado = ESTADOS_SALUD.regular
  } else if (porcentaje >= ESTADOS_SALUD.atencion.min) {
    estado = ESTADOS_SALUD.atencion
  }

  return {
    porcentaje,
    etiqueta: estado.etiqueta,
    color: estado.color,
    requiereAtencion: porcentaje < ESTADOS_SALUD.regular.min,
  }
}

/**
 * Cuenta elementos por estado
 * @param items - Array de items con propiedad estado
 * @returns Mapa con conteo por estado
 */
export function contarElementosPorEstado<T extends { estado?: string }>(
  items: T[]
): Record<string, number> {
  if (!items || items.length === 0) return {}

  return items.reduce((conteo, item) => {
    const estado = item.estado || 'sin_estado'
    conteo[estado] = (conteo[estado] || 0) + 1
    return conteo
  }, {} as Record<string, number>)
}

/**
 * Calcula el total de mediciones desde el historial
 * @param historial - Historial de mediciones por protocolo
 * @returns Total de mediciones
 */
export function calcularTotalMediciones(historial: HistorialMediciones): number {
  if (!historial) return 0

  return Object.values(historial).reduce((total: number, mediciones: unknown) => {
    return total + (Array.isArray(mediciones) ? (mediciones as Medicion[]).length : 0)
  }, 0)
}

// ============================================================================
// HELPERS DE UI
// ============================================================================

/**
 * Genera iniciales a partir del nombre completo
 * @param nombre - Nombre completo del usuario
 * @param maxIniciales - Máximo número de iniciales (por defecto 2)
 * @returns Iniciales en mayúsculas (ej: "Juan Pérez" -> "JP")
 */
export function generarIniciales(nombre: string, maxIniciales: number = 2): string {
  if (!nombre || typeof nombre !== 'string') return 'U'

  const palabras = nombre.trim().split(/\s+/).filter(p => p.length > 0)
  
  if (palabras.length === 0) return 'U'
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase()

  return palabras
    .slice(0, maxIniciales)
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

/**
 * Formatea el nombre completo del usuario
 * @param nombre - Nombre
 * @param apellido - Apellido
 * @returns Nombre completo formateado
 */
export function formatearNombreCompleto(
  nombre: string | undefined | null,
  apellido: string | undefined | null
): string {
  const partes = [nombre, apellido].filter(Boolean)
  return partes.join(' ').trim() || 'Usuario'
}

/**
 * Genera un color determinista para el avatar basado en el nombre
 * @param nombre - Nombre del usuario
 * @returns Color hexadecimal
 */
export function generarColorAvatar(nombre: string): string {
  if (!nombre) return COLORES_AVATAR[0]

  // Calcular hash simple del nombre
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    const char = nombre.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a 32bit integer
  }

  // Usar el hash para seleccionar un color
  const indice = Math.abs(hash) % COLORES_AVATAR.length
  return COLORES_AVATAR[indice]
}

/**
 * Genera estilos para el avatar basado en el nombre
 * @param nombre - Nombre del usuario
 * @returns Objeto con estilos CSS
 */
export function generarEstilosAvatar(nombre: string): {
  backgroundColor: string
  color: string
} {
  const colorBase = generarColorAvatar(nombre)
  
  return {
    backgroundColor: `${colorBase}20`, // 20 = 12.5% opacidad en hex
    color: colorBase,
  }
}

/**
 * Formatea el texto de membresía
 * @param fechaCreacion - Fecha de creación de la cuenta
 * @returns Texto formateado (ej: "Miembro desde enero de 2024")
 */
export function formatearMembresia(fechaCreacion: string | Date | undefined): string {
  if (!fechaCreacion) return 'Miembro reciente'

  const date = typeof fechaCreacion === 'string' ? new Date(fechaCreacion) : fechaCreacion
  
  if (isNaN(date.getTime())) return 'Miembro reciente'

  const mes = MESES_ES[date.getMonth()]
  const anio = date.getFullYear()

  return `${mes} de ${anio}`
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida los datos básicos del perfil
 * @param usuario - Datos del usuario a validar
 * @returns Resultado de la validación
 */
export function validarDatosPerfil(usuario: Partial<InfoUsuario>): ValidacionPerfil {
  const errores: string[] = []
  let camposValidos = 0
  const totalCampos = 4

  // Validar nombre
  if (!usuario.nombre || usuario.nombre.trim().length < 2) {
    errores.push('nombre')
  } else {
    camposValidos++
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!usuario.email || !emailRegex.test(usuario.email)) {
    errores.push('email')
  } else {
    camposValidos++
  }

  // Validar fecha de creación (opcional pero recomendada)
  if (usuario.fechaCreacion) {
    const fecha = new Date(usuario.fechaCreacion)
    if (!isNaN(fecha.getTime())) {
      camposValidos++
    }
  }

  // Validar plan actual (opcional)
  if (usuario.planActual && usuario.planActual.trim().length > 0) {
    camposValidos++
  }

  const porcentajeCompletitud = Math.round((camposValidos / totalCampos) * 100)

  return {
    valido: errores.length === 0 && camposValidos >= 2,
    errores,
    porcentajeCompletitud,
  }
}

/**
 * Verifica si el perfil del usuario está completo
 * @param usuario - Datos del usuario
 * @param minimoCompletitud - Porcentaje mínimo para considerar completo (por defecto 75%)
 * @returns true si el perfil está completo
 */
export function perfilEstaCompleto(
  usuario: Partial<InfoUsuario>,
  minimoCompletitud: number = 75
): boolean {
  const validacion = validarDatosPerfil(usuario)
  return validacion.porcentajeCompletitud >= minimoCompletitud
}

/**
 * Valida si una medición es válida
 * @param medicion - Medición a validar
 * @returns true si la medición es válida
 */
export function validarMedicion(medicion: Partial<Medicion>): boolean {
  if (!medicion) return false

  const tieneValor = medicion.valor !== undefined && medicion.valor !== null && medicion.valor !== ''
  const tieneTipo = !!medicion.tipo
  const tieneFecha = !!medicion.fecha && !isNaN(new Date(medicion.fecha).getTime())

  return tieneValor && tieneTipo && tieneFecha
}

/**
 * Valida si un control es válido
 * @param control - Control a validar
 * @returns true si el control es válido
 */
export function validarControl(control: Partial<Control>): boolean {
  if (!control) return false

  const tieneId = !!control.id
  const tieneNombre = !!control.nombre && control.nombre.trim().length > 0
  const tieneEstadoValido = ['pendiente', 'completado', 'vencido'].includes(control.estado || '')

  return tieneId && tieneNombre && tieneEstadoValido
}

// ============================================================================
// HELPERS ESPECÍFICOS DE PLANES
// ============================================================================

/**
 * Obtiene el tipo de plan a partir del nombre
 * @param nombrePlan - Nombre del plan
 * @returns Tipo de plan ('esencial' | 'mutual')
 */
export function obtenerTipoPlan(nombrePlan: string | undefined): PlanType {
  if (!nombrePlan) return 'mutual'
  
  const nombre = nombrePlan.toLowerCase()
  if (nombre.includes('esencial') || nombre.includes('vital')) {
    return 'esencial'
  }
  return 'mutual'
}

/**
 * Determina si un plan es del tipo Esencial
 * @param nombrePlan - Nombre del plan
 * @returns true si es plan Esencial
 */
export function esPlanEsencial(nombrePlan: string | undefined): boolean {
  return obtenerTipoPlan(nombrePlan) === 'esencial'
}

/**
 * Determina si un plan es del tipo Mutual
 * @param nombrePlan - Nombre del plan
 * @returns true si es plan Mutual
 */
export function esPlanMutual(nombrePlan: string | undefined): boolean {
  return obtenerTipoPlan(nombrePlan) === 'mutual'
}

/**
 * Obtiene el tema visual para un tipo de plan
 * @param tipoPlan - Tipo de plan
 * @returns Tema visual del plan
 */
export function obtenerTemaPlan(tipoPlan: PlanType): PlanTheme {
  const temas: Record<PlanType, PlanTheme> = {
    esencial: {
      primary: '#7D58E9',
      secondary: '#7D58E9',
      accent: '#996BEF',
      text: '#333333',
      background: '#FFFFFF',
      logo: '/assets/logo_mio_purple.png'
    },
    mutual: {
      primary: '#C4D600',
      secondary: '#00B6AE',
      accent: '#505050',
      text: '#505050',
      background: '#C4D600',
      text_alt: '#FFFFFF',
      logo: '/assets/logo_mutual.png'
    }
  }

  return temas[tipoPlan] || temas.mutual
}

// ============================================================================
// EXPORTACIÓN DEFAULT
// ============================================================================

export default {
  // Formateo
  formatearFecha,
  formatearUltimaMedicion,
  calcularProgresoSalud,
  formatearEstadisticas,
  
  // Cálculos
  calcularPorcentajeCompletitud,
  determinarEstadoSalud,
  contarElementosPorEstado,
  calcularTotalMediciones,
  
  // UI
  generarIniciales,
  formatearNombreCompleto,
  generarColorAvatar,
  generarEstilosAvatar,
  formatearMembresia,
  
  // Validaciones
  validarDatosPerfil,
  perfilEstaCompleto,
  validarMedicion,
  validarControl,
  
  // Planes
  obtenerTipoPlan,
  esPlanEsencial,
  esPlanMutual,
  obtenerTemaPlan,
}

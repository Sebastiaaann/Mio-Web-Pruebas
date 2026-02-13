/**
 * Servicio HOMA Center - Cliente para API HOMA Center
 * 
 * Esta API es diferente a la API HOMA normal (apihoma.homa.cl:7200)
 * Se usa específicamente para operaciones de escritura como guardar controles
 * 
 * URL: /api/homa-center/batch (proxy server-side)
 */

import { logger } from '@/utils/logger'

// URLs de APIs
const API_HOMA_URL = 'https://apihoma.homa.cl:7200'
const HOMA_CENTER_PROXY_URL = '/api/homa-center/batch'

/**
 * Obtener token de autenticación del almacenamiento local
 * NOTA: Este token se obtiene de la API HOMA normal durante el login
 */
function obtenerTokenAuth(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mio-token')
  }
  return null
}

// Cache para tipos de observación
let cachedObservationTypes: Map<string, ObservationType> | null = null
let observationTypesPromise: Promise<Map<string, ObservationType>> | null = null

/**
 * Tipo de observación desde la API
 */
interface ObservationType {
  id: number
  type: string
  name: string
  header: string
  no_parameters: number
  trigger_alarm: boolean
  parameters_names: {
    param_names: string[]
  }
  parameters_units: {
    param_units: string[]
  }
  custom_range: boolean
}

/**
 * Tipo de observación formateado para el batch
 */
interface FormattedObservationType {
  id: number
  type: string
  name: string
  header: string
  numberOfParameters: number
  parametersNames: string[]
  parametersUnits: string[]
  triggerAlarmIfRed: boolean
  customizableRange: boolean
}

/**
 * Estructura de una observación individual
 */
interface Observation {
  patientId: number
  type: FormattedObservationType
  values: Record<string, unknown>
  timestamp: string
  annotations: {
    stepNodeId: string
  }
}

/**
 * Estructura completa del batch para enviar a la API
 */
interface BatchPayload {
  id: null | number
  patientId: number
  patientName: string
  patientSurname: string
  protocolId: number
  protocolName: string
  observations: Observation[]
  created: string
  validationDate: string
  triage: string
  validated: boolean
  validatedBy: null | string
  comments: null | string
  isPartOfProtocol: boolean
}

/**
 * Respuesta de la API al guardar un batch
 */
interface BatchResponse {
  id: number
  patientId: number
  patientName: string
  patientSurname: string
  protocolId: number
  protocolName: string
  observations: Array<{
    id: number | null
    patientId: number
    type: FormattedObservationType
    values: Record<string, unknown>
    timestamp: string
    batch: null
    evaluation: string
    annotations: {
      stepNodeId: string
    }
  }>
  created: string
  validationDate: string
  triage: string
  validated: boolean
  validatedBy: null | string
  comments: null | string
  isPartOfProtocol: boolean
  isMissed: boolean
  evaluationFeedback: unknown[]
}

/**
 * Obtener tipos de observación de la API
 * Cachea el resultado para no llamar repetidamente
 */
async function obtenerTiposObservacion(): Promise<Map<string, ObservationType>> {
  // Si ya tenemos cache, retornarlo
  if (cachedObservationTypes) {
    return cachedObservationTypes
  }

  // Si hay una llamada en curso, esperarla
  if (observationTypesPromise) {
    return observationTypesPromise
  }

  // Crear la promesa de llamada
  observationTypesPromise = (async () => {
    try {
      const response = await fetch(`${API_HOMA_URL}/api/v1/batch/observation_types`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json() as { success: boolean; data: { result: ObservationType[] } }

      if (!data.success || !data.data?.result) {
        throw new Error('No se pudieron obtener los tipos de observación')
      }

      // Crear mapa de tipos
      const typesMap = new Map<string, ObservationType>()
      data.data.result.forEach((type: ObservationType) => {
        typesMap.set(type.type, type)
      })

      cachedObservationTypes = typesMap
      logger.info('Tipos de observación cacheados:', typesMap.size)
      
      return typesMap
    } catch (error) {
      logger.error('Error obteniendo tipos de observación:', error)
      throw error
    } finally {
      // Limpiar la promesa para permitir reintentos
      observationTypesPromise = null
    }
  })()

  return observationTypesPromise
}

/**
 * Formatear tipo de observación para el batch
 */
function formatearTipoObservacion(type: ObservationType): FormattedObservationType {
  return {
    id: type.id,
    type: type.type,
    name: type.name,
    header: type.header,
    numberOfParameters: type.no_parameters,
    parametersNames: type.parameters_names?.param_names || [],
    parametersUnits: type.parameters_units?.param_units || [],
    triggerAlarmIfRed: type.trigger_alarm,
    customizableRange: type.custom_range
  }
}

/**
 * Formatear timestamp al formato Controls Engine
 * Formato: "YYYY-MM-DD HH:MM:00.000 -0400"
 * 
 * Nota: Controls Engine resta 4 horas al timestamp actual
 */
function formatearTimestamp(fecha: Date = new Date()): string {
  // Restar 4 horas como hace Controls Engine
  const dt = new Date(fecha)
  dt.setHours(dt.getHours() - 4)

  const pad = (val: number) => String(val).padStart(2, '0')

  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:00.000 -0400`
}

/**
 * Validar valores médicos según rangos aceptados
 * NOTA: Estas validaciones previenen datos médicamente imposibles
 */
function validarValorNumerico(valor: number | undefined, min: number, max: number, nombre: string): number {
  if (valor === undefined || valor === null) {
    throw new Error(`Valor requerido no proporcionado: ${nombre}`)
  }
  
  if (typeof valor !== 'number' || isNaN(valor)) {
    throw new Error(`Valor inválido para ${nombre}: debe ser un número`)
  }
  
  if (valor < min || valor > max) {
    throw new Error(`Valor fuera de rango para ${nombre}: ${valor} (rango aceptado: ${min}-${max})`)
  }
  
  return valor
}

/**
 * Validar datos de tensiómetro (presión arterial)
 */
function validarDatosTensiometer(data: { Systolic?: number; Diastolic?: number; bpm?: number }): { Systolic: number; Diastolic: number; bpm: number } {
  return {
    Systolic: validarValorNumerico(data.Systolic, 50, 300, 'Presión Sistólica'),
    Diastolic: validarValorNumerico(data.Diastolic, 30, 200, 'Presión Diastólica'),
    bpm: validarValorNumerico(data.bpm, 30, 250, 'Pulsaciones por minuto')
  }
}

/**
 * Validar datos de glucómetro
 */
function validarDatosGlucometer(data: { glucose?: number }): { glucose: number } {
  return {
    glucose: validarValorNumerico(data.glucose, 20, 1000, 'Glucosa')
  }
}

/**
 * Validar datos de peso
 */
function validarDatosWeight(data: { weight?: number; height?: number; IMC?: number }): { weight: number; height: number; IMC: number } {
  return {
    weight: validarValorNumerico(data.weight, 1, 500, 'Peso'),
    height: validarValorNumerico(data.height, 30, 300, 'Altura'),
    IMC: validarValorNumerico(data.IMC, 5, 100, 'IMC')
  }
}

/**
 * Validar datos de oxímetro
 */
function validarDatosOxymeter(data: { bpm?: number; spo2?: number }): { bpm: number; Spo2: number } {
  return {
    bpm: validarValorNumerico(data.bpm, 30, 250, 'Pulsaciones'),
    Spo2: validarValorNumerico(data.spo2, 50, 100, 'Saturación de oxígeno')
  }
}

/**
 * Validar datos de termómetro
 */
function validarDatosTermometer(data: { temperature?: number }): { Temperature: number } {
  return {
    Temperature: validarValorNumerico(data.temperature, 30, 45, 'Temperatura')
  }
}

/**
 * Construir una observación a partir de los datos del paso
 */
async function construirObservacion(
  patientId: number,
  stepId: string,
  stepType: string,
  stepData: {
    question?: { question: string; answers: Array<{ text: string; evaluation: string }> }
    observationType?: { id: number }
  },
  response: unknown,
  tiposObservacion: Map<string, ObservationType>
): Promise<Observation> {
  const tipoBase = tiposObservacion.get(stepType)
  
  if (!tipoBase) {
    throw new Error(`Tipo de observación no encontrado: ${stepType}`)
  }

  const tipo = formatearTipoObservacion(tipoBase)
  const timestamp = formatearTimestamp()

  let values: Record<string, unknown> = {}

  // Construir values según el tipo
  switch (stepType) {
    case 'question':
      if (typeof response === 'string' && stepData.question) {
        const answer = stepData.question.answers.find(a => a.text === response)
        values = {
          answer: {
            text: response,
            evaluation: answer?.evaluation || 'unknown'
          },
          question: stepData.question.question
        }
      }
      break

    case 'tensiometer':
      if (typeof response === 'object' && response !== null) {
        const resp = response as { Systolic?: number; Diastolic?: number; bpm?: number }
        // Validar rangos médicos antes de asignar
        values = validarDatosTensiometer(resp)
      }
      break

    case 'glucometer':
      if (typeof response === 'object' && response !== null) {
        const resp = response as { glucose?: number }
        // Validar rangos médicos antes de asignar
        values = validarDatosGlucometer(resp)
      }
      break

    case 'weight':
      if (typeof response === 'object' && response !== null) {
        const resp = response as { weight?: number; height?: number; IMC?: number }
        // Validar rangos médicos antes de asignar
        values = validarDatosWeight(resp)
      }
      break

    case 'oxymeter':
      if (typeof response === 'object' && response !== null) {
        const resp = response as { bpm?: number; spo2?: number }
        // Validar rangos médicos antes de asignar
        values = validarDatosOxymeter(resp)
      }
      break

    case 'termometer':
      if (typeof response === 'object' && response !== null) {
        const resp = response as { temperature?: number }
        // Validar rangos médicos antes de asignar
        values = validarDatosTermometer(resp)
      }
      break

    case 'text':
      // Tipo text no tiene valores
      values = {}
      break

    default:
      // Para otros tipos, intentar usar el response directamente
      if (typeof response === 'object' && response !== null) {
        values = response as Record<string, unknown>
      }
  }

  return {
    patientId,
    type: tipo,
    values,
    timestamp,
    annotations: {
      stepNodeId: stepId
    }
  }
}

/**
 * Guardar observaciones de un control en API HOMA Center
 * 
 * @param params - Parámetros para guardar el control
 * @returns Respuesta de la API con el control guardado
 */
export async function guardarBatchObservaciones(params: {
  patientId: number
  patientName: string
  patientSurname: string
  protocolId: number
  protocolName: string
  observaciones: Array<{
    stepId: string
    stepType: string
    stepData: {
      question?: { question: string; answers: Array<{ text: string; evaluation: string }> }
      observationType?: { id: number }
    }
    response: unknown
  }>
}): Promise<BatchResponse> {
  try {
    // Obtener tipos de observación (cacheados)
    const tiposObservacion = await obtenerTiposObservacion()

    // Construir observaciones
    const observations: Observation[] = []
    
    for (const obs of params.observaciones) {
      try {
        const observation = await construirObservacion(
          params.patientId,
          obs.stepId,
          obs.stepType,
          obs.stepData,
          obs.response,
          tiposObservacion
        )
        observations.push(observation)
      } catch (error) {
        logger.warn(`Error construyendo observación para paso ${obs.stepId}:`, error)
        // Continuar con las demás observaciones
      }
    }

    if (observations.length === 0) {
      throw new Error('No se pudieron construir observaciones válidas')
    }

    // Construir payload completo
    const timestamp = formatearTimestamp()
    const payload: BatchPayload = {
      id: null,
      patientId: params.patientId,
      patientName: params.patientName,
      patientSurname: params.patientSurname,
      protocolId: params.protocolId,
      protocolName: params.protocolName,
      observations,
      created: timestamp,
      validationDate: timestamp,
      triage: 'none',
      validated: false,
      validatedBy: null,
      comments: null,
      isPartOfProtocol: true
    }

    // Log seguro: nunca exponer valores médicos ni datos sensibles
    logger.info('Enviando batch a HOMA Center:', {
      patientId: `[ID:${params.patientId.toString().slice(0, 3)}...]`, // Truncar ID
      protocolId: params.protocolId,
      observationsCount: observations.length
    })

    // Obtener token de autenticación
    const token = obtenerTokenAuth()
    if (!token) {
      throw new Error('No se encontró token de autenticación. Por favor inicie sesión nuevamente.')
    }

    // Enviar a API HOMA Center con autenticación
    const response = await fetch(HOMA_CENTER_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': token
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    const result: BatchResponse = await response.json()

    // Log seguro: solo IDs y conteos, nunca valores médicos
    logger.info('Batch guardado exitosamente:', {
      batchId: result.id,
      patientId: `[ID:${result.patientId.toString().slice(0, 3)}...]`, // Truncar ID
      observationsCount: result.observations.length
    })

    return result

  } catch (error) {
    logger.error('Error guardando batch en HOMA Center:', error)
    throw error
  }
}

/**
 * Limpiar cache de tipos de observación
 * Útil para forzar recarga si los tipos cambian en la API
 */
export function limpiarCacheTiposObservacion(): void {
  cachedObservationTypes = null
  observationTypesPromise = null
  logger.info('Cache de tipos de observación limpiado')
}

// Exportar tipos para uso en otros módulos
export type {
  ObservationType,
  FormattedObservationType,
  Observation,
  BatchPayload,
  BatchResponse
}

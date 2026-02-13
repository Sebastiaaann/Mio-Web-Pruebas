/**
 * Protocol Service - Servicio para manejar operaciones con protocolos de la API HOMA
 * Usa clienteApi centralizado para todas las peticiones
 */

import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'
import { guardarBatchObservaciones } from './homaCenterService'
import type { BatchResponse } from './homaCenterService'

/**
 * Obtener un protocolo específico por ID
 */
export async function getProtocol(protocolId: string): Promise<unknown> {
  try {
    return await clienteApi.get(`/api/v1/protocol/${protocolId}`)
  } catch (error) {
    throw new Error(`Error al obtener protocolo: ${(error as Error).message}`)
  }
}

/**
 * Estructura de datos de una observación del wizard
 */
interface WizardObservation {
  stepId: string
  stepType: string
  stepData: {
    question?: { question: string; answers: Array<{ text: string; evaluation: string }> }
    observationType?: { id: number }
  }
  response: unknown
}

/**
 * Guardar observaciones de un protocolo en API HOMA Center
 * 
 * @param patientId - ID del paciente
 * @param patientName - Nombre del paciente
 * @param patientSurname - Apellido del paciente
 * @param protocolId - ID del protocolo
 * @param protocolName - Nombre del protocolo
 * @param observations - Array de observaciones del wizard
 * @returns Respuesta del batch guardado
 */
export async function saveProtocolObservations(
  patientId: string,
  patientName: string,
  patientSurname: string,
  protocolId: string,
  protocolName: string,
  observations: WizardObservation[]
): Promise<BatchResponse> {
  try {
    logger.info('Guardando observaciones en HOMA Center:', {
      patientId,
      protocolId,
      observationsCount: observations.length
    })

    // Usar el nuevo servicio HOMA Center
    const result = await guardarBatchObservaciones({
      patientId: parseInt(patientId),
      patientName: patientName || '',
      patientSurname: patientSurname || '',
      protocolId: parseInt(protocolId),
      protocolName: protocolName || '',
      observaciones: observations
    })

    logger.info('Observaciones guardadas exitosamente:', {
      batchId: result.id,
      patientId: result.patientId,
      observationsCount: result.observations.length
    })

    return result
  } catch (error) {
    logger.error('Error guardando observaciones:', error)
    throw new Error(`Error al guardar el control: ${(error as Error).message}`)
  }
}

/**
 * Obtener protocolos por health plan
 */
export async function getProtocolsByHealthPlan(healthplanId: string): Promise<unknown> {
  try {
    return await clienteApi.get(`/api/v1/protocols/${healthplanId}`)
  } catch (error) {
    throw new Error(`Error al obtener protocolos: ${(error as Error).message}`)
  }
}

/**
 * Obtener observaciones de un paciente en un protocolo
 */
export async function getProtocolObservations(patientId: string, protocolId: string): Promise<unknown> {
  try {
    return await clienteApi.get(`/api/v1/protocol/observations/${patientId}/${protocolId}`)
  } catch (error) {
    throw new Error(`Error al obtener observaciones: ${(error as Error).message}`)
  }
}

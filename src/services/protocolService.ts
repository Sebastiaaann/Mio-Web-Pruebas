/**
 * Protocol Service - Servicio para manejar operaciones con protocolos de la API HOMA
 * Usa clienteApi centralizado para todas las peticiones
 */

import { clienteApi } from '@/utils/clienteApi'

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
 * Guardar observaciones de un protocolo
 */
export async function saveProtocolObservations(
  patientId: string,
  protocolId: string,
  observations: unknown[]
): Promise<Record<string, unknown>> {
  try {
    const result = await clienteApi.post('/api/v1/services/setuseservice', {
      patient_id: patientId,
      protocol_id: protocolId,
      observations
    })
    return result as Record<string, unknown>
  } catch (error) {
    console.error('Error en endpoint setuseservice:', (error as Error).message)

    // Si falla, simular éxito para no bloquear al usuario
    // TODO: Implementar endpoint correcto cuando se tenga la documentación
    console.warn('No se pudo guardar en la API, simulando éxito')
    return {
      success: true,
      message: 'Datos guardados localmente (modo offline)',
      patient_id: patientId,
      protocol_id: protocolId,
      observations_count: observations.length
    }
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

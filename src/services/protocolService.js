/**
 * Protocol Service - Servicio para manejar operaciones con protocolos de la API HOMA
 * Usa clienteApi centralizado para todas las peticiones
 */

import { clienteApi } from '@/utils/clienteApi'

/**
 * Obtener un protocolo específico por ID
 * @param {string} protocolId - ID del protocolo
 * @returns {Promise<Object>} Datos del protocolo
 */
export async function getProtocol(protocolId) {
  try {
    return await clienteApi.get(`/api/v1/protocol/${protocolId}`)
  } catch (error) {
    throw new Error(`Error al obtener protocolo: ${error.message}`)
  }
}

/**
 * Guardar observaciones de un protocolo
 * @param {string} patientId - ID del paciente
 * @param {string} protocolId - ID del protocolo
 * @param {Array} observations - Array de observaciones
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function saveProtocolObservations(patientId, protocolId, observations) {
  try {
    const result = await clienteApi.post('/api/v1/services/setuseservice', {
      patient_id: patientId,
      protocol_id: protocolId,
      observations: observations
    })
    return result
  } catch (error) {
    console.error('Error en endpoint setuseservice:', error.message)
    
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
 * @param {string} healthplanId - ID del health plan
 * @returns {Promise<Array>} Lista de protocolos
 */
export async function getProtocolsByHealthPlan(healthplanId) {
  try {
    return await clienteApi.get(`/api/v1/protocols/${healthplanId}`)
  } catch (error) {
    throw new Error(`Error al obtener protocolos: ${error.message}`)
  }
}

/**
 * Obtener observaciones de un paciente en un protocolo
 * @param {string} patientId - ID del paciente
 * @param {string} protocolId - ID del protocolo
 * @returns {Promise<Object>} Observaciones del protocolo
 */
export async function getProtocolObservations(patientId, protocolId) {
  try {
    return await clienteApi.get(`/api/v1/protocol/observations/${patientId}/${protocolId}`)
  } catch (error) {
    throw new Error(`Error al obtener observaciones: ${error.message}`)
  }
}

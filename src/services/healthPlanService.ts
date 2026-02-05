/**
 * Health Plan Service - Servicio para manejar health plans y protocolos de la API HOMA
 * Usa clienteApi centralizado para eliminar duplicación de código
 */

import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'
import type { 
  HealthPlanResponse, 
  ProtocolResponse, 
  HealthPlan,
  ProtocoloAPI 
} from '@/types/api'

/**
 * Obtener health plans de un paciente
 */
export async function getHealthPlans(patientId: string): Promise<HealthPlanResponse> {
  try {
    const response = await clienteApi.get<HealthPlanResponse>(`/api/v1/healthplans/${patientId}`)
    return response
  } catch (error) {
    throw new Error(`Error al obtener health plans: ${(error as Error).message}`)
  }
}

/**
 * Obtener protocolos asociados a un health plan
 */
export async function getProtocolsByHealthPlan(healthplanId: number): Promise<ProtocolResponse> {
  try {
    const response = await clienteApi.get<ProtocolResponse>(`/api/v1/protocols/${healthplanId}`)
    return response
  } catch (error) {
    throw new Error(`Error al obtener protocolos: ${(error as Error).message}`)
  }
}

/**
 * Obtener todos los protocolos disponibles para un paciente
 * Consulta todos sus health plans y acumula los protocolos
 */
export async function getAvailableProtocols(patientId: string): Promise<{ success: boolean; data: ProtocoloAPI[]; error?: string }> {
  try {
    // 1. Obtener health plans del paciente
    const healthPlansResponse = await getHealthPlans(patientId)

    if (!healthPlansResponse.success || !healthPlansResponse.data) {
      throw new Error('No se pudieron obtener los health plans')
    }

    // La API retorna { data: { healthplans: [...] } } (nota: lowercase)
    const healthPlans: HealthPlan[] = healthPlansResponse.data.healthplans
      || healthPlansResponse.data.plans
      || []

    if (!Array.isArray(healthPlans)) {
      logger.error('Formato de respuesta inesperado: healthPlans no es un array')
      throw new Error('Formato de respuesta inesperado: healthPlans no es un array')
    }

    // 2. Para cada health plan, obtener sus protocolos
    const allProtocols: ProtocoloAPI[] = []
    const protocolIds = new Set<string | number>()

    for (const healthPlan of healthPlans) {
      try {
        const planId = healthPlan.id || healthPlan.id_plan
        if (!planId) continue

        const protocolsResponse = await getProtocolsByHealthPlan(Number(planId))

        if (protocolsResponse.success && protocolsResponse.data) {
          // La API retorna { data: { protocol: [...] } }
          const protocols: ProtocoloAPI[] = protocolsResponse.data.protocol 
            || protocolsResponse.data.protocols 
            || []

          // Agregar protocolos que no estén ya en la lista
          for (const protocol of protocols) {
            const protocolId = protocol.id || protocol.protocol_id
            if (protocolId && !protocolIds.has(protocolId)) {
              protocolIds.add(protocolId)
              allProtocols.push({
                ...protocol,
                // Enriquecer con información del plan
              })
            }
          }
        }
      } catch (err) {
        logger.warn(`Error cargando protocolos para health plan ${healthPlan.id || healthPlan.id_plan}`)
        // Continuar con el siguiente health plan
      }
    }

    return {
      success: true,
      data: allProtocols
    }
  } catch (err) {
    logger.error('Error obteniendo protocolos disponibles', err)
    return {
      success: false,
      error: (err as Error).message,
      data: []
    }
  }
}

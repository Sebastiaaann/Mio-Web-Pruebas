/**
 * Health Plan Service - Servicio para manejar health plans y protocolos de la API HOMA
 * Usa clienteApi centralizado para eliminar duplicación de código
 */

import { clienteApi } from '@/utils/clienteApi'

/**
 * Obtener health plans de un paciente
 */
export async function getHealthPlans(patientId: string): Promise<unknown> {
  try {
    return await clienteApi.get(`/api/v1/healthplans/${patientId}`)
  } catch (error) {
    throw new Error(`Error al obtener health plans: ${(error as Error).message}`)
  }
}

/**
 * Obtener protocolos asociados a un health plan
 */
export async function getProtocolsByHealthPlan(healthplanId: number): Promise<unknown> {
  try {
    return await clienteApi.get(`/api/v1/protocols/${healthplanId}`)
  } catch (error) {
    throw new Error(`Error al obtener protocolos: ${(error as Error).message}`)
  }
}

/**
 * Obtener todos los protocolos disponibles para un paciente
 * Consulta todos sus health plans y acumula los protocolos
 */
export async function getAvailableProtocols(patientId: string): Promise<Record<string, unknown>> {
  try {
    // 1. Obtener health plans del paciente
    const healthPlansResponse = await getHealthPlans(patientId) as Record<string, any>

    if (!healthPlansResponse.success || !healthPlansResponse.data) {
      throw new Error('No se pudieron obtener los health plans')
    }

    // La API retorna { data: { healthplans: [...] } } (nota: lowercase)
    const healthPlans = healthPlansResponse.data?.healthplans
      || healthPlansResponse.data?.plans
      || healthPlansResponse.data

    if (!Array.isArray(healthPlans)) {
      console.error('Health plans no es un array:', healthPlans)
      throw new Error('Formato de respuesta inesperado: healthPlans no es un array')
    }

    // 2. Para cada health plan, obtener sus protocolos
    const allProtocols: Record<string, unknown>[] = []
    const protocolIds = new Set()

    for (const healthPlan of healthPlans) {
      try {
        const protocolsResponse = await getProtocolsByHealthPlan(healthPlan.id)

        if ((protocolsResponse as any).success && (protocolsResponse as any).data) {
          // La API retorna { data: { protocol: [...] } }
          const protocols = (protocolsResponse as any).data.protocol || (protocolsResponse as any).data

          // Agregar protocolos que no estén ya en la lista
          for (const protocol of protocols) {
            if (!protocolIds.has(protocol.id)) {
              protocolIds.add(protocol.id)
              allProtocols.push({
                ...protocol,
                healthPlanName: healthPlan.name_plan || healthPlan.name,
                healthPlanId: healthPlan.id_plan || healthPlan.id
              })
            }
          }
        }
      } catch (err) {
        console.warn(`Error cargando protocolos para health plan ${healthPlan.id}:`, err)
        // Continuar con el siguiente health plan
      }
    }

    return {
      success: true,
      data: allProtocols
    }
  } catch (err) {
    console.error('Error obteniendo protocolos disponibles:', err)
    return {
      success: false,
      error: (err as Error).message,
      data: []
    }
  }
}

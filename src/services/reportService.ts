/**
 * Report Service - Servicio para generar reportes PDF desde la API de HOMA
 */

import { clienteApi } from '@/utils/clienteApi'
import { logger } from '@/utils/logger'

export interface ReportePaciente {
  nombre: string
  apellido: string
  rut: string
  email: string
}

export interface ReporteProtocolo {
  nombre: string
  id: string | number
}

export interface ReporteObservacion {
  fecha: string
  tipo: string
  valores: Record<string, number | string>
  evaluacion?: string
}

export interface ReporteData {
  paciente: ReportePaciente
  protocolo: ReporteProtocolo
  observaciones: ReporteObservacion[]
  fechaGeneracion: string
}

export interface ReporteResponse {
  success: boolean
  data?: ReporteData
  error?: string
}

/**
 * Obtener datos del reporte de un protocolo para generar PDF
 */
export async function obtenerDatosReporte(
  patientId: string | number,
  protocolId: string | number
): Promise<ReporteResponse> {
  try {
    const response = await clienteApi.get<ReporteResponse>(
      `/api/v1/protocol/report/${patientId}/${protocolId}`
    )
    return response
  } catch (error) {
    logger.error('Error obteniendo datos del reporte:', error)
    return {
      success: false,
      error: 'No se pudo obtener el reporte. Intente más tarde.'
    }
  }
}

/**
 * Generar reporte PDF usando jsPDF con datos de la API
 * Esta función se usa cuando la API retorna los datos y el PDF
 * se genera en el cliente (fallback o modo híbrido)
 */
export async function generarReportePdf(
  patientId: string | number,
  protocolId: string | number,
  protocolName: string
): Promise<Blob | null> {
  try {
    // Importar jsPDF dinámicamente para evitar problemas de SSR
    const { jsPDF } = await import('jspdf')
    
    // Obtener datos del reporte
    const reporte = await obtenerDatosReporte(patientId, protocolId)
    
    if (!reporte.success || !reporte.data) {
      logger.error('Error obteniendo datos del reporte:', reporte.error)
      return null
    }
    
    const { paciente, observaciones } = reporte.data
    
    // Crear PDF
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.setTextColor(139, 92, 246) // Purple-500
    doc.text('Reporte de Control', 20, 20)
    
    // Info del paciente
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Paciente: ${paciente.nombre} ${paciente.apellido}`, 20, 35)
    doc.text(`RUT: ${paciente.rut}`, 20, 42)
    doc.text(`Protocolo: ${protocolName}`, 20, 49)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 56)
    
    // Línea separadora
    doc.setDrawColor(139, 92, 246)
    doc.line(20, 62, 190, 62)
    
    // Observaciones
    doc.setFontSize(14)
    doc.setTextColor(139, 92, 246)
    doc.text('Historial de Mediciones', 20, 72)
    
    let yPos = 82
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    if (observaciones.length === 0) {
      doc.text('No hay mediciones registradas.', 20, yPos)
    } else {
      for (const obs of observaciones) {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(`Fecha: ${new Date(obs.fecha).toLocaleDateString('es-CL')}`, 20, yPos)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        
        if (obs.valores && Object.keys(obs.valores).length > 0) {
          const valoresStr = Object.entries(obs.valores)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ')
          doc.text(valoresStr, 20, yPos + 7)
        }
        
        if (obs.evaluacion) {
          doc.setTextColor(139, 92, 246)
          doc.text(`Evaluación: ${obs.evaluacion}`, 20, yPos + 14)
        }
        
        yPos += 25
      }
    }
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Generado por Mio+ - AccuHealth', 20, 285)
    
    // Retornar como blob
    return doc.output('blob')
    
  } catch (error) {
    logger.error('Error generando PDF:', error)
    return null
  }
}

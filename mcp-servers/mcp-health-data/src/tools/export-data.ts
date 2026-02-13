import { z } from 'zod';
import { makeApiRequest } from '../services/homa-client.js';
import { exportToJSON, exportToCSV, exportToPDF, PatientData } from '../services/export-service.js';

const ExportDataInputSchema = z.object({
  patientId: z.string().describe('ID del paciente cuyos datos se quieren exportar'),
  format: z.enum(['json', 'csv', 'pdf']).default('json').describe('Formato de exportación: json, csv o pdf'),
  includeMeasurements: z.boolean().default(true).describe('Incluir mediciones en la exportación'),
  includeControls: z.boolean().default(true).describe('Incluir controles en la exportación'),
});

export const exportPatientDataTool = {
  name: 'health_export_patient_data',
  description: `Exporta los datos de salud de un paciente en múltiples formatos.

Este tool obtiene los datos del paciente desde la API HOMA y los exporta en el formato solicitado.
Soporta exportación en JSON (estructurado), CSV (tablas) o PDF (reporte formateado).

Args:
  - patientId: ID único del paciente (requerido)
  - format: Formato de salida - 'json', 'csv', 'pdf' (default: 'json')
  - includeMeasurements: Incluir historial de mediciones (default: true)
  - includeControls: Incluir controles médicos (default: true)

Returns:
  {
    "patientId": string,
    "format": string,
    "exportDate": string,
    "data": {
      "content": string (base64),
      "filename": string,
      "mimeType": string,
      "recordCount": number
    }
  }

Examples:
  - "Exportar datos del paciente 12345 en JSON" -> { patientId: "12345", format: "json" }
  - "Generar CSV con mediciones del paciente 67890" -> { patientId: "67890", format: "csv", includeControls: false }`,
  inputSchema: {
    patientId: z.string(),
    format: z.enum(['json', 'csv', 'pdf']).default('json'),
    includeMeasurements: z.boolean().default(true),
    includeControls: z.boolean().default(true),
  },
  handler: async (args: any) => {
    try {
      const params = {
        patientId: args?.patientId,
        format: args?.format ?? 'json',
        includeMeasurements: args?.includeMeasurements ?? true,
        includeControls: args?.includeControls ?? true,
      };

      // Validar que se proporcionó patientId
      if (!params.patientId) {
        throw new Error('El ID del paciente es requerido');
      }

      // Obtener datos del paciente desde la API
      const profile = await makeApiRequest(`/api/patients/${params.patientId}/profile`);
      const observations = await makeApiRequest(`/api/patients/${params.patientId}/observations`);
      const controls = await makeApiRequest(`/api/patients/${params.patientId}/controls`);

      // Construir objeto PatientData
      const patientData: PatientData = {
        patientId: params.patientId,
        measurements: params.includeMeasurements ? (observations?.data || []) : [],
        controls: params.includeControls ? (controls?.data || []) : [],
        history: profile?.data || {},
      };

      // Exportar según el formato solicitado
      let content: string | Buffer;
      let mimeType: string;
      let filename: string;
      let recordCount = 0;

      switch (params.format) {
        case 'json':
          content = exportToJSON(patientData);
          mimeType = 'application/json';
          filename = `paciente_${params.patientId}_datos.json`;
          recordCount = patientData.measurements.length + patientData.controls.length;
          break;

        case 'csv':
          content = exportToCSV(patientData);
          mimeType = 'text/csv';
          filename = `paciente_${params.patientId}_datos.csv`;
          recordCount = patientData.measurements.length + patientData.controls.length;
          break;

        case 'pdf':
          content = exportToPDF(patientData);
          mimeType = 'application/pdf';
          filename = `paciente_${params.patientId}_reporte.pdf`;
          recordCount = patientData.measurements.length + patientData.controls.length;
          break;

        default:
          throw new Error(`Formato no soportado: ${params.format}`);
      }

      // Convertir a base64
      const base64Content = content instanceof Buffer 
        ? content.toString('base64') 
        : Buffer.from(content).toString('base64');

      const result = {
        patientId: params.patientId,
        format: params.format,
        exportDate: new Date().toISOString(),
        data: {
          content: base64Content,
          filename,
          mimeType,
          recordCount,
        },
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error exportando datos del paciente: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

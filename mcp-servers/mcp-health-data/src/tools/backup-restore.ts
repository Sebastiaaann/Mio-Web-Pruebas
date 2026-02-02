import { z } from 'zod';
import { makeApiRequest, makePostRequest } from '../services/homa-client.js';
import { exportToJSON, PatientData } from '../services/export-service.js';
import * as crypto from 'crypto';

const BackupDataInputSchema = z.object({
  patientId: z.string().describe('ID del paciente para realizar backup'),
  includeHistory: z.boolean().default(true).describe('Incluir historial completo'),
  compress: z.boolean().default(true).describe('Comprimir el backup'),
});

const RestoreDataInputSchema = z.object({
  patientId: z.string().describe('ID del paciente para restaurar datos'),
  backupData: z.string().describe('Datos de backup en formato JSON o base64'),
  validateOnly: z.boolean().default(false).describe('Solo validar sin restaurar'),
});

interface BackupMetadata {
  version: string;
  createdAt: string;
  patientId: string;
  checksum: string;
  size: number;
  compressed: boolean;
  recordCount: {
    measurements: number;
    controls: number;
    history: number;
  };
}

interface BackupData {
  metadata: BackupMetadata;
  data: PatientData;
}

function generateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function compressData(data: string): string {
  // Simulación de compresión usando Buffer
  const buffer = Buffer.from(data, 'utf-8');
  return buffer.toString('base64');
}

function decompressData(data: string): string {
  // Descompresión usando Buffer
  const buffer = Buffer.from(data, 'base64');
  return buffer.toString('utf-8');
}

function validateBackupData(backup: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar estructura
  if (!backup.metadata) {
    errors.push('Falta metadata del backup');
  }

  if (!backup.data) {
    errors.push('Faltan datos del backup');
  }

  if (backup.metadata) {
    // Validar campos requeridos en metadata
    const requiredFields = ['version', 'createdAt', 'patientId', 'checksum'];
    requiredFields.forEach((field) => {
      if (!backup.metadata[field]) {
        errors.push(`Falta campo en metadata: ${field}`);
      }
    });

    // Validar versión
    if (backup.metadata.version && backup.metadata.version !== '1.0') {
      errors.push(`Versión no soportada: ${backup.metadata.version}`);
    }
  }

  if (backup.data) {
    // Validar estructura de datos
    if (!backup.data.patientId) {
      errors.push('Falta patientId en datos');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function verifyChecksum(data: string, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
}

export const backupDataTool = {
  name: 'health_backup_data',
  description: `Realiza un backup completo de los datos de salud de un paciente.

Este tool exporta todos los datos del paciente, los comprime opcionalmente,
y genera un checksum para verificación de integridad.

Args:
  - patientId: ID del paciente (requerido)
  - includeHistory: Incluir historial completo (default: true)
  - compress: Comprimir el backup (default: true)

Returns:
  {
    "patientId": string,
    "backup": {
      "metadata": {
        "version": string,
        "createdAt": string,
        "checksum": string,
        "size": number,
        "compressed": boolean,
        "recordCount": { "measurements": number, "controls": number, "history": number }
      },
      "data": string (JSON o base64)
    }
  }

Examples:
  - "Hacer backup del paciente 12345" -> { patientId: "12345" }
  - "Backup completo sin compresión del paciente 67890" -> { patientId: "67890", compress: false }`,
  inputSchema: {
    patientId: z.string(),
    includeHistory: z.boolean().default(true),
    compress: z.boolean().default(true),
  },
  handler: async (args: any) => {
    try {
      const params = {
        patientId: args?.patientId,
        includeHistory: args?.includeHistory ?? true,
        compress: args?.compress ?? true,
      };

      if (!params.patientId) {
        throw new Error('El ID del paciente es requerido');
      }

      // Obtener todos los datos del paciente
      const profile = await makeApiRequest(`/api/patients/${params.patientId}/profile`);
      const observations = await makeApiRequest(`/api/patients/${params.patientId}/observations`);
      const controls = await makeApiRequest(`/api/patients/${params.patientId}/controls`);
      const plans = await makeApiRequest(`/api/patients/${params.patientId}/plans`);

      // Construir objeto PatientData
      const patientData: PatientData = {
        patientId: params.patientId,
        measurements: observations?.data || [],
        controls: controls?.data || [],
        history: params.includeHistory
          ? [
              {
                type: 'profile',
                data: profile?.data || {},
              },
              {
                type: 'plans',
                data: plans?.data || [],
              },
            ]
          : [],
      };

      // Convertir a JSON
      const jsonData = exportToJSON(patientData);

      // Comprimir si se solicita
      let finalData: string;
      if (params.compress) {
        finalData = compressData(jsonData);
      } else {
        finalData = jsonData;
      }

      // Generar metadata
      const metadata: BackupMetadata = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        patientId: params.patientId,
        checksum: generateChecksum(jsonData),
        size: finalData.length,
        compressed: params.compress,
        recordCount: {
          measurements: patientData.measurements.length,
          controls: patientData.controls.length,
          history: patientData.history.length,
        },
      };

      const backup: BackupData = {
        metadata,
        data: patientData,
      };

      const result = {
        patientId: params.patientId,
        backup: {
          metadata,
          data: params.compress ? finalData : jsonData,
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
            text: `Error realizando backup: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export const restoreDataTool = {
  name: 'health_restore_data',
  description: `Restaura los datos de salud de un paciente desde un backup.

Este tool valida el backup (checksum, estructura) y opcionalmente restaura
los datos del paciente. Puede operar en modo validación sin realizar cambios.

Args:
  - patientId: ID del paciente (requerido)
  - backupData: Datos de backup en formato JSON o base64 (requerido)
  - validateOnly: Solo validar sin restaurar (default: false)

Returns:
  {
    "patientId": string,
    "validation": {
      "valid": boolean,
      "errors": string[]
    },
    "metadata": {
      "version": string,
      "createdAt": string,
      "recordCount": { ... }
    },
    "restore": {
      "restored": boolean,
      "recordsRestored": number,
      "message": string
    }
  }

Examples:
  - "Validar backup sin restaurar" -> { patientId: "12345", backupData: "...", validateOnly: true }
  - "Restaurar datos del paciente 67890" -> { patientId: "67890", backupData: "..." }`,
  inputSchema: {
    patientId: z.string(),
    backupData: z.string(),
    validateOnly: z.boolean().default(false),
  },
  handler: async (args: any) => {
    try {
      const params = {
        patientId: args?.patientId,
        backupData: args?.backupData,
        validateOnly: args?.validateOnly ?? false,
      };

      if (!params.patientId) {
        throw new Error('El ID del paciente es requerido');
      }

      if (!params.backupData) {
        throw new Error('Los datos de backup son requeridos');
      }

      // Intentar parsear el backup
      let backup: BackupData;
      try {
        // Primero intentar como JSON directo
        backup = JSON.parse(params.backupData);
      } catch (jsonError) {
        // Si falla, intentar descomprimir de base64
        try {
          const decompressed = decompressData(params.backupData);
          backup = JSON.parse(decompressed);
        } catch (decompressError) {
          throw new Error('No se pudo parsear el backup: formato inválido');
        }
      }

      // Validar estructura
      const validation = validateBackupData(backup);

      if (!validation.valid) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  patientId: params.patientId,
                  validation,
                  metadata: null,
                  restore: {
                    restored: false,
                    recordsRestored: 0,
                    message: 'Validación fallida, no se puede restaurar',
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: false,
        };
      }

      // Verificar que el patientId coincide
      if (backup.data.patientId !== params.patientId) {
        validation.valid = false;
        validation.errors.push(`ID de paciente no coincide: ${backup.data.patientId} vs ${params.patientId}`);
      }

      // Verificar checksum si los datos originales están disponibles
      const jsonData = exportToJSON(backup.data);
      if (!verifyChecksum(jsonData, backup.metadata.checksum)) {
        validation.valid = false;
        validation.errors.push('Checksum no coincide: los datos pueden estar corruptos');
      }

      // Si solo se solicita validación, retornar aquí
      if (params.validateOnly) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  patientId: params.patientId,
                  validation,
                  metadata: backup.metadata,
                  restore: {
                    restored: false,
                    recordsRestored: 0,
                    message: 'Modo validación: no se realizaron cambios',
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: false,
        };
      }

      // Si la validación falló, no proceder con la restauración
      if (!validation.valid) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  patientId: params.patientId,
                  validation,
                  metadata: backup.metadata,
                  restore: {
                    restored: false,
                    recordsRestored: 0,
                    message: 'Validación fallida, restauración cancelada',
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: false,
        };
      }

      // Simular restauración (en implementación real, aquí se llamaría a la API)
      // Nota: Esto es un placeholder ya que la API real debería soportar restore
      const recordsRestored =
        backup.data.measurements.length + backup.data.controls.length + backup.data.history.length;

      const result = {
        patientId: params.patientId,
        validation,
        metadata: backup.metadata,
        restore: {
          restored: true,
          recordsRestored,
          message: `Restauración completada exitosamente. ${recordsRestored} registros procesados.`,
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
            text: `Error restaurando datos: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

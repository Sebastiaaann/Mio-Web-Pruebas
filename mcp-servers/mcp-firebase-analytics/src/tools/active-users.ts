import { z } from 'zod';
import { getAnalyticsClient, getPropertyId } from '../services/analytics-client.js';

const ActiveUsersInputSchema = z.object({
  days: z
    .number()
    .default(7)
    .describe('Número de días hacia atrás para analizar'),
  dimension: z
    .enum(['date', 'country', 'deviceCategory', 'platform'])
    .default('date')
    .describe('Dimensión para agrupar resultados'),
});

export const getActiveUsersTool = {
  name: 'analytics_get_active_users',
  description: `Obtiene métricas de usuarios activos en un período específico.

Este tool consulta Google Analytics 4 para obtener métricas de usuarios activos,
nuevos usuarios y sesiones.

Args:
  - days: Número de días hacia atrás (default: 7)
  - dimension: Dimensión para agrupar - 'date', 'country', 'deviceCategory', 'platform'

Returns:
  {
    "period": string,
    "dimension": string,
    "data": [
      {
        "dimension": string,
        "activeUsers": number,
        "newUsers": number,
        "sessions": number
      }
    ]
  }

Examples:
  - "Usuarios activos última semana" -> { days: 7 }
  - "Usuarios por país último mes" -> { days: 30, dimension: "country" }`,
  inputSchema: {
    days: z.number().default(7),
    dimension: z.enum(['date', 'country', 'deviceCategory', 'platform']).default('date'),
  },
  handler: async (args: any) => {
    try {
      const params = {
        days: args?.days ?? 7,
        dimension: args?.dimension ?? 'date',
      };

      const client = getAnalyticsClient();
      const propertyId = getPropertyId();

      const [response] = await client.runReport({
        property: propertyId,
        dateRanges: [
          {
            startDate: `${params.days}daysAgo`,
            endDate: 'today',
          },
        ],
        dimensions: [{ name: params.dimension }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
        ],
      });

      const rows = response.rows || [];
      const data = rows.map((row) => ({
        dimension: row.dimensionValues?.[0]?.value || 'unknown',
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
        newUsers: parseInt(row.metricValues?.[1]?.value || '0', 10),
        sessions: parseInt(row.metricValues?.[2]?.value || '0', 10),
      }));

      const result = {
        period: `Últimos ${params.days} días`,
        dimension: params.dimension,
        data,
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
            text: `Error obteniendo usuarios activos: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

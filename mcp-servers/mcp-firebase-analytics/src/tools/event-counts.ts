import { z } from 'zod';
import { getAnalyticsClient, getPropertyId } from '../services/analytics-client.js';

const EventCountsInputSchema = z.object({
  eventNames: z
    .array(z.string())
    .optional()
    .describe('Nombres de eventos específicos (vacío = todos)'),
  days: z
    .number()
    .default(30)
    .describe('Número de días hacia atrás'),
});

export const getEventCountsTool = {
  name: 'analytics_get_event_counts',
  description: `Obtiene conteo de eventos específicos de Firebase Analytics.

Este tool consulta Google Analytics 4 para obtener el conteo de eventos
personalizados como login, registro de mediciones, uso de servicios, etc.

Args:
  - eventNames: Array de nombres de eventos (opcional, vacío = todos)
  - days: Número de días hacia atrás (default: 30)

Returns:
  {
    "events": [
      {
        "name": string,
        "count": number,
        "value": number
      }
    ]
  }

Examples:
  - "Todos los eventos del último mes" -> { days: 30 }
  - "Eventos específicos" -> { eventNames: ["login", "plan_selected"], days: 7 }`,
  inputSchema: {
    eventNames: z.array(z.string()).optional(),
    days: z.number().default(30),
  },
  handler: async (args: any) => {
    try {
      const params = {
        eventNames: args?.eventNames || [],
        days: args?.days ?? 30,
      };

      const client = getAnalyticsClient();
      const propertyId = getPropertyId();

      const request: any = {
        property: propertyId,
        dateRanges: [
          {
            startDate: `${params.days}daysAgo`,
            endDate: 'today',
          },
        ],
        dimensions: [{ name: 'eventName' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'eventValue' },
        ],
      };

      // Si se especifican eventos, agregar filtro
      if (params.eventNames.length > 0) {
        request.dimensionFilter = {
          filter: {
            fieldName: 'eventName',
            inListFilter: { values: params.eventNames },
          },
        };
      }

      const [response] = await client.runReport(request);

      const rows = response.rows || [];
      const events = rows.map((row) => ({
        name: row.dimensionValues?.[0]?.value || 'unknown',
        count: parseInt(row.metricValues?.[0]?.value || '0', 10),
        value: parseFloat(row.metricValues?.[1]?.value || '0'),
      }));

      const result = { events };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error obteniendo eventos: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

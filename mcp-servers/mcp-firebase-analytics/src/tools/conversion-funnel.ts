import { z } from 'zod';
import { getAnalyticsClient, getPropertyId } from '../services/analytics-client.js';

const ConversionFunnelInputSchema = z.object({
  days: z
    .number()
    .default(30)
    .describe('Número de días hacia atrás para analizar el embudo'),
});

export const getConversionFunnelTool = {
  name: 'analytics_get_conversion_funnel',
  description: `Obtiene el embudo de conversión de la aplicación.

Este tool analiza el embudo de conversión mostrando cuántos usuarios pasan
por cada etapa: login -> registro de controles -> uso de servicios -> etc.

Args:
  - days: Número de días hacia atrás (default: 30)

Returns:
  {
    "period": string,
    "funnel": [
      {
        "stage": string,
        "users": number,
        "conversionRate": number
      }
    ]
  }

Examples:
  - "Embudo del último mes" -> { days: 30 }
  - "Embudo última semana" -> { days: 7 }`,
  inputSchema: {
    days: z.number().default(30),
  },
  handler: async (args: any) => {
    try {
      const params = {
        days: args?.days ?? 30,
      };

      const client = getAnalyticsClient();
      const propertyId = getPropertyId();

      // Consultar eventos clave del embudo
      const funnelEvents = ['session_start', 'login', 'page_view', 'plan_selected', 'service_used'];

      const request = {
        property: propertyId,
        dateRanges: [
          {
            startDate: `${params.days}daysAgo`,
            endDate: 'today',
          },
        ],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: { values: funnelEvents },
          },
        },
      };

      const [response] = await client.runReport(request);

      const rows = response.rows || [];

      // Crear mapa de eventos
      const eventMap = new Map();
      rows.forEach((row) => {
        const eventName = row.dimensionValues?.[0]?.value;
        const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
        const users = parseInt(row.metricValues?.[1]?.value || '0', 10);
        eventMap.set(eventName, { count, users });
      });

      // Construir embudo
      const funnelStages = [
        { name: 'session_start', label: 'Inicio de Sesión' },
        { name: 'login', label: 'Login Completado' },
        { name: 'page_view', label: 'Vista de Página' },
        { name: 'plan_selected', label: 'Plan Seleccionado' },
        { name: 'service_used', label: 'Servicio Utilizado' },
      ];

      const funnel = funnelStages.map((stage, index) => {
        const data = eventMap.get(stage.name) || { count: 0, users: 0 };
        const prevStage = index > 0 ? funnelStages[index - 1] : null;
        const prevData = prevStage ? eventMap.get(prevStage.name) : null;

        let conversionRate = 0;
        if (prevData && prevData.users > 0) {
          conversionRate = (data.users / prevData.users) * 100;
        } else if (index === 0) {
          conversionRate = 100; // Primera etapa
        }

        return {
          stage: stage.label,
          users: data.users,
          events: data.count,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      });

      const result = {
        period: `Últimos ${params.days} días`,
        funnel,
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
            text: `Error obteniendo embudo: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

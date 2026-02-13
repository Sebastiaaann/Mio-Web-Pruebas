import { z } from 'zod';
import { getAnalyticsClient, getPropertyId } from '../services/analytics-client.js';

const WeeklyReportInputSchema = z.object({
  weekOffset: z
    .number()
    .default(0)
    .describe('Semanas hacia atrás (0 = semana actual)'),
});

export const generateWeeklyReportTool = {
  name: 'analytics_generate_weekly_report',
  description: `Genera un reporte semanal con métricas clave de la aplicación.

Este tool crea un resumen semanal con métricas importantes como usuarios activos,
vistas de pantalla, duración de sesiones, tasa de engagement y conversiones.

Args:
  - weekOffset: Semanas hacia atrás (0 = semana actual, 1 = semana pasada)

Returns:
  Reporte formateado con:
  - Usuarios activos
  - Vistas de pantalla
  - Duración promedio de sesión
  - Tasa de engagement
  - Conversiones
  - Tendencia diaria

Examples:
  - "Reporte de esta semana" -> { weekOffset: 0 }
  - "Reporte de la semana pasada" -> { weekOffset: 1 }`,
  inputSchema: {
    weekOffset: z.number().default(0),
  },
  handler: async (args: any) => {
    try {
      const params = {
        weekOffset: args?.weekOffset ?? 0,
      };

      const client = getAnalyticsClient();
      const propertyId = getPropertyId();

      // Calcular fechas
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - params.weekOffset * 7);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      const [response] = await client.runReport({
        property: propertyId,
        dateRanges: [
          {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
          },
        ],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'engagementRate' },
          { name: 'conversions' },
        ],
      });

      const rows = response.rows || [];

      // Calcular totales
      const totals = {
        activeUsers: rows.reduce((sum, r) => sum + parseInt(r.metricValues?.[0]?.value || '0', 10), 0),
        pageViews: rows.reduce((sum, r) => sum + parseInt(r.metricValues?.[1]?.value || '0', 10), 0),
        avgSessionDuration:
          rows.length > 0
            ? rows.reduce((sum, r) => sum + parseFloat(r.metricValues?.[2]?.value || '0'), 0) / rows.length
            : 0,
        engagementRate:
          rows.length > 0
            ? rows.reduce((sum, r) => sum + parseFloat(r.metricValues?.[3]?.value || '0'), 0) / rows.length
            : 0,
        conversions: rows.reduce((sum, r) => sum + parseInt(r.metricValues?.[4]?.value || '0', 10), 0),
      };

      const report = `📊 Reporte Semanal (${formatDate(startDate)} - ${formatDate(endDate)})

👥 Usuarios Activos: ${totals.activeUsers.toLocaleString()}
📄 Vistas de Pantalla: ${totals.pageViews.toLocaleString()}
⏱️ Duración Promedio de Sesión: ${(totals.avgSessionDuration / 60).toFixed(2)} minutos
📈 Tasa de Engagement: ${(totals.engagementRate * 100).toFixed(2)}%
🎯 Conversiones: ${totals.conversions.toLocaleString()}

Tendencia Diaria:
${rows
  .map((r) => `  ${r.dimensionValues?.[0]?.value}: ${r.metricValues?.[0]?.value} usuarios`)
  .join('\n')}`;

      return {
        content: [{ type: 'text' as const, text: report }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error generando reporte: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

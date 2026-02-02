import { z } from 'zod';
import { makeApiRequest } from '../services/homa-client.js';

const GenerateReportInputSchema = z.object({
  patientId: z.string().describe('ID del paciente para generar el reporte'),
  period: z.enum(['7d', '30d', '90d', '6m', '1y']).default('30d').describe('Período del reporte: 7d, 30d, 90d, 6m, 1y'),
  includeSummary: z.boolean().default(true).describe('Incluir resumen ejecutivo'),
  includeTrends: z.boolean().default(true).describe('Incluir análisis de tendencias'),
  includeAlerts: z.boolean().default(true).describe('Incluir alertas y recomendaciones'),
});

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  date: string;
  status: 'normal' | 'warning' | 'critical';
}

interface TrendAnalysis {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  changePercentage: number;
  average: number;
  status: string;
}

interface HealthAlert {
  type: 'info' | 'warning' | 'critical';
  message: string;
  metric?: string;
  recommendation?: string;
}

function calculateDaysFromPeriod(period: string): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '6m': return 180;
    case '1y': return 365;
    default: return 30;
  }
}

function analyzeTrends(measurements: any[], days: number): TrendAnalysis[] {
  if (!measurements || measurements.length === 0) {
    return [];
  }

  // Agrupar mediciones por tipo
  const groupedByType: { [key: string]: any[] } = {};
  measurements.forEach((m) => {
    const type = m.tipo || m.type || 'general';
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push(m);
  });

  const trends: TrendAnalysis[] = [];

  Object.keys(groupedByType).forEach((type) => {
    const items = groupedByType[type];
    if (items.length < 2) return;

    // Ordenar por fecha
    items.sort((a, b) => new Date(a.fecha || a.date).getTime() - new Date(b.fecha || b.date).getTime());

    // Calcular promedio
    const values = items.map((i) => parseFloat(i.valor || i.value) || 0);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    // Calcular tendencia
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(changePercentage) < 5) {
      direction = 'stable';
    } else if (changePercentage > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    // Determinar estado basado en el tipo de métrica
    let status = 'normal';
    if (type.toLowerCase().includes('peso') && changePercentage > 5) {
      status = 'warning';
    } else if (type.toLowerCase().includes('presion') && average > 140) {
      status = 'critical';
    } else if (type.toLowerCase().includes('glucosa') && average > 126) {
      status = 'warning';
    }

    trends.push({
      metric: type,
      direction,
      changePercentage: Math.round(changePercentage * 100) / 100,
      average: Math.round(average * 100) / 100,
      status,
    });
  });

  return trends;
}

function generateAlerts(measurements: any[], trends: TrendAnalysis[]): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  if (!measurements || measurements.length === 0) {
    alerts.push({
      type: 'info',
      message: 'No hay datos suficientes para generar alertas',
    });
    return alerts;
  }

  // Analizar últimas mediciones
  const lastMeasurements = measurements.slice(-5);

  lastMeasurements.forEach((m) => {
    const tipo = (m.tipo || m.type || '').toLowerCase();
    const valor = parseFloat(m.valor || m.value) || 0;

    // Alertas de presión arterial
    if (tipo.includes('presion') || tipo.includes('tension')) {
      if (valor > 140) {
        alerts.push({
          type: 'critical',
          message: `Presión arterial elevada detectada: ${valor}`,
          metric: tipo,
          recommendation: 'Consultar con médico de inmediato',
        });
      } else if (valor > 120) {
        alerts.push({
          type: 'warning',
          message: `Presión arterial ligeramente elevada: ${valor}`,
          metric: tipo,
          recommendation: 'Monitorear regularmente',
        });
      }
    }

    // Alertas de glucosa
    if (tipo.includes('glucosa') || tipo.includes('glucose')) {
      if (valor > 180) {
        alerts.push({
          type: 'critical',
          message: `Nivel de glucosa muy alto: ${valor}`,
          metric: tipo,
          recommendation: 'Revisar dieta y consultar médico',
        });
      } else if (valor > 126) {
        alerts.push({
          type: 'warning',
          message: `Nivel de glucosa elevado: ${valor}`,
          metric: tipo,
          recommendation: 'Considerar ajustes en alimentación',
        });
      }
    }
  });

  // Alertas basadas en tendencias
  trends.forEach((trend) => {
    if (trend.status === 'critical') {
      alerts.push({
        type: 'critical',
        message: `Tendencia crítica detectada en ${trend.metric}`,
        metric: trend.metric,
        recommendation: 'Seguimiento médico recomendado',
      });
    }
  });

  // Si no hay alertas, agregar mensaje positivo
  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      message: 'No se detectaron alertas significativas en el período analizado',
    });
  }

  return alerts;
}

function generateSummary(measurements: any[], controls: any[], trends: TrendAnalysis[]): any {
  const totalMeasurements = measurements?.length || 0;
  const totalControls = controls?.length || 0;
  const activeTrends = trends.filter((t) => t.status !== 'normal').length;

  // Calcular fechas del período
  const dates = measurements?.map((m) => new Date(m.fecha || m.date)).filter((d) => !isNaN(d.getTime())) || [];
  const firstDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const lastDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

  return {
    totalMeasurements,
    totalControls,
    activeTrends,
    dateRange: {
      from: firstDate?.toISOString() || null,
      to: lastDate?.toISOString() || null,
    },
    metricsCount: trends.length,
    lastUpdated: new Date().toISOString(),
  };
}

export const generateReportTool = {
  name: 'health_generate_report',
  description: `Genera un reporte completo de salud con análisis y alertas.

Este tool crea un reporte detallado del estado de salud del paciente incluyendo:
- Resumen ejecutivo con estadísticas clave
- Análisis de tendencias de métricas de salud
- Alertas automáticas basadas en umbrales médicos
- Recomendaciones personalizadas

Args:
  - patientId: ID del paciente (requerido)
  - period: Período del reporte - '7d', '30d', '90d', '6m', '1y' (default: '30d')
  - includeSummary: Incluir resumen ejecutivo (default: true)
  - includeTrends: Incluir análisis de tendencias (default: true)
  - includeAlerts: Incluir alertas y recomendaciones (default: true)

Returns:
  {
    "patientId": string,
    "period": string,
    "generatedAt": string,
    "summary": { ... },
    "trends": [...],
    "alerts": [...]
  }

Examples:
  - "Generar reporte del paciente 12345 últimos 30 días" -> { patientId: "12345", period: "30d" }
  - "Reporte de salud anual del paciente 67890" -> { patientId: "67890", period: "1y" }`,
  inputSchema: {
    patientId: z.string(),
    period: z.enum(['7d', '30d', '90d', '6m', '1y']).default('30d'),
    includeSummary: z.boolean().default(true),
    includeTrends: z.boolean().default(true),
    includeAlerts: z.boolean().default(true),
  },
  handler: async (args: any) => {
    try {
      const params = {
        patientId: args?.patientId,
        period: args?.period ?? '30d',
        includeSummary: args?.includeSummary ?? true,
        includeTrends: args?.includeTrends ?? true,
        includeAlerts: args?.includeAlerts ?? true,
      };

      if (!params.patientId) {
        throw new Error('El ID del paciente es requerido');
      }

      const days = calculateDaysFromPeriod(params.period);

      // Obtener datos del paciente
      const profile = await makeApiRequest(`/api/patients/${params.patientId}/profile`);
      const observations = await makeApiRequest(`/api/patients/${params.patientId}/observations`);
      const controls = await makeApiRequest(`/api/patients/${params.patientId}/controls`);

      // Filtrar mediciones por período
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const measurements = (observations?.data || []).filter((m: any) => {
        const date = new Date(m.fecha || m.date);
        return date >= cutoffDate;
      });

      // Generar análisis
      const trends = params.includeTrends ? analyzeTrends(measurements, days) : [];
      const alerts = params.includeAlerts ? generateAlerts(measurements, trends) : [];
      const summary = params.includeSummary ? generateSummary(measurements, controls?.data || [], trends) : null;

      const result = {
        patientId: params.patientId,
        patientName: profile?.data?.nombre || 'Desconocido',
        period: params.period,
        generatedAt: new Date().toISOString(),
        summary,
        trends,
        alerts,
        metadata: {
          totalMeasurements: measurements.length,
          measurementTypes: [...new Set(measurements.map((m: any) => m.tipo || m.type || 'general'))],
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
            text: `Error generando reporte de salud: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

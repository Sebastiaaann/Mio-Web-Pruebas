import { z } from 'zod';
import { makeApiRequest } from '../services/homa-client.js';

const GetTrendsInputSchema = z.object({
  patientId: z.string().describe('ID del paciente para analizar tendencias'),
  metricType: z.enum(['peso', 'presion', 'glucosa', 'frecuencia', 'temperatura', 'all']).default('all').describe('Tipo de métrica: peso, presion, glucosa, frecuencia, temperatura, all'),
  days: z.number().default(30).describe('Número de días hacia atrás para analizar'),
});

interface MetricData {
  date: string;
  value: number;
  unit: string;
}

interface StatisticalAnalysis {
  metric: string;
  unit: string;
  count: number;
  average: number;
  median: number;
  stdDeviation: number;
  min: number;
  max: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    slope: number;
    confidence: number;
  };
  changeFromStart: {
    absolute: number;
    percentage: number;
  };
  dataPoints: MetricData[];
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

function calculateLinearRegression(dates: Date[], values: number[]): { slope: number; confidence: number } {
  if (dates.length < 2 || values.length < 2) {
    return { slope: 0, confidence: 0 };
  }

  const n = dates.length;
  const x = dates.map((d, i) => i); // Usar índices como eje X
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Calcular R² para la confianza
  const avgY = sumY / n;
  const ssTotal = y.reduce((total, yi) => total + Math.pow(yi - avgY, 2), 0);
  const predicted = x.map((xi) => slope * xi + (sumY - slope * sumX) / n);
  const ssResidual = y.reduce((total, yi, i) => total + Math.pow(yi - predicted[i], 2), 0);
  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return {
    slope: Math.round(slope * 1000) / 1000,
    confidence: Math.round(rSquared * 100) / 100,
  };
}

function determineTrendDirection(slope: number, metricType: string): 'up' | 'down' | 'stable' {
  const threshold = 0.01;
  
  if (Math.abs(slope) < threshold) {
    return 'stable';
  }

  // Para ciertas métricas, 'up' puede ser bueno o malo dependiendo del contexto
  // Pero aquí solo determinamos la dirección
  return slope > 0 ? 'up' : 'down';
}

function mapMetricType(apiType: string): string {
  const lowerType = apiType.toLowerCase();
  
  if (lowerType.includes('peso') || lowerType.includes('weight')) return 'peso';
  if (lowerType.includes('presion') || lowerType.includes('tension') || lowerType.includes('pressure')) return 'presion';
  if (lowerType.includes('glucosa') || lowerType.includes('glucose') || lowerType.includes('azucar')) return 'glucosa';
  if (lowerType.includes('frecuencia') || lowerType.includes('heart') || lowerType.includes('pulso')) return 'frecuencia';
  if (lowerType.includes('temperatura') || lowerType.includes('temperature')) return 'temperatura';
  
  return 'other';
}

function analyzeMetric(measurements: any[], metricType: string): StatisticalAnalysis | null {
  if (!measurements || measurements.length === 0) {
    return null;
  }

  // Extraer valores y fechas
  const dataPoints: MetricData[] = measurements
    .map((m) => ({
      date: m.fecha || m.date,
      value: parseFloat(m.valor || m.value) || 0,
      unit: m.unidad || m.unit || '',
    }))
    .filter((dp) => !isNaN(dp.value))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (dataPoints.length === 0) {
    return null;
  }

  const values = dataPoints.map((dp) => dp.value);
  const dates = dataPoints.map((dp) => new Date(dp.date));

  // Calcular estadísticas
  const count = values.length;
  const average = values.reduce((a, b) => a + b, 0) / count;
  const median = calculateMedian(values);
  const stdDeviation = calculateStandardDeviation(values);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Calcular regresión lineal
  const regression = calculateLinearRegression(dates, values);

  // Determinar dirección de tendencia
  const direction = determineTrendDirection(regression.slope, metricType);

  // Calcular cambio desde el inicio
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const absoluteChange = lastValue - firstValue;
  const percentageChange = firstValue !== 0 ? (absoluteChange / firstValue) * 100 : 0;

  return {
    metric: metricType,
    unit: dataPoints[0].unit,
    count,
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDeviation: Math.round(stdDeviation * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    trend: {
      direction,
      slope: regression.slope,
      confidence: regression.confidence,
    },
    changeFromStart: {
      absolute: Math.round(absoluteChange * 100) / 100,
      percentage: Math.round(percentageChange * 100) / 100,
    },
    dataPoints: dataPoints.slice(-10), // Incluir solo últimos 10 puntos para no saturar
  };
}

export const getTrendsTool = {
  name: 'health_get_trends',
  description: `Analiza tendencias estadísticas de métricas de salud del paciente.

Este tool realiza análisis estadístico completo incluyendo:
- Cálculo de promedio, mediana y desviación estándar
- Regresión lineal para detectar dirección de tendencia
- Cambio porcentual desde el inicio del período
- Análisis por tipo de métrica (peso, presión, glucosa, etc.)

Args:
  - patientId: ID del paciente (requerido)
  - metricType: Tipo de métrica - 'peso', 'presion', 'glucosa', 'frecuencia', 'temperatura', 'all' (default: 'all')
  - days: Número de días hacia atrás (default: 30)

Returns:
  {
    "patientId": string,
    "period": { "days": number, "from": string, "to": string },
    "metrics": [
      {
        "metric": string,
        "unit": string,
        "count": number,
        "average": number,
        "median": number,
        "stdDeviation": number,
        "min": number,
        "max": number,
        "trend": { "direction": "up|down|stable", "slope": number, "confidence": number },
        "changeFromStart": { "absolute": number, "percentage": number }
      }
    ]
  }

Examples:
  - "Analizar tendencias de peso del paciente 12345 últimos 60 días" -> { patientId: "12345", metricType: "peso", days: 60 }
  - "Ver tendencias de presión del paciente 67890" -> { patientId: "67890", metricType: "presion" }
  - "Todas las métricas del paciente 11111 última semana" -> { patientId: "11111", days: 7 }`,
  inputSchema: {
    patientId: z.string(),
    metricType: z.enum(['peso', 'presion', 'glucosa', 'frecuencia', 'temperatura', 'all']).default('all'),
    days: z.number().default(30),
  },
  handler: async (args: any) => {
    try {
      const params = {
        patientId: args?.patientId,
        metricType: args?.metricType ?? 'all',
        days: args?.days ?? 30,
      };

      if (!params.patientId) {
        throw new Error('El ID del paciente es requerido');
      }

      // Obtener observaciones del paciente
      const observations = await makeApiRequest(`/api/patients/${params.patientId}/observations`);
      const measurements = observations?.data || [];

      // Filtrar por período
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - params.days);

      const filteredMeasurements = measurements.filter((m: any) => {
        const date = new Date(m.fecha || m.date);
        return date >= cutoffDate;
      });

      // Agrupar por tipo de métrica
      const groupedByType: { [key: string]: any[] } = {};
      filteredMeasurements.forEach((m: any) => {
        const mappedType = mapMetricType(m.tipo || m.type || 'general');
        
        // Si se solicitó un tipo específico, filtrar
        if (params.metricType !== 'all' && mappedType !== params.metricType) {
          return;
        }

        if (!groupedByType[mappedType]) {
          groupedByType[mappedType] = [];
        }
        groupedByType[mappedType].push(m);
      });

      // Analizar cada métrica
      const analyzedMetrics: StatisticalAnalysis[] = [];
      Object.keys(groupedByType).forEach((type) => {
        const analysis = analyzeMetric(groupedByType[type], type);
        if (analysis) {
          analyzedMetrics.push(analysis);
        }
      });

      // Calcular rango de fechas
      const dates = filteredMeasurements.map((m: any) => new Date(m.fecha || m.date)).filter((d: Date) => !isNaN(d.getTime()));
      const from = dates.length > 0 ? new Date(Math.min(...dates.map((d: Date) => d.getTime()))) : cutoffDate;
      const to = dates.length > 0 ? new Date(Math.max(...dates.map((d: Date) => d.getTime()))) : new Date();

      const result = {
        patientId: params.patientId,
        period: {
          days: params.days,
          from: from.toISOString(),
          to: to.toISOString(),
        },
        metrics: analyzedMetrics,
        totalMeasurements: filteredMeasurements.length,
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
            text: `Error analizando tendencias: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

import { z } from 'zod';
import { runCommand, parseCoverageResults } from '../services/command-runner.js';

export const coverageTool = {
  name: 'testing_get_coverage',
  description: `Genera reporte de cobertura de código usando Vitest.

Este tool ejecuta los tests con cobertura habilitada y genera un reporte
detallado de qué porcentaje del código está cubierto por tests.

Args:
  - reporter: Formato del reporte - 'text', 'text-summary', 'json', 'html', 'lcov'
  - include: Patrón de archivos a incluir
  - exclude: Patrón de archivos a excluir
  - threshold: Umbral mínimo de cobertura (si se especifica, falla si no se alcanza)

Returns:
  {
    "success": boolean,
    "coverage": {
      "lines": number,
      "functions": number,
      "branches": number,
      "statements": number
    },
    "threshold": number,
    "thresholdMet": boolean,
    "output": string
  }

Examples:
  - "Generar reporte de cobertura" -> {}
  - "Cobertura mínima 80%" -> { threshold: 80 }
  - "Reporte en JSON" -> { reporter: "json" }
  - "Cobertura solo de componentes" -> { include: "src/components/**" }`,
  inputSchema: {
    reporter: z
      .enum(['text', 'text-summary', 'json', 'html', 'lcov'])
      .default('text-summary')
      .describe("Formato del reporte de cobertura"),
    include: z
      .string()
      .optional()
      .describe("Patrón de archivos a incluir en el reporte"),
    exclude: z
      .string()
      .optional()
      .describe("Patrón de archivos a excluir del reporte"),
    threshold: z
      .number()
      .optional()
      .describe("Umbral mínimo de cobertura (0-100). Falla si no se alcanza"),
  },
  handler: async (args: any) => {
    try {
      const params = {
        reporter: args.reporter ?? 'text-summary',
        include: args.include,
        exclude: args.exclude,
        threshold: args.threshold,
      };

      const cmdArgs: string[] = ['run', '--coverage'];

      if (params.reporter !== 'text-summary') {
        cmdArgs.push('--coverage.reporter', params.reporter);
      }

      if (params.include) {
        cmdArgs.push('--coverage.include', params.include);
      }

      if (params.exclude) {
        cmdArgs.push('--coverage.exclude', params.exclude);
      }

      const result = await runCommand('npx', ['vitest', ...cmdArgs]);
      const coverage = parseCoverageResults(result.stdout + result.stderr);
      
      const avgCoverage = (coverage.lines + coverage.functions + coverage.branches + coverage.statements) / 4;
      const thresholdMet = params.threshold ? avgCoverage >= params.threshold : true;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: result.success && thresholdMet,
                coverage,
                average: avgCoverage,
                threshold: params.threshold || null,
                thresholdMet,
                duration: result.duration,
                output: result.stdout.slice(-8000),
              },
              null,
              2
            ),
          },
        ],
        isError: !result.success || !thresholdMet,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error generando cobertura: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

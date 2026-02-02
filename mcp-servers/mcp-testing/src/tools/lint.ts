import { z } from 'zod';
import { runCommand } from '../services/command-runner.js';

export const lintTool = {
  name: 'testing_run_lint',
  description: `Ejecuta ESLint para verificar calidad del código.

Este tool ejecuta ESLint en el proyecto para detectar problemas de código,
estilos inconsistentes, y potenciales errores.

Args:
  - fix: Corregir automáticamente problemas solucionables
  - cache: Usar cache para acelerar ejecución
  - maxWarnings: Número máximo de advertencias permitidas
  - files: Archivos o patrones específicos a lintear

Returns:
  {
    "success": boolean,
    "errorCount": number,
    "warningCount": number,
    "fixableErrorCount": number,
    "fixableWarningCount": number,
    "output": string
  }

Examples:
  - "Verificar código" -> {}
  - "Corregir automáticamente" -> { fix: true }
  - "Lintear archivos específicos" -> { files: ["src/components/*.vue"] }
  - "Sin cache" -> { cache: false }`,
  inputSchema: {
    fix: z
      .boolean()
      .default(false)
      .describe("Corregir automáticamente problemas solucionables"),
    cache: z
      .boolean()
      .default(true)
      .describe("Usar cache para acelerar ejecución"),
    maxWarnings: z
      .number()
      .optional()
      .describe("Número máximo de advertencias permitidas"),
    files: z
      .array(z.string())
      .optional()
      .describe("Archivos o patrones específicos a lintear"),
  },
  handler: async (args: any) => {
    try {
      const params = {
        fix: args.fix ?? false,
        cache: args.cache ?? true,
        maxWarnings: args.maxWarnings,
        files: args.files,
      };

      const cmdArgs: string[] = [];

      if (params.fix) {
        cmdArgs.push('--fix');
      }

      if (!params.cache) {
        cmdArgs.push('--no-cache');
      }

      if (params.maxWarnings !== undefined) {
        cmdArgs.push('--max-warnings', params.maxWarnings.toString());
      }

      if (params.files && params.files.length > 0) {
        cmdArgs.push(...params.files);
      }

      const result = await runCommand('npx', ['eslint', ...cmdArgs]);

      const errorMatch = result.stdout.match(/(\d+)\s+error/);
      const warningMatch = result.stdout.match(/(\d+)\s+warning/);
      const fixableErrorMatch = result.stdout.match(/(\d+)\s+errors?\s+are\s+fixable/);
      const fixableWarningMatch = result.stdout.match(/(\d+)\s+warning[s]?\s+are\s+fixable/);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: result.success,
                errorCount: parseInt(errorMatch?.[1] || '0', 10),
                warningCount: parseInt(warningMatch?.[1] || '0', 10),
                fixableErrorCount: parseInt(fixableErrorMatch?.[1] || '0', 10),
                fixableWarningCount: parseInt(fixableWarningMatch?.[1] || '0', 10),
                fixed: params.fix,
                duration: result.duration,
                output: result.stdout.slice(-8000) || result.stderr.slice(-8000),
              },
              null,
              2
            ),
          },
        ],
        isError: !result.success,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error ejecutando lint: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

import { z } from 'zod';
import { runCommand } from '../services/command-runner.js';

export const typecheckTool = {
  name: 'testing_run_typecheck',
  description: `Verifica tipos de TypeScript usando vue-tsc.

Este tool ejecuta 'vue-tsc --noEmit' para verificar que todo el código TypeScript
esté correctamente tipado sin errores.

Args:
  - project: Ruta al archivo de configuración de TypeScript
  - noEmit: No generar archivos compilados (default: true)
  - watch: Modo watch para verificación continua
  - strict: Forzar modo estricto

Returns:
  {
    "success": boolean,
    "errorCount": number,
    "errors": [
      {
        "file": string,
        "line": number,
        "column": number,
        "message": string,
        "code": number
      }
    ],
    "duration": number,
    "output": string
  }

Examples:
  - "Verificar tipos del proyecto" -> {}
  - "Verificar tipos en modo watch" -> { watch: true }
  - "Usar tsconfig específico" -> { project: "tsconfig.app.json" }`,
  inputSchema: {
    project: z
      .string()
      .optional()
      .describe("Ruta al tsconfig.json (default: tsconfig.json del proyecto)"),
    noEmit: z
      .boolean()
      .default(true)
      .describe("No emitir archivos compilados, solo verificar tipos"),
    watch: z
      .boolean()
      .default(false)
      .describe("Ejecutar en modo watch"),
    strict: z
      .boolean()
      .optional()
      .describe("Usar modo estricto"),
  },
  handler: async (args: any) => {
    try {
      const params = {
        project: args.project,
        noEmit: args.noEmit ?? true,
        watch: args.watch ?? false,
        strict: args.strict,
      };

      const cmdArgs: string[] = [];

      if (params.noEmit) {
        cmdArgs.push('--noEmit');
      }

      if (params.project) {
        cmdArgs.push('-p', params.project);
      }

      if (params.watch) {
        cmdArgs.push('--watch');
      }

      if (params.strict) {
        cmdArgs.push('--strict');
      }

      const result = await runCommand('npx', ['vue-tsc', ...cmdArgs], {
        timeout: 600000,
      });

      const errors: Array<{
        file: string;
        line: number;
        column: number;
        message: string;
        code: number;
      }> = [];

      const errorRegex = /([^\s(]+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/g;
      const output = result.stdout + result.stderr;
      let match;

      while ((match = errorRegex.exec(output)) !== null) {
        errors.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          code: parseInt(match[4].replace('TS', ''), 10),
          message: match[5],
        });
      }

      if (errors.length === 0 && !result.success && result.stderr) {
        errors.push({
          file: 'unknown',
          line: 0,
          column: 0,
          code: 0,
          message: result.stderr.slice(0, 500),
        });
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: result.success && errors.length === 0,
                errorCount: errors.length,
                errors: errors.slice(0, 20),
                duration: result.duration,
                output: result.stdout.slice(-5000),
              },
              null,
              2
            ),
          },
        ],
        isError: !result.success || errors.length > 0,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error ejecutando typecheck: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

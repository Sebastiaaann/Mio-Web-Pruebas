import { z } from 'zod';
import { runCommand, parseTestResults } from '../services/command-runner.js';

export const runTestsTool = {
  name: 'testing_run_vitest',
  description: `Ejecuta tests unitarios usando Vitest en el proyecto.

Este tool ejecuta el comando 'vitest' con las opciones especificadas y retorna los resultados.

Args:
  - pattern: Patrón de archivos a testear (ej: 'components/**/*.test.ts')
  - watch: Modo watch - re-ejecuta al detectar cambios
  - coverage: Generar reporte de cobertura
  - reporter: Formato de salida - 'default', 'verbose', 'dot', 'json', 'junit'
  - update: Actualizar snapshots de prueba

Returns:
  {
    "success": boolean,
    "testsPassed": number,
    "testsFailed": number,
    "testsSkipped": number,
    "duration": string,
    "output": string
  }

Examples:
  - "Ejecutar todos los tests" -> {}
  - "Correr tests del componente Login" -> { pattern: "src/components/Login*.test.ts" }
  - "Generar cobertura" -> { coverage: true }
  - "Actualizar snapshots" -> { update: true }`,
  inputSchema: {
    pattern: z
      .string()
      .optional()
      .describe("Patrón de archivos de test (ej: '**/*.test.ts' o 'src/components/**/*.spec.ts')"),
    watch: z
      .boolean()
      .default(false)
      .describe("Ejecutar en modo watch - re-ejecuta al detectar cambios"),
    coverage: z
      .boolean()
      .default(false)
      .describe("Generar reporte de cobertura"),
    reporter: z
      .enum(['default', 'verbose', 'dot', 'json', 'junit'])
      .default('default')
      .describe("Formato de reporte"),
    update: z
      .boolean()
      .default(false)
      .describe("Actualizar snapshots de prueba"),
  },
  handler: async (args: any) => {
    try {
      const params = {
        pattern: args.pattern,
        watch: args.watch ?? false,
        coverage: args.coverage ?? false,
        reporter: args.reporter ?? 'default',
        update: args.update ?? false,
      };

      const cmdArgs: string[] = [];

      if (params.watch) {
        // En modo watch no usamos 'run'
      } else {
        cmdArgs.push('run');
      }

      if (params.coverage) {
        cmdArgs.push('--coverage');
      }

      if (params.reporter && params.reporter !== 'default') {
        cmdArgs.push('--reporter', params.reporter);
      }

      if (params.update) {
        cmdArgs.push('--update');
      }

      if (params.pattern) {
        cmdArgs.push(params.pattern);
      }

      const result = await runCommand('npx', ['vitest', ...cmdArgs]);
      const testResults = parseTestResults(result.stdout + result.stderr);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: result.success,
                testsPassed: testResults.passed,
                testsFailed: testResults.failed,
                testsSkipped: testResults.skipped,
                duration: testResults.duration,
                exitCode: result.exitCode,
                output: result.stdout.slice(-10000),
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
            text: `Error ejecutando tests: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

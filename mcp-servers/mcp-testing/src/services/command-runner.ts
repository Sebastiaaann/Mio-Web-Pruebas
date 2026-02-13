import { execa, type Result } from 'execa';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = process.env.PROJECT_ROOT || join(__dirname, '../../..');

export interface CommandOptions {
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export async function runCommand(
  command: string,
  args: string[],
  options: CommandOptions = {}
): Promise<CommandResult> {
  const startTime = Date.now();
  const cwd = options.cwd || PROJECT_ROOT;
  const timeout = options.timeout || 300000; // 5 minutos por defecto

  try {
    const result = await execa(command, args, {
      cwd,
      timeout,
      reject: false,
      env: {
        ...process.env,
        ...options.env,
      },
    });

    return {
      success: result.exitCode === 0,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode ?? 1,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      stdout: '',
      stderr: error instanceof Error ? error.message : String(error),
      exitCode: 1,
      duration: Date.now() - startTime,
    };
  }
}

export function handleCommandError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error desconocido: ${String(error)}`;
}

export function parseTestResults(output: string): {
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
} {
  const passedMatch = output.match(/(\d+)\s+passed/i);
  const failedMatch = output.match(/(\d+)\s+failed/i);
  const skippedMatch = output.match(/(\d+)\s+skipped/i);
  const durationMatch = output.match(/Duration:\s*([\d.]+\s*(ms|s|m))/i);

  return {
    passed: parseInt(passedMatch?.[1] || '0', 10),
    failed: parseInt(failedMatch?.[1] || '0', 10),
    skipped: parseInt(skippedMatch?.[1] || '0', 10),
    duration: durationMatch?.[1] || 'N/A',
  };
}

export function parseCoverageResults(output: string): {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
} {
  const linesMatch = output.match(/Lines\s*:\s*(\d+\.?\d*)%/);
  const functionsMatch = output.match(/Functions\s*:\s*(\d+\.?\d*)%/);
  const branchesMatch = output.match(/Branches\s*:\s*(\d+\.?\d*)%/);
  const statementsMatch = output.match(/Statements\s*:\s*(\d+\.?\d*)%/);

  return {
    lines: parseFloat(linesMatch?.[1] || '0'),
    functions: parseFloat(functionsMatch?.[1] || '0'),
    branches: parseFloat(branchesMatch?.[1] || '0'),
    statements: parseFloat(statementsMatch?.[1] || '0'),
  };
}

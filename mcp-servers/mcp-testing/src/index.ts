#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Importar tools
import { runTestsTool } from './tools/vitest.js';
import { typecheckTool } from './tools/typecheck.js';
import { coverageTool } from './tools/coverage.js';
import { lintTool } from './tools/lint.js';

// Crear servidor MCP
const server = new McpServer({
  name: '@mio/mcp-testing',
  version: '1.0.0',
});

// Registrar tools con patrón SDK 1.6 compatible
server.tool(
  runTestsTool.name,
  runTestsTool.description,
  runTestsTool.inputSchema,
  async (args: any, extra: any) => {
    return await runTestsTool.handler(args ?? {});
  }
);

server.tool(
  typecheckTool.name,
  typecheckTool.description,
  typecheckTool.inputSchema,
  async (args: any, extra: any) => {
    return await typecheckTool.handler(args ?? {});
  }
);

server.tool(
  coverageTool.name,
  coverageTool.description,
  coverageTool.inputSchema,
  async (args: any, extra: any) => {
    return await coverageTool.handler(args ?? {});
  }
);

server.tool(
  lintTool.name,
  lintTool.description,
  lintTool.inputSchema,
  async (args: any, extra: any) => {
    return await lintTool.handler(args ?? {});
  }
);

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Testing Server running on stdio - 4 tools available');
  console.error('Tools: testing_run_vitest, testing_run_typecheck, testing_get_coverage, testing_run_lint');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

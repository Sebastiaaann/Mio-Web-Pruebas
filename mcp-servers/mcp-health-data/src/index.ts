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
import { exportPatientDataTool } from './tools/export-data.js';
import { generateReportTool } from './tools/generate-report.js';
import { getTrendsTool } from './tools/get-trends.js';
import { backupDataTool, restoreDataTool } from './tools/backup-restore.js';

// Crear servidor MCP
const server = new McpServer({
  name: '@mio/mcp-health-data',
  version: '1.0.0',
});

// Registrar tools
server.tool(
  exportPatientDataTool.name,
  exportPatientDataTool.description,
  exportPatientDataTool.inputSchema,
  async (args: any) => exportPatientDataTool.handler(args)
);

server.tool(
  generateReportTool.name,
  generateReportTool.description,
  generateReportTool.inputSchema,
  async (args: any) => generateReportTool.handler(args)
);

server.tool(
  getTrendsTool.name,
  getTrendsTool.description,
  getTrendsTool.inputSchema,
  async (args: any) => getTrendsTool.handler(args)
);

server.tool(
  backupDataTool.name,
  backupDataTool.description,
  backupDataTool.inputSchema,
  async (args: any) => backupDataTool.handler(args)
);

server.tool(
  restoreDataTool.name,
  restoreDataTool.description,
  restoreDataTool.inputSchema,
  async (args: any) => restoreDataTool.handler(args)
);

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Health Data MCP Server running on stdio - 5 tools available');
  console.error('Tools: health_export_patient_data, health_generate_report, health_get_trends, health_backup_data, health_restore_data');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

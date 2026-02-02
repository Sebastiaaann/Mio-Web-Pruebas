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
import { getActiveUsersTool } from './tools/active-users.js';
import { getEventCountsTool } from './tools/event-counts.js';
import { generateWeeklyReportTool } from './tools/weekly-report.js';
import { getConversionFunnelTool } from './tools/conversion-funnel.js';

// Crear servidor MCP
const server = new McpServer({
  name: '@mio/mcp-firebase-analytics',
  version: '1.0.0',
});

// Registrar tools
server.tool(
  getActiveUsersTool.name,
  getActiveUsersTool.description,
  getActiveUsersTool.inputSchema,
  async (args: any) => getActiveUsersTool.handler(args)
);

server.tool(
  getEventCountsTool.name,
  getEventCountsTool.description,
  getEventCountsTool.inputSchema,
  async (args: any) => getEventCountsTool.handler(args)
);

server.tool(
  generateWeeklyReportTool.name,
  generateWeeklyReportTool.description,
  generateWeeklyReportTool.inputSchema,
  async (args: any) => generateWeeklyReportTool.handler(args)
);

server.tool(
  getConversionFunnelTool.name,
  getConversionFunnelTool.description,
  getConversionFunnelTool.inputSchema,
  async (args: any) => getConversionFunnelTool.handler(args)
);

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Firebase Analytics MCP Server running on stdio - 4 tools available');
  console.error('Tools: analytics_get_active_users, analytics_get_event_counts, analytics_generate_weekly_report, analytics_get_conversion_funnel');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

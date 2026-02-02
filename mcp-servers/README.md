# MCP Servers - MIO Web

Este directorio contiene los servidores MCP (Model Context Protocol) para el proyecto MIO Web.

## Descripción

Los MCP Servers permiten a los agentes de IA interactuar con herramientas especializadas mediante el protocolo MCP de Anthropic.

### MCPs Disponibles

#### 1. MCP Testing (`mcp-testing`)
Servidor MCP para testing y automatización de pruebas del proyecto.

**Tools disponibles:**
- `testing_run_vitest` - Ejecutar tests con Vitest
- `testing_run_typecheck` - Verificar tipos con TypeScript
- `testing_get_coverage` - Obtener reporte de cobertura
- `testing_run_lint` - Ejecutar linter en el código

#### 2. MCP Firebase Analytics (`mcp-firebase-analytics`)
Servidor MCP para integración con Firebase Analytics y Google Analytics 4.

**Tools disponibles:**
- `analytics_get_active_users` - Obtener usuarios activos por período
- `analytics_get_event_counts` - Contar eventos específicos
- `analytics_generate_weekly_report` - Generar reporte semanal automático
- `analytics_get_conversion_funnel` - Analizar embudo de conversión

#### 3. MCP Health Data (`mcp-health-data`)
Servidor MCP para gestión de datos de salud y pacientes vía API HOMA.

**Tools disponibles:**
- `health_export_patient_data` - Exportar datos de pacientes (CSV/JSON/PDF)
- `health_generate_report` - Generar reportes médicos
- `health_get_trends` - Obtener tendencias de salud
- `health_backup_data` - Realizar backup de datos
- `health_restore_data` - Restaurar datos desde backup

## Instalación

### Instalar dependencias de todos los MCPs

```bash
npm run mcp:install
```

O manualmente:

```bash
cd mcp-servers/mcp-testing && npm install
cd ../mcp-firebase-analytics && npm install
cd ../mcp-health-data && npm install
```

## Compilación

### Compilar todos los MCPs

```bash
npm run mcp:build
```

O manualmente:

```bash
cd mcp-servers/mcp-testing && npm run build
cd ../mcp-firebase-analytics && npm run build
cd ../mcp-health-data && npm run build
```

## Ejecución

### Iniciar MCPs individualmente

```bash
# MCP Testing
npm run mcp:testing

# MCP Firebase Analytics
npm run mcp:analytics

# MCP Health Data
npm run mcp:health
```

## Configuración (.env)

Cada MCP requiere su archivo `.env` en su respectivo directorio.

### MCP Testing
Archivo: `mcp-servers/mcp-testing/.env`
```
# No requiere variables de entorno específicas
# Utiliza la configuración del proyecto raíz
```

### MCP Firebase Analytics
Archivo: `mcp-servers/mcp-firebase-analytics/.env`
```
# Google Analytics 4
GA4_PROPERTY_ID=your_property_id
GA4_CLIENT_EMAIL=your_service_account_email
GA4_PRIVATE_KEY=your_private_key
GA4_PROJECT_ID=your_project_id

# Opcional: Credenciales de Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccount.json
```

### MCP Health Data
Archivo: `mcp-servers/mcp-health-data/.env`
```
# API HOMA/MIO
HOMA_API_URL=https://api.homa.io/v1
HOMA_API_KEY=your_api_key

# Opcional: Configuración de exportación
DEFAULT_EXPORT_FORMAT=csv
EXPORT_MAX_RECORDS=1000
```

## Ejemplos de Uso

### Ejemplo 1: Ejecutar tests desde el agente

```typescript
// El agente puede ejecutar tests automáticamente
const result = await testing_run_vitest({
  pattern: "*.test.ts",
  coverage: true
});
```

### Ejemplo 2: Obtener analytics de usuarios

```typescript
// Obtener usuarios activos de los últimos 7 días
const users = await analytics_get_active_users({
  days: 7,
  dimensions: ["country", "deviceCategory"]
});
```

### Ejemplo 3: Exportar datos de pacientes

```typescript
// Exportar datos a CSV
const export = await health_export_patient_data({
  patientId: "75863",
  format: "csv",
  includeHistory: true
});
```

## Estructura del Proyecto

```
mcp-servers/
├── README.md                          # Este archivo
├── mcp-testing/
│   ├── src/
│   │   ├── index.ts                   # Punto de entrada
│   │   ├── tools/                     # Definición de tools
│   │   └── services/                  # Servicios auxiliares
│   ├── dist/                          # Código compilado
│   ├── package.json
│   └── .env                           # Variables de entorno
├── mcp-firebase-analytics/
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/
│   │   └── services/
│   ├── dist/
│   ├── package.json
│   └── .env
└── mcp-health-data/
    ├── src/
    │   ├── index.ts
    │   ├── tools/
    │   └── services/
    ├── dist/
    ├── package.json
    └── .env
```

## Desarrollo

### Agregar un nuevo tool

1. Crear archivo en `src/tools/nuevo-tool.ts`
2. Definir el schema de entrada con Zod
3. Implementar el handler
4. Registrar en `src/index.ts`
5. Recompilar: `npm run build`

### Dependencias comunes

- `@modelcontextprotocol/sdk` - SDK oficial de MCP
- `zod` - Validación de esquemas
- `dotenv` - Variables de entorno

## Solución de Problemas

### Error: "Cannot find module"
Asegúrate de compilar el proyecto primero:
```bash
npm run mcp:build
```

### Error: "Missing environment variable"
Verifica que el archivo `.env` exista en el directorio del MCP con las variables requeridas.

### Puerto en uso
Los MCPs usan stdio (entrada/salida estándar), no requieren puertos.

## Contribución

Para agregar nuevos MCPs:

1. Crear directorio en `mcp-servers/mcp-nombre/`
2. Seguir la estructura existente
3. Agregar scripts en `package.json` raíz
4. Actualizar este README.md
5. Actualizar AGENTS.md con la documentación del MCP

## Documentación Adicional

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)

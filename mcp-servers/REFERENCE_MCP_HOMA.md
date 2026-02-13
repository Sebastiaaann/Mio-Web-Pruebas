# Referencia: MCP Server HOMA-API

Documento de referencia tecnica basado en el analisis del servidor MCP de HOMA ubicado en `mcp-server/index.js`.

## 1. Estructura General del Servidor MCP

### Imports Necesarios

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
```

### Configuracion de Paths y Entorno

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
```

**Nota importante:** Es crucial configurar dotenv con el path correcto para asegurar que el archivo `.env` se cargue desde el directorio del script.

### Creacion del Servidor

```javascript
const server = new McpServer({
  name: "homa-api-server",
  version: "1.0.0",
});
```

### Inicio del Servidor

```javascript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HOMA MCP Server running on stdio - 28 tools available");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

---

## 2. Definicion de Tools

### Estructura Basica de un Tool

```javascript
server.tool(
  "nombre_del_tool",           // Nombre unico (snake_case recomendado)
  "Descripcion clara",          // Descripcion para el LLM
  {                             // Schema de parametros con Zod
    param1: z.string().describe("Descripcion del parametro"),
    param2: z.number().optional().describe("Parametro opcional"),
  },
  async ({ param1, param2 }) => {  // Handler async
    // Logica del tool
    return {
      content: [{ type: "text", text: "Resultado" }]
    };
  }
);
```

### Ejemplo Completo: Tool con Parametros Opcionales

```javascript
// Helper para obtener ID de paciente con fallback a variable de entorno
function getPatientId(providedId) {
  const id = providedId || process.env.TEST_PATIENT_ID;
  if (!id) {
    throw new Error("Patient ID is required (no provided ID and no TEST_PATIENT_ID in env)");
  }
  return id;
}

server.tool(
  "get_patient_profile",
  "Get full profile details for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);
```

### Ejemplo: Tool sin Parametros

```javascript
server.tool(
  "get_patients",
  "Get list of all patients",
  {},
  async () => {
    return await makeApiRequest(`/api/v1/patients`);
  }
);
```

### Ejemplo: Tool con Objeto Passthrough

Util cuando la API espera un objeto dinamico:

```javascript
server.tool(
  "create_patient",
  "Create a new patient",
  {
    patient_data: z.object({}).passthrough().describe("Patient data object"),
  },
  async ({ patient_data }) => {
    return await makePostRequest(`/api/v1/patients`, patient_data);
  }
);
```

---

## 3. Manejo de Errores

### Patron de Respuesta Exitosa

```javascript
return {
  content: [{ 
    type: "text", 
    text: JSON.stringify(data, null, 2) 
  }]
};
```

### Patron de Respuesta de Error

```javascript
return { 
  isError: true,
  content: [{ 
    type: "text", 
    text: "Error descriptivo: " + error.message 
  }]
};
```

### Niveles de Manejo de Errores

1. **Errores de validacion de parametros** (catch en el handler)
2. **Errores de red** (network errors)
3. **Errores de API** (HTTP status != 200)

### Ejemplo: Helper para Requests GET con Manejo de Errores

```javascript
async function makeApiRequest(endpoint) {
  const url = API_HOMA_URL + endpoint;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': currentToken || HOMA_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        isError: true,
        content: [{ 
          type: "text", 
          text: "API Error " + response.status + ": " + errorText 
        }]
      };
    }

    const data = await response.json();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(data, null, 2) 
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ 
        type: "text", 
        text: "Network Error: " + error.message 
      }]
    };
  }
}
```


---

## 4. Configuracion de Variables de Entorno

### Patron de Configuracion

```javascript
// Valores por defecto + variables de entorno
const API_HOMA_URL = process.env.API_HOMA_URL || "https://apihoma.homa.cl:7200";
let HOMA_API_KEY = process.env.HOMA_API_KEY;

// Variable mutable para token actual (puede actualizarse en runtime)
let currentToken = HOMA_API_KEY;
```

### Actualizacion Dinamica de .env

Patron para actualizar el archivo .env durante la ejecucion:

```javascript
import { writeFileSync } from 'fs';
import { join } from 'path';

function updateEnvToken(newToken) {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = "API_HOMA_URL=" + API_HOMA_URL + "\nHOMA_API_KEY=" + newToken + "\n";
    writeFileSync(envPath, envContent);
    currentToken = newToken;
    HOMA_API_KEY = newToken;
    console.error("Token updated successfully");
  } catch (error) {
    console.error("Error updating token: " + error.message);
  }
}
```

---

## 5. Patrones de Codigo Recomendados

### A. Helper Functions para HTTP Methods

Crear helpers separados para cada metodo HTTP:

```javascript
// GET
async function makeApiRequest(endpoint) { ... }

// POST
async function makePostRequest(endpoint, body = {}) { ... }

// PUT
async function makePutRequest(endpoint, body = {}) { ... }
```

### B. Validacion de IDs con Fallback

```javascript
function getPatientId(providedId) {
  const id = providedId || process.env.TEST_PATIENT_ID;
  if (!id) {
    throw new Error("ID requerido: no se proporciono ID ni TEST_PATIENT_ID en env");
  }
  return id;
}
```

### C. Organizacion por Categorias

Usar comentarios para agrupar tools relacionados:

```javascript
// ============================================
// PATIENTS - GET Endpoints
// ============================================

// ============================================
// PATIENTS - POST Endpoints
// ============================================

// ============================================
// AUTH Endpoints
// ============================================
```

### D. Tool de Autenticacion con Actualizacion de Token

```javascript
server.tool(
  "login_homa",
  "Login to HOMA API to get a valid JWT token using Firebase UID",
  {
    email: z.string().email().describe("Email address for login"),
    uid: z.string().describe("Firebase UID for authorization"),
  },
  async ({ email, uid }) => {
    const url = API_HOMA_URL + "/api/v1/authorizations";
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, UID: uid })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          isError: true,
          content: [{ type: "text", text: "Login Error " + response.status + ": " + errorText }]
        };
      }

      const data = await response.json();
      
      // Actualizar token automaticamente si se recibe
      if (data.token || data.accessToken || data.jwt) {
        const newToken = data.token || data.accessToken || data.jwt;
        updateEnvToken(newToken);
        return {
          content: [{ 
            type: "text", 
            text: "Login successful! Token updated. User: " + (data.user?.email || email)
          }]
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: "Network Error: " + error.message }]
      };
    }
  }
);
```


---

## 6. Mejores Practicas Identificadas

### Do's (Hacer)

1. **Siempre usar Zod** para validar parametros de entrada
2. **Describir todos los parametros** con `.describe()` para ayudar al LLM
3. **Marcar parametros como opcionales** cuando tengan sentido con `.optional()`
4. **Usar snake_case** para nombres de tools (convenio MCP)
5. **Retornar JSON formateado** con `JSON.stringify(data, null, 2)`
6. **Manejar errores en dos niveles**: API errors y Network errors
7. **Usar `console.error`** para logging (stdout esta reservado para MCP)
8. **Proporcionar valores por defecto** para variables de entorno criticas
9. **Categorizar tools** con comentarios claros
10. **Crear helper functions** para operaciones repetitivas

### Don'ts (Evitar)

1. No retornar datos sin formatear
2. No usar `console.log` (interfiere con stdio transport)
3. No ignorar errores de red
4. No crear tools sin descripcion
5. No hardcodear URLs o credenciales
6. No mezclar logica de negocio en los handlers (usar helpers)

---

## 7. Template para Nuevo MCP Server

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Configuracion
const API_BASE_URL = process.env.API_URL || "https://api.example.com";
const API_KEY = process.env.API_KEY;

// Crear servidor
const server = new McpServer({
  name: "mi-api-server",
  version: "1.0.0",
});

// Helper: Request GET
async function makeGetRequest(endpoint) {
  const url = API_BASE_URL + endpoint;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        isError: true,
        content: [{ type: "text", text: "API Error " + response.status + ": " + errorText }]
      };
    }

    const data = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: "Network Error: " + error.message }]
    };
  }
}

// ============================================
// Tools
// ============================================

server.tool(
  "get_resource",
  "Obtener un recurso por ID",
  {
    id: z.string().describe("ID del recurso"),
  },
  async ({ id }) => {
    return await makeGetRequest("/api/resources/" + id);
  }
);

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```


---

## 8. package.json Recomendado

```json
{
  "name": "mi-mcp-server",
  "version": "1.0.0",
  "description": "MCP Server para API X",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --inspect index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.1",
    "zod": "^3.23.0",
    "dotenv": "^16.4.5"
  }
}
```

---

## 9. Archivo .env de Ejemplo

```
API_URL=https://api.example.com
API_KEY=tu_api_key_aqui
TEST_ID=12345
```

---

## Resumen de Patrones Clave

| Aspecto | Patron | Ejemplo |
|---------|--------|---------|
| Nombre de tool | snake_case | `get_patient_profile` |
| Schema | Zod con describe | `z.string().describe("ID")` |
| Respuesta exitosa | JSON formateado | `JSON.stringify(data, null, 2)` |
| Error | isError: true | `{ isError: true, content: [...] }` |
| HTTP Helper | Reutilizable | `makeApiRequest(endpoint)` |
| Logging | stderr | `console.error("message")` |
| Env path | Dinamico | `join(__dirname, '.env')` |

---

## Lista de Tools en HOMA-API MCP

### Pacientes (GET)
- `get_patients` - Obtener lista de todos los pacientes
- `get_patient_profile` - Obtener perfil completo de un paciente
- `get_patient_services` - Obtener servicios disponibles para un paciente
- `get_patient_plans` - Obtener planes de salud asociados
- `get_patient_campaigns` - Obtener campanas asociadas
- `get_patient_more_plans` - Obtener planes adicionales
- `get_patient_audiovisual` - Obtener material audiovisual

### Pacientes (POST)
- `create_patient` - Crear nuevo paciente
- `set_patient_campaign` - Asignar campana a paciente
- `unset_patient_campaign` - Remover campana de paciente
- `send_push_notification` - Enviar notificacion push

### Pacientes (PUT)
- `update_patient_plan` - Actualizar plan de salud

### Protocolos
- `get_protocols_by_healthplan` - Obtener protocolos por plan de salud
- `get_protocol` - Obtener detalles de un protocolo
- `get_protocol_observations` - Obtener observaciones de protocolo
- `get_last_info_control` - Obtener ultimo control de informacion
- `get_last_control` - Obtener ultimo control
- `get_observation_range` - Obtener rango de observaciones

### Planes y Servicios
- `get_healthplans` - Obtener planes de salud
- `set_use_service` - Marcar servicio como usado
- `set_use_service_clickup` - Marcar servicio via ClickUp
- `activate_hanu` - Activar servicio Hanu
- `activate_pdms` - Activar servicio PDMS

### Campanas y Batch
- `get_all_campaigns` - Obtener todas las campanas
- `get_observation_types` - Obtener tipos de observacion
- `get_parameter` - Obtener parametro por codigo

### Autenticacion
- `login_homa` - Login usando Firebase UID y email
- `refresh_token` - Refrescar token JWT
- `set_token` - Establecer token manualmente

---

*Documento generado a partir del analisis de mcp-server/index.js del proyecto MIO-Web*
*Total de tools implementadas: 28*

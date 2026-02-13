# MCP Health Data Server

MCP Server para gestión de datos de salud y pacientes.

## Características

- Gestión de perfiles de pacientes
- Consulta de planes de salud
- Observaciones médicas
- Protocolos de salud
- Integración con sistemas médicos

## Instalación

```bash
cd mcp-servers/mcp-health-data
npm install
```

## Configuración

Copia el archivo `.env` y configura las variables de entorno:

```bash
cp .env .env.local
```

### Requerimientos

- Base de datos configurada
- API de salud configurada
- Credenciales de autenticación

## Uso

### Desarrollo

```bash
npm run dev
```

### Compilar

```bash
npm run build
```

### Ejecutar

```bash
npm start
```

## Herramientas Disponibles

1. **get_patient_profile** - Obtiene perfil de paciente
2. **get_patient_plans** - Obtiene planes de salud
3. **get_protocol_observations** - Obtiene observaciones médicas

## Estructura

```
src/
├── tools/          # Definición de herramientas MCP
├── services/       # Lógica de negocio médica
├── schemas/        # Esquemas de validación
└── index.ts        # Punto de entrada
```

## Licencia

MIT

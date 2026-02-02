# MCP Firebase Analytics Server

MCP Server para integración con Firebase Analytics.

## Características

- Consulta de datos de Analytics
- Registro de eventos personalizados
- Reportes de métricas
- Integración con Firebase

## Instalación

```bash
cd mcp-servers/mcp-firebase-analytics
npm install
```

## Configuración

Copia el archivo `.env` y configura las variables de entorno:

```bash
cp .env .env.local
```

### Requerimientos

- Cuenta de Firebase
- Credenciales de servicio (service-account.json)
- ID de propiedad de Analytics

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

1. **get_analytics_data** - Obtiene datos de Analytics
2. **track_event** - Registra eventos personalizados

## Estructura

```
src/
├── tools/          # Definición de herramientas MCP
├── services/       # Lógica de integración con Firebase
├── schemas/        # Esquemas de validación
└── index.ts        # Punto de entrada
```

## Licencia

MIT

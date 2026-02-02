# MCP Testing Server

MCP Server para testing y automatización de pruebas en el proyecto Mio-Web.

## Características

- Ejecución de pruebas automatizadas
- Captura de screenshots
- Testing de navegadores (Chromium, Firefox, WebKit)
- Reportes de testing

## Instalación

```bash
cd mcp-servers/mcp-testing
npm install
```

## Configuración

Copia el archivo `.env` y configura las variables de entorno:

```bash
cp .env .env.local
```

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

1. **run_tests** - Ejecuta pruebas automatizadas
2. **take_screenshot** - Captura screenshots de páginas web

## Estructura

```
src/
├── tools/          # Definición de herramientas MCP
├── services/       # Lógica de negocio
├── schemas/        # Esquemas de validación
└── index.ts        # Punto de entrada
```

## Licencia

MIT

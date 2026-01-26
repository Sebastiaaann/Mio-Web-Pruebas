# Draft: Campañas de salud no cargan en HomeView

## Requirements (confirmed)
- Investigar por qué no cargan las campañas de salud en `@/src/views/inicio/HomeView.vue`.
- Tomar en cuenta los errores de consola reportados (JSON inválido y `list.map is not a function`).
- Ocurre actualmente en entorno local.
- Usuario compartió listado de endpoints relevantes (patients, protocols, campaigns, etc.).
- Endpoint confirmado: campañas por paciente (`GET /api/v1/patients/{id}/campaigns`).

## Technical Decisions
- Pendiente: definir si el fallo es por forma de respuesta del API, por autenticación/sesión o por parsing en tienda.

## Research Findings
- Logs muestran `SyntaxError: Unexpected token '<'` al parsear JSON (videos, last control, history).
- Error específico de campañas: `TypeError: list.map is not a function` en `fetchCampanhas (tiendaSalud.js:347)`.
- En `tiendaSalud.js`, el parseo de campañas usa `const list = data.campaigns || data.data || []` y luego `list.map(...)` (línea ~347).
- En `tiendaSalud.js`, el parseo de videos usa `const list = data.audiovisual || data.data || []` y luego `list.map(...)` (línea ~313).
- Intentos de exploración con agentes fallaron; pendiente reintentar con búsqueda directa o repro local.
- Respuesta real de campañas (304): `success: true`, `data: { campaigns: [...] }` (campañas vienen dentro de `data.campaigns`, no en `data` como array).
- `tiendaCampanas` usa `pacienteService.obtenerCampanas(patientId)` y espera `{ success, campanas }` (mapeo interno a revisar en service).
- `tiendaSalud` usa `fetchCampanhas()` con endpoint de paciente y mapea `data.campaigns || data.data || []` (no contempla `data.data.campaigns`).

## Open Questions
- ¿Qué respuesta real entrega el endpoint de campañas? (status + body)
- ¿La forma esperada de `list` es array directo o viene envuelta (ej. `{ data: [...] }`)?
- ¿Ocurre en todos los entornos o sólo en uno (dev/staging/prod)?
- ¿Podemos ver la respuesta raw de la llamada de campañas (Network → Response) cuando falla?
- ¿Qué retorna el endpoint de videos/last control/historial cuando falla (status y body)?
- ¿Qué endpoint exacto se usa para campañas en el código (paciente vs global) y cuál es el esperado?

## Scope Boundaries
- INCLUDE: Diagnóstico de causa raíz y plan para corregir carga de campañas.
- EXCLUDE: Cambios no relacionados con campañas o salud.

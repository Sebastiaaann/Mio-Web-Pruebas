# Integración de endpoints de protocolos y controles

## Objetivo
Conectar los endpoints de protocolos/observaciones/últimos controles para enriquecer la vista de Controles con datos reales por paciente.

## Tareas
- [ ] Agregar funciones de API para protocolos, detalle, observaciones, último control y rangos → Verificar que devuelven `success` y datos normalizados.
- [ ] Ajustar el store de salud para usar los nuevos endpoints y mapear observaciones a `Medicion` → Verificar que `historialMediciones` y `ultimaMedicion` se llenan con datos reales.
- [ ] Conectar la carga inicial del store a los nuevos endpoints → Verificar que `fetchAllHealthData()` incluye último control y rangos.
- [ ] Validar en UI que “Mis Controles” y “Historial de Actividad” muestran datos reales → Verificar en la pantalla de Controles.

## Hecho cuando
- [ ] Los endpoints de protocolos y controles se consumen desde el store y se reflejan en la UI sin errores.

## Notas
- Si `health_plan_id` no está disponible en sesión, se mantiene el fallback desde servicios.

# Estado del Proyecto Mio-Web

## ✅ Tareas Completadas

### Autenticación e Identidad

- [x] **Integración Firebase Auth**: Implementado login con Email/Password.
- [x] **Conexión Backend HOMA**: Token exchange (`/authorizations`) para obtener sesión de paciente.
- [x] **Persistencia Segura**: Token y metadatos de sesión en localStorage, datos sensibles en memoria (Pinia).
- [x] **UI Sidebar**: Ahora muestra dinámicamente el nombre y email del usuario logueado.

### Funcionalidad Core (Home)

- [x] **Servicios Dinámicos**: Implementada llamada a `/api/v1/patients/{id}/services`.
- [x] **Componente Bento Grid**: Adaptado para recibir datos dinámicos desde la API.
- [x] **Fallback Inteligente**: Si la API no responde, se muestran servicios predeterminados para no romper la UX.
- [x] **Mapeo de Iconos**: Sistema para convertir nombres de iconos (string) a componentes SVG.

---

## 🔄 En Progreso / Pendiente de Validación

### Integración Backend

- [ ] **Validación Estructura JSON**: Confirmar con equipo backend el formato exacto de la respuesta de servicios.
- [ ] **Mire de Rutas**: Asegurar que las rutas que devuelve el backend (`/mediciones`, `/citas`) coincidan con las rutas definidas en Vue Router.

---

## 📅 Próximos Pasos (Plan Semanal)

1. **Dashboard Preventivo**: Implementar vista de detalle para métricas.
2. **Perfil de Usuario**: Completar la vista de edición de perfil (`/perfil`).
3. **Módulo de Citas**: Integrar con endpoint de agendamiento si está disponible.

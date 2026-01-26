# 🕵️ Análisis Técnico: API HOMA Backend

**Fecha:** 21 de Enero, 2026
**Fuente:** `https://apihoma.homa.cl:7200/` (Swagger UI)
**Versión API:** v1

---

## 1. Visión General

La API expone una arquitectura RESTful organizada por controladores lógicos. Está diseñada principalmente para el consumo de clientes móviles/web, centrada en la entidad **Paciente**.

- **Base URL:** `https://apihoma.homa.cl:7200`
- **Autenticación:** Híbrida (Firebase UID + Email -> JWT Propio).
- **Formato:** JSON.

---

## 2. Mapa de Controladores y Endpoints

### 🔐 Auth (Autenticación)

Controlador encargado del intercambio de credenciales.

| Método | Endpoint                 | Estructura Request                       | Estructura Response                             | Uso en Mio-Web      |
| ------ | ------------------------ | ---------------------------------------- | ----------------------------------------------- | ------------------- |
| `POST` | `/api/v1/authorizations` | `{ "email": "string", "UID": "string" }` | `{ "token": "jwt...", "patient_id": 123, ... }` | **Login Principal** |

### 👤 Patients (Pacientes)

Núcleo de la experiencia de usuario. Permite obtener toda la data clínica y administrativa.

| Método | Endpoint                                     | Descripción                              | Impacto                      |
| ------ | -------------------------------------------- | ---------------------------------------- | ---------------------------- |
| `GET`  | `/api/v1/patients/{id}`                      | Perfil completo (nombre, rut, previsión) | **Hidratación de Perfil**    |
| `GET`  | `/api/v1/patients/plans/{id}`                | Planes de salud activos                  | Gestión de suscripción       |
| `GET`  | `/api/v1/patients/{id}/services`             | Lista de servicios habilitados           | **Home Dinámico**            |
| `GET`  | `/api/v1/patients/{id}/campaigns`            | Campañas de salud asignadas              | Bento Grid (Campañas)        |
| `GET`  | `/api/v1/patients/material_audiovisual/{id}` | Videos y PDFs educativos                 | Sección "Recursos"           |
| `GET`  | `/api/v1/patients/last_control/{id}`         | Último control realizado                 | Bento Grid (Última Medición) |

### 🛠 Services (Servicios)

Gestión del uso y navegación de servicios.

| Método | Endpoint                                   | Descripción                                  | Impacto          |
| ------ | ------------------------------------------ | -------------------------------------------- | ---------------- |
| `POST` | `/api/v1/services/setuseservice`           | Registrar que un usuario entró a un servicio | Analytics / Uso  |
| `POST` | `/api/v1/services/setuseserviceclickup...` | Integración específica con ClickUp           | Backend Internal |

### 📋 Protocols (Protocolos)

Lógica clínica y formularios.

| Método | Endpoint                            | Descripción                    |
| ------ | ----------------------------------- | ------------------------------ |
| `GET`  | `/api/v1/protocols/{healthplan_id}` | Protocolos asociados a un plan |
| `GET`  | `/api/v1/observations`              | Observaciones clínicas         |

### 🔔 Notificaciones

| Método | Endpoint                               | Descripción                  |
| ------ | -------------------------------------- | ---------------------------- |
| `POST` | `/api/v1/message/sendpushnotification` | Envío de push a dispositivos |

---

## 3. Estrategias de Integración Recomendadas

### A. Carga Inicial (Bootstrap)

Al iniciar sesión, la aplicación debería ejecutar la siguiente cadena de llamadas (Waterfall):

1.  **Auth:** `POST /authorizations` -> Obtener `token` y `patient_id`.
2.  **Paralelo:**
    - `GET /patients/{id}` -> Perfil de usuario (Nombre, Foto).
    - `GET /patients/{id}/services` -> Configuración del Home.
    - `GET /patients/plans/{id}` -> Estado de suscripción.

### B. Mapeo de Servicios

La respuesta de `/services` debe mapearse en el frontend a:

- **Icono:** Usar el helper `resolveIcon` creado en `HomeView`.
- **Ruta:** Mapear la URL que devuelve el backend a rutas internas de Vue Router (ej: si backend dice `url: "webview/mediciones"`, frontend redirige a `/mediciones`).

### C. Analytics

Cada vez que un usuario hace clic en una tarjeta del Bento Grid, se debe llamar a `/api/v1/services/setuseservice` en segundo plano ("fire and forget") para mantener las estadísticas de uso actualizadas.

---

## 4. Próximos Pasos Técnicos

1.  **Swagger JSON:** Descargar el archivo `swagger.json` completo (detectado en `/v2/api-docs`) para generar tipos de TypeScript automáticamente si migramos a TS en el futuro.
2.  **Mock Server:** Actualizar los mocks locales de Postman con los esquemas exactos encontrados en esta documentación.

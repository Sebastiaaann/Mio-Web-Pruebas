# 📋 Informe de Avance: Migración e Integración Mio-Web

**Para:** Sebastian / Equipo de Desarrollo
**Fecha:** 20 de Enero, 2026
**Estado:** ✅ Integración Funcional (Backend HOMA + Firebase)

---

## 🚀 Resumen Ejecutivo

Se ha completado exitosamente la **Fase 1** de la migración, enfocada en la autenticación real y la carga dinámica de servicios. El sistema ya no depende de mocks para el inicio de sesión y está conectado a los entornos de producción de Firebase y HOMA.

El objetivo principal ("Login y Home con servicios dinámicos") está **cumplido** en términos de arquitectura e implementación.

---

## 🛠️ Estado de Tareas

### 1. Login (Autenticación) ✅ **COMPLETADO**

> _"Empieza con el login, pídele a Cristobal Aguila que te ayude"_

Implementamos un sistema híbrido robusto que combina la seguridad de Firebase con la lógica de negocio de HOMA.

- **Lo que se hizo:**
  - Integración SDK Firebase Authentication.
  - Cambio de UX: Migración de Login por RUT a **Login por Email**.
  - Conexión con endpoint `POST /api/v1/authorizations` de HOMA.
  - Manejo de tokens JWT y persistencia segura de sesión.
  - **Corrección UI:** El Sidebar ahora muestra autmáticamente la foto, nombre y mail del usuario conectado.

- **Cómo funciona (Integración):**
  1.  Usuario ingresa Email/Pass en el frontend.
  2.  Firebase valida y retorna un `UID`.
  3.  El frontend envía este `UID` + `Email` al backend HOMA.
  4.  HOMA valida que el UID corresponda a un paciente y retorna `patient_id` + `token`.

### 2. Home con Servicios Dinámicos 🔄 **EN PROCESO / FUNCIONAL**

> _"Home con los servicios, listarlos inicialmente ya que son dinámicos y dependen de quien este conectado"_

El Home ahora es "inteligente". En lugar de mostrar opciones estáticas, consulta a la API qué servicios tiene habilitados el paciente.

- **Lo que se hizo:**
  - Creación de `tiendaServicios.js` (Pinia Store) para gestión de estado.
  - Conexión con endpoint `GET /api/v1/patients/{patient_id}/services`.
  - Adaptación del componente **Bento Grid** para renderizar tarjetas basadas en JSON dinámico.
  - Sistema de iconos dinámicos (mapeo de strings "heart", "calendar" a componentes Vue).

- **Cómo funciona (Integración):**
  1.  Al cargar el Home, se verifica si hay sesión activa.
  2.  Se llama a la API usando el `patient_id` del usuario.
  3.  Si la API responde con servicios, el Grid se reconstruye automáticamente.
  4.  **Fallback:** Si la API falla o el usuario no tiene servicios, se muestra un set por defecto (Encuestas, Mediciones) para no dejar la pantalla vacía.

---

## ⚙️ Documentación Técnica de la Integración

### Arquitectura de Datos

El flujo de datos para los servicios es el siguiente:

```mermaid
graph TD
    A[HomeView.vue] -->|onMounted| B[tiendaServicios.js]
    B -->|cargarServicios()| C[serviciosService.js]
    C -->|GET /patients/{id}/services| D[API HOMA]
    D -->|JSON Array| C
    C -->|Normalización| B
    B -->|Reactivity| A
    A -->|v-for| E[BentoGrid Component]
```

### Manejo de Respuesta API

El sistema está preparado para recibir la lista de servicios. Ejemplo de estructura esperada y procesada:

```json
[
  {
    "id": 1,
    "nombre": "Telemonitoreo",
    "icono": "activity",
    "ruta": "/mediciones",
    "orden": 1,
    "activo": true
  }
]
```

> **Nota Técnica:** Se implementó una capa de defensa en `tiendaServicios.js` que detecta si la API devuelve el array envuelto en un objeto (ej. `{ data: [...] }`) y lo extrae automáticamente para evitar errores de renderizado.

---

## 🔮 Pendientes y Próximos Pasos (Para la semana)

A pesar de que la funcionalidad base está lista, quedan detalles para "pulir" la experiencia:

1.  **Validación de Formato JSON Real:**
    - _Estado:_ Hemos probado con mocks y respuestas vacías.
    - _Acción:_ Confirmar con Cristóbal que la estructura del JSON de servicios coincida al 100% con lo que espera el frontend (especialmente nombres de campos como `nombre`, `icono`, `ruta`).

2.  **Links de Navegación:**
    - _Estado:_ Algunos servicios apuntan a "En Construcción".
    - _Acción:_ Mapear las rutas que vienen de la API a las rutas reales de Vue Router (`/citas`, `/recetas`, etc.) a medida que se desarrollen esas vistas.

3.  **Refinamiento Visual (CSS):**
    - _Estado:_ El Bento Grid es responsivo.
    - _Acción:_ Ajustar colores o iconos específicos si producción envía identificadores de iconos nuevos.

---

**Archivos Clave modificados:**

- `src/services/authService.js` (Lógica de Auth Híbrida)
- `src/stores/tiendaServicios.js` (Lógica de Servicios Dinámicos)
- `src/views/HomeView.vue` (Renderizado Dinámico)

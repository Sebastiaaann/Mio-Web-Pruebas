# Integración de Servicios Autenticados (HOMA API)

Este documento describe la implementación de la llamada al endpoint de servicios y su integración en la aplicación Vue 3.

## Flujo de Datos

1.  **Login**: El usuario se autentica y recibe un `token` (JWT) y un `patient_id`.
2.  **Almacenamiento**: El token se guarda en `localStorage` (`mio-token`) y el ID del paciente en `mio-session-meta`.
3.  **Llamada a API**:
    - `HomeView.vue` invoca `serviciosStore.cargarServicios()`.
    - `clienteApi.js` intercepta la petición e inyecta el header `X-API-KEY: <token>`.
    - Se realiza GET a `/api/v1/patients/{patient_id}/services`.
4.  **Procesamiento**:
    - `serviciosService.js` normaliza la respuesta (maneja variaciones de estructura de la API).
    - `tiendaServicios.js` actualiza el estado reactivo (`servicios`, `cargando`, `error`).
5.  **Renderizado**: `HomeView.vue` muestra los servicios obtenidos o un fallback si falla.

## Manejo de Errores (401 Unauthorized)

Si el token expira o es inválido:

1.  La API responde con `401 Unauthorized`.
2.  `clienteApi.js` detecta el 401 y emite el evento global `auth:session-expired`.
3.  `App.vue` captura este evento, cierra la sesión (`userStore.logout()`) y redirige al Login.

## Estructura de Archivos

- `src/services/serviciosService.js`: Lógica de fetch y normalización.
- `src/stores/tiendaServicios.js`: Store Pinia.
- `src/utils/clienteApi.js`: Cliente HTTP centralizado con interceptores.
- `src/views/inicio/HomeView.vue`: Vista principal.

## Ejemplos de Uso

### 1. Consumo desde un Componente (Vue Composition API)

```javascript
import { onMounted } from "vue";
import { useTiendaServicios } from "@/stores/tiendaServicios";
import { storeToRefs } from "pinia";

const serviciosStore = useTiendaServicios();
const { servicios, cargando, error } = storeToRefs(serviciosStore);

onMounted(() => {
  serviciosStore.cargarServicios();
});
```

### 2. Ejemplo con Axios (Referencia)

Si quisieras replicar la llamada manualmente fuera del `clienteApi`:

```javascript
import axios from "axios";

const obtenerServicios = async (patientId, token) => {
  try {
    const response = await axios.get(
      `https://apihoma.homa.cl:7200/api/v1/patients/${patientId}/services`,
      {
        headers: {
          "X-API-KEY": token,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Token expirado");
    }
    throw error;
  }
};
```

### 3. Ejemplo cURL (Para Pruebas)

Reemplaza `<TOKEN>` y `<PATIENT_ID>` con valores reales.

```bash
curl -X GET "https://apihoma.homa.cl:7200/api/v1/patients/<PATIENT_ID>/services" \
     -H "X-API-KEY: <TOKEN>" \
     -H "Content-Type: application/json"
```

## Notas Importantes

- **Mapeo de Servicios**: Debido a que la API entrega nombres genéricos, el frontend realiza un mapeo en `MAPEO_SERVICIOS` (`serviciosService.js`) para asignar iconos, colores y rutas locales.
- **Formato de Respuesta**: Se soporta tanto `{ data: { services: [] } }` como arrays directos para robustez.

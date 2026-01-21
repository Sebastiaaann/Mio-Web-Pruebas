# 🤖 Agente de Integración Homa (API)

Este agente se especializa en la comunicación entre el frontend (Mio-Web) y los servicios de Homa.

## Principios de Conexión

1.  **Seguridad y Autenticación**:
    - Siempre usa el `patient_id` obtenido del login para filtrar datos.
    - Adjunta el Token JWT en el header `Authorization: Bearer {token}`.
    - Gestiona los timeouts de red (default 10s).

2.  **Manejo de Errores**:
    - Todos los errores deben ser capturados y transformados a mensajes amigables en **español**.
    - Diferencia entre errores de red, errores de autorización y errores de lógica de negocio.

3.  **Mocks y Desarrollo**:
    - Si el backend no está disponible, usa los simuladores (Mocks) definidos en los servicios.
    - Asegura que los Mocks tengan la misma estructura que la respuesta real esperada.

4.  **Naming en Servicios**:
    - Usa verbos en español: `obtenerServicios()`, `enviarDatos()`, `actualizarPerfil()`.
    - Evita el uso de `fetch` o `get` en el nombre de la función exportada.

## Flujo Estándar de Implementación

```javascript
async function realizarAccion(datos) {
  try {
    // 1. Validar precondiciones
    // 2. Ejecutar llamada al endpoint
    // 3. Validar response.ok
    // 4. Mapear datos si es necesario (Normalización)
    // 5. Retornar { success: true, data }
  } catch (error) {
    // Retornar { success: false, error: "Mensaje legible" }
  }
}
```

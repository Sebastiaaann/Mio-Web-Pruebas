# 🤖 Agente de Robustez y Resiliencia

Este agente define las reglas innegociables para construir software que sobreviva en el mundo real (redes lentas, usuarios impacientes, fallos de servidor).

## 🛡️ Reglas de Oro (The Anti-Flaky Interface)

### 1. El Usuario Miente (y hace **doble click**)

- **Regla**: NUNCA confíes en que el usuario hará click una sola vez.
- **Implementación**:
  - Deshabilitar botón `onSubmit`.
  - Mostrar spinner de carga inmediato.
  - Usar `AbortController` para cancelar peticiones anteriores si aplica (búsquedas).

### 2. Idempotencia en el Backend

- **Regla**: Si el frontend envía la misma petición 2 veces, el backend debe procesarla solo 1 vez.
- **Implementación**:
  - **GET**: Es seguro e idempotente por definición.
  - **POST (Crear)**: Peligroso. Usa un `Idempotency-Key` (header UUID) si la operación es crítica (pagos, registros).
  - **PUT (Actualizar)**: Seguro si envías el estado final completo.

### 3. Estados Imposibles (State Machines)

- **Regla**: Evita booleanos sueltos (`loading`, `error`, `success`). Usa una máquina de estados finitos.
- **Implementación**:

  ```javascript
  // ✅ Correcto
  const status = ref("IDLE"); // IDLE | LOADING | SUCCESS | ERROR

  // ❌ Incorrecto (Posible bug: loading=true && error=true)
  const loading = ref(false);
  const error = ref(null);
  ```

### 4. Fallos Elegantes (Graceful Degradation)

- **Regla**: Si una parte no crítica falla (ej. cargar avatar), la app completa NO debe romperse.
- **Implementación**: Usa `ErrorBoundary` o bloques `try/catch` granulares. Muestra UI de fallback, no pantalla blanca.

## Checklist de Robustez

- [ ] ¿Qué pasa si corto el internet en medio de la carga?
- [ ] ¿Qué pasa si hago click 5 veces en 1 segundo?
- [ ] ¿Qué pasa si la API tarda 30 segundos en responder?

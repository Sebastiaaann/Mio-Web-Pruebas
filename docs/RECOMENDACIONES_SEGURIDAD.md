# Recomendaciones de Seguridad para Datos Clínicos (HOMA)

## Contexto

La aplicación maneja datos sensibles de pacientes (PHI) y consume una API de producción (`apihoma.homa.cl`).

## 1. Almacenamiento Seguro (Critical)

Actualmente, el código usa `localStorage` para guardar el token y el usuario completo.

```javascript
// ACTUAL (Inseguro)
localStorage.setItem("mio-user", JSON.stringify(user)); // Contiene PII
```

### Riesgo

`localStorage` es vulnerable a ataques XSS (Cross-Site Scripting). Si un script malicioso se inyecta en tu página (ej: una librería de terceros comprometida), puede leer todos los datos del paciente.

### Recomendación

1.  **Tokens**: Lo ideal son **HttpOnly Cookies** (requi ere soporte del backend).
2.  **Alternativa Frontend (SPA)**:
    - Guardar el token en **Memoria** (variable JS) para que no persista.
    - Usar `localStorage` solo para un "refresh token" (si existe) o para persistencia no sensible.
    - **Minimizar PII**: No guardar el objeto `user` completo con nombre/email en `localStorage`. Guardar solo flags no sensibles (ej: `isLoggedIn: true`).

## 2. Limpieza de Logs (Console Cleanup)

```javascript
// ACTUAL
console.log("Firebase Login Success, UID:", uid);
console.log("✅ Servicios cargados:", servicios.value);
```

### Riesgo

En producción, cualquier usuario puede abrir la consola (F12) y ver UIDs, tokens o datos médicos que hayas logueado por error.

### Recomendación

- Eliminar todos los `console.log` que expongan datos.
- Usar un "Logger Wrapper" que solo imprima en desarrollo:
  ```javascript
  const logger = {
    info: (...args) => {
      if (import.meta.env.DEV) console.log(...args);
    },
    error: (...args) => console.error(...args), // Errores sí, pero sanitizados
  };
  ```

## 3. Manejo de Sesión (Timeout)

Tratándose de datos clínicos, la sesión no debe quedar abierta indefinidamente.

### Recomendación

- Implementar un **Auto-Logout** por inactividad (ej: 15 minutos sin mover el mouse).
- Esto protege el computador compartido en una consulta o recepción.

## 4. Estructura Event-Driven para Seguridad

Usar eventos ayuda a separar la seguridad de la lógica de negocio.

- `LoginSuccess` -> Dispara auditoría (quién entró).
- `SessionExpired` -> Dispara limpieza forzada de RAM/Storage y redirección.

## Plan de Acción Inmediato

1.  **Refactorizar `authService`**: Eliminar logs y no guardar `user` completo en localStorage.
2.  **Crear `Logger` util**: Para reemplazar `console.log`.
3.  **Implementar Auto-Logout**: Hook simple que escuche actividad.

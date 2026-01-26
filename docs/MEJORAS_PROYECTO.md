# 🚀 Reporte de Mejoras Estratégicas: Proyecto Mio-Web

Basado en un análisis exhaustivo de la estructura actual `src/`, dependencias y configuraciones, he identificado 5 áreas clave para elevar la calidad del proyecto.

---

## 1. 🎨 Estandarización de UI (Critical)

**Estado Actual:** Detecto una "Sopa de Librerías".

- `PrimeVue` (Componentes clásicos)
- `Tailwind CSS v4` (Estilos utilitarios)
- `Reka UI` + `Shadcn-like` (en `src/components/ui/*` con 68 archivos)
- `Motion` (Animaciones)

**Problema:** Mantener 3 sistemas de diseño (Prime, Shadcn, Tailwind puro) aumenta el tamaño del bundle y crea inconsistencias visuales.
**Mejora Propuesta:**

- **Decisión Arquitectónica:** Migrar completamente a **Shadcn-Vue (Tailwind)** para componentes visuales y eliminar `PrimeVue` si solo se usa para cosas menores.
  - _Beneficio:_ Menor peso (PrimeVue es pesado), control total de estilos vía Tailwind.
- **Iconografía:** Unificar en **Lucide Icons** y eliminar `primeicons`. (Visto en `MioRobot.vue` que ya hay un mapeo legacy).

## 2. 🛡️ Robustez en la Capa de API

**Estado Actual:** `pacienteService.js` usa `fetch` nativo inyectando el token manualmente en los headers.
**Problema:** Si la lógica de auth cambia o el token expira, tendrás que actualizar cada servicio individualmente.
**Mejora Propuesta:**

- **Crear `apiClient.js`:** Un wrapper centralizado (usando `ofetch` o `axios`) que:
  1.  Inyecte el Token automáticamente.
  2.  Maneje el refresh de token (401) silenciosamente.
  3.  Reporte errores al sistema de logs una sola vez.

## 3. 🧹 Limpieza de Código y Estructura

**Estado Actual:**

- Existe `src/components/demo` (probablemente código muerto en producción).
- Existe `src/components/ui` con 68 componentes. ¿Se usan todos?
  **Mejora Propuesta:**
- **Audit de Componentes:** Ejecutar un script para detectar componentes no importados y moverlos a `archived/`.
- **Eliminar `demo/`:** Limpiar el build de producción.

## 4. 🧩 Gestión de Estado (Stores)

**Estado Actual:** Los nombres `tiendaUsuario`, `tiendaServicios` cumplen la regla de español ✅.
**Mejora Propuesta:**

- **Persistencia Selectiva:** Asegurar que `tiendaUsuario` use `pinia-plugin-persistedstate` para no perder la sesión al recargar la página (común en SPAs).
- **Reset Pattern:** Implementar un método `$reset()` universal en todas las stores para el logout (limpieza de datos de paciente anterior).

## 5. ⚡ Performance y Testing

**Estado Actual:** Tienes `vitest` instalado pero no visible uso intensivo.
**Mejora Propuesta:**

- **Smoke Tests:** Crear un test básico para cada vista principal (`views/*`) que asegure que "monta sin explotar".
- **Lazy Loading:** Verificar en `router/index.js` que todas las rutas sean `() => import(...)` para dividir el código.

---

### 📅 Plan de Acción Recomendado

1.  **Fase 1 (Limpieza):** Eliminar `primeicons` y componentes `demo`.
2.  **Fase 2 (Refactor API):** Centralizar `fetch` en un `apiClient`.
3.  **Fase 3 (UI):** Estandarizar botones y inputs (elegir Prime o Shadcn, no ambos).

¿Te gustaría que profundice en alguno de estos puntos o use un agente para ejecutar una limpieza inicial?

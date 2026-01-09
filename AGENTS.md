# Mio-Web Development Guidelines

Este documento proporciona las instrucciones y estándares para agentes de IA y desarrolladores que trabajan en el repositorio de `Mio-Web`.

## 1. Build, Run, and Test Commands

### Entorno
- **Runtime:** Node.js (`^20.19.0 || >=22.12.0`)
- **Package Manager:** npm (NO usar yarn o pnpm)
- **Framework:** Vue 3 (v3.5.26) + Vite (v7.3.0)
- **Build Tool:** Vite con hot module replacement (HMR)

### Comandos Esenciales
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción (output: dist/)
npm run build

# Preview del build de producción
npm run preview
```

### Verificación de Cambios
**IMPORTANTE:** No hay testing automatizado ni linting configurado. Verificar manualmente:
1. **Build Check:** `npm run build` - debe completar sin errores
2. **Runtime Check:** `npm run dev` - debe iniciar sin errores en consola
3. **Browser Check:** Verificar en navegador que la funcionalidad trabaje correctamente
4. **Style Check:** Confirmar adherencia al diseño blanco y negro (sin colores vibrantes)

## 2. Git y Control de Versiones

Para mantener un historial limpio y organizado durante las fases de desarrollo, se deben seguir estas reglas:

### Ramas (Branching)
- **main:** Código estable y en producción.
- **develop:** Rama de integración para las fases actuales.
- **Features:** Las nuevas funcionalidades se crean desde `develop` con el prefijo `feature/`.
  - Ejemplo: `feature/onboarding-wizard`, `feature/grafico-semaforo`.
- **Fixes:** Correcciones de errores con el prefijo `fix/`.
  - Ejemplo: `fix/error-validacion-rut`.

### Mensajes de Commit (Conventional Commits en Español)
Se recomienda el uso de prefijos para identificar la naturaleza del cambio:
- **feat:** Una nueva funcionalidad (ej: `feat: agregar componente de navegación lateral`).
- **fix:** Corrección de un error (ej: `fix: corregir cálculo en el gauge de salud`).
- **docs:** Cambios en la documentación (ej: `docs: actualizar guía de estilos git`).
- **style:** Cambios que no afectan la lógica (espacios, formato, diseño B/N, Tailwind).
- **refactor:** Mejora del código que no añade funciones ni corrige errores.

### Reglas de Oro de Git
- No subir `node_modules` ni archivos `.env` (asegurar que estén en `.gitignore`).
- **Commits atómicos:** Un commit debe realizar una sola tarea lógica.
- **Sincronización:** Siempre realizar `git pull origin develop` antes de iniciar una nueva feature.

## 3. Code Style & Conventions

### Arquitectura General
- **Lenguaje:** JavaScript (ES Modules). **NO usar TypeScript.**
- **Estado:** Pinia (Almacenes en `src/stores/`)
- **Routing:** Vue Router configurado en `src/router/index.js`
- **Component Style:** Vue 3 Composition API con `<script setup>` preferido

### Estructura de Archivos y Nomenclatura
```
src/
├── assets/          # Estilos globales (principal.css, primevue-theme.css)
├── components/      # Componentes reutilizables
│   ├── forms/       # Componentes de formularios
│   ├── layout/      # Layout (navbar, sidebar, footer)
│   └── ui/          # Componentes UI genéricos
├── composables/     # Composition API functions reutilizables
├── layouts/         # Layout wrappers (AppLayout.vue, OnboardingLayout.vue)
├── router/          # Vue Router configuration
├── services/        # API calls y servicios externos
├── stores/          # Pinia stores
├── utils/           # Funciones de utilidad
└── views/           # Componentes a nivel de página
    ├── auth/        # Vistas de autenticación
    └── dashboard/   # Vistas del dashboard
```

**Nomenclatura:**
- **Componentes Vue:** PascalCase (ej: `InicioView.vue`, `NavBar.vue`)
- **Archivos JS:** camelCase (ej: `unirClases.js`, `validarRut.js`)
- **Directorios:** lowercase (ej: `components`, `utils`)

### Imports
- **Alias `@`:** Configurado en `vite.config.js` y `jsconfig.json` para apuntar a `src/`
  ```javascript
  import MyComponent from '@/components/MyComponent.vue';
  import { unirClases } from '@/utils/UnirClases';
  ```
- **Extensión `.vue`:** SIEMPRE incluir para imports de componentes
- **Order:** Importar en este orden: librerías externas → componentes → stores → utils

### Estilizado (Tailwind CSS + PrimeVue)
- **Frameworks:** Tailwind CSS (`@tailwindcss/vite`) y PrimeVue (`@primevue/themes/aura`).
- **Estética Blanco y Negro (B/N):**
  - **Colores:** Fondos preferentemente `#FFFFFF` / `#F9F9F9`. Texto y elementos de acción `#000000` o escala de grises.
  - **Bordes:** Preferir `border` de 1px sólido sobre sombras extensas.
  - **PrimeVue:** Configurar el tema para minimizar colores primarios vibrantes (azules) y usar escala de grises.
- **Class Merging:** SIEMPRE usar la utilidad `unirClases` cuando se mezclen clases dinámicas de Tailwind para evitar conflictos.
  ```javascript
  import { unirClases } from '@/utils/UnirClases';
  
  // Uso
  const className = unirClases('bg-red-500 p-4', props.className);
  ```
- **Tema PrimeVue:** El preset Aura está configurado en `main.js`. Usar componentes de PrimeVue para elementos complejos de UI.

### Patrones de Componentes Vue

#### Componentes con <script setup>
- **Preferir siempre** `<script setup>` sobre Options API
- **Props:** Destructuring sin tipos TypeScript
  ```javascript
  const { titulo = 'Sin título', mostrar = true } = defineProps(['titulo', 'mostrar']);
  ```
- **Emits:** Array simple de eventos
  ```javascript
  const emit = defineEmits(['actualizar', 'cerrar', 'guardar']);
  emit('actualizar', nuevoValor);
  ```
- **Slots:** Sintaxis corta `#header` no `v-slot:header`
- **v-model:** Usar `defineModel()` para simplificar binding bidireccional
  ```javascript
  const titulo = defineModel(); // Reemplaza prop + emit manual
  ```
- **Shorthand:** `:contador` en lugar de `:contador="contador"`
- **Dividir componentes >200 líneas** en componentes más pequeños o extraer lógica a composables

#### Composables (Funciones use*)
- **Naming:** Prefijo `use` + español: `useContador`, `useAutenticacion`, `useDatosUsuario`
- **VueUse primero:** Verificar [vueuse.org](https://vueuse.org) antes de crear custom
  - DOM: `useEventListener`, `useIntersectionObserver`
  - State: `useLocalStorage`, `useSessionStorage`
  - Sensors: `useMouse`, `useScroll`
- **Retorno:** Usar `readonly()` para proteger estado de mutación externa
- **Reglas críticas:**
  - NO async composables (pierden contexto lifecycle)
  - Llamar solo a nivel top (nunca en loops/condicionales)
  - Cleanup con `onUnmounted` para listeners/timers

#### Utilidades Puras
- **Funciones puras:** Mismo input → mismo output, sin efectos secundarios
- **Categorías y nombres en español:**
  - Formatters: `formatearMoneda`, `formatearFecha`, `formatearRut`
  - Validators: `validarEmail`, `validarRut`, `validarTelefono`
  - Transformers: `slugificar`, `truncar`, `capitalizar`
- **Organización:** `src/utils/` agrupado por categoría (formateadores.js, validadores.js)
- **Cuándo NO usar:** Lógica con estado → usar composables, API calls → usar services

**Ver ejemplos completos en:** `.github/skills/vue/references/componentes-es.md`, `composables-es.md`, `utilidades-es.md`

### Ejemplos de Código Rápidos

#### Componente Vue
```vue
<script setup>
import { ref } from 'vue';
import { unirClases } from '@/utils/UnirClases';

const { nombre = 'Usuario', activo = true } = defineProps(['nombre', 'activo']);
const emit = defineEmits(['editar']);

const expandido = ref(false);
</script>

<template>
  <div :class="unirClases('border p-4', activo ? 'bg-white' : 'bg-gray-100')">
    <h3>{{ nombre }}</h3>
    <button @click="expandido = !expandido">Toggle</button>
    <slot name="acciones" />
  </div>
</template>
```

#### Composable
```javascript
// composables/useContador.js
import { ref, readonly } from 'vue';

export function useContador(inicial = 0) {
  const contador = ref(inicial);
  const incrementar = () => contador.value++;
  return { contador: readonly(contador), incrementar };
}
```

#### Utilidad (Validador RUT)
```javascript
// utils/validadores.js - Ver implementación completa en referencias
export function validarRut(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  // ... algoritmo validación dígito verificador
  return esValido;
}
```

**Ejemplos completos:** Ver `.github/skills/vue/references/` para implementaciones detalladas.

### Idioma y Comentarios
- **Código y Comentarios:** Escribir TODO en **Español**. Nombres descriptivos como `calcularIndiceSalud` o `usuarioStore`.
- **Documentación:** Enfocarse en el *por qué* existe la lógica, no solo en *qué* hace.
- **Formato:** Comentarios con espacio después de `//` (ej: `// Comentario`)

### Manejo de Errores
- Usar bloques `try/catch` para operaciones asíncronas.
- Asegurar retroalimentación UI para errores de cara al usuario (revisar componente `Toast` de PrimeVue si se agregan notificaciones).
- Logging de errores para debugging: `console.error('Error descriptivo:', error);`

## 4. Reglas Contextuales HOMA

### Fase 1: Onboarding
- Los datos se guardan en el store de Pinia y se envían en un único JSON al finalizar el flujo.
- **Validación obligatoria de RUT chileno** en los formularios correspondientes.

### Fase 2: Dashboard y Mediciones
- **Banner de Alerta:** Debe ser un componente reactivo que dependa del estado de salud del usuario.
- **Gráficos:** Uso de `chart.js` para el Gauge de salud (Semáforo), manteniendo la sobriedad visual del proyecto.

### Fase 3: Dispositivos
- La web es informativa en esta sección. Mostrar mensaje: *"Vincule nuevos sensores desde la App HOMA móvil"*.

## 5. Rules & Guidelines (Contextual)

### No TypeScript
- This project uses standard JavaScript. Do not introduce `.ts` files or TypeScript syntax unless explicitly requested to migrate the project.

### Formatting
- **Semicolons:** Yes (mostly used in existing code).
- **Quotes:** Double quotes preferred for strings and imports, though consistency with the specific file being edited is key.
- **Indentation:** 2 or 4 spaces (match existing file indentation).
- **Espacios:** Siempre espacio después de `//` en comentarios.

### Verification Steps for Agents
Since there are no test scripts:
1. **Build Check:** Always run `npm run build` after significant changes to ensure no build errors.
2. **Runtime Check:** Verify that the dev server starts without errors using `npm run dev`.
3. **Estilo B/N:** Verificar que no existan clases de colores vibrantes de Tailwind (ej. `bg-blue-600`) que rompan la estética.
4. **Sidebar:** Asegurar que la navegación lateral sea funcional y respete el diseño minimalista.
5. **Console:** Verificar que no haya errores en la consola del navegador.

---

## Notas Finales

- **NO subir secretos:** Verificar que `.env` y archivos sensibles estén en `.gitignore`.
- **Commits pequeños:** Cada commit debe ser atómico y enfocado en una tarea.
- **Revisar manualmente:** Sin tests automatizados, la revisión manual es crítica.

---

## Referencias Avanzadas de Vue

Para patrones detallados, ejemplos completos y casos de uso avanzados:

### Versiones en Español (JavaScript - Stack Mio-Web)
- `.github/skills/vue/references/componentes-es.md` - Props, emits, slots, defineModel
- `.github/skills/vue/references/composables-es.md` - Composables, lifecycle, VueUse
- `.github/skills/vue/references/utilidades-es.md` - Formatters, validators, transformers

### Versiones Originales (TypeScript - Solo Referencia)
- `.github/skills/vue/references/components.md` - Patrones avanzados con TS
- `.github/skills/vue/references/composables.md` - Composables tipados
- `.github/skills/vue/references/testing.md` - Testing (no configurado aún)

**Nota:** Usar siempre versiones `-es.md` para este proyecto. Las originales con TypeScript son solo para consulta técnica.

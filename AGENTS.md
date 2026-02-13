# AGENTS.md - Directrices para Agentes de Código

## Comandos de Desarrollo

### Build y Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo Vite
npm run build        # Compilar para producción
npm run preview      # Previsualizar build de producción
npm run typecheck    # Verificar tipos con vue-tsc --noEmit
```

### Testing
```bash
npm run test              # Ejecutar tests en modo watch (Vitest)
npm run test:run          # Ejecutar tests una vez
npm run test:coverage     # Ejecutar tests con cobertura
```

**Ejecutar un test específico:**
```bash
npx vitest run src/tests/composables/useChartData.typeguards.test.ts
npx vitest run --reporter=verbose useChartData
```

### MCP Servers
```bash
npm run mcp:build     # Compilar todos los MCP servers
npm run mcp:install   # Instalar dependencias de MCP servers
npm run mcp:testing   # Ejecutar MCP de testing
npm run mcp:analytics # Ejecutar MCP de analytics
npm run mcp:health    # Ejecutar MCP de health data
```

## Guías de Estilo de Código

### Tecnologías Principales
- **Vue 3** con Composition API (`<script setup>`)
- **TypeScript** estricto habilitado
- **Tailwind CSS v4** con shadcn-vue
- **Pinia** para state management
- **Vitest** + Vue Test Utils para testing
- **Vite** como build tool

### Convenciones de Imports
```typescript
// 1. Imports de Vue y librerías core
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

// 2. Imports de librerías de terceros
import { Motion, AnimatePresence } from 'motion-v'
import { Button, Card } from '@/components/ui'

// 3. Imports de stores (usar @/stores/)
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'

// 4. Imports de composables
import { useChartData } from '@/composables/useChartData'

// 5. Imports de componentes
import TarjetaSalud from '@/components/health/TarjetaSalud.vue'
import IconoEstado from '@/components/ui/IconoEstado.vue'

// 6. Imports de tipos
import type { Medicion, TipoMedicion } from '@/types/salud'
```

### Idioma del Proyecto (IMPORTANTE)
Este proyecto está en **español**. Seguir estas reglas:

1. **Nombres de archivos**: En español (ej: `tiendaSalud.js`, `useFormatoFecha.ts`)
2. **Comentarios**: Siempre en español
3. **Variables y funciones**: Usar español semántico:
   - ✅ `obtenerUsuario()`, `listaProductos`, `estaActivo`
   - ❌ `getUser()`, `productList`, `isActive`
4. **UI/UX**: Todos los textos visibles en español
5. **Commits**: En español con formato convencional:
   - `feat: agregar funcionalidad de login`
   - `fix: corregir error en formulario`

**Excepciones**: Palabras técnicas (API, HTTP, URL), nombres de librerías (Vue, Pinia), y tipos de datos estándar.

### Convenciones de Nombres
- **Componentes Vue**: PascalCase (ej: `TarjetaSalud.vue`, `MiPerfilView.vue`)
- **Composables**: camelCase con prefijo `use` (ej: `useChartData.ts`, `useFormatoFecha.ts`)
- **Stores**: camelCase con prefijo `use` + `Store` (ej: `useUserStore`, `tiendaSalud.js`)
- **Tipos/Interfaces**: PascalCase (ej: `Medicion`, `EstadoControl`, `TipoMedicion`)
- **Constantes**: UPPER_SNAKE_CASE para valores fijos
- **Archivos de test**: `.test.ts` o `.spec.ts` junto al código o en `src/tests/`

### Estructura de Componentes Vue
```vue
<script setup lang="ts">
/**
 * Descripción del componente
 * @example Uso básico del componente
 */

// Imports organizados por categoría
import { ref, computed } from 'vue'
// ... otros imports

// Props y emits con tipado estricto
interface Props {
  titulo: string
  descripcion?: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: FormData]
}>()

// Estado reactivo
const contador = ref(0)
const doble = computed(() => contador.value * 2)

// Funciones
function incrementar() {
  contador.value++
}
</script>

<template>
  <div class="clase-contenedor">
    <!-- Contenido -->
  </div>
</template>
```

### Manejo de Errores
```typescript
// Usar try/catch con tipado de errores
try {
  const resultado = await api.obtenerDatos()
  return resultado
} catch (error) {
  // Log en desarrollo
  if (import.meta.env.DEV) {
    console.error('Error al obtener datos:', error)
  }
  // Manejo graceful
  return null
}
```

### Testing
- Usar **Vitest** con **happy-dom** environment
- Tests en archivos `.test.ts` o `.spec.ts`
- Mock de servicios en `src/tests/setup.js`
- Usar `@vue/test-utils` para tests de componentes
- Tests descriptivos en español:
```typescript
describe('useChartData', () => {
  it('deberia calcular promedio correctamente', () => {
    // test code
  })
})
```

### TypeScript Estricto
- Todas las funciones deben tener tipos de retorno explícitos
- Interfaces para objetos complejos en `@/types/`
- Usar `type` para aliases y unions, `interface` para objetos
- Aprovechar el path alias `@/` configurado en `tsconfig.json`

### Estilos CSS
- Usar **Tailwind CSS** para estilos
- Clases de utilidad de Tailwind v4
- Para estilos scoped, usar clases descriptivas en español:
```vue
<style scoped>
.tarjeta-salud {
  @apply rounded-lg shadow-md p-4;
}
</style>
```

## Estructura del Proyecto
```
src/
├── components/        # Componentes Vue
│   ├── ui/           # Componentes base (shadcn)
│   ├── health/       # Componentes de salud
│   └── [feature]/    # Componentes por feature
├── composables/       # Composables reutilizables
├── stores/           # Stores de Pinia
├── types/            # Definiciones TypeScript
├── views/            # Vistas/Páginas
├── layouts/          # Layouts de la app
├── tests/            # Tests y configuración
└── App.vue           # Componente raíz
```

## Notas Importantes
- **Node.js**: Versión >=20.19.0 <23.0.0
- **No hay ESLint/Prettier configurado**: Mantener consistencia manual
- **Alias `@/`**: Apunta a `./src` configurado en Vite y TS
- **Vue DevTools**: Habilitado en desarrollo
- **Custom elements**: `iconify-icon` está configurado como custom element



# Directrices para Agentes

## Sistema de Agentes Especializados

Este proyecto utiliza un **sistema de agentes especializados** organizados en la carpeta `agents/`. Cada agente contiene conocimiento específico sobre una tecnología o área de desarrollo.

### Cómo Funciona

Los agentes se activan **automáticamente** según el contexto:
- Tipo de archivo (`.vue`, `.test.ts`, `stores/*.ts`, etc.)
- Palabras clave en la solicitud
- Patrones de código detectados
- Contexto de la tarea

**No es necesario mencionar explícitamente los agentes o skills.** El asistente detectará el contexto y aplicará el conocimiento apropiado.

### Estructura de Agentes

```
agents/
├── vue/
│   ├── core.md           # Vue 3, Composition API, TypeScript
│   ├── router.md         # Vue Router 4, navegación
│   ├── pinia.md          # Pinia, state management
│   ├── use.md            # VueUse composables
│   └── composables.md    # Composables adaptables
├── testing/
│   └── testing.md        # Vitest, Playwright, testing
└── frontend/
    └── design.md         # Tailwind, shadcn/ui, diseño
```

### Prioridades

1. **Vue.js (PRIORIDAD ABSOLUTA)**: Todos los agentes de Vue tienen prioridad máxima
2. **Testing**: Tests unitarios, componentes, E2E
3. **Frontend**: Diseño, UI, UX

Para más detalles, ver [agents/README.md](./agents/README.md)

---

## Idioma del Proyecto

**IMPORTANTE**: Este proyecto está en español. Todas las contribuciones de código, archivos y documentación deben seguir estas reglas:

### Requisitos de Idioma

1. **Nombres de archivos**: Todos los nombres de archivos y carpetas deben estar en español cuando sea posible (excepto nombres técnicos estándar como `index.js`, `App.vue`, etc.)

2. **Comentarios**: Todos los comentarios en el código deben estar escritos en español.

3. **Variables y funciones**: Se recomienda usar nombres descriptivos en español para variables, funciones y componentes cuando sea semánticamente claro. Por ejemplo:
   - `obtenerUsuario()` en lugar de `getUser()`
   - `listaProductos` en lugar de `productList`
   - `estaActivo` en lugar de `isActive`

4. **Mensajes de UI**: Todos los textos visibles para el usuario (labels, placeholders, mensajes de error, tooltips, etc.) DEBEN estar en español.

5. **Documentación**: Toda la documentación, READMEs, y comentarios de código deben estar en español.

6. **Commits**: Los mensajes de commit deben estar en español y seguir el formato convencional:
   - `feat: agregar funcionalidad de login`
   - `fix: corregir error en formulario de registro`
   - `docs: actualizar documentación del API`

### Excepciones

- Palabras técnicas universales (API, HTTP, URL, etc.)
- Nombres de librerías y frameworks (Vue, Pinia, Supabase, etc.)
- Tipos de datos y estructuras estándar
- Configuraciones que requieren nombres específicos en inglés

### Ejemplos de Código

```javascript
// ✅ Correcto
const usuarioActivo = ref(null)
const obtenerDatos = async () => { ... }
const listaDeProductos = computed(() => { ... })

// ❌ Incorrecto
const activeUser = ref(null)
const fetchData = async () => { ... }
const productList = computed(() => { ... })
```

```vue
<!-- ✅ Correcto -->
<Button label="Guardar cambios" />
<InputText placeholder="Ingrese su correo electrónico" />

<!-- ❌ Incorrecto -->
<Button label="Save changes" />
<InputText placeholder="Enter your email" />
```

---

## Agentes Especializados y Skills Disponibles

Este proyecto cuenta con múltiples agentes especializados que se activan automáticamente según el contexto. **NO es necesario que el usuario mencione explícitamente las skills** - el agente detectará el contexto y aplicará las mejores prácticas correspondientes.

### Prioridad 1: Desarrollo Vue.js (OBLIGATORIO)

#### Agente Vue Core (`vue-best-practices`)
**Activación automática cuando:**
- Se trabaja con archivos `.vue`
- Se crean o editan componentes Vue
- Se mencionan términos como "componente", "vista", "template"
- Se detecta código Vue en el contexto

**Aplicar siempre:**
- Composition API con `<script setup>`
- TypeScript estricto
- Vue 3 patterns
- SSR/Nuxt cuando aplique
- Uso de `vue-tsc` para type checking

#### Agente Vue Options API (`vue-options-api-best-practices`)
**Activación automática cuando:**
- Se detecta código usando `data()`, `methods`, `computed` como objetos
- El proyecto usa explícitamente Options API
- Se mantiene código legacy
- Se migra de Vue 2 a Vue 3

**Acción:** Aplicar mejores prácticas de Options API o sugerir migración a Composition API

#### Agente Vue Router (`vue-router-best-practices`)
**Activación automática cuando:**
- Se crean o editan rutas
- Se mencionan términos como "ruta", "router", "navegación", "redirect"
- Se trabaja con `vue-router` o archivos de configuración de rutas
- Se implementan guards de navegación

**Aplicar:**
- Vue Router 4 patterns
- Navigation guards
- Manejo de parámetros de ruta
- Lazy loading de componentes
- Route meta fields

#### Agente Pinia (`vue-pinia-best-practices`)
**Activación automática cuando:**
- Se crean o editan stores
- Se mencionan términos como "store", "estado", "state", "pinia"
- Se trabaja con estado global
- Se detectan archivos en carpetas `stores/` o `store/`

**Aplicar:**
- Store setup pattern
- Reactividad con Pinia
- Actions y getters
- Store composition
- TypeScript en stores

#### Agente Testing Vue (`vue-testing-best-practices`)
**Activación automática cuando:**
- Se escriben tests
- Se mencionan términos como "test", "testing", "spec", "vitest"
- Se trabaja con archivos `.test.ts` o `.spec.ts`
- Se configura testing

**Aplicar:**
- Vitest para tests unitarios
- Vue Test Utils para componentes
- Playwright para E2E
- Mocking patterns
- Testing de composables

#### Agente VueUse (`vueuse-functions`)
**Activación automática cuando:**
- Se necesitan funcionalidades comunes (localStorage, fetch, clipboard, etc.)
- Se mencionan términos como "composable", "useLocalStorage", "useFetch"
- Se detecta código repetitivo que puede reemplazarse con VueUse

**Aplicar:**
- Composables de VueUse cuando estén disponibles
- Evitar reinventar funcionalidades ya existentes
- Documentar uso de VueUse

#### Agente Composables Adaptables (`create-adaptable-composable`)
**Activación automática cuando:**
- Se crean funciones que empiezan con `use`
- Se desarrollan composables personalizados
- Se necesitan inputs reactivos (MaybeRef/MaybeRefOrGetter)
- Se busca reutilización de lógica

**Aplicar:**
- Patrón de composables adaptables
- Uso de `toValue()` y `toRef()`
- Normalización de inputs reactivos
- Documentación de composables

#### Agente Vue JSX (`vue-jsx-best-practices`)
**Activación automática cuando:**
- Se trabaja con archivos `.jsx` o `.tsx` en Vue
- Se usa JSX en componentes Vue
- Se configura JSX plugin

**Aplicar:**
- Sintaxis JSX específica de Vue
- Diferencias con React JSX
- Configuración correcta del plugin

---

### Prioridad 2: Frontend y UI

#### Agente Diseño Frontend (`frontend-design`)
**Activación automática cuando:**
- Se crean interfaces de usuario
- Se mencionan términos como "diseño", "UI", "componente visual", "estilo"
- Se trabaja con CSS, Tailwind, shadcn/ui
- Se solicita "mejorar diseño" o "hacer más bonito"

**Aplicar:**
- Diseño distintivo y no genérico
- Tailwind CSS best practices
- shadcn/ui components
- Accesibilidad (a11y)
- Responsive design

#### Agente UI/UX Review (`web-design-guidelines`)
**Activación automática cuando:**
- Se solicita "review", "auditoría", "revisar UI"
- Se mencionan términos como "accesibilidad", "UX", "usabilidad"
- Se necesita verificar guidelines

**Aplicar:**
- Web Interface Guidelines
- Accessibility checks
- UX best practices
- Design system consistency

---

### Prioridad 3: Testing y Calidad

#### Agente Testing Web (`webapp-testing`)
**Activación automática cuando:**
- Se necesita testing de aplicaciones web
- Se usan herramientas como Playwright
- Se solicitan screenshots o debugging visual

**Aplicar:**
- Playwright para testing
- Screenshots para debugging
- Browser logs analysis
- E2E testing patterns

#### Agente Auditoría Web (`audit-website`)
**Activación automática cuando:**
- Se solicita "auditoría", "análisis", "health check"
- Se mencionan problemas de SEO, performance, seguridad
- Se usa squirrelscan CLI

**Aplicar:**
- Auditoría completa con squirrelscan
- Análisis de SEO técnico
- Performance optimization
- Security checks

---

### Prioridad 4: SEO y Marketing

#### Agente SEO (`seo-audit`, `schema-markup`)
**Activación automática cuando:**
- Se mencionan términos como "SEO", "posicionamiento", "meta tags"
- Se trabaja con landing pages
- Se necesitan rich snippets

**Aplicar:**
- Technical SEO audit
- On-page SEO optimization
- Schema markup/structured data
- Meta tags optimization

---

### Prioridad 5: DevOps y Despliegue

#### Agente Despliegue (`vercel-deploy`)
**Activación automática cuando:**
- Se solicita "deploy", "desplegar", "publicar"
- Se menciona Vercel
- Se necesita preview deployment

**Aplicar:**
- Vercel deployment
- Preview URLs
- Production deployment
- Environment configuration

---

### Prioridad 6: Documentación y Contenido

#### Agente Documentación (`content-research-writer`, `changelog-generator`)
**Activación automática cuando:**
- Se escribe documentación
- Se generan changelogs
- Se crea contenido técnico
- Se mencionan "docs", "README", "documentación"

**Aplicar:**
- Content research
- Changelog generation from git
- Technical writing best practices

---

## Detección Automática de Contexto

El agente **NO requiere** que el usuario mencione explícitamente las skills. En su lugar, el agente analizará:

### 1. Tipo de Archivo
| Extensión/Pattern | Skill a aplicar |
|-------------------|-----------------|
| `.vue` | `vue-best-practices` |
| `.test.ts`, `.spec.ts` | `vue-testing-best-practices` |
| `use*.ts` (composables) | `create-adaptable-composable` + `vueuse-functions` |
| `stores/*.ts` | `vue-pinia-best-practices` |
| `router/*.ts` | `vue-router-best-practices` |
| `.css`, `.scss`, `.less` | `frontend-design` |

### 2. Palabras Clave en Solicitudes
| Si el usuario dice... | Skill a aplicar |
|-----------------------|-----------------|
| "componente", "vista", "template" | `vue-best-practices` |
| "ruta", "router", "navegación" | `vue-router-best-practices` |
| "store", "estado", "pinia" | `vue-pinia-best-practices` |
| "test", "testing", "vitest", "spec" | `vue-testing-best-practices` |
| "composable", "useXxx", "reactividad" | `create-adaptable-composable` |
| "diseño", "UI", "estilo", "CSS" | `frontend-design` |
| "SEO", "meta tags", "posicionamiento" | `seo-audit` |
| "deploy", "desplegar", "Vercel" | `vercel-deploy` |
| "review", "auditoría", "accesibilidad" | `web-design-guidelines` |

### 3. Patrones de Código Detectados
| Patrón detectado | Acción automática |
|------------------|-------------------|
| `data() { return {...} }` | Sugerir migración a Composition API o aplicar `vue-options-api-best-practices` |
| `<script>` sin `setup` | Sugerir `<script setup>` |
| `ref()`, `computed()`, `watch()` | Confirmar uso correcto de Composition API |
| `useRoute()`, `useRouter()` | Verificar `vue-router-best-practices` |
| `useStore()` o `storeToRefs()` | Verificar `vue-pinia-best-practices` |
| Funciones `use*` personalizadas | Aplicar `create-adaptable-composable` |
| Lógica repetitiva (localStorage, fetch) | Sugerir `vueuse-functions` |

### 4. Contexto de la Tarea
| Tipo de tarea | Skills a considerar |
|---------------|---------------------|
| Crear nuevo componente | `vue-best-practices` + `frontend-design` |
| Editar componente existente | Analizar código actual + skill correspondiente |
| Migrar/refactorizar | Múltiples skills según el objetivo |
| Agregar funcionalidad | Skills específicas del dominio |
| Fix bug | `vue-testing-best-practices` para reproducir + skill del área |

---

## Mejoras Sugeridas por Skills

### Migración y Modernización

#### 1. Migrar a Composition API
**Si el proyecto usa Options API:**
- Prioridad: ALTA
- Beneficios: Mejor performance, mejor TypeScript support, código más conciso
- Skills: `vue-best-practices` + `vue-options-api-best-practices` (para migración segura)

#### 2. Implementar TypeScript Estricto
**Si no está completamente tipado:**
- Prioridad: ALTA
- Beneficios: Mejor DX, menos bugs, autocompletado
- Skills: `vue-best-practices` (TypeScript patterns)

#### 3. Agregar Testing
**Si no hay tests:**
- Prioridad: MEDIA-ALTA
- Beneficios: Código más confiable, refactoring seguro
- Skills: `vue-testing-best-practices`

### Optimización de Código

#### 4. Usar VueUse
**Para funcionalidades comunes:**
- Prioridad: MEDIA
- Beneficios: Menos código propio, battle-tested, bien documentado
- Skills: `vueuse-functions`

#### 5. Crear Composables Adaptables
**Para lógica reutilizable:**
- Prioridad: MEDIA
- Beneficios: Reutilización, testing más fácil, código más limpio
- Skills: `create-adaptable-composable`

#### 6. Optimizar Stores (Pinia)
**Si usa estado global:**
- Prioridad: MEDIA
- Beneficios: Mejor organización, TypeScript support
- Skills: `vue-pinia-best-practices`

### Calidad y Diseño

#### 7. Mejorar UI/UX
**Si el diseño necesita trabajo:**
- Prioridad: BAJA-MEDIA
- Beneficios: Mejor experiencia de usuario, diseño profesional
- Skills: `frontend-design` + `web-design-guidelines`

#### 8. Implementar Testing E2E
**Para flujos críticos:**
- Prioridad: BAJA-MEDIA
- Beneficios: Testing de integración, regresión visual
- Skills: `vue-testing-best-practices` (Playwright)

---

## Flujo de Trabajo del Agente

Cuando el usuario hace una solicitud, el agente debe:

1. **Analizar el contexto** (archivo, palabras clave, código existente)
2. **Identificar skills relevantes** automáticamente
3. **Aplicar mejores prácticas** de las skills identificadas
4. **Sugerir mejoras** adicionales basadas en skills disponibles
5. **Documentar decisiones** (qué skills se usaron y por qué)

### Ejemplo de Pensamiento Interno:

```
Usuario: "Crea un componente para mostrar la lista de usuarios"

Análisis:
- Solicitud: Crear componente Vue
- Archivo: .vue (inferido)
- Contexto: Lista de datos

Skills a aplicar:
1. vue-best-practices (Composition API, <script setup>, TypeScript)
2. frontend-design (UI para listas, responsive)
3. vueuse-functions (posiblemente useFetch o useLocalStorage)

Acción:
- Crear componente con <script setup lang="ts">
- Usar Composition API patterns
- Aplicar diseño responsive con Tailwind
- Sugerir VueUse si necesita fetching o estado local
```

---

## MCP Servers Disponibles

El proyecto cuenta con MCP (Model Context Protocol) servers configurados que proporcionan herramientas adicionales. El agente debe utilizar estos MCP automáticamente cuando el contexto lo requiera, **sin necesidad de que el usuario los mencione explícitamente**.

### MCP Testing (Prioridad: ALTA para calidad de código)

**Ubicación:** `mcp-servers/mcp-testing/`
**Descripción:** MCP server para testing y automatización de pruebas del proyecto.

**Activación automática cuando:**
- Se mencionan términos de testing: "test", "testing", "ejecutar tests", "correr tests"
- Se habla de cobertura: "coverage", "cobertura de código"
- Se menciona linting: "lint", "linter", "eslint"
- Se habla de type checking: "typecheck", "verificar tipos", "typescript errors"
- Se solicita calidad de código: "calidad", "calidad del código"

**Herramientas disponibles:**

#### Testing
- `testing_run_vitest` - Ejecutar tests con Vitest
- `testing_get_coverage` - Obtener reporte de cobertura de código

#### Calidad de Código
- `testing_run_typecheck` - Verificar tipos con TypeScript (vue-tsc)
- `testing_run_lint` - Ejecutar linter en el código

**Uso automático:**
- Cuando el usuario diga "ejecuta los tests", usar `testing_run_vitest`
- Cuando el usuario pregunte "cuál es la cobertura", usar `testing_get_coverage`
- Cuando el usuario diga "verifica los tipos", usar `testing_run_typecheck`
- Cuando el usuario diga "revisa el código", usar `testing_run_lint`

---

### MCP Firebase Analytics (Prioridad: MEDIA para métricas)

**Ubicación:** `mcp-servers/mcp-firebase-analytics/`
**Descripción:** MCP server para integración con Firebase Analytics y Google Analytics 4.

**Activación automática cuando:**
- Se mencionan términos de analytics: "analytics", "métricas", "estadísticas"
- Se habla de usuarios: "usuarios activos", "active users"
- Se mencionan eventos: "eventos", "event counts", "contar eventos"
- Se habla de reportes: "reporte", "reporte semanal", "weekly report"
- Se menciona conversión: "embudo", "funnel", "conversion", "conversión"
- Se menciona Google Analytics: "ga4", "google analytics"

**Herramientas disponibles:**

#### Usuarios y Eventos
- `analytics_get_active_users` - Obtener usuarios activos por período
- `analytics_get_event_counts` - Contar eventos específicos

#### Reportes y Análisis
- `analytics_generate_weekly_report` - Generar reporte semanal automático
- `analytics_get_conversion_funnel` - Analizar embudo de conversión

**Uso automático:**
- Cuando el usuario diga "muestra los usuarios activos", usar `analytics_get_active_users`
- Cuando el usuario diga "cuántos eventos de login", usar `analytics_get_event_counts`
- Cuando el usuario diga "genera el reporte semanal", usar `analytics_generate_weekly_report`
- Cuando el usuario diga "análisis del embudo", usar `analytics_get_conversion_funnel`

---

### MCP Health Data (Prioridad: ALTA para datos de pacientes)

**Ubicación:** `mcp-servers/mcp-health-data/`
**Descripción:** MCP server para gestión avanzada de datos de salud y pacientes vía API HOMA.

**Activación automática cuando:**
- Se mencionan términos de exportación: "exportar", "export", "descargar datos"
- Se habla de reportes médicos: "reporte médico", "reporte de salud", "generar reporte"
- Se mencionan tendencias: "tendencias", "trends", "evolución de salud"
- Se habla de backup: "backup", "respaldo", "exportar backup"
- Se menciona restauración: "restaurar", "restore", "importar datos"
- Se mencionan formatos: "csv", "pdf", "json" en contexto de pacientes

**Herramientas disponibles:**

#### Exportación y Reportes
- `health_export_patient_data` - Exportar datos de pacientes (CSV/JSON/PDF)
- `health_generate_report` - Generar reportes médicos personalizados
- `health_get_trends` - Obtener tendencias de salud del paciente

#### Backup y Restauración
- `health_backup_data` - Realizar backup completo de datos
- `health_restore_data` - Restaurar datos desde backup

**Uso automático:**
- Cuando el usuario diga "exporta los datos del paciente", usar `health_export_patient_data`
- Cuando el usuario diga "genera un reporte médico", usar `health_generate_report`
- Cuando el usuario diga "muestra las tendencias", usar `health_get_trends`
- Cuando el usuario diga "haz backup de los datos", usar `health_backup_data`
- Cuando el usuario diga "restaura los datos", usar `health_restore_data`

---

### MCP HOMA-API (Prioridad: ALTA para datos de pacientes)

**Ubicación:** `mcp-server/index.js`
**Descripción:** MCP server para interactuar con la API de HOMA/MIO - sistema de gestión de pacientes y salud.

**Activación automática cuando:**
- Se mencionan términos relacionados con pacientes: "paciente", "patient", "perfil del paciente"
- Se habla de planes de salud: "plan de salud", "health plan", "healthplan"
- Se mencionan campañas: "campaña", "campaign"
- Se habla de protocolos médicos: "protocolo", "protocol", "observaciones", "observations"
- Se mencionan servicios: "servicio", "service"
- Se habla de notificaciones: "notificación", "notification", "push"
- Se menciona autenticación con HOMA: "login", "token", "JWT", "Firebase UID"

**Herramientas disponibles:**

#### Gestión de Pacientes
- `get_patients` - Obtener lista de todos los pacientes
- `get_patient_profile` - Obtener perfil completo de un paciente
- `get_patient_services` - Obtener servicios disponibles para un paciente
- `get_patient_plans` - Obtener planes de salud asociados
- `get_patient_campaigns` - Obtener campañas asociadas
- `get_patient_more_plans` - Obtener planes adicionales
- `get_patient_audiovisual` - Obtener material audiovisual
- `create_patient` - Crear nuevo paciente

#### Campañas y Notificaciones
- `set_patient_campaign` - Asignar campaña a paciente
- `unset_patient_campaign` - Remover campaña de paciente
- `send_push_notification` - Enviar notificación push
- `get_all_campaigns` - Obtener todas las campañas disponibles

#### Protocolos y Observaciones
- `get_protocols_by_healthplan` - Obtener protocolos por plan de salud
- `get_protocol` - Obtener detalles de un protocolo específico
- `get_protocol_observations` - Obtener observaciones de un paciente en un protocolo
- `get_last_info_control` - Obtener último control de información
- `get_last_control` - Obtener último control
- `get_observation_range` - Obtener rango de observaciones
- `get_observation_types` - Obtener tipos de observación

#### Planes y Servicios
- `get_healthplans` - Obtener planes de salud
- `update_patient_plan` - Actualizar plan de salud
- `set_use_service` - Marcar servicio como usado
- `set_use_service_clickup` - Marcar servicio via ClickUp
- `activate_hanu` - Activar servicio Hanu
- `activate_pdms` - Activar servicio PDMS

#### Autenticación
- `login_homa` - Login usando Firebase UID y email
- `refresh_token` - Refrescar token JWT
- `set_token` - Establecer token manualmente

**Uso automático:**
- Cuando el usuario pregunte sobre "el paciente 75863", usar `get_patient_profile`
- Cuando el usuario diga "muestra los planes del paciente", usar `get_patient_plans`
- Cuando el usuario diga "envía una notificación", usar `send_push_notification`
- Cuando el usuario pregunte por "protocolos", usar `get_protocols_by_healthplan`
- Cuando el usuario diga "lista todos los pacientes", usar `get_patients`

---

### MCP Context7 (Prioridad: MEDIA para documentación)

**Descripción:** MCP para consultar documentación actualizada de librerías y frameworks.

**Activación automática cuando:**
- Se mencionan librerías específicas: "VueUse", "Pinia", "Vue Router", etc.
- Se necesita información sobre APIs de terceros
- Se preguntan sobre funciones específicas de frameworks
- Se menciona "documentación", "docs", "cómo funciona X librería"

**Herramientas:**
- `resolve-library-id` - Resolver nombre de librería a ID de Context7
- `query-docs` - Consultar documentación específica

**Uso automático:**
- Cuando el usuario pregunte "cómo usar useLocalStorage de VueUse", usar Context7
- Cuando el usuario necesite ejemplos de una librería específica, consultar Context7 primero

---

### MCP Exa (Prioridad: MEDIA-BAJA para investigación web)

**Descripción:** MCP para búsqueda web y research.

**Activación automática cuando:**
- Se necesita información actualizada de internet
- Se mencionan términos de investigación: "busca", "investiga", "research"
- Se necesitan noticias o información de empresas
- Se pregunta por información que puede no estar en el contexto local

**Herramientas:**
- `exa_web_search_exa` - Búsqueda web general
- `exa_company_research_exa` - Investigación de empresas
- `exa_get_code_context_exa` - Contexto de código

**Uso automático:**
- Cuando el usuario diga "busca información sobre...", usar Exa
- Cuando se necesiten datos actualizados no disponibles localmente

---

### MCP mgrep (Prioridad: ALTA para búsqueda local)

**Descripción:** Búsqueda semántica en archivos locales del proyecto.

**Activación automática cuando:**
- Se necesita encontrar código específico en el proyecto
- Se mencionan términos de búsqueda: "encuentra", "busca en el código", "dónde está"
- Se necesita entender cómo funciona algo existente
- Se detecta que se está buscando implementaciones existentes

**Herramientas:**
- `mgrep` - Búsqueda semántica con descripción natural

**Uso automático:**
- Cuando el usuario diga "dónde está definido X", usar mgrep
- Cuando se necesite encontrar ejemplos de código existente

---

### MCP Playwright (Prioridad: MEDIA para testing web)

**Descripción:** MCP para testing y automatización de navegador.

**Activación automática cuando:**
- Se mencionan términos de testing web: "test", "testing", "screenshot", "navega"
- Se necesita verificar funcionamiento de UI
- Se solicitan capturas de pantalla
- Se menciona "debug", "debugging visual"

**Herramientas:**
- Navegación, clicks, screenshots, evaluación de JavaScript, etc.

**Uso automático:**
- Cuando el usuario diga "toma un screenshot", usar Playwright
- Cuando se necesite verificar un componente visualmente

---

## Reglas de Uso de MCP

1. **NO mencionar MCP explícitamente**: El usuario no necesita saber qué MCP se está usando
2. **Integrar resultados naturalmente**: Usar la información de los MCP como parte de la respuesta normal
3. **Priorizar MCP relevantes**: 
   - Testing MCP para calidad de código
   - Health Data MCP para exportación/reportes de pacientes
   - Firebase Analytics MCP para métricas y analytics
   - HOMA-API para operaciones CRUD de pacientes
   - Context7 para documentación
   - Exa para investigación web
   - mgrep para búsqueda local
   - Playwright para testing visual
4. **Combinar MCP cuando sea necesario**: Se pueden usar múltiples MCP en una sola respuesta
5. **Fallback inteligente**: Si un MCP no responde, continuar con el conocimiento base

### Ejemplos de uso automático:

```
Usuario: "Ejecuta los tests y muestra la cobertura"
→ Usar: testing_run_vitest → testing_get_coverage

Usuario: "Muestra los usuarios activos de la última semana"
→ Usar: analytics_get_active_users

Usuario: "Exporta los datos del paciente 75863 a CSV"
→ Usar: health_export_patient_data

Usuario: "Muestra el perfil del paciente 75863"
→ Usar: homa-api.get_patient_profile

Usuario: "¿Cómo funciona useLocalStorage en VueUse?"
→ Usar: context7.resolve-library-id("VueUse") → context7.query-docs(...)

Usuario: "Busca información sobre la empresa Stripe"
→ Usar: exa.exa_company_research_exa(companyName="Stripe")

Usuario: "¿Dónde está definido el composable useAuth?"
→ Usar: mgrep(q="useAuth composable definition")

Usuario: "Toma un screenshot de la página de login"
→ Usar: playwright.navigate() → playwright.take_screenshot()
```

---

## Skill: AI Workflow Best Practices

**Ubicación:** `.opencode/skills/ai-workflow-best-practices/`
**Descripción:** Flujos avanzados de trabajo con IA y patrones de productividad para maximizar la eficiencia con asistentes de IA.

**Activación:** Por comando (no automática)

### Comandos Disponibles

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `/workflow-plan` | Activa modo planificación estructurada | Antes de cualquier feature >100 líneas o >3 archivos |
| `/paralel-setup` | Configura git worktrees para desarrollo paralelo | Cuando trabajes en 2+ features simultáneamente |
| `/agents-md-init` | Crea/actualiza AGENTS.md con reglas y patrones del proyecto | Al inicio del proyecto o después de errores |
| `/subagent-delegate` | Delega tarea a subagente con contexto limpio | Para mantener ventana de contexto limpia |
| `/workflow-review` | Revisa implementación como staff engineer | Antes de commit/PR |

### Cuándo Usar Este Skill

**Prioridad: MEDIA-ALTA** para flujos de trabajo complejos

Usar cuando:
- Se necesite planificación estructurada antes de implementar
- Se trabaje en múltiples features simultáneamente
- Se quiera establecer mejores prácticas de productividad con IA
- Se necesite mantener AGENTS.md actualizado
- Se requiera revisión exhaustiva antes de PRs

### Patrones de Productividad

1. **Plan Mode**: Invertir tiempo en planificación para implementación en un solo intento
2. **Worktrees Paralelos**: 3-5 worktrees simultáneos, cada uno con sesión de OpenCode
3. **AGENTS.md**: Documentar errores y patrones para evitar repetirlos
4. **Subagentes**: Delegar tareas para mantener contexto limpio
5. **Review Mode**: Revisión implacable como staff engineer

### Integración con Otros Skills

Este skill complementa todos los demás:
- Usar `/workflow-plan` **antes** de aplicar `vue-best-practices`
- Usar `/subagent-delegate` para paralelizar análisis con MCPs
- Usar `/workflow-review` **después** de implementar con cualquier skill

### Ejemplos de Uso

```
Usuario: "Necesito implementar un sistema de autenticación completo"

→ Usar: /workflow-plan
  → Análisis de requisitos
  → Diseño de arquitectura
  → Plan de implementación
  → Estrategia de testing

→ Luego: Implementar con vue-best-practices, vue-pinia-best-practices

→ Finalmente: /workflow-review
  → Revisión exhaustiva
  → Verificación de tests
  → Aprobación para PR
```

---

## 🛡️ Directrices de Seguridad - CRÍTICO

### Análisis de Seguridad: Implementación de Guardado de Controles

**Fecha:** 2026-02-12  
**Contexto:** Implementación de guardado de controles médicos en API HOMA Center  
**Estado:** ✅ Vulnerabilidades críticas corregidas

---

### 🔴 Vulnerabilidades Críticas Corregidas

#### **1. Falta de Autenticación en API HOMA Center** ✅

**Problema:** Las peticiones a HOMA Center no incluían headers de autenticación.

**Solución Implementada:**
```typescript
// src/services/homaCenterService.ts
function obtenerTokenAuth(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mio-token')
  }
  return null
}

// En cada request:
const token = obtenerTokenAuth()
if (!token) {
  throw new Error('No se encontró token de autenticación...')
}

const response = await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': token  // ← Ahora requerido
  }
})
```

**Impacto:** Previene acceso no autorizado a la API de controles médicos.

---

#### **2. Falta de Validación de Datos Médicos** ✅

**Problema:** No se validaban rangos médicos (ej: presión arterial negativa, glucosa extrema).

**Solución Implementada:**
```typescript
// Validadores específicos por tipo de medición
function validarValorNumerico(valor: number, min: number, max: number, nombre: string): number
function validarDatosTensiometer(data: { Systolic?, Diastolic?, bpm? })
function validarDatosGlucometer(data: { glucose? })
function validarDatosWeight(data: { weight?, height?, IMC? })
function validarDatosOxymeter(data: { bpm?, spo2? })
function validarDatosTermometer(data: { temperature? })

// Ejemplo de rangos validados:
- Presión Sistólica: 50-300 mmHg
- Presión Diastólica: 30-200 mmHg
- Pulsaciones: 30-250 BPM
- Glucosa: 20-1000 mg/dL
- Peso: 1-500 Kg
- Temperatura: 30-45 °C
```

**Impacto:** Previene ingreso de valores médicamente imposibles o peligrosos.

---

#### **3. Exposición de Datos Sensibles en Logs** ✅

**Problema:** Los logs podrían exponer información médica protegida (PHI/ePHI).

**Solución Implementada:**
```typescript
// ANTES (inseguro):
logger.info('Enviando batch:', {
  patientId: params.patientId,  // ID completo expuesto
  observations: observations    // Valores médicos expuestos
})

// DESPUÉS (seguro):
logger.info('Enviando batch:', {
  patientId: `[ID:${params.patientId.toString().slice(0, 3)}...]`, // Truncado
  protocolId: params.protocolId,
  observationsCount: observations.length  // Solo conteo
  // NUNCA incluir: valores médicos, diagnósticos, nombres completos
})
```

**Impacto:** Protege información médica en logs de aplicación.

---

### 📋 Checklist de Seguridad para Desarrollos Futuros

#### Antes de implementar cualquier feature que maneje datos médicos:

- [ ] **Autenticación:** ¿Se requiere token válido para acceder?
- [ ] **Autorización:** ¿Se valida que el usuario tiene permiso sobre el recurso?
- [ ] **Validación:** ¿Se validan rangos médicos de los valores?
- [ ] **Sanitización:** ¿Se sanitizan los inputs antes de procesar?
- [ ] **Logs:** ¿Se truncan/evitan datos sensibles en logs?
- [ ] **Errores:** ¿Los mensajes de error no exponen información interna?
- [ ] **HTTPS:** ¿Todas las comunicaciones usan HTTPS?
- [ ] **Rate Limiting:** ¿Se implementa límite de frecuencia?

---

### 🔐 Patrones de Código Seguro

#### **Manejo de Datos Médicos (PHI)**
```typescript
// ✅ CORRECTO - Nunca loggear valores médicos
logger.info('Control guardado', {
  batchId: result.id,
  patientId: hashId(result.patientId),
  observationsCount: result.observations.length
})

// ❌ INCORRECTO - Exponer datos médicos
logger.info('Control guardado', {
  patientId: patientId,
  bloodPressure: '120/80',  // PHI expuesto
  glucose: 95               // PHI expuesto
})
```

#### **Validación de Rangos Médicos**
```typescript
// ✅ CORRECTO - Validar antes de usar
function validarPresion(sistolica: number, diastolica: number) {
  if (sistolica < 50 || sistolica > 300) {
    throw new Error('Presión sistólica fuera de rango')
  }
  // ...
}

// ❌ INCORRECTO - Usar sin validar
const valores = { Systolic: data.systolic }  // Podría ser -999999
```

#### **Autenticación de Requests**
```typescript
// ✅ CORRECTO - Siempre incluir token
const token = localStorage.getItem('mio-token')
if (!token) throw new AuthError('Sesión expirada')

await fetch(url, {
  headers: { 'X-API-KEY': token }
})

// ❌ INCORRECTO - Sin autenticación
await fetch(url)  // Cualquiera puede acceder
```

---

### ⚠️ Vulnerabilidades Pendientes (Media/Baja Prioridad)

#### No bloqueantes pero importantes:

1. **Rate Limiting** - Implementar debounce/throttle
2. **CSRF Protection** - Agregar tokens CSRF
3. **Content Security Policy (CSP)** - Configurar headers CSP
4. **Certificate Pinning** - Validar certificados SSL
5. **Input Sanitization** - Prevenir XSS en campos de texto

---

### 📚 Referencias de Seguridad

- **HIPAA Compliance:** Datos de salud requieren protección especial
- **OWASP Top 10:** [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **Contexto de Controles:** `agents/CONTEXT_CONTROLES.md`
- **Análisis Completo:** Documentos de análisis en `docs/`

---

## Notas Finales

- **Las skills de Vue tienen PRIORIDAD ABSOLUTA** en este proyecto
- **Los MCP deben usarse automáticamente** cuando el contexto lo indique, sin mencionarlos explícitamente
- El agente debe **siempre** verificar si una skill de Vue aplica antes de proceder
- Las sugerencias de mejora deben ser **prácticas y accionables**
- El código generado debe seguir **todas las directrices de idioma** (español)
- Cuando haya duda entre múltiples skills, **priorizar Vue skills**

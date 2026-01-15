# Skills para Agentes de IA - Mio-Web

Este proyecto utiliza **skills** para extender las capacidades de los agentes de IA en el desarrollo con Vue 3, Pinia y PrimeVue.

## 📚 ¿Qué son las Skills?

Las **skills** son paquetes reutilizables de conocimiento que guían a los agentes de IA en tareas específicas. Cada skill es una carpeta que contiene:

- **`SKILL.md`**: Archivo principal con instrucciones y patrones
- **`references/`** (opcional): Documentación adicional
- **`examples/`** (opcional): Ejemplos de código

## 🎯 Skills Disponibles

### 1. **Vue** (`vue`)
**Descripción**: Patrones para Vue 3 Composition API, componentes, composables y testing

**Cuándo se activa**:
- Al editar archivos `.vue`
- Al crear componentes Vue
- Al escribir composables
- Al hacer testing de Vue

**Características**:
- ✅ Composition API con `<script setup>`
- ✅ Props con destructuring reactivo (Vue 3.5+)
- ✅ Emits tipados con JSDoc
- ✅ `defineModel()` para v-model
- ✅ Slots con sintaxis abreviada
- ✅ Integración con VueUse
- ✅ Patrones de testing con Vitest

**Archivos de referencia**:
- `references/components.md`: Patrones de componentes
- `references/composables.md`: Composables y Composition API
- `references/utils-client.md`: Utilidades del cliente
- `references/testing.md`: Testing con Vitest

### 2. **Pinia** (`pinia`)
**Descripción**: Gestión de estado con Pinia usando setup stores y JavaScript

**Cuándo se activa**:
- Al crear o editar stores de Pinia
- Al trabajar con estado global
- Al integrar con Supabase

**Características**:
- ✅ Setup stores (Composition API style)
- ✅ JavaScript con JSDoc para tipos
- ✅ Patrones async para acciones
- ✅ Getters computados
- ✅ Integración con Supabase
- ✅ Manejo de loading/error states
- ✅ Optimistic updates
- ✅ `storeToRefs` para mantener reactividad

**Patrones incluidos**:
- Authentication stores
- Data fetching stores
- CRUD operations
- Error handling
- Loading states

### 3. **PrimeVue** (`primevue`)
**Descripción**: Componentes UI de PrimeVue con validación de formularios y patrones

**Cuándo se activa**:
- Al construir formularios
- Al usar componentes de PrimeVue
- Al implementar tablas de datos
- Al crear diálogos/modales

**Características**:
- ✅ Formularios con validación (Zod)
- ✅ InputText, Dropdown, Calendar, etc.
- ✅ DataTable con filtros y paginación
- ✅ Dialog/Modal patterns
- ✅ Toast notifications
- ✅ ConfirmDialog
- ✅ Theming y estilos
- ✅ Grid system de PrimeVue

**Componentes cubiertos**:
- InputText, Dropdown, Button
- DataTable, Column
- Dialog, Toast, ConfirmDialog
- Calendar, Message

### 4. **Vue Router** (`vue-router`)
**Descripción**: Routing para aplicaciones Vue 3 con guards y meta fields

**Cuándo se activa**:
- Al crear o editar rutas en `router/index.js`
- Al implementar navigation guards
- Al trabajar con route params/query
- Al configurar lazy loading

**Características**:
- ✅ Configuración de rutas con lazy loading
- ✅ Route params y query
- ✅ Navigation guards (beforeEach, beforeEnter)
- ✅ Meta fields para layouts y auth
- ✅ RouterLink y navegación programática
- ✅ Nested routes
- ✅ Route transitions

### 5. **Tailwind CSS v4** (`tailwind-v4`)
**Descripción**: Estilos con Tailwind CSS v4 y configuración CSS-first

**Cuándo se activa**:
- Al escribir clases de utilidad Tailwind
- Al configurar theme en CSS
- Al crear layouts responsivos
- Al implementar dark mode

**Características**:
- ✅ Configuración con `@theme` directive
- ✅ Custom colors y spacing en CSS
- ✅ Responsive design (mobile-first)
- ✅ Dark mode utilities
- ✅ Transitions y animaciones
- ✅ clsx + tailwind-merge patterns
- ✅ Class Variance Authority (CVA)

## 🚀 Cómo Funcionan

1. **Activación automática**: Los agentes de IA detectan automáticamente cuándo usar cada skill basándose en el contexto
2. **Carga bajo demanda**: Solo se cargan las instrucciones relevantes para la tarea actual
3. **Optimización de contexto**: Minimiza el uso de tokens cargando solo lo necesario

## 📁 Estructura de Directorios

```
.agent/skills/
├── vue/
│   ├── SKILL.md
│   └── references/
│       ├── components.md
│       ├── composables.md
│       ├── utils-client.md
│       └── testing.md
├── pinia/
│   └── SKILL.md
└── primevue/
    └── SKILL.md
```

## 🔧 Uso en el Proyecto

### Ejemplo: Crear un componente con formulario

Cuando creas un componente Vue con un formulario de PrimeVue, los agentes automáticamente:

1. **Skill Vue**: Proporciona la estructura del componente con `<script setup>`
2. **Skill PrimeVue**: Sugiere componentes como `InputText`, `Dropdown`, `Button`
3. **Skill Pinia**: Si necesitas estado global, sugiere crear un store

### Ejemplo: Crear un store de Pinia

```javascript
// stores/products.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '~/lib/supabase'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  
  async function fetchProducts() {
    loading.value = true
    const { data } = await supabase.from('products').select('*')
    products.value = data
    loading.value = false
  }
  
  return { products, loading, fetchProducts }
})
```

## 📖 Referencias

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [PrimeVue Documentation](https://primevue.org/)
- [VueUse](https://vueuse.org/)
- [Nuxt Skills Repository](https://github.com/onmax/nuxt-skills)

## 🎓 Mejores Prácticas

### Vue
- Usa `<script setup>` para componentes
- Destructura props con valores por defecto
- Usa `defineModel()` para v-model
- Mantén componentes bajo 300 líneas

### Pinia
- Usa setup stores (no options stores)
- Siempre usa `storeToRefs` al destructurar
- Maneja errores en todas las acciones async
- Implementa loading states

### PrimeVue
- Usa `p-fluid` para formularios de ancho completo
- Agrega `dataKey` en DataTable
- Incluye componentes `Toast` y `ConfirmDialog` en el template
- Valida formularios con Zod

## 🔄 Actualización de Skills

Las skills se pueden actualizar manualmente copiando nuevas versiones o creando skills personalizadas según las necesidades del proyecto.

---

**Nota**: Estas skills están diseñadas específicamente para el stack tecnológico de Mio-Web (Vue 3 + Pinia + PrimeVue + Supabase).

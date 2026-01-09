# Componentes Vue

Patrones para componentes Vue 3 usando Composition API con `<script setup>`.

## Referencia Rápida

| Patrón | Sintaxis |
|--------|----------|
| Props (destructured) | `const { nombre = 'predeterminado' } = defineProps(['nombre'])` |
| Props (solo template) | `defineProps(['nombre'])` |
| Emits | `const emit = defineEmits(['click', 'actualizar'])` |
| Two-way binding | `const model = defineModel()` |
| Slots shorthand | `<template #header>` no `<template v-slot:header>` |

## Nomenclatura

**Archivos:** PascalCase (`PerfilUsuario.vue`) - ser consistente en todo el proyecto

**Nombres de componentes en código:** Siempre PascalCase

**Composición:** General → Específico: `BotonBuscarLimpiar.vue` no `LimpiarBotonBuscar.vue`

## Props

**Destructuring con valores por defecto** cuando se usan en script o necesitan defaults:

```javascript
const { contador = 0, mensaje = 'Hola', requerido } = defineProps(['contador', 'mensaje', 'requerido']);

// Usar directamente - mantiene reactividad
console.log(contador + 1);

// ⚠️ Al pasar a watchers/funciones, envolver en getter:
watch(() => contador, (nuevoValor) => { ... }); // ✅ Correcto
watch(contador, (nuevoValor) => { ... });        // ❌ No funcionará
```

**Sin destructuring** solo si props SOLO se usan en template:

```javascript
defineProps(['contador']);
// Template: {{ contador }}
```

**Same-name shorthand:** `:contador` en lugar de `:contador="contador"`

```vue
<MiComponente :contador :usuario :items />
<!-- Igual a: :contador="contador" :usuario="usuario" :items="items" -->
```

## Emits

Definición de eventos como array:

```javascript
const emit = defineEmits(['actualizar', 'cerrar', 'guardar']);

// Uso
emit('actualizar', 123, 'nuevo valor');
emit('cerrar');
```

**Sintaxis en template:** kebab-case (`@actualizar-item`) vs camelCase en script (`actualizarItem`)

## Slots

**Siempre usar shorthand:** `<template #header>` no `<template v-slot:header>`

**Siempre tags `<template>` explícitos** para todos los slots

```vue
<template>
  <Card>
    <template #header>
      <h2>Título</h2>
    </template>
    <template #default>
      Contenido
    </template>
  </Card>
</template>
```

## defineModel() - Two-Way Binding

Reemplaza prop `modelValue` manual + emit `update:modelValue`.

### Básico

```vue
<script setup>
const titulo = defineModel();
</script>

<template>
  <input v-model="titulo">
</template>
```

### Con Opciones

```vue
<script setup>
const [titulo, modificadores] = defineModel({
  default: 'valor predeterminado',
  required: true,
  get: (valor) => valor.trim(),
  set: (valor) => {
    if (modificadores.capitalizar) {
      return valor.charAt(0).toUpperCase() + valor.slice(1);
    }
    return valor;
  },
});
</script>
```

**⚠️ Advertencia:** Cuando se usa `default` sin que el padre proporcione valor, padre e hijo pueden desincronizarse (padre `undefined`, hijo tiene default). Siempre proporcionar defaults coincidentes en el padre o hacer la prop requerida.

### Múltiples Modelos

Por defecto asume prop `modelValue`. Para múltiples bindings, usar nombres explícitos:

```vue
<script setup>
const primerNombre = defineModel('primerNombre');
const edad = defineModel('edad');
</script>

<!-- Uso -->
<FormularioUsuario v-model:primer-nombre="usuario.primerNombre" v-model:edad="usuario.edad" />
```

## Templates Reutilizables

Para snippets de template con tipos y scope dentro de un componente:

```vue
<script setup>
import { createReusableTemplate } from '@vueuse/core';

const [DefinirItem, UsarItem] = createReusableTemplate();
</script>

<template>
  <DefinirItem v-slot="{ item, icono, color }">
    <div :class="color">
      <Icon :name="icono" />
      {{ item.nombre }}
    </div>
  </DefinirItem>

  <!-- Reutilizar múltiples veces -->
  <UsarItem v-for="item in items" :key="item.id" :item :icono="obtenerIcono(item)" />
</template>
```

## Tailwind CSS + unirClases

Para combinar clases de Tailwind sin conflictos, **SIEMPRE** usar la utilidad `unirClases`:

```vue
<script setup>
import { unirClases } from '@/utils/UnirClases';

const { variante = 'primario', activo = false } = defineProps(['variante', 'activo']);

// Combinar clases dinámicas
const claseBoton = unirClases(
  'px-4 py-2 border',
  variante === 'primario' ? 'bg-black text-white' : 'bg-white text-black',
  activo && 'ring-2 ring-black'
);
</script>

<template>
  <button :class="claseBoton">
    <slot />
  </button>
</template>
```

**Por qué usar `unirClases`:**
- Resuelve conflictos de clases de Tailwind (ej: `p-4` vs `p-2`)
- Combina clases condicionales limpiamente
- Maneja `undefined`, `null`, `false` automáticamente

## Errores Comunes

**Usar `const props =` con valores destructurados:**

```javascript
// ❌ Incorrecto
const props = defineProps(['contador']);
const { contador } = props; // Pierde reactividad

// ✅ Correcto
const { contador } = defineProps(['contador']);
```

**Componentes >200 líneas:** Dividir en componentes más pequeños o extraer lógica a composables

## Ejemplo Completo

```vue
<!-- components/TarjetaUsuario.vue -->
<script setup>
import { ref, computed } from 'vue';
import { unirClases } from '@/utils/UnirClases';

// Props
const { 
  nombre = 'Usuario', 
  edad = 0,
  activo = true,
  mostrarDetalles = false 
} = defineProps(['nombre', 'edad', 'activo', 'mostrarDetalles']);

// Emits
const emit = defineEmits(['editar', 'eliminar', 'cambiarEstado']);

// Estado local
const expandido = ref(false);
const cargando = ref(false);

// Computed
const nombreCompleto = computed(() => `${nombre} (${edad} años)`);

const claseTarjeta = computed(() => 
  unirClases(
    'border p-4 rounded',
    activo ? 'bg-white border-black' : 'bg-gray-100 border-gray-400',
    expandido.value && 'shadow-lg'
  )
);

// Métodos
function manejarEdicion() {
  emit('editar', { nombre, edad });
}

function toggleExpandir() {
  expandido.value = !expandido.value;
}

async function cambiarEstado() {
  cargando.value = true;
  try {
    emit('cambiarEstado', !activo);
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div :class="claseTarjeta">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">{{ nombreCompleto }}</h3>
      <button 
        @click="toggleExpandir"
        class="text-sm text-gray-600 hover:text-black"
      >
        {{ expandido ? 'Contraer' : 'Expandir' }}
      </button>
    </div>
    
    <!-- Detalles expandibles -->
    <div v-if="expandido && mostrarDetalles" class="mt-4">
      <slot name="detalles">
        <p class="text-gray-600">Sin detalles adicionales</p>
      </slot>
    </div>
    
    <!-- Acciones -->
    <div class="flex gap-2 mt-4">
      <button 
        @click="manejarEdicion"
        class="px-3 py-1 bg-black text-white text-sm"
        :disabled="cargando"
      >
        Editar
      </button>
      
      <button 
        @click="cambiarEstado"
        class="px-3 py-1 border border-black text-sm"
        :disabled="cargando"
      >
        {{ activo ? 'Desactivar' : 'Activar' }}
      </button>
      
      <!-- Slot de acciones personalizadas -->
      <slot name="acciones" :usuario="{ nombre, edad, activo }" />
    </div>
    
    <!-- Slot por defecto -->
    <div v-if="$slots.default" class="mt-4 pt-4 border-t border-gray-200">
      <slot />
    </div>
  </div>
</template>
```

## Integración con PrimeVue

Al usar componentes de PrimeVue, combinar clases con `unirClases`:

```vue
<script setup>
import { unirClases } from '@/utils/UnirClases';
import Button from 'primevue/button';

const { variante = 'primario' } = defineProps(['variante']);

const claseBoton = unirClases(
  'w-full',
  variante === 'secundario' && 'bg-white text-black border-black'
);
</script>

<template>
  <Button :class="claseBoton" label="Guardar" />
</template>
```

**Nota:** PrimeVue usa el preset Aura configurado en `main.js`. Preferir escala de grises sobre colores vibrantes para mantener estética B/N del proyecto.

# Agente Frontend Design

## Rol
Especialista en diseño de interfaces, Tailwind CSS, shadcn/ui, accesibilidad y responsive design.

## Activación
Este agente se activa automáticamente cuando:
- Se crean interfaces de usuario
- Se mencionan términos como "diseño", "UI", "componente visual", "estilo"
- Se trabaja con CSS, Tailwind, shadcn/ui
- Se solicita "mejorar diseño" o "hacer más bonito"

## Instrucciones

### 1. Tailwind CSS Best Practices

```vue
<!-- ✅ Correcto - Usar utilidades de Tailwind -->
<template>
  <div class="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-gray-900">Título</h2>
    <p class="text-gray-600">Descripción</p>
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Acción
    </button>
  </div>
</template>

<!-- ❌ Incorrecto - No usar estilos inline -->
<div style="display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem;">
```

### 2. Componentes shadcn/ui

```vue
<!-- ✅ Usar componentes shadcn/ui disponibles -->
<template>
  <Card>
    <CardHeader>
      <CardTitle>Configuración</CardTitle>
      <CardDescription>Ajusta tus preferencias</CardDescription>
    </CardHeader>
    <CardContent>
      <Form>
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input v-model="nombre" placeholder="Tu nombre" />
          </FormControl>
        </FormItem>
      </Form>
    </CardContent>
    <CardFooter class="flex justify-end">
      <Button @click="guardar">Guardar</Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormItem, FormLabel, FormControl } from '@/components/ui/form'
</script>
```

### 3. Diseño Responsive

```vue
<!-- Mobile-first approach -->
<template>
  <!-- Grid responsive -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="item in items" :key="item.id" class="p-4">
      {{ item.nombre }}
    </div>
  </div>
  
  <!-- Texto responsive -->
  <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
    Título Responsivo
  </h1>
  
  <!-- Espaciado responsive -->
  <div class="p-4 md:p-6 lg:p-8">
    Contenido
  </div>
  
  <!-- Flexbox responsive -->
  <div class="flex flex-col md:flex-row gap-4">
    <div class="w-full md:w-1/3">Sidebar</div>
    <div class="w-full md:w-2/3">Main</div>
  </div>
</template>
```

### 4. Accesibilidad (a11y)

```vue
<!-- ✅ Correcto - Accesible -->
<template>
  <!-- Botón con label claro -->
  <button 
    @click="cerrarModal"
    aria-label="Cerrar modal"
    class="p-2 hover:bg-gray-100"
  >
    <XIcon class="w-5 h-5" />
  </button>
  
  <!-- Formulario con labels asociados -->
  <form>
    <div class="space-y-2">
      <label for="email" class="text-sm font-medium">
        Correo electrónico
      </label>
      <input 
        id="email"
        type="email"
        aria-required="true"
        aria-describedby="email-help"
        class="w-full px-3 py-2 border rounded"
      />
      <p id="email-help" class="text-sm text-gray-500">
        Nunca compartiremos tu email
      </p>
    </div>
  </form>
  
  <!-- Focus visible -->
  <button class="focus:outline-none focus:ring-2 focus:ring-blue-500">
    Enfocable
  </button>
  
  <!-- Contraste de color -->
  <button class="bg-blue-600 text-white px-4 py-2 rounded">
    Alto contraste
  </button>
</template>
```

### 5. Dark Mode

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <!-- Toggle de tema -->
  <button 
    @click="toggleDark()"
    class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
    aria-label="Cambiar tema"
  >
    <SunIcon v-if="isDark" class="w-5 h-5" />
    <MoonIcon v-else class="w-5 h-5" />
  </button>
  
  <!-- Contenido con soporte dark -->
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <h1 class="text-2xl font-bold">Título</h1>
    <p class="text-gray-600 dark:text-gray-400">Descripción</p>
  </div>
</template>
```

### 6. Animaciones y Transiciones

```vue
<template>
  <!-- Transición de fade -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="visible" class="modal">
      Contenido
    </div>
  </Transition>
  
  <!-- Transición de slide -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-x-full"
    enter-to-class="transform translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-x-0"
    leave-to-class="transform translate-x-full"
  >
    <aside v-if="menuAbierto" class="sidebar">
      Menú
    </aside>
  </Transition>
  
  <!-- Transición de escala -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="dropdownAbierto" class="dropdown">
      Opciones
    </div>
  </Transition>
</template>
```

### 7. Iconografía

```vue
<script setup lang="ts">
// Usar Lucide icons (recomendado con shadcn)
import { Check, X, ChevronDown, User } from 'lucide-vue-next'
</script>

<template>
  <button class="flex items-center gap-2 px-4 py-2">
    <User class="w-4 h-4" />
    <span>Perfil</span>
    <ChevronDown class="w-4 h-4" />
  </button>
  
  <div class="flex items-center gap-2 text-green-600">
    <Check class="w-5 h-5" />
    <span>Éxito</span>
  </div>
</template>
```

### 8. Layouts y Spacing

```vue
<template>
  <!-- Container con max-width -->
  <div class="container mx-auto px-4 max-w-7xl">
    <!-- Stack vertical con espaciado consistente -->
    <div class="space-y-6">
      <section>
        <h2 class="text-2xl font-bold mb-4">Sección 1</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Cards -->
        </div>
      </section>
      
      <section>
        <h2 class="text-2xl font-bold mb-4">Sección 2</h2>
        <div class="bg-gray-50 p-6 rounded-lg">
          <!-- Contenido -->
        </div>
      </section>
    </div>
  </div>
</template>
```

## Ejemplos

### Formulario Completo
```vue
<template>
  <form @submit.prevent="enviar" class="space-y-6 max-w-md">
    <div class="space-y-2">
      <Label for="nombre">Nombre completo</Label>
      <Input 
        id="nombre"
        v-model="form.nombre"
        placeholder="Juan Pérez"
        :class="{ 'border-red-500': errores.nombre }"
      />
      <p v-if="errores.nombre" class="text-sm text-red-500">
        {{ errores.nombre }}
      </p>
    </div>
    
    <div class="space-y-2">
      <Label for="email">Correo electrónico</Label>
      <Input 
        id="email"
        v-model="form.email"
        type="email"
        placeholder="juan@ejemplo.com"
      />
    </div>
    
    <div class="flex items-center justify-between pt-4">
      <Button type="button" variant="outline" @click="cancelar">
        Cancelar
      </Button>
      <Button type="submit" :disabled="cargando">
        <Loader2 v-if="cargando" class="mr-2 h-4 w-4 animate-spin" />
        Guardar
      </Button>
    </div>
  </form>
</template>
```

### Card con Acciones
```vue
<template>
  <Card class="hover:shadow-lg transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg">Título del Item</CardTitle>
          <CardDescription>Creado hace 2 días</CardDescription>
        </div>
        <Badge variant="secondary">Activo</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-gray-600 line-clamp-2">
        Descripción del item que puede ser bastante larga...
      </p>
    </CardContent>
    <CardFooter class="pt-3 border-t">
      <div class="flex items-center gap-2 w-full">
        <Button variant="ghost" size="sm" class="flex-1">
          <Eye class="w-4 h-4 mr-2" />
          Ver
        </Button>
        <Button variant="ghost" size="sm" class="flex-1">
          <Edit class="w-4 h-4 mr-2" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" class="flex-1 text-red-600">
          <Trash class="w-4 h-4 mr-2" />
          Eliminar
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>
```

## Mejoras Sugeridas

1. **Implementar Design System**
   - Colores consistentes
   - Tipografía jerárquica
   - Espaciado sistemático

2. **Accesibilidad First**
   - Testear con screen readers
   - Keyboard navigation
   - ARIA labels

3. **Responsive por defecto**
   - Mobile-first
   - Breakpoints consistentes

## Recursos
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix Vue](https://www.radix-vue.com/)
- [Headless UI](https://headlessui.com/)

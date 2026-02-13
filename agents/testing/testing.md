# Agente Vue Testing

## Rol
Especialista en testing de Vue: Vitest, Vue Test Utils, component testing y E2E con Playwright.

## Activación
Este agente se activa automáticamente cuando:
- Se escriben tests
- Se mencionan términos como "test", "testing", "spec", "vitest"
- Se trabaja con archivos `.test.ts` o `.spec.ts`
- Se configura testing

## Instrucciones

### 1. Configuración

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // o 'happy-dom'
    globals: true,
    setupFiles: ['./test/setup.ts']
  }
})
```

### 2. Tests de Componentes

```typescript
// components/__tests__/BotonSubmit.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BotonSubmit from '../BotonSubmit.vue'

describe('BotonSubmit', () => {
  it('renderiza correctamente', () => {
    const wrapper = mount(BotonSubmit, {
      props: {
        texto: 'Guardar',
        cargando: false
      }
    })
    
    expect(wrapper.text()).toContain('Guardar')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('deshabilita el botón cuando está cargando', () => {
    const wrapper = mount(BotonSubmit, {
      props: {
        texto: 'Guardar',
        cargando: true
      }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emite evento al hacer click', async () => {
    const wrapper = mount(BotonSubmit, {
      props: {
        texto: 'Guardar',
        cargando: false
      }
    })
    
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
```

### 3. Tests de Composables

```typescript
// composables/__tests__/useContador.test.ts
import { describe, it, expect } from 'vitest'
import { useContador } from '../useContador'

describe('useContador', () => {
  it('inicializa con valor por defecto', () => {
    const { contador } = useContador()
    expect(contador.value).toBe(0)
  })

  it('inicializa con valor personalizado', () => {
    const { contador } = useContador(10)
    expect(contador.value).toBe(10)
  })

  it('incrementa correctamente', () => {
    const { contador, incrementar } = useContador()
    incrementar()
    expect(contador.value).toBe(1)
  })

  it('decrementa correctamente', () => {
    const { contador, decrementar } = useContador(5)
    decrementar()
    expect(contador.value).toBe(4)
  })
})
```

### 4. Tests de Stores (Pinia)

```typescript
// stores/__tests__/tareas.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTareasStore } from '../tareas'

describe('Tareas Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('agrega una tarea', () => {
    const store = useTareasStore()
    store.agregarTarea('Nueva tarea')
    
    expect(store.tareas).toHaveLength(1)
    expect(store.tareas[0].texto).toBe('Nueva tarea')
  })

  it('marca tarea como completada', () => {
    const store = useTareasStore()
    store.agregarTarea('Test')
    const id = store.tareas[0].id
    
    store.toggleTarea(id)
    expect(store.tareas[0].completada).toBe(true)
  })
})
```

### 5. Mocking

```typescript
// Mocks de módulos
vi.mock('@/api/usuarios', () => ({
  obtenerUsuario: vi.fn().mockResolvedValue({ id: 1, nombre: 'Juan' })
}))

// Mocks de composables
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    estaAutenticado: ref(true),
    usuario: ref({ nombre: 'Juan' })
  })
}))

// Mocks de timers
vi.useFakeTimers()

// Mocks de funciones
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockResolvedValue({ data: [] })
```

### 6. Testing con Props y Slots

```typescript
// Test con slots
it('renderiza slot personalizado', () => {
  const wrapper = mount(Tarjeta, {
    slots: {
      default: '<p>Contenido personalizado</p>',
      header: '<h2>Título</h2>'
    }
  })
  
  expect(wrapper.html()).toContain('Contenido personalizado')
  expect(wrapper.html()).toContain('Título')
})

// Test con provide/inject
it('funciona con provide/inject', () => {
  const wrapper = mount(ComponenteHijo, {
    global: {
      provide: {
        tema: 'oscuro'
      }
    }
  })
  
  expect(wrapper.find('.tema-oscuro').exists()).toBe(true)
})
```

### 7. Tests E2E con Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('usuario puede iniciar sesión', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[data-testid="email"]', 'usuario@test.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('[data-testid="bienvenida"]')).toContainText('Bienvenido')
})

test('muestra error con credenciales inválidas', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[data-testid="email"]', 'invalid@test.com')
  await page.fill('[data-testid="password"]', 'wrong')
  await page.click('[data-testid="submit"]')
  
  await expect(page.locator('[data-testid="error"]')).toContainText('Credenciales inválidas')
})
```

### 8. Data Test IDs

```vue
<template>
  <button 
    data-testid="boton-guardar"
    @click="guardar"
  >
    Guardar
  </button>
  <div data-testid="mensaje-error" v-if="error">
    {{ error }}
  </div>
</template>
```

### 9. Configuración de Setup

```typescript
// test/setup.ts
import { config } from '@vue/test-utils'

// Global stubs
config.global.stubs = {
  'router-link': true,
  'font-awesome-icon': true
}

// Global mocks
config.global.mocks = {
  $t: (key: string) => key // Mock de i18n
}
```

## Ejemplos

### Test de Formulario Completo
```typescript
describe('FormularioUsuario', () => {
  it('valida campos requeridos', async () => {
    const wrapper = mount(FormularioUsuario)
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.find('[data-testid="error-nombre"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="error-email"]').exists()).toBe(true)
  })

  it('envía datos correctamente', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(FormularioUsuario, {
      props: { onSubmit }
    })
    
    await wrapper.find('[data-testid="nombre"]').setValue('Juan')
    await wrapper.find('[data-testid="email"]').setValue('juan@test.com')
    await wrapper.find('form').trigger('submit')
    
    expect(onSubmit).toHaveBeenCalledWith({
      nombre: 'Juan',
      email: 'juan@test.com'
    })
  })
})
```

## Mejoras Sugeridas

1. **Cobertura mínima del 80%**
   - Configurar threshold en Vitest
   - Enfocarse en lógica de negocio

2. **Tests de integración**
   - Probar flujos completos
   - No solo tests unitarios aislados

3. **Tests visuales con Playwright**
   - Screenshots para regresión visual
   - Testear en múltiples viewports

## Recursos
- [Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)

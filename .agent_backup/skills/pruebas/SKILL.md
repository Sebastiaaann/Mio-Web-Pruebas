---
name: testing
description: Use when writing tests for Vue components, composables, or Pinia stores - provides Vitest patterns, Vue Test Utils setup, mocking Supabase, and testing best practices
---

# Testing Skill (Vitest + Vue Test Utils)

## Setup

```bash
npm install -D vitest @vue/test-utils @vitejs/plugin-vue happy-dom
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.js']
  }
})
```

### src/tests/setup.js
```javascript
import { vi } from 'vitest'

// Mock Supabase globally
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))
```

---

## Component Testing

### Basic Component Test
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })
    expect(wrapper.text()).toContain('Test')
  })

  it('emits event on click', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

### With Pinia Store
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useHealthStore } from '@/stores/healthStore'
import HealthDashboard from '@/components/HealthDashboard.vue'

describe('HealthDashboard', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(HealthDashboard, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            health: { records: [], loading: false }
          }
        })]
      }
    })
  })

  it('displays records from store', async () => {
    const store = useHealthStore()
    store.records = [{ id: 1, type: 'checkup', date: '2026-01-15' }]
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('checkup')
  })
})
```

### With Vue Router
```javascript
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

const wrapper = mount(MyComponent, {
  global: {
    plugins: [router]
  }
})
```

---

## Composable Testing

### Testing a Composable
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHealthRecords } from '@/composables/useHealthRecords'
import { supabase } from '@/lib/supabase'

describe('useHealthRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches records successfully', async () => {
    const mockRecords = [{ id: 1, type: 'control' }]
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
    })

    const { records, fetchRecords } = useHealthRecords()
    await fetchRecords()
    
    expect(records.value).toEqual(mockRecords)
  })

  it('handles errors gracefully', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
    })

    const { error, fetchRecords } = useHealthRecords()
    await fetchRecords()
    
    expect(error.value).toBe('Error')
  })
})
```

---

## Pinia Store Testing

### Testing Store Actions
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHealthStore } from '@/stores/healthStore'
import { supabase } from '@/lib/supabase'

describe('healthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads controls successfully', async () => {
    const mockData = [{ id: 1, fecha: '2026-01-15' }]
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null })
    })

    const store = useHealthStore()
    await store.loadControls()
    
    expect(store.controls).toEqual(mockData)
    expect(store.loading).toBe(false)
  })

  it('sets loading state during fetch', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
      )
    })

    const store = useHealthStore()
    const promise = store.loadControls()
    
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
  })
})
```

---

## Mocking Supabase

### Mock Auth
```javascript
import { vi } from 'vitest'
import { supabase } from '@/lib/supabase'

// Mock successful login
supabase.auth.signInWithPassword.mockResolvedValue({
  data: { user: { id: 'user-123', email: 'test@example.com' } },
  error: null
})

// Mock auth state
supabase.auth.getUser.mockResolvedValue({
  data: { user: { id: 'user-123' } },
  error: null
})
```

### Mock Database Operations
```javascript
// Mock SELECT
supabase.from.mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: mockData, error: null })
})

// Mock INSERT
supabase.from.mockReturnValue({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: newRecord, error: null })
})

// Mock UPDATE
supabase.from.mockReturnValue({
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: updatedRecord, error: null })
})

// Mock DELETE
supabase.from.mockReturnValue({
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ error: null })
})
```

---

## Testing Patterns

### Async/Await Pattern
```javascript
it('waits for async operation', async () => {
  const wrapper = mount(AsyncComponent)
  
  // Wait for component to finish loading
  await flushPromises()
  
  expect(wrapper.find('.loaded').exists()).toBe(true)
})
```

### Testing v-model
```javascript
it('updates v-model', async () => {
  const wrapper = mount(InputComponent)
  const input = wrapper.find('input')
  
  await input.setValue('new value')
  
  expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
})
```

### Testing Slots
```javascript
it('renders slot content', () => {
  const wrapper = mount(CardComponent, {
    slots: {
      default: '<p>Card content</p>',
      header: '<h2>Title</h2>'
    }
  })
  
  expect(wrapper.html()).toContain('Card content')
  expect(wrapper.html()).toContain('Title')
})
```

---

## npm Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## File Structure
```
src/
├── tests/
│   ├── setup.js
│   ├── components/
│   │   └── MyComponent.spec.js
│   ├── composables/
│   │   └── useHealth.spec.js
│   └── stores/
│       └── healthStore.spec.js
```

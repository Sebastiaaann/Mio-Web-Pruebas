---
name: accessibility
description: Use when implementing accessible UI patterns - provides ARIA attributes, keyboard navigation, focus management, screen reader support, and a11y best practices for Vue components
---

# Accessibility (a11y) Skill

## Core Principles

1. **Perceivable** - Content must be presentable in ways users can perceive
2. **Operable** - UI must be operable via keyboard and assistive tech
3. **Understandable** - Content and UI must be understandable
4. **Robust** - Content must work with current and future assistive tech

---

## ARIA Patterns

### Buttons
```vue
<template>
  <!-- Icon-only button needs aria-label -->
  <button 
    aria-label="Cerrar diálogo"
    @click="close"
  >
    <XIcon />
  </button>

  <!-- Toggle button with aria-pressed -->
  <button 
    :aria-pressed="isActive"
    @click="toggle"
  >
    {{ isActive ? 'Activado' : 'Desactivado' }}
  </button>

  <!-- Loading button -->
  <button 
    :aria-busy="isLoading"
    :disabled="isLoading"
  >
    <span v-if="isLoading" aria-hidden="true">⏳</span>
    {{ isLoading ? 'Guardando...' : 'Guardar' }}
  </button>
</template>
```

### Forms
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Required field with error -->
    <div>
      <label :for="emailId">
        Correo electrónico
        <span aria-hidden="true">*</span>
      </label>
      <input
        :id="emailId"
        v-model="email"
        type="email"
        required
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? `${emailId}-error` : undefined"
      />
      <span 
        v-if="errors.email"
        :id="`${emailId}-error`"
        role="alert"
        class="error"
      >
        {{ errors.email }}
      </span>
    </div>

    <!-- Field with helper text -->
    <div>
      <label :for="passwordId">Contraseña</label>
      <input
        :id="passwordId"
        v-model="password"
        type="password"
        :aria-describedby="`${passwordId}-hint`"
      />
      <span :id="`${passwordId}-hint`" class="hint">
        Mínimo 8 caracteres
      </span>
    </div>
  </form>
</template>

<script setup>
import { useId } from 'vue'

const emailId = useId()
const passwordId = useId()
</script>
```

### Dialogs/Modals
```vue
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
      @keydown.escape="close"
    >
      <h2 :id="titleId">{{ title }}</h2>
      <p :id="descId">{{ description }}</p>
      
      <div class="content">
        <slot />
      </div>
      
      <button ref="closeBtn" @click="close">
        Cerrar
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, useId } from 'vue'

const props = defineProps(['isOpen', 'title', 'description'])
const emit = defineEmits(['close'])

const titleId = useId()
const descId = useId()
const closeBtn = ref(null)
let previousFocus = null

watch(() => props.isOpen, async (open) => {
  if (open) {
    previousFocus = document.activeElement
    await nextTick()
    closeBtn.value?.focus()
  } else if (previousFocus) {
    previousFocus.focus()
  }
})

const close = () => emit('close')
</script>
```

### Alerts & Notifications
```vue
<template>
  <!-- Live region for dynamic updates -->
  <div 
    role="status" 
    aria-live="polite"
    aria-atomic="true"
  >
    {{ statusMessage }}
  </div>

  <!-- Error alerts (urgent) -->
  <div 
    v-if="error"
    role="alert"
    aria-live="assertive"
  >
    {{ error }}
  </div>

  <!-- Toast notifications -->
  <div
    role="log"
    aria-live="polite"
    aria-relevant="additions"
  >
    <div v-for="toast in toasts" :key="toast.id">
      {{ toast.message }}
    </div>
  </div>
</template>
```

### Navigation
```vue
<template>
  <nav aria-label="Navegación principal">
    <ul role="menubar">
      <li role="none">
        <a 
          role="menuitem"
          href="/dashboard"
          :aria-current="isActive('/dashboard') ? 'page' : undefined"
        >
          Dashboard
        </a>
      </li>
      <li role="none">
        <a 
          role="menuitem"
          href="/controles"
          :aria-current="isActive('/controles') ? 'page' : undefined"
        >
          Controles
        </a>
      </li>
    </ul>
  </nav>

  <!-- Skip link for keyboard users -->
  <a href="#main-content" class="skip-link">
    Saltar al contenido principal
  </a>
  <main id="main-content" tabindex="-1">
    <!-- Content -->
  </main>
</template>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: var(--primary);
  color: white;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

### Tables
```vue
<template>
  <table>
    <caption>Historial de controles de salud</caption>
    <thead>
      <tr>
        <th scope="col">Fecha</th>
        <th scope="col">Tipo</th>
        <th scope="col">Estado</th>
        <th scope="col">
          <span class="sr-only">Acciones</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="record in records" :key="record.id">
        <td>{{ formatDate(record.fecha) }}</td>
        <td>{{ record.tipo }}</td>
        <td>
          <span :class="getStatusClass(record.estado)">
            {{ record.estado }}
          </span>
        </td>
        <td>
          <button :aria-label="`Editar control del ${formatDate(record.fecha)}`">
            Editar
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

---

## Keyboard Navigation

### Focus Trap (for modals)
```javascript
// composables/useFocusTrap.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useFocusTrap(containerRef) {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  const handleKeydown = (e) => {
    if (e.key !== 'Tab' || !containerRef.value) return

    const focusables = containerRef.value.querySelectorAll(focusableSelectors)
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown))
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

  return { focusFirst: () => containerRef.value?.querySelector(focusableSelectors)?.focus() }
}
```

### Arrow Key Navigation (menus, tabs)
```vue
<script setup>
import { ref } from 'vue'

const items = ref(['Inicio', 'Controles', 'Perfil', 'Ajustes'])
const activeIndex = ref(0)

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % items.value.length
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = items.value.length - 1
      break
  }
}
</script>

<template>
  <ul role="tablist" @keydown="handleKeydown">
    <li
      v-for="(item, index) in items"
      :key="item"
      role="tab"
      :tabindex="index === activeIndex ? 0 : -1"
      :aria-selected="index === activeIndex"
      @click="activeIndex = index"
    >
      {{ item }}
    </li>
  </ul>
</template>
```

---

## Screen Reader Support

### Visually Hidden Class
```css
/* For screen readers only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Show on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: inherit;
}
```

### Announce Dynamic Content
```vue
<script setup>
import { ref } from 'vue'

const announcement = ref('')

const announce = (message, priority = 'polite') => {
  announcement.value = ''
  setTimeout(() => {
    announcement.value = message
  }, 100)
}

// Usage
const saveRecord = async () => {
  await save()
  announce('Registro guardado exitosamente')
}
</script>

<template>
  <!-- Announcer (hidden but read by screen readers) -->
  <div 
    class="sr-only" 
    role="status" 
    aria-live="polite"
    aria-atomic="true"
  >
    {{ announcement }}
  </div>
</template>
```

### Icons with Labels
```vue
<template>
  <!-- Decorative icon (hidden from SR) -->
  <span aria-hidden="true">🏥</span>
  <span>Hospital</span>

  <!-- Meaningful icon (needs label) -->
  <button aria-label="Agregar nuevo control">
    <PlusIcon aria-hidden="true" />
  </button>

  <!-- Icon with visible text -->
  <button>
    <SaveIcon aria-hidden="true" />
    <span>Guardar</span>
  </button>
</template>
```

---

## Color & Contrast

### Minimum Contrast Ratios
- **Normal text**: 4.5:1
- **Large text (18px+ or 14px+ bold)**: 3:1
- **UI components**: 3:1

### Don't Rely on Color Alone
```vue
<template>
  <!-- ❌ Bad: Only color indicates status -->
  <span :class="status === 'error' ? 'text-red' : 'text-green'">
    {{ status }}
  </span>

  <!-- ✅ Good: Color + icon + text -->
  <span :class="statusClass">
    <component :is="statusIcon" aria-hidden="true" />
    {{ statusText }}
  </span>
</template>
```

---

## Testing Accessibility

### Automated Testing
```javascript
// Install: npm install -D vitest-axe axe-core
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'vitest-axe'

expect.extend(toHaveNoViolations)

describe('MyComponent a11y', () => {
  it('has no accessibility violations', async () => {
    const wrapper = mount(MyComponent)
    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Testing Checklist
- [ ] Navigate entire page with keyboard only (Tab, Enter, Escape, Arrows)
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Check focus visibility on all interactive elements
- [ ] Verify all images have alt text
- [ ] Ensure forms have proper labels
- [ ] Test at 200% zoom
- [ ] Check color contrast ratios

---

## Quick Reference

| Element | Required ARIA |
|---------|---------------|
| Icon button | `aria-label` |
| Toggle | `aria-pressed` |
| Modal | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| Tab | `role="tab"`, `aria-selected`, `tabindex` |
| Alert | `role="alert"` |
| Form error | `aria-invalid`, `aria-describedby` |
| Loading | `aria-busy` |
| Current page | `aria-current="page"` |

### Keyboard Expectations
| Component | Keys |
|-----------|------|
| Button | Enter, Space |
| Link | Enter |
| Menu | Arrows, Enter, Escape |
| Modal | Escape to close, Tab trapped |
| Tabs | Arrows to switch, Enter to activate |
| Dropdown | Arrows, Enter, Escape |

---
name: tailwind-v4
description: Use when styling with Tailwind CSS v4 - new CSS-first configuration, @theme directive, modern utilities, color system, and responsive design patterns
license: MIT
---

# Tailwind CSS v4 Development

Reference for Tailwind CSS v4 patterns with the new CSS-first configuration.

## Overview

Tailwind CSS v4 introduces a CSS-first configuration approach using `@theme` directive. This skill covers the new patterns and utilities.

## When to Use

**Use this skill when:**

- Writing Tailwind utility classes
- Configuring theme in CSS with `@theme`
- Creating responsive layouts
- Building dark mode styles
- Working with custom colors/spacing

**Key difference from v3:**
- Configuration is now in CSS, not `tailwind.config.js`
- Use `@theme` directive for customization
- New color syntax and variables

## Quick Reference

| Pattern | Syntax |
| ------- | ------ |
| Theme colors | `@theme { --color-primary: #0066ff; }` |
| Custom spacing | `@theme { --spacing-128: 32rem; }` |
| Dark mode | `dark:bg-gray-900` |
| Responsive | `md:flex lg:grid` |
| Hover/Focus | `hover:bg-blue-600 focus:ring-2` |
| Transitions | `transition-colors duration-200` |

## CSS Configuration (@theme)

### Basic Theme Setup

```css
/* src/assets/main.css */
@import "tailwindcss";

@theme {
  /* Colores personalizados */
  --color-primary: #0066ff;
  --color-secondary: #6366f1;
  --color-accent: #f59e0b;
  
  /* Colores de marca */
  --color-mio-blue: #1e40af;
  --color-mio-purple: #7c3aed;
  
  /* Fondos */
  --color-surface: #ffffff;
  --color-surface-dark: #1f2937;
  
  /* Texto */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  
  /* Estados */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### Using Custom Colors

```vue
<template>
  <div class="bg-primary text-white">Primary background</div>
  <div class="bg-mio-blue">Custom brand color</div>
  <div class="text-text-secondary">Secondary text</div>
  <div class="bg-surface dark:bg-surface-dark">Responsive surface</div>
</template>
```

### Custom Spacing & Sizing

```css
@theme {
  /* Spacing adicional */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;
  
  /* Breakpoints personalizados */
  --breakpoint-xs: 475px;
  --breakpoint-3xl: 1920px;
  
  /* Font sizes */
  --font-size-xxs: 0.625rem;
  --font-size-display: 4rem;
}
```

## Common Utility Patterns

### Layout & Flexbox

```vue
<template>
  <!-- Flex container -->
  <div class="flex items-center justify-between gap-4">
    <div>Left</div>
    <div>Right</div>
  </div>
  
  <!-- Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
  
  <!-- Centering -->
  <div class="flex items-center justify-center min-h-screen">
    <div>Centered content</div>
  </div>
</template>
```

### Responsive Design

```vue
<template>
  <!-- Mobile first approach -->
  <div class="
    w-full
    sm:w-1/2
    md:w-1/3
    lg:w-1/4
  ">
    Responsive width
  </div>
  
  <!-- Hidden/visible at breakpoints -->
  <div class="hidden md:block">Only desktop</div>
  <div class="md:hidden">Only mobile</div>
  
  <!-- Responsive padding -->
  <div class="p-4 md:p-6 lg:p-8">
    Responsive padding
  </div>
</template>
```

### Dark Mode

```vue
<template>
  <div class="
    bg-white dark:bg-gray-900
    text-gray-900 dark:text-white
    border-gray-200 dark:border-gray-700
  ">
    Dark mode compatible
  </div>
</template>
```

### Buttons

```vue
<template>
  <!-- Primary button -->
  <button class="
    px-4 py-2
    bg-primary text-white
    rounded-lg
    hover:bg-primary/90
    focus:outline-none focus:ring-2 focus:ring-primary/50
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  ">
    Primary Button
  </button>
  
  <!-- Outline button -->
  <button class="
    px-4 py-2
    border border-primary text-primary
    rounded-lg
    hover:bg-primary hover:text-white
    transition-colors duration-200
  ">
    Outline Button
  </button>
</template>
```

### Cards

```vue
<template>
  <div class="
    bg-white dark:bg-gray-800
    rounded-xl
    shadow-lg
    p-6
    border border-gray-200 dark:border-gray-700
  ">
    <h3 class="text-lg font-semibold mb-2">Card Title</h3>
    <p class="text-gray-600 dark:text-gray-300">Card content</p>
  </div>
</template>
```

### Forms

```vue
<template>
  <div class="space-y-4">
    <!-- Input -->
    <input 
      type="text"
      class="
        w-full px-4 py-2
        border border-gray-300 dark:border-gray-600
        rounded-lg
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
        transition-colors
      "
      placeholder="Enter text"
    />
    
    <!-- With error state -->
    <input 
      type="text"
      class="
        w-full px-4 py-2
        border-2 border-error
        rounded-lg
        focus:outline-none focus:ring-2 focus:ring-error/50
      "
    />
    <p class="text-sm text-error">Error message</p>
  </div>
</template>
```

## Animation & Transitions

```vue
<template>
  <!-- Basic transitions -->
  <button class="transition-colors duration-200 hover:bg-primary">
    Color transition
  </button>
  
  <!-- Transform -->
  <div class="hover:scale-105 transition-transform duration-300">
    Scale on hover
  </div>
  
  <!-- Multiple transitions -->
  <div class="
    transition-all duration-300
    hover:shadow-xl hover:-translate-y-1
  ">
    Card hover effect
  </div>
</template>
```

## Utility Functions

### clsx + tailwind-merge

```js
// lib/utils.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conflict resolution
 * @param  {...any} inputs - Class names or conditional objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

```vue
<script setup>
import { cn } from '@/lib/utils'

const { variant = 'default', size = 'md' } = defineProps(['variant', 'size'])

const classes = cn(
  'rounded-lg transition-colors',
  {
    'bg-primary text-white': variant === 'primary',
    'bg-gray-100 text-gray-900': variant === 'secondary',
    'px-3 py-1.5 text-sm': size === 'sm',
    'px-4 py-2': size === 'md',
    'px-6 py-3 text-lg': size === 'lg'
  }
)
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
```

## Class Variance Authority (CVA)

```js
// components/Button.js
import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500/50',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)
```

```vue
<script setup>
import { buttonVariants } from './Button'

const { variant, size } = defineProps(['variant', 'size'])
</script>

<template>
  <button :class="buttonVariants({ variant, size })">
    <slot />
  </button>
</template>
```

## Common Mistakes

**Usar tailwind.config.js para colores:**

```js
// ❌ Wrong (v3 style)
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0066ff'
      }
    }
  }
}

// ✅ Correct (v4 style)
/* main.css */
@theme {
  --color-primary: #0066ff;
}
```

**Olvidar dark mode classes:**

```vue
<!-- ❌ Wrong -->
<div class="bg-white text-black">Only light mode</div>

<!-- ✅ Correct -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  Both modes
</div>
```

**No usar transition para estados hover:**

```vue
<!-- ❌ Wrong - cambio abrupto -->
<button class="bg-blue-500 hover:bg-blue-600">Click</button>

<!-- ✅ Correct - transición suave -->
<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
  Click
</button>
```

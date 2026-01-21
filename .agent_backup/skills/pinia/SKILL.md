---
name: pinia
description: Use when creating or editing Pinia stores - provides setup stores patterns, JavaScript best practices, async actions, getters, and Supabase integration
license: MIT
---

# Pinia Store Development

Reference for creating Pinia stores using setup stores (Composition API style) with JavaScript.

## Overview

Pinia is the official state management library for Vue 3. This skill focuses on setup stores which use the Composition API pattern.

## When to Use

**Use this skill when:**

- Creating new Pinia stores
- Managing global application state
- Implementing async data fetching in stores
- Integrating with Supabase
- Sharing state between components

**Don't use stores for:**

- Component-local state (use `ref`/`reactive` instead)
- Props/emits communication (use Vue's built-in features)
- Simple computed values (use `computed()` in components)

## Quick Reference

| Pattern | Syntax |
| ------- | ------ |
| Define store | `export const useUserStore = defineStore('user', () => { ... })` |
| State | `const user = ref(null)` |
| Getters | `const isAuthenticated = computed(() => !!user.value)` |
| Actions | `async function login(email, password) { ... }` |
| Use in component | `const userStore = useUserStore()` |

## Store Structure

### Setup Store Pattern (Recommended)

```js
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 */

export const useUserStore = defineStore('user', () => {
  // State (like data)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters (like computed)
  const isAuthenticated = computed(() => !!user.value)
  const fullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )

  // Actions (like methods)
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = response.user
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  // Return everything you want to expose
  return {
    // State
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    fullName,
    // Actions
    login,
    logout,
  }
})
```

## JavaScript Best Practices con JSDoc

### Type Definitions con JSDoc

```js
// types/index.js

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'admin'|'user'} role
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} stock
 */
```

### Store con JSDoc

```js
// stores/inventory.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  /** @type {import('vue').Ref<Product[]>} */
  const products = ref([])
  
  /** @type {import('vue').Ref<Product|null>} */
  const selectedProduct = ref(null)
  
  const lowStockProducts = computed(() => 
    products.value.filter(p => p.stock < 10)
  )

  return { products, selectedProduct, lowStockProducts }
})
```

## Supabase Integration

### Authentication Store

```js
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '~/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   */
  async function signIn(email, password) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      session.value = data.session
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
  }

  async function initialize() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    session.value = data.session
  }

  return { user, session, loading, isAuthenticated, signIn, signOut, initialize }
})
```

### Data Fetching Store

```js
// stores/products.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '~/lib/supabase'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      products.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new product
   * @param {Object} product - Product data without id
   */
  async function createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    products.value.push(data)
    return data
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} updates - Fields to update
   */
  async function updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) products.value[index] = data
    return data
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   */
  async function deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    products.value = products.value.filter(p => p.id !== id)
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
```

## Using Stores in Components

```vue
<script setup>
import { useProductsStore } from '~/stores/products'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const productsStore = useProductsStore()

// Use storeToRefs to maintain reactivity when destructuring
const { products, loading, error } = storeToRefs(productsStore)

// Actions can be destructured directly (they don't lose reactivity)
const { fetchProducts, createProduct } = productsStore

// Fetch on mount
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="product in products" :key="product.id">
        {{ product.name }}
      </div>
    </div>
  </div>
</template>
```

## Common Patterns

### Loading States

```js
export const useDataStore = defineStore('data', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/items')
      items.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchItems }
})
```

### Optimistic Updates

```js
/**
 * Update an item with optimistic UI
 * @param {string} id - Item ID
 * @param {Object} updates - Fields to update
 */
async function updateItem(id, updates) {
  const index = items.value.findIndex(i => i.id === id)
  const original = items.value[index]
  
  // Optimistic update
  items.value[index] = { ...original, ...updates }
  
  try {
    await $fetch(`/api/items/${id}`, {
      method: 'PATCH',
      body: updates
    })
  } catch (e) {
    // Revert on error
    items.value[index] = original
    throw e
  }
}
```

## Common Mistakes

**Not using `storeToRefs` when destructuring:**

```js
// ❌ Wrong - loses reactivity
const { products } = useProductsStore()

// ✅ Correct - maintains reactivity
const { products } = storeToRefs(useProductsStore())
```

**Mutating state outside actions:**

```js
// ❌ Wrong - mutate in component
productsStore.products.push(newProduct)

// ✅ Correct - use action
productsStore.createProduct(newProduct)
```

**Not handling errors:**

```js
// ❌ Wrong - no error handling
async function fetchData() {
  const data = await $fetch('/api/data')
  items.value = data
}

// ✅ Correct - proper error handling
async function fetchData() {
  try {
    const data = await $fetch('/api/data')
    items.value = data
  } catch (e) {
    error.value = e.message
  }
}
```

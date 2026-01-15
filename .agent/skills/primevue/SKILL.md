---
name: primevue
description: Use when building forms or UI with PrimeVue components - provides component patterns, form validation, theming, and best practices for InputText, Dropdown, DataTable, Dialog, and other PrimeVue components
license: MIT
---

# PrimeVue Component Development

Reference for using PrimeVue components in Vue 3 applications with JavaScript and form validation.

## Overview

PrimeVue is a rich UI component library for Vue 3. This skill covers common patterns for forms, data tables, dialogs, and other interactive components.

## When to Use

**Use this skill when:**

- Building forms with PrimeVue components
- Creating data tables and lists
- Implementing dialogs and overlays
- Using PrimeVue's form validation
- Theming and styling PrimeVue components

## Quick Reference

| Component | Common Use | Import |
| --------- | ---------- | ------ |
| InputText | Text inputs | `import InputText from 'primevue/inputtext'` |
| Dropdown | Select dropdowns | `import Dropdown from 'primevue/dropdown'` |
| Button | Buttons | `import Button from 'primevue/button'` |
| DataTable | Tables | `import DataTable from 'primevue/datatable'` |
| Dialog | Modals | `import Dialog from 'primevue/dialog'` |
| Calendar | Date picker | `import Calendar from 'primevue/calendar'` |
| Toast | Notifications | `import Toast from 'primevue/toast'` |

## Form Components

### Basic Form

```vue
<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

const formData = ref({
  name: '',
  email: '',
  category: null
})

const categories = ref([
  { label: 'Technology', value: 'tech' },
  { label: 'Business', value: 'business' },
  { label: 'Other', value: 'other' }
])

async function handleSubmit() {
  console.log('Form data:', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-fluid">
    <div class="field">
      <label for="name">Name</label>
      <InputText 
        id="name" 
        v-model="formData.name" 
        placeholder="Enter your name"
      />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <InputText 
        id="email" 
        v-model="formData.email" 
        type="email"
        placeholder="Enter your email"
      />
    </div>

    <div class="field">
      <label for="category">Category</label>
      <Dropdown 
        id="category"
        v-model="formData.category"
        :options="categories"
        optionLabel="label"
        optionValue="value"
        placeholder="Select a category"
      />
    </div>

    <Button type="submit" label="Submit" />
  </form>
</template>
```

### Form with Validation (Zod)

```vue
<script setup>
import { ref, computed } from 'vue'
import { z } from 'zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})

function validateField(field) {
  try {
    schema.pick({ [field]: true }).parse({ [field]: formData.value[field] })
    delete errors.value[field]
  } catch (e) {
    if (e instanceof z.ZodError) {
      errors.value[field] = e.errors[0].message
    }
  }
}

async function handleSubmit() {
  try {
    const validated = schema.parse(formData.value)
    console.log('Valid data:', validated)
    errors.value = {}
  } catch (e) {
    if (e instanceof z.ZodError) {
      errors.value = Object.fromEntries(
        e.errors.map(err => [err.path[0], err.message])
      )
    }
  }
}

const isValid = computed(() => Object.keys(errors.value).length === 0)
</script>

<template>
  <form @submit.prevent="handleSubmit" class="p-fluid">
    <div class="field">
      <label for="email">Email</label>
      <InputText 
        id="email" 
        v-model="formData.email"
        :class="{ 'p-invalid': errors.email }"
        @blur="validateField('email')"
      />
      <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
    </div>

    <div class="field">
      <label for="password">Password</label>
      <InputText 
        id="password" 
        v-model="formData.password"
        type="password"
        :class="{ 'p-invalid': errors.password }"
        @blur="validateField('password')"
      />
      <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
    </div>

    <div class="field">
      <label for="confirmPassword">Confirm Password</label>
      <InputText 
        id="confirmPassword" 
        v-model="formData.confirmPassword"
        type="password"
        :class="{ 'p-invalid': errors.confirmPassword }"
        @blur="validateField('confirmPassword')"
      />
      <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
    </div>

    <Button type="submit" label="Register" :disabled="!isValid" />
  </form>
</template>
```

## Data Display Components

### DataTable

```vue
<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const products = ref([
  { id: '1', name: 'Product 1', price: 100, stock: 50, category: 'Electronics' },
  { id: '2', name: 'Product 2', price: 200, stock: 30, category: 'Clothing' },
])

const selectedProducts = ref([])

function editProduct(product) {
  console.log('Edit:', product)
}

function deleteProduct(product) {
  products.value = products.value.filter(p => p.id !== product.id)
}
</script>

<template>
  <DataTable 
    v-model:selection="selectedProducts"
    :value="products" 
    paginator 
    :rows="10"
    dataKey="id"
    filterDisplay="row"
    :globalFilterFields="['name', 'category']"
  >
    <Column selectionMode="multiple" headerStyle="width: 3rem" />
    
    <Column field="name" header="Name" sortable>
      <template #filter="{ filterModel, filterCallback }">
        <InputText 
          v-model="filterModel.value" 
          type="text" 
          @input="filterCallback()" 
          placeholder="Search by name"
        />
      </template>
    </Column>
    
    <Column field="price" header="Price" sortable>
      <template #body="{ data }">
        ${{ data.price.toFixed(2) }}
      </template>
    </Column>
    
    <Column field="stock" header="Stock" sortable>
      <template #body="{ data }">
        <span :class="{ 'text-red-500': data.stock < 20 }">
          {{ data.stock }}
        </span>
      </template>
    </Column>
    
    <Column field="category" header="Category" sortable />
    
    <Column header="Actions">
      <template #body="{ data }">
        <Button 
          icon="pi pi-pencil" 
          class="p-button-rounded p-button-text" 
          @click="editProduct(data)"
        />
        <Button 
          icon="pi pi-trash" 
          class="p-button-rounded p-button-text p-button-danger" 
          @click="deleteProduct(data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
```

## Dialog/Modal

```vue
<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const visible = ref(false)
const productName = ref('')

function openDialog() {
  visible.value = true
}

function closeDialog() {
  visible.value = false
  productName.value = ''
}

function saveProduct() {
  console.log('Saving:', productName.value)
  closeDialog()
}
</script>

<template>
  <div>
    <Button label="Add Product" @click="openDialog" />

    <Dialog 
      v-model:visible="visible" 
      header="Add New Product" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="productName">Product Name</label>
          <InputText id="productName" v-model="productName" autofocus />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="closeDialog" text />
        <Button label="Save" icon="pi pi-check" @click="saveProduct" />
      </template>
    </Dialog>
  </div>
</template>
```

## Toast Notifications

```vue
<script setup>
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const toast = useToast()

function showSuccess() {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Product saved successfully',
    life: 3000
  })
}

function showError() {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Failed to save product',
    life: 3000
  })
}

function showInfo() {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Product is out of stock',
    life: 3000
  })
}
</script>

<template>
  <div>
    <Toast />
    <Button label="Success" @click="showSuccess" class="p-button-success" />
    <Button label="Error" @click="showError" class="p-button-danger" />
    <Button label="Info" @click="showInfo" class="p-button-info" />
  </div>
</template>
```

## Styling and Theming

### Using PrimeVue Classes

```vue
<template>
  <!-- Fluid forms (full width inputs) -->
  <form class="p-fluid">
    <div class="field">
      <InputText />
    </div>
  </form>

  <!-- Grid layout -->
  <div class="grid">
    <div class="col-12 md:col-6">
      <InputText />
    </div>
    <div class="col-12 md:col-6">
      <InputText />
    </div>
  </div>

  <!-- Spacing utilities -->
  <div class="p-3">Content with padding</div>
  <div class="mt-4">Content with margin top</div>
</template>
```

## Common Patterns

### Confirmation Dialog

```vue
<script setup>
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'

const confirm = useConfirm()

function confirmDelete(productId) {
  confirm.require({
    message: 'Are you sure you want to delete this product?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Delete product
      console.log('Deleting:', productId)
    },
    reject: () => {
      // User cancelled
    }
  })
}
</script>

<template>
  <ConfirmDialog />
  <Button label="Delete" @click="confirmDelete('123')" />
</template>
```

## Common Mistakes

**Not using `p-fluid` for full-width inputs:**

```vue
<!-- ❌ Wrong - inputs won't be full width -->
<div class="field">
  <InputText />
</div>

<!-- ✅ Correct - wrap in p-fluid -->
<form class="p-fluid">
  <div class="field">
    <InputText />
  </div>
</form>
```

**Forgetting to add Toast/ConfirmDialog components:**

```vue
<!-- ❌ Wrong - toast won't show -->
<script setup>
const toast = useToast()
toast.add({ severity: 'success', summary: 'Success' })
</script>

<!-- ✅ Correct - add Toast component -->
<template>
  <Toast />
  <!-- rest of template -->
</template>
```

**Not using dataKey in DataTable:**

```vue
<!-- ❌ Wrong - selection won't work properly -->
<DataTable :value="products" v-model:selection="selected">

<!-- ✅ Correct - add dataKey -->
<DataTable :value="products" v-model:selection="selected" dataKey="id">
```

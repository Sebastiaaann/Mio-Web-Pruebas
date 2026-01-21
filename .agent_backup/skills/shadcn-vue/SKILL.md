---
name: shadcn-vue
description: Use when building UI with shadcn-vue components - provides Button, Card, Dialog, Input, Select, Checkbox, Slider, Badge, Avatar, Progress patterns. Component imports, variants, and composition patterns for Vue 3.
---

# Shadcn-Vue Component Library

Reference for using shadcn-vue components in this Vue 3 project with JavaScript.

## Installation

Components are installed via CLI and placed in `src/components/ui/`:

```bash
npx shadcn-vue@latest add [component-name]
```

---

## Button

### Import
```javascript
import { Button } from '@/components/ui/button'
```

### Variants
```vue
<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes
```vue
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### With Icon (Lucide)
```vue
<script setup>
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-vue-next'
</script>

<template>
  <Button>
    Next <ArrowRight class="ml-2 h-4 w-4" />
  </Button>
  
  <!-- Loading state -->
  <Button disabled>
    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
    Loading...
  </Button>
</template>
```

---

## Card

### Import
```javascript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
```

### Usage
```vue
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Dialog

### Import
```javascript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
```

### Basic Usage
```vue
<Dialog>
  <DialogTrigger as-child>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Description text here
      </DialogDescription>
    </DialogHeader>
    <div class="py-4">
      <!-- Content -->
    </div>
    <DialogFooter>
      <DialogClose as-child>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Controlled Dialog
```vue
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <!-- content -->
    </DialogContent>
  </Dialog>
  
  <Button @click="open = true">Open</Button>
</template>
```

---

## Input

### Import
```javascript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
```

### Usage
```vue
<div class="grid gap-2">
  <Label for="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>
```

### With v-model
```vue
<script setup>
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <Input v-model="email" placeholder="Enter email" />
</template>
```

---

## Select

### Import
```javascript
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
```

### Usage
```vue
<script setup>
import { ref } from 'vue'
const selected = ref('')
</script>

<template>
  <Select v-model="selected">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="Select option" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Options</SelectLabel>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
```

---

## Checkbox

### Import
```javascript
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
```

### Usage
```vue
<script setup>
import { ref } from 'vue'
const checked = ref(false)
</script>

<template>
  <div class="flex items-center space-x-2">
    <Checkbox id="terms" v-model:checked="checked" />
    <Label for="terms">Accept terms</Label>
  </div>
</template>
```

---

## Slider

### Import
```javascript
import { Slider } from '@/components/ui/slider'
```

### Usage
```vue
<script setup>
import { ref } from 'vue'
const value = ref([50])
</script>

<template>
  <Slider v-model="value" :max="100" :step="1" class="w-full" />
</template>
```

---

## Badge

### Import
```javascript
import { Badge } from '@/components/ui/badge'
```

### Variants
```vue
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

---

## Progress

### Import
```javascript
import { Progress } from '@/components/ui/progress'
```

### Usage
```vue
<script setup>
import { ref } from 'vue'
const progress = ref(45)
</script>

<template>
  <Progress :model-value="progress" class="w-full" />
</template>
```

---

## Avatar

### Import
```javascript
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
```

### Usage
```vue
<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

---

## Icons (Lucide)

### Import
```javascript
import { 
  Home,
  Settings, 
  User,
  Heart,
  Calendar,
  MessageSquare,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Loader2,
  ChevronRight,
  Activity,
  Scale,
  Droplets
} from 'lucide-vue-next'
```

### Usage
```vue
<Home class="h-5 w-5" />
<Heart class="h-5 w-5 text-red-500" />
<Loader2 class="h-5 w-5 animate-spin" />
```

---

## Common Patterns

### Cursor Pointer for Interactive Elements
```vue
<Card class="cursor-pointer hover:shadow-md transition-shadow">
  <!-- clickable card content -->
</Card>
```

### Transitions
```vue
<Button class="transition-all duration-200 hover:scale-105 active:scale-95">
  Click me
</Button>
```

### Loading State
```vue
<script setup>
const loading = ref(false)
</script>

<template>
  <Button :disabled="loading">
    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    {{ loading ? 'Loading...' : 'Submit' }}
  </Button>
</template>
```

---

## Common Mistakes

| ❌ Don't | ✅ Do |
|----------|-------|
| Use PrimeIcons `class="pi pi-home"` | Use Lucide `<Home class="h-5 w-5" />` |
| `<Card><template #content>` | `<Card><CardContent>` |
| `<Button label="Click">` | `<Button>Click</Button>` |
| `<Dialog :visible="x">` | `<Dialog v-model:open="x">` |
| `<Dropdown v-model="x">` | `<Select v-model="x">` |

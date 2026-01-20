<script setup>
import { provide, toRef } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const modelValue = toRef(props, 'modelValue')
const updateValue = (value) => {
  emit('update:modelValue', value)
}

provide('radio-group', { modelValue, updateValue })
</script>

<template>
  <div :class="cn('grid gap-2', props.class)" role="radiogroup">
    <slot />
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  id: String,
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  class: {
    type: String,
    default: ''
  }
})

const { modelValue, updateValue } = inject('radio-group')

const checked = computed(() => modelValue.value === props.value)

const handleChange = () => {
    updateValue(props.value)
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    :value="value"
    :id="id"
    @click="handleChange"
    :class="cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <span
      v-if="checked"
      class="flex items-center justify-center pointer-events-none"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3 fill-current text-current"
      >
        <path
          d="M7.49991 0.875C3.84104 0.875 0.874908 3.84113 0.874908 7.5C0.874908 11.1589 3.84104 14.125 7.49991 14.125C11.1588 14.125 14.1249 11.1589 14.1249 7.5C14.1249 3.84113 11.1588 0.875 7.49991 0.875ZM7.49991 12.875C4.53138 12.875 2.12491 10.4685 2.12491 7.5C2.12491 4.53147 4.53138 2.125 7.49991 2.125C10.4684 2.125 12.8749 4.53147 12.8749 7.5C12.8749 10.4685 10.4684 12.875 7.49991 12.875Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
        <path
            d="M7.49991 4.5C5.84305 4.5 4.49991 5.84315 4.49991 7.5C4.49991 9.15685 5.84305 10.5 7.49991 10.5C9.15676 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15676 4.5 7.49991 4.5Z"
            fill="currentColor"
        >
        </path>
      </svg>
    </span>
  </button>
</template>

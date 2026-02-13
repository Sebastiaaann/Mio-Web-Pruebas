<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true,
    // Expected structure:
    // {
    //   "title": "...",
    //   "subtitle": "Vital",
    //   "price": "$16,990 / mes",
    //   "color": "#B497F3",
    //   "description": "...",
    //   "store_id": 1111
    // }
  }
})

// Define a safe color or default if missing
const accentColor = computed(() => {
  if (props.plan.color) return props.plan.color
  if (props.plan.colorPrimario) return props.plan.colorPrimario
  if (props.plan.config && props.plan.config.colors && props.plan.config.colors.primary) {
    return props.plan.config.colors.primary
  }
  return '#B497F3' // Default fallback
})

const emit = defineEmits(['select'])

function handleSelect() {
  emit('select', props.plan)
}
</script>

<template>
  <div class="relative w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01] hover:shadow-md">
    <!-- Top Border Line Color -->
    <div :style="{ backgroundColor: accentColor }" class="absolute top-0 left-0 right-0 h-1.5 opacity-80"></div>

    <!-- Header Section -->
    <div class="mb-6">
      <!-- Logo -->
      <div class="mb-4 h-12 flex items-center">
        <img 
          v-if="plan.logo" 
          :src="plan.logo" 
          :alt="plan.subtitle || 'Logo del plan'"
          width="120" height="48"
          loading="lazy" decoding="async"
          class="h-full w-auto object-contain"
        />
        <span v-else class="text-2xl font-black tracking-tighter text-gray-400 opacity-60">
          mio<sup class="text-sm align-top">+</sup>
        </span>
      </div>
      
      <!-- Plan Name -->
      <h3 :style="{ color: accentColor }" class="h2-premium uppercase mb-2">
        {{ plan.subtitle }}
      </h3>
      
      <!-- Price -->
      <p :style="{ color: accentColor }" class="text-display text-[1.75rem]">
        {{ plan.price }}
      </p>
    </div>

    <!-- Divider -->
    <hr class="border-t border-gray-100 mb-6" />

    <!-- Details Section -->
    <div class="flex-grow">
      <h4 class="h4-premium text-gray-700 mb-3">Información del plan</h4>
      <p class="text-body text-sm leading-relaxed whitespace-pre-line text-gray-500">
        {{ plan.description }}
      </p>
    </div>

    <!-- Action Button -->
    <div class="mt-8">
      <button 
        @click="handleSelect"
        :style="{ backgroundColor: accentColor }"
        class="w-full rounded-xl py-3.5 px-6 text-white font-bold tracking-wide shadow-md hover:shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
      >
        OBTENER
      </button>
    </div>
  </div>
</template>

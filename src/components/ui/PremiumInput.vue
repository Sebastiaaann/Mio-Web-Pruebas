<script setup>
import { ref } from 'vue';
import { Motion } from 'motion-v';

const props = defineProps({
  modelValue: String,
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  id: String,
  error: String,
  success: Boolean
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="relative mb-6">
    <!-- Label -->
    <label 
      :for="id"
      class="block text-sm font-medium mb-1.5 ml-1 transition-colors duration-200"
      :class="error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'"
    >
      {{ label }}
    </label>

    <!-- Input Field -->
    <div class="relative">
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="handleInput"
          @focus="isFocused = true"
          @blur="isFocused = false"
          class="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800/50 border rounded-2xl text-gray-900 dark:text-gray-100 outline-none transition-all duration-300 font-sans"
          :class="[
            error 
              ? 'border-red-500 bg-red-50/50' 
              : isFocused 
                ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-gray-800' 
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          ]"
          :placeholder="placeholder"
        />

        <!-- Validation Icon (Checkmark) -->
        <div class="absolute right-4 top-3.5 pointer-events-none">
           <svg v-if="success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
             <Motion 
                is="path"
                d="M20 6L9 17l-5-5"
                :initial="{ pathLength: 0, opacity: 0 }"
                :animate="{ pathLength: 1, opacity: 1 }"
                :transition="{ duration: 0.4, ease: 'easeOut' }"
             />
           </svg>
        </div>
    </div>

    <!-- Error Message -->
    <Motion
        v-if="error"
        :initial="{ opacity: 0, y: -5 }"
        :animate="{ opacity: 1, y: 0 }"
        class="absolute -bottom-5 left-1 text-[11px] text-red-500 font-medium ml-2"
    >
        {{ error }}
    </Motion>
  </div>
</template>

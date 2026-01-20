<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    :class="
      cn('rounded-3xl border border-gray-100 dark:border-gray-800 bg-card text-card-foreground shadow-sm', props.class)
    "
  >
    <slot />
  </div>
</template>

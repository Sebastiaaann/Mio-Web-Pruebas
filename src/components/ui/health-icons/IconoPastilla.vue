<script setup lang="ts">
interface Props {
  class?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    :class="props.class"
    fill="none"
  >
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M44 24c0 11.046-8.954 20-20 20S4 35.046 4 24S12.954 4 24 4s20 8.954 20 20m-9.793-9.707a1 1 0 0 1 0 1.414l-18.5 18.5a1 1 0 0 1-1.414-1.414l18.5-18.5a1 1 0 0 1 1.414 0"
      clip-rule="evenodd"
    />
  </svg>
</template>

<script setup>
import { cn } from "@/lib/utils";

defineProps({
  text: {
    type: String,
    default: "Button",
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <button
    :class="cn(
      'group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-white p-2 text-center font-semibold text-slate-900',
      $props.class
    )"
  >
    <span class="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
      {{ text }}
    </span>
    <div
      class="absolute top-0 left-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
    >
      <span>{{ text }}</span>
      <!-- ArrowRight Icon (Lucide) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-4 h-4"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
    <div
      class="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-blue-600 transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-blue-600"
    ></div>
  </button>
</template>

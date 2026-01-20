<script setup>
import { cn } from "@/lib/utils";
import { Motion } from "motion-v";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});

const notifications = [
  { title: "Nuevo mensaje", desc: "Dr. House ha respondido", time: "15m" },
  { title: "Recordatorio", desc: "Medición de presión", time: "1h" },
  { title: "Pago exitoso", desc: "Consulta telemedicina", time: "2h" },
  { title: "Actualización", desc: "Nuevos términos", time: "1d" },
];
</script>

<template>
  <div :class="cn('flex flex-col gap-2 p-4 overflow-hidden mask-gradient', props.class)">
    <Motion
      v-for="(n, i) in notifications"
      :key="i"
      :initial="{ opacity: 0, x: 20 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ delay: i * 0.2, duration: 0.5 }"
      class="bg-white dark:bg-neutral-800 border dark:border-neutral-700 p-3 rounded-xl shadow-sm text-xs w-full"
    >
      <div class="flex justify-between items-start mb-1">
          <span class="font-bold text-gray-800 dark:text-gray-200">{{ n.title }}</span>
          <span class="text-[10px] text-gray-400">{{ n.time }}</span>
      </div>
      <p class="text-gray-500 dark:text-gray-400">{{ n.desc }}</p>
    </Motion>
  </div>
</template>

<style scoped>
.mask-gradient {
    mask-image: linear-gradient(to top, transparent 5%, black 40%);
}
</style>

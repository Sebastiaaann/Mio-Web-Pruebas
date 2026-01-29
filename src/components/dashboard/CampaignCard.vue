<script setup>
import { Megaphone } from "lucide-vue-next";
import BaseCard from "@/components/ui/base/BaseCard.vue";
import BaseBadge from "@/components/ui/base/BaseBadge.vue";

defineProps({
  campanha: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <BaseCard
    padding="large"
    rounded="large"
    variant="transparent"
    :hoverable="true"
    clickable
    class="h-full relative overflow-hidden bg-gradient-to-br from-primary via-violet-600 to-indigo-700 text-white border-none shadow-lg hover:shadow-primary/25 group"
  >
    <!-- Decorative bg pattern -->
    <div
      class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"
    ></div>

    <div class="relative z-10 flex items-start justify-between h-full flex-col">
      <div class="w-full flex justify-between items-start">
        <BaseBadge
          variant="white"
          class="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm"
        >
          Novedad
        </BaseBadge>
        <div
          class="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300"
        >
          <Megaphone class="h-6 w-6 text-white" />
        </div>
      </div>

      <div class="mt-auto pt-8">
        <h3 class="text-3xl font-bold mb-2 text-white">
          {{ campanha.nombre }}
        </h3>
        <p class="text-white/80 max-w-lg text-lg">{{ campanha.descripcion }}</p>
      </div>
    </div>
  </BaseCard>
</template>

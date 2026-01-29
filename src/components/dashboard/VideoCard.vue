<script setup>
import { Video, Play, Shield } from "lucide-vue-next";
import BaseCard from "@/components/ui/base/BaseCard.vue";

defineProps({
  video: {
    type: Object,
    required: true,
  },
});

defineEmits(["play"]);
</script>

<template>
  <BaseCard
    padding="none"
    rounded="large"
    :hoverable="true"
    clickable
    class="group h-full flex flex-col"
    @click="$emit('play', video)"
  >
    <!-- Thumbnail aspect ratio box -->
    <div class="flex-1 bg-slate-200 dark:bg-slate-800 relative min-h-[120px]">
      <div
        class="absolute inset-0 flex items-center justify-center text-muted-foreground"
      >
        <Video class="h-8 w-8 opacity-50" />
      </div>
      <!-- Play Overlay -->
      <div
        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div
          class="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
        >
          <Play class="h-5 w-5 text-primary ml-1" />
        </div>
      </div>
    </div>

    <div class="p-3 bg-card border-t-0 shrink-0">
      <h4
        class="font-semibold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors"
      >
        {{ video.titulo }}
      </h4>
      <div
        class="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>{{ video.duracion }}</span>
        <span class="flex items-center gap-1"
          ><Shield class="h-3 w-3" /> MIO+</span
        >
      </div>
    </div>
  </BaseCard>
</template>

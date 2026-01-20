<script setup>
import { computed } from "vue";
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaCorner } from "reka-ui";
import ScrollBar from "./ScrollBar.vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: null, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
});

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ScrollAreaRoot
    :class="cn('relative overflow-hidden', props.class)"
    v-bind="delegatedProps"
  >
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>

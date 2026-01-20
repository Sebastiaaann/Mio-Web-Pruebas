<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  reverse: {
    type: Boolean,
    default: false,
  },
  pauseOnHover: {
    type: Boolean,
    default: false,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  repeat: {
    type: Number,
    default: 4,
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    :class="cn(
      'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
      {
        'flex-row': !vertical,
        'flex-col': vertical,
      },
      props.class,
    )"
  >
    <div
      v-for="i in repeat"
      :key="i"
      :class="cn(
        'flex shrink-0 justify-around [gap:var(--gap)]',
        {
          'animate-marquee flex-row': !vertical,
          'animate-marquee-vertical flex-col': vertical,
          'group-hover:[animation-play-state:paused]': pauseOnHover,
          '[animation-direction:reverse]': reverse,
        },
      )"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes marquee-vertical {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}

.animate-marquee {
  animation: marquee var(--duration) linear infinite;
}

.animate-marquee-vertical {
  animation: marquee-vertical var(--duration) linear infinite;
}
</style>

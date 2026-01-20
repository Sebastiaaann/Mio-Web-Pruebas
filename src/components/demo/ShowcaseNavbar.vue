<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Motion } from 'motion-v';

const route = useRoute();

const links = [
  { name: 'Collection', path: '/demo-collection' },
  { name: 'Infinite Stack', path: '/demo-stack' },
  { name: 'Visual Utils', path: '/demo-visuals' },
];

const activeLink = computed(() => links.find(l => l.path === route.path) || links[0]);
</script>

<template>
  <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
    <router-link
      v-for="link in links"
      :key="link.path"
      :to="link.path"
      class="relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 z-10 hover:text-white"
      :class="activeLink.path === link.path ? 'text-black' : 'text-neutral-400'"
    >
      {{ link.name }}

      <!-- Shared Layout Background (The Gliding Pill) -->
      <Motion
        v-if="activeLink.path === link.path"
        layoutId="showcase-navbar-pill"
        class="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
        :transition="{ type: 'spring', text: 'spring', bounce: 0.2, duration: 0.6 }"
      />
    </router-link>
  </nav>
</template>

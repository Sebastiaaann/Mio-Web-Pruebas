<!-- src/App.vue -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';

const route = useRoute();

// Determinar qué layout usar basado en la ruta
// Determinar qué layout usar basado en la ruta
const usarLayout = computed(() => {
  // Si la ruta define explícitamente que no requiere layout, devolver false
  if (route.meta.requiresLayout === false) return false;
  
  // Backwards compatibility / Seguridad:
  // Si es una ruta de autenticación o onboarding, no usar layout (aunque deberían tener meta)
  if (route.path.startsWith('/auth')) return false;
  if (route.path.startsWith('/onboarding')) return false;
  
  // Por defecto, usar AppLayout
  return true;
});
</script>

<template>
  <!-- Con Layout Principal -->
  <AppLayout v-if="usarLayout">
    <router-view />
  </AppLayout>
  
  <!-- Sin Layout (auth, onboarding, etc.) -->
  <router-view v-else />
</template>

<style>
/* Estilos globales si los necesitas */
</style>

<!-- src/App.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DisposicionApp from '@/layouts/DisposicionApp.vue';

const route = useRoute();
const router = useRouter();

// Esperar a que el router esté listo para evitar flash de contenido incorrecto
const isRouterReady = ref(false);

onMounted(async () => {
  await router.isReady();
  isRouterReady.value = true;
});

// Determinar qué layout usar basado en la ruta
const usarLayout = computed(() => {
  // Si el router no está listo, no mostrar nada aún
  if (!isRouterReady.value) return false;
  
  // Si la ruta define explícitamente que no requiere layout, devolver false
  if (route.meta.requiresLayout === false) return false;
  
  // Rutas sin layout
  if (route.path === '/') return false;
  if (route.path.startsWith('/auth')) return false;
  if (route.path.startsWith('/onboarding')) return false;
  
  // Por defecto, usar AppLayout
  return true;
});
</script>

<template>
  <!-- Loading inicial mientras el router se prepara -->
  <div v-if="!isRouterReady" class="min-h-screen flex items-center justify-center bg-background">
    <div class="animate-pulse text-primary text-2xl font-bold">Mio<sup class="text-sm">+</sup></div>
  </div>
  
  <!-- Con Layout Principal -->
  <DisposicionApp v-else-if="usarLayout">
    <router-view />
  </DisposicionApp>
  
  <!-- Sin Layout (inicio, auth, onboarding) -->
  <router-view v-else />
</template>

<style>
/* Estilos globales si los necesitas */
</style>


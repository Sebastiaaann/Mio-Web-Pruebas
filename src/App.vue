<!-- src/App.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DisposicionApp from '@/layouts/DisposicionApp.vue';
import { Motion, AnimatePresence } from 'motion-v';

import { useConfigStore } from '@/stores/tiendaConfig';
import { useUserStore } from '@/stores/tiendaUsuario';

const route = useRoute();
const router = useRouter();
const configStore = useConfigStore();
const userStore = useUserStore();

// Esperar a que el router esté listo para evitar flash de contenido incorrecto
const isRouterReady = ref(false);

const manejarSesionExpirada = () => {
  userStore.logout();
  router.push('/');
};

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:session-expired', manejarSesionExpirada);
  }

  await router.isReady();
  isRouterReady.value = true;
  
  // Inicializar tema por defecto (Homa)
  configStore.loadPreset('homa');
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('auth:session-expired', manejarSesionExpirada);
  }
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
    <router-view v-slot="{ Component }">
      <AnimatePresence mode="wait">
        <Motion 
          v-if="Component" 
          :key="route.path"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -10 }"
          :transition="{ duration: 0.2 }"
        >
          <component :is="Component" />
        </Motion>
      </AnimatePresence>
    </router-view>
  </DisposicionApp>
  
  <!-- Sin Layout (inicio, auth, onboarding) -->
  <router-view v-else v-slot="{ Component }">
      <AnimatePresence mode="wait">
        <Motion 
          v-if="Component" 
          :key="route.path"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.3 }"
        >
          <component :is="Component" />
        </Motion>
      </AnimatePresence>
  </router-view>
</template>

<style>
/* Estilos globales si los necesitas */
</style>


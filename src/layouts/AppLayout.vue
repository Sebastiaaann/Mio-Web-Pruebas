<!-- src/layouts/AppLayout.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavbarLateral from '@/components/layout/NavbarLateral.vue';
import BottomNavigation from '@/components/layout/BottomNavigation.vue';
import { unirClases } from '@/utils/UnirClases';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import { useDark, useToggle, useThrottleFn } from '@vueuse/core';

const route = useRoute();

// Dark Mode Logic
const isDark = useDark();
const toggleDark = useToggle(isDark);

// Título dinámico basado en la ruta
const pageTitle = computed(() => {
  const titles = {
    'dashboard': 'Dashboard',
    'dashboard-bento': 'Dashboard V2',
    'mensajes': 'Mensajes',
    'controles': 'Controles',
    'ayuda': 'Ayuda',
    'perfil': 'Perfil',
    'mediciones': 'Mediciones',
    'recursos': 'Recursos'
  }
  return titles[route.name] || 'Mio+'
});

const sidebarVisible = ref(true);
const isMobile = ref(false);

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768;
  }
};

// Throttle resize handler para mejorar performance
const throttledCheckMobile = useThrottleFn(checkMobile, 200);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

onMounted(() => {
  checkMobile();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', throttledCheckMobile);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', throttledCheckMobile);
  }
});
</script>

<template>
  <div class="homa-layout">
    <!-- Sidebar (Self-contained fixed positioning) -->
    <NavbarLateral 
      :visible="true" 
      :collapsed="!sidebarVisible"
      @toggle="toggleSidebar" 
    />
    
    <!-- Overlay para móvil (Handled inside NavbarLateral now) -->
    
    <!-- Contenido principal -->
    <main 
      :class="unirClases(
        'flex-1 flex flex-col min-h-screen transition-all duration-300 relative',
        // Ajuste de márgenes según el estado del sidebar (72 = 18rem = 288px, 20 = 5rem = 80px)
        sidebarVisible ? 'md:ml-72' : 'md:ml-20'
      )"
    >
      <!-- Header Flotante -->
      <header class="sticky top-0 z-30 px-6 py-4">
        <div class="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between bg-card/60 backdrop-blur-md border border-border/50">
          <div class="flex items-center">
            <button 
              @click="toggleSidebar"
              class="p-2 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition-colors mr-4"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            <h1 class="text-xl font-bold text-foreground tracking-tight">{{ pageTitle }}</h1>
          </div>

          <div class="flex items-center space-x-4">
              <ThemeToggle :isDark="isDark" @toggle="toggleDark()" />
              
              <!-- Placeholder para notificaciones/perfil -->
              <div class="w-8 h-8 rounded-full bg-muted border border-border"></div>
          </div>
        </div>
      </header>
      
      <!-- Área de contenido con scroll -->
      <!-- pb-20 en mobile para dejar espacio al bottom navigation -->
      <div class="flex-1 overflow-y-auto p-6 pt-2 pb-20 md:pb-6">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform opacity-0 translate-y-4"
            enter-to-class="transform opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform opacity-100 translate-y-0"
            leave-to-class="transform opacity-0 -translate-y-4"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- Bottom Navigation para móvil -->
    <BottomNavigation />
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  aside {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
  }
}
</style>
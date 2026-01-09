<!-- src/layouts/AppLayout.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import NavbarLateral from '@/components/layout/NavbarLateral.vue';
import { unirClases } from '@/utils/UnirClases';

const sidebarVisible = ref(true);
const isMobile = ref(false);

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768;
  }
};

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

onMounted(() => {
  checkMobile();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkMobile);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile);
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
        <div class="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between">
          <div class="flex items-center">
            <button 
              @click="toggleSidebar"
              class="p-2 text-slate-500 hover:bg-slate-100 hover:text-homa-primary rounded-lg transition-colors mr-4"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            <h1 class="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          </div>

          <div class="flex items-center space-x-4">
              <!-- Placeholder para notificaciones/perfil -->
              <div class="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </header>
      
      <!-- Área de contenido con scroll -->
      <div class="flex-1 overflow-y-auto p-6 pt-2">
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
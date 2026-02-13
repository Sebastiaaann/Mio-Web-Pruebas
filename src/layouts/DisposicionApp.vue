<!-- src/layouts/DisposicionApp.vue -->
<script setup>
import { ref } from 'vue';
import NavbarLateral from '@/components/layout/NavbarLateral.vue';
import NavegacionInferior from '@/components/layout/NavegacionInferior.vue';
import { unirClases } from '@/utils/UnirClases'

const sidebarVisible = ref(true);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
</script>

<template>
  <div class="homa-layout">
    
   

    <!-- Sidebar (Self-contained fixed positioning) -->
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
        // Ajuste de márgenes según el estado del sidebar (sidebar ahora tiene 280px + 16px de margen = 296px)
        sidebarVisible ? 'md:ml-[296px]' : 'md:ml-[92px]'
      )"
    >
      <!-- Container con fondo gris y bordes redondeados -->
      <div class="flex-1 flex flex-col bg-gray-bg m-2 md:m-4 md:mt-2 rounded-2xl overflow-hidden shadow-sm">
        <!-- Área de contenido con scroll -->
        <div 
          id="contenido-principal"
          tabindex="-1"
          class="flex-1 overflow-y-auto outline-none">
          <slot />
        </div>
      </div>
    </main>
    
    <!-- Bottom Navigation para móvil -->
    <NavegacionInferior />
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

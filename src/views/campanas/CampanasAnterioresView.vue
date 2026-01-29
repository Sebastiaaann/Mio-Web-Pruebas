<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTiendaCampanas } from '@/stores/tiendaCampanas';
import { storeToRefs } from 'pinia';
import { ArrowLeft, Heart, AlertCircle, RefreshCw } from 'lucide-vue-next';

const router = useRouter();
const campanasStore = useTiendaCampanas();
const { todasLasCampanas, cargandoTodas, errorTodas } = storeToRefs(campanasStore);

// Computed para verificar si hay campañas
const hayCampanas = computed(() => todasLasCampanas.value.length > 0);

// Navegar de vuelta
const volverAtras = () => {
  router.push('/inicio');
};

// Recargar campañas
const recargarCampanas = () => {
  campanasStore.cargarTodasLasCampanas();
};

// Cargar campañas al montar
onMounted(() => {
  campanasStore.cargarTodasLasCampanas();
});
</script>

<template>
  <div class="min-h-screen bg-gray-bg">
    <!-- Header -->
    <header class="bg-white border-b border-gray-border sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button 
            @click="volverAtras"
            class="flex items-center gap-2 text-gray-text hover:text-primary transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span class="font-medium">Volver</span>
          </button>
          
          <h1 class="font-display font-bold text-xl text-gray-text">
            Campañas Anteriores
          </h1>
          
          <div class="w-20"></div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Estado de carga -->
      <div v-if="cargandoTodas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border animate-pulse">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div class="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded mb-6 w-full"></div>
          <div class="h-10 bg-gray-200 rounded-xl w-full"></div>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else-if="errorTodas" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 class="font-display font-bold text-lg text-red-700 mb-2">Error al cargar campañas</h3>
        <p class="text-red-600 text-sm mb-4">{{ errorTodas }}</p>
        <button 
          @click="recargarCampanas"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all mx-auto"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!hayCampanas" class="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto">
        <Heart class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="font-display font-bold text-lg text-gray-600 mb-2">No hay campañas disponibles</h3>
        <p class="text-gray-500 text-sm">Actualmente no hay campañas de salud disponibles.</p>
      </div>

      <!-- Lista de campañas -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="campana in todasLasCampanas" 
          :key="campana.id"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <!-- Hover Effect -->
          <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img 
                v-if="campana.imagenUrl" 
                :src="campana.imagenUrl" 
                class="w-8 h-8 object-contain" 
                alt="Icono" 
              />
              <Heart v-else class="w-6 h-6 text-primary" />
            </div>
            <span 
              v-if="campana.activa" 
              class="px-3 py-1 bg-health-green/10 text-health-green text-xs font-label font-bold rounded-full"
            >
              Activa
            </span>
            <span 
              v-else 
              class="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-label font-bold rounded-full"
            >
              Inactiva
            </span>
          </div>
          
          <h3 class="font-display font-bold text-lg text-gray-text mb-2 group-hover:text-primary transition-colors">
            {{ campana.nombre }}
          </h3>
          
          <p class="text-gray-text-light text-sm mb-6 leading-relaxed line-clamp-2 h-10">
            {{ campana.descripcion || 'Campaña de salud disponible para ti' }}
          </p>
          
          <a 
            :href="campana.url" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="block w-full py-3 bg-gray-bg text-gray-text font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-none hover:shadow-lg hover:shadow-primary/30 text-center"
          >
            Ver Detalles
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.font-display { font-family: 'Cabinet Grotesk', sans-serif; }
.font-label { font-family: 'Space Grotesk', sans-serif; }
</style>

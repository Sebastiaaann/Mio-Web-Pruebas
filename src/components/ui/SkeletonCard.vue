<script setup lang="ts">
/**
 * SkeletonCard - Componente de skeleton para tarjetas de carga
 * 
 * Muestra una animación de pulso mientras se cargan los datos.
 * Diseñado para simular la estructura de HealthMetricCard y otras tarjetas.
 */

interface Props {
  /** Si debe mostrar el skeleton de gráfico */
  showChart?: boolean
  /** Altura del skeleton de gráfico en píxeles */
  chartHeight?: number
}

withDefaults(defineProps<Props>(), {
  showChart: true,
  chartHeight: 128
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <!-- Header con icono y título -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Icono skeleton -->
        <div class="w-10 h-10 rounded-lg bg-gray-200"></div>
        <!-- Título skeleton -->
        <div class="space-y-2">
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
          <div class="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <!-- Badge skeleton -->
      <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
    </div>

    <!-- Valor y tendencia -->
    <div class="flex items-end justify-between mb-4">
      <!-- Valor skeleton -->
      <div class="h-8 w-20 bg-gray-200 rounded"></div>
      <!-- Tendencia skeleton -->
      <div class="h-5 w-12 bg-gray-200 rounded"></div>
    </div>

    <!-- Gráfico skeleton -->
    <div 
      v-if="showChart" 
      class="bg-gray-100 rounded-lg"
      :style="{ height: `${chartHeight}px` }"
    >
      <!-- Líneas simuladas del gráfico -->
      <div class="h-full w-full p-4 flex items-end gap-1">
        <div 
          v-for="i in 12" 
          :key="i"
          class="flex-1 bg-gray-200 rounded-t"
          :style="{ 
            height: `${20 + Math.random() * 60}%`,
            opacity: 0.3 + Math.random() * 0.4
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, toRaw } from 'vue';
import Chart from 'chart.js/auto';
import { useLazyLoad } from '@/composables/useLazyLoad';

interface ChartData {
  labels?: string[];
  datasets?: Array<{
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    [key: string]: any;
  }>;
}

const props = defineProps<{
  title: string;
  unit?: string;
  status?: string;
  statusColor?: string;
  value?: string | number;
  subtitle?: string;
  trend?: string;
  trendIcon?: string;
  trendColor?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  chartData?: ChartData;
  chartType?: 'line' | 'bar' | 'radar';
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Lazy loading: solo renderizar el gráfico cuando es visible
const { targetRef, isVisible, hasBeenVisible } = useLazyLoad({
  rootMargin: '100px',
  threshold: 0.1,
  once: true
});

const renderChart = () => {
  if (!chartRef.value || !isVisible.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
      y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 10 }, color: '#9CA3AF' } }
    },
    elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 4 } }
  };

  try {
    if (props.chartData) {
      const rawData = toRaw(props.chartData);
      // Deep clone to ensure no reactivity issues with Chart.js
      const clonedData = JSON.parse(JSON.stringify(rawData));
      
      chartInstance = new Chart(chartRef.value, {
        type: props.chartType || 'line',
        data: clonedData,
        options: commonOptions
      });
    }
  } catch (err) {
    console.error("Error creating chart", err);
  }
};

// Renderizar cuando el componente es visible
watch(isVisible, (visible) => {
  if (visible) {
    renderChart();
  }
});

// Actualizar gráfico cuando cambian los datos (solo si ya es visible)
watch(() => props.chartData, () => {
  if (isVisible.value) {
    renderChart();
  }
}, { deep: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    try {
      chartInstance.destroy();
    } catch (e) {
      console.warn('Error destroying chart:', e);
    }
    chartInstance = null;
  }
});
</script>

<template>
  <div ref="targetRef" class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer hover:shadow-md">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', iconBg]">
          <iconify-icon :icon="icon" :class="`${iconColor} text-xl`"></iconify-icon>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-gray-500">{{ subtitle }}</p>
        </div>
      </div>
      <span v-if="status" :class="['px-2 py-1 rounded-full text-xs font-medium', statusColor]">
        {{ status }}
      </span>
    </div>

    <div class="flex items-end justify-between mb-4">
      <div>
        <span class="text-3xl font-bold text-gray-900">{{ value }}</span>
        <span v-if="unit" class="text-sm text-gray-500 ml-1">{{ unit }}</span>
      </div>
      <div v-if="trend" class="flex items-center gap-1" :class="trendColor">
        <iconify-icon v-if="trendIcon" :icon="trendIcon" class="text-sm"></iconify-icon>
        <span class="text-sm font-medium">{{ trend }}</span>
      </div>
    </div>

    <!-- Lazy loading del gráfico -->
    <div class="h-32 relative">
      <!-- Loading state -->
      <div v-if="!hasBeenVisible" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
        <div class="flex flex-col items-center gap-2">
          <div class="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span class="text-xs text-gray-400">Cargando gráfico...</span>
        </div>
      </div>
      
      <!-- Chart canvas -->
      <canvas 
        v-show="hasBeenVisible"
        ref="chartRef" 
        class="w-full h-full"
      ></canvas>
    </div>
  </div>
</template>
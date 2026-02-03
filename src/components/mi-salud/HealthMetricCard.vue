<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, toRaw, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useLazyLoad } from '@/composables/useLazyLoad';
import { useTheme } from '@/composables/useTheme';

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
  statusType?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  value?: string | number;
  subtitle?: string;
  trend?: string;
  trendIcon?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: string;
  iconColor?: string;
  iconBg?: string;
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

// Usar el composable de tema
const { colors, getChartColors } = useTheme();

/**
 * Clase del badge de estado según el tipo
 */
const statusBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-slate-50 text-slate-700 border border-slate-200'
  };
  return classes[props.statusType || 'neutral'];
});

/**
 * Color del icono de tendencia
 */
const trendColorClass = computed(() => {
  if (props.trendDirection === 'up') return 'text-emerald-600';
  if (props.trendDirection === 'down') return 'text-red-600';
  return 'text-slate-500';
});

/**
 * Renderizar el gráfico
 */
const renderChart = () => {
  if (!chartRef.value || !isVisible.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const chartColors = getChartColors();
  const primaryColor = colors.value.primary;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { 
          font: { size: 10, family: 'Inter' }, 
          color: '#94A3B8' 
        } 
      },
      y: { 
        grid: { 
          display: true,
          color: '#F1F5F9',
          drawBorder: false
        }, 
        ticks: { 
          font: { size: 10, family: 'Inter' }, 
          color: '#94A3B8',
          padding: 8
        },
        border: { display: false }
      }
    },
    elements: { 
      point: { 
        radius: 0, 
        hitRadius: 10, 
        hoverRadius: 4 
      },
      line: { 
        tension: 0.4,
        borderWidth: 2
      }
    }
  };

  try {
    if (props.chartData) {
      const rawData = toRaw(props.chartData);
      const clonedData = JSON.parse(JSON.stringify(rawData));
      
      // Agregar fill y background gradiente a los datasets
      const enhancedDatasets = clonedData.datasets?.map((dataset: any, index: number) => {
        const color = index === 0 ? primaryColor : chartColors.secondary;
        return {
          ...dataset,
          borderColor: color,
          fill: true,
          backgroundColor: (ctx: any) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, 128);
            gradient.addColorStop(0, color + '20'); // 12% opacidad
            gradient.addColorStop(1, color + '05'); // 2% opacidad
            return gradient;
          }
        };
      });
      
      chartInstance = new Chart(chartRef.value, {
        type: props.chartType || 'line',
        data: {
          ...clonedData,
          datasets: enhancedDatasets
        },
        options: commonOptions
      });
    }
  } catch (err) {
    console.error("Error creating chart:", err);
  }
};

// Renderizar cuando el componente es visible
watch(isVisible, (visible) => {
  if (visible) {
    renderChart();
  }
});

// Actualizar gráfico cuando cambian los datos
watch(() => props.chartData, () => {
  if (isVisible.value) {
    renderChart();
  }
}, { deep: true });

// Actualizar gráfico cuando cambia el tema
watch(colors, () => {
  if (isVisible.value && chartInstance) {
    renderChart();
  }
});

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
  <div 
    ref="targetRef" 
    class="card-metric p-5 cursor-pointer"
  >
    <!-- Header con icono y estado -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div 
          class="icon-container icon-container-sm"
          :class="iconBg"
          :style="iconColor ? {} : { backgroundColor: colors.primaryLight, color: colors.primary }"
        >
          <iconify-icon 
            :icon="icon" 
            class="text-lg"
            :class="iconColor"
            :style="iconColor ? {} : { color: colors.primary }"
          ></iconify-icon>
        </div>
        <div>
          <h3 class="h3-premium">{{ title }}</h3>
          <p v-if="subtitle" class="text-secondary text-sm">{{ subtitle }}</p>
        </div>
      </div>
      
      <span 
        v-if="status" 
        class="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
        :class="statusBadgeClass"
      >
        {{ status }}
      </span>
    </div>

    <!-- Valor principal y tendencia -->
    <div class="flex items-end justify-between mb-5">
      <div class="flex items-baseline gap-1">
        <span class="text-3xl font-bold text-slate-900 tracking-tight">{{ value }}</span>
        <span v-if="unit" class="text-secondary text-sm font-medium">{{ unit }}</span>
      </div>
      
      <div 
        v-if="trend" 
        class="flex items-center gap-1 px-2 py-1 rounded-lg"
        :class="trendColorClass"
      >
        <iconify-icon 
          v-if="trendIcon" 
          :icon="trendIcon" 
          class="text-sm"
        ></iconify-icon>
        <span class="text-sm font-semibold">{{ trend }}</span>
      </div>
    </div>

    <!-- Gráfico con lazy loading -->
    <div class="h-32 relative">
      <!-- Loading state -->
      <div 
        v-if="!hasBeenVisible" 
        class="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100"
      >
        <div class="flex flex-col items-center gap-2">
          <div 
            class="w-8 h-8 border-2 border-slate-200 rounded-full animate-spin"
            :style="{ borderTopColor: colors.primary }"
          ></div>
          <span class="text-xs text-slate-400">Cargando...</span>
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

<style scoped>
/* Animación suave al hover */
.card-metric {
  transition: all 0.2s ease-out;
}

.card-metric:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.025);
}

/* Asegurar que el canvas se vea nítido */
canvas {
  display: block;
}
</style>

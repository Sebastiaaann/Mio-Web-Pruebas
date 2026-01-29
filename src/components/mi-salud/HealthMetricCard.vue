<script setup>
import { ref, onMounted, onBeforeUnmount, watch, toRaw } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  title: String,
  unit: String,
  status: String,
  statusColor: {
    type: String,
    default: 'bg-emerald-50 text-emerald-500'
  },
  value: [String, Number],
  subtitle: String,
  trend: String,
  trendIcon: {
    type: String,
    default: 'lucide:trending-down'
  },
  trendColor: {
    type: String,
    default: 'text-emerald-500'
  },
  icon: String,
  iconColor: String,
  iconBg: String,
  chartData: Object,
  chartType: {
    type: String,
    default: 'line'
  }
});

const chartRef = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!chartRef.value) return;

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
            type: props.chartType,
            data: clonedData,
            options: commonOptions
        });
      }
  } catch (err) {
      console.error("Error creating chart", err);
  }
};

onMounted(() => {
  renderChart();
});

watch(() => props.chartData, () => {
    renderChart();
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
  <div class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer hover:shadow-md">
      <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', iconBg]">
                  <iconify-icon :icon="icon" :class="[iconColor, 'text-xl']"></iconify-icon>
              </div>
              <div>
                  <h3 class="font-bold text-gray-900 font-display">{{ title }}</h3>
                  <p class="text-xs text-gray-500 font-label">{{ unit }}</p>
              </div>
          </div>
          <span :class="['px-2 py-1 text-xs font-semibold rounded-full', statusColor]">{{ status }}</span>
      </div>
      <div class="flex items-end gap-4 mb-4">
          <div>
              <span class="font-mono text-3xl font-bold text-gray-900">{{ value }}</span>
              <span class="text-sm text-gray-500 ml-1">{{ subtitle }}</span>
          </div>
          <div :class="['text-sm flex items-center gap-1 font-medium', trendColor]">
              <iconify-icon :icon="trendIcon"></iconify-icon>
              <span>{{ trend }}</span>
          </div>
      </div>
      <div class="chart-container h-48 w-full relative">
          <canvas ref="chartRef"></canvas>
      </div>
  </div>
</template>

<style scoped>
.metric-card:hover {
    transform: translateY(-2px);
}
</style>

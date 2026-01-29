<script setup>
defineProps({
  measurements: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-lg text-gray-900 font-display">Historial de Mediciones</h3>
          <button class="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors">
              <iconify-icon icon="lucide:download"></iconify-icon>
              Exportar
          </button>
      </div>
      <div class="overflow-x-auto">
          <table class="w-full">
              <thead class="bg-gray-50">
                  <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-label">Fecha</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-label">Tipo</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-label">Valor</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-label">Estado</th>
                      <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider font-label">Acciones</th>
                  </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                  <tr v-for="(measurement, index) in measurements" :key="index" class="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">{{ measurement.date }}</div>
                          <div class="text-xs text-gray-500">{{ measurement.time }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center gap-2">
                              <iconify-icon :icon="measurement.icon" :class="measurement.iconColor"></iconify-icon>
                              <span class="text-sm text-gray-900">{{ measurement.type }}</span>
                          </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                          <span class="font-mono text-lg font-semibold text-gray-900">{{ measurement.value }}</span>
                          <span class="text-xs text-gray-500 ml-1">{{ measurement.unit }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="['px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full', measurement.statusBadges]">
                              <span :class="['w-1.5 h-1.5 rounded-full', measurement.statusDot]"></span>
                              {{ measurement.status }}
                          </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right">
                          <button class="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50">
                              <iconify-icon icon="lucide:more-vertical"></iconify-icon>
                          </button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  </div>
</template>

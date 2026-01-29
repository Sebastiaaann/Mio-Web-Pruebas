<script setup>
defineProps({
  controls: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2 font-display">
          <iconify-icon icon="lucide:calendar-clock" class="text-gray-400"></iconify-icon>
          Próximas Mediciones
      </h3>
      <div class="space-y-3">
           <div v-for="control in controls" :key="control.id" class="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-50/50">
              <div class="flex items-center gap-2 mb-1">
                  <iconify-icon :icon="control.icon || 'lucide:activity'" class="text-primary text-sm"></iconify-icon>
                  <span class="text-sm font-bold text-gray-900">{{ control.nombre }}</span>
              </div>
              <p class="text-xs text-gray-500">{{ control.fechaProgramada || 'Próximamente' }}</p>
          </div>
          <div v-if="controls.length === 0" class="text-sm text-gray-500 italic">
              No hay controles programados
          </div>
      </div>
  </div>
</template>

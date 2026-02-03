<script setup>
import { Database, Download, FileJson } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { colors } = useTheme()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-3 mb-6">
      <div 
        class="w-10 h-10 rounded-xl flex items-center justify-center"
        :style="{ backgroundColor: colors.primaryLight, color: colors.primary }"
      >
        <Database class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-lg text-gray-900 font-display">Tus Datos</h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button 
        class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl transition-colors group"
        :style="{ borderColor: 'var(--border-color, #f3f4f6)' }"
        @mouseover="$event.currentTarget.style.borderColor = colors.primary"
        @mouseleave="$event.currentTarget.style.borderColor = '#f3f4f6'"
      >
        <Download 
          class="w-5 h-5 text-gray-400 transition-colors" 
          :style="{ color: 'var(--icon-color, #9ca3af)' }"
          @mouseover="$event.currentTarget.style.color = colors.primary"
        />
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900">Descargar Historial</p>
          <p class="text-xs text-gray-500">PDF con tus registros médicos</p>
        </div>
      </button>
      <button 
        class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl transition-colors group"
        @mouseover="$event.currentTarget.style.borderColor = colors.primary"
        @mouseleave="$event.currentTarget.style.borderColor = '#f3f4f6'"
      >
        <FileJson 
          class="w-5 h-5 text-gray-400 group-hover:text-current transition-colors" 
          :style="{ color: 'var(--icon-color, #9ca3af)' }" 
        />
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900">Exportar Datos (JSON)</p>
          <p class="text-xs text-gray-500">Formato para portabilidad médica</p>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para soportar hover dinámico via CSS variables si fuera necesario, 
   pero inline styles en mouseover es más directo para colores dinámicos JS */
button:hover :deep(svg) {
  color: v-bind('colors.primary') !important;
}
</style>

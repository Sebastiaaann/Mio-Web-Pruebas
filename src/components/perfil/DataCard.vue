<script setup lang="ts">
import { Database, Download, FileJson } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useUserStore } from '@/stores/tiendaUsuario'

const { colors } = useTheme()
const router = useRouter()
const healthStore = useHealthStore()
const userStore = useUserStore()

function irAHistorial(): void {
  router.push('/historial-controles')
}

function onBotonHover(e: MouseEvent): void {
  (e.currentTarget as HTMLButtonElement).style.borderColor = colors.value.primary
}

function onBotonLeave(e: MouseEvent): void {
  (e.currentTarget as HTMLButtonElement).style.borderColor = '#f3f4f6'
}

function onIconoHover(e: MouseEvent): void {
  (e.currentTarget as SVGElement).style.color = colors.value.primary
}

function exportarJSON(): void {
  const exportacion = {
    paciente: userStore.usuario?.nombre ?? 'mio-usuario',
    exportado: new Date().toISOString(),
    historial: healthStore.historialMediciones
  }
  const blob = new Blob([JSON.stringify(exportacion, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `mio-historial-${new Date().toISOString().slice(0, 10)}.json`
  enlace.click()
  URL.revokeObjectURL(url)
}
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
        @mouseover="onBotonHover($event)"
        @mouseleave="onBotonLeave($event)"
        @click="irAHistorial"
      >
        <Download 
          class="w-5 h-5 text-gray-400 transition-colors" 
          :style="{ color: 'var(--icon-color, #9ca3af)' }"
          @mouseover="onIconoHover($event)"
        />
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900">Descargar Historial</p>
          <p class="text-xs text-gray-500">PDF con tus registros médicos</p>
        </div>
      </button>
      <button 
        class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl transition-colors group"
        @mouseover="onBotonHover($event)"
        @mouseleave="onBotonLeave($event)"
        @click="exportarJSON"
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

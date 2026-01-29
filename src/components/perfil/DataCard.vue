<script setup>
import { Database, Download, FileJson } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-emerald-500">
        <Database class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-lg text-gray-900 font-display">Tus Datos</h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-[#FF9500] transition-colors group">
        <Download class="w-5 h-5 text-gray-400 group-hover:text-[#FF9500]" />
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900">Descargar Historial</p>
          <p class="text-xs text-gray-500">PDF con tus registros médicos</p>
        </div>
      </button>
      <button class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-[#FF9500] transition-colors group">
        <FileJson class="w-5 h-5 text-gray-400 group-hover:text-[#FF9500]" />
        <div class="text-left">
          <p class="text-sm font-bold text-gray-900">Exportar Datos (JSON)</p>
          <p class="text-xs text-gray-500">Formato para portabilidad médica</p>
        </div>
      </button>
    </div>
  </div>
</template>

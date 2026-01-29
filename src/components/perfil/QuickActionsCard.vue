<script setup>
import { CreditCard, Download, HelpCircle, ChevronRight } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h4 class="font-bold text-lg text-gray-900 mb-4 font-display">Acciones Rápidas</h4>
    <div class="space-y-3">
      <a href="#" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <CreditCard class="w-5 h-5 text-[#FF9500]" />
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900 text-sm">Historial de pagos</p>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400" />
      </a>
      <a href="#" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Download class="w-5 h-5 text-blue-500" />
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900 text-sm">Exportar datos</p>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400" />
      </a>
      <a href="#" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <HelpCircle class="w-5 h-5 text-emerald-500" />
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900 text-sm">Centro de ayuda</p>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400" />
      </a>
    </div>
  </div>
</template>

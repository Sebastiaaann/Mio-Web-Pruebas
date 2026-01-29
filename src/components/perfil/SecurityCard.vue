<script setup>
import { ShieldCheck, KeyRound, ChevronRight, Smartphone } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
        <ShieldCheck class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-lg text-gray-900 font-display">Seguridad</h3>
    </div>
    <div class="space-y-3">
      <button class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        <div class="flex items-center gap-3">
          <KeyRound class="w-4 h-4 text-gray-400" />
          <span class="text-sm font-medium text-gray-700">Cambiar contraseña</span>
        </div>
        <ChevronRight class="w-4 h-4 text-gray-400" />
      </button>
      <div class="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
        <div class="flex items-center gap-3">
          <Smartphone class="w-4 h-4 text-gray-400" />
          <div>
            <p class="text-sm font-medium text-gray-900">Autenticación en dos pasos (2FA)</p>
            <p class="text-xs text-emerald-500 font-medium">Activo</p>
          </div>
        </div>
        <button class="text-xs text-[#FF9500] font-bold hover:text-orange-600">Gestionar</button>
      </div>
    </div>
  </div>
</template>

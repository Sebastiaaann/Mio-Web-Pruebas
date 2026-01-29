<script setup>
import { ref } from 'vue'
import { Bell } from 'lucide-vue-next'

const emailNotifications = ref(true)
const smsNotifications = ref(false)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF9500]">
        <Bell class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-lg text-gray-900 font-display">Preferencias y Notificaciones</h3>
    </div>
    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div>
          <p class="font-medium text-gray-900">Notificaciones por Email</p>
          <p class="text-xs text-gray-500">Recibe reportes semanales en tu correo</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="emailNotifications" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF9500]"></div>
        </label>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div>
          <p class="font-medium text-gray-900">Alertas por SMS</p>
          <p class="text-xs text-gray-500">Mensajes críticos para controles urgentes</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="smsNotifications" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF9500]"></div>
        </label>
      </div>
    </div>
  </div>
</template>

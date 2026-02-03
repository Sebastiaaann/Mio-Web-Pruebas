<script setup>
import { computed } from 'vue'
import { Mail, Phone } from 'lucide-vue-next'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useTheme } from '@/composables/useTheme'

const { colors } = useTheme()
const userStore = useUserStore()
const email = computed(() => userStore.usuario?.email || 'sebastian.almo9@gmail.com')
const phone = computed(() => userStore.usuario?.phone || '+56 9 1234 5678') // Fallback as mostly this data might be missing
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h4 class="font-bold text-lg text-gray-900 mb-4 font-display">Información de Contacto</h4>
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: colors.primaryLight, color: colors.primary }"
        >
          <Mail class="w-5 h-5" />
        </div>
        <div>
          <p class="text-xs text-gray-500">Email</p>
          <p class="font-medium text-sm text-gray-900 truncate max-w-[150px]">{{ email }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: colors.primaryLight, color: colors.primary }"
        >
          <Phone class="w-5 h-5" />
        </div>
        <div>
          <p class="text-xs text-gray-500">Teléfono</p>
          <p class="font-medium text-sm text-gray-900">{{ phone }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

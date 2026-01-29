<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/tiendaUsuario'
import { CheckCircle } from 'lucide-vue-next'

const userStore = useUserStore()

const userName = computed(() => userStore.nombreCompleto || 'Usuario')
const userEmail = computed(() => userStore.usuario?.email || 'usuario@mio.cl')
const userInitials = computed(() => userStore.iniciales || 'U')
const memberSince = computed(() => {
  const date = userStore.usuario?.createdAt ? new Date(userStore.usuario.createdAt) : new Date()
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
})

// Avatar fallback color logic if needed, or stick to purple
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MI PERFIL</p>
    <p class="text-sm text-gray-500 mb-6">Miembro desde {{ memberSince }}</p>
    
    <div class="flex items-start gap-4 mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
        {{ userInitials }}
      </div>
      <div class="flex-1">
        <h2 class="font-bold text-xl text-gray-900 mb-1">{{ userName }}</h2>
        <p class="text-gray-500 text-sm mb-3">{{ userEmail }}</p>
        
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm text-gray-600">Tu plan actual es:</span>
          <span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-sm font-bold rounded-full">
            <CheckCircle class="w-3 h-3" />
            {{ userStore.usuario?.current_plan?.name || 'MUTUAL' }}
          </span>
        </div>
        <button class="text-sm text-[#FF9500] hover:text-orange-600 font-medium inline-flex items-center gap-1">
          Más información de tu plan
        </button>
      </div>
    </div>
  </div>
</template>

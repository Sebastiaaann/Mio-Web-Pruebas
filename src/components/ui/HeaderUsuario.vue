<script setup lang="ts">
/**
 * HeaderUsuario - Componente reutilizable para la sección de perfil del usuario
 * Muestra: notificaciones, icono médico, nombre, rol e iniciales
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/tiendaUsuario'
import { storeToRefs } from 'pinia'
import { Bell, Briefcase } from 'lucide-vue-next'

// Props para personalizar el componente
interface Props {
  /** Mostrar el icono médico verde (maletín) */
  showMedicalIcon?: boolean
  /** Color del badge de notificaciones */
  notificationBadgeColor?: string
  /** Mostrar badge de notificaciones */
  showNotificationBadge?: boolean
  /** Cantidad de notificaciones (si es 0, solo muestra el punto) */
  notificationCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  showMedicalIcon: true,
  notificationBadgeColor: '#10B981',
  showNotificationBadge: true,
  notificationCount: 0
})

// Emits para eventos
const emit = defineEmits<{
  (e: 'clickNotification'): void
  (e: 'clickProfile'): void
}>()

const userStore = useUserStore()
const { nombreCompleto, usuario } = storeToRefs(userStore)

// Computed para obtener las iniciales del usuario
const iniciales = computed(() => {
  const nombres = String(usuario.value?.nombres || '')
  const apellidos = String(usuario.value?.apellidos || '')
  const primeraLetraNombre = nombres.charAt(0).toUpperCase()
  const primeraLetraApellido = apellidos.charAt(0).toUpperCase()
  return `${primeraLetraNombre}${primeraLetraApellido}`
})

// Computed para formatear el nombre completo
const nombreFormateado = computed(() => {
  return nombreCompleto.value || 'Usuario'
})

// Handlers
const handleNotificationClick = () => {
  emit('clickNotification')
}

const handleProfileClick = () => {
  emit('clickProfile')
}
</script>

<template>
  <div class="flex items-center gap-4 md:gap-5">
    <!-- Botón de Notificaciones -->
    <button
      @click="handleNotificationClick"
      class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
      aria-label="Notificaciones"
    >
      <Bell class="w-5 h-5" />
      <!-- Badge de notificaciones -->
      <span
        v-if="showNotificationBadge"
        class="absolute top-1 right-1 w-2 h-2 rounded-full"
        :style="{ backgroundColor: notificationBadgeColor }"
      ></span>
      <!-- Badge con número si hay notificaciones -->
      <span
        v-if="notificationCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
        :style="{ backgroundColor: notificationBadgeColor }"
      >
        {{ notificationCount > 9 ? '9+' : notificationCount }}
      </span>
    </button>

    <!-- Icono Médico (maletín verde) -->
    <div
      v-if="showMedicalIcon"
      class="relative w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/20"
    >
      <Briefcase class="w-5 h-5 text-white" />
      <!-- Indicador de estado (punto verde claro) -->
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#6EE7B7] border-2 border-white rounded-full"></span>
    </div>

    <!-- Separador vertical -->
    <div class="h-10 w-px bg-gray-200"></div>

    <!-- Información del Usuario -->
    <button
      @click="handleProfileClick"
      class="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1 -ml-2 transition-colors"
    >
      <div class="text-right hidden sm:block">
        <p class="text-sm font-semibold text-gray-900">{{ nombreFormateado }}</p>
        <p class="text-xs text-gray-500">Paciente</p>
      </div>
      <!-- Badge con iniciales -->
      <div class="w-10 h-10 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full flex items-center justify-center">
        <span class="text-sm font-semibold text-[#10B981]">{{ iniciales }}</span>
      </div>
    </button>
  </div>
</template>

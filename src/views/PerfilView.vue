<script setup>
/**
 * PerfilView - Vista de perfil con Bento Grid animado
 */
import { ref, computed } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { 
  Heart, Settings, Bell, X, Moon, Sun, Volume2, VolumeX, LogOut
} from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

// Dark mode
const isDark = useDark({ storageKey: 'mio-theme' })
const toggleDark = useToggle(isDark)

// Modals state
const showSettings = ref(false)
const showNotifications = ref(false)

// Settings state
const notificationsEnabled = ref(true)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
}

const panelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } }
}

// User data
const userName = computed(() => userStore.fullName || 'Usuario')
const userEmail = computed(() => userStore.user?.email || 'usuario@mio.cl')
const memberSince = computed(() => {
  const date = userStore.user?.createdAt ? new Date(userStore.user.createdAt) : new Date()
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
})

// Health stats
const totalMediciones = computed(() => {
  let count = 0
  Object.values(healthStore.historialMediciones || {}).forEach(arr => {
    count += arr.length
  })
  return count
})

const controlesCompletados = computed(() => {
  return healthStore.controlesProximos?.filter(c => c.estado === 'completado').length || 0
})

// Actions
function openSettings() {
  showNotifications.value = false
  showSettings.value = true
}

function openNotifications() {
  showSettings.value = false
  showNotifications.value = true
}

function closeAll() {
  showSettings.value = false
  showNotifications.value = false
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="relative">
    <!-- Main Grid -->
    <Motion
      is="section"
      :variants="containerVariants"
      initial="hidden"
      animate="visible"
      class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 auto-rows-[minmax(180px,auto)]"
      aria-label="Perfil de usuario"
    >
      <!-- SLOT 1: Avatar & Name Card -->
      <Motion
        :variants="itemVariants"
        class="md:col-span-1 md:row-span-1 rounded-2xl bg-white border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        <div>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Mi Perfil</p>
          <p class="text-sm text-gray-500">Miembro desde {{ memberSince }}</p>
        </div>
        <div class="flex items-center gap-4 mt-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ userName }}</h2>
            <p class="text-sm text-gray-500">{{ userEmail }}</p>
          </div>
        </div>
      </Motion>

      <!-- SLOT 2: Health Overview -->
      <Motion
        :variants="itemVariants"
        class="md:col-span-1 md:row-span-3 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow relative group"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100"></div>
        
        <div class="relative h-full flex flex-col p-6">
          <div class="bg-gray-900/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold w-fit mb-4">
            Tu Salud
          </div>
          
          <div class="flex-1 flex flex-col items-center justify-center text-center">
            <div class="w-24 h-24 rounded-full bg-white/80 backdrop-blur flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform">
              <Heart class="w-12 h-12 text-rose-500" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Estado General</h3>
            <p class="text-gray-600 text-sm">
              Mantén tus controles al día para un seguimiento óptimo de tu bienestar.
            </p>
          </div>

          <div class="mt-auto pt-6 border-t border-gray-200/50">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ totalMediciones }}</p>
                <p class="text-xs text-gray-500">Mediciones</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ controlesCompletados }}</p>
                <p class="text-xs text-gray-500">Completados</p>
              </div>
            </div>
          </div>
        </div>
      </Motion>

      <!-- SLOT 3: Motivational Card -->
      <Motion
        :variants="itemVariants"
        class="md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden shadow-sm relative group"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600"></div>
        <div class="absolute inset-0 bg-black/20"></div>
        
        <div class="relative h-full flex flex-col justify-end p-6 text-white">
          <p class="text-sm font-medium opacity-90">Pequeños pasos, grandes cambios. ¡Sigue así!</p>
        </div>
      </Motion>

      <!-- SLOT 4: Settings -->
      <Motion
        :variants="itemVariants"
        class="md:col-span-1 md:row-span-1 rounded-2xl bg-white border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        <div>
          <h4 class="text-base font-bold text-gray-900 mb-1">Configuración</h4>
          <p class="text-xs text-gray-500">Ajusta tus preferencias y notificaciones</p>
        </div>
        
        <div class="flex items-center gap-4 mt-4">
          <button 
            @click="openSettings"
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-violet-100 hover:text-violet-600 flex items-center justify-center text-gray-600 transition-colors"
            aria-label="Abrir configuración"
          >
            <Settings class="w-5 h-5" />
          </button>
          <button 
            @click="openNotifications"
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center text-gray-600 transition-colors relative"
            aria-label="Ver notificaciones"
          >
            <Bell class="w-5 h-5" />
            <!-- Notification badge -->
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </Motion>
    </Motion>

    <!-- Settings Panel Overlay -->
    <AnimatePresence>
      <Motion
        v-if="showSettings"
        :variants="overlayVariants"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeAll"
      >
        <Motion
          :variants="panelVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <header class="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900">Configuración</h2>
            <button 
              @click="closeAll"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </header>

          <div class="p-6 space-y-4">
            <!-- Theme Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Sun v-if="!isDark" class="w-5 h-5 text-amber-500" />
                  <Moon v-else class="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Tema</p>
                  <p class="text-xs text-gray-500">{{ isDark ? 'Modo oscuro' : 'Modo claro' }}</p>
                </div>
              </div>
              <button 
                @click="toggleDark()"
                class="w-12 h-7 rounded-full p-1 transition-colors"
                :class="isDark ? 'bg-indigo-500' : 'bg-gray-300'"
              >
                <div 
                  class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                  :class="isDark ? 'translate-x-5' : 'translate-x-0'"
                ></div>
              </button>
            </div>

            <!-- Notifications Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Volume2 v-if="notificationsEnabled" class="w-5 h-5 text-emerald-500" />
                  <VolumeX v-else class="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">Notificaciones</p>
                  <p class="text-xs text-gray-500">{{ notificationsEnabled ? 'Activadas' : 'Desactivadas' }}</p>
                </div>
              </div>
              <button 
                @click="notificationsEnabled = !notificationsEnabled"
                class="w-12 h-7 rounded-full p-1 transition-colors"
                :class="notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                <div 
                  class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                  :class="notificationsEnabled ? 'translate-x-5' : 'translate-x-0'"
                ></div>
              </button>
            </div>

            <!-- Logout -->
            <button 
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
            >
              <LogOut class="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </Motion>
      </Motion>
    </AnimatePresence>

    <!-- Notifications Panel Overlay -->
    <AnimatePresence>
      <Motion
        v-if="showNotifications"
        :variants="overlayVariants"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeAll"
      >
        <Motion
          :variants="panelVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <header class="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900">Notificaciones</h2>
            <button 
              @click="closeAll"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </header>

          <div class="p-4 space-y-3 max-h-80 overflow-y-auto">
            <!-- Notification items -->
            <div class="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bell class="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Recordatorio de control</p>
                <p class="text-xs text-gray-500">Tienes un control de presión pendiente</p>
                <p class="text-[10px] text-gray-400 mt-1">Hace 2 horas</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Heart class="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">¡Felicidades!</p>
                <p class="text-xs text-gray-500">Completaste 5 controles esta semana</p>
                <p class="text-[10px] text-gray-400 mt-1">Ayer</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Settings class="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Actualización disponible</p>
                <p class="text-xs text-gray-500">Nueva versión con mejoras de rendimiento</p>
                <p class="text-[10px] text-gray-400 mt-1">Hace 3 días</p>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100">
            <button class="w-full text-center text-sm text-violet-600 font-medium hover:underline">
              Ver todas las notificaciones
            </button>
          </div>
        </Motion>
      </Motion>
    </AnimatePresence>
  </div>
</template>
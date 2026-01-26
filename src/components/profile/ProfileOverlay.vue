<script setup>
/**
 * ProfileOverlay - Overlay modal para mostrar perfil de usuario
 * Similar al Settings Panel en PerfilView.vue
 */
import { computed } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { 
  X, 
  Heart, 
  Activity, 
  User, 
  Calendar,
  ArrowRight,
  Settings
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'close', 'navigate-to-profile'])

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

// Animation variants
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
const userName = computed(() => userStore.nombreCompleto || 'Usuario')
const userEmail = computed(() => userStore.usuario?.email || 'usuario@mio.cl')
const userInitials = computed(() => userStore.iniciales || 'U')

const memberSince = computed(() => {
  const date = userStore.usuario?.createdAt ? new Date(userStore.usuario.createdAt) : new Date()
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
function close() {
  emit('update:open', false)
  emit('close')
}

function goToProfile() {
  close()
  router.push('/perfil')
}

function goToSettings() {
  close()
  router.push('/perfil')
  // Note: Could emit event to open settings panel in PerfilView
}
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <Motion
        v-if="open"
        :variants="overlayVariants"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <Motion
          :variants="panelVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <!-- Header -->
          <header class="relative p-6 pb-4">
            <button 
              @click="close"
              class="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar"
            >
              <X class="w-5 h-5" />
            </button>
            
            <p class="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">Mi Perfil</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Miembro desde {{ memberSince }}</p>
          </header>

          <!-- Avatar & Info -->
          <div class="px-6 pb-4">
            <div class="flex items-center gap-4">
              <div class="relative">
                <Avatar class="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage :src="userStore.usuario?.avatar" />
                  <AvatarFallback class="bg-violet-100 text-violet-700 text-xl font-bold flex items-center justify-center">
                    {{ userInitials }}
                  </AvatarFallback>
                </Avatar>
                <div class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-foreground">{{ userName }}</h2>
                <p class="text-sm text-gray-500 dark:text-muted-foreground">{{ userEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Health Stats Card -->
          <div class="mx-6 mb-4 rounded-2xl overflow-hidden">
            <div class="relative bg-gradient-to-br from-primary/10 via-violet-50 to-indigo-50 dark:from-primary/20 dark:via-violet-900/20 dark:to-indigo-900/20 p-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur flex items-center justify-center shadow-sm">
                  <Heart class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-foreground">Tu Salud</h3>
                  <p class="text-xs text-gray-500 dark:text-muted-foreground">Resumen de actividad</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-3 text-center">
                  <div class="flex items-center justify-center gap-1 mb-1">
                    <Activity class="w-4 h-4 text-primary" />
                    <span class="text-2xl font-bold text-gray-900 dark:text-foreground">{{ totalMediciones }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-muted-foreground">Mediciones</p>
                </div>
                <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-3 text-center">
                  <div class="flex items-center justify-center gap-1 mb-1">
                    <Calendar class="w-4 h-4 text-emerald-500" />
                    <span class="text-2xl font-bold text-gray-900 dark:text-foreground">{{ controlesCompletados }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-muted-foreground">Completados</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-2 space-y-2">
            <Button 
              @click="goToProfile"
              class="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span class="flex items-center gap-2">
                <User class="w-4 h-4" />
                Ver Perfil Completo
              </span>
              <ArrowRight class="w-4 h-4" />
            </Button>
            
            <Button 
              @click="goToSettings"
              variant="outline"
              class="w-full justify-between"
            >
              <span class="flex items-center gap-2">
                <Settings class="w-4 h-4" />
                Configuración
              </span>
              <ArrowRight class="w-4 h-4" />
            </Button>
          </div>
        </Motion>
      </Motion>
    </AnimatePresence>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useConfigStore } from '@/stores/tiendaConfig'
import { storeToRefs } from 'pinia'
import { 
  Heart, Settings, Bell, X, Moon, Sun, Volume2, VolumeX, LogOut, CheckCircle, ArrowRight,
  Video, Activity, Calendar, PlayCircle, Bot, Leaf, Youtube, Phone, Fingerprint, ClipboardCheck, Sparkles 
} from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'

// Composables
import { usePlanManager } from '@/composables/usePlanManager'
import { useMotionVariants } from '@/composables/useMotionVariants'
import { useModalManager } from '@/composables/useModalManager'
import { useServiceManager } from '@/composables/useServiceManager'

// Componentes Base del Sistema de Diseño
import BaseCard from '@/components/ui/base/BaseCard.vue'
import SectionHeader from '@/components/ui/base/SectionHeader.vue'
import IconContainer from '@/components/ui/base/IconContainer.vue'
import BaseBadge from '@/components/ui/base/BaseBadge.vue'
import LoadingState from '@/components/ui/base/LoadingState.vue'
import EmptyState from '@/components/ui/base/EmptyState.vue'

// Componentes específicos
import PlanCard from '@/components/ui/PlanCard.vue'
import ClipButton from '@/components/ui/ClipButton.vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()
const configStore = useConfigStore()

const { videos, campanhas } = storeToRefs(healthStore)

// Dark mode
const isDark = useDark({ storageKey: 'mio-theme' })
const toggleDark = useToggle(isDark)

// Composables
const {
  selectedPlanType,
  availablePlans,
  currentPlanMeta,
  isLoading: isLoadingPlans,
  currentTheme,
  setPlanType,
  loadPlans,
  selectPlanForPurchase
} = usePlanManager()

const {
  containerVariants,
  itemVariants,
  overlayVariants,
  panelVariants
} = useMotionVariants()

const {
  isOpen,
  openSettings,
  openNotifications,
  openPlanInfo,
  closeAll
} = useModalManager()

const {
  services,
  isLoading: isLoadingServices,
  getServiceIcon,
  filterServicesByPlan,
  loadServices
} = useServiceManager()

// Settings state
const notificationsEnabled = ref(true)
const isLoggingOut = ref(false)

// User data
const userName = computed(() => userStore.nombreCompleto || 'Usuario')
const userEmail = computed(() => userStore.usuario?.email || 'usuario@mio.cl')
const userInitials = computed(() => userStore.iniciales || 'U')

const memberSince = computed(() => {
  const createdAt = userStore.usuario?.createdAt
  const date = createdAt ? new Date(String(createdAt)) : new Date()
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
async function handleLogout() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await userStore.logout()
    router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

function handlePlanSelection(plan: any) {
  selectPlanForPurchase(plan)
}

onMounted(async () => {
  // Load plans and services
  try {
    const patientId = userStore.usuario?.id || userStore.usuario?.patient_id
    
    // 1. Load services from composable
    await loadServices()
    
    // 2. Load health data
    await healthStore.initMockData()

    if (patientId) {
      // 3. Load plans from composable
      await loadPlans(String(patientId))
    }
  } catch (err) {
    console.error('Error fetching data', err)
  }
})
</script>

<template>
  <div class="relative min-h-screen transition-colors duration-700 ease-in-out -m-6 p-6"
    :style="{ backgroundColor: currentTheme.background_alt || currentTheme.background + '15' }">
      <!-- Main Grid -->
      <Motion
        is="section"
        :variants="containerVariants as any"
        initial="hidden"
        animate="visible"
        class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 auto-rows-[minmax(180px,auto)] mb-8"
        aria-label="Perfil de usuario"
      >
        <!-- SLOT 1: Avatar & Name Card -->
        <Motion
          :variants="itemVariants as any"
        >
          <BaseCard padding="normal" rounded="large" hoverable>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Mi Perfil</p>
              <p class="text-sm text-gray-500">Miembro desde {{ memberSince }}</p>
            </div>
            <div class="flex items-center gap-4 mt-4">
              <div class="relative">
                <Avatar class="h-14 w-14 border-2 border-background shadow-lg">
                  <AvatarImage :src="userStore.usuario?.avatar || ''" />
                  <AvatarFallback class="text-xl font-bold flex items-center justify-center transition-colors duration-300"
                    :style="{ backgroundColor: currentTheme.primary + '20', color: currentTheme.primary }">
                    {{ userInitials }}
                  </AvatarFallback>
                </Avatar>
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full transition-colors duration-300"
                  :style="{ backgroundColor: currentTheme.secondary }"></div>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">{{ userName }}</h2>
                <p class="text-sm text-gray-500">{{ userEmail }}</p>
                
                <!-- Plan Actual Display -->
                <div class="mt-2">
                  <p class="text-xs text-gray-500 mb-1">Tu plan actual es:</p>
                  
                  <div v-if="currentPlanMeta" class="flex flex-col gap-1">
                      <img v-if="currentPlanMeta.logo" :src="currentPlanMeta.logo" :alt="currentPlanMeta.nombre" width="96" height="32" loading="lazy" decoding="async" class="h-8 object-contain w-auto origin-left" />
                      
                      <p v-else class="text-sm font-bold text-gray-800">
                          MIO <span :style="{ color: currentPlanMeta.colorPrimario || '#a3e635' }">{{ currentPlanMeta.nombre }}</span>
                      </p>
                  </div>
                  
                  <p v-else class="text-sm font-bold text-gray-800">
                    MIO <span :style="{ color: (userStore.usuario?.current_plan as any)?.color || '#a3e635' }">{{ (userStore.usuario?.current_plan as any)?.name || 'Mutual' }}</span>
                  </p>

                  <button 
                    @click="openPlanInfo"
                    class="text-xs mt-1 font-medium hover:underline" 
                    :style="{ color: currentPlanMeta?.colorPrimario || (userStore.usuario?.current_plan as any)?.color || '#a3e635' }"
                  >
                    Más información de tu plan
                  </button>
                </div>
              </div>
            </div>
          </BaseCard>
        </Motion>

        <!-- SLOT 2: Health Overview -->
        <Motion
          :variants="itemVariants as any"
          class="md:col-span-1 md:row-span-3"
        >
          <BaseCard padding="normal" rounded="large" hoverable :class="'overflow-hidden relative group h-full'">
            <div class="absolute inset-0 bg-linear-to-br transition-colors duration-500"
              :style="{ 
                background: `linear-gradient(to bottom right, ${currentTheme.background}15, ${currentTheme.primary}10)`
              }"
            ></div>

            <div class="relative h-full flex flex-col">
              <BaseBadge 
                variant="success" 
                size="small"
                class="w-fit mb-4"
                :style="{ backgroundColor: currentTheme.accent, color: 'white' }"
              >
                Tu Salud
              </BaseBadge>

              <div class="flex-1 flex flex-col items-center justify-center text-center">
                <IconContainer
                  size="large"
                  bg-color="white"
                  icon-color="rose"
                  rounded="full"
                  class="mb-4 shadow-lg group-hover:scale-105 transition-transform"
                  :class="'bg-white/80 backdrop-blur'"
                >
                  <Heart class="w-12 h-12 transition-colors duration-300" 
                    :style="{ color: currentTheme.primary }" />
                </IconContainer>
                
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
          </BaseCard>
        </Motion>

        <!-- SLOT 3: Motivational Card -->
        <Motion
          :variants="itemVariants as any"
          class="md:col-span-1 md:row-span-1"
        >
          <BaseCard padding="normal" rounded="large" :class="'overflow-hidden relative group'">
            <div class="absolute inset-0 transition-colors duration-500"
              :style="{ 
                background: `linear-gradient(to bottom right, ${currentTheme.secondary}, ${currentTheme.primary})`
              }"
            ></div>
            <div class="absolute inset-0 bg-black/20"></div>

            <div class="relative h-full flex flex-col justify-end text-white">
              <p class="text-sm font-medium opacity-90">Pequeños pasos, grandes cambios. ¡Sigue así!</p>
            </div>
          </BaseCard>
        </Motion>

        <!-- SLOT 4: Settings -->
        <Motion
          :variants="itemVariants as any"
          class="md:col-span-1 md:row-span-1"
        >
          <BaseCard padding="normal" rounded="large" hoverable>
            <div>
              <h4 class="text-base font-bold text-gray-900 mb-1">Configuración</h4>
              <p class="text-xs text-gray-500">Ajusta tus preferencias y notificaciones</p>
            </div>

            <div class="flex items-center gap-4 mt-4">
              <button 
                @click="openSettings"
                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-colors duration-300 hover:text-white hover:bg-(--hover-color) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                :style="{ '--hover-color': currentTheme.secondary }"
                aria-label="Abrir configuración"
              >
                <Settings class="w-5 h-5" />
              </button>
              <div class="relative">
                <ClipButton
                  bg-class="bg-gray-100"
                  color-class="bg-violet-500"
                  text-class="text-gray-600"
                  @success="openNotifications"
                >
                  <template #baseIcon><Bell class="w-5 h-5" /></template>
                  <template #filledIcon><Bell class="w-5 h-5" fill="currentColor" /></template>
                  <template #successIcon><X class="w-5 h-5" /></template>
                </ClipButton>

                <!-- Notification badge -->
                <BaseBadge 
                  variant="error" 
                  size="small"
                  class="absolute -top-1 -right-1 px-1.5 min-w-4 h-4 flex items-center justify-center"
                  :style="{ backgroundColor: currentTheme.accent }"
                >
                  3
                </BaseBadge>
              </div>
            </div>
          </BaseCard>
        </Motion>
      </Motion>



    

      <!-- SECCIÓN: Selecciona tu plan -->
      <section class="mb-12">
        <SectionHeader 
          title="Selecciona tu plan"
          subtitle="Elige el plan que mejor se adapte a tus necesidades"
          size="normal"
        />
        
        <div class="flex justify-center md:justify-start mt-6">
          <BaseCard padding="small" rounded="full" :hoverable="false">
            <div class="flex gap-1">
              <!-- Botón Esencial -->
              <button 
                @click="setPlanType('esencial')"
                class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                :style="selectedPlanType === 'esencial' ? { 
                  backgroundColor: 'white', 
                  color: currentTheme.primary,
                  borderColor: currentTheme.primary,
                  borderWidth: '2px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                } : { 
                  color: '#9CA3AF',
                  borderColor: 'transparent',
                  borderWidth: '2px'
                }"
              >
                <div 
                  v-if="selectedPlanType === 'esencial'" 
                  class="w-4 h-4 rounded-full border-2" 
                  :style="{ borderColor: currentTheme.primary, backgroundColor: currentTheme.primary }"
                ></div>
                <div 
                  v-else 
                  class="w-4 h-4 rounded-full border border-gray-300"
                ></div>
                Esencial
              </button>
              
              <!-- Botón Mutual -->
              <button 
                @click="setPlanType('mutual')"
                class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                :style="selectedPlanType === 'mutual' ? { 
                  backgroundColor: currentTheme.primary, 
                  color: currentTheme.text_alt,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                } : { 
                  color: '#9CA3AF' 
                }"
              >
                <div v-if="selectedPlanType === 'mutual'"><CheckCircle class="w-5 h-5" /></div>
                Mutual
              </button>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- SECCIÓN: Tus Planes Disponibles -->
      <section v-if="availablePlans.length > 0" class="mb-12">
        <SectionHeader 
          title="Tus Planes Disponibles"
          subtitle="Selecciona el plan que mejor se adapte a tus necesidades"
          size="large"
        />
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <PlanCard
            v-for="plan in availablePlans"
            :key="plan.store_id || plan.id"
            :plan="plan"
            @select="handlePlanSelection"
          />
        </div>
      </section>

      <!-- Loading State for Plans -->
      <section v-else-if="isLoadingPlans" class="mb-12">
        <LoadingState type="skeleton-list" :items="3" />
      </section>

      <!-- Empty State -->
      <section v-else class="mb-12">
        <EmptyState
          :icon="Heart"
          title="No hay planes disponibles"
          description="En este momento no hay planes adicionales disponibles para tu cuenta."
          variant="primary"
          size="medium"
        />
      </section>

    <!-- Settings Panel Overlay -->
    <AnimatePresence>
      <Motion
        v-if="isOpen('settings')"
        :variants="overlayVariants as any"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeAll"
      >
        <Motion
          :variants="panelVariants as any"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="w-full max-w-md"
        >
          <BaseCard padding="none" rounded="large" :hoverable="false" class="overflow-hidden shadow-2xl">
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
              <BaseCard padding="normal" rounded="large" :hoverable="true" clickable>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <IconContainer size="medium" bg-color="white" rounded="full" class="shadow-sm">
                      <Sun v-if="!isDark" class="w-5 h-5 text-amber-500" />
                      <Moon v-else class="w-5 h-5 text-indigo-500" />
                    </IconContainer>
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
              </BaseCard>

              <!-- Notifications Toggle -->
              <BaseCard padding="normal" rounded="large" :hoverable="true" clickable>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <IconContainer size="medium" bg-color="white" rounded="full" class="shadow-sm">
                      <Volume2 v-if="notificationsEnabled" class="w-5 h-5 text-emerald-500" />
                      <VolumeX v-else class="w-5 h-5 text-gray-400" />
                    </IconContainer>
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
              </BaseCard>

              <!-- Logout -->
              <button 
                @click="handleLogout"
                :disabled="isLoggingOut"
                class="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut class="w-5 h-5" />
                {{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
              </button>
            </div>
          </BaseCard>
        </Motion>
      </Motion>
    </AnimatePresence>

    <!-- Notifications Panel Overlay -->
    <AnimatePresence>
      <Motion
        v-if="isOpen('notifications')"
        :variants="overlayVariants as any"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeAll"
      >
        <Motion
          :variants="panelVariants as any"
          initial="hidden"
          animate="visible"
          exit="exit"
          class="w-full max-w-md"
        >
          <BaseCard padding="none" rounded="large" :hoverable="false" class="overflow-hidden shadow-2xl">
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
              <BaseCard padding="small" rounded="large" variant="gray" class="border border-blue-100">
                <div class="flex items-start gap-3">
                  <IconContainer size="small" bg-color="blue" bg-intensity="100" icon-color="blue" icon-intensity="600">
                    <Bell class="w-4 h-4" />
                  </IconContainer>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Recordatorio de control</p>
                    <p class="text-xs text-gray-500">Tienes un control de presión pendiente</p>
                    <p class="text-[10px] text-gray-400 mt-1">Hace 2 horas</p>
                  </div>
                </div>
              </BaseCard>

              <BaseCard padding="small" rounded="large" variant="gray">
                <div class="flex items-start gap-3">
                  <IconContainer size="small" bg-color="emerald" bg-intensity="100" icon-color="emerald" icon-intensity="600">
                    <Heart class="w-4 h-4" />
                  </IconContainer>
                  <div>
                    <p class="text-sm font-medium text-gray-900">¡Felicidades!</p>
                    <p class="text-xs text-gray-500">Completaste 5 controles esta semana</p>
                    <p class="text-[10px] text-gray-400 mt-1">Ayer</p>
                  </div>
                </div>
              </BaseCard>

              <BaseCard padding="small" rounded="large" variant="gray">
                <div class="flex items-start gap-3">
                  <IconContainer size="small" bg-color="violet" bg-intensity="100" icon-color="violet" icon-intensity="600">
                    <Settings class="w-4 h-4" />
                  </IconContainer>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Actualización disponible</p>
                    <p class="text-xs text-gray-500">Nueva versión con mejoras de rendimiento</p>
                    <p class="text-[10px] text-gray-400 mt-1">Hace 3 días</p>
                  </div>
                </div>
              </BaseCard>
            </div>

            <div class="p-4 border-t border-gray-100">
              <button class="w-full text-center text-sm text-violet-600 font-medium hover:underline">
                Ver todas las notificaciones
              </button>
            </div>
          </BaseCard>
        </Motion>
      </Motion>
    </AnimatePresence>

    <!-- Plan Info Modal -->
    <AnimatePresence>
      <Motion
        v-if="isOpen('planInfo')"
        :variants="overlayVariants as any"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeAll"
      >
        <Motion
          :variants="panelVariants as any"
          class="max-w-4xl w-full max-h-[90vh]"
        >
          <BaseCard padding="none" rounded="large" :hoverable="false" class="overflow-hidden shadow-2xl">
            <header class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 class="text-xl font-bold text-gray-900">Planes Disponibles</h2>
              <button 
                @click="closeAll"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </header>

            <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div v-if="availablePlans && availablePlans.length > 0" class="space-y-6">
                <!-- Iteración por cada plan -->
                <BaseCard
                  v-for="(plan, index) in availablePlans" 
                  :key="plan.store_id || index"
                  padding="none"
                  rounded="large"
                  hoverable
                  class="overflow-hidden"
                >
                  <!-- Header del Plan -->
                  <div 
                    class="px-6 py-4 text-white"
                    :style="{ backgroundColor: plan.color || '#7D58E9' }"
                  >
                    <p class="text-sm font-medium opacity-90">{{ plan.title }}</p>
                    <h3 class="text-2xl font-bold mt-1">{{ plan.subtitle }}</h3>
                  </div>

                  <!-- Contenido del Plan -->
                  <div class="p-6 bg-white space-y-4">
                    <!-- Precio -->
                    <div class="flex items-baseline gap-2">
                      <span class="text-sm text-gray-600">{{ plan.subtitle2 }}</span>
                      <span 
                        class="text-3xl font-bold"
                        :style="{ color: plan.color || '#7D58E9' }"
                      >
                        {{ plan.price }}
                      </span>
                    </div>

                    <!-- Descripción -->
                    <BaseCard padding="normal" rounded="large" variant="gray">
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">Descripción del Plan</h4>
                      <p class="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{{ plan.description }}</p>
                    </BaseCard>

                    <!-- Store ID -->
                    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                      <BaseBadge variant="default" size="small">
                        ID: {{ plan.store_id }}
                      </BaseBadge>
                      <button 
                        class="px-6 py-2 rounded-full font-semibold text-white transition-transform hover:scale-105"
                        :style="{ backgroundColor: plan.color || '#7D58E9' }"
                      >
                        Obtener Plan
                      </button>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <EmptyState
                v-else
                :icon="Heart"
                title="No hay planes disponibles"
                description="En este momento no hay planes adicionales disponibles para tu cuenta."
                variant="primary"
                size="small"
              />
            </div>
          </BaseCard>
        </Motion>
      </Motion>
    </AnimatePresence>
  </div>
</template>

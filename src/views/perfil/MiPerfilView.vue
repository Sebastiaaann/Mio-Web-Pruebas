<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useConfigStore } from '@/stores/tiendaConfig'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useHealthStore } from '@/stores/tiendaSalud'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'
import { ArrowLeft, Sun, Moon, Bell, LogOut, CheckCircle, Heart } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'

// Components
import ProfileCard from '@/components/perfil/ProfileCard.vue'
import PreferencesCard from '@/components/perfil/PreferencesCard.vue'
import SecurityCard from '@/components/perfil/SecurityCard.vue'
import DataCard from '@/components/perfil/DataCard.vue'
import QuickActionsCard from '@/components/perfil/QuickActionsCard.vue'
import ContactInfoCard from '@/components/perfil/ContactInfoCard.vue'
import PlanCard from '@/components/ui/PlanCard.vue'
import SectionHeader from '@/components/ui/base/SectionHeader.vue'
import BaseCard from '@/components/ui/base/BaseCard.vue'
import LoadingState from '@/components/ui/base/LoadingState.vue'
import EmptyState from '@/components/ui/base/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()
const configStore = useConfigStore()
const serviciosStore = useTiendaServicios()
const healthStore = useHealthStore()

// Dark mode
const isDark = useDark({ storageKey: 'mio-theme' })
const toggleDark = useToggle(isDark)

// Logout
const isLoggingOut = ref(false)
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

// --- LOGICA DE PLANES (Migrada de PerfilView) ---
const selectedPlanType = ref('mutual') // 'esencial' or 'mutual'
const availablePlans = ref([])
const currentPlanMeta = ref(null)
const isLoadingPlans = ref(false)
const planCambiadoManualmente = ref(false)
const planActivoAPI = ref(null)

// Cargar preferencia
const preferenciaPlanGuardada = localStorage.getItem('mio-plan-activo')
if (preferenciaPlanGuardada) {
  selectedPlanType.value = preferenciaPlanGuardada
  planCambiadoManualmente.value = true
}

const planThemes = {
  esencial: { primary: '#7D58E9', text_alt: '#FFFFFF', logo: '/assets/logo_mio_purple.png' },
  mutual: { primary: '#C4D600', text_alt: '#FFFFFF', logo: '/assets/logo_mutual.png' }
}

watch(selectedPlanType, (newPlanType, oldPlanType) => {
  if (!newPlanType) return
  
  if (oldPlanType && newPlanType !== oldPlanType) {
    planCambiadoManualmente.value = true
    configStore.setPlanActivo(newPlanType)
  }
  
  // Update Local Meta logic (simplified for brevity but functional)
  let foundPlan = availablePlans.value.find(p => (p.nombre || p.subtitle || '').toLowerCase().includes(newPlanType.toLowerCase()))
  if (!foundPlan && planActivoAPI.value && (planActivoAPI.value.name_plan || '').toLowerCase().includes(newPlanType.toLowerCase())) {
    foundPlan = planActivoAPI.value
  }
  
  const theme = planThemes[newPlanType] || planThemes.mutual
  
  if (foundPlan) {
    let mergedLogo = foundPlan.logo || theme.logo
    if (newPlanType.toLowerCase() === 'mutual' && theme?.logo) mergedLogo = theme.logo
    
    currentPlanMeta.value = { 
        ...foundPlan,
        nombre: foundPlan.nombre || foundPlan.name_plan || (newPlanType.charAt(0).toUpperCase() + newPlanType.slice(1)),
        logo: mergedLogo,
        colorPrimario: foundPlan.colorPrimario || theme.primary,
        colors: theme
    }
  } else {
     currentPlanMeta.value = {
        nombre: newPlanType.charAt(0).toUpperCase() + newPlanType.slice(1),
        logo: theme?.logo,
        colorPrimario: theme?.primary,
        colors: theme
     }
  }
})

function handlePlanSelection(plan) {
  logger.info('Plan seleccionado:', plan)
  alert(`Has seleccionado el plan ${plan.subtitle}\n\nEn breve podrás adquirir este plan directamente desde la app.`)
}

onMounted(async () => {
  try {
    isLoadingPlans.value = true
    const patientId = userStore.usuario?.id || userStore.usuario?.patient_id
    
    // Cargar datos básicos
    await serviciosStore.cargarServicios()
    await healthStore.initMockData()

    if (patientId) {
      // Planes actuales
      const plansResponse = await pacienteService.obtenerPlanes(patientId)
      if (plansResponse.success && plansResponse.data?.plans) {
        const activePlan = plansResponse.data.plans.find(p => p.active_plan === "1")
        if (activePlan) {
          planActivoAPI.value = activePlan
          const planName = activePlan.name_plan.toLowerCase()
          let tipoPlanAPI = 'mutual'
          if (planName.includes('esencial') || planName.includes('vital')) tipoPlanAPI = 'esencial'
          
          if (!planCambiadoManualmente.value) {
            selectedPlanType.value = tipoPlanAPI
            configStore.setPlanActivo(tipoPlanAPI)
          }
          currentPlanMeta.value = { ...activePlan, logo: activePlan.config?.logo || planThemes[selectedPlanType.value]?.logo }
        }
      }

      // Más planes disponibles
      const morePlansResponse = await pacienteService.obtenerMasPlanes(patientId)
      if (morePlansResponse.success && morePlansResponse.data?.plans) {
        availablePlans.value = morePlansResponse.data.plans
      } else if (morePlansResponse.success && morePlansResponse.plans) {
        // Fallback estructura antigua
        const existingIds = new Set(availablePlans.value.map(p => p.id))
        morePlansResponse.plans.forEach(p => {
            if (!existingIds.has(p.id)) availablePlans.value.push(p)
        })
      }
    }
  } catch (err) {
    logger.error('Error fetching plans', err)
  } finally {
    isLoadingPlans.value = false
  }
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h1 class="font-display font-bold text-2xl text-gray-900">Perfil</h1>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button @click="toggleDark()" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Sun v-if="!isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
          <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="p-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Column - Main Content -->
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <ProfileCard />
          <PreferencesCard />
          
          <DataCard />

          <!-- SECCIÓN: Selecciona tu plan (Migrada) -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <SectionHeader 
              title="Selecciona tu plan"
              subtitle="Elige el plan que mejor se adapte a tus necesidades"
              size="normal"
              class="mb-6"
            />
            
            <div class="flex justify-center md:justify-start">
              <BaseCard padding="small" rounded="full" :hoverable="false" class="inline-block">
                <div class="flex gap-1">
                  <!-- Botón Esencial -->
                  <button 
                    @click="selectedPlanType = 'esencial'"
                    class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none"
                    :style="selectedPlanType === 'esencial' ? { 
                      backgroundColor: 'white', 
                      color: planThemes.esencial.primary,
                      borderColor: planThemes.esencial.primary,
                      borderWidth: '2px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    } : { 
                      color: '#9CA3AF',
                      borderColor: 'transparent',
                      borderWidth: '2px'
                    }"
                  >
                    <div v-if="selectedPlanType === 'esencial'" class="w-4 h-4 rounded-full border-2" :style="{ borderColor: planThemes.esencial.primary, backgroundColor: planThemes.esencial.primary }"></div>
                    <div v-else class="w-4 h-4 rounded-full border border-gray-300"></div>
                    Esencial
                  </button>
                  
                  <!-- Botón Mutual -->
                  <button 
                    @click="selectedPlanType = 'mutual'"
                    class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none"
                    :style="selectedPlanType === 'mutual' ? { 
                      backgroundColor: planThemes.mutual.primary, 
                      color: planThemes.mutual.text_alt,
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

            <!-- Tus Planes Disponibles -->
            <div v-if="availablePlans.length > 0" class="mt-8">
                <SectionHeader 
                  title="Tus Planes Disponibles"
                  subtitle="Selecciona el plan que mejor se adapte a tus necesidades"
                  size="small"
                  class="mb-4"
                />
                <div class="grid grid-cols-1 gap-6">
                  <PlanCard
                    v-for="plan in availablePlans"
                    :key="plan.store_id || plan.id"
                    :plan="plan"
                    @select="handlePlanSelection"
                  />
                </div>
            </div>
             <!-- Loading State for Plans -->
            <div v-else-if="isLoadingPlans" class="mt-8">
                <LoadingState type="skeleton-list" :items="3" />
            </div>
            <!-- Empty State -->
             <div v-else class="mt-8">
                <EmptyState
                  :icon="Heart"
                  title="No hay planes disponibles"
                  description="En este momento no hay planes adicionales disponibles para tu cuenta."
                  variant="primary"
                  size="medium"
                />
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar Info -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <QuickActionsCard />
          <ContactInfoCard />
          
          <button 
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-2xl text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut class="w-5 h-5" />
            {{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

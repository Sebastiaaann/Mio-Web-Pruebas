<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useConfigStore } from '@/stores/tiendaConfig'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useHealthStore } from '@/stores/tiendaSalud'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'
import { ArrowLeft, Sun, Moon, Bell, LogOut, CheckCircle, Heart, User, Loader2, AlertTriangle } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { useUserInitials } from '@/composables/useUserInitials'
import { useTheme } from '@/composables/useTheme'

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
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const router = useRouter()
const userStore = useUserStore()
const configStore = useConfigStore()
const serviciosStore = useTiendaServicios()
const healthStore = useHealthStore()
const { colors } = useTheme()

// Dark mode
const isDark = useDark({ storageKey: 'mio-theme' })
const toggleDark = useToggle(isDark)

// User initials composable
const { firstName, nombreCompleto } = storeToRefs(userStore)
const { iniciales: userInitials } = useUserInitials(firstName, nombreCompleto)

const logoMutualHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})


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

interface PlanAPI {
  id_plan?: string | number
  name_plan?: string
  active_plan?: string
  logo?: string
  nombre?: string
  colorPrimario?: string
  client_name?: string
  client_brand?: string
  config?: {
    colors?: Record<string, string>
    logo?: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface PlanDisponible {
  id?: string | number
  store_id?: string | number
  nombre?: string
  subtitle?: string
  [key: string]: unknown
}

interface PlanMeta {
  nombre: string
  logo?: string | null
  colorPrimario?: string
  colors?: { primary: string; text_alt: string; logo: string }
  [key: string]: unknown
}

const selectedPlanType = ref('esencial') // 'esencial' or 'mutual'
const availablePlans = ref<PlanDisponible[]>([])
const planesPaciente = ref<PlanAPI[]>([])
const currentPlanMeta = ref<PlanMeta | null>(null)
const isLoadingPlans = ref(false)
const planCambiadoManualmente = ref(false)
const planActivoAPI = ref<PlanAPI | null>(null)
const tienePlanesAlternativos = computed(() => {
  return planesPaciente.value.length > 1 || availablePlans.value.length > 0
})

/**
 * Planes disponibles para comprar, excluyendo los que el paciente ya tiene activos.
 * Se filtra por nombre para evitar mostrar duplicados entre endpoints distintos.
 */
const planesDisponiblesParaComprar = computed(() => {
  const nombresActivos = new Set(
    planesPaciente.value.map(p => (p.name_plan || p.nombre || '').toLowerCase())
  )
  return availablePlans.value.filter(p => {
    const nombre = (p.subtitle || p.nombre || '').toLowerCase()
    return !Array.from(nombresActivos).some(activo => activo.includes(nombre) || nombre.includes(activo))
  })
})

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

// --- ESTADO DEL MODAL DE CONFIRMACIÓN DE CAMBIO DE PLAN ---
const mostrarModalCambio = ref(false)
const planPendiente = ref('')
const planAnterior = ref('')
const cambiandoPlan = ref(false)
const errorCambioPlan = ref('')

/**
 * Aplica la configuración visual del plan (tema, colores, logo)
 * Se usa tanto al confirmar el cambio como al cargar el plan inicial
 */
function aplicarConfiguracionPlan(planType: string) {
  const theme = planThemes[planType as keyof typeof planThemes] || planThemes.esencial
  
  // Buscar el plan en planesPaciente o en el plan activo de la API
  let foundPlan = planesPaciente.value.find(p => (p.name_plan || '').toLowerCase().includes(planType.toLowerCase()))
  if (!foundPlan && planActivoAPI.value && (planActivoAPI.value.name_plan || '').toLowerCase().includes(planType.toLowerCase())) {
    foundPlan = planActivoAPI.value
  }
  
  if (foundPlan) {
    let mergedLogo = foundPlan.logo || theme.logo
    if (planType.toLowerCase() === 'mutual' && theme?.logo) mergedLogo = theme.logo
    
    currentPlanMeta.value = { 
      ...foundPlan,
      nombre: foundPlan.nombre || foundPlan.name_plan || (planType.charAt(0).toUpperCase() + planType.slice(1)),
      logo: mergedLogo,
      colorPrimario: foundPlan.colorPrimario || theme.primary,
      colors: theme
    }
    
    // Aplicar configuración de colores desde el plan encontrado
    if (foundPlan.config?.colors) {
      configStore.setClientConfig({
        client_name: foundPlan.client_name,
        client_brand: foundPlan.client_brand,
        config: foundPlan.config
      })
    } else {
      configStore.loadPreset(planType)
    }

    if (planType.toLowerCase() === 'mutual') {
      configStore.setLogoMutual(foundPlan.config?.logo || null)
    } else {
      configStore.setLogoMutual(null)
    }
  } else {
    currentPlanMeta.value = {
      nombre: planType.charAt(0).toUpperCase() + planType.slice(1),
      logo: theme?.logo,
      colorPrimario: theme?.primary,
      colors: theme
    }
    configStore.loadPreset(planType)
    configStore.setLogoMutual(null)
  }
}

/**
 * Inicia el flujo de cambio de plan mostrando el modal de confirmación
 */
function iniciarCambioPlan(nuevoPlan: string) {
  if (nuevoPlan === selectedPlanType.value) return
  
  planAnterior.value = selectedPlanType.value
  planPendiente.value = nuevoPlan
  errorCambioPlan.value = ''
  mostrarModalCambio.value = true
}

/**
 * Confirma el cambio de plan: llama a la API y actualiza servicios
 */
async function confirmarCambioPlan() {
  cambiandoPlan.value = true
  errorCambioPlan.value = ''
  
  try {
    const patientId = userStore.usuario?.patient_id
    if (!patientId) {
      errorCambioPlan.value = 'No se encontró el ID del paciente.'
      return
    }

    // Buscar el id_plan real del plan destino en planesPaciente
    const planDestino = planesPaciente.value.find(p => 
      (p.name_plan || '').toLowerCase().includes(planPendiente.value.toLowerCase())
    )
    
    if (!planDestino?.id_plan) {
      errorCambioPlan.value = 'No se encontró el plan seleccionado en tu cuenta.'
      return
    }

    // Llamar a la API para actualizar el plan
    const resultado = await pacienteService.actualizarPlan(patientId, planDestino.id_plan!)
    
    if (!resultado.success) {
      errorCambioPlan.value = resultado.error || 'Error al cambiar el plan.'
      return
    }

    // Éxito: aplicar cambios locales
    selectedPlanType.value = planPendiente.value
    planCambiadoManualmente.value = true
    configStore.setPlanActivo(planPendiente.value)
    
    // Aplicar configuración visual del nuevo plan
    aplicarConfiguracionPlan(planPendiente.value)
    
    // Actualizar el plan activo en la lista local
    planesPaciente.value.forEach(p => {
      p.active_plan = p.id_plan === planDestino.id_plan ? "1" : "0"
    })
    planActivoAPI.value = planDestino

    // Recargar servicios desde la API (ahora reflejarán el nuevo plan)
    await serviciosStore.cargarServicios()
    
    // Cerrar modal
    mostrarModalCambio.value = false
    
    logger.info('Plan cambiado exitosamente a:', planPendiente.value)
  } catch (error) {
    logger.error('Error al cambiar plan:', error)
    errorCambioPlan.value = 'Ocurrió un error inesperado. Intente nuevamente.'
  } finally {
    cambiandoPlan.value = false
  }
}

/**
 * Cancela el cambio de plan y cierra el modal
 */
function cancelarCambioPlan() {
  mostrarModalCambio.value = false
  planPendiente.value = ''
  errorCambioPlan.value = ''
}

// Watch para aplicar configuración visual cuando cambia el plan seleccionado
// (solo aplica colores/tema, NO llama a la API - eso se hace en confirmarCambioPlan)
watch(selectedPlanType, (newPlanType) => {
  if (!newPlanType) return
  aplicarConfiguracionPlan(newPlanType)
})

function handlePlanSelection(plan: PlanDisponible) {
  logger.info('Plan seleccionado:', plan)
  
  const planName = (plan.subtitle || plan.nombre || '').toLowerCase()
  let url = ''

  if (planName.includes('vital')) {
    url = 'https://tiendavirtual.miosalud.cl/producto/plan-mio-vital/'
  } else if (planName.includes('balance')) {
    url = 'https://tiendavirtual.miosalud.cl/producto/plan-mio-balance/'
  } else if (planName.includes('oltra')) {
    url = 'https://tiendavirtual.miosalud.cl/producto/mio-plan-oltra/'
  }

  if (url) {
    window.open(url, '_blank')
  } else {
    // Fallback if no URL matches or if it's a different plan
    alert(`Has seleccionado el plan ${plan.subtitle || plan.nombre}\n\nEn breve podrás adquirir este plan directamente desde la app.`)
  }
}

onMounted(async () => {
  try {
    isLoadingPlans.value = true
    const patientId = userStore.usuario?.patient_id
    
    // Cargar datos básicos solo si aún no están en memoria
    if (!serviciosStore.hayServicios && !serviciosStore.cargando) {
      await serviciosStore.cargarServicios()
    }
    await healthStore.initMockData()

    if (patientId) {
      // Planes actuales
      const plansResponse = await pacienteService.obtenerPlanes(patientId)
      const dataPlanes = plansResponse.data as { plans?: PlanAPI[] } | undefined
      const planesActuales: PlanAPI[] = plansResponse.success
        ? (dataPlanes?.plans || (plansResponse.planes as PlanAPI[] | undefined) || [])
        : []

      if (Array.isArray(planesActuales)) {
        planesPaciente.value = planesActuales
        const activePlan = planesActuales.find(p => p.active_plan === "1")
          if (activePlan) {
            planActivoAPI.value = activePlan
            const planName = (activePlan.name_plan || '').toLowerCase()
            let tipoPlanAPI = 'esencial'
            if (planName.includes('esencial') || planName.includes('vital')) tipoPlanAPI = 'esencial'
          
           if (!planCambiadoManualmente.value) {
             selectedPlanType.value = tipoPlanAPI
             configStore.setPlanActivo(tipoPlanAPI)
             await serviciosStore.cargarServicios()
           }
          
           // Aplicar configuración de colores desde la API solo si no hay cambio manual
           if (!planCambiadoManualmente.value && activePlan.config?.colors) {
             configStore.setClientConfig({
               client_name: activePlan.client_name,
               client_brand: activePlan.client_brand,
               config: activePlan.config
             })
           }

           if (tipoPlanAPI === 'mutual') {
             configStore.setLogoMutual(activePlan.config?.logo || null)
           }
          
          currentPlanMeta.value = { ...activePlan, nombre: activePlan.nombre || activePlan.name_plan || '', logo: activePlan.config?.logo || planThemes[selectedPlanType.value as keyof typeof planThemes]?.logo }
        }
      }

      // Más planes disponibles
      const morePlansResponse = await pacienteService.obtenerMasPlanes(patientId)
      const moreData = morePlansResponse.data as { plans?: PlanDisponible[] } | undefined
      if (morePlansResponse.success && moreData?.plans) {
        availablePlans.value = moreData.plans
      } else if (morePlansResponse.success && morePlansResponse.planes) {
        // Fallback estructura antigua
        const existingIds = new Set(availablePlans.value.map(p => p.id))
        ;(morePlansResponse.planes as PlanDisponible[]).forEach(p => {
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
    <HeaderCompleto titulo="Perfil" :mostrar-saludo="false" :show-notification-badge="false" @click-profile="logger.info('Perfil clicked')" />

    <!-- Content -->
    <div class="p-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-12 gap-6">
        <!-- Left Column - Main Content -->
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <ProfileCard />
          <PreferencesCard />
          <DataCard />
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

        <!-- Full Width - Selecciona tu plan (Movido abajo) -->
        <div v-if="tienePlanesAlternativos" class="col-span-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
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
                  @click="iniciarCambioPlan('esencial')"
                  :disabled="cambiandoPlan"
                  class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none disabled:opacity-50"
                  :style="selectedPlanType === 'esencial' ? {
                    backgroundColor: 'white',
                    borderColor: colors.primary,
                    color: colors.primary,
                    borderWidth: '2px',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  } : {
                    color: '#9CA3AF',
                    borderColor: 'transparent',
                    borderWidth: '2px'
                  }"
                >
                  <div v-if="selectedPlanType === 'esencial'" class="w-4 h-4 rounded-full border-2" :style="{ borderColor: colors.primary, backgroundColor: colors.primary }"></div>
                  <div v-else class="w-4 h-4 rounded-full border border-gray-300"></div>
                  Esencial
                </button>

                <!-- Botón Mutual -->
                <button
                  @click="iniciarCambioPlan('mutual')"
                  :disabled="cambiandoPlan"
                  class="flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold transition-all duration-200 focus-visible:outline-none disabled:opacity-50"
                  :style="selectedPlanType === 'mutual' ? {
                    backgroundColor: colors.primary,
                    color: 'white',
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
          <div v-if="planesDisponiblesParaComprar.length > 0" class="mt-8">
              <SectionHeader
                title="Tus Planes Disponibles"
                subtitle="Selecciona el plan que mejor se adapte a tus necesidades"
                size="small"
                class="mb-4 text-h3 text-slate-900"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PlanCard
                  v-for="plan in planesDisponiblesParaComprar"
                  :key="plan.store_id || plan.id"
                  :plan="plan"
                  @select="handlePlanSelection"
                />
              </div>
          </div>
           <!-- Loading State for Plans -->
          <div v-else-if="isLoadingPlans" class="mt-8">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard 
                  v-for="i in 3" 
                  :key="`plan-skeleton-${i}`"
                  :show-chart="false"
                />
              </div>
          </div>
          <!-- Empty State -->
           <div v-else class="mt-8">
              <EmptyState
                :icon="Heart"
                title="No hay planes disponibles"
                description="En este momento no hay planes adicionales disponibles para tu cuenta."
                variant="primary"
                size="medium"
                class="text-h3 text-slate-900"
              />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de cambio de plan -->
    <Dialog v-model:open="mostrarModalCambio">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">
            ¿Cambiar al plan {{ planPendiente.charAt(0).toUpperCase() + planPendiente.slice(1) }}?
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-500 mt-2">
            Se actualizarán tus servicios disponibles según el nuevo plan.
            Este cambio se aplicará de inmediato en tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <!-- Mensaje de error -->
        <div v-if="errorCambioPlan" class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
          <AlertTriangle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-700">{{ errorCambioPlan }}</p>
        </div>

        <DialogFooter class="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            @click="cancelarCambioPlan" 
            :disabled="cambiandoPlan"
            class="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            @click="confirmarCambioPlan" 
            :disabled="cambiandoPlan"
            class="flex-1"
          >
            <Loader2 v-if="cambiandoPlan" class="w-4 h-4 mr-2 animate-spin" />
            {{ cambiandoPlan ? 'Cambiando...' : 'Confirmar cambio' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useConfigStore } from '@/stores/tiendaConfig'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useHealthStore } from '@/stores/tiendaSalud'
import { pacienteService } from '@/services/pacienteService'
import { logger } from '@/utils/logger'
import { LogOut } from 'lucide-vue-next'

// Components
import ProfileCard from '@/components/perfil/ProfileCard.vue'
import PreferencesCard from '@/components/perfil/PreferencesCard.vue'
import DataCard from '@/components/perfil/DataCard.vue'
import QuickActionsCard from '@/components/perfil/QuickActionsCard.vue'
import ContactInfoCard from '@/components/perfil/ContactInfoCard.vue'
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";

const router = useRouter()
const userStore = useUserStore()
const configStore = useConfigStore()
const serviciosStore = useTiendaServicios()
const healthStore = useHealthStore()

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

// --- LOGICA DE PLANES ---

/** Plan tal como llega de la API del paciente */
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

/** Metadatos del plan activo mostrado en la UI */
interface PlanMeta {
  nombre: string
  logo?: string | null
  colorPrimario?: string
  colors?: { primary: string; text_alt: string; logo: string }
  [key: string]: unknown
}

const planesPaciente = ref<PlanAPI[]>([])
const currentPlanMeta = ref<PlanMeta | null>(null)
const isLoadingPlans = ref(false)
const planCambiadoManualmente = ref(false)

// Cargar preferencia
const preferenciaPlanGuardada = localStorage.getItem('mio-plan-activo')
if (preferenciaPlanGuardada) {
  planCambiadoManualmente.value = true
}

const planThemes = {
  esencial: { primary: '#7D58E9', text_alt: '#FFFFFF', logo: '/assets/logo_mio_purple.png' },
  mutual: { primary: '#C4D600', text_alt: '#FFFFFF', logo: '/assets/logo_mutual.png' }
}

onMounted(async () => {
  try {
    isLoadingPlans.value = true
    const patientId = (userStore.usuario?.id || userStore.usuario?.patient_id) as string | number | undefined

    // Cargar datos básicos solo si aún no están en memoria
    if (!serviciosStore.hayServicios && !serviciosStore.cargando) {
      await serviciosStore.cargarServicios()
    }
    await healthStore.initMockData()

    if (patientId) {
      // Planes actuales
      const plansResponse = await pacienteService.obtenerPlanes(patientId)
      const dataPlanes = (plansResponse.data as { plans?: PlanAPI[] } | undefined)
      const planesActuales: PlanAPI[] = plansResponse.success
        ? (dataPlanes?.plans || (plansResponse.planes as PlanAPI[] | undefined) || [])
        : []

      if (Array.isArray(planesActuales)) {
        planesPaciente.value = planesActuales
        const activePlan = planesActuales.find(p => p.active_plan === "1")
        if (activePlan) {
          const planName = (activePlan.name_plan || '').toLowerCase()
          let tipoPlanAPI = 'esencial'
          if (planName.includes('esencial') || planName.includes('vital')) tipoPlanAPI = 'esencial'

          if (!planCambiadoManualmente.value) {
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

          const planThemeKey = (preferenciaPlanGuardada || tipoPlanAPI) as keyof typeof planThemes
          currentPlanMeta.value = {
            ...activePlan,
            nombre: activePlan.nombre || activePlan.name_plan || '',
            logo: activePlan.config?.logo || planThemes[planThemeKey]?.logo
          }
        }
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
</style>

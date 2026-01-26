<script setup>
/**
 * ControlesView - Vista de controles y reportes
 * Muestra timeline de actividad y campañas activas
 * Migrado a shadcn-vue
 */
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHealthStore } from '@/stores/tiendaSalud'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import TarjetaSalud from '@/components/health/TarjetaSalud.vue'
import IconoEstado from '@/components/ui/IconoEstado.vue'
import ControlDetailDialog from '@/components/health/ControlDetailDialog.vue'
import BloodPressureWizard from '@/components/health/BloodPressureWizard.vue'
import WeightWizard from '@/components/health/WeightWizard.vue'
import GlucoseWizard from '@/components/health/GlucoseWizard.vue'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import EncuestaPreventiva from '@/components/forms/EncuestaPreventiva.vue'

// Lucide icons
import { 
  Megaphone, 
  Calendar, 
  History,
  ArrowRight,
  Loader2,
  CalendarX,
  ClipboardCheck,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Minus
} from 'lucide-vue-next'
import { Motion, AnimatePresence } from 'motion-v'

const springTransition = {
  type: "spring",
  duration: 0.5,
  bounce: 0
}


const healthStore = useHealthStore()
const { controlesProximos, campanhas, loading } = storeToRefs(healthStore)

// Dialog State
const isControlDialogOpen = ref(false)
const selectedControl = ref({})
const isHistoryOpen = ref(true)

import { computed } from 'vue'
import { useDateFormat } from '@vueuse/core'

// ... existing code ...

const activityHistory = computed(() => {
  const history = []
  const allHistory = healthStore.historialMediciones
  
  Object.keys(allHistory).forEach(controlId => {
    const measurements = allHistory[controlId]
    measurements.forEach(m => {
       // Find control name if possible, or generic
       let title = m.tipo || 'Medición'
       if (controlId === '1') title = 'Presión Arterial'
       if (controlId === '2') title = 'Peso Corporal'
       if (controlId === '3') title = 'Glicemia'
       
       history.push({
         id: m.id,
         title: title,
         date: useDateFormat(m.fecha, 'DD MMM YYYY').value, // Simple format
         originalDate: new Date(m.fecha),
         value: m.valor,
         unit: m.unidad,
         status: m.estado === 'normal' ? 'completado' : 'pendiente' // Map states
       })
    })
  })
  
  // Sort by date desc
  return history.sort((a, b) => b.originalDate - a.originalDate)
})

onMounted(() => {
  healthStore.fetchControles()
  healthStore.fetchCampanhas()
})

// Encuesta State
const isSurveyOpen = ref(false)

const activeWizard = ref(null)

function handleControlClick(control) {
  selectedControl.value = control
  const name = control.nombre ? control.nombre.toLowerCase() : ''
  
  if (name.includes('presión')) {
    activeWizard.value = 'pressure'
  } else if (name.includes('peso')) {
    activeWizard.value = 'weight'
  } else if (name.includes('glicemia') || name.includes('glucosa')) {
    activeWizard.value = 'glucose'
  } else {
    isControlDialogOpen.value = true
  }
}

function handleControlSubmit(data) {
  console.log('Control registrado:', data)
  
  healthStore.addMedicion(data.controlId, {
    id: Date.now().toString(),
    tipo: 'manual',
    valor: data.value,
    unidad: data.controlId === '1' ? 'mmHg' : 'kg',
    fecha: data.date,
    estado: 'normal'
  })
}

function openSurvey() {
  isControlDialogOpen.value = false // Close detail if open
  isSurveyOpen.value = true
}

function handleSurveyComplete() {
  console.log('Encuesta completada')
  // Refresh data or show success toast
}
</script>

<template>
  <div class="controles-view space-y-6 pb-20 md:pb-6">
    <!-- Header -->
    <header class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Mis Controles
        </h1>
        <p class="text-muted-foreground">
          Gestiona tus controles de salud y revisa tu historial
        </p>
      </div>
      <Button @click="openSurvey" class="bg-primary text-primary-foreground">
        <ClipboardCheck class="mr-2 h-4 w-4" />
        Realizar Encuesta
      </Button>
    </header>
    <!-- Próximos Controles -->
    <section>
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Calendar class="mr-2 h-5 w-5 text-blue-500" />
        Próximos Controles
      </h2>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 text-primary animate-spin" />
      </div>
      
      <!-- Empty state -->
      <Card v-else-if="controlesProximos.length === 0" class="border-dashed">
        <CardContent class="text-center py-8">
          <CalendarX class="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No tienes controles programados</p>
        </CardContent>
      </Card>
      
      <!-- Controls list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TarjetaSalud
          v-for="control in controlesProximos"
          :key="control.id"
          :titulo="control.nombre"
          :descripcion="control.descripcion"
          :fecha="control.fechaProgramada"
          :icono="control.icono"
          :color="control.color"
          :estado="control.estado"
          variant="minimal"
          @click="handleControlClick(control)"
        />
      </div>
    </section>

    <!-- Historial de Actividad -->
    <section class="mt-8">
      <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <button
          @click="isHistoryOpen = !isHistoryOpen"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <Motion
              :animate="{ rotate: isHistoryOpen ? 90 : 0 }"
              :transition="springTransition"
              class="text-gray-400 dark:text-gray-500"
            >
              <ChevronRight :size="16" :stroke-width="2.5" />
            </Motion>
            <div class="flex items-center gap-2">
              <History class="h-5 w-5 text-green-500" />
              <h2 class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                Historial de Actividad
              </h2>
              <span class="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold">
                {{ activityHistory.length }}
              </span>
            </div>
          </div>
        </button>

        <AnimatePresence :initial="false">
          <Motion
            v-if="isHistoryOpen"
            key="content"
            :initial="{ height: 0, opacity: 0 }"
            :animate="{ height: 'auto', opacity: 1 }"
            :exit="{ height: 0, opacity: 0 }"
            :transition="springTransition"
            class="overflow-hidden"
          >
            <!-- Column Headers -->
            <div class="grid grid-cols-[50px_1fr_100px] md:grid-cols-[80px_1fr_150px] px-6 py-3 border-y border-gray-100 dark:border-neutral-800 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/30 dark:bg-neutral-800/30">
              <div class="text-center">Estado</div>
              <div>Detalle</div>
              <div class="text-right">Valor</div>
            </div>

            <!-- List Content -->
            <div class="max-h-100 overflow-y-auto">
              <Motion
                v-if="activityHistory.length > 0"
                class="flex flex-col"
                initial="hidden"
                animate="visible"
              >
                <Motion
                  v-for="(item, index) in activityHistory"
                  :key="index"
                  layout
                  :initial="{ opacity: 0, x: -10 }"
                  :animate="{ opacity: 1, x: 0 }"
                  :transition="{ ...springTransition, delay: index * 0.05 }"
                  class="grid grid-cols-[50px_1fr_100px] md:grid-cols-[80px_1fr_150px] px-6 py-4 border-b border-gray-50 dark:border-neutral-800/30 last:border-none items-center hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer"
                  @click="selectedControl = { nombre: item.title }; isControlDialogOpen = true;" 
                >
                  <!-- Status Icon -->
                  <div class="flex justify-center">
                    <div 
                      class="p-2 rounded-md"
                      :class="{
                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': item.status === 'completado',
                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400': item.status === 'na',
                        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': item.status === 'pendiente'
                      }"
                    >
                      <CheckCircle v-if="item.status === 'completado'" :size="16" stroke-width="2.5" />
                      <Minus v-else-if="item.status === 'na'" :size="16" />
                      <AlertCircle v-else :size="16" stroke-width="2.5" />
                    </div>
                  </div>

                  <!-- Date & Title -->
                  <div class="flex flex-col justify-center">
                    <span class="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                      {{ item.title }}
                    </span>
                    <div class="flex items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <Calendar :size="12" />
                      <span>{{ item.date }}</span>
                    </div>
                  </div>

                  <!-- Value -->
                  <div class="text-right">
                    <span class="text-[14px] font-bold font-mono tabular-nums tracking-tight text-gray-900 dark:text-white block">
                      {{ item.value }}
                    </span>
                    <span class="text-[10px] text-gray-400 uppercase tracking-wider" v-if="item.unit">{{ item.unit }}</span>
                  </div>
                </Motion>
              </Motion>
              
              <Motion
                v-else
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600"
              >
                <History :size="32" class="opacity-20 mb-2" />
                <p class="text-sm font-medium">Sin historial disponible</p>
              </Motion>
            </div>
          </Motion>
        </AnimatePresence>
      </div>
    </section>

    <!-- Dialogo de Detalle de Control (Standard) -->
    <ControlDetailDialog 
      v-model:open="isControlDialogOpen"
      :control="selectedControl"
      @submit="handleControlSubmit"
      @start-survey="openSurvey"
    />

    <!-- Wizard Generico (Light Mode) -->
    <Dialog :open="!!activeWizard" @update:open="(val) => !val && (activeWizard = null)">
      <DialogContent class="sm:max-w-150 p-0 bg-transparent border-none shadow-none text-foreground [&>button]:hidden">
        <DialogTitle class="hidden">Nueva Medición</DialogTitle>
        
        <BloodPressureWizard v-if="activeWizard === 'pressure'" @close="activeWizard = null" />
        <WeightWizard v-if="activeWizard === 'weight'" @close="activeWizard = null" />
        <GlucoseWizard v-if="activeWizard === 'glucose'" @close="activeWizard = null" />
        
      </DialogContent>
    </Dialog>

    <!-- Encuesta Preventiva -->
    <EncuestaPreventiva
      v-model:visible="isSurveyOpen"
      @complete="handleSurveyComplete"
    />
  </div>
</template>

<style scoped>
.campaign-card {
  background: linear-gradient(135deg, oklch(0.618 0.265 288) 0%, #6366F1 100%);
}
</style>

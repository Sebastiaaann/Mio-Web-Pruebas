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
// import ControlFormDialog from '@/components/health/ControlFormDialog.vue'

// Lucide icons
import { 
  Megaphone, 
  Calendar, 
  History,
  ArrowRight,
  Loader2,
  CalendarX
} from 'lucide-vue-next'

const healthStore = useHealthStore()
const { controlesProximos, campanhas, loading } = storeToRefs(healthStore)

// Dialog State
const isControlDialogOpen = ref(false)
const selectedControl = ref({})

onMounted(() => {
  healthStore.fetchControles()
  healthStore.fetchCampanhas()
})

function handleControlClick(control) {
  selectedControl.value = control
  isControlDialogOpen.value = true
}

function handleControlSubmit(data) {
  // console.log('Control registrado desde ControlesView:', data)
}
</script>

<template>
  <div class="controles-view space-y-6 pb-20 md:pb-6">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Mis Controles
      </h1>
      <p class="text-gray-500">
        Gestiona tus controles de salud y revisa tu historial
      </p>
    </header>

    <!-- Campañas Activas -->
    <section v-if="campanhas.length > 0" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Megaphone class="mr-2 h-5 w-5 text-primary" />
        Campañas Activas
      </h2>
      
      <div 
        v-for="campanha in campanhas" 
        :key="campanha.id"
        class="campaign-card relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-indigo-600 p-6 text-white shadow-lg"
      >
        <div class="relative z-10">
          <h3 class="text-xl font-bold mb-2">{{ campanha.nombre }}</h3>
          <p class="text-purple-100 mb-4">{{ campanha.descripcion }}</p>
          <Button 
            variant="secondary"
            size="sm"
            class="bg-white/20 hover:bg-white/30 text-white border-none"
          >
            Ver detalles
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <!-- Decorative pattern -->
        <div class="absolute right-0 top-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="currentColor" />
          </svg>
        </div>
      </div>
    </section>

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
          @click="handleControlClick(control)"
        />
      </div>
    </section>

    <!-- Historial de Actividad -->
    <section class="mt-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <History class="mr-2 h-5 w-5 text-green-500" />
        Historial de Actividad
      </h2>
      
      <Card>
        <CardContent class="p-6">
          <div class="space-y-4">
            <!-- Timeline items -->
            <div class="timeline-item flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
              <IconoEstado status="completado" size="md" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">Control de Peso realizado</p>
                <p class="text-sm text-gray-500">Hace 3 días</p>
              </div>
              <span class="text-xs text-gray-400">72.5 kg</span>
            </div>
            
            <div class="timeline-item flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
              <IconoEstado status="completado" size="md" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">Presión Arterial medida</p>
                <p class="text-sm text-gray-500">Hace 1 semana</p>
              </div>
              <span class="text-xs text-gray-400">120/80</span>
            </div>
            
            <div class="timeline-item flex items-start space-x-4 pb-4 last:border-0">
              <IconoEstado status="na" size="md" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">Glicemia</p>
                <p class="text-sm text-gray-500">Sin registro previo</p>
              </div>
              <span class="text-xs text-gray-400">--</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Dialogo de Control -->
    <!-- <ControlFormDialog 
      v-model:open="isControlDialogOpen"
      :control="selectedControl"
      @submit="handleControlSubmit"
    /> -->
  </div>
</template>

<style scoped>
.campaign-card {
  background: linear-gradient(135deg, oklch(0.618 0.265 288) 0%, #6366F1 100%);
}
</style>

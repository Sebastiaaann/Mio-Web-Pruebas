<script setup>
/**
 * ControlDetailDialog - Modal con detalle de control de salud
 * Muestra información detallada, historial y permite registrar nuevas mediciones
 */
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { 
  Activity, 
  Calendar, 
  Clock, 
  Plus, 
  History, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Minus
} from 'lucide-vue-next'
import { Motion, AnimatePresence } from 'motion-v'

// Configuración de transición estilo "Jakub"
const springTransition = {
  type: "spring",
  duration: 0.5,
  bounce: 0
}
import { useHealthStore } from '@/stores/tiendaSalud'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  control: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:open', 'submit', 'start-survey'])

const healthStore = useHealthStore()
const isRegistering = ref(false)
const isHistoryOpen = ref(true)
const newValue = ref('')
const newDate = ref(new Date().toISOString().split('T')[0])

// History data from store
const history = computed(() => {
  if (!props.control.id) return []
  
  const storeHistory = healthStore.historialMediciones[props.control.id] || []
  
  // Map store format to display format if needed
  return storeHistory.map(h => ({
    date: h.fecha,
    value: h.valor,
    unit: h.unidad,
    status: h.estado
  }))
})

function handleSave() {
  if (!newValue.value) return
  
  emit('submit', {
    controlId: props.control.id,
    value: newValue.value,
    date: newDate.value
  })
  
  isRegistering.value = false
  newValue.value = ''
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] p-0 overflow-hidden gap-0 rounded-2xl">
      
      <!-- Header con gradiente -->
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 border-b border-border">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div 
              class="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
              :style="{ backgroundColor: control.color + '20', color: control.color }"
            >
              <i :class="control.icono" class="text-xl"></i>
            </div>
            <div>
              <DialogTitle class="text-xl font-bold">{{ control.nombre }}</DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground mt-1 text-pretty">
                {{ control.descripcion }}
              </DialogDescription>
            </div>
          </div>
          <Badge :variant="control.estado === 'pendiente' ? 'secondary' : 'default'">
            {{ control.estado }}
          </Badge>
        </div>

        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-1.5">
            <Calendar class="h-4 w-4" />
            <span>Próximo: {{ control.fechaProgramada || 'Sin fecha' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Clock class="h-4 w-4" />
            <span>Frecuencia: Mensual</span>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-6">
        
        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3" v-if="!isRegistering">
          <Button class="w-full" @click="isRegistering = true">
            <Plus class="mr-2 h-4 w-4" />
            Registrar Medición
          </Button>
          <Button variant="outline" class="w-full" @click="$emit('start-survey')">
            <ClipboardList class="mr-2 h-4 w-4" />
            Encuesta relacionada
          </Button>
        </div>

        <!-- Registration Form -->
        <div v-if="isRegistering" class="bg-muted/50 p-4 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-sm">Nueva Medición</h4>
            <Button variant="ghost" size="sm" class="h-auto p-0 text-muted-foreground" @click="isRegistering = false">Cancelar</Button>
          </div>
          
          <div class="grid gap-4 py-2">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="fecha">Fecha</Label>
                <Input id="fecha" type="date" v-model="newDate" />
              </div>
              <div class="space-y-2">
                <Label for="valor">Valor</Label>
                <div class="relative">
                  <Input id="valor" v-model="newValue" placeholder="Ej: 120/80" />
                  <span class="absolute right-3 top-2.5 text-xs text-muted-foreground">
                    {{ control.nombre?.includes('Peso') ? 'kg' : (control.nombre?.includes('Presión') ? 'mmHg' : '') }}
                  </span>
                </div>
              </div>
            </div>
            <Button @click="handleSave">Guardar Registro</Button>
          </div>
        </div>

        <!-- History (Collapsible) -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <button
            @click="isHistoryOpen = !isHistoryOpen"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
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
                <History class="h-4 w-4 text-indigo-500" />
                <span class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Historial de Actividad
                </span>
                <Badge variant="secondary" class="ml-2 text-[10px] h-5 px-1.5">
                  {{ history.length }}
                </Badge>
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
              <!-- List Headers -->
              <div class="grid grid-cols-[50px_1fr_100px] px-4 py-2 border-y border-gray-100 dark:border-neutral-800 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/30 dark:bg-neutral-800/30">
                <div class="text-center">Estado</div>
                <div>Detalle</div>
                <div class="text-right">Valor</div>
              </div>

              <!-- List Content -->
              <div class="max-h-[250px] overflow-y-auto">
                <Motion
                  v-if="history.length > 0"
                  class="flex flex-col"
                  initial="hidden"
                  animate="visible"
                >
                  <Motion
                    v-for="(item, index) in history"
                    :key="index"
                    layout
                    :initial="{ opacity: 0, x: -10 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :transition="{ ...springTransition, delay: index * 0.05 }"
                    class="grid grid-cols-[50px_1fr_100px] px-4 py-3 border-b border-gray-50 dark:border-neutral-800/30 last:border-none items-center hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <!-- Status Icon -->
                    <div class="flex justify-center">
                      <div 
                        class="p-1.5 rounded-full"
                        :class="{
                          'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': item.status === 'normal',
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': item.status === 'alerta',
                          'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': item.status === 'critico'
                        }"
                      >
                        <CheckCircle v-if="item.status === 'normal'" :size="14" stroke-width="2.5" />
                        <AlertCircle v-else-if="item.status === 'alerta'" :size="14" stroke-width="2.5" />
                        <AlertTriangle v-else-if="item.status === 'critico'" :size="14" stroke-width="2.5" />
                        <Minus v-else :size="14" />
                      </div>
                    </div>

                    <!-- Date & Title -->
                    <div class="flex flex-col justify-center">
                      <span class="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                        {{ control.nombre?.replace('Control de ', '') || 'Medición' }}
                      </span>
                      <div class="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                        <Calendar :size="10" />
                        <span>{{ item.date }}</span>
                      </div>
                    </div>

                    <!-- Value -->
                    <div class="text-right">
                      <span class="text-[13px] font-bold font-mono tabular-nums tracking-tight text-gray-900 dark:text-white">
                        {{ item.value }}
                      </span>
                      <span class="text-[10px] text-gray-400 ml-1">{{ item.unit }}</span>
                    </div>
                  </Motion>
                </Motion>
                
                <Motion
                  v-else
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  class="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-600"
                >
                  <History :size="24" class="opacity-20 mb-2" />
                  <p class="text-xs font-medium">Sin historial disponible</p>
                </Motion>
              </div>
            </Motion>
          </AnimatePresence>
        </div>
      </div>
      
    </DialogContent>
  </Dialog>
</template>

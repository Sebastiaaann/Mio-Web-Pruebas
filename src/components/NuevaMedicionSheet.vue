<script setup lang="ts">
/**
 * NuevaMedicionSheet - Componente para registrar nuevas mediciones de salud
 * Muestra un Sheet lateral con formularios para peso, presion arterial y glicemia
 */
import { ref, onMounted } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet/index.js"
import {
  Scale,
  Heart,
  Droplet,
  X,
  Loader2,
  ArrowLeft
} from 'lucide-vue-next'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { getAvailableProtocols } from '@/services/healthPlanService'
import type { Control } from '@/types/salud'

// Props y Emits
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Stores
const userStore = useTiendaUsuario()
const healthStore = useHealthStore()

// Estado
const protocols = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const guardando = ref<Record<string, boolean>>({})
const exito = ref<Record<string, boolean>>({})

// Formularios para cada tipo de control
const formPeso = ref({ peso: '' })
const formPresion = ref({ sistolica: '', diastolica: '' })
const formGlicemia = ref({ glucosa: '' })

// Notas generales
const notas = ref('')

// Cargar protocolos al montar
onMounted(async () => {
  await cargarProtocolos()
})

// Cargar protocolos disponibles
async function cargarProtocolos() {
  isLoading.value = true
  error.value = null

  try {
    const patientId = userStore.usuario?.patient_id

    if (!patientId) {
      throw new Error('No se encontro ID del paciente')
    }

    const result = await getAvailableProtocols(String(patientId))

    if (result.success) {
      // Filtrar solo los 3 protocolos principales
      protocols.value = (result.data as any[]).filter(protocol => {
        const name = protocol.name?.toLowerCase() || ''
        return name.includes('peso') || 
               name.includes('presion') || 
               name.includes('tension') ||
               name.includes('glucosa') || 
               name.includes('glicemia')
      }).slice(0, 3)
    } else {
      throw new Error(result.error as string || 'No se pudieron cargar los protocolos')
    }
  } catch (err) {
    console.error('Error cargando protocolos:', err)
    error.value = (err as Error).message || 'Error al cargar los protocolos disponibles'
  } finally {
    isLoading.value = false
  }
}

// Obtener icono segun el tipo de protocolo
function getProtocolIcon(name: string) {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('presion') || lowerName.includes('tension')) return Heart
  if (lowerName.includes('peso')) return Scale
  if (lowerName.includes('glucosa') || lowerName.includes('glicemia')) return Droplet
  return Scale
}

// Obtener color segun el tipo de protocolo
function getProtocolColor(name: string) {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('presion') || lowerName.includes('tension')) {
    return { bg: 'bg-red-50', icon: 'text-red-500', button: 'bg-red-600 hover:bg-red-700' }
  }
  if (lowerName.includes('peso')) {
    return { bg: 'bg-orange-50', icon: 'text-orange-500', button: 'bg-orange-500 hover:bg-orange-600' }
  }
  if (lowerName.includes('glucosa') || lowerName.includes('glicemia')) {
    return { bg: 'bg-blue-50', icon: 'text-blue-500', button: 'bg-blue-500 hover:bg-blue-600' }
  }
  return { bg: 'bg-gray-50', icon: 'text-gray-600', button: 'bg-gray-600 hover:bg-gray-700' }
}

// Obtener unidad segun tipo
function getUnit(name: string) {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('peso')) return 'kg'
  if (lowerName.includes('presion') || lowerName.includes('tension')) return 'mmHg'
  if (lowerName.includes('glucosa') || lowerName.includes('glicemia')) return 'mg/dL'
  return ''
}

// Guardar medicion individual
async function guardarMedicion(protocol: any) {
  const protocolId = protocol.id.toString()
  guardando.value[protocolId] = true
  exito.value[protocolId] = false

  try {
    const patientId = userStore.usuario?.patient_id
    
    if (!patientId) {
      throw new Error('No se encontro ID del paciente')
    }

    // Preparar datos segun el tipo de protocolo
    let value: any
    const name = protocol.name?.toLowerCase() || ''
    
    if (name.includes('peso')) {
      if (!formPeso.value.peso) throw new Error('Ingresa el peso')
      value = parseFloat(formPeso.value.peso)
    } else if (name.includes('presion') || name.includes('tension')) {
      if (!formPresion.value.sistolica || !formPresion.value.diastolica) {
        throw new Error('Ingresa ambos valores de presion')
      }
      value = {
        sistolica: parseInt(formPresion.value.sistolica),
        diastolica: parseInt(formPresion.value.diastolica)
      }
    } else if (name.includes('glucosa') || name.includes('glicemia')) {
      if (!formGlicemia.value.glucosa) throw new Error('Ingresa el valor de glucosa')
      value = parseInt(formGlicemia.value.glucosa)
    }

    // Crear objeto de control
    const nuevaMedicion = {
      patient_id: String(patientId),
      protocol_id: protocol.id,
      value: value,
      notes: notas.value || undefined,
      fecha: new Date().toISOString()
    }

    // Guardar en el store
    await healthStore.agregarControl(nuevaMedicion as any)

    // Marcar exito
    exito.value[protocolId] = true

    // Limpiar formulario
    if (name.includes('peso')) formPeso.value.peso = ''
    else if (name.includes('presion') || name.includes('tension')) {
      formPresion.value.sistolica = ''
      formPresion.value.diastolica = ''
    } else if (name.includes('glucosa') || name.includes('glicemia')) {
      formGlicemia.value.glucosa = ''
    }

    // Ocultar mensaje de exito despues de 3 segundos
    setTimeout(() => { exito.value[protocolId] = false }, 3000)

  } catch (err) {
    console.error('Error guardando medicion:', err)
    alert((err as Error).message || 'Error al guardar la medicion')
  } finally {
    guardando.value[protocolId] = false
  }
}

// Cerrar sheet
function cerrarSheet() {
  emit('update:open', false)
}

// Verificar si un formulario esta completo
function isFormCompleto(protocol: any): boolean {
  const name = protocol.name?.toLowerCase() || ''
  if (name.includes('peso')) return !!formPeso.value.peso
  else if (name.includes('presion') || name.includes('tension')) {
    return !!formPresion.value.sistolica && !!formPresion.value.diastolica
  } else if (name.includes('glucosa') || name.includes('glicemia')) {
    return !!formGlicemia.value.glucosa
  }
  return false
}
</script>

<template>
  <Sheet :open="props.open" @update:open="emit('update:open', $event)">
    <SheetContent side="left" class="w-full sm:w-[480px] p-0 flex flex-col bg-white">
      <!-- Header -->
      <SheetHeader class="px-6 py-5 border-b border-gray-100 shrink-0">
        <div class="flex items-center justify-between">
          <button 
            @click="cerrarSheet"
            class="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span class="font-medium text-sm">Nueva Medicion</span>
          </button>
          <button 
            @click="cerrarSheet"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </SheetHeader>

      <!-- Contenido scrollable -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-8">
          
          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
            <Loader2 class="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p class="text-gray-500 text-sm">Cargando controles disponibles...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <X class="w-6 h-6 text-red-500" />
            </div>
            <p class="text-red-600 text-sm font-medium mb-2">{{ error }}</p>
            <button
              @click="cargarProtocolos"
              class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Reintentar
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="protocols.length === 0" class="flex flex-col items-center justify-center py-12">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Scale class="w-6 h-6 text-gray-400" />
            </div>
            <p class="text-gray-600 text-sm font-medium mb-1">No hay controles disponibles</p>
            <p class="text-gray-400 text-xs text-center max-w-xs">
              No tienes protocolos de control asignados en tu plan actual.
            </p>
          </div>

          <!-- Formularios -->
          <template v-else>
            <!-- Seccion de Notas -->
            <div class="space-y-3">
              <h3 class="font-semibold text-gray-900 text-base">Datos del Control</h3>
              <div class="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Notas (opcional)</label>
                  <textarea
                    v-model="notas"
                    placeholder="Agrega observaciones sobre este control..."
                    rows="3"
                    class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Controles Individuales -->
            <div class="space-y-6">
              <div
                v-for="protocol in protocols"
                :key="protocol.id"
                class="space-y-3"
              >
                <!-- Header del Control -->
                <div class="flex items-center gap-3">
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="getProtocolColor(protocol.name).bg"
                  >
                    <component
                      :is="getProtocolIcon(protocol.name)"
                      class="w-5 h-5"
                      :class="getProtocolColor(protocol.name).icon"
                    />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 text-sm">{{ protocol.name }}</h4>
                    <p class="text-xs text-gray-500">{{ getUnit(protocol.name) }}</p>
                  </div>
                </div>

                <!-- Formulario -->
                <div class="bg-gray-50 rounded-xl p-4 space-y-3">
                  <!-- Peso -->
                  <template v-if="protocol.name?.toLowerCase().includes('peso')">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Peso (kg)</label>
                      <input
                        v-model="formPeso.peso"
                        type="number"
                        step="0.1"
                        placeholder="Ej: 75.5"
                        class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </template>

                  <!-- Presion Arterial -->
                  <template v-else-if="protocol.name?.toLowerCase().includes('presion') || protocol.name?.toLowerCase().includes('tension')">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Sistolica</label>
                        <input
                          v-model="formPresion.sistolica"
                          type="number"
                          placeholder="120"
                          class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Diastolica</label>
                        <input
                          v-model="formPresion.diastolica"
                          type="number"
                          placeholder="80"
                          class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </template>

                  <!-- Glicemia -->
                  <template v-else-if="protocol.name?.toLowerCase().includes('glucosa') || protocol.name?.toLowerCase().includes('glicemia')">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Glucosa (mg/dL)</label>
                      <input
                        v-model="formGlicemia.glucosa"
                        type="number"
                        placeholder="Ej: 95"
                        class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </template>

                  <!-- Boton Guardar Individual -->
                  <div class="flex items-center justify-end gap-2 pt-2">
                    <span 
                      v-if="exito[protocol.id]" 
                      class="text-xs text-green-600 font-medium flex items-center gap-1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Guardado
                    </span>
                    <button
                      @click="guardarMedicion(protocol)"
                      :disabled="guardando[protocol.id] || !isFormCompleto(protocol)"
                      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="getProtocolColor(protocol.name).button + ' text-white'"
                    >
                      <span v-if="guardando[protocol.id]" class="flex items-center gap-1">
                        <Loader2 class="w-4 h-4 animate-spin" />
                        Guardando...
                      </span>
                      <span v-else>Guardar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
</style>

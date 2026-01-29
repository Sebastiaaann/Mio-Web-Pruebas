<script setup>
/**
 * DynamicWizard - Wizard genérico que carga pasos dinámicamente desde protocolos API
 * 
 * Este componente:
 * 1. Recibe un protocol_id
 * 2. Carga el diagrama del protocolo desde la API
 * 3. Parsea los componentes y los ordena por z_order
 * 4. Renderiza cada paso con el componente correspondiente según su tipo
 * 5. Maneja la navegación y el estado de las respuestas
 * 6. Envía las observaciones al completar
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { getProtocol, saveProtocolObservations } from '@/services/protocolService'

// Componentes de pasos
import QuestionStep from './step-types/QuestionStep.vue'
import TensiometerStep from './step-types/TensiometerStep.vue'
import WeightStep from './step-types/WeightStep.vue'
import GlucometerStep from './step-types/GlucometerStep.vue'
import TextStep from './step-types/TextStep.vue'

// Componentes UI
import WizardProgress from './WizardProgress.vue'
import WizardNavigation from './WizardNavigation.vue'
import { Loader2, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  protocolId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'complete'])

// Stores y router
const route = useRoute()
const router = useRouter()
const userStore = useTiendaUsuario()

// Estado
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref(null)
const protocolData = ref(null)
const steps = ref([])
const currentStepIndex = ref(0)
const responses = ref({})
const stepValid = ref(false)

// Mapeo de tipos de paso a componentes
const stepComponents = {
  question: QuestionStep,
  tensiometer: TensiometerStep,
  weight: WeightStep,
  glucometer: GlucometerStep,
  text: TextStep
}

// Computed
const currentStep = computed(() => visibleSteps.value[currentStepIndex.value])
const currentStepComponent = computed(() => {
  if (!currentStep.value) return null
  return stepComponents[currentStep.value.type] || TextStep
})
const totalSteps = computed(() => visibleSteps.value.length)
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === visibleSteps.value.length - 1)

const currentStepValue = computed(() => {
  if (!currentStep.value) return null
  return responses.value[currentStep.value.id] || null
})

// Cargar protocolo desde API
async function loadProtocol() {
  isLoading.value = true
  error.value = null

  try {
    console.log('Cargando protocolo:', props.protocolId)

    // Usar el servicio REST directamente
    const result = await getProtocol(props.protocolId)

    console.log('Resultado de la API:', result)

    if (!result) {
      throw new Error('No se pudo cargar el protocolo')
    }

    // La API retorna { success: true, data: { protocol: [...] } }
    const protocol = result.data?.protocol?.[0] || result
    protocolData.value = protocol
    parseProtocolSteps(protocol)
  } catch (err) {
    console.error('Error cargando protocolo:', err)
    error.value = err.message || 'No se pudo cargar el protocolo. Por favor intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

// Parsear pasos del protocolo
function parseProtocolSteps(protocol) {
  if (!protocol.diagram) {
    steps.value = []
    return
  }

  try {
    const diagram = typeof protocol.diagram === 'string'
      ? JSON.parse(protocol.diagram)
      : protocol.diagram

    console.log('Diagrama parseado:', diagram)

    // La API retorna { components: [...], links: [...] }
    const components = diagram.components || []
    const links = diagram.links || []

    if (!Array.isArray(components)) {
      console.error('Components no es un array:', components)
      steps.value = []
      return
    }

    console.log('Componentes encontrados:', components.length)
    console.log('Links encontrados:', links.length)

    // Crear mapa de condiciones por componente destino
    const conditionsByTarget = {}
    links.forEach(link => {
      const targetId = link.target_component_id
      if (link.dynamic_data?.conditions && link.dynamic_data.conditions.length > 0) {
        if (!conditionsByTarget[targetId]) {
          conditionsByTarget[targetId] = []
        }
        conditionsByTarget[targetId].push({
          sourceId: link.source_component_id,
          conditions: link.dynamic_data.conditions
        })
      }
    })

    console.log('Condiciones por target:', conditionsByTarget)

    // Ordenar por z_order
    components.sort((a, b) => (a.z_order || 0) - (b.z_order || 0))

    // Filtrar solo componentes que deben mostrarse
    steps.value = components.filter(comp => {
      const validTypes = ['question', 'tensiometer', 'weight', 'glucometer', 'text']
      const type = comp.dynamic_data?.observation_type?.type
      console.log('Componente:', comp.id, 'Tipo:', type)
      return validTypes.includes(type)
    }).map(comp => ({
      id: comp.id,
      type: comp.dynamic_data?.observation_type?.type || 'text',
      header: comp.dynamic_data?.header,
      body: comp.dynamic_data?.body,
      question: comp.dynamic_data?.question,
      observationType: comp.dynamic_data?.observation_type,
      conditions: conditionsByTarget[comp.id] || null
    }))

    console.log('Pasos procesados:', steps.value)

  } catch (err) {
    console.error('Error parseando diagrama:', err)
    error.value = 'Error al procesar el protocolo'
  }
}

// Verificar si un paso debe mostrarse (condicionales)
function shouldShowStep(step) {
  if (!step.conditions || step.conditions.length === 0) {
    return true
  }

  // Evaluar grupos de condiciones (OR entre grupos, AND dentro de cada grupo)
  return step.conditions.some(group => {
    const sourceResponse = responses.value[group.sourceId]
    if (!sourceResponse) return false

    // Todas las condiciones del grupo deben cumplirse (AND)
    // PERO si hay next_operator: "OR", se evalúa como OR
    let result = true
    for (let i = 0; i < group.conditions.length; i++) {
      const condition = group.conditions[i]
      const value = sourceResponse[condition.field] || sourceResponse
      let conditionMet = false

      switch (condition.operator) {
        case 'equals':
          conditionMet = value == condition.value
          break
        case 'lesser':
          conditionMet = parseFloat(value) < parseFloat(condition.value)
          break
        case 'greater':
          conditionMet = parseFloat(value) > parseFloat(condition.value)
          break
        case 'range':
          const val = parseFloat(value)
          // Evaluar según el rango especificado para glucosa
          if (condition.range === 'Low') conditionMet = val < 70
          else if (condition.range === 'Medium Low') conditionMet = val < 70
          else if (condition.range === 'High') conditionMet = val > 140
          else if (condition.range === 'Medium High') conditionMet = val > 140
          else if (condition.range === 'Normal') conditionMet = val >= 70 && val <= 140
          else conditionMet = true
          break
        default:
          // Si no hay operador pero hay range, evaluar por range
          if (condition.range) {
            const val = parseFloat(value)
            if (condition.range === 'Low') conditionMet = val < 70
            else if (condition.range === 'Medium Low') conditionMet = val < 70
            else if (condition.range === 'High') conditionMet = val > 140
            else if (condition.range === 'Medium High') conditionMet = val > 140
            else if (condition.range === 'Normal') conditionMet = val >= 70 && val <= 140
            else conditionMet = true
          } else {
            conditionMet = true
          }
      }

      // Si es la primera condición, establecer resultado
      if (i === 0) {
        result = conditionMet
      } else {
        // Si hay next_operator: "OR", combinar con OR, sino con AND
        const prevCondition = group.conditions[i - 1]
        if (prevCondition.next_operator === 'OR') {
          result = result || conditionMet
        } else {
          result = result && conditionMet
        }
      }
    }

    return result
  })
}

// Obtener pasos visibles (filtrando condicionales)
const visibleSteps = computed(() => {
  return steps.value.filter(step => shouldShowStep(step))
})



// Navegación
function goToNextStep() {
  if (!stepValid.value) return
  
  if (currentStepIndex.value >= visibleSteps.value.length - 1) {
    submitWizard()
  } else {
    currentStepIndex.value++
    stepValid.value = false
  }
}

function goToPreviousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    stepValid.value = true // El paso anterior ya fue validado
  }
}

// Manejar cambio en el paso actual
function handleStepUpdate(value) {
  if (currentStep.value) {
    responses.value[currentStep.value.id] = value
  }
}

// Manejar validación del paso
function handleStepValid(isValid) {
  stepValid.value = isValid
}

// Enviar datos al completar
async function submitWizard() {
  isSubmitting.value = true
  error.value = null
  
  try {
    const patientId = props.patientId || userStore.usuario?._id || userStore.usuario?.uid
    
    if (!patientId) {
      throw new Error('No se encontró ID del paciente')
    }
    
    // Preparar datos en el formato que espera la API HOMA
    // La API espera un array de observaciones
    const observations = []
    
    // Recorrer las respuestas y crear observaciones para cada paso
    for (const [stepId, response] of Object.entries(responses.value)) {
      const step = steps.value.find(s => s.id === stepId)
      if (!step || !step.observationType) continue
      
      const observation = {
        observation_type_id: step.observationType.id,
        parameters: {}
      }
      
      // Mapear los parámetros según el tipo de observación
      if (step.type === 'glucometer' && response.glucose) {
        observation.parameters.glucose = response.glucose
      } else if (step.type === 'question' && response.answer) {
        observation.parameters.answer = response.answer
      } else if (typeof response === 'object') {
        // Para otros tipos, copiar todos los valores
        Object.assign(observation.parameters, response)
      }
      
      observations.push(observation)
    }
    
    console.log('Enviando observaciones:', observations)
    
    // Enviar a la API usando el servicio REST
    const result = await saveProtocolObservations(patientId, props.protocolId, observations)
    
    if (result && result.success) {
      // Éxito - redirigir al dashboard
      emit('complete', observations)
      emit('close')
    } else {
      throw new Error(result?.message || 'Error al guardar')
    }
  } catch (err) {
    console.error('Error enviando datos:', err)
    // Mostrar error más específico si está disponible
    error.value = err.message || 'No se pudo guardar la medición. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}

// Cargar protocolo al montar
onMounted(() => {
  loadProtocol()
})

// Recargar si cambia el protocolId
watch(() => props.protocolId, () => {
  loadProtocol()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display font-bold text-2xl text-gray-900">Nueva Medición</h1>
          <p class="text-gray-500 text-sm mt-1">
            {{ protocolData?.name || 'Cargando...' }}
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span class="sr-only">Cerrar</span>
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-3xl mx-auto">
        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <Loader2 class="w-12 h-12 text-[#FF9500] animate-spin mb-4" />
          <p class="text-gray-500">Cargando protocolo...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <AlertCircle class="w-12 h-12 text-red-500 mb-4" />
          <p class="text-red-600 text-lg font-medium mb-2">{{ error }}</p>
          <button 
            @click="loadProtocol"
            class="mt-4 px-6 py-2 bg-[#FF9500] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>

        <!-- Wizard Content -->
        <template v-else>
          <!-- Progress -->
          <div class="mb-12">
            <WizardProgress
              :current-step="currentStepIndex"
              :total-steps="visibleSteps.length"
              :steps="visibleSteps"
            />
          </div>

          <!-- Step Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <!-- Dynamic Step Component -->
            <component
              :is="currentStepComponent"
              v-if="currentStep"
              :step="currentStep"
              :model-value="currentStepValue"
              @update:model-value="handleStepUpdate"
              @valid="handleStepValid"
            />

            <!-- Navigation -->
            <WizardNavigation
              :current-step="currentStepIndex"
              :total-steps="visibleSteps.length"
              :is-valid="stepValid"
              :is-loading="isLoading"
              :is-submitting="isSubmitting"
              @back="goToPreviousStep"
              @continue="goToNextStep"
              @submit="submitWizard"
            />
          </div>

          <!-- Help Text -->
          <div class="mt-8 text-center">
            <p class="text-sm text-gray-400">
              Esta información nos ayuda a monitorear tu salud de manera más efectiva
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

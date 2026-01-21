<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useUserStore } from '@/stores/tiendaUsuario'
import { 
  ArrowLeft, Check, AlertCircle, Heart, Activity, ChevronRight
} from 'lucide-vue-next'
import { useElementSize } from '@vueuse/core'
import { Motion } from 'motion-v'
import AnimatedStepper from '@/components/ui/AnimatedStepper.vue'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const healthStore = useHealthStore()
const userStore = useUserStore()

// Constantes de layout
const HEADER_HEIGHT = 60
const PADDING_HEIGHT = 48

// --- State ---
const step = ref(1)
const steps = [
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
]

const form = ref({
  feeling: 'bien', // 'bien', 'mareado', 'dolor_cabeza', 'otro'
  systolic: '',
  diastolic: '',
  heartRate: '',
  notes: ''
})

const isSubmitting = ref(false)

// --- Height Animation Logic ---
const contentRef = ref(null)
const { height } = useElementSize(contentRef)

// --- Validation ---
const canProceedFromStep2 = computed(() => !!form.value.feeling)
const canProceedFromStep3 = computed(() => {
  return form.value.systolic && 
         form.value.diastolic && 
         form.value.heartRate &&
         !isNaN(form.value.systolic) &&
         !isNaN(form.value.diastolic)
})

// --- Logic ---
const status = computed(() => {
  const sys = Number(form.value.systolic)
  const dia = Number(form.value.diastolic)
  
  if (!sys || !dia) return 'Pendiente'
  
  if (sys < 90 || dia < 60) return 'Hipotensión'
  if (sys > 140 || dia > 90) return 'Hipertensión'
  if (sys > 120 || dia > 80) return 'Elevada'
  return 'Normal'
})

// --- Actions ---
const nextStep = () => {
  if (step.value < 7) step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
  else router.back()
}

const saveMeasurement = async () => {
  isSubmitting.value = true
  
  // Simulate API delay
  await new Promise(r => setTimeout(r, 1000))

  const newMeasurement = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    tipo: 'Presión Arterial',
    valor: `${form.value.systolic}/${form.value.diastolic}`,
    unidad: 'mmHg',
    estado: status.value,
    icon: Activity
  }

  // Use store to add
  healthStore.addMedicion('1', newMeasurement)
  
  isSubmitting.value = false
  step.value = 5 // Go to Success Step
  
  // Auto advance to recommendation or exit
  setTimeout(() => {
    if (status.value === 'Normal') {
      step.value = 7 // Finish
    } else {
      step.value = 6 // Recommendation
    }
  }, 2000)
}

const finish = () => {
  router.push('/dashboard-preventive')
}

// Add Keyboard Support for usability
function handleKeydown(e) {
  if (e.key === 'Enter') {
      if (step.value === 1) nextStep();
      else if (step.value === 2 && canProceedFromStep2.value) nextStep();
      else if (step.value === 3 && canProceedFromStep3.value) nextStep();
      else if (step.value === 7) finish();
  }
}
</script>

<template>
  <div 
    class="min-h-dvh flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-900"
    @keydown="handleKeydown"
  >
    <!-- Background Elements (Subtle Blobs) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
       <div class="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-60"></div>
       <div class="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-violet-100 rounded-full blur-3xl opacity-60"></div>
    </div>

    <!-- Main Card Container (Light Modern Style) -->
    <Motion
        is="article"
        class="relative w-full max-w-[600px] z-10 bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden flex flex-col will-change-[height]"
        :animate="{ height: height > 0 ? (height + HEADER_HEIGHT + PADDING_HEIGHT) + 'px' : 'auto' }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    >
        <!-- Header -->
        <header class="flex items-center justify-between px-6 py-5 border-b border-gray-100 h-[60px]">
            <button 
                @click="prevStep" 
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Volver"
            >
                <ArrowLeft class="w-5 h-5" />
            </button>
            
            <h1 class="text-base font-semibold text-gray-900 tracking-tight">
                {{ step === 1 ? 'Nueva Medición' : (step === 2 ? 'Estado' : (step === 3 ? 'Valores' : 'Resumen')) }}
            </h1>
            
            <div class="w-8" aria-hidden="true"></div>
        </header>

        <!-- Content Area -->
        <!-- We use a ref here to measure height -->
        <div ref="contentRef" class="p-6">
            <Transition 
                mode="popLayout" 
                enter-active-class="transition-all duration-300 ease-out" 
                enter-from-class="opacity-0 translate-x-4 blur-sm" 
                enter-to-class="opacity-100 translate-x-0 blur-0"
                leave-active-class="transition-all duration-200 ease-in absolute w-full top-6 left-0 px-6" 
                leave-from-class="opacity-100 translate-x-0 blur-0" 
                leave-to-class="opacity-0 -translate-x-4 blur-sm"
            >
                
                <!-- STEP 1: Intro -->
                <div 
                    v-if="step === 1" 
                    key="step-1"
                    class="flex flex-col items-center text-center space-y-6"
                >
                    <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative group cursor-pointer hover:bg-blue-100 transition-colors shadow-sm">
                        <Activity class="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-500" />
                        <div class="absolute inset-0 rounded-full bg-blue-200 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    </div>
                    
                    <div class="space-y-2">
                        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Hola, {{ userStore.firstName || 'Usuario' }}</h2>
                        <p class="text-gray-500 text-sm leading-relaxed px-4">
                            Vamos a registrar tu presión arterial. <br>Asegúrate de estar sentado y relajado.
                        </p>
                    </div>

                    <div class="w-full pt-4">
                         <Button class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.98]" @click="nextStep">
                            Comenzar
                         </Button>
                    </div>
                </div>

                <!-- STEP 2: Feeling (Wallet List Style Light) -->
                <div 
                    v-else-if="step === 2" 
                    key="step-2"
                    class="flex flex-col w-full"
                >
                    <div class="text-center mb-6">
                        <h2 class="text-lg font-bold text-gray-900">¿Cómo te sientes?</h2>
                        <p class="text-xs text-gray-500 mt-1">Selecciona tu estado actual</p>
                    </div>

                    <div class="space-y-3 w-full">
                        <button 
                            v-for="option in [
                                { value: 'bien', label: 'Me siento Bien', icon: '😊' },
                                { value: 'regular', label: 'Me siento Regular', icon: '😐' },
                                { value: 'mal', label: 'Me siento Mal', icon: '😞' }
                            ]" 
                            :key="option.value"
                            @click="() => { form.feeling = option.value; nextStep() }"
                            class="w-full group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all active:scale-[0.98]"
                        >
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    {{ option.icon }}
                                </div>
                                <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors text-base">{{ option.label }}</span>
                            </div>
                            <ChevronRight class="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                        </button>
                    </div>
                </div>

                <!-- STEP 3: Inputs (Light Inputs) -->
                <div 
                    v-else-if="step === 3" 
                    key="step-3"
                    class="flex flex-col w-full"
                >
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="space-y-2">
                            <Label class="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Sistólica</Label>
                            <Input 
                                v-model="form.systolic" 
                                type="number" 
                                class="h-16 text-2xl font-mono text-center rounded-xl bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-300" 
                                placeholder="120"
                                autofocus
                            />
                        </div>
                        <div class="space-y-2">
                             <Label class="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Diastólica</Label>
                             <Input 
                                v-model="form.diastolic" 
                                type="number" 
                                class="h-16 text-2xl font-mono text-center rounded-xl bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-300" 
                                placeholder="80"
                            />
                        </div>
                    </div>

                    <div class="space-y-2 mt-4">
                        <Label class="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Pulso</Label>
                        <div class="relative group">
                            <div class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-red-50 flex items-center justify-center">
                                <Heart class="w-4 h-4 text-red-500" />
                            </div>
                            <Input 
                                v-model="form.heartRate" 
                                type="number" 
                                class="h-14 pl-14 font-mono text-lg rounded-xl bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 placeholder:text-gray-300 transition-all" 
                                placeholder="60 BPM"
                            />
                        </div>
                    </div>

                    <Button 
                        :disabled="!canProceedFromStep3" 
                        class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-blue-100" 
                        @click="nextStep"
                    >
                        Continuar
                    </Button>
                </div>

                <!-- STEP 4: Revision (Light Card Summary) -->
                <div 
                    v-else-if="step === 4" 
                    key="step-4"
                    class="flex flex-col w-full"
                >
                    <div class="w-full p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden mb-6">
                        <div class="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-50"></div>
                        
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">LECTURA FINAL</span>
                        <div class="text-5xl font-mono font-bold text-gray-900 tracking-tighter mb-2">
                             {{ form.systolic }}<span class="text-gray-300 text-4xl mx-1">/</span>{{ form.diastolic }}
                        </div>
                        <span class="text-xs text-gray-500 font-medium">mmHg</span>
                        
                        <div class="flex items-center gap-3 mt-8">
                             <div class="px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center gap-2">
                                <Heart class="w-3.5 h-3.5 text-red-500" />
                                <span class="text-xs font-mono text-gray-600">{{ form.heartRate }} BPM</span>
                             </div>
                             <div class="px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center gap-2">
                                <Activity class="w-3.5 h-3.5 text-blue-500" />
                                <span class="text-xs font-medium text-gray-600">{{ status }}</span>
                             </div>
                        </div>
                    </div>

                    <Button class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.98]" @click="saveMeasurement" :disabled="isSubmitting">
                        <span v-if="isSubmitting">Guardando...</span>
                        <span v-else>Confirmar</span>
                    </Button>
                </div>

                <!-- STEP 5: Success -->
                <div 
                    v-else-if="step === 5" 
                    key="step-5"
                    class="flex flex-col items-center justify-center py-8"
                >
                    <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 relative">
                         <div class="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
                         <Check class="w-10 h-10 text-green-600 relative z-10" stroke-width="3" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Confirmado</h3>
                    <p class="text-gray-500 text-center text-sm">Tu registro ha sido guardado exitosamente.</p>
                </div>

                 <!-- STEP 6: Analysis (Light Alert) -->
                 <div 
                    v-else-if="step === 6" 
                    key="step-6"
                    class="flex flex-col items-center w-full"
                >
                    <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 ring-1 ring-blue-100">
                        <AlertCircle class="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <h2 class="text-lg font-bold text-gray-900 mb-6">Diagnóstico: Hipotensión</h2>
                    
                    <div class="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 relative overflow-hidden">
                         <h4 class="font-bold text-blue-700 text-xs mb-3 uppercase tracking-wider">Recomendaciones</h4>
                         <ul class="space-y-3">
                            <li class="flex gap-3 text-sm text-gray-600 items-start">
                                <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold mt-0.5">1</span>
                                <span>Recuéstate y eleva las piernas por 15 minutos.</span>
                            </li>
                             <li class="flex gap-3 text-sm text-gray-600 items-start">
                                <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold mt-0.5">2</span>
                                <span>Bebe un líquido caliente.</span>
                            </li>
                            <li class="flex gap-3 text-sm text-gray-600 items-start">
                                <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold mt-0.5">3</span>
                                <span>Re-control en 20 min.</span>
                            </li>
                         </ul>
                    </div>

                    <Button class="w-full h-12 rounded-xl text-base font-semibold bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 transition-all shadow-sm" @click="step++">
                        Entendido
                    </Button>
                </div>

                <!-- STEP 7: Closing -->
                 <div 
                    v-else-if="step === 7" 
                    key="step-7"
                    class="flex flex-col w-full"
                >
                    <h2 class="text-lg font-bold text-gray-900 text-center mb-6">Agenda de Hoy</h2>

                    <div class="space-y-3 mb-6">
                         <div class="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">
                                    💊
                                </div>
                                <div class="text-sm">
                                    <span class="text-orange-600 block text-[10px] uppercase tracking-wider font-bold mb-0.5">Recordatorio</span>
                                    <span class="text-gray-900 font-medium text-base">Losartán 50mg</span>
                                </div>
                            </div>
                            <span class="text-xs text-gray-500 font-mono">8:00 AM</span>
                         </div>

                         <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between opacity-60 grayscale">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                    <Check class="w-5 h-5 text-gray-400" />
                                </div>
                                <div class="text-sm">
                                    <span class="text-gray-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">Completado</span>
                                    <span class="text-gray-500 font-medium text-base">Peso Corporal</span>
                                </div>
                            </div>
                         </div>
                    </div>

                    <Button class="w-full h-12 rounded-xl text-base font-bold bg-gray-900 text-white hover:bg-gray-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" @click="finish">
                        Finalizar
                    </Button>
                </div>

            </Transition>
        </div>
    </Motion>
  </div>
</template>

<style scoped>
/* Remove default number input spinner */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useMensajesStore } from '@/stores/tiendaMensajes'
import { 
  ArrowLeft, Check, AlertCircle, Droplet, ChevronRight, ClipboardCheck
} from 'lucide-vue-next'
import { useElementSize } from '@vueuse/core'
import { Motion } from 'motion-v'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const healthStore = useHealthStore()
const mensajesStore = useMensajesStore()
const emit = defineEmits(['close'])

// --- State ---
const step = ref(1)

const form = ref({
  feeling: 'bien',
  glucose: '',
  notes: ''
})

const isSubmitting = ref(false)

// --- Height Animation Logic ---
const contentRef = ref(null)
const { height } = useElementSize(contentRef)
const headerHeight = 60
const paddingHeight = 48

// --- Validation ---
const canProceedFromStep2 = computed(() => !!form.value.feeling)
const canProceedFromStep3 = computed(() => {
  return form.value.glucose && !isNaN(form.value.glucose) && Number(form.value.glucose) > 0
})

// --- Logic ---
const status = computed(() => {
  const g = Number(form.value.glucose)
  if (!g) return 'Pendiente'
  
  if (g < 70) return 'Hipoglicemia'
  if (g > 180) return 'Hiperglicemia' // Generic post-prandial limit
  if (g > 140) return 'Elevada'
  return 'Normal'
})

// --- Actions ---
const nextStep = () => {
  if (step.value < 7) step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
  else emit('close')
}



const saveMeasurement = async () => {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000))

  const newMeasurement = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    tipo: 'Glicemia',
    valor: `${form.value.glucose}`,
    unidad: 'mg/dL',
    estado: status.value,
    icon: Droplet
  }

  healthStore.addMedicion('3', newMeasurement) // '3' is usually glucose
  
  // --- UPSERT MESSAGES TO INBOX (updates if exists) ---
  // 1. Upsert Result
  mensajesStore.upsertMessage('results', {
      id: 'RES-GLUCOSE-LATEST', // Fixed ID
      title: 'Última Medición: Glicemia',
      description: `${newMeasurement.valor} mg/dL - ${status.value} (${new Date().toLocaleDateString('es-CL')})`,
      icon: ClipboardCheck,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30'
  })

  // 2. Upsert Alert if Abnormal
  if (status.value !== 'Normal') {
       mensajesStore.upsertMessage('alerts', {
          id: 'ALT-GLUCOSE-LATEST', // Fixed ID
          title: `Alerta Glicemia: ${status.value}`,
          description: `Última lectura: ${newMeasurement.valor} mg/dL. Revisa las indicaciones.`,
          icon: AlertCircle,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100 dark:bg-red-900/30'
      })
  }
  
  isSubmitting.value = false
  step.value = 5 // Success
  
  setTimeout(() => {
    if (status.value === 'Normal') {
      step.value = 7 // Finish
    } else {
      step.value = 6 // Recommendations
    }
  }, 2000)
}

const finish = () => {
  emit('close')
}

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
  <div class="flex items-center justify-center font-sans text-gray-900" @keydown="handleKeydown">
    <Motion
        is="article"
        class="relative w-full max-w-[600px] z-10 bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden flex flex-col will-change-[height]"
        :animate="{ height: height > 0 ? (height + headerHeight + paddingHeight) + 'px' : 'auto' }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    >
        <header class="flex items-center justify-between px-6 py-5 border-b border-gray-100 h-[60px]">
            <button 
                @click="prevStep" 
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Volver"
            >
                <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="text-base font-semibold text-gray-900 tracking-tight">
                {{ step === 1 ? 'Nueva Medición' : (step === 2 ? 'Estado' : (step === 3 ? 'Nivel de Glucosa' : 'Resumen')) }}
            </h1>
            <div class="w-8" aria-hidden="true"></div>
        </header>

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
                <div v-if="step === 1" class="flex flex-col items-center text-center space-y-6">
                    <div class="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center relative group cursor-pointer hover:bg-teal-100 transition-colors shadow-sm">
                        <Droplet class="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform duration-500" />
                        <div class="absolute inset-0 rounded-full bg-teal-200 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    </div>
                    
                    <div class="space-y-2">
                        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Hola, Sebastián</h2>
                        <p class="text-gray-500 text-sm leading-relaxed px-4">
                            Vamos a registrar tu nivel de azúcar en sangre. <br>Ten a mano tu glucómetro.
                        </p>
                    </div>

                    <div class="w-full pt-4">
                         <Button class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.98]" @click="nextStep">
                            Comenzar
                         </Button>
                    </div>
                </div>

                <!-- STEP 2: Estado de Ánimo -->
                <div v-else-if="step === 2" class="flex flex-col w-full">
                    <!-- Question Header -->
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">¿Cómo te sientes hoy?</h2>
                        <p class="text-sm text-gray-500">Tu estado emocional puede influir en tus mediciones</p>
                    </div>

                    <!-- Mood Options Grid -->
                    <div class="grid grid-cols-3 gap-4 mb-8">
                        <!-- Good Mood -->
                        <button 
                            @click="form.feeling = 'bien'"
                            class="group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                            :class="form.feeling === 'bien' 
                                ? 'border-teal-500 bg-emerald-50 scale-105' 
                                : 'border-transparent bg-emerald-50 hover:bg-emerald-100 hover:-translate-y-1'"
                        >
                            <div class="text-center">
                                <div class="text-6xl mb-3 transform transition-transform group-hover:scale-110">😊</div>
                                <p class="font-semibold text-gray-900 text-sm">Me siento Bien</p>
                                <p class="text-xs text-gray-500 mt-1">Energía positiva</p>
                            </div>
                            <!-- Checkmark when selected -->
                            <div 
                                class="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center transition-all duration-200"
                                :class="form.feeling === 'bien' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
                            >
                                <Check class="text-white w-3.5 h-3.5" />
                            </div>
                        </button>

                        <!-- Regular Mood -->
                        <button 
                            @click="form.feeling = 'regular'"
                            class="group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                            :class="form.feeling === 'regular' 
                                ? 'border-teal-500 bg-amber-50 scale-105' 
                                : 'border-transparent bg-amber-50 hover:bg-amber-100 hover:-translate-y-1'"
                        >
                            <div class="text-center">
                                <div class="text-6xl mb-3 transform transition-transform group-hover:scale-110">😐</div>
                                <p class="font-semibold text-gray-900 text-sm">Regular</p>
                                <p class="text-xs text-gray-500 mt-1">Neutral / Estable</p>
                            </div>
                            <!-- Checkmark when selected -->
                            <div 
                                class="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center transition-all duration-200"
                                :class="form.feeling === 'regular' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
                            >
                                <Check class="text-white w-3.5 h-3.5" />
                            </div>
                        </button>

                        <!-- Bad Mood -->
                        <button 
                            @click="form.feeling = 'mal'"
                            class="group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                            :class="form.feeling === 'mal' 
                                ? 'border-teal-500 bg-red-50 scale-105' 
                                : 'border-transparent bg-red-50 hover:bg-red-100 hover:-translate-y-1'"
                        >
                            <div class="text-center">
                                <div class="text-6xl mb-3 transform transition-transform group-hover:scale-110">😞</div>
                                <p class="font-semibold text-gray-900 text-sm">Mal</p>
                                <p class="text-xs text-gray-500 mt-1">Con dificultades</p>
                            </div>
                            <!-- Checkmark when selected -->
                            <div 
                                class="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center transition-all duration-200"
                                :class="form.feeling === 'mal' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"
                            >
                                <Check class="text-white w-3.5 h-3.5" />
                            </div>
                        </button>
                    </div>

                    <!-- Selected Mood Indicator -->
                    <div 
                        class="text-center mb-6 transition-all duration-300"
                        :class="form.feeling ? 'opacity-100' : 'opacity-0'"
                    >
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full">
                            <Droplet class="w-4 h-4 text-teal-500" />
                            <span class="text-sm font-medium text-teal-600">
                                Has seleccionado: {{ form.feeling === 'bien' ? 'Me siento Bien' : form.feeling === 'regular' ? 'Regular' : form.feeling === 'mal' ? 'Mal' : '' }}
                            </span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button 
                            @click="prevStep" 
                            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                        >
                            <ArrowLeft class="w-4 h-4" />
                            Atrás
                        </button>
                        
                        <Button 
                            :disabled="!canProceedFromStep2" 
                            class="flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-sm transition-all"
                            :class="canProceedFromStep2 
                                ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-200' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                            @click="nextStep"
                        >
                            Continuar
                            <ChevronRight class="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <!-- STEP 3: Input -->
                <div v-else-if="step === 3" class="flex flex-col w-full">
                    <div class="flex flex-col items-center mb-8">
                        <Label class="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Glucosa en Sangre</Label>
                        <div class="relative">
                            <Input 
                                v-model="form.glucose" 
                                type="number" 
                                class="h-24 w-48 text-5xl font-mono text-center rounded-2xl bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all placeholder:text-gray-300" 
                                placeholder="---"
                                autofocus
                            />
                            <span class="absolute right-4 bottom-8 text-gray-400 font-medium">mg/dL</span>
                        </div>
                    </div>

                    <Button 
                        :disabled="!canProceedFromStep3" 
                        class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-100" 
                        @click="nextStep"
                    >
                        Continuar
                    </Button>
                </div>

                <!-- STEP 4: Revision -->
                <div v-else-if="step === 4" class="flex flex-col w-full">
                    <div class="w-full p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden mb-6">
                        <div class="absolute top-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-50"></div>
                        
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">LECTURA FINAL</span>
                        <div class="text-6xl font-mono font-bold text-gray-900 tracking-tighter mb-2">
                             {{ form.glucose }}
                        </div>
                        <span class="text-xs text-gray-500 font-medium">mg/dL</span>
                        
                        <div class="mt-6 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center gap-2">
                             <Droplet class="w-3.5 h-3.5 text-teal-500" />
                             <span class="text-xs font-medium text-gray-600">{{ status }}</span>
                        </div>
                    </div>

                    <Button class="w-full h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.98]" @click="saveMeasurement" :disabled="isSubmitting">
                        <span v-if="isSubmitting">Guardando...</span>
                        <span v-else>Confirmar</span>
                    </Button>
                </div>

                <!-- STEP 5: Success -->
                <div v-else-if="step === 5" class="flex flex-col items-center justify-center py-8">
                    <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 relative">
                         <div class="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
                         <Check class="w-10 h-10 text-green-600 relative z-10" stroke-width="3" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Registro Exitoso</h3>
                    <p class="text-gray-500 text-center text-sm">Tus datos han sido guardados.</p>
                </div>

                <!-- STEP 6: Recommendations -->
                 <div v-else-if="step === 6" class="flex flex-col items-center w-full">
                    <div class="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 ring-1 ring-teal-100">
                        <AlertCircle class="w-8 h-8 text-teal-600" />
                    </div>
                    
                    <h2 class="text-lg font-bold text-gray-900 mb-6">Diagnóstico: {{ status }}</h2>
                    
                    <div class="w-full bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-6 relative overflow-hidden">
                         <h4 class="font-bold text-teal-700 text-xs mb-3 uppercase tracking-wider">Recomendaciones</h4>
                         <ul class="space-y-3">
                            <template v-if="status === 'Hipoglicemia'">
                                <li class="flex gap-3 text-sm text-gray-600 items-start">
                                    <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-100 text-teal-600 text-[10px] font-bold mt-0.5">1</span>
                                    <span>Consume 15g de carbohidratos (jugo, dulce).</span>
                                </li>
                                <li class="flex gap-3 text-sm text-gray-600 items-start">
                                    <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-100 text-teal-600 text-[10px] font-bold mt-0.5">2</span>
                                    <span>Espera 15 minutos y vuelve a medir.</span>
                                </li>
                            </template>
                            <template v-else>
                                 <li class="flex gap-3 text-sm text-gray-600 items-start">
                                    <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-100 text-teal-600 text-[10px] font-bold mt-0.5">1</span>
                                    <span>Bebe agua para hidratarte.</span>
                                </li>
                                <li class="flex gap-3 text-sm text-gray-600 items-start">
                                    <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-100 text-teal-600 text-[10px] font-bold mt-0.5">2</span>
                                    <span>Revisa tu próxima dosis de insulina si aplica.</span>
                                </li>
                            </template>
                         </ul>
                    </div>

                    <Button class="w-full h-12 rounded-xl text-base font-semibold bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 transition-all shadow-sm" @click="step++">
                        Entendido
                    </Button>
                </div>
                
                <!-- STEP 7: Closing -->
                 <div v-else-if="step === 7" class="flex flex-col w-full">
                    <h2 class="text-lg font-bold text-gray-900 text-center mb-6">Agenda de Hoy</h2>

                    <div class="p-6 rounded-2xl bg-teal-50 border border-teal-100 flex flex-col items-center text-center mb-8">
                        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl mb-3 shadow-sm">
                            🍎
                        </div>
                        <span class="text-teal-900 font-bold block mb-1">Próxima Comida</span>
                        <span class="text-teal-600/80 text-sm">Recuerda registrar tus carbohidratos.</span>
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
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>

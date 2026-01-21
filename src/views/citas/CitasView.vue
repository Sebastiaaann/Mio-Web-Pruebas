<script setup>
/**
 * CitasView - Vista para agendar citas médicas
 * Wizard estilo BloodPressureWizardView con calendario y selección de hora
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { 
  ArrowLeft, Check, Calendar, Clock, User, ChevronRight, ChevronLeft, 
  Stethoscope, Heart, Activity, Pill
} from 'lucide-vue-next'
import { useElementSize } from '@vueuse/core'
import { Motion } from 'motion-v'
import { Button } from '@/components/ui/button'

const router = useRouter()
const userStore = useUserStore()

// Layout constants
const HEADER_HEIGHT = 60
const PADDING_HEIGHT = 48

// State
const step = ref(1)
const isSubmitting = ref(false)

const form = ref({
  type: '', // 'general', 'cardio', 'nutricion', 'control'
  date: null,
  time: '',
  notes: ''
})

// Height animation
const contentRef = ref(null)
const { height } = useElementSize(contentRef)

// Calendar state
const currentMonth = ref(new Date())
const selectedDate = ref(null)

// Appointment types
const appointmentTypes = [
  { id: 'general', label: 'Consulta General', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'cardio', label: 'Cardiología', icon: Heart, color: 'bg-rose-500' },
  { id: 'nutricion', label: 'Nutrición', icon: Activity, color: 'bg-emerald-500' },
  { id: 'control', label: 'Control Preventivo', icon: Pill, color: 'bg-violet-500' }
]

// Time slots
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

// Calendar helpers
const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const startPadding = firstDay.getDay()
  
  // Previous month padding
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false, isPast: d < new Date().setHours(0,0,0,0) })
  }
  
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d, isCurrentMonth: true, isPast: d < new Date().setHours(0,0,0,0) })
  }
  
  // Next month padding
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, isCurrentMonth: false, isPast: false })
  }
  
  return days
})

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function selectDate(day) {
  if (day.isPast || !day.isCurrentMonth) return
  selectedDate.value = day.date
  form.value.date = day.date
}

function isSelected(day) {
  if (!selectedDate.value) return false
  return day.date.toDateString() === selectedDate.value.toDateString()
}

function isToday(day) {
  return day.date.toDateString() === new Date().toDateString()
}

// Selected type info
const selectedType = computed(() => {
  return appointmentTypes.find(t => t.id === form.value.type)
})

// Format selected date
const formattedDate = computed(() => {
  if (!form.value.date) return ''
  return form.value.date.toLocaleDateString('es-CL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })
})

// Validation
const canProceedFromStep1 = computed(() => !!form.value.type)
const canProceedFromStep2 = computed(() => !!form.value.date)
const canProceedFromStep3 = computed(() => !!form.value.time)

// Navigation
function nextStep() {
  if (step.value < 5) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
  else router.back()
}

// Submit
async function submitAppointment() {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1500))
  
  // Here you would save to backend/store
  console.log('Cita agendada:', form.value)
  
  isSubmitting.value = false
  step.value = 5 // Success
}

function finish() {
  router.push('/dashboard-preventive')
}

// Keyboard support
function handleKeydown(e) {
  if (e.key === 'Enter') {
    if (step.value === 1 && canProceedFromStep1.value) nextStep()
    else if (step.value === 2 && canProceedFromStep2.value) nextStep()
    else if (step.value === 3 && canProceedFromStep3.value) nextStep()
    else if (step.value === 5) finish()
  }
}
</script>

<template>
  <div 
    class="min-h-dvh flex items-center justify-center bg-gray-50 p-4 font-sans text-gray-900"
    @keydown="handleKeydown"
  >
    <!-- Background Blobs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-100 rounded-full blur-3xl opacity-60"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-60"></div>
    </div>

    <!-- Main Card -->
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
          {{ step === 1 ? 'Tipo de Cita' : (step === 2 ? 'Fecha' : (step === 3 ? 'Hora' : (step === 4 ? 'Confirmar' : 'Agendado'))) }}
        </h1>
        
        <div class="w-8" aria-hidden="true"></div>
      </header>

      <!-- Content -->
      <div ref="contentRef" class="p-6">
        <Transition 
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out" 
          enter-from-class="opacity-0 translate-x-4" 
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in" 
          leave-from-class="opacity-100 translate-x-0" 
          leave-to-class="opacity-0 -translate-x-4"
        >
          <!-- STEP 1: Appointment Type -->
          <div v-if="step === 1" key="step-1" class="flex flex-col">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar class="w-8 h-8 text-violet-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Agendar Cita</h2>
              <p class="text-sm text-gray-500">¿Qué tipo de consulta necesitas?</p>
            </div>

            <div class="space-y-3">
              <button 
                v-for="type in appointmentTypes" 
                :key="type.id"
                @click="() => { form.type = type.id; nextStep() }"
                class="w-full group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all active:scale-[0.98]"
                :class="{ 'ring-2 ring-violet-500 bg-violet-50': form.type === type.id }"
              >
                <div class="flex items-center gap-4">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                    :class="type.color"
                  >
                    <component :is="type.icon" class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{{ type.label }}</span>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
              </button>
            </div>
          </div>

          <!-- STEP 2: Calendar -->
          <div v-else-if="step === 2" key="step-2" class="flex flex-col">
            <div class="flex gap-6">
              <!-- Calendar -->
              <div class="flex-1">
                <!-- Month Navigation -->
                <div class="flex items-center justify-between mb-4">
                  <button 
                    @click="prevMonth"
                    class="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronLeft class="w-4 h-4" />
                  </button>
                  <span class="text-sm font-medium text-gray-900 capitalize">{{ monthName }}</span>
                  <button 
                    @click="nextMonth"
                    class="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <!-- Weekdays -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                  <div 
                    v-for="day in daysOfWeek" 
                    :key="day" 
                    class="h-9 flex items-center justify-center text-xs font-medium text-gray-400"
                  >
                    {{ day }}
                  </div>
                </div>

                <!-- Days Grid -->
                <div class="grid grid-cols-7 gap-1">
                  <button
                    v-for="(day, idx) in calendarDays"
                    :key="idx"
                    @click="selectDate(day)"
                    :disabled="day.isPast || !day.isCurrentMonth"
                    class="h-9 w-9 rounded-lg text-sm flex items-center justify-center transition-colors relative"
                    :class="{
                      'text-gray-300 cursor-not-allowed': day.isPast || !day.isCurrentMonth,
                      'text-gray-900 hover:bg-gray-100': day.isCurrentMonth && !day.isPast && !isSelected(day),
                      'bg-gray-900 text-white font-semibold': isSelected(day),
                    }"
                  >
                    {{ day.date.getDate() }}
                    <span 
                      v-if="isToday(day)" 
                      class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      :class="isSelected(day) ? 'bg-white' : 'bg-violet-500'"
                    ></span>
                  </button>
                </div>
              </div>

              <!-- Selected Date Info -->
              <div v-if="selectedDate" class="w-32 border-l border-gray-100 pl-6">
                <p class="text-sm font-medium text-gray-900 mb-1">
                  {{ selectedDate.toLocaleDateString('es-CL', { weekday: 'long' }) }}
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ selectedDate.getDate() }}
                </p>
              </div>
            </div>

            <Button 
              :disabled="!canProceedFromStep2"
              class="w-full h-12 rounded-xl text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              @click="nextStep"
            >
              Continuar
            </Button>
          </div>

          <!-- STEP 3: Time Selection -->
          <div v-else-if="step === 3" key="step-3" class="flex flex-col">
            <div class="text-center mb-6">
              <p class="text-sm text-gray-500">{{ formattedDate }}</p>
              <h2 class="text-lg font-bold text-gray-900">Selecciona una hora</h2>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-6">
              <button 
                v-for="slot in timeSlots" 
                :key="slot"
                @click="form.time = slot"
                class="h-12 rounded-xl border text-sm font-medium transition-all"
                :class="form.time === slot 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
              >
                {{ slot }}
              </button>
            </div>

            <Button 
              :disabled="!canProceedFromStep3"
              class="w-full h-12 rounded-xl text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              @click="nextStep"
            >
              Continuar
            </Button>
          </div>

          <!-- STEP 4: Review -->
          <div v-else-if="step === 4" key="step-4" class="flex flex-col">
            <div class="w-full p-6 rounded-2xl bg-gray-50 border border-gray-100 mb-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Resumen de Cita</h3>
              
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    :class="selectedType?.color"
                  >
                    <component :is="selectedType?.icon" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Tipo</p>
                    <p class="font-semibold text-gray-900">{{ selectedType?.label }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Calendar class="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Fecha</p>
                    <p class="font-semibold text-gray-900 capitalize">{{ formattedDate }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Clock class="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Hora</p>
                    <p class="font-semibold text-gray-900">{{ form.time }} hrs</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              class="w-full h-12 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
              :disabled="isSubmitting"
              @click="submitAppointment"
            >
              <span v-if="isSubmitting">Agendando...</span>
              <span v-else>Confirmar Cita</span>
            </Button>
          </div>

          <!-- STEP 5: Success -->
          <div v-else-if="step === 5" key="step-5" class="flex flex-col items-center justify-center py-8">
            <div class="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 relative">
              <div class="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
              <Check class="w-10 h-10 text-emerald-600 relative z-10" stroke-width="3" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">¡Cita Agendada!</h3>
            <p class="text-gray-500 text-center text-sm mb-6">
              Tu cita ha sido confirmada exitosamente.<br>
              Recibirás un recordatorio antes de tu cita.
            </p>
            
            <Button 
              class="w-full h-12 rounded-xl text-base font-bold bg-gray-900 text-white hover:bg-gray-800"
              @click="finish"
            >
              Finalizar
            </Button>
          </div>
        </Transition>
      </div>
    </Motion>
  </div>
</template>

<script setup>
/**
 * CitasView - Fullpage Horizontal Carousel
 * Página 1: Wizard de agendamiento (5 pasos)
 * Página 2: Calendario de citas agendadas
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useTiendaCitas } from '@/stores/tiendaCitas'
import NavbarLateral from '@/components/layout/NavbarLateral.vue'
import CalendarioCitas from '@/components/health/CalendarioCitas.vue'
import { 
  ArrowLeft, Check, Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, 
  Stethoscope, Heart, Activity, Pill
} from 'lucide-vue-next'
import { Motion } from 'motion-v'
import { Button } from '@/components/ui/button'

const router = useRouter()
const userStore = useUserStore()
const citasStore = useTiendaCitas()
const { citasAgendadas } = storeToRefs(citasStore)

// Fetch citas on mount
onMounted(() => {
  citasStore.obtenerCitas()
})

// --- CAROUSEL LOGIC ---
const currentPage = ref(0)
const pages = ['wizard', 'calendario']
const totalPages = pages.length

// Sidebar state
const sidebarVisible = ref(true)

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
}

// Navigation stats
const translateX = computed(() => -(currentPage.value * 100))

function goToPage(index) {
  if (index >= 0 && index < totalPages) {
    currentPage.value = index
  }
}

// Mouse Wheel Navigation
const lastWheel = ref(0)
function handleWheel(e) {
  const now = Date.now()
  if (now - lastWheel.value < 500) return // Throttle
  
  if (e.deltaY > 50 || e.deltaX > 50) {
    // Scroll Down/Right -> Next
    if (currentPage.value < totalPages - 1) {
      goToPage(currentPage.value + 1)
      lastWheel.value = now
    }
  } else if (e.deltaY < -50 || e.deltaX < -50) {
    // Scroll Up/Left -> Prev
    if (currentPage.value > 0) {
      goToPage(currentPage.value - 1)
      lastWheel.value = now
    }
  }
}

// Touch Navigation
const touchStart = ref(0)
function handleTouchStart(e) {
  touchStart.value = e.touches[0].clientX
}

function handleTouchEnd(e) {
  const touchEnd = e.changedTouches[0].clientX
  const diff = touchStart.value - touchEnd
  
  if (Math.abs(diff) > 50) {
    // Swipe
    if (diff > 0 && currentPage.value < totalPages - 1) {
      goToPage(currentPage.value + 1)
    } else if (diff < 0 && currentPage.value > 0) {
      goToPage(currentPage.value - 1)
    }
  }
}

// --- WIZARD LOGIC ---
const step = ref(1)
const isSubmitting = ref(false)

const form = ref({
  type: '', 
  date: null,
  time: '',
  notes: ''
})

// Wizard Internal Calendar (Step 2)
const currentMonth = ref(new Date())
const selectedDate = ref(null)

const appointmentTypes = [
  { id: 'general', label: 'Consulta General', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'cardio', label: 'Cardiología', icon: Heart, color: 'bg-rose-500' },
  { id: 'nutricion', label: 'Nutrición', icon: Activity, color: 'bg-emerald-500' },
  { id: 'control', label: 'Control Preventivo', icon: Pill, color: 'bg-violet-500' }
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
]

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
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false, isPast: d < new Date().setHours(0,0,0,0) })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d, isCurrentMonth: true, isPast: d < new Date().setHours(0,0,0,0) })
  }
  
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
  return selectedDate.value && day.date.toDateString() === selectedDate.value.toDateString()
}

function isToday(day) {
  return day.date.toDateString() === new Date().toDateString()
}

// Helpers
const selectedType = computed(() => appointmentTypes.find(t => t.id === form.value.type))

const formattedDate = computed(() => {
  if (!form.value.date) return ''
  return form.value.date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
})

// Validation
const canProceedFromStep1 = computed(() => !!form.value.type)
const canProceedFromStep2 = computed(() => !!form.value.date)
const canProceedFromStep3 = computed(() => !!form.value.time)

// Actions
function nextStep() {
  if (step.value < 5) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

async function submitAppointment() {
  isSubmitting.value = true
  
  // Format appointment for store
  const newAppointment = {
    tipo: form.value.type,
    tipoNombre: selectedType.value?.label,
    fecha: form.value.date,
    hora: form.value.time,
    estado: 'pendiente',
    color: selectedType.value?.color
  }

  // Save to store
  await citasStore.agregarCita(newAppointment)
  
  isSubmitting.value = false
  step.value = 5 // Success state in Wizard
  
  // Optional: Auto navigate to calendar after delay?
  setTimeout(() => {
     goToPage(1) // Go to Calendar Page
     // Reset form logic if needed, but keeping success state is fine
  }, 2000)
}

function finish() {
  // Reset or go to dashboard
  router.push('/dashboard-preventive')
}

// Keyboard support
function handleKeydown(e) {
  if (e.key === 'ArrowRight' && !e.target.closest('input')) {
    if (currentPage.value < totalPages - 1) goToPage(currentPage.value + 1)
  }
  if (e.key === 'ArrowLeft' && !e.target.closest('input')) {
    if (currentPage.value > 0) goToPage(currentPage.value - 1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden font-sans text-gray-900 px-0">
    <!-- Sidebar Navigation -->
    <NavbarLateral 
      :visible="true" 
      :collapsed="!sidebarVisible"
      @toggle="toggleSidebar" 
    />
    
    <!-- Main Content Container with dynamic margin -->
    <div 
      class="fullpage-container h-dvh overflow-hidden bg-background transition-opacity duration-300"
      :class="sidebarVisible ? 'md:ml-72' : 'md:ml-20'"
      @wheel="handleWheel"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
      tabindex="0"
    >
      <!-- Horizontal Page Container -->
      <Motion
        class="h-full flex"
        :animate="{ x: translateX + 'vw' }"
        :transition="{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }"
      >
        <!-- PAGE 1: Wizard -->
        <section class="h-dvh w-screen flex-shrink-0 flex items-center justify-center bg-gray-50 p-4">
          <!-- Wizard Card -->
          <div class="relative w-full max-w-[900px] z-10 bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden flex flex-col mx-auto">
            <!-- Header -->
            <header class="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <button 
                @click="prevStep" 
                class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Volver"
                v-if="step > 1 && step < 5"
              >
                <ArrowLeft class="w-5 h-5" />
              </button>
              <div v-else class="w-10"></div> <!-- Spacer -->
              
              <h1 class="text-lg font-bold text-gray-900 tracking-tight">
                {{ step === 1 ? 'Tipo de Cita' : (step === 2 ? 'Fecha' : (step === 3 ? 'Hora' : (step === 4 ? 'Confirmar' : 'Agendado'))) }}
              </h1>
              
              <button 
                @click="goToPage(1)"
                class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Ver calendario"
              >
                <CalendarIcon class="w-5 h-5" />
              </button>
            </header>

            <!-- Content -->
            <div ref="contentRef" class="p-10">
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
                <div v-if="step === 1" key="step-1" class="flex flex-col items-center justify-center min-h-full">
                  <div class="w-full max-w-md">
                    <div class="text-center mb-6">
                      <div class="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon class="w-8 h-8 text-violet-600" />
                      </div>
                      <h2 class="text-xl font-bold text-gray-900 mb-2">Agendar Cita</h2>
                      <p class="text-sm text-gray-500 mb-3">¿Qué tipo de consulta necesitas?</p>
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
                </div>

                <!-- STEP 2: Date Selection (Wizard Internal Calendar) -->
                <div v-else-if="step === 2" key="step-2" class="flex flex-col">
                  <div class="flex gap-6">
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-4">
                        <button class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100" @click="prevMonth"><ChevronLeft class="w-4 h-4" /></button>
                        <span class="font-medium capitalize">{{ monthName }}</span>
                        <button class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100" @click="nextMonth"><ChevronRight class="w-4 h-4" /></button>
                      </div>
                      <!-- Weekdays -->
                      <div class="grid grid-cols-7 gap-1 mb-2">
                        <div v-for="day in daysOfWeek" :key="day" class="text-xs text-gray-400 text-center">{{ day }}</div>
                      </div>
                      <!-- Days -->
                      <div class="grid grid-cols-7 gap-1">
                        <button
                          v-for="(day, idx) in calendarDays"
                          :key="idx"
                          @click="selectDate(day)"
                          :disabled="day.isPast || !day.isCurrentMonth"
                          class="h-9 w-9 rounded-lg text-sm flex items-center justify-center relative transition-colors"
                          :class="[
                            day.isPast || !day.isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-900',
                            isSelected(day) ? '!bg-gray-900 !text-white' : ''
                          ]"
                        >
                          {{ day.date.getDate() }}
                          <span v-if="isToday(day) && !isSelected(day)" class="absolute bottom-1 w-1 h-1 bg-violet-500 rounded-full"></span>
                        </button>
                      </div>
                    </div>
                    <!-- Selected Info -->
                    <div v-if="selectedDate" class="w-32 border-l pl-6 pt-2">
                      <p class="text-sm font-medium text-gray-900">{{ selectedDate.toLocaleDateString('es-CL', { weekday: 'long' }) }}</p>
                      <p class="text-3xl font-bold mt-1">{{ selectedDate.getDate() }}</p>
                    </div>
                  </div>
                   <Button 
                    :disabled="!canProceedFromStep2" 
                    class="w-full mt-8 bg-gray-900 text-white rounded-xl h-12"
                    @click="nextStep"
                  >
                    Continuar
                  </Button>
                </div>

                <!-- STEP 3: Time -->
                <div v-else-if="step === 3" key="step-3">
                   <div class="text-center mb-6">
                      <p class="text-sm text-gray-500 capitalize">{{ formattedDate }}</p>
                      <h2 class="text-lg font-bold">Selecciona una hora</h2>
                   </div>
                   <div class="grid grid-cols-3 gap-3 mb-6">
                     <button 
                        v-for="slot in timeSlots" :key="slot"
                        @click="form.time = slot"
                        class="h-12 border rounded-xl text-sm font-medium transition-all"
                        :class="form.time === slot ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:bg-gray-50'"
                     >
                       {{ slot }}
                     </button>
                   </div>
                   <Button :disabled="!canProceedFromStep3" class="w-full bg-gray-900 text-white rounded-xl h-12" @click="nextStep">Continuar</Button>
                </div>

                <!-- STEP 4: Confirmation -->
                <div v-else-if="step === 4" key="step-4">
                  <div class="bg-gray-50 rounded-2xl p-6 mb-6">
                     <h3 class="text-xs font-bold text-gray-400 uppercase mb-4">Resumen</h3>
                     <div class="space-y-4">
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" :class="selectedType?.color">
                            <component :is="selectedType?.icon" class="w-5 h-5"/>
                          </div>
                          <div>
                            <p class="text-sm text-gray-500">Tipo</p>
                            <p class="font-semibold">{{ selectedType?.label }}</p>
                          </div>
                       </div>
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><CalendarIcon class="w-5 h-5 text-gray-600"/></div>
                          <div>
                            <p class="text-sm text-gray-500">Fecha</p>
                            <p class="font-semibold capitalize">{{ formattedDate }}</p>
                          </div>
                       </div>
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><Clock class="w-5 h-5 text-gray-600"/></div>
                          <div>
                            <p class="text-sm text-gray-500">Hora</p>
                            <p class="font-semibold">{{ form.time }} hrs</p>
                          </div>
                       </div>
                     </div>
                  </div>
                  <Button class="w-full bg-violet-600 text-white rounded-xl h-12 hover:bg-violet-700" :disabled="isSubmitting" @click="submitAppointment">
                    {{ isSubmitting ? 'Agendando...' : 'Confirmar Cita' }}
                  </Button>
                </div>

                <!-- STEP 5: Success -->
                <div v-else-if="step === 5" key="step-5" class="py-10 text-center">
                   <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <span class="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></span>
                     <Check class="w-10 h-10 text-emerald-600 relative z-10"/>
                   </div>
                   <h3 class="text-xl font-bold mb-2">¡Cita Agendada!</h3>
                   <p class="text-gray-500 text-sm mb-8">Tu cita ha sido confirmada.<br>Redirigiendo al calendario...</p>
                   <Button class="w-full bg-gray-900 text-white rounded-xl h-12" @click="finish">Finalizar</Button>
                </div>

              </Transition>
            </div>
          </div>
        </section>

        <!-- PAGE 2: Calendario de Citas -->
        <section class="h-dvh w-screen flex-shrink-0 bg-background">
          <CalendarioCitas :citas="citasAgendadas" :mes-inicial="new Date()" />
        </section>

      </Motion>

      <!-- Dots Navigation -->
      <div class="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <button v-for="(page, idx) in pages" :key="page" @click="goToPage(idx)" class="group flex items-center justify-center w-4 h-4">
          <div class="w-2 h-2 rounded-full transition-all duration-300" :class="currentPage === idx ? 'bg-primary scale-125' : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'"></div>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fullpage-container {
  touch-action: none; /* Disable native swipe to handle it manually */
}
</style>

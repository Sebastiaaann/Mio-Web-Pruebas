<script setup>
/**
 * CalendarioCitas - Calendario mensual con citas agendadas
 * Diseño moderno tipo Google Calendar
 */
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  citas: {
    type: Array,
    default: () => []
  },
  mesInicial: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['select-day', 'select-cita'])

// State
const currentMonth = ref(new Date(props.mesInicial))
const selectedDay = ref(null)

// Calendar helpers
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('es-CL', { 
    month: 'long', 
    year: 'numeric' 
  })
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
    days.push({ 
      date: d, 
      isCurrentMonth: false, 
      isPast: d < new Date().setHours(0,0,0,0) 
    })
  }
  
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ 
      date: d, 
      isCurrentMonth: true, 
      isPast: d < new Date().setHours(0,0,0,0) 
    })
  }
  
  // Next month padding
  const remaining = 35 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ 
      date: d, 
      isCurrentMonth: false, 
      isPast: false 
    })
  }
  
  return days
})

// Agrupar citas por día
const citasPorDia = computed(() => {
  const grouped = {}
  props.citas.forEach(cita => {
    const key = cita.fecha.toISOString().split('T')[0]
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(cita)
  })
  return grouped
})

function getCitasForDay(day) {
  const key = day.date.toISOString().split('T')[0]
  return citasPorDia.value[key] || []
}

function hasCitas(day) {
  return getCitasForDay(day).length > 0
}

function isToday(day) {
  const today = new Date()
  return day.date.toDateString() === today.toDateString()
}

function isSelected(day) {
  if (!selectedDay.value) return false
  return day.date.toDateString() === selectedDay.value.toDateString()
}

function prevMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(), 
    currentMonth.value.getMonth() - 1, 
    1
  )
}

function nextMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(), 
    currentMonth.value.getMonth() + 1, 
    1
  )
}

function selectDay(day) {
  if (!day.isCurrentMonth) return
  selectedDay.value = day.date
  emit('select-day', day.date)
}

function selectCita(cita) {
  emit('select-cita', cita)
}

// Citas del día seleccionado
const citasDiaSeleccionado = computed(() => {
  if (!selectedDay.value) return []
  const key = selectedDay.value.toISOString().split('T')[0]
  const citas = citasPorDia.value[key] || []
  return citas.sort((a, b) => a.fecha - b.fecha)
})
</script>

<template>
  <div class="calendario-citas h-full flex flex-col bg-background px-6 py-4">
    <!-- Header -->
    <header class="mb-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground capitalize">{{ monthName }}</h1>
          <p class="text-sm text-muted-foreground">{{ citas.length }} citas este mes</p>
        </div>
        
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            @click="prevMonth"
            aria-label="Mes anterior"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            @click="nextMonth"
            aria-label="Mes siguiente"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Calendar Grid + Sidebar Layout -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
      <!-- Calendar Grid (Left) -->
      <div class="lg:col-span-2 flex flex-col">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div 
            v-for="day in daysOfWeek" 
            :key="day"
            class="text-center text-xs font-semibold text-muted-foreground py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1 flex-1">
          <button
            v-for="(day, idx) in calendarDays"
            :key="idx"
            @click="selectDay(day)"
            :disabled="!day.isCurrentMonth"
            class="relative min-h-[80px] p-2 rounded-lg border transition-all group"
            :class="{
              'bg-muted/30 cursor-not-allowed': !day.isCurrentMonth,
              'bg-card hover:bg-accent border-border': day.isCurrentMonth && !isSelected(day),
              'bg-primary/10 border-primary': isSelected(day),
              'ring-2 ring-primary': isToday(day)
            }"
          >
            <!-- Date Number -->
            <span 
              class="text-sm font-medium block mb-1"
              :class="{
                'text-muted-foreground': !day.isCurrentMonth,
                'text-foreground': day.isCurrentMonth && !isToday(day),
                'text-primary font-bold': isToday(day)
              }"
            >
              {{ day.date.getDate() }}
            </span>

            <!-- Event Indicators (dots) -->
            <div v-if="hasCitas(day)" class="flex flex-wrap gap-1">
              <div 
                v-for="(cita, i) in getCitasForDay(day).slice(0, 3)" 
                :key="i"
                class="w-1.5 h-1.5 rounded-full"
                :class="cita.color"
              />
              <span 
                v-if="getCitasForDay(day).length > 3"
                class="text-[10px] text-muted-foreground"
              >
                +{{ getCitasForDay(day).length - 3 }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Sidebar - Citas del día seleccionado (Right) -->
      <div class="lg:col-span-1 flex flex-col">
        <Card class="flex-1 overflow-hidden flex flex-col">
          <CardContent class="p-4 flex-1 flex flex-col">
            <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              {{ selectedDay ? selectedDay.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día' }}
            </h3>

            <!-- No hay citas -->
            <div v-if="!selectedDay || citasDiaSeleccionado.length === 0" class="flex-1 flex items-center justify-center">
              <div class="text-center text-muted-foreground">
                <Calendar class="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p class="text-sm">
                  {{ selectedDay ? 'No hay citas este día' : 'Selecciona un día para ver las citas' }}
                </p>
              </div>
            </div>

            <!-- Lista de citas -->
            <div v-else class="space-y-3 overflow-y-auto flex-1">
              <article
                v-for="cita in citasDiaSeleccionado"
                :key="cita.id"
                @click="selectCita(cita)"
                class="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors group"
              >
                <!-- Header con hora y tipo -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Clock class="h-3 w-3 text-muted-foreground" />
                    <span class="text-sm font-semibold text-foreground">{{ cita.hora }}</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    class="text-[10px]"
                    :style="{ backgroundColor: cita.color.replace('bg-', '') + '20' }"
                  >
                    {{ cita.estado }}
                  </Badge>
                </div>

                <!-- Tipo de cita -->
                <h4 class="font-medium text-sm text-foreground mb-1">
                  {{ cita.tipoNombre }}
                </h4>

                <!-- Doctor -->
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <User class="h-3 w-3" />
                  <span>{{ cita.doctor }}</span>
                </div>

                <!-- Notas (si existen) -->
                <p v-if="cita.notas" class="text-xs text-muted-foreground mt-2 italic">
                  {{ cita.notas }}
                </p>
              </article>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendario-citas {
  height: 100%;
}
</style>

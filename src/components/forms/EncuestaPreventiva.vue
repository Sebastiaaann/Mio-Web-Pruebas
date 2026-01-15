<script setup>
/**
 * EncuestaPreventiva - Modal de encuesta preventiva inicial
 * Se muestra al inicio para recolectar información de salud básica
 * Migrado a shadcn-vue
 */
import { ref, computed } from 'vue'

// Shadcn components
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

// Lucide icons
import { ArrowLeft, ArrowRight, Check, Home } from 'lucide-vue-next'

// Custom components
import MioRobot from '@/components/ui/MioRobot.vue'

const { visible = false } = defineProps(['visible'])
const emit = defineEmits(['update:visible', 'complete'])

const localVisible = computed({
  get: () => visible,
  set: (val) => emit('update:visible', val)
})

// Paso actual (0 = bienvenida, 1 = datos básicos, 2 = hábitos, 3 = finalizado)
const pasoActual = ref(0)
const totalPasos = 3

// Datos del formulario
const formData = ref({
  // Paso 1 - Datos básicos
  edad: '',
  genero: '',
  altura: '',
  peso: '',
  // Paso 2 - Hábitos
  ejercicio: '',
  fumador: false,
  alcohol: '',
  horasSueno: [7]
})

// Opciones para selects
const opcionesGenero = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decir', value: 'no_decir' }
]

const opcionesEjercicio = [
  { label: 'Nunca', value: 'nunca' },
  { label: '1-2 veces por semana', value: 'poco' },
  { label: '3-4 veces por semana', value: 'moderado' },
  { label: '5+ veces por semana', value: 'frecuente' }
]

const opcionesAlcohol = [
  { label: 'Nunca', value: 'nunca' },
  { label: 'Ocasionalmente', value: 'ocasional' },
  { label: 'Semanalmente', value: 'semanal' },
  { label: 'Diariamente', value: 'diario' }
]

// Navegación
function siguientePaso() {
  if (pasoActual.value < totalPasos) {
    pasoActual.value++
  }
}

function pasoAnterior() {
  if (pasoActual.value > 0) {
    pasoActual.value--
  }
}

function completarEncuesta() {
  // console.log('📋 Encuesta completada:', formData.value)
  emit('complete', formData.value)
  localVisible.value = false
  
  // Reset
  pasoActual.value = 0
}

function cerrarSinCompletar() {
  localVisible.value = false
  pasoActual.value = 0
}

// Progreso
const progreso = computed(() => ((pasoActual.value / totalPasos) * 100))
</script>

<template>
  <Dialog v-model:open="localVisible">
    <DialogContent class="sm:max-w-md p-0 rounded-3xl overflow-hidden">
      <div class="encuesta-content">
        <!-- Progress bar -->
        <Progress :model-value="progreso" class="h-1 rounded-none" />
        
        <div class="p-6">
          <!-- Paso 0: Bienvenida -->
          <div v-if="pasoActual === 0" class="text-center">
            <MioRobot size="lg" mood="happy" :animate="true" class="mb-4 mx-auto" />
            
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              ¡Hola! Soy MIO 👋
            </h2>
            <p class="text-gray-500 mb-6">
              Antes de comenzar, me gustaría conocerte mejor para personalizar tu experiencia de salud.
            </p>
            
            <Button 
              class="w-full py-3 rounded-xl font-bold"
              @click="siguientePaso"
            >
              ¡Empecemos!
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
            
            <button 
              @click="cerrarSinCompletar"
              class="mt-4 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
            >
              Completar después
            </button>
          </div>
          
          <!-- Paso 1: Datos básicos -->
          <div v-else-if="pasoActual === 1" class="space-y-5">
            <div class="text-center mb-6">
              <span class="text-xs text-gray-400 uppercase tracking-wide">Paso 1 de 2</span>
              <h2 class="text-xl font-bold text-gray-800">Datos básicos</h2>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edad">Edad</Label>
                <Input 
                  id="edad" 
                  v-model="formData.edad" 
                  type="number"
                  placeholder="25"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="genero">Género</Label>
                <Select v-model="formData.genero">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="opt in opcionesGenero" 
                      :key="opt.value" 
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="altura">Altura (cm)</Label>
                <Input 
                  id="altura" 
                  v-model="formData.altura" 
                  placeholder="170"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="peso">Peso (kg)</Label>
                <Input 
                  id="peso" 
                  v-model="formData.peso" 
                  placeholder="70"
                />
              </div>
            </div>
            
            <!-- Navigation -->
            <div class="flex gap-3 pt-4">
              <Button 
                variant="secondary"
                class="flex-1 py-3 rounded-xl"
                @click="pasoAnterior"
              >
                <ArrowLeft class="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button 
                class="flex-1 py-3 rounded-xl"
                @click="siguientePaso"
              >
                Siguiente
                <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <!-- Paso 2: Hábitos -->
          <div v-else-if="pasoActual === 2" class="space-y-5">
            <div class="text-center mb-6">
              <span class="text-xs text-gray-400 uppercase tracking-wide">Paso 2 de 2</span>
              <h2 class="text-xl font-bold text-gray-800">Tus hábitos</h2>
            </div>
            
            <div class="space-y-2">
              <Label>¿Con qué frecuencia haces ejercicio?</Label>
              <Select v-model="formData.ejercicio">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="opt in opcionesEjercicio" 
                    :key="opt.value" 
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Checkbox 
                id="fumador" 
                v-model:checked="formData.fumador"
              />
              <Label for="fumador" class="cursor-pointer font-normal">
                ¿Eres fumador actualmente?
              </Label>
            </div>
            
            <div class="space-y-2">
              <Label>Consumo de alcohol</Label>
              <Select v-model="formData.alcohol">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="opt in opcionesAlcohol" 
                    :key="opt.value" 
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-3">
              <Label>
                Horas de sueño promedio: <strong>{{ formData.horasSueno[0] }}h</strong>
              </Label>
              <Slider 
                v-model="formData.horasSueno" 
                :min="4" 
                :max="12" 
                :step="1"
                class="w-full"
              />
            </div>
            
            <!-- Navigation -->
            <div class="flex gap-3 pt-4">
              <Button 
                variant="secondary"
                class="flex-1 py-3 rounded-xl"
                @click="pasoAnterior"
              >
                <ArrowLeft class="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button 
                class="flex-1 py-3 rounded-xl"
                @click="siguientePaso"
              >
                Siguiente
                <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <!-- Paso 3: Completado -->
          <div v-else class="text-center">
            <div class="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check class="h-10 w-10 text-green-500" />
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              ¡Listo! 🎉
            </h2>
            <p class="text-gray-500 mb-6">
              Gracias por completar la encuesta. Ahora podré darte recomendaciones más personalizadas.
            </p>
            
            <Button 
              class="w-full py-3 rounded-xl font-bold"
              @click="completarEncuesta"
            >
              <Home class="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

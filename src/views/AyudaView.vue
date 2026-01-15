<script setup>
/**
 * AyudaView - Vista de ayuda y soporte
 * Menú de lista con iconos para FAQ, Asistencia, etc.
 * Migrado a shadcn-vue
 */
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// Lucide icons
import { 
  HelpCircle, 
  Headphones, 
  Activity, 
  Heart,
  ChevronRight,
  Search,
  MessageCircle,
  X
} from 'lucide-vue-next'

const showFaqDialog = ref(false)

const menuItems = [
  {
    id: 'faq',
    titulo: 'Preguntas Frecuentes',
    descripcion: 'Encuentra respuestas a las dudas más comunes',
    icon: HelpCircle,
    color: '#7B61FF',
    action: () => { showFaqDialog.value = true }
  },
  {
    id: 'asistencia-mio',
    titulo: 'Asistencia MIO',
    descripcion: 'Contacta con nuestro equipo de soporte',
    icon: Headphones,
    color: '#3B82F6',
    action: () => { console.log('Asistencia MIO') }
  },
  {
    id: 'ayuda-controles',
    titulo: 'Ayuda en Controles',
    descripcion: 'Cómo realizar tus mediciones correctamente',
    icon: Activity,
    color: '#10B981',
    action: () => { console.log('Ayuda en controles') }
  },
  {
    id: 'asistencia-salud',
    titulo: 'Asistencia en Salud',
    descripcion: 'Consulta con profesionales de salud',
    icon: Heart,
    color: '#EF4444',
    action: () => { console.log('Asistencia en salud') }
  }
]

const faqs = [
  {
    pregunta: '¿Cómo mido mi presión arterial?',
    respuesta: 'Para medir tu presión arterial correctamente, siéntate cómodamente con el brazo apoyado a la altura del corazón. Coloca el brazalete y sigue las instrucciones del dispositivo.'
  },
  {
    pregunta: '¿Con qué frecuencia debo realizar mis controles?',
    respuesta: 'La frecuencia de los controles depende de tu condición de salud. En general, recomendamos seguir el calendario de controles que aparece en tu Dashboard.'
  },
  {
    pregunta: '¿Cómo sincronizo mi dispositivo?',
    respuesta: 'Para sincronizar dispositivos, debes usar la aplicación móvil MIO. La web es informativa y muestra los datos ya sincronizados.'
  },
  {
    pregunta: '¿Mis datos están seguros?',
    respuesta: 'Sí, todos tus datos de salud están protegidos con encriptación de nivel bancario y cumplimos con todas las normativas de protección de datos de salud.'
  }
]

function handleItemClick(item) {
  if (item.action) {
    item.action()
  }
}
</script>

<template>
  <div class="ayuda-view space-y-6 pb-20 md:pb-6">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Centro de Ayuda
      </h1>
      <p class="text-gray-500">
        ¿En qué podemos ayudarte hoy?
      </p>
    </header>

    <!-- Search -->
    <div class="relative mb-6">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input 
        type="text"
        placeholder="Buscar en ayuda..."
        class="pl-12 py-3 rounded-xl"
      />
    </div>

    <!-- Menu List -->
    <div class="grid gap-4">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="handleItemClick(item)"
        class="help-item flex items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group cursor-pointer"
      >
        <!-- Icon -->
        <div 
          class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform"
          :style="{ backgroundColor: `${item.color}15` }"
        >
          <component 
            :is="item.icon" 
            class="h-6 w-6"
            :style="{ color: item.color }"
          />
        </div>
        
        <!-- Content -->
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 group-hover:text-primary transition-colors">
            {{ item.titulo }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ item.descripcion }}
          </p>
        </div>
        
        <!-- Arrow -->
        <ChevronRight class="h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </button>
    </div>

    <!-- Contact Card -->
    <Card class="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-none">
      <CardContent class="p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 mb-1">¿Necesitas más ayuda?</h3>
            <p class="text-sm text-gray-600">Contáctanos directamente por WhatsApp</p>
          </div>
          <Button 
            size="icon"
            class="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle class="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- FAQ Dialog -->
    <Dialog v-model:open="showFaqDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preguntas Frecuentes</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4 max-h-96 overflow-y-auto">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item p-4 bg-gray-50 rounded-xl"
          >
            <h4 class="font-semibold text-gray-800 mb-2 flex items-start">
              <HelpCircle class="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
              {{ faq.pregunta }}
            </h4>
            <p class="text-sm text-gray-600 pl-6">
              {{ faq.respuesta }}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">
              <X class="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.help-item:active {
  transform: scale(0.98);
}
</style>

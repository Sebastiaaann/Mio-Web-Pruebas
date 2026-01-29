<script setup>
/**
 * AyudaView - Vista de ayuda y soporte
 * Menú de lista con iconos para FAQ, Asistencia, etc.
 * Migrado a shadcn-vue
 */
import { ref } from 'vue'
// Base Components
import SectionHeader from '@/components/ui/base/SectionHeader.vue'
import BaseCard from '@/components/ui/base/BaseCard.vue'
import SearchInput from '@/components/ui/base/SearchInput.vue'
import IconContainer from '@/components/ui/base/IconContainer.vue'

// Shadcn
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'

// Lucide icons
import { 
  HelpCircle, 
  Headphones, 
  Activity, 
  Heart,
  ChevronRight,
  X
} from 'lucide-vue-next'

const showFaqDialog = ref(false)
const searchQuery = ref('')

// Helper to extract proper color name for Tailwind
const getTailwindColor = (hexOrName) => {
  // Map hex colors to nearest tailwind palette name (simple mapping for this view)
  const colorMap = {
    '#7B61FF': 'violet',
    '#3B82F6': 'blue',
    '#10B981': 'emerald',
    '#EF4444': 'rose'
  }
  return colorMap[hexOrName] || 'gray'
}

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
    <SectionHeader 
      title="Centro de Ayuda" 
      subtitle="¿En qué podemos ayudarte hoy?"
      size="large"
    />

    <!-- Search -->
    <SearchInput 
      v-model="searchQuery" 
      placeholder="Buscar en ayuda..." 
    />

    <!-- Menu List -->
    <div class="grid gap-4 mt-6">
      <BaseCard
        v-for="item in menuItems"
        :key="item.id"
        padding="normal"
        rounded="large"
        hoverable
        clickable
        @click="handleItemClick(item)"
        class="flex items-center group"
      >
        <!-- Icon -->
        <IconContainer 
          size="large" 
          :bg-color="getTailwindColor(item.color)" 
          bg-intensity="50"
          :icon-color="getTailwindColor(item.color)"
          :style="{ backgroundColor: `${item.color}15`, color: item.color }"
          rounded="xl"
          class="mr-4 group-hover:scale-110 transition-transform"
        >
          <component :is="item.icon" stroke-width="2.5" />
        </IconContainer>
        
        <!-- Content -->
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 group-hover:text-primary transition-colors text-lg">
            {{ item.titulo }}
          </h3>
          <p class="text-sm text-gray-500 mt-0.5">
            {{ item.descripcion }}
          </p>
        </div>
        
        <!-- Arrow -->
        <ChevronRight class="h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </BaseCard>
    </div>

    <!-- Contact Card - WhatsApp Real -->
    <BaseCard 
      padding="large" 
      rounded="large" 
      :hoverable="false"
      class="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
    >
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 mb-1">¿Necesitas más ayuda?</h3>
            <p class="text-sm text-gray-600">Contáctanos directamente por WhatsApp</p>
          </div>
          <a 
            href="https://wa.me/56912345678?text=Hola%2C%20necesito%20ayuda%20con%20la%20app%20MIO%2B" 
            target="_blank"
            rel="noopener noreferrer"
            class="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="Contactar por WhatsApp"
          >
            <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
    </BaseCard>

    <!-- FAQ Dialog -->
    <Dialog v-model:open="showFaqDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preguntas Frecuentes</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4 max-h-96 overflow-y-auto">
          <BaseCard 
            v-for="(faq, index) in faqs" 
            :key="index"
            padding="normal"
            rounded="medium"
            variant="gray"
            :hoverable="false"
          >
            <h4 class="font-semibold text-gray-800 mb-2 flex items-start">
              <HelpCircle class="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
              {{ faq.pregunta }}
            </h4>
            <p class="text-sm text-gray-600 pl-6">
              {{ faq.respuesta }}
            </p>
          </BaseCard>
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

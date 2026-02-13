<script setup>
/**
 * AyudaView - Vista de ayuda y soporte
 * Diseño basado en Cards con Robots y Botones de Contacto
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle, ExternalLink } from 'lucide-vue-next'

const router = useRouter()
const showFaqDialog = ref(false)

// Configuración de las Cards de Ayuda
const helpCards = [
  {
    id: 'salud',
    title: 'Asistencia en Salud',
    description: 'En MIO APP estamos atentos a tu estado de salud. Podemos darte soporte médico y guiarte en el proceso',
    image: '/images-vista-ayuda/Personalizado.png',
    whatsapp: 'https://wa.me/56939504383', // Número genérico o placeholder
    phone: 'tel:6002001234'
  },
  {
    id: 'controles',
    title: 'Asistencia en Controles y Campañas',
    description: 'En MIO APP estamos atentos a tu estado de salud. Podemos darte soporte y guiarte en el proceso',
    image: '/images-vista-ayuda/asiste-controles-campañas.png',
    whatsapp: 'https://wa.me/56939504383',
    phone: 'tel:6002001234'
  },
  {
    id: 'tecnica',
    title: 'Asistencia técnica MIO APP',
    description: 'Te recomendamos revisar la sección de preguntas frecuentes antes de contactarnos.',
    image: '/images-vista-ayuda/Estado=EditInfo.png',
    whatsapp: 'https://wa.me/56939504383',
    phone: 'tel:6002001234',
    showFaq: true
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
</script>

<template>
  <div class="ayuda-view pb-20 md:pb-6 font-sans bg-white min-h-screen" style="font-family: 'Cabinet Grotesk', sans-serif;">
    <!-- Header -->
    <HeaderCompleto 
      titulo="Centro de Ayuda" 
      subtitulo="¿En qué podemos ayudarte hoy?" 
      :mostrar-saludo="false" 
      :show-notification-badge="false" 
      @click-profile="router.push('/perfil')" 
    />
    
    <!-- Cards Container -->
    <div class="px-4 md:px-8 py-4 space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 max-w-7xl mx-auto">
      
      <div 
        v-for="card in helpCards" 
        :key="card.id" 
        class="flex flex-col items-center text-center h-full p-6 rounded-3xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-50"
      >
        <!-- Imagen Robot -->
        <div class="h-40 mb-2 flex items-end justify-center transform hover:scale-105 transition-transform duration-300">
           <img 
             :src="card.image" 
             :alt="card.title" 
             class="h-full w-auto object-contain drop-shadow-xl" 
           />
        </div>
        
        <!-- Título -->
        <h2 class="text-[22px] font-bold text-slate-800 leading-tight mb-4 px-2">
          {{ card.title }}
        </h2>
        
        <!-- Descripción -->
        <div class="mb-8 px-4 flex-grow flex flex-col justify-start">
          <p class="text-slate-600 text-[15px] leading-relaxed">
            {{ card.description }}
          </p>
          <button 
            v-if="card.showFaq" 
            @click="showFaqDialog = true"
            class="text-violet-600 font-bold text-sm mt-2 hover:underline inline-flex items-center justify-center gap-1 mx-auto"
          >
            Ver Preguntas Frecuentes
            <ExternalLink :size="14" />
          </button>
        </div>

        <!-- Botones de Contacto (Aligned to bottom) -->
        <div class="w-full space-y-4 max-w-sm mt-auto">
           <!-- Whatsapp Button -->
           <a 
             :href="card.whatsapp" 
             target="_blank" 
             class="block w-full border-[2px] border-[#D4E157] rounded-[32px] py-3 px-4 hover:bg-[#D4E157]/10 transition-all active:scale-95 group bg-white"
           >
             <div class="font-bold text-slate-800 text-[14px] mb-0.5 group-hover:text-slate-900">ESCRÍBENOS POR WHATSAPP</div>
             <div class="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Lun a Vie de 9:00 a 18:00 hrs.</div>
           </a>

           <!-- Teléfono Button -->
           <a 
             :href="card.phone" 
             class="block w-full border-[2px] border-[#D4E157] rounded-[32px] py-3 px-4 hover:bg-[#D4E157]/10 transition-all active:scale-95 group bg-white"
           >
             <div class="font-bold text-slate-800 text-[14px] mb-0.5 group-hover:text-slate-900">LLÁMANOS</div>
             <div class="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Lun a Vie de 9:00 a 18:00 hrs.</div>
           </a>
        </div>
      </div>

    </div>

    <!-- FAQ Dialog -->
    <Dialog v-model:open="showFaqDialog">
      <DialogContent class="sm:max-w-lg bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden" style="font-family: 'Cabinet Grotesk', sans-serif;">
        <div class="bg-violet-50 p-6 border-b border-violet-100">
          <DialogHeader>
            <DialogTitle class="text-2xl font-bold text-violet-900 flex items-center gap-3">
              <div class="p-2 bg-white rounded-xl shadow-sm">
                <HelpCircle class="h-6 w-6 text-violet-600" />
              </div>
              Preguntas Frecuentes
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div class="space-y-3 p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <h4 class="font-bold text-slate-800 mb-2 text-base">
              {{ faq.pregunta }}
            </h4>
            <p class="text-slate-600 text-sm leading-relaxed">
              {{ faq.respuesta }}
            </p>
          </div>
        </div>
        
        <div class="p-6 pt-2 bg-white border-t border-gray-50">
          <DialogClose as-child>
            <Button class="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 h-12 font-bold text-base">
              Entendido
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'

// Components
import BentoGrid from '@/components/ui/bento-grid/BentoGrid.vue'
import BentoCard from '@/components/ui/bento-grid/BentoCard.vue'

// Icons
import {
  FileEdit,
  Settings,
  Heart,
  Megaphone,
  Calendar,
  Video
} from 'lucide-vue-next'

const userStore = useUserStore()
const healthStore = useHealthStore()
const { firstName } = storeToRefs(userStore)
const { ultimaMedicion, controlesProximos, campanhas } = storeToRefs(healthStore)

// Initialize data
onMounted(() => {
  if (!userStore.isAuthenticated) {
    userStore.mockLogin()
  }
  healthStore.initMockData()
})

// Feature definition for Bento Grid
// We use computed or just reactive array if we want it to update with store
const features = [
  {
    icon: FileEdit,
    name: "Realizar Encuesta",
    description: "Ayúdanos a mejorar tu seguimiento completando tu encuesta diaria.",
    href: "/controles", // Redirect to Controls
    cta: "Comenzar",
    backgroundIcon: FileEdit,
    backgroundClass: "absolute -top-8 -right-8 text-gray-200 dark:text-gray-900/40 w-48 h-48 opacity-50 rotate-12 pointer-events-none",
    className: "lg:row-span-2 min-h-[320px] lg:min-h-[400px]",
    contentClass: "" 
  },
  {
    icon: Heart,
    name: "Última Medición",
    description: "Revisa el estado de tus últimas métricas registradas.",
    href: "/controles", // Redirect to Controls (History is there)
    cta: "Ver Detalle",
    backgroundIcon: Heart,
    backgroundClass: "absolute -top-10 -right-10 text-gray-200 dark:text-gray-900/40 w-52 h-52 opacity-40 rotate-[15deg] pointer-events-none",
    className: "lg:col-span-2 min-h-[200px]",
    contentClass: "my-auto"
  },
  {
    icon: Calendar,
    name: "Próximos Controles",
    description: "Agenda y revisa tus próximas citas médicas.",
    href: "/controles", // Redirect to Controls
    cta: "Ver Agenda",
    backgroundIcon: Calendar,
    backgroundClass: "absolute -top-6 -right-10 text-gray-200 dark:text-gray-900/40 w-48 h-48 opacity-50 -rotate-[10deg] pointer-events-none",
    className: "lg:row-span-2 min-h-[320px]",
    contentClass: ""
  },
  {
    icon: Megaphone,
    name: "Campañas de Salud",
    description: "Información importante y prevenciones activas.",
    href: "/en-construccion",
    cta: "Explorar",
    backgroundIcon: Megaphone,
    backgroundClass: "absolute -top-8 -right-8 text-gray-200 dark:text-gray-900/40 w-40 h-40 opacity-50 rotate-6 pointer-events-none",
    className: "min-h-[220px]",
    contentClass: ""
  },
  {
    icon: Video,
    name: "Videos Educativos",
    description: "Aprende más sobre tu salud con nuestra biblioteca.",
    href: "/en-construccion",
    cta: "Ver Videos",
    backgroundIcon: Video,
    backgroundClass: "absolute -top-6 -right-6 text-gray-200 dark:text-gray-900/40 w-40 h-40 opacity-50 rotate-12 pointer-events-none",
    className: "min-h-[220px]",
    contentClass: ""
  },
  {
    icon: Settings,
    name: "Configurar Perfil",
    description: "Actualiza tus datos y preferencias de la cuenta.",
    href: "/en-construccion",
    cta: "Configurar",
    backgroundIcon: Settings,
    backgroundClass: "absolute -top-6 -right-6 text-gray-200 dark:text-gray-900/40 w-40 h-40 opacity-50 rotate-[20deg] pointer-events-none",
    className: "min-h-[220px]",
    contentClass: ""
  },
]
</script>

<template>
  <div class="size-full bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300 overflow-hidden flex flex-col">
    <!-- Header simple matching the new aesthetic -->
    <div class="mb-4 shrink-0">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white text-balance flex items-center gap-3">
            Hola, {{ firstName }} <span class="animate-pulse">👋</span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-pretty text-lg">
            Bienvenido a tu panel de control unificado.
        </p>
    </div>

    <!-- The Bento Grid -->
    <div class="flex-1 w-full min-h-0 overflow-y-auto pb-4">
        <BentoGrid class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            <BentoCard 
                v-for="feature in features"
                :key="feature.name"
                :name="feature.name"
                :class="feature.className"
                :icon="feature.icon"
                :description="feature.description"
                :href="feature.href"
                :cta="feature.cta"
                :contentClass="feature.contentClass"
            >
                 <template #background>
                     <component 
                        :is="feature.backgroundIcon" 
                        :class="feature.backgroundClass"
                        stroke-width="1"
                     />
                 </template>
            </BentoCard>
        </BentoGrid>
    </div>
  </div>
</template>

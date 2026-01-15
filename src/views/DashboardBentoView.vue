<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useHealthStore } from '@/stores/healthStore'

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
    href: "/encuesta", // Placeholder route, or trigger modal (handled via router hash or similar if needed, for now link)
    cta: "Comenzar",
    background: null, // We can add illustrations here
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    icon: Heart,
    name: "Última Medición",
    description: "Revisa el estado de tus últimas métricas registradas.",
    href: "/mediciones",
    cta: "Ver Detalle",
    background: null,
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    icon: Calendar,
    name: "Próximos Controles",
    description: "Agenda y revisa tus próximas citas médicas.",
    href: "/controles",
    cta: "Ver Agenda",
    background: null,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
  {
    icon: Megaphone,
    name: "Campañas de Salud",
    description: "Información importante y prevenciones activas.",
    href: "/campanas", // Assuming a route exists or just placeholder
    cta: "Explorar",
    background: null,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
  {
    icon: Settings,
    name: "Configurar Perfil",
    description: "Actualiza tus datos y preferencias de la cuenta.",
    href: "/onboarding",
    cta: "Configurar",
    background: null,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
    {
    icon: Video,
    name: "Videos Educativos",
    description: "Aprende más sobre tu salud con nuestra biblioteca.",
    href: "/recursos",
    cta: "Ver Videos",
    background: null,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
]
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header simple matching the new aesthetic -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Hola, {{ firstName }} 👋
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
            Bienvenido a tu panel de control unificado.
        </p>
    </div>

    <!-- The Bento Grid -->
    <BentoGrid class="lg:grid-rows-3">
        <BentoCard 
            v-for="feature in features"
            :key="feature.name"
            :name="feature.name"
            :class="feature.className"
            :icon="feature.icon"
            :description="feature.description"
            :href="feature.href"
            :cta="feature.cta"
        >
             <template #background>
                <!-- Abstract decorative background for cards -->
                 <div class="absolute -right-20 -top-20 opacity-10 pointer-events-none">
                     <component :is="feature.icon" class="w-64 h-64 text-gray-500" />
                 </div>
             </template>
        </BentoCard>
    </BentoGrid>
  </div>
</template>

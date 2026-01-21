<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useTiendaServicios } from '@/stores/tiendaServicios'

// Components
import BentoGrid from '@/components/ui/bento-grid/BentoGrid.vue'
import BentoCard from '@/components/ui/bento-grid/BentoCard.vue'

// Icons - Mapa para resolver iconos dinámicamente
import {
  FileEdit,
  Settings,
  Heart,
  Megaphone,
  Calendar,
  Video,
  Activity,
  BookOpen,
  HelpCircle,
  Home,
  Inbox,
  User,
  Stethoscope,
  Pill,
  ClipboardList,
  Phone,
  MessageCircle,
  Bell
} from 'lucide-vue-next'

// Mapa de iconos para servicios dinámicos
const iconMap = {
  'activity': Activity,
  'heart': Heart,
  'calendar': Calendar,
  'video': Video,
  'megaphone': Megaphone,
  'settings': Settings,
  'file-edit': FileEdit,
  'book-open': BookOpen,
  'help-circle': HelpCircle,
  'home': Home,
  'inbox': Inbox,
  'user': User,
  'stethoscope': Stethoscope,
  'pill': Pill,
  'clipboard-list': ClipboardList,
  'phone': Phone,
  'message-circle': MessageCircle,
  'bell': Bell,
  // Defaults
  'default': Activity
}

const userStore = useUserStore()
const serviciosStore = useTiendaServicios()

const { firstName } = storeToRefs(userStore)
const { servicios, cargando, error } = storeToRefs(serviciosStore)

// Resolver icono desde string a componente
const resolveIcon = (iconName) => {
  if (!iconName) return iconMap.default
  const key = iconName.toLowerCase().replace(/[^a-z-]/g, '')
  return iconMap[key] || iconMap.default
}

// Servicios estáticos como fallback si la API no devuelve nada
const fallbackFeatures = [
  {
    icon: FileEdit,
    name: "Realizar Encuesta",
    description: "Ayúdanos a mejorar tu seguimiento completando tu encuesta diaria.",
    href: "/controles",
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
    href: "/controles",
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
    href: "/controles",
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
]

// Features computados: usa servicios de la API o fallback
const features = computed(() => {
  if (servicios.value && servicios.value.length > 0) {
    return servicios.value.map((servicio, index) => {
      const icon = resolveIcon(servicio.icono || servicio.icon)
      return {
        icon,
        name: servicio.nombre || servicio.name || 'Servicio',
        description: servicio.descripcion || servicio.description || '',
        href: servicio.ruta || servicio.route || '/en-construccion',
        cta: servicio.cta || 'Ver más',
        backgroundIcon: icon,
        backgroundClass: "absolute -top-8 -right-8 text-gray-200 dark:text-gray-900/40 w-40 h-40 opacity-50 rotate-12 pointer-events-none",
        className: index === 0 ? "lg:row-span-2 min-h-[320px]" : "min-h-[220px]",
        contentClass: ""
      }
    })
  }
  return fallbackFeatures
})

// Cargar servicios al montar
onMounted(async () => {
  // Cargar servicios dinámicos
  await serviciosStore.cargarServicios()
  
  if (import.meta.env.DEV) {
    console.log('📦 Servicios cargados:', servicios.value)
  }
})
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

<script setup>
/**
 * MensajesView - Centro de Notificaciones y Novedades
 */
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Motion, AnimatePresence } from 'motion-v'
import { useMensajesStore } from '@/stores/tiendaMensajes'
import { useRouter } from 'vue-router'
import { 
  ChevronRight, 
  Inbox, 
  Bell, 
  Calendar, 
  Megaphone, 
  Info,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-vue-next'

const router = useRouter()
const mensajesStore = useMensajesStore()
const { sections } = storeToRefs(mensajesStore)

// Estado local
const isLoading = ref(true)
const activeTab = ref('todo') // 'todo', 'priority', 'news'

onMounted(async () => {
  isLoading.value = true
  try {
    await mensajesStore.refreshMessages()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

// Computar lista plana de todos los mensajes para la pestaña "Todo"
const allMessages = computed(() => {
  const all = []
  sections.value.forEach(section => {
    // Añadimos el tipo de sección al item para referencia si se necesita
    const itemsWithType = section.items.map(item => ({ 
      ...item, 
      sectionId: section.id 
    }))
    all.push(...itemsWithType)
  })
  
  // Ordenar por fecha si existe
  return all.sort((a, b) => {
    // Priorizar por sección primero: priority > news > info
    if (a.sectionId !== b.sectionId) {
      if (a.sectionId === 'priority') return -1
      if (b.sectionId === 'priority') return 1
    }
    // Luego por fecha
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date)
    }
    return 0
  })
})

// Filtrar mensajes según la pestaña activa
const filteredMessages = computed(() => {
  if (activeTab.value === 'todo') {
    return allMessages.value
  }
  
  // Si la pestaña es 'news', incluimos 'news' e 'info'
  if (activeTab.value === 'news') {
    const newsSection = sections.value.find(s => s.id === 'news')
    const infoSection = sections.value.find(s => s.id === 'info')
    return [
      ...(newsSection?.items || []),
      ...(infoSection?.items || [])
    ]
  }

  // Para 'priority', buscamos la sección exacta
  const section = sections.value.find(s => s.id === activeTab.value)
  return section ? section.items : []
})

// Contadores para badges
const counts = computed(() => {
  const priority = sections.value.find(s => s.id === 'priority')?.count || 0
  const news = (sections.value.find(s => s.id === 'news')?.count || 0) + (sections.value.find(s => s.id === 'info')?.count || 0)
  return {
    todo: allMessages.value.length,
    priority,
    news
  }
})

function formatearFecha(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 0) {
    // Futuro
    if (days === -1) return 'Mañana'
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

function handleAction(mensaje) {
  if (mensaje.actionLink) {
    if (mensaje.actionLink.startsWith('http')) {
      window.open(mensaje.actionLink, '_blank')
    } else {
      router.push(mensaje.actionLink)
    }
  }
}
</script>

<template>
  <div class="w-full h-full min-h-screen font-sans p-4 md:p-6 bg-gray-50/30 dark:bg-neutral-950/30" style="font-family: 'Cabinet Grotesk', sans-serif;">
    <div class="bg-white dark:bg-neutral-900 h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 z-10">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-violet-600 dark:text-violet-400">
            <Inbox class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              Bandeja de Entrada
            </h1>
            <p class="text-xs text-gray-500">Notificaciones, recordatorios y novedades</p>
          </div>
        </div>
        
        <div class="flex gap-2">
           <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-400 transition-colors" title="Filtrar">
             <Filter :size="18" />
           </button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="px-6 pt-2 flex gap-6 border-b border-gray-100 dark:border-neutral-800 overflow-x-auto no-scrollbar bg-white dark:bg-neutral-900 z-10">
        <button 
          @click="activeTab = 'todo'"
          class="pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
          :class="activeTab === 'todo' ? 'border-violet-600 text-violet-700 dark:text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          Todo
          <span class="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">{{ counts.todo }}</span>
        </button>
        
        <button 
          @click="activeTab = 'priority'"
          class="pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
          :class="activeTab === 'priority' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          Prioritario
          <span 
            class="text-[10px] px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center"
            :class="activeTab === 'priority' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 dark:bg-neutral-800 text-gray-600'"
          >{{ counts.priority }}</span>
        </button>
        
        <button 
          @click="activeTab = 'news'"
          class="pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
          :class="activeTab === 'news' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          Novedades
          <span 
            class="text-[10px] px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center"
            :class="activeTab === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-neutral-800 text-gray-600'"
          >{{ counts.news }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50/50 dark:bg-neutral-900/50">
        <Motion 
          layout 
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto"
        >
          <div v-if="isLoading" class="py-12 col-span-full flex flex-col items-center justify-center text-gray-400">
            <div class="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-3"></div>
            <span class="text-sm">Cargando notificaciones...</span>
          </div>

          <div v-else-if="filteredMessages.length === 0" class="py-16 col-span-full text-center flex flex-col items-center">
            <div class="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Inbox class="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 class="text-gray-900 dark:text-white font-medium mb-1">Todo está al día</h3>
            <p class="text-gray-500 text-sm max-w-xs mx-auto">No tienes notificaciones pendientes en esta sección.</p>
          </div>

          <!-- Messages List Grid -->
          <Motion
            v-else
            v-for="(mensaje, i) in filteredMessages"
            :key="mensaje.id"
            :initial="{ opacity: 0, y: 10, scale: 0.98 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :transition="{ duration: 0.3, delay: i * 0.05 }"
            class="group bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-100 dark:border-neutral-700/50 hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-100 dark:hover:border-neutral-700 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            :class="{ 'xl:col-span-2': mensaje.sectionId === 'priority' || mensaje.type === 'cita' }"
            @click="handleAction(mensaje)"
          >
            <!-- Left accent border based on section/type -->
            <div 
              class="absolute left-0 top-0 bottom-0 w-1 transition-opacity opacity-0 group-hover:opacity-100"
              :class="{
                'bg-orange-500': mensaje.sectionId === 'priority' || mensaje.type === 'control' || mensaje.type === 'cita',
                'bg-violet-500': mensaje.sectionId === 'news' || mensaje.type === 'campana',
                'bg-blue-500': mensaje.sectionId === 'info' || mensaje.type === 'info'
              }"
            ></div>

            <div class="flex gap-4 items-start flex-1">
              <!-- Icon -->
              <div 
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                :class="mensaje.iconBg"
              >
                <component :is="mensaje.icon" class="w-5 h-5" :class="mensaje.iconColor" />
              </div>

              <!-- Text Content -->
              <div class="flex-1 min-w-0 flex flex-col h-full">
                <div class="flex justify-between items-start mb-1">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70 flex items-center gap-1.5" :class="mensaje.iconColor">
                      {{ mensaje.type === 'cita' ? 'Cita Médica' : (mensaje.type === 'control' ? 'Control Pendiente' : (mensaje.type === 'campana' ? 'Campaña' : 'Información')) }}
                      <span v-if="mensaje.sectionId === 'priority'" class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    </span>
                    <h3 class="font-bold text-gray-900 dark:text-white text-base leading-tight truncate pr-2">
                      {{ mensaje.title }}
                    </h3>
                  </div>
                  
                  <span v-if="mensaje.date" class="text-[10px] font-medium text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-gray-100 dark:border-neutral-700">
                    {{ formatearFecha(mensaje.date) }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mt-1 flex-1">
                  {{ mensaje.description }}
                </p>
                
                <!-- Footer Action Hint -->
                <div class="mt-4 pt-3 border-t border-gray-50 dark:border-neutral-700/50 flex justify-end">
                  <div class="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform duration-200">
                    <span>{{ mensaje.actionLink ? 'Ver detalles' : 'Más información' }}</span>
                    <ArrowRight :size="12" />
                  </div>
                </div>
              </div>
            </div>
          </Motion>
        </Motion>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #262626;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

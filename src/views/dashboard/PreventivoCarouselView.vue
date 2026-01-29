<script setup>
/**
 * PreventivoCarouselView - Fullpage Scroll Experience
 * 
 * Features:
 * - Vertical fullpage scroll: scroll down → next page, scroll up → previous page
 * - Horizontal swipe also works
 * - Smooth motion-v animations
 * - No top navbar (immersive mode)
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'
import { Motion, AnimatePresence } from 'motion-v'
import { useDark, useToggle } from '@vueuse/core'

// Theme Toggle component
import AlternarTema from '@/components/ui/AlternarTema.vue'

// Shadcn components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Lucide icons
import { 
  FileEdit, 
  Settings, 
  ArrowRight, 
  Megaphone, 
  Shield,
  Calendar,
  CalendarX,
  Video,
  Play,
  Loader2,
  Activity,
  History,
  ChevronUp,
  ChevronDown
} from 'lucide-vue-next'

// Custom components
import TarjetaSalud from '@/components/health/TarjetaSalud.vue'
import IconoEstado from '@/components/ui/IconoEstado.vue'
import ControlDetailDialog from '@/components/health/ControlDetailDialog.vue'
import EncuestaPreventiva from '@/components/forms/EncuestaPreventiva.vue'

// Dark mode
const isDark = useDark({
  storageKey: 'mio-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

const { firstName, fullName, user } = storeToRefs(userStore)
const { ultimaMedicion, controlesProximos, campanhas, videos, loading } = storeToRefs(healthStore)

// State
const currentPage = ref(0)
const isAnimating = ref(false)
const containerRef = ref(null)

// Touch/Drag state
const touchStartY = ref(0)
const touchStartX = ref(0)

const pages = [
  { id: 'preventivo', title: 'Preventivo', icon: Activity },
  { id: 'controles', title: 'Controles', icon: Calendar }
]

const totalPages = pages.length

// Computed
const translateY = computed(() => currentPage.value * -100)

// Methods
function goToPage(index) {
  if (isAnimating.value) return
  if (index < 0 || index >= totalPages) return
  
  isAnimating.value = true
  currentPage.value = index
  
  // Reset animation lock after transition
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
}

function nextPage() {
  if (currentPage.value < totalPages - 1) {
    goToPage(currentPage.value + 1)
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    goToPage(currentPage.value - 1)
  }
}

// Wheel event handler for fullpage scroll
// Wheel event handler for fullpage scroll with smart nested scrolling
function handleWheel(event) {
  if (isAnimating.value) {
    event.preventDefault()
    return
  }
  
  // Find closest scrollable parent
  let target = event.target
  let scrollable = null
  
  while (target && target !== event.currentTarget) {
    const overflowY = window.getComputedStyle(target).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      if (target.scrollHeight > target.clientHeight) {
        scrollable = target
        break
      }
    }
    target = target.parentElement
  }
  
  const delta = event.deltaY
  
  // If inside scrollable content
  if (scrollable) {
    const isAtTop = scrollable.scrollTop === 0
    const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.clientHeight - scrollable.scrollTop) < 1
    
    // Allow native scroll if NOT at boundary for that direction
    if ((delta > 0 && !isAtBottom) || (delta < 0 && !isAtTop)) {
      event.stopPropagation() // Don't let parent handle it
      return // Let native scroll happen
    }
    // If at boundary, we fall formatting to page navigation (prevent default)
  }

  // If we got here, it's either not scrollable OR at boundary
  event.preventDefault()

  const threshold = 30 // Reduced threshold for better responsiveness
  
  if (Math.abs(delta) > threshold) {
    if (delta > 0) {
      nextPage()
    } else {
      prevPage()
    }
  }
}

// Touch events for mobile
function handleTouchStart(event) {
  touchStartY.value = event.touches[0].clientY
  touchStartX.value = event.touches[0].clientX
}

function handleTouchEnd(event) {
  if (isAnimating.value) return
  
  const touchEndY = event.changedTouches[0].clientY
  const touchEndX = event.changedTouches[0].clientX
  
  const deltaY = touchStartY.value - touchEndY
  const deltaX = touchStartX.value - touchEndX
  
  const threshold = 50
  
  // Prioritize vertical swipe
  if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
    if (deltaY > 0) {
      nextPage()
    } else {
      prevPage()
    }
  }
  // Horizontal swipe as fallback
  else if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      nextPage()
    } else {
      prevPage()
    }
  }
}

// Keyboard navigation
function handleKeyDown(event) {
  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault()
    nextPage()
  } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    prevPage()
  }
}

// Dialog State
const isControlDialogOpen = ref(false)
const selectedControl = ref({})

// Encuesta State
const isSurveyOpen = ref(false)

function handleControlClick(control) {
  selectedControl.value = control
  isControlDialogOpen.value = true
}

function handleControlSubmit(data) {
  healthStore.addMedicion(data.controlId, {
    id: Date.now().toString(),
    tipo: 'manual',
    valor: data.value,
    unidad: data.controlId === '1' ? 'mmHg' : 'kg',
    fecha: data.date,
    estado: 'normal'
  })
}

function openSurvey() {
  isControlDialogOpen.value = false
  isSurveyOpen.value = true
}

function handleSurveyComplete() {
  // Survey completed
}

function playVideo(video) {
  console.log('Reproducir video:', video.titulo)
}

function irAOnboarding() {
  router.push('/onboarding')
}

onMounted(() => {
  if (!userStore.isAuthenticated) {
    userStore.mockLogin()
  }
  healthStore.initMockData()
  
  // Add global event listeners
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div 
    ref="containerRef"
    class="fullpage-container h-dvh w-full overflow-hidden bg-background"
    @wheel="handleWheel"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
    tabindex="0"
  >
    <!-- Floating Theme Toggle Button (Top Right) -->
    <div class="fixed top-4 right-4 z-50">
      <AlternarTema :isDark="isDark" @toggle="toggleDark()" />
    </div>
    
    <!-- Vertical Page Container -->
    <Motion
      class="h-full w-full"
      :animate="{ y: translateY + 'vh' }"
      :transition="{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 20,
        mass: 0.5
      }"
    >
      <!-- Page 1: Preventivo -->
      <section class="h-dvh w-full overflow-hidden">
        <div class="h-full w-full overflow-y-auto p-4 md:p-6 pb-24">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 h-full">

            <!-- COLUMNA IZQUIERDA (2/12) - Perfil y Resumen -->
            <div class="lg:col-span-2 xl:col-span-2 flex flex-col gap-4">
              
              <!-- Tarjeta de Perfil -->
              <Card class="bg-card border-border shadow-sm">
                <CardContent class="p-6 flex flex-col items-center text-center">
                  <div class="relative mb-4">
                     <Avatar class="h-20 w-20 border-4 border-background shadow-lg">
                       <AvatarImage :src="user?.avatar" alt="Avatar" />
                       <AvatarFallback class="bg-primary/10 text-primary text-xl font-bold">
                         {{ userStore.iniciales || 'U' }}
                       </AvatarFallback>
                     </Avatar>
                     <div class="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full"></div>
                  </div>
                  
                  <h2 class="text-lg font-bold text-foreground mb-0.5">{{ fullName }}</h2>
                  <p v-if="user?.email" class="text-xs text-muted-foreground mb-1">{{ user.email }}</p>
                  <p v-if="user?.patient_id" class="text-xs text-muted-foreground uppercase tracking-wider mb-3">ID: #{{ user.patient_id }}</p>
                  
                  <Badge variant="secondary" class="bg-primary/10 text-primary hover:bg-primary/20 mb-4">Usuario MIO+</Badge>

                  <div class="grid grid-cols-2 gap-2 w-full">
                    <Button size="sm" class="w-full bg-primary text-primary-foreground hover:bg-primary/90" @click="irAOnboarding">
                      <FileEdit class="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" class="w-full" @click="router.push('/perfil')">
                      <Settings class="mr-1 h-3 w-3" />
                      Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>

             
            </div>

            <!-- COLUMNA CENTRAL (7/12) -->
            <div class="lg:col-span-7 xl:col-span-7 flex flex-col gap-4">
              
              <!-- Próximos Controles -->
              <section>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-bold text-foreground">Próximos Controles</h3>
                  <Button variant="ghost" size="sm" class="text-primary" @click="goToPage(1)">
                    Ver todos <ArrowRight class="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div v-if="controlesProximos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   <TarjetaSalud
                    v-for="control in controlesProximos"
                    :key="control.id"
                    :titulo="control.nombre"
                    :descripcion="control.descripcion"
                    :fecha="control.fechaProgramada"
                    :icono="control.icono"
                    :color="control.color"
                    :estado="control.estado"
                    @click="handleControlClick(control)"
                  />
                </div>
                
                <Card v-else class="border-dashed">
                  <CardContent class="py-6 text-center text-muted-foreground">
                    <CalendarX class="h-8 w-8 mb-2 mx-auto opacity-50" />
                    <p>No hay controles programados</p>
                  </CardContent>
                </Card>
              </section>

              <!-- Última Medición (movida aquí desde columna izquierda) -->
              <section class="flex-1">
                <h3 class="text-lg font-bold text-foreground mb-3">Última Medición</h3>
                <Card class="bg-card border-border shadow-sm h-full">
                  <CardContent class="p-6">
                    <div class="flex items-center gap-4">
                      <div class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Activity class="h-8 w-8 text-primary" />
                      </div>
                      <div class="flex-1">
                        <div class="flex items-baseline gap-2 mb-1">
                          <span class="text-4xl font-bold text-foreground">
                            {{ ultimaMedicion?.valor && ultimaMedicion.valor !== 'N/A' ? ultimaMedicion.valor : '--' }}
                          </span>
                          <span class="text-sm text-muted-foreground">{{ ultimaMedicion?.unidad }}</span>
                        </div>
                        <Badge :variant="ultimaMedicion?.estado === 'normal' ? 'default' : 'destructive'" class="uppercase text-[10px]">
                          {{ ultimaMedicion?.estado || 'N/A' }}
                        </Badge>
                      </div>
                      <!-- Sparkline -->
                      <div class="h-16 flex items-end gap-1 opacity-60">
                        <div class="w-3 bg-primary/20 rounded-t-sm h-[40%]"></div>
                        <div class="w-3 bg-primary/30 rounded-t-sm h-[60%]"></div>
                        <div class="w-3 bg-primary/40 rounded-t-sm h-[30%]"></div>
                        <div class="w-3 bg-primary/60 rounded-t-sm h-[80%]"></div>
                        <div class="w-3 bg-primary/80 rounded-t-sm h-[50%]"></div>
                        <div class="w-3 bg-primary rounded-t-sm h-[70%]"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            <!-- COLUMNA DERECHA (3/12) - Videos -->
            <div class="lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
              <section>
                <h3 class="text-lg font-bold text-foreground mb-3">Educación</h3>
                
                <div class="space-y-3">
                  <article 
                    v-for="video in videos?.slice(0, 3)" 
                    :key="video.id"
                    class="group relative overflow-hidden rounded-xl bg-muted cursor-pointer hover:shadow-md transition-shadow"
                    @click="playVideo(video)"
                  >
                    <div class="aspect-video bg-slate-200 dark:bg-slate-800 relative">
                       <div class="absolute inset-0 flex items-center justify-center">
                          <Video class="h-6 w-6 opacity-30" />
                       </div>
                       <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div class="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                             <Play class="h-4 w-4 text-primary ml-0.5" />
                          </div>
                       </div>
                    </div>
                    
                    <div class="p-2 bg-card border border-border border-t-0 rounded-b-xl">
                       <h4 class="font-medium text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                         {{ video.titulo }}
                       </h4>
                       <div class="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span>{{ video.duracion }}</span>
                          <span class="flex items-center gap-1"><Shield class="h-2 w-2" /> MIO+</span>
                       </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

          </div>
        </div>
      </section>
      
      <!-- Page 2: Controles -->
      <section class="h-dvh w-full overflow-hidden">
        <div class="h-full w-full overflow-y-auto p-4 md:p-6 pb-24">
          <div class="space-y-6">
            <!-- Header -->
            <header>
              <h1 class="text-2xl font-bold text-foreground mb-1">Mis Controles</h1>
              <p class="text-muted-foreground text-sm">Gestiona tus controles de salud y revisa tu historial</p>
            </header>

        

            <!-- Próximos Controles -->
            <section>
              <h2 class="text-base font-semibold text-foreground mb-3 flex items-center">
                <Calendar class="mr-2 h-4 w-4 text-blue-500" />
                Próximos Controles
              </h2>
              
              <div v-if="loading" class="flex justify-center py-6">
                <Loader2 class="h-6 w-6 text-primary animate-spin" />
              </div>
              
              <Card v-else-if="controlesProximos.length === 0" class="border-dashed">
                <CardContent class="text-center py-6">
                  <CalendarX class="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p class="text-muted-foreground text-sm">No tienes controles programados</p>
                </CardContent>
              </Card>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TarjetaSalud
                  v-for="control in controlesProximos"
                  :key="control.id"
                  :titulo="control.nombre"
                  :descripcion="control.descripcion"
                  :fecha="control.fechaProgramada"
                  :icono="control.icono"
                  :color="control.color"
                  :estado="control.estado"
                  @click="handleControlClick(control)"
                />
              </div>
            </section>

            <!-- Historial de Actividad -->
            <section>
              <h2 class="text-base font-semibold text-foreground mb-3 flex items-center">
                <History class="mr-2 h-4 w-4 text-green-500" />
                Historial de Actividad
              </h2>
              
              <Card>
                <CardContent class="p-4">
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 pb-3 border-b border-border">
                      <IconoEstado status="completado" size="sm" />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-foreground">Control de Peso realizado</p>
                        <p class="text-xs text-muted-foreground">Hace 3 días</p>
                      </div>
                      <span class="text-xs text-muted-foreground shrink-0">72.5 kg</span>
                    </div>
                    
                    <div class="flex items-center gap-3 pb-3 border-b border-border">
                      <IconoEstado status="completado" size="sm" />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-foreground">Presión Arterial medida</p>
                        <p class="text-xs text-muted-foreground">Hace 1 semana</p>
                      </div>
                      <span class="text-xs text-muted-foreground shrink-0">120/80</span>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <IconoEstado status="na" size="sm" />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-foreground">Glicemia</p>
                        <p class="text-xs text-muted-foreground">Sin registro previo</p>
                      </div>
                      <span class="text-xs text-muted-foreground shrink-0">--</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </section>
    </Motion>
    
    <!-- Fixed Navigation Dots (Right side) -->
    <div class="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      <button 
        @click="prevPage"
        :disabled="currentPage === 0"
        class="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        <ChevronUp class="h-4 w-4" />
      </button>
      
      <div class="flex flex-col gap-2">
        <button 
          v-for="(page, index) in pages" 
          :key="page.id"
          @click="goToPage(index)"
          class="group relative flex items-center"
          :aria-label="'Ir a ' + page.title"
        >
          <div
            class="w-2 h-2 rounded-full transition-colors duration-300"
            :class="currentPage === index 
              ? 'bg-primary scale-125' 
              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'"
          />
          
          <!-- Tooltip -->
          <Motion
            v-if="currentPage === index"
            :initial="{ opacity: 0, x: 10 }"
            :animate="{ opacity: 1, x: 0 }"
            class="absolute right-6 whitespace-nowrap bg-card px-2 py-1 rounded text-xs font-medium border border-border shadow-sm"
          >
            {{ page.title }}
          </Motion>
        </button>
      </div>
      
      <button 
        @click="nextPage"
        :disabled="currentPage === totalPages - 1"
        class="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Página siguiente"
      >
        <ChevronDown class="h-4 w-4" />
      </button>
    </div>
    
    <!-- Scroll Hint (Bottom, only on first page) -->
    <Motion
      v-if="currentPage === 0"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 1 }"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 text-muted-foreground"
    >
      <span class="text-xs">Desliza hacia abajo</span>
      <Motion
        :animate="{ y: [0, 8, 0] }"
        :transition="{ duration: 1.5, repeat: Infinity }"
      >
        <ChevronDown class="h-5 w-5" />
      </Motion>
    </Motion>
    
    <!-- Dialogo de Detalle de Control -->
    <ControlDetailDialog 
      v-model:open="isControlDialogOpen"
      :control="selectedControl"
      @submit="handleControlSubmit"
      @start-survey="openSurvey"
    />

    <!-- Encuesta Preventiva -->
    <EncuestaPreventiva
      v-model:visible="isSurveyOpen"
      @complete="handleSurveyComplete"
    />
  </div>
</template>

<style scoped>
.fullpage-container {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

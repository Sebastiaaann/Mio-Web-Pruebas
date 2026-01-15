<script setup>
/**
 * DashboardView - Vista principal del Dashboard
 * Incluye: Resumen de salud, Campañas, Próximos Controles y Videos
 * Migrado a shadcn-vue con Lucide icons
 */
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'

// Shadcn components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Lucide icons
import { 
  FileEdit, 
  Settings, 
  Heart, 
  ArrowRight, 
  Megaphone, 
  Shield,
  Calendar,
  CalendarX,
  Video,
  Play,
  Loader2
} from 'lucide-vue-next'

// Custom components
import TarjetaSalud from '@/components/health/TarjetaSalud.vue'
import IconoEstado from '@/components/ui/IconoEstado.vue'

// Lazy load para componentes de diálogo (solo se cargan cuando se necesitan)
const EncuestaPreventiva = defineAsyncComponent(() => 
  import('@/components/forms/EncuestaPreventiva.vue')
)
// import ControlFormDialog from '@/components/health/ControlFormDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

const { firstName } = storeToRefs(userStore)
const { ultimaMedicion, controlesProximos, campanhas, videos, loading } = storeToRefs(healthStore)

// Modal de encuesta
const showEncuesta = ref(false)

// Dialog State
const isControlDialogOpen = ref(false)
const selectedControl = ref({})

onMounted(() => {
  // Debug log solo en desarrollo
  if (import.meta.env.DEV) {
    console.log('📊 Dashboard cargado')
  }
  
  // Mock login para desarrollo
  if (!userStore.isAuthenticated) {
    userStore.mockLogin()
  }
  
  // Cargar datos de salud
  healthStore.initMockData()
})

function irAOnboarding() {
  router.push('/onboarding')
}

function abrirEncuesta() {
  showEncuesta.value = true
}

function handleControlClick(control) {
  selectedControl.value = control
  isControlDialogOpen.value = true
}

function handleControlSubmit(data) {
  if (import.meta.env.DEV) {
    console.log('Control registrado desde Dashboard:', data)
  }
}

function playVideo(video) {
  if (import.meta.env.DEV) {
    console.log('Reproducir video:', video.titulo)
  }
  // TODO: Implementar reproductor de video
}

function handleEncuestaComplete(data) {
  if (import.meta.env.DEV) {
    console.log('Encuesta completada:', data)
  }
  // TODO: Procesar resultados de encuesta
}
</script>

<template>
  <div class="dashboard-view space-y-8 pb-6">
    
    <!-- Hero Section con Bienvenida -->
    <header class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-6 md:p-10 shadow-xl text-white">
      <div class="relative z-10 max-w-2xl">
        <p class="text-purple-200 font-medium mb-1">Buenos días</p>
        <h1 class="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
          Hola, {{ firstName }}
        </h1>
        <p class="text-purple-100 text-base md:text-lg leading-relaxed mb-6">
          Tu sistema integral de monitoreo de salud. Mantén un seguimiento de tus métricas vitales.
        </p>
        <nav class="flex flex-wrap gap-3">
          <Button 
            class="neu-button bg-white text-primary hover:bg-purple-50 px-5 py-2.5 rounded-xl font-semibold"
            aria-label="Abrir encuesta preventiva de salud"
            @click="abrirEncuesta"
          >
            <FileEdit class="mr-2 h-4 w-4" aria-hidden="true" />
            Realizar Encuesta
          </Button>
          <Button 
            variant="ghost"
            class="bg-white/20 text-white border border-white/30 hover:bg-white/30 px-5 py-2.5 rounded-xl font-medium transition-colors duration-200"
            aria-label="Ir a configuración de perfil"
            @click="irAOnboarding"
          >
            <Settings class="mr-2 h-4 w-4" aria-hidden="true" />
            Configurar Perfil
          </Button>
        </nav>
      </div>
      
      <!-- Decorativo -->
      <div class="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
          <circle cx="100" cy="100" r="80" fill="currentColor" />
        </svg>
      </div>
    </header>

    <!-- Resumen de Última Medición -->
    <section>
      <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Heart class="mr-2 h-5 w-5 text-destructive" />
        Resultado de tu última medición
      </h2>
      
      <Card class="neu-card border border-border bg-card text-card-foreground">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <IconoEstado :status="ultimaMedicion?.estado || 'na'" size="lg" />
              <div>
                <p class="font-semibold text-foreground">Estado General</p>
                <p class="text-sm text-muted-foreground">
                  {{ ultimaMedicion?.estado === 'na' ? 'Sin mediciones recientes' : 'Última medición registrada' }}
                </p>
              </div>
            </div>
            <Button 
              variant="secondary"
              size="sm"
              class="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              @click="router.push('/mediciones')"
            >
              Ver detalles
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Campañas de Salud -->
    <section v-if="campanhas.length > 0">
      <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Megaphone class="mr-2 h-5 w-5 text-primary" />
        Campañas de Salud
      </h2>
      
      <article 
        v-for="campanha in campanhas" 
        :key="campanha.id"
        class="campaign-card relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-indigo-500 p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold mb-1">{{ campanha.nombre }}</h3>
            <p class="text-white/90 text-sm">{{ campanha.descripcion }}</p>
          </div>
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield class="h-7 w-7 text-white" />
          </div>
        </div>
      </article>
    </section>

    <!-- Próximos Controles -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center">
          <Calendar class="mr-2 h-5 w-5 text-blue-500" />
          Próximos Controles
        </h2>
        <Button 
          variant="link"
          class="text-primary text-sm"
          @click="router.push('/controles')"
        >
          Ver todos
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 text-primary animate-spin" />
      </div>
      
      <!-- Grid de controles (reemplaza carousel) -->
      <div 
        v-else-if="controlesProximos.length > 0" 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
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
      
      <!-- Empty state -->
      <Card v-else class="neu-inset border-dashed border-border bg-card">
        <CardContent class="py-8 text-center">
          <CalendarX class="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p class="text-muted-foreground">No tienes controles programados</p>
        </CardContent>
      </Card>
    </section>

    <!-- Videos Educativos -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-foreground flex items-center">
          <Video class="mr-2 h-5 w-5 text-destructive" />
          Explora nuestros videos
        </h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article 
          v-for="video in videos" 
          :key="video.id"
          class="video-card relative overflow-hidden rounded-2xl bg-muted aspect-video cursor-pointer group"
          @click="playVideo(video)"
        >
          <!-- Thumbnail placeholder -->
          <div class="absolute inset-0 bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
            <Video class="h-10 w-10 text-muted-foreground" />
          </div>
          
          <!-- Play overlay -->
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
              <Play class="h-6 w-6 text-primary ml-1" />
            </div>
          </div>
          
          <!-- Info -->
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 class="text-white font-semibold text-sm line-clamp-1">{{ video.titulo }}</h3>
            <p class="text-white/70 text-xs">{{ video.duracion }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Encuesta Preventiva Dialog -->
    <EncuestaPreventiva 
      v-model:visible="showEncuesta"
      @complete="handleEncuestaComplete"
    />

    <!-- Dialogo de Control -->
    <!-- <ControlFormDialog 
      v-model:open="isControlDialogOpen"
      :control="selectedControl"
      @submit="handleControlSubmit"
    /> -->
  </div>
</template>

<style scoped>
.campaign-card {
  background: linear-gradient(135deg, oklch(0.618 0.265 288) 0%, #6366F1 100%);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
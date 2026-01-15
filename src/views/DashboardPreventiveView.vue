<script setup>
/**
 * DashboardPreventiveView - Vista preventiva inspirada en el diseño moderno
 * Layout de 3 columnas:
 * 1. Izquierda: Perfil + Última Medición
 * 2. Centro: Próximos Controles + Campañas
 * 3. Derecha: Videos Educativos
 */
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useHealthStore } from '@/stores/tiendaSalud'

// Shadcn components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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
  Loader2,
  Activity,
  User 
} from 'lucide-vue-next'

// Custom components
import TarjetaSalud from '@/components/health/TarjetaSalud.vue'
import IconoEstado from '@/components/ui/IconoEstado.vue'
// import ControlFormDialog from '@/components/health/ControlFormDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const healthStore = useHealthStore()

const { firstName, fullName, user } = storeToRefs(userStore)
const { ultimaMedicion, controlesProximos, campanhas, videos, loading } = storeToRefs(healthStore)

// Dialog State
const isControlDialogOpen = ref(false)
const selectedControl = ref({})

onMounted(() => {
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

function handleControlClick(control) {
  selectedControl.value = control
  isControlDialogOpen.value = true
}

function handleControlSubmit(data) {
  // console.log('Datos enviados desde el dashboard:', data)
  // Aquí podrías mostrar un toast de éxito
}

function playVideo(video) {
  console.log('Reproducir video:', video.titulo)
}
</script>

<template>
  <div class="dashboard-preventive h-full w-full">
    
    <!-- Grid Layout Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">

      <!-- COLUMNA IZQUIERDA (3/12) - Perfil y Resumen -->
      <div class="lg:col-span-3 flex flex-col gap-4 h-full">
        
        <!-- Tarjeta de Perfil -->
        <Card class="bg-card border-border shadow-sm flex-shrink-0">
          <CardContent class="p-6 flex flex-col items-center text-center">
            <div class="relative mb-4">
               <Avatar class="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage :src="user?.avatar" alt="Avatar" />
                  <AvatarFallback class="bg-primary/10 text-primary text-2xl font-bold">
                    {{ firstName.charAt(0) }}
                  </AvatarFallback>
               </Avatar>
               <div class="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-4 border-card">
                 <div class="w-3 h-3 bg-white rounded-full"></div>
               </div>
            </div>
            
            <h2 class="text-xl font-bold text-foreground mb-1">{{ fullName }}</h2>
            <p class="text-xs text-muted-foreground uppercase tracking-wider mb-4">ID: #48291</p>
            
            <div class="flex gap-2 mb-6">
              <Badge variant="secondary" class="bg-primary/10 text-primary hover:bg-primary/20">Usuario MIO+</Badge>
            </div>

            <div class="grid grid-cols-2 gap-3 w-full">
              <Button class="w-full bg-primary text-primary-foreground hover:bg-primary/90" @click="irAOnboarding">
                <FileEdit class="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" class="w-full border-border text-foreground hover:bg-accent" @click="router.push('/perfil')">
                <Settings class="mr-2 h-4 w-4" />
                Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Última Medición (Adaptada visualmente) -->
        <Card class="bg-card border-border shadow-sm overflow-hidden flex-1">
          <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
              <CardTitle class="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity class="h-4 w-4 text-primary" />
                Última Medición
              </CardTitle>
              <Badge :variant="ultimaMedicion?.estado === 'normal' ? 'default' : 'destructive'" class="uppercase text-[10px]">
                {{ ultimaMedicion?.estado || 'N/A' }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="p-6 pt-2 h-full flex flex-col justify-end">
             <div class="flex items-baseline gap-2 mb-4">
               <span class="text-4xl font-bold text-foreground">
                 {{ ultimaMedicion?.valor && ultimaMedicion.valor !== 'N/A' ? ultimaMedicion.valor : '--' }}
               </span>
               <span class="text-sm text-muted-foreground">{{ ultimaMedicion?.unidad }}</span>
             </div>
             
             <!-- Sparkline decorativa CSS -->
             <div class="h-10 w-full flex items-end gap-1 mb-2 opacity-50">
               <div class="w-1/6 bg-primary/20 rounded-t-sm h-[40%]"></div>
               <div class="w-1/6 bg-primary/30 rounded-t-sm h-[60%]"></div>
               <div class="w-1/6 bg-primary/40 rounded-t-sm h-[30%]"></div>
               <div class="w-1/6 bg-primary/60 rounded-t-sm h-[80%]"></div>
               <div class="w-1/6 bg-primary/80 rounded-t-sm h-[50%]"></div>
               <div class="w-1/6 bg-primary rounded-t-sm h-[70%]"></div>
             </div>
             
             <div class="text-xs text-muted-foreground flex items-center gap-1">
               <IconoEstado :status="ultimaMedicion?.estado || 'na'" size="sm" />
               <span class="ml-1">Estado General</span>
             </div>
          </CardContent>
        </Card>
      </div>

      <!-- COLUMNA CENTRAL (6/12) - Controles y Campañas -->
      <div class="lg:col-span-6 flex flex-col gap-4 h-full">
        
        <!-- Próximos Controles -->
        <section class="flex-shrink-0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-foreground">Próximos Controles</h3>
            <Button variant="ghost" size="sm" class="text-primary hover:text-primary/80 hover:bg-primary/10" @click="router.push('/controles')">
              Ver todos <ArrowRight class="ml-1 h-4 w-4" />
            </Button>
          </div>

          <!-- Grid -->
          <div v-if="controlesProximos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              class="h-full"
            />
          </div>
          
           <!-- Empty state -->
          <Card v-else class="border-dashed border-border bg-card/50">
            <CardContent class="py-8 text-center text-muted-foreground flex flex-col items-center">
              <CalendarX class="h-10 w-10 mb-2 opacity-50" />
              <p>No hay controles programados</p>
            </CardContent>
          </Card>
        </section>

        <!-- Campañas (Expands to fill vertical space) -->
        <section v-if="campanhas.length > 0" class="flex-1 flex flex-col">
           <h3 class="text-lg font-bold text-foreground mb-4">Campañas Activas</h3>
           <div class="flex-1">
              <article 
                v-for="campanha in campanhas" 
                :key="campanha.id"
                class="h-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-6 text-white shadow-lg transition-all hover:shadow-primary/25 hover:scale-[1.005] cursor-pointer flex flex-col justify-between"
              >
                 <!-- Decorative bg pattern -->
                 <div class="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                 
                 <div class="relative z-10 flex items-start justify-between h-full flex-col">
                    <div class="w-full flex justify-between items-start">
                        <Badge class="bg-white/20 text-white border-none hover:bg-white/30">Novedad</Badge>
                        <div class="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <Megaphone class="h-6 w-6 text-white" />
                        </div>
                    </div>
                    
                    <div class="mt-auto pt-8">
                      <h3 class="text-3xl font-bold mb-2">{{ campanha.nombre }}</h3>
                      <p class="text-white/80 max-w-lg text-lg">{{ campanha.descripcion }}</p>
                    </div>
                 </div>
              </article>
           </div>
        </section>

      </div>

      <!-- COLUMNA DERECHA (3/12) - Videos (Reemplaza Chat) -->
      <div class="lg:col-span-3 flex flex-col gap-4 h-full">
        
        <section class="h-full flex flex-col">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 class="text-lg font-bold text-foreground">Educación</h3>
          </div>
          
          <div class="grid grid-rows-3 gap-4 h-full">
            <article 
              v-for="video in videos" 
              :key="video.id"
              class="group relative overflow-hidden rounded-xl bg-muted cursor-pointer transition-all hover:shadow-md flex flex-col"
              @click="playVideo(video)"
            >
              <!-- Thumbnail aspect ratio box -->
              <div class="flex-1 bg-slate-200 dark:bg-slate-800 relative">
                 <div class="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Video class="h-8 w-8 opacity-50" />
                 </div>
                 <!-- Play Overlay -->
                 <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                       <Play class="h-5 w-5 text-primary ml-1" />
                    </div>
                 </div>
              </div>
              
              <div class="p-3 bg-card border border-border border-t-0 rounded-b-xl shrink-0">
                 <h4 class="font-semibold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                   {{ video.titulo }}
                 </h4>
                 <div class="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{{ video.duracion }}</span>
                    <span class="flex items-center gap-1"><Shield class="h-3 w-3" /> MIO+</span>
                 </div>
              </div>
            </article>
          </div>
        </section>

      </div>

    </div>

    <!-- Dialogo de Control -->
    <!-- <ControlFormDialog 
      v-model:open="isControlDialogOpen"
      :control="selectedControl"
      @submit="handleControlSubmit"
    /> -->
  </div>
</template>

<style scoped>
/* Custom utility for clamping text */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

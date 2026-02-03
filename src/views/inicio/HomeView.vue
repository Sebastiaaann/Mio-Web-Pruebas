<script setup lang="ts">
import { ref, computed, onMounted, watch, type Ref } from 'vue';
import { useUserStore } from '@/stores/tiendaUsuario';
import { useHealthStore } from '@/stores/tiendaSalud';
import { useTiendaCampanas } from '@/stores/tiendaCampanas';
import { useTiendaServicios } from '@/stores/tiendaServicios';
import { useConfigStore } from '@/stores/tiendaConfig';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { Bot, Check } from 'lucide-vue-next';
import { pacienteService } from '@/services/pacienteService';
import type { Control, Medicion, Campana, EstadoControl, EstadoMedicion, TipoMedicion } from '@/types/salud';
import { useSaludo } from '@/composables/useSaludo';
import { useFormatoFecha, formatDateFriendly } from '@/composables/useFormatoFecha';
import { useMediciones, type MedicionDisplay, type Tendencia, type DatosResumen } from '@/composables/useMediciones';
import { useUserInitials } from '@/composables/useUserInitials';
import { useBannersFiltrados } from '@/composables/useBannersFiltrados';
import { useTheme } from '@/composables/useTheme';
import BannerCarousel from '@/components/ui/BannerCarousel.vue';
import MaterialAudiovisualCarousel from '@/components/ui/MaterialAudiovisualCarousel.vue';
import ClipButton from '@/components/ui/ClipButton.vue';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet/index.js";
import ChatView from '@/views/chat/ChatView.vue';
import NuevaMedicionSheet from '@/components/NuevaMedicionSheet.vue';

// ============================================================================
// INTERFACES
// ============================================================================

interface EventoProximo {
  day: number
  month: string
  title: string
  subtitle: string
  colorClass: string
  bgClass: string
  status: string
  statusClass: string
}

interface MedicionResumen {
  valor: number
  fecha: string
  fechaStr: string
  altura?: number
  valorCompleto?: string
}

interface MaterialAudiovisualItem {
  id: string | number
  titulo: string
  descripcion: string
  imagen?: string
  url?: string
  categoria: string
}

// Stores
const userStore = useUserStore();
const healthStore = useHealthStore();
const campanasStore = useTiendaCampanas();
const serviciosStore = useTiendaServicios();
const configStore = useConfigStore();
const router = useRouter();

// Refs de stores
const { servicios } = storeToRefs(serviciosStore);

// Refs
const { nombreCompleto, firstName, usuario } = storeToRefs(userStore);
const { campanas } = storeToRefs(campanasStore) as { campanas: Ref<Campana[]> };
const { controlesProximos, historialMediciones, ultimaMedicion } = storeToRefs(healthStore);

// Notifications
const hasNotifications = ref<boolean>(true);

// Estado de carga
const cargandoMediciones = computed(() => healthStore.loading);

// Estado para controlar el panel del chatbot
const chatbotAbierto = ref<boolean>(false);

// Estado para controlar el Sheet de nueva medicion
const nuevaMedicionAbierta = ref<boolean>(false);

// Estado para el plan activo (usar configStore para sincronización entre vistas)
const planActivo = computed(() => configStore.planActivo || 'esencial');

// Composables
const { saludo } = useSaludo();
const { colors, themeClass, isMutual } = useTheme();

// Usar composable de mediciones
const {
  medicionesDisplay,
  datosResumenPeso,
  datosResumenPresion,
  calcularTendencia,
  generarPathPresion,
  generarYUltimoPunto
} = useMediciones({
  controlesProximos,
  historialMediciones,
  ultimaMedicion
});

// Banners filtrados según el plan
const { bannersFiltrados } = useBannersFiltrados(servicios, planActivo);

const logoMutualHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})

// --- Computed Data ---

// Iniciales del usuario
const { iniciales: userInitials } = useUserInitials(firstName, nombreCompleto);

// Eventos (Controles Pendientes)
const proximosEventos = computed<EventoProximo[]>(() => {
    const list = controlesProximos.value.filter(c => c.estado === 'pendiente').slice(0, 3);
    
    if (list.length === 0) {
        return [
           { 
             day: 15, month: 'ENE', title: 'Consulta General', subtitle: 'Hospital Central • 10:00 AM', 
             colorClass: 'text-slate-700', bgClass: 'bg-slate-100', status: 'Confirmada', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
           }
        ];
    }
    
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    return list.map(ev => {
        const d = ev.fechaProgramada ? new Date(ev.fechaProgramada) : new Date();
        return {
            day: d.getDate(),
            month: months[d.getMonth()],
            title: ev.nombre,
            subtitle: ev.descripcion || 'Control programado',
            colorClass: 'text-slate-700',
            bgClass: 'bg-slate-100',
            status: 'Pendiente',
            statusClass: 'bg-slate-100 text-slate-600 border border-slate-200'
        };
    });
});

// Material Audiovisual desde servicios
const materialAudiovisualItems = computed<MaterialAudiovisualItem[]>(() => {
  // Buscar el servicio de MATERIAL AUDIOVISUAL
  const materialService = servicios.value.find(
    (s: any) => s.name?.toUpperCase().includes('MATERIAL AUDIOVISUAL') ||
      s.nombre?.toUpperCase().includes('MATERIAL AUDIOVISUAL') ||
      s.name?.toUpperCase().includes('AUDIOVISUAL') ||
      s.nombre?.toUpperCase().includes('AUDIOVISUAL')
  );

  const opciones = (materialService as any)?.options || (materialService as any)?.items || []

  if (!materialService || !opciones || opciones.length === 0) {
    return [];
  }

  // Obtener opciones según el plan activo
  const planActual = planActivo.value?.toLowerCase() || 'esencial';
  const opcionesPlan = opciones.filter((opt: any) => {
    const planOpcion = String(opt.plan_name || '').toLowerCase()
    return planOpcion.includes(planActual) || planActual.includes(planOpcion)
  });

  if (opcionesPlan.length === 0) {
    return [];
  }

  // Filtrar y eliminar duplicados por título
  const opcionesUnicas = opcionesPlan
    .filter((option: any) => option.title)
    .filter((option: any) => {
      if (!option.type_message) return true;

      try {
        const categorias = JSON.parse(option.type_message);
        if (!Array.isArray(categorias)) return true;

        return categorias.every((cat: any) => {
          const categoriaTitulo = String(cat.title || '').toLowerCase()

          if (cat.excluded_categories?.length) {
            return !cat.excluded_categories.some((exc: string) =>
              categoriaTitulo.includes(exc.toLowerCase())
            );
          }
          if (cat.included_categories?.length) {
            return cat.included_categories.some((inc: string) =>
              categoriaTitulo.includes(inc.toLowerCase())
            );
          }
          return true;
        });
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Error parseando type_message:', e);
        }
        return true;
      }
    })
    .filter((option: any, index: number, self: any[]) => 
      // Eliminar duplicados por título
      index === self.findIndex((o: any) => o.title === option.title)
    );

  return opcionesUnicas.map((option: any, index: number) => ({
    id: `material-${index}`,
    titulo: option.title,
    descripcion: option.title,
    imagen: option.image || option.imagen || option.imagenUrl || null,
    url: option.url || '/recursos',
    categoria: option.title
  }));
});

async function cargarLogoPlanMutual(): Promise<void> {
  const patientId = userStore.usuario?.id || userStore.usuario?.patient_id
  if (!patientId) return

  try {
    const plansResponse = await pacienteService.obtenerPlanes(Number(patientId))
    if (!plansResponse.success) return

    // Manejar diferentes estructuras de respuesta
    const planes: any[] = (plansResponse.data as any)?.plans || plansResponse.planes || []
    if (!Array.isArray(planes) || planes.length === 0) return

    const planMutual = planes.find((plan: any) =>
      (plan.name_plan || '').toLowerCase().includes('mutual')
    )

    configStore.setLogoMutual(planMutual?.config?.logo || null)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error al cargar logo Mutual:', error)
    }
  }
}

function abrirCampana(url: string | undefined) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

onMounted(async () => {
    // Cargar datos reales de la API de HOMA
    await Promise.all([
        healthStore.fetchAllHealthData(),
        campanasStore.cargarCampanas(),
        serviciosStore.cargarServicios(),
        cargarLogoPlanMutual()
    ]);
});

// Watcher para recargar servicios cuando cambie el plan activo
watch(() => configStore.planActivo, async (newPlan, oldPlan) => {
    if (!newPlan || newPlan === oldPlan) return;

    console.log('Plan cambiado a:', newPlan, '- Recargando servicios...');
    await serviciosStore.cargarServicios();
}, { immediate: false });
</script>

<template>
    <!-- Root Container con tema dinámico -->
    <div :class="themeClass" class="h-full flex flex-col bg-slate-50 text-slate-800" style="font-family: 'Cabinet Grotesk', sans-serif;">
        
        <!-- Header Premium -->
        <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 md:px-8 py-3 md:py-4 sticky top-0 z-20 transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="h1-premium">{{ saludo }}, {{ firstName || 'Usuario' }}</h1>
                    <p class="text-secondary text-sm mt-1 font-medium">Aquí está el resumen de tu salud hoy</p>
                </div>
                
                <div class="flex items-center gap-3 md:gap-5">
                    <!-- Logo Mutual si aplica -->
                    <img
                        v-if="logoMutualHeader"
                        :src="logoMutualHeader"
                        alt="Logo Mutual"
                        class="h-7 w-auto object-contain"
                    />
                    
                    <!-- Botón de Notificaciones -->
                    <button class="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all group">
                        <iconify-icon icon="lucide:bell" class="text-xl"></iconify-icon>
                        <span v-if="hasNotifications" class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    
                    <!-- Separador -->
                    <div class="hidden md:block w-px h-6 bg-slate-200"></div>
                    
                    <!-- Avatar Chatbot -->
                    <Sheet v-model:open="chatbotAbierto">
                        <SheetTrigger as-child>
                            <button 
                                class="relative w-10 h-10 rounded-full hover:scale-105 transition-all shadow-lg flex items-center justify-center group"
                                :style="{ 
                                    background: 'linear-gradient(to bottom right, ' + colors.primary + ', ' + colors.primaryHover + ')',
                                    boxShadow: '0 10px 15px -3px ' + colors.primary + '40'
                                }"
                            >
                                <Bot class="w-5 h-5 text-white" />
                                <span 
                                    class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                                    :style="{ backgroundColor: colors.accent }"
                                ></span>
                            </button>
                        </SheetTrigger>
                        
                        <SheetContent side="right" class="w-full sm:w-[450px] p-0 flex flex-col">
                            <SheetHeader class="px-4 py-3 border-b border-slate-200 shrink-0">
                                <SheetTitle class="flex items-center gap-3">
                                    <div 
                                        class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                        :style="{ 
                                            background: 'linear-gradient(to bottom right, ' + colors.primary + ', ' + colors.primaryHover + ')',
                                            boxShadow: '0 10px 15px -3px ' + colors.primary + '40'
                                        }"
                                    >
                                        <Bot class="w-5 h-5 text-white" />
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-base font-semibold text-slate-900">Asistente Virtual</span>
                                        <div class="flex items-center gap-1.5">
                                            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            <span class="text-xs text-green-600 font-medium">En línea</span>
                                        </div>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            
                            <div class="flex-1 overflow-hidden">
                                <ChatView :show-header="false" />
                            </div>
                        </SheetContent>
                    </Sheet>
                    
                    <!-- Separador -->
                    <div class="hidden md:block w-px h-6 bg-slate-200"></div>
                    
                    <!-- Avatar de Perfil -->
                    <div class="relative flex-shrink-0 cursor-pointer" @click="$router.push('/perfil')">
                        <div 
                            class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
                            :style="{ 
                                backgroundColor: colors.primaryLight,
                                borderColor: colors.primary + '30'
                            }"
                        >
                            <span 
                                class="text-sm font-semibold"
                                :style="{ color: colors.primary }"
                            >
                                {{ userInitials }}
                            </span>
                        </div>
                        <div 
                            class="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full"
                            :style="{ backgroundColor: colors.primary }"
                        ></div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <div class="flex-1 overflow-auto p-6 md:p-8 space-y-8 scroll-smooth">
            <div class="max-w-7xl mx-auto space-y-8">
                
                <!-- Campañas de Salud -->
                <section class="fade-in">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="h2-premium flex items-center gap-3">
                            Campañas de Salud
                            <span 
                                v-if="!campanasStore.cargando" 
                                class="px-2.5 py-0.5 text-xs rounded-full font-bold"
                                :style="{ 
                                    backgroundColor: colors.primaryLight,
                                    color: colors.primary
                                }"
                            >
                                {{ campanas.length }}
                            </span>
                        </h2>
                        
                        <button 
                            v-if="campanas.length > 0" 
                            @click="$router.push('/campanas-anteriores')"
                            class="btn-ghost text-sm"
                            :style="{ color: colors.primary }"
                        >
                            Ver campañas anteriores
                            <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
                        </button>
                    </div>
                    
                    <!-- Estado de carga -->
                    <div v-if="campanasStore.cargando" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="n in 3" :key="n" class="card-premium p-6 animate-pulse">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                <div class="w-16 h-6 bg-slate-200 rounded-full"></div>
                            </div>
                            <div class="h-6 bg-slate-200 rounded mb-2 w-3/4"></div>
                            <div class="h-4 bg-slate-200 rounded mb-6 w-full"></div>
                            <div class="h-10 bg-slate-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                    
                    <!-- Estado de error -->
                    <div v-else-if="campanasStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <iconify-icon icon="lucide:alert-circle" class="text-4xl text-red-500 mx-auto mb-4"></iconify-icon>
                        
                        <h3 class="text-h3 text-red-700 mb-2">Error al cargar campañas</h3>
                        
                        <p class="text-red-600 text-sm mb-4">{{ campanasStore.error }}</p>
                        
                        <button @click="campanasStore.cargarCampanas()" class="btn-primary bg-red-600 hover:bg-red-700">
                            Reintentar
                        </button>
                    </div>
                    
                    <!-- Estado vacío -->
                    <div v-else-if="campanas.length === 0" class="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                        <iconify-icon icon="lucide:heart" class="text-4xl text-slate-400 mx-auto mb-4"></iconify-icon>
                        
                        <h3 class="text-h3 text-slate-600 mb-2">No hay campañas activas</h3>
                        
                        <p class="text-slate-500 text-sm">Actualmente no tienes campañas de salud asignadas.</p>
                    </div>
                    
                    <!-- Lista de campañas -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div 
                            v-for="campana in campanas.slice(0, 3)" 
                            :key="campana.id"
                            class="card-premium p-5 group cursor-pointer relative overflow-hidden"
                        >
                            <!-- Hover Effect -->
                            <div 
                                class="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                                :style="{ backgroundColor: colors.primary }"
                            ></div>
                            
                            <!-- Badge Activa/Inactiva -->
                            <div class="absolute top-3 right-3 z-10">
                                <span 
                                    v-if="campana.activa" 
                                    class="badge badge-success"
                                >
                                    Activa
                                </span>
                                <span v-else class="badge badge-secondary">
                                    Inactiva
                                </span>
                            </div>
                            
                            <!-- Imagen principal grande -->
                            <div class="w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-50 flex items-center justify-center">
                                <img 
                                    v-if="campana.imagenUrl || campana.logo" 
                                    :src="campana.imagenUrl || (campana.logo?.startsWith('data:') ? campana.logo : `data:image/png;base64,${campana.logo}`)" 
                                    width="160"
                                    height="100"
                                    class="max-w-[160px] max-h-[100px] w-auto h-auto object-contain" 
                                    alt="Icono" 
                                />
                                <iconify-icon 
                                    v-else 
                                    icon="lucide:heart" 
                                    class="text-5xl"
                                    :style="{ color: colors.primary }"
                                ></iconify-icon>
                            </div>
                            
                            <h3 class="h3-premium mb-4 group-hover:text-slate-900 transition-colors line-clamp-1">
                                {{ campana.nombre }}
                            </h3>
                            
                            <ClipButton
                                class="w-full h-10 rounded-xl"
                                :bg-style="{ 
                                    backgroundColor: colors.primary,
                                    boxShadow: `0 4px 6px ${colors.primary}30`
                                }"
                                :color-style="{ backgroundColor: colors.primaryHover }"
                                text-class="text-white font-bold text-sm"
                                @success="abrirCampana(campana.url || undefined)"
                                @click="abrirCampana(campana.url || undefined)"
                            >
                                <template #baseIcon>Comenzar ahora</template>
                                <template #filledIcon>Comenzar ahora</template>
                                <template #successIcon><Check class="w-5 h-5 text-white" /></template>
                            </ClipButton>
                        </div>
                    </div>
                </section>

                <!-- Mediciones Recientes -->
                <section class="fade-in stagger-1">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="h2-premium">Mis Mediciones Recientes</h2>
                        
                        <button 
                            @click="nuevaMedicionAbierta = true" 
                            class="btn-primary text-sm"
                            :style="{ backgroundColor: colors.primary }"
                        >
                            <iconify-icon icon="lucide:plus" class="text-lg"></iconify-icon>
                            <span>Nueva Medición</span>
                        </button>
                    </div>
                    
                    <!-- Estado de carga - Skeleton -->
                    <div v-if="cargandoMediciones" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div v-for="n in 4" :key="n" class="card-premium p-6 animate-pulse">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 bg-slate-200 rounded-lg"></div>
                                <div class="w-16 h-5 bg-slate-200 rounded-full"></div>
                            </div>
                            <div class="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                            <div class="h-8 bg-slate-200 rounded mb-3 w-1/2"></div>
                            <div class="h-3 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    </div>
                    
                    <!-- Lista de mediciones -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div 
                            v-for="item in medicionesDisplay" 
                            :key="item.key" 
                            class="card-premium p-6 hover:-translate-y-1"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div :class="`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`">
                                    <iconify-icon :icon="`lucide:${item.icon}`" :class="`text-lg ${item.color}`"></iconify-icon>
                                </div>
                                
                                <span :class="`px-2 py-1 text-xs font-semibold rounded-full ${item.statusClass}`">
                                    {{ item.status }}
                                </span>
                            </div>
                            
                            <p class="text-secondary text-sm font-medium mb-1">{{ item.title }}</p>
                            
                            <div class="flex items-baseline gap-2">
                                <p class="text-3xl font-bold text-slate-900 tracking-tight">{{ item.value }}</p>
                                
                                <!-- Indicador de tendencia -->
                                <div v-if="item.tendencia && item.tendencia.direccion !== 'stable'" class="flex items-center gap-1">
                                    <iconify-icon 
                                        :icon="item.tendencia.direccion === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'"
                                        :class="`text-sm ${item.tendencia.direccion === 'up' ? 'text-red-500' : 'text-emerald-500'}`"
                                    ></iconify-icon>
                                    
                                    <span :class="`text-xs font-medium ${item.tendencia.direccion === 'up' ? 'text-red-500' : 'text-emerald-500'}`">
                                        {{ Math.abs(item.tendencia.porcentaje ?? 0).toFixed(1) }}%
                                    </span>
                                </div>
                                
                                <div v-else-if="item.tendencia && item.tendencia.direccion === 'stable'" class="flex items-center gap-1">
                                    <iconify-icon icon="lucide:minus" class="text-sm text-slate-400"></iconify-icon>
                                    <span class="text-xs font-medium text-slate-400">Estable</span>
                                </div>
                            </div>
                            
                            <p class="text-xs text-secondary mt-3 flex items-center gap-1 font-medium"
                            >
                                <iconify-icon icon="lucide:clock" class="text-xs"></iconify-icon>
                                {{ item.unit }} • {{ item.date }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Eventos y Resumen -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in stagger-2"
                >
                    <!-- Material Audiovisual -->
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="h2-premium">Material Audiovisual</h2>
                            
                            <router-link 
                                to="/recursos" 
                                class="btn-ghost text-sm"
                                :style="{ color: colors.primary }"
                            >
                                Ver todos
                                <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
                            </router-link>
                        </div>
                        
                        <div class="card-premium p-6 h-full"
                        >
                            <MaterialAudiovisualCarousel :items="materialAudiovisualItems" />
                        </div>
                    </section>

                    <!-- Resumen -->
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="h2-premium">Resumen Semanal</h2>
                            
                            <select class="input-premium w-auto py-2 text-sm"
                            >
                                <option>Esta semana</option>
                                <option>Semana pasada</option>
                            </select>
                        </div>
                        
                        <div class="card-premium p-6 min-h-[320px] flex flex-col"
                        >
                            <div class="grid grid-cols-2 gap-4 flex-1"
                            >
                                <!-- Gráfico de Peso -->
                                <div class="flex flex-col h-full">
                                    <p class="subtitle-premium mb-2">Control de Peso</p>
                                    
                                    <p v-if="datosResumenPeso.tieneDatos" class="text-2xl font-bold text-slate-900"
                                    >
                                        {{ datosResumenPeso.promedio }} 
                                        <span 
                                            class="text-sm font-sans font-bold"
                                            :style="{ color: colors.primary }"
                                        >
                                            kg
                                        </span>
                                    </p>
                                    
                                    <p v-else class="text-2xl font-bold text-slate-900">
                                        -- 
                                        <span class="text-sm text-slate-400 font-sans font-bold">kg</span>
                                    </p>
                                    
                                    <!-- Gráfico con datos reales -->
                                    <div class="mt-4 flex-1 min-h-[100px] flex flex-col">
                                        <template v-if="datosResumenPeso.tieneDatos"
                                        >
                                            <div class="flex-1 flex items-end gap-1.5 px-1 pb-2 border-b border-slate-200">
                                                <div 
                                                    v-for="(medicion, idx) in datosResumenPeso.mediciones" 
                                                    :key="idx"
                                                    class="flex-1 flex flex-col items-center gap-1"
                                                >
                                                    <div 
                                                        class="w-full rounded-t-md hover:opacity-100 transition-all cursor-pointer relative group min-h-[20px] max-h-[90%]"
                                                        :style="`height: ${Math.min(Math.max(medicion.altura ?? 50, 15), 85)}%; background-color: ${idx === datosResumenPeso.mediciones.length - 1 ? colors.primary : colors.primary + '60'}`"
                                                    >
                                                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg"
                                                        >
                                                            {{ medicion.valor }} kg
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Etiquetas de fechas -->
                                            <div class="flex justify-between px-1 pt-2">
                                                <span 
                                                    v-for="(medicion, idx) in datosResumenPeso.mediciones" 
                                                    :key="idx"
                                                    class="text-xs text-slate-500 font-medium flex-1 text-center"
                                                >
                                                    {{ medicion.fechaStr }}
                                                </span>
                                            </div>
                                        </template>
                                        
                                        <template v-else>
                                            <div class="flex-1 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg"
                                            >
                                                Sin datos registrados
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                
                                <!-- Gráfico de Presión -->
                                <div class="flex flex-col h-full">
                                    <p class="subtitle-premium mb-2">Presión Arterial</p>
                                    
                                    <p v-if="datosResumenPresion.tieneDatos" class="text-2xl font-bold text-slate-900"
                                    >
                                        {{ datosResumenPresion.promedio }} 
                                        <span class="text-sm text-red-500 font-sans font-bold">mmHg</span>
                                    </p>
                                    
                                    <p v-else class="text-2xl font-bold text-slate-900">
                                        -- 
                                        <span class="text-sm text-slate-400 font-sans font-bold">mmHg</span>
                                    </p>
                                    
                                    <!-- Gráfico con datos reales -->
                                    <div class="mt-4 flex-1 min-h-[100px] flex flex-col">
                                        <template v-if="datosResumenPresion.tieneDatos && datosResumenPresion.mediciones.length >= 2"
                                        >
                                            <div class="flex-1 relative pb-2 border-b border-slate-200">
                                                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none"
                                                >
                                                    <defs>
                                                        <linearGradient id="lineGradPresion" x1="0" y1="0" x2="0" y2="1"
                                                        >
                                                            <stop offset="0%" stop-color="#EF4444" stop-opacity="0.3"/>
                                                            <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
                                                        </linearGradient>
                                                    </defs>
                                                    
                                                    <!-- Fondo con gradiente -->
                                                    <path 
                                                        :d="generarPathPresion(datosResumenPresion.mediciones, true)" 
                                                        fill="url(#lineGradPresion)" 
                                                        stroke="none"
                                                        class="opacity-50"
                                                    />
                                                    
                                                    <!-- Línea principal -->
                                                    <path 
                                                        :d="generarPathPresion(datosResumenPresion.mediciones)" 
                                                        fill="none" 
                                                        stroke="#EF4444" 
                                                        stroke-width="2" 
                                                        stroke-linecap="round" 
                                                        stroke-linejoin="round" 
                                                        class="chart-line"
                                                    />
                                                    
                                                    <!-- Punto final -->
                                                    <circle 
                                                        :cx="100" 
                                                        :cy="generarYUltimoPunto(datosResumenPresion.mediciones)" 
                                                        r="3" 
                                                        fill="#EF4444" 
                                                        stroke="white"
                                                        stroke-width="1.5"
                                                    />
                                                </svg>
                                            </div>
                                            <!-- Etiquetas de fechas -->
                                            <div class="flex justify-between px-1 pt-2">
                                                <span 
                                                    v-for="(medicion, idx) in datosResumenPresion.mediciones" 
                                                    :key="idx"
                                                    class="text-xs text-slate-500 font-medium flex-1 text-center"
                                                >
                                                    {{ medicion.fechaStr }}
                                                </span>
                                            </div>
                                        </template>
                                        
                                        <template v-else>
                                            <div class="flex-1 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg"
                                            >
                                                {{ datosResumenPresion.tieneDatos ? 'Se necesitan 2+ mediciones' : 'Sin datos registrados' }}
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pt-6 border-t border-slate-200"
                            >
                                <div class="flex items-center justify-between"
                                >
                                    <div class="flex items-center gap-3"
                                    >
                                        <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"
                                        >
                                            <iconify-icon icon="lucide:trending-up" class="text-lg text-emerald-600"
                                            ></iconify-icon>
                                        </div>
                                        
                                        <div>
                                            <p class="font-bold text-slate-900 text-sm">Buen progreso</p>
                                            
                                            <p class="text-xs text-secondary font-medium">Tus métricas están estables</p>
                                        </div>
                                    </div>
                                    
                                    <span class="font-mono text-xl font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"
                                    >
                                        +12%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Carousel de Banners (al final de la página) -->
                <section 
                    v-if="bannersFiltrados.length > 0" 
                    class="fade-in stagger-2 mt-16 pt-8 border-t border-slate-200"
                >
                    <BannerCarousel :banners="bannersFiltrados" :autoplay="true" :interval="6000" />
                </section>
            </div>
        </div>
    </div>

    <!-- Sheet para Nueva Medicion -->
    <NuevaMedicionSheet v-model:open="nuevaMedicionAbierta" />
</template>

<style scoped>
/* Cabinet Grotesk - Fuente principal */
.font-display { font-family: 'Cabinet Grotesk', sans-serif; }
.font-body { font-family: 'Cabinet Grotesk', sans-serif; }
.font-label { font-family: 'Cabinet Grotesk', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.chart-line {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine 2.5s ease-out forwards;
}

@keyframes drawLine {
    to { stroke-dashoffset: 0; }
}

.fade-in {
    animation: fadeIn 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(10px);
}

@keyframes fadeIn {
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
}

.stagger-1 { animation-delay: 0.15s; }
.stagger-2 { animation-delay: 0.3s; }
</style>

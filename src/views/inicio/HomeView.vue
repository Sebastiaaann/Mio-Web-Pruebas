<script setup lang="ts">
import { ref, computed, onMounted, watch, type Ref } from 'vue';
import { useUserStore } from '@/stores/tiendaUsuario';
import { useHealthStore } from '@/stores/tiendaSalud';
import { useTiendaCampanas } from '@/stores/tiendaCampanas';
import { useTiendaServicios } from '@/stores/tiendaServicios';
import { useConfigStore } from '@/stores/tiendaConfig';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { Bot } from 'lucide-vue-next';
import { pacienteService } from '@/services/pacienteService';
import type { Control, Medicion, Campana, EstadoControl, EstadoMedicion, TipoMedicion } from '@/types/salud';
import { useSaludo } from '@/composables/useSaludo';
import { useFormatoFecha, formatDateFriendly } from '@/composables/useFormatoFecha';
import { useMediciones, type MedicionDisplay, type Tendencia, type DatosResumen } from '@/composables/useMediciones';
import { useUserInitials } from '@/composables/useUserInitials';
import { useBannersFiltrados } from '@/composables/useBannersFiltrados';
import BannerCarousel from '@/components/ui/BannerCarousel.vue';
import MaterialAudiovisualCarousel from '@/components/ui/MaterialAudiovisualCarousel.vue';
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

// Saludo dinámico (usando composable)
// const { saludo } = useSaludo(); // Ya declarado arriba

// Iniciales del usuario
const { iniciales: userInitials } = useUserInitials(firstName, nombreCompleto);

// Eventos (Controles Pendientes)
const proximosEventos = computed<EventoProximo[]>(() => {
    const list = controlesProximos.value.filter(c => c.estado === 'pendiente').slice(0, 3);
    
    if (list.length === 0) {
        return [
           { 
             day: 15, month: 'ENE', title: 'Consulta General', subtitle: 'Hospital Central • 10:00 AM', 
             colorClass: 'text-primary', bgClass: 'bg-primary/10', status: 'Confirmada', statusClass: 'bg-primary/10 text-primary' 
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
            colorClass: 'text-primary',
            bgClass: 'bg-primary/10',
            status: 'Pendiente',
            statusClass: 'bg-gray-bg text-gray-text-light'
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

  const opciones = materialService?.options || materialService?.items || materialService?.items;

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

  return opcionesPlan
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
    .map((option: any, index: number) => ({
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
    const plansResponse = await pacienteService.obtenerPlanes(patientId)
    if (!plansResponse.success || !plansResponse.data?.plans) return

    const planMutual = plansResponse.data.plans.find(plan =>
      (plan.name_plan || '').toLowerCase().includes('mutual')
    )

    configStore.setLogoMutual(planMutual?.config?.logo || null)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error al cargar logo Mutual:', error)
    }
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
    <!-- Root Container: Adjusted for use inside Global Layout (no sidebar, full height handled by layout) -->
    <div class="h-full flex flex-col bg-gray-bg text-gray-text font-body">
        
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md border-b border-gray-border px-6 md:px-8 py-3 md:py-4 sticky top-0 z-20 transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="font-display font-bold text-2xl text-gray-text">{{ saludo }}, {{ firstName || 'Usuario' }}</h1>
                    <p class="text-gray-text-light text-sm mt-1 font-medium">Aquí está el resumen de tu salud hoy</p>
                </div>
                <div class="flex items-center gap-4">
                    <img
                        v-if="logoMutualHeader"
                        :src="logoMutualHeader"
                        alt="Logo Mutual"
                        class="h-7 w-auto object-contain"
                    />
                    <button class="relative p-2 text-gray-text hover:bg-gray-bg rounded-xl transition-all group">
                        <iconify-icon icon="lucide:bell" class="text-xl group-hover:text-primary transition-colors"></iconify-icon>
                        <span v-if="hasNotifications" class="absolute top-1 right-1 w-2.5 h-2.5 bg-alert-red rounded-full border-2 border-white"></span>
                    </button>
                    
                    <!-- Separador -->
                    <div class="w-px h-6 bg-gray-300"></div>
                    
                    <!-- Avatar Chatbot -->
                    <Sheet v-model:open="chatbotAbierto">
                        <SheetTrigger as-child>
                            <button class="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-110 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center group">
                                <Bot class="w-5 h-5 text-white" />
                                <!-- Indicador online -->
                                <span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                            </button>
                        </SheetTrigger>
                        
                        <SheetContent side="right" class="w-full sm:w-[450px] p-0 flex flex-col">
                            <SheetHeader class="px-4 py-3 border-b border-gray-border shrink-0">
                                <SheetTitle class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                                        <Bot class="w-5 h-5 text-white" />
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-base font-semibold text-gray-text">Asistente Virtual</span>
                                        <div class="flex items-center gap-1.5">
                                            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            <span class="text-xs text-green-600 font-medium">En línea</span>
                                        </div>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            
                            <!-- ChatView integrado -->
                            <div class="flex-1 overflow-hidden">
                                <ChatView :show-header="false" />
                            </div>
                        </SheetContent>
                    </Sheet>
                    
                    <!-- Separador -->
                    <div class="w-px h-6 bg-gray-300"></div>
                    
                    <!-- Avatar de Perfil -->
                    <div class="relative flex-shrink-0 cursor-pointer" @click="$router.push('/perfil')">
                        <div class="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 border-2 border-gray-200 flex items-center justify-center hover:border-violet-300 transition-all duration-200">
                            <span class="text-sm font-semibold text-violet-600">{{ userInitials }}</span>
                        </div>
                        <!-- Indicador Online -->
                        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <div class="flex-1 overflow-auto p-8 space-y-8 scroll-smooth">
            <div class="max-w-7xl mx-auto space-y-8">
                
                <!-- Campañas de Salud -->
                <section class="fade-in">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="font-display font-bold text-xl text-plan flex items-center gap-2">
                            Campañas de Salud
                            <span v-if="!campanasStore.cargando" class="px-2 py-0.5 bg-plan-primary/10 text-plan-primary text-xs rounded-full font-bold font-mono">{{ campanas.length }}</span>
                        </h2>
                        <button 
                            v-if="campanas.length > 0" 
                            @click="$router.push('/campanas-anteriores')"
                            class="text-plan-primary font-bold text-sm hover:underline flex items-center gap-1"
                        >
                            Ver campañas anteriores
                            <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
                        </button>
                    </div>
                    
                    <!-- Estado de carga -->
                    <div v-if="campanasStore.cargando" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border animate-pulse">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                            <div class="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div class="h-4 bg-gray-200 rounded mb-6 w-full"></div>
                            <div class="h-10 bg-gray-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                    
                    <!-- Estado de error -->
                    <div v-else-if="campanasStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <iconify-icon icon="lucide:alert-circle" class="text-4xl text-red-500 mx-auto mb-4"></iconify-icon>
                        <h3 class="font-display font-bold text-lg text-red-700 mb-2">Error al cargar campañas</h3>
                        <p class="text-red-600 text-sm mb-4">{{ campanasStore.error }}</p>
                        <button @click="campanasStore.cargarCampanas()" class="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all">
                            Reintentar
                        </button>
                    </div>
                    
                    <!-- Estado vacío -->
                    <div v-else-if="campanas.length === 0" class="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                        <iconify-icon icon="lucide:heart" class="text-4xl text-gray-400 mx-auto mb-4"></iconify-icon>
                        <h3 class="font-display font-bold text-lg text-gray-600 mb-2">No hay campañas activas</h3>
                        <p class="text-gray-500 text-sm">Actualmente no tienes campañas de salud asignadas.</p>
                    </div>
                    
                    <!-- Lista de campañas -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="campana in campanas.slice(0, 3)" :key="campana.id"
                             class="bg-white rounded-2xl p-5 shadow-sm border border-gray-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                            <!-- Hover Effect -->
                            <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <!-- Badge Activa/Inactiva -->
                            <div class="absolute top-3 right-3 z-10">
                                <span v-if="campana.activa" class="px-2.5 py-0.5 bg-health-green/10 text-health-green text-xs font-label font-bold rounded-full">Activa</span>
                                <span v-else class="px-2.5 py-0.5 bg-gray-200 text-gray-500 text-xs font-label font-bold rounded-full">Inactiva</span>
                            </div>
                            
                            <!-- Imagen principal grande -->
                            <div class="w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-50 flex items-center justify-center">
                                <img 
                                    v-if="campana.imagenUrl || campana.logo" 
                                    :src="campana.imagenUrl || (campana.logo?.startsWith('data:') ? campana.logo : `data:image/png;base64,${campana.logo}`)" 
                                    width="160"
                                    height="100"
                                    class="max-w-[160px] max-h-[100px] w-auto h-auto object-contain" 
                                    alt="Icono" 
                                />
                                <iconify-icon v-else icon="lucide:heart" class="text-5xl text-primary"></iconify-icon>
                            </div>
                            
                            <h3 class="font-display font-bold text-base text-gray-text mb-4 group-hover:text-primary transition-colors line-clamp-1">{{ campana.nombre }}</h3>
                            <a :href="campana.url || '#'" target="_blank" rel="noopener noreferrer" 
                               class="block w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:translate-y-[-2px] text-center text-sm">
                                Comenzar ahora
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Mediciones Recientes -->
                <section class="fade-in stagger-1">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="font-display font-bold text-xl text-gray-text">Mis Mediciones Recientes</h2>
                        <button @click="nuevaMedicionAbierta = true" class="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20 hover:translate-y-[-2px]">
                            <iconify-icon icon="lucide:plus" class="text-lg"></iconify-icon>
                            <span>Nueva Medición</span>
                        </button>
                    </div>
                    
                    <!-- Estado de carga - Skeleton -->
                    <div v-if="cargandoMediciones" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div v-for="n in 4" :key="n" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border animate-pulse">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div class="w-16 h-5 bg-gray-200 rounded-full"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                            <div class="h-8 bg-gray-200 rounded mb-3 w-1/2"></div>
                            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                    
                    <!-- Lista de mediciones -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div v-for="item in medicionesDisplay" :key="item.key" 
                             class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border hover:border-gray-300 transition-all hover:translate-y-[-4px]">
                            <div class="flex items-center justify-between mb-4">
                                <div :class="`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`">
                                    <iconify-icon :icon="`lucide:${item.icon}`" :class="`text-lg ${item.color}`"></iconify-icon>
                                </div>
                                <span :class="`px-2 py-1 text-xs font-label font-bold rounded-full ${item.statusClass}`">
                                    {{ item.status }}
                                </span>
                            </div>
                            <p class="text-gray-text-light text-sm font-label font-medium mb-1 tracking-wide">{{ item.title }}</p>
                            <div class="flex items-baseline gap-2">
                                <p class="font-mono text-3xl font-bold text-gray-text tracking-tight">{{ item.value }}</p>
                                <!-- Indicador de tendencia -->
                                <div v-if="item.tendencia && item.tendencia.direccion !== 'stable'" class="flex items-center gap-1">
                                    <iconify-icon 
                                        :icon="item.tendencia.direccion === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'"
                                        :class="`text-sm ${item.tendencia.direccion === 'up' ? 'text-red-500' : 'text-green-500'}`"
                                    ></iconify-icon>
                                    <span :class="`text-xs font-medium ${item.tendencia.direccion === 'up' ? 'text-red-500' : 'text-green-500'}`">
                                        {{ Math.abs(item.tendencia.porcentaje ?? 0).toFixed(1) }}%
                                    </span>
                                </div>
                                <div v-else-if="item.tendencia && item.tendencia.direccion === 'stable'" class="flex items-center gap-1">
                                    <iconify-icon icon="lucide:minus" class="text-sm text-gray-400"></iconify-icon>
                                    <span class="text-xs font-medium text-gray-400">Estable</span>
                                </div>
                            </div>
                            <p class="text-xs text-gray-text-light mt-3 flex items-center gap-1 font-medium">
                                <iconify-icon icon="lucide:clock" class="text-xs"></iconify-icon>
                                {{ item.unit }} • {{ item.date }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Eventos y Resumen -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in stagger-2">
                    <!-- Material Audiovisual -->
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="font-display font-bold text-xl text-gray-text">Material Audiovisual</h2>
                            <router-link to="/recursos" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                                Ver todos
                                <iconify-icon icon="lucide:arrow-right" class="text-base"></iconify-icon>
                            </router-link>
                        </div>
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-border p-6 h-full">
                            <MaterialAudiovisualCarousel :items="materialAudiovisualItems" />
                        </div>
                    </section>

                    <!-- Resumen -->
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="font-display font-bold text-xl text-gray-text">Resumen Semanal</h2>
                            <select class="px-3 py-2 bg-white border border-gray-border rounded-lg text-sm text-gray-text font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                                <option>Esta semana</option>
                                <option>Semana pasada</option>
                            </select>
                        </div>
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-border p-6 h-full flex flex-col justify-between">
                            <div class="grid grid-cols-2 gap-6 mb-6">
                                <!-- Gráfico de Peso -->
                                <div>
                                    <p class="text-gray-text-light text-sm font-label font-medium mb-2 uppercase tracking-wide">Control de Peso</p>
                                    <p v-if="datosResumenPeso.tieneDatos" class="font-mono text-2xl font-bold text-gray-text">
                                        {{ datosResumenPeso.promedio }} <span class="text-sm text-purple-500 font-sans font-bold">kg</span>
                                    </p>
                                    <p v-else class="font-mono text-2xl font-bold text-gray-text">-- <span class="text-sm text-gray-400 font-sans font-bold">kg</span></p>
                                    <div class="mt-4 h-16 flex items-end gap-1">
                                        <template v-if="datosResumenPeso.tieneDatos">
                                            <div v-for="(medicion, idx) in datosResumenPeso.mediciones" :key="idx"
                                                 class="flex-1 bg-purple-500 rounded-t-sm hover:opacity-100 transition-all cursor-pointer relative group"
                                                 :style="`height: ${medicion.altura}%`"
                                                 :class="idx === datosResumenPeso.mediciones.length - 1 ? 'opacity-100 shadow-lg shadow-purple-500/30' : 'opacity-60'">
                                                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {{ medicion.valor }} kg
                                                </div>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                Sin datos
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <!-- Gráfico de Presión -->
                                <div>
                                    <p class="text-gray-text-light text-sm font-label font-medium mb-2 uppercase tracking-wide">Presión Arterial</p>
                                    <p v-if="datosResumenPresion.tieneDatos" class="font-mono text-2xl font-bold text-gray-text">
                                        {{ datosResumenPresion.promedio }} <span class="text-sm text-alert-red font-sans font-bold">mmHg</span>
                                    </p>
                                    <p v-else class="font-mono text-2xl font-bold text-gray-text">-- <span class="text-sm text-gray-400 font-sans font-bold">mmHg</span></p>
                                    <div class="mt-4 h-16 relative flex items-end">
                                        <template v-if="datosResumenPresion.tieneDatos && datosResumenPresion.mediciones.length >= 2">
                                            <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="lineGradPresion" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stop-color="#EF4444" stop-opacity="0.5"/>
                                                        <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
                                                    </linearGradient>
                                                </defs>
                                                <path :d="generarPathPresion(datosResumenPresion.mediciones)" 
                                                      fill="none" 
                                                      stroke="#EF4444" 
                                                      stroke-width="3" 
                                                      stroke-linecap="round" 
                                                      stroke-linejoin="round" 
                                                      class="chart-line drop-shadow-md"/>
                                                <circle :cx="100" :cy="generarYUltimoPunto(datosResumenPresion.mediciones)" r="3" fill="#EF4444" class="shadow-sm" />
                                            </svg>
                                        </template>
                                        <template v-else>
                                            <div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                Sin datos suficientes
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            <div class="pt-6 border-t border-gray-border">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-health-green/10 rounded-lg flex items-center justify-center">
                                            <iconify-icon icon="lucide:trending-up" class="text-lg text-health-green"></iconify-icon>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-text text-sm">Buen progreso</p>
                                            <p class="text-xs text-gray-text-light font-medium">Tus métricas están estables</p>
                                        </div>
                                    </div>
                                    <span class="font-mono text-xl font-bold text-health-green bg-health-green/5 px-2 py-1 rounded-lg">+12%</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Carousel de Banners (al final de la página) -->
                <section v-if="bannersFiltrados.length > 0" class="fade-in stagger-2 mt-16 pt-8 border-t border-gray-border">
                    <BannerCarousel :banners="bannersFiltrados" :autoplay="true" :interval="6000" />
                </section>
            </div>
        </div>
    </div>

    <!-- Sheet para Nueva Medicion -->
    <NuevaMedicionSheet v-model:open="nuevaMedicionAbierta" />
</template>

<style scoped>
.font-display { font-family: 'Cabinet Grotesk', sans-serif; }
.font-body { font-family: 'Satoshi', sans-serif; }
.font-label { font-family: 'Space Grotesk', sans-serif; }
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

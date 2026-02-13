<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick, computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/tiendaUsuario";
import { useHealthStore } from "@/stores/tiendaSalud";
import { useRouter, useRoute } from "vue-router";
import { useConfigStore } from '@/stores/tiendaConfig'
import { 
    Heart, 
    Droplet, 
    Scale, 
    Activity,
    Loader2,
    TrendingDown,
    TrendingUp,
    Minus,
    Calendar,
    Download,
    MoreVertical
} from 'lucide-vue-next';
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";
import HealthMetricCard from "@/components/mi-salud/HealthMetricCard.vue";
import ActividadReciente from "@/components/mi-salud/ActividadReciente.vue";
import NormalRangesCard from "@/components/mi-salud/NormalRangesCard.vue";

import SkeletonCard from "@/components/ui/SkeletonCard.vue";
import SkeletonTable from "@/components/ui/SkeletonTable.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import { useErrorHandler } from "@/composables/useErrorHandler";

// Composables
import { useChartData } from '@/composables/useChartData'
import { useMetricasSalud } from '@/composables/useMetricasSalud'
import { useFiltrosMediciones } from '@/composables/useFiltrosMediciones'

// Tipos
import type { TipoMedicion, Medicion, HistorialMediciones } from '@/types/salud'
import type { RangoFechas } from '@/types/miSalud'

const userStore = useUserStore();
const healthStore = useHealthStore();
const configStore = useConfigStore();
const router = useRouter();
const route = useRoute();
const { firstName, nombreCompleto, usuario } = storeToRefs(userStore);
// Aliases para compatibilidad con uso existente
const fullName = nombreCompleto;
const user = usuario;
const { historialMediciones, controlesProximos, ultimaMedicion } = storeToRefs(healthStore);

const logoMutualHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})

// Estado de carga
const estaCargando = ref(true);

// Manejo de errores
const { error, errorMessage, hasError, execute, clearError, retry } = useErrorHandler();

// Tipar variables
const tipoSeleccionado = ref<TipoMedicion>('presion')
const rangoSeleccionado = ref<RangoFechas>('mes')

// Función para cargar datos reales de la API
const cargarDatos = async () => {
    await execute(async () => {
        estaCargando.value = true;
        console.log('🔄 MiSaludView: Iniciando carga de datos...');
        
        // Asegurar que el usuario esté autenticado
        if (!userStore.estaAutenticado) {
            console.warn('⚠️ MiSaludView: Usuario no autenticado, redirigiendo...');
            router.push('/');
            return;
        }
        
        console.log('✅ MiSaludView: Usuario autenticado, cargando datos de salud...');
        
        // Cargar datos reales desde la API
        await healthStore.fetchAllHealthData();
        
        console.log('✅ MiSaludView: Datos cargados exitosamente');
        console.log('📊 Controles próximos:', controlesProximos.value.length);
        console.log('📈 Historial mediciones:', Object.keys(historialMediciones.value).length);
        console.log('🩺 Última medición:', ultimaMedicion.value);
        
        // Esperar a que Vue actualice el DOM
        await nextTick();
    }, {
        retry: 2,
        retryDelay: 1000,
        logError: true
    }).finally(() => {
        estaCargando.value = false;
    });
};

// Watcher para detectar cuando se navega a esta ruta
watch(() => route.name, (newName) => {
    if (newName === 'dashboard-preventive') {
        console.log('Navegación detectada a dashboard-preventive, cargando datos...');
        cargarDatos();
    }
}, { immediate: false });

// Computed properties para encontrar controles específicos
const controlPresion = computed(() => controlesProximos.value.find(c => c.nombre.toUpperCase().includes('PRESIÓN') || c.nombre.toUpperCase().includes('PRESION')));
const controlPeso = computed(() => controlesProximos.value.find(c => c.nombre.toUpperCase().includes('PESO')));
const controlGlucosa = computed(() => controlesProximos.value.find(c => c.nombre.toUpperCase().includes('GLICEMIA') || c.nombre.toUpperCase().includes('GLUCOSA')));

// Composables - useChartData ahora acepta el historial completo y filtra internamente
const { 
  metricasPresion, 
  metricasGlicemia, 
  metricasPeso,
  getEstadoTexto,
  getEstadoClase,
  getEstadoDot,
  getEstadoTipo
} = useMetricasSalud(historialMediciones as any)

const {
  filtroTipo,
  filtroFechaDesde,
  filtroFechaHasta,
  rangoFechas,
  medicionesFiltradas,
  resetearFiltros,
  aplicarRangoFechas
} = useFiltrosMediciones(historialMediciones as any)

// Para gráficos individuales - useChartData filtra internamente por tipo
const { datosGrafico: datosPresion, estadisticas: statsPresion } = useChartData(
  historialMediciones, 
  'presion'
)
const { datosGrafico: datosGlicemia, estadisticas: statsGlicemia } = useChartData(
  historialMediciones, 
  'glucosa'
)
const { datosGrafico: datosPeso, estadisticas: statsPeso } = useChartData(
  historialMediciones, 
  'peso'
)

// Datos reales de mediciones desde la API - usando composable
const medicionesReales = computed(() => {
    const mediciones: any[] = [];
    
    Object.entries(historialMediciones.value).forEach(([protocolId, obs]) => {
        const protocolo = controlesProximos.value.find(p => p.id === protocolId);
        if (!protocolo || !Array.isArray(obs)) return;
        
        // Agrupar por fecha (local)
        const gruposPorFecha: Record<string, any[]> = {};
        obs.forEach(m => {
            const fechaObj = new Date(m.fecha);
            const fechaKey = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;
            if (!gruposPorFecha[fechaKey]) gruposPorFecha[fechaKey] = [];
            gruposPorFecha[fechaKey].push(m);
        });
        
        Object.entries(gruposPorFecha).forEach(([fechaKey, meds]) => {
            const ordenadas = [...meds].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            const m = ordenadas.find((x: any) => x.valor !== 'N/A') || ordenadas[0];
            const fechaObj = new Date(m.fecha);
            const timestamp = fechaObj.getTime();
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            mediciones.push({
                id: `${protocolId}-${timestamp}`,
                date: `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}, ${fechaObj.getFullYear()}`,
                dateISO: fechaKey,
                timestamp: timestamp,
                time: fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + ' hrs',
                type: protocolo.nombre,
                value: m.valor,
                unit: m.unidad,
                status: getEstadoTexto(m.estado),
                statusBadges: getEstadoClase(m.estado),
                statusDot: getEstadoDot(m.estado),
                icon: getIconoPorTipo(protocolo.nombre),
                iconColor: getIconColorPorTipo(protocolo.nombre)
            });
        });
    });
    
    // Ordenar por timestamp descendente (más reciente primero)
    return mediciones.sort((a, b) => b.timestamp - a.timestamp);
});

// Helpers para iconos
function getIconoPorTipo(nombre: string): string {
    const normalizedName = nombre?.toUpperCase() || '';
    if (normalizedName.includes('PRESIÓN') || normalizedName.includes('PRESION')) {
        return 'lucide:heart';
    }
    if (normalizedName.includes('PESO')) {
        return 'lucide:scale';
    }
    if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
        return 'lucide:droplet';
    }
    return 'lucide:activity';
}

function getIconColorPorTipo(nombre: string): string {
    const normalizedName = nombre?.toUpperCase() || '';
    if (normalizedName.includes('PRESIÓN') || normalizedName.includes('PRESION')) {
        return 'text-red-500';
    }
    if (normalizedName.includes('PESO')) {
        return 'text-orange-500';
    }
    if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
        return 'text-blue-500';
    }
    return 'text-purple-600';
}

onMounted(async () => {
    console.log('MiSaludView montado - iniciando carga de datos');
    await cargarDatos();
});

onBeforeUnmount(() => {
    console.log('MiSaludView desmontado');
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans" style="font-family: 'Cabinet Grotesk', sans-serif;">
    
    <!-- Estado de Error -->
    <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-h3 text-slate-900 mb-2">Error al cargar datos</h3>
        <p class="text-plan-alt mb-6">{{ errorMessage }}</p>
        <div class="flex gap-3 justify-center">
          <button 
            @click="clearError"
            class="px-4 py-2 text-plan-alt hover:text-plan font-medium transition-colors"
          >
            Cerrar
          </button>
          <button 
            @click="retry"
            class="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Loader2 v-if="estaCargando" class="w-4 h-4 animate-spin" />
            <span v-else>Reintentar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Indicador de carga con skeletons -->
    <div v-else-if="estaCargando" class="min-h-screen bg-gray-50 p-4 sm:p-8">
      <!-- Header skeleton -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 animate-pulse">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-8 w-32 bg-gray-200 rounded"></div>
            <div class="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Skeletons de tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SkeletonCard v-for="i in 3" :key="`skeleton-card-${i}`" :show-chart="true" />
      </div>

      <!-- Skeleton de tabla -->
      <SkeletonTable :rows="5" />
    </div>

    <!-- Contenido principal -->
    <template v-else>
    <!-- Header Completo -->
     <HeaderCompleto
        titulo="Mi Salud"
        :subtitulo="`Monitoreo y seguimiento de tus métricas • ${controlesProximos.length} protocolos activos`"
        :mostrar-saludo="false"
        :show-notification-badge="true"
        notification-badge-color="#10B981"
        @click-notification="console.log('Notificaciones clicked')"
        @click-profile="console.log('Perfil clicked')"
    />

    <!-- Content Area -->
    <div class="p-4 sm:p-8 space-y-6">
        <!-- Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="flex border-b border-gray-200 overflow-x-auto">
                <button :style="{ backgroundColor: 'var(--theme-primary)' }" class="text-white px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap">
                    <Activity class="w-4 h-4" />
                    Mediciones
                </button>
                <button class="px-6 py-4 text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <TrendingUp class="w-4 h-4" />
                    Análisis
                </button>
                <button class="px-6 py-4 text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <Calendar class="w-4 h-4" />
                    Medicamentos
                </button>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Date Filters -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-plan-alt font-label">Período:</span>
                </div>
                <div class="flex gap-2">
                    <button 
                        v-for="rango in ['semana', 'mes', 'trimestre']" 
                        :key="rango"
                        @click="aplicarRangoFechas(rango as RangoFechas)"
                        :class="{ 
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors': true,
                            'text-white shadow-sm': rangoFechas === rango,
                            'bg-slate-100 text-slate-600 hover:bg-slate-200': rangoFechas !== rango
                        }"
                        :style="rangoFechas === rango ? { backgroundColor: 'var(--theme-primary)' } : {}"
                    >
                        {{ rango === 'semana' ? '7 días' : rango === 'mes' ? '30 días' : '90 días' }}
                    </button>
                </div>
            </div>

            <!-- Charts Grid - Solo 3 controles -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Presión Arterial -->
                <HealthMetricCard
                    title="Presión Arterial"
                    unit="mmHg"
                    :status="getEstadoTexto(metricasPresion.tieneDatos ? 'normal' : 'na')"
                    :status-type="getEstadoTipo(metricasPresion.tieneDatos ? 'normal' : 'na')"
                    :value="metricasPresion.ultimoValor ? String(metricasPresion.ultimoValor) : '--'"
                    subtitle="última medición"
                    :trend="statsPresion?.cambioPorcentaje != null ? (statsPresion.cambioPorcentaje > 0 ? '+' : '') + statsPresion.cambioPorcentaje.toFixed(1) + '%' : 'Sin datos'"
                    icon="lucide:heart"
                    icon-color="text-red-600"
                    icon-bg="bg-red-50"
                    :chart-data="datosPresion"
                />
                
                <!-- Glicemia -->
                 <HealthMetricCard
                    title="Glicemia"
                    unit="mg/dL"
                    :status="getEstadoTexto(metricasGlicemia.tieneDatos ? 'normal' : 'na')"
                    :status-type="getEstadoTipo(metricasGlicemia.tieneDatos ? 'normal' : 'na')"
                    :value="metricasGlicemia.ultimoValor ? String(metricasGlicemia.ultimoValor) : '--'"
                    subtitle="última medición"
                    :trend="statsGlicemia?.cambioPorcentaje != null ? (statsGlicemia.cambioPorcentaje > 0 ? '+' : '') + statsGlicemia.cambioPorcentaje.toFixed(1) + '%' : 'Sin datos'"
                    icon="lucide:droplet"
                    icon-color="text-blue-500"
                    icon-bg="bg-blue-50"
                    :chart-data="datosGlicemia"
                />
                
                <!-- Control Peso -->
                 <HealthMetricCard
                    title="Peso"
                    unit="kg"
                    :status="getEstadoTexto(metricasPeso.tieneDatos ? 'normal' : 'na')"
                    :status-type="getEstadoTipo(metricasPeso.tieneDatos ? 'normal' : 'na')"
                    :value="metricasPeso.ultimoValor ? String(metricasPeso.ultimoValor) : '--'"
                    subtitle="última medición"
                    :trend="statsPeso?.cambioPorcentaje != null ? (statsPeso.cambioPorcentaje > 0 ? '+' : '') + statsPeso.cambioPorcentaje.toFixed(1) + '%' : 'Sin datos'"
                    icon="lucide:scale"
                    icon-color="text-orange-500"
                    icon-bg="bg-orange-50"
                    :chart-data="datosPeso"
                />
            </div>

                <!-- Actividad Reciente - Solo últimas 4 controles -->
                <ActividadReciente 
                  v-if="medicionesReales.length > 0" 
                  :measurements="medicionesReales" 
                  :max-items="4"
                />
            
            <!-- Empty state si no hay mediciones -->
            <EmptyState
              v-else
              icon="lucide:activity"
              title="Sin mediciones registradas"
              description="Aún no tienes mediciones en tu historial. Comienza registrando tu primera medición."
              action-text="Registrar Medición"
              :show-action="true"
              @action="$router.push('/nueva-medicion/tipo')"
            />
            
            <!-- Rangos Normales -->
            <NormalRangesCard />
        </div>
    </div>

    <!-- FAB used in HTML reference -->
    <router-link 
        to="/nueva-medicion/tipo"
        :style="{ backgroundColor: 'var(--theme-primary)' }"
        class="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 hover:opacity-90 transition-all duration-200 z-30"
    >
        <span class="text-3xl font-light">+</span>
    </router-link>
    </template>
  </div>
</template>

<style scoped>
.font-display {
    font-family: 'Cabinet Grotesk', sans-serif;
}
.font-body {
    font-family: 'Cabinet Grotesk', sans-serif;
}
.font-label {
    font-family: 'Cabinet Grotesk', sans-serif;
}
</style>

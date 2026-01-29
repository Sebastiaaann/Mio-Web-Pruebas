<script setup>
import { onMounted, onBeforeUnmount, nextTick, computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/tiendaUsuario";
import { useHealthStore } from "@/stores/tiendaSalud";
import { useRouter, useRoute } from "vue-router";
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
  Bell,
  Download,
  MoreVertical
} from 'lucide-vue-next';
import HealthMetricCard from "@/components/mi-salud/HealthMetricCard.vue";
import MeasurementHistoryTable from "@/components/mi-salud/MeasurementHistoryTable.vue";
import NormalRangesCard from "@/components/mi-salud/NormalRangesCard.vue";
import UpcomingControlsCard from "@/components/mi-salud/UpcomingControlsCard.vue";

const userStore = useUserStore();
const healthStore = useHealthStore();
const router = useRouter();
const route = useRoute();
const { firstName, fullName, user } = storeToRefs(userStore);
const { historialMediciones, controlesProximos, ultimaMedicion } = storeToRefs(healthStore);

// Estado de carga
const estaCargando = ref(true);

// Función para cargar datos reales de la API
const cargarDatos = async () => {
    try {
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
        
    } catch (error) {
        console.error('❌ MiSaludView: Error al cargar datos de salud:', error);
    } finally {
        estaCargando.value = false;
    }
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

// Datos reales de mediciones desde la API
const medicionesReales = computed(() => {
    const mediciones = [];
    
    Object.entries(historialMediciones.value).forEach(([protocolId, obs]) => {
        const protocolo = controlesProximos.value.find(p => p.id === protocolId);
        if (!protocolo || !Array.isArray(obs)) return;
        
        // Agrupar por fecha
        const gruposPorFecha = {};
        obs.forEach(m => {
            const fecha = new Date(m.fecha).toISOString().split('T')[0];
            if (!gruposPorFecha[fecha]) gruposPorFecha[fecha] = [];
            gruposPorFecha[fecha].push(m);
        });
        
        Object.entries(gruposPorFecha).forEach(([fecha, meds]) => {
            const m = meds.find(x => x.valor !== 'N/A') || meds[0];
            const fechaObj = new Date(fecha);
            
            mediciones.push({
                date: `${fechaObj.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][fechaObj.getMonth()]}, ${fechaObj.getFullYear()}`,
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
    
    // Ordenar por fecha descendente
    return mediciones.sort((a, b) => {
        const fechaA = new Date(a.date.split(', ').reverse().join('-'));
        const fechaB = new Date(b.date.split(', ').reverse().join('-'));
        return fechaB - fechaA;
    }).slice(0, 10); // Mostrar últimas 10
});

// Helpers para formateo
function getEstadoTexto(estado) {
    const estados = {
        'normal': 'Normal',
        'green': 'Normal',
        'success': 'Normal',
        'warning': 'Observación',
        'orange': 'Observación',
        'alerta': 'Observación',
        'red': 'Revisar',
        'critico': 'Revisar',
        'danger': 'Revisar',
        'none': 'Pendiente',
        'na': 'Sin evaluación'
    };
    return estados[estado] || 'Normal';
}

function getEstadoClase(estado) {
    const clases = {
        'normal': 'bg-emerald-50 text-emerald-500',
        'green': 'bg-emerald-50 text-emerald-500',
        'success': 'bg-emerald-50 text-emerald-500',
        'warning': 'bg-amber-50 text-amber-500',
        'orange': 'bg-amber-50 text-amber-500',
        'alerta': 'bg-amber-50 text-amber-500',
        'red': 'bg-red-50 text-red-500',
        'critico': 'bg-red-50 text-red-500',
        'danger': 'bg-red-50 text-red-500',
        'none': 'bg-gray-50 text-gray-500',
        'na': 'bg-gray-50 text-gray-500'
    };
    return clases[estado] || 'bg-emerald-50 text-emerald-500';
}

function getEstadoDot(estado) {
    const dots = {
        'normal': 'bg-emerald-500',
        'green': 'bg-emerald-500',
        'success': 'bg-emerald-500',
        'warning': 'bg-amber-500',
        'orange': 'bg-amber-500',
        'alerta': 'bg-amber-500',
        'red': 'bg-red-500',
        'critico': 'bg-red-500',
        'danger': 'bg-red-500',
        'none': 'bg-gray-400',
        'na': 'bg-gray-400'
    };
    return dots[estado] || 'bg-emerald-500';
}

function getIconoPorTipo(nombre) {
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

function getIconColorPorTipo(nombre) {
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

// Datos para las tarjetas de métricas basados en datos reales
const metricaPresion = computed(() => {
    const protocolId = controlPresion.value?.id;
    const historial = historialMediciones.value[protocolId] || [];
    
    // Buscar la última observación con valor de presión válido (formato "sistolica/diastolica")
    // Filtrar primero los que tienen valores válidos (no "N/A")
    const presionesValidas = historial.filter(h => {
        if (!h.valor || h.valor === 'N/A') return false;
        const val = String(h.valor);
        // Verificar que tenga formato "numero/numero"
        const partes = val.split('/');
        if (partes.length !== 2) return false;
        const sistolica = parseFloat(partes[0]);
        const diastolica = parseFloat(partes[1]);
        return !isNaN(sistolica) && !isNaN(diastolica) && sistolica > 0 && diastolica > 0;
    });
    
    // Tomar la última presión válida
    const ultima = presionesValidas[presionesValidas.length - 1];
    
    if (ultima) {
        return {
            value: ultima.valor,
            status: getEstadoTexto(ultima.estado),
            statusColor: getEstadoClase(ultima.estado)
        };
    }
    
    return { value: 'N/A', status: 'Sin datos', statusColor: 'bg-gray-50 text-gray-500' };
});

const metricaGlicemia = computed(() => {
    const protocolId = controlGlucosa.value?.id;
    const historial = historialMediciones.value[protocolId] || [];
    
    // Buscar la última observación con valor numérico de glucosa
    const ultima = historial.find(h => {
        if (!h.valor) return false;
        const val = parseFloat(h.valor);
        return !isNaN(val) && val > 0 && !String(h.valor).includes('/');
    });
    
    if (ultima) {
        return {
            value: parseFloat(ultima.valor).toFixed(1),
            status: getEstadoTexto(ultima.estado),
            statusColor: getEstadoClase(ultima.estado)
        };
    }
    
    return { value: 'N/A', status: 'Sin datos', statusColor: 'bg-gray-50 text-gray-500' };
});

const metricaPeso = computed(() => {
    const protocolId = controlPeso.value?.id;
    const historial = historialMediciones.value[protocolId] || [];
    
    // Buscar la última observación con valor numérico de peso
    const ultima = historial.find(h => {
        if (!h.valor) return false;
        const val = parseFloat(h.valor);
        return !isNaN(val) && val > 0 && val < 500; // Peso razonable
    });
    
    if (ultima) {
        return {
            value: parseFloat(ultima.valor).toFixed(1),
            status: getEstadoTexto(ultima.estado),
            statusColor: getEstadoClase(ultima.estado)
        };
    }
    
    return { value: 'N/A', status: 'Sin datos', statusColor: 'bg-gray-50 text-gray-500' };
});

// Chart Data basado en datos reales de controles
const chartDataPresion = computed(() => {
    const historial = historialMediciones.value[controlPresion.value?.id] || [];
    // Agrupar por fecha de control (tomar solo mediciones con valor de presión)
    const controlesPorFecha = {};
    
    historial.forEach(h => {
        if (h.valor && String(h.valor).includes('/')) {
            const fecha = new Date(h.fecha).toISOString().split('T')[0];
            if (!controlesPorFecha[fecha]) {
                controlesPorFecha[fecha] = [];
            }
            controlesPorFecha[fecha].push(h);
        }
    });
    
    const fechas = Object.keys(controlesPorFecha).sort().slice(-7); // Últimos 7 controles
    
    if (fechas.length === 0) {
        return {
            labels: ['Sin datos'],
            datasets: [
                { label: 'Sistólica', data: [null], borderColor: '#DC2626', backgroundColor: '#DC2626', borderWidth: 2, tension: 0.4 },
                { label: 'Diastólica', data: [null], borderColor: '#F87171', backgroundColor: '#F87171', borderWidth: 2, tension: 0.4 }
            ]
        };
    }
    
    return {
        labels: fechas.map((f, i) => `C${i+1}`),
        datasets: [
            {
                label: 'Sistólica',
                data: fechas.map(f => {
                    const meds = controlesPorFecha[f];
                    const m = meds.find(x => x.valor && String(x.valor).includes('/'));
                    return m ? parseInt(String(m.valor).split('/')[0]) : null;
                }),
                borderColor: '#DC2626',
                backgroundColor: '#DC2626',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Diastólica',
                data: fechas.map(f => {
                    const meds = controlesPorFecha[f];
                    const m = meds.find(x => x.valor && String(x.valor).includes('/'));
                    return m ? parseInt(String(m.valor).split('/')[1]) : null;
                }),
                borderColor: '#F87171',
                backgroundColor: '#F87171',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };
});

const chartDataGlicemia = computed(() => {
    const historial = historialMediciones.value[controlGlucosa.value?.id] || [];
    // Agrupar por fecha de control
    const controlesPorFecha = {};
    
    historial.forEach(h => {
        const val = parseFloat(h.valor);
        if (h.valor && !isNaN(val) && val > 0 && !String(h.valor).includes('/')) {
            const fecha = new Date(h.fecha).toISOString().split('T')[0];
            if (!controlesPorFecha[fecha]) {
                controlesPorFecha[fecha] = [];
            }
            controlesPorFecha[fecha].push(h);
        }
    });
    
    const fechas = Object.keys(controlesPorFecha).sort().slice(-7);
    
    if (fechas.length === 0) {
        return {
            labels: ['Sin datos'],
            datasets: [{
                label: 'Glicemia', data: [null], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 2, fill: true, tension: 0.4
            }]
        };
    }
    
    return {
        labels: fechas.map((f, i) => `C${i+1}`),
        datasets: [{
            label: 'Glicemia',
            data: fechas.map(f => {
                const meds = controlesPorFecha[f];
                const m = meds.find(x => {
                    const val = parseFloat(x.valor);
                    return !isNaN(val) && val > 0;
                });
                return m ? parseFloat(m.valor) : null;
            }),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
});

const chartDataPeso = computed(() => {
    const historial = historialMediciones.value[controlPeso.value?.id] || [];
    // Agrupar por fecha de control
    const controlesPorFecha = {};
    
    historial.forEach(h => {
        const val = parseFloat(h.valor);
        if (h.valor && !isNaN(val) && val > 0 && val < 500) {
            const fecha = new Date(h.fecha).toISOString().split('T')[0];
            if (!controlesPorFecha[fecha]) {
                controlesPorFecha[fecha] = [];
            }
            controlesPorFecha[fecha].push(h);
        }
    });
    
    const fechas = Object.keys(controlesPorFecha).sort().slice(-7);
    
    if (fechas.length === 0) {
        return {
            labels: ['Sin datos'],
            datasets: [{
                label: 'Peso', data: [null], borderColor: '#FF9500', backgroundColor: '#FF9500', borderWidth: 2, tension: 0.4
            }]
        };
    }
    
    return {
        labels: fechas.map((f, i) => `C${i+1}`),
        datasets: [{
            label: 'Peso',
            data: fechas.map(f => {
                const meds = controlesPorFecha[f];
                const m = meds.find(x => {
                    const val = parseFloat(x.valor);
                    return !isNaN(val) && val > 0;
                });
                return m ? parseFloat(m.valor) : null;
            }),
            borderColor: '#FF9500',
            backgroundColor: '#FF9500',
            borderWidth: 2,
            tension: 0.4
        }]
    };
});

onMounted(async () => {
    console.log('MiSaludView montado - iniciando carga de datos');
    await cargarDatos();
});

onBeforeUnmount(() => {
    console.log('MiSaludView desmontado');
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- Indicador de carga -->
    <div v-if="estaCargando" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <Loader2 class="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p class="text-gray-600 font-medium">Cargando tus datos de salud...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <template v-else>
    <!-- Custom Header per Design Reference -->
    <header class="bg-white border-b border-gray-200 px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
        <div>
            <h2 class="font-display font-bold text-2xl text-gray-900">Mi Salud</h2>
            <p class="text-xs md:text-sm text-gray-500 font-body">
                Monitoreo y seguimiento de tus métricas • 
                <span class="text-orange-500 font-medium">{{ controlesProximos.length }} protocolos activos</span>
            </p>
        </div>
        <div class="flex items-center gap-4 md:gap-6">
            <button class="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Bell class="w-5 h-5" />
                <span class="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div class="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200">
                <div class="text-right hidden sm:block">
                    <p class="text-sm font-semibold text-gray-900">{{ fullName }}</p>
                    <p class="text-xs text-gray-500">{{ user?.plan_name || 'Plan Mutual' }}</p>
                </div>
                <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {{ user?.nombres?.[0] }}{{ user?.apellidos?.[0] }}
                </div>
            </div>
        </div>
    </header>

    <!-- Content Area -->
    <div class="p-4 sm:p-8 space-y-6">
        <!-- Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="flex border-b border-gray-200 overflow-x-auto">
                <button class="border-b-2 border-orange-500 text-orange-500 px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap bg-orange-50/10">
                    <Activity class="w-4 h-4" />
                    Mediciones
                </button>
                <button class="px-6 py-4 text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <TrendingUp class="w-4 h-4" />
                    Análisis
                </button>
                <button class="px-6 py-4 text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <Calendar class="w-4 h-4" />
                    Medicamentos
                </button>
            </div>
        </div>

        <div class="flex flex-col xl:flex-row gap-6">
            <!-- Main Content -->
            <div class="flex-1 space-y-6 min-w-0">
                <!-- Date Filters -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <Calendar class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-700 font-label">Período:</span>
                    </div>
                    <div class="flex gap-2">
                        <button class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600 transition-colors">7 días</button>
                        <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">30 días</button>
                        <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">90 días</button>
                    </div>
                </div>

                <!-- Charts Grid - Solo 3 controles -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Presión Arterial -->
                    <HealthMetricCard
                        title="Presión Arterial"
                        unit="mmHg"
                        :status="metricaPresion.status"
                        :status-color="metricaPresion.statusColor"
                        :value="metricaPresion.value"
                        subtitle="última medición"
                        trend="-3%"
                        icon="lucide:heart"
                        icon-color="text-red-600"
                        icon-bg="bg-red-50"
                        :chart-data="chartDataPresion"
                    />
                    
                    <!-- Glicemia -->
                     <HealthMetricCard
                        title="Glicemia"
                        unit="mg/dL"
                        :status="metricaGlicemia.status"
                        :status-color="metricaGlicemia.statusColor"
                        :value="metricaGlicemia.value"
                        subtitle="última medición"
                        trend="-5%"
                        icon="lucide:droplet"
                        icon-color="text-blue-500"
                        icon-bg="bg-blue-50"
                        :chart-data="chartDataGlicemia"
                    />
                    
                    <!-- Control Peso -->
                     <HealthMetricCard
                        title="Peso"
                        unit="kg"
                        :status="metricaPeso.status"
                        :status-color="metricaPeso.statusColor"
                        :value="metricaPeso.value"
                        subtitle="última medición"
                        trend="-1.2 kg"
                        icon="lucide:scale"
                        icon-color="text-orange-500"
                        icon-bg="bg-orange-50"
                        :chart-data="chartDataPeso"
                    />
                </div>

                <!-- Measurements Table con datos reales -->
                <MeasurementHistoryTable :measurements="medicionesReales.length > 0 ? medicionesReales : []" />
                
                <!-- Mensaje si no hay mediciones -->
                <div v-if="medicionesReales.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity class="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 class="font-display font-semibold text-lg text-gray-900 mb-2">Sin mediciones registradas</h3>
                    <p class="text-gray-500 mb-4">Aún no tienes mediciones en tu historial. Comienza registrando tu primera medición.</p>
                    <router-link 
                        to="/nueva-medicion/tipo"
                        class="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                        <Activity class="w-4 h-4" />
                        Registrar Medición
                    </router-link>
                </div>
                
            </div>

            <!-- Right Sidebar -->
            <aside class="w-full xl:w-80 space-y-6">
                <!-- Rangos Normales -->
                <NormalRangesCard />

                <!-- Próximas Mediciones -->
                <UpcomingControlsCard :controls="controlesProximos.slice(0,3)" />
            </aside>
        </div>
    </div>

    <!-- FAB used in HTML reference -->
    <router-link 
        to="/nueva-medicion/tipo"
        class="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 z-30"
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
    font-family: 'Satoshi', sans-serif;
}
.font-label {
    font-family: 'Space Grotesk', sans-serif;
}
</style>

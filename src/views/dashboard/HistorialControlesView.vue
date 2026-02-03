<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/tiendaUsuario';
import { useConfigStore } from '@/stores/tiendaConfig'
import { useHealthStore } from '@/stores/tiendaSalud';
import { storeToRefs } from 'pinia';
import { 
  Bell, 
  ClipboardList, 
  TrendingUp, 
  CalendarClock,
  Filter,
  Calendar,
  Search,
  List,
  Grid3X3,
  Eye,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  CheckCircle,
  AlertTriangle,
  Info,
  Heart,
  Smile,
  FlaskConical,
  Stethoscope,
  Scale,
  Activity,
  Loader2
} from 'lucide-vue-next';
import HeaderCompleto from "@/components/ui/HeaderCompleto.vue";

const userStore = useUserStore();
const configStore = useConfigStore();
const healthStore = useHealthStore();
const { fullName, user } = storeToRefs(userStore);
const { controlesProximos, historialMediciones, ultimaMedicion, loading: loadingStore } = storeToRefs(healthStore);

const logoMutualHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})

// Estado
const estaCargando = ref(true);
const vistaActual = ref('lista'); // 'lista' o 'grid'
const filtroTipo = ref('Todos');
const filtroEstado = ref('Todos');
const paginaActual = ref(1);
const itemsPorPagina = 5;

// Datos reales de la API
const controlesAPI = ref([]);
const protocolos = ref([]);
const observacionesPorProtocolo = ref({});

// Cargar datos reales de la API
async function cargarDatosReales() {
  estaCargando.value = true;
  
  try {
    // Cargar datos del store (que ya usa la API)
    await healthStore.fetchAllHealthData();
    
    // Obtener protocolos del store
    protocolos.value = controlesProximos.value;
    
    // Cargar observaciones para cada protocolo
    for (const protocolo of protocolos.value) {
      await healthStore.fetchHistorial(protocolo.id);
    }
    
    // Transformar observaciones a formato de historial
    controlesAPI.value = transformarObservacionesAControles();
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    estaCargando.value = false;
  }
}

// Transformar observaciones de la API al formato de la vista
function transformarObservacionesAControles() {
  const controles = [];
  
  Object.entries(historialMediciones.value).forEach(([protocolId, mediciones]) => {
    const protocolo = protocolos.value.find(p => p.id === protocolId);
    if (!protocolo) return;
    
    // Agrupar mediciones por fecha (cada grupo de observaciones es un control)
    const gruposPorFecha = {};
    
    mediciones.forEach(medicion => {
      const fecha = new Date(medicion.fecha).toISOString().split('T')[0];
      if (!gruposPorFecha[fecha]) {
        gruposPorFecha[fecha] = [];
      }
      gruposPorFecha[fecha].push(medicion);
    });
    
    // Crear un control por cada fecha
    Object.entries(gruposPorFecha).forEach(([fecha, meds]) => {
      const medicionPrincipal = meds.find(m => m.valor !== 'N/A') || meds[0];
      
      controles.push({
        id: `${protocolId}-${fecha}`,
        fecha: formatearFecha(fecha),
        hora: new Date(meds[0].fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        tipo: protocolo.nombre,
        tipoIcono: getIconoPorTipo(protocolo.nombre),
        tipoColor: getColorPorTipo(protocolo.nombre),
        tipoBg: getBgColorPorTipo(protocolo.nombre),
        medico: 'Sistema MIO+',
        centro: 'Control Remoto',
        resultado: getResultadoTexto(medicionPrincipal.estado),
        resultadoTipo: getResultadoTipo(medicionPrincipal.estado),
        documentos: [],
        estado: 'Completado',
        estadoTipo: 'success',
        valor: medicionPrincipal.valor,
        unidad: medicionPrincipal.unidad,
        protocolId: protocolId
      });
    });
  });
  
  // Ordenar por fecha descendente
  return controles.sort((a, b) => {
    const fechaA = new Date(a.fecha.split(' ').reverse().join('-'));
    const fechaB = new Date(b.fecha.split(' ').reverse().join('-'));
    return fechaB - fechaA;
  });
}

// Helpers para formateo
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

function getIconoPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return Heart;
  }
  if (normalizedName.includes('PESO')) {
    return Scale;
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return FlaskConical;
  }
  return Activity;
}

function getColorPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return 'text-red-500';
  }
  if (normalizedName.includes('PESO')) {
    return 'text-blue-500';
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return 'text-green-500';
  }
  return 'text-gray-500';
}

function getBgColorPorTipo(nombre) {
  const normalizedName = nombre?.toUpperCase() || '';
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) {
    return 'bg-red-50';
  }
  if (normalizedName.includes('PESO')) {
    return 'bg-blue-50';
  }
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) {
    return 'bg-green-50';
  }
  return 'bg-gray-50';
}

function getResultadoTexto(estado) {
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

function getResultadoTipo(estado) {
  const tipos = {
    'normal': 'success',
    'green': 'success',
    'success': 'success',
    'warning': 'warning',
    'orange': 'warning',
    'alerta': 'warning',
    'red': 'danger',
    'critico': 'danger',
    'danger': 'danger',
    'none': 'info',
    'na': 'info'
  };
  return tipos[estado] || 'success';
}

// Computed
const estadisticas = computed(() => {
  const total = controlesAPI.value.length;
  const completados = controlesAPI.value.filter(c => c.estado === 'Completado').length;
  const cumplimiento = total > 0 ? Math.round((completados / total) * 100) : 0;
  
  return {
    total,
    cumplimiento,
    promedioMeses: total > 0 ? (12 / total).toFixed(1) : '0.0'
  };
});

// Controles filtrados
const controlesFiltrados = computed(() => {
  let filtrados = controlesAPI.value;
  
  if (filtroTipo.value !== 'Todos') {
    filtrados = filtrados.filter(c => c.tipo === filtroTipo.value);
  }
  
  if (filtroEstado.value !== 'Todos') {
    filtrados = filtrados.filter(c => c.estado === filtroEstado.value);
  }
  
  return filtrados;
});

// Paginación
const totalPaginas = computed(() => Math.ceil(controlesFiltrados.value.length / itemsPorPagina));

const controlesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return controlesFiltrados.value.slice(inicio, fin);
});

// Helpers para clases de estado
const getResultadoClases = (tipo) => {
  const clases = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    info: 'bg-orange-50 text-orange-700',
    danger: 'bg-red-50 text-red-700'
  };
  return clases[tipo] || clases.info;
};

const getEstadoClases = (tipo) => {
  const clases = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-orange-50 text-orange-600 border border-orange-200',
    danger: 'bg-red-50 text-red-700 border border-red-200'
  };
  return clases[tipo] || clases.warning;
};

const getIconoResultado = (tipo) => {
  const iconos = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    danger: AlertTriangle
  };
  return iconos[tipo] || Info;
};

// Métodos
const cambiarVista = (vista) => {
  vistaActual.value = vista;
};

const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
  }
};

const verDetalle = (control) => {
  console.log('Ver detalle:', control);
};

const descargarDocumento = (control) => {
  console.log('Descargar:', control);
};

const compartirControl = (control) => {
  console.log('Compartir:', control);
};

// Watch para resetear página cuando cambian filtros
watch([filtroTipo, filtroEstado], () => {
  paginaActual.value = 1;
});

onMounted(() => {
  cargarDatosReales();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Indicador de carga -->
      <div v-if="estaCargando" class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <Loader2 class="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p class="text-plan-muted font-medium">Cargando historial de controles...</p>
        </div>
      </div>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Header -->
       <HeaderCompleto
         titulo="Historial de Controles"
         :subtitulo="`Revisa tu historial médico completo • ${controlesAPI.length} controles registrados`"
         :mostrar-saludo="false"
         :show-notification-badge="true"
         notification-badge-color="#10B981"
         @click-notification="console.log('Notificaciones clicked')"
         @click-profile="console.log('Perfil clicked')"
       />

      <!-- Content -->
      <div class="p-4 sm:p-8 space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-plan-muted text-sm font-mono uppercase tracking-wide">Total Controles</p>
                <p class="font-display font-bold text-3xl text-plan mt-2">{{ estadisticas.total }}</p>
                <p class="text-sm text-plan-muted mt-1">Desde 2024</p>
              </div>
              <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ClipboardList class="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-plan-muted text-sm font-mono uppercase tracking-wide">Tasa de Cumplimiento</p>
                <p class="font-display font-bold text-3xl text-green-600 mt-2">{{ estadisticas.cumplimiento }}%</p>
                <p class="text-sm text-plan-muted mt-1">Meta: 90%</p>
              </div>
              <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp class="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-plan-muted text-sm font-mono uppercase tracking-wide">Último Control</p>
                <p class="font-display font-bold text-3xl text-plan mt-2">
                  {{ controlesAPI[0]?.fecha || 'Sin registros' }}
                </p>
                <p class="text-sm text-plan-muted mt-1">
                  {{ controlesAPI[0]?.tipo || 'No hay controles recientes' }}
                </p>
              </div>
              <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <CalendarClock class="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 text-plan-muted">
              <Filter class="w-5 h-5" />
              <span class="font-medium">Filtros:</span>
            </div>
            
            <div class="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
              <Calendar class="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Desde" class="bg-transparent text-sm w-20 outline-none">
              <span class="text-gray-400">-</span>
              <input type="text" placeholder="Hasta" class="bg-transparent text-sm w-20 outline-none">
            </div>
            
            <select v-model="filtroTipo" class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-200">
              <option>Todos</option>
              <option v-for="protocolo in protocolos" :key="protocolo.id" :value="protocolo.nombre">
                {{ protocolo.nombre }}
              </option>
            </select>
            
            <select v-model="filtroEstado" class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-200">
              <option>Todos</option>
              <option>Completado</option>
              <option>Programado</option>
              <option>Cancelado</option>
            </select>
            
            <button class="ml-auto flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              <Search class="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>

        <!-- View Toggle -->
          <div class="flex items-center justify-between">
          <p class="text-plan-alt text-sm">
            <span class="font-semibold text-plan">{{ controlesFiltrados.length }}</span> controles encontrados
          </p>
          <div class="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            <button 
              @click="cambiarVista('lista')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              :class="vistaActual === 'lista' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
            >
              <List class="w-4 h-4" />
              Lista
            </button>
            <button 
              @click="cambiarVista('grid')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              :class="vistaActual === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
            >
              <Grid3X3 class="w-4 h-4" />
              Grid
            </button>
          </div>
        </div>

        <!-- Empty State -->
          <div v-if="controlesFiltrados.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList class="w-8 h-8 text-gray-400" />
            </div>
          <h3 class="font-display font-semibold text-lg text-plan mb-2">No hay controles registrados</h3>
          <p class="text-plan-alt mb-4">Aún no tienes controles en tu historial. Comienza registrando tu primera medición.</p>
            <router-link 
              to="/nueva-medicion/tipo"
              class="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
            <Activity class="w-4 h-4" />
            Registrar Control
          </router-link>
        </div>

        <!-- Table View -->
        <div v-else-if="vistaActual === 'lista'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Tipo de Control</th>
                  <th class="text-left py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                  <th class="text-left py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Resultado</th>
                  <th class="text-left py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th class="text-right py-4 px-6 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="control in controlesPaginados" :key="control.id" class="hover:bg-gray-50 transition-colors">
                  <td class="py-4 px-6">
                    <div class="flex flex-col">
                  <span class="text-sm font-medium text-plan">{{ control.fecha }}</span>
                  <span class="text-xs text-gray-400">{{ control.hora }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="control.tipoBg">
                        <component :is="control.tipoIcono" class="w-4 h-4" :class="control.tipoColor" />
                      </div>
                      <span class="text-sm font-medium text-plan">{{ control.tipo }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm font-semibold text-plan">
                      {{ control.valor }} <span class="text-plan-alt font-normal">{{ control.unidad }}</span>
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getResultadoClases(control.resultadoTipo)">
                      <component :is="getIconoResultado(control.resultadoTipo)" class="w-3 h-3 mr-1" />
                      {{ control.resultado }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getEstadoClases(control.estadoTipo)">
                      {{ control.estado }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        @click="verDetalle(control)"
                        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                      <button 
                        @click="compartirControl(control)"
                        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Compartir"
                      >
                        <Share2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPaginas > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p class="text-plan-alt text-sm">
              Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }}-{{ Math.min(paginaActual * itemsPorPagina, controlesFiltrados.length) }} de {{ controlesFiltrados.length }} controles
            </p>
            <div class="flex items-center gap-2">
              <button 
                @click="cambiarPagina(paginaActual - 1)"
                :disabled="paginaActual === 1"
                class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                :class="paginaActual === 1 ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button 
                v-for="pagina in totalPaginas" 
                :key="pagina"
                @click="cambiarPagina(pagina)"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                :class="paginaActual === pagina ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'"
              >
                {{ pagina }}
              </button>
              <button 
                @click="cambiarPagina(paginaActual + 1)"
                :disabled="paginaActual === totalPaginas"
                class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                :class="paginaActual === totalPaginas ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="control in controlesPaginados" 
            :key="control.id"
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="control.tipoBg">
                  <component :is="control.tipoIcono" class="w-5 h-5" :class="control.tipoColor" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-plan">{{ control.tipo }}</p>
                  <p class="text-xs text-gray-400">{{ control.fecha }} • {{ control.hora }}</p>
                </div>
              </div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getEstadoClases(control.estadoTipo)">
                {{ control.estado }}
              </span>
            </div>
            
            <div class="mb-4">
              <p class="text-xs text-gray-400 mb-1">Valor medido</p>
              <p class="text-lg font-semibold text-plan">
                {{ control.valor }} <span class="text-sm text-plan-alt font-normal">{{ control.unidad }}</span>
              </p>
            </div>
            
            <div class="flex items-center justify-between mb-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" :class="getResultadoClases(control.resultadoTipo)">
                <component :is="getIconoResultado(control.resultadoTipo)" class="w-3 h-3 mr-1" />
                {{ control.resultado }}
              </span>
            </div>
            
            <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button 
                @click="verDetalle(control)"
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Eye class="w-4 h-4" />
                Ver
              </button>
              <button 
                @click="compartirControl(control)"
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Share2 class="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>

        <!-- Protocolos Disponibles -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display font-bold text-lg text-plan">Tus Protocolos de Control</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              v-for="protocolo in protocolos" 
              :key="protocolo.id"
              class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="protocolo.color ? 'bg-opacity-10' : 'bg-gray-100'" :style="protocolo.color ? { backgroundColor: protocolo.color + '20' } : {}">
                  <component :is="getIconoPorTipo(protocolo.nombre)" class="w-5 h-5" :style="protocolo.color ? { color: protocolo.color } : {}" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-plan">{{ protocolo.nombre }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ protocolo.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
.font-mono {
  font-family: 'Space Grotesk', monospace;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/tiendaUsuario';
import { useHealthStore } from '@/stores/tiendaSalud';
import { useTiendaCampanas } from '@/stores/tiendaCampanas';
import { useTiendaServicios } from '@/stores/tiendaServicios';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { Bot } from 'lucide-vue-next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet/index.js";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/components/ui/carousel/index.js";
import ChatView from '@/views/chat/ChatView.vue';

// Stores
const userStore = useUserStore();
const healthStore = useHealthStore();
const campanasStore = useTiendaCampanas();
const serviciosStore = useTiendaServicios();
const router = useRouter();

// Refs de stores
const { servicios } = storeToRefs(serviciosStore);

// Refs
const { nombreCompleto, firstName, usuario } = storeToRefs(userStore);
const { campanas } = storeToRefs(campanasStore);
const { controlesProximos, historialMediciones, ultimaMedicion } = storeToRefs(healthStore);

// Notifications
const hasNotifications = ref(true);

// Estado de carga
const cargandoMediciones = computed(() => healthStore.loading);

// Estado para controlar el panel del chatbot
const chatbotAbierto = ref(false);

// Estado para el plan activo (obtenido desde localStorage)
const planActivo = ref('mutual');

// Banners filtrados según el plan
const bannersFiltrados = computed(() => {
  // Buscar el servicio de tipo BANNER
  const servicioBanner = servicios.value.find(s => s.name === 'BANNER');
  
  if (!servicioBanner || !servicioBanner.options) {
    return [];
  }
  
  // Obtener todos los banners que tengan imagen y título
  const todosBanners = servicioBanner.options.filter(option => 
    option.image && option.title
  );
  
  // Si el plan es esencial, filtrar solo "Clases en vivo con Berni Allen"
  if (planActivo.value === 'esencial') {
    return todosBanners.filter(banner => 
      banner.title?.toLowerCase().includes('berni allen')
    );
  }
  
  // Si es mutual, mostrar todos los banners
  return todosBanners;
});

// --- Computed Data ---

// Saludo dinámico
const saludo = computed(() => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
});

// Iniciales del usuario
const userInitials = computed(() => {
    if (firstName.value) {
        return firstName.value.substring(0, 2).toUpperCase();
    }
    if (nombreCompleto.value) {
        return nombreCompleto.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return 'MP'; // Mio Patient
});

// Mediciones Recientes - 4 controles específicos
const medicionesDisplay = computed(() => {
    // Definir los 4 controles específicos que queremos mostrar
    const controlesRequeridos = [
        { id: 'peso', nombre: 'Control de Peso', tipo: 'peso', icono: 'scale', color: 'text-purple-500', bg: 'bg-purple-50', unidad: 'kg' },
        { id: 'presion', nombre: 'Control Presión Arterial', tipo: 'presion', icono: 'heart-pulse', color: 'text-alert-red', bg: 'bg-red-50', unidad: 'mmHg' },
        { id: 'glicemia', nombre: 'Glicemia', tipo: 'glucosa', icono: 'droplet', color: 'text-blue-500', bg: 'bg-blue-50', unidad: 'mg/dL' },
        { id: 'diabetes', nombre: 'Control Diabetes', tipo: 'glucosa', icono: 'activity', color: 'text-green-500', bg: 'bg-green-50', unidad: 'mg/dL' }
    ];
    
    // Debug: Verificar qué datos tenemos disponibles
    console.log('📊 Mediciones Display - Controles disponibles:', controlesProximos.value.length);
    console.log('📊 Mediciones Display - Historial:', historialMediciones.value);
    console.log('📊 Mediciones Display - Última medición:', ultimaMedicion.value);

    // Mapear los 4 controles requeridos
    return controlesRequeridos.map(controlReq => {
        // Buscar si existe un control real en la API que coincida con este tipo
        const controlReal = controlesProximos.value.find(c => {
            const nombreLower = c.nombre.toLowerCase();
            if (controlReq.tipo === 'peso') {
                return nombreLower.includes('peso') || nombreLower.includes('masa');
            } else if (controlReq.tipo === 'presion') {
                return nombreLower.includes('presi') || nombreLower.includes('arterial');
            } else if (controlReq.tipo === 'glucosa') {
                return nombreLower.includes('gluc') || nombreLower.includes('glic') || nombreLower.includes('diabetes');
            }
            return false;
        });
        
        // Usar el ID del control real si existe, sino usar el ID del requerido
        const controlId = controlReal ? controlReal.id : controlReq.id;
        
        // Buscar historial para este control
        const history = historialMediciones.value[controlId] || [];
        let latest = history.length > 0 ? history[0] : null;
        let previous = history.length > 1 ? history[1] : null;
        
        // Si no hay historial específico, buscar en la última medición global
        if (!latest && ultimaMedicion.value) {
            const ultima = ultimaMedicion.value;
            if (ultima.tipo === controlReq.tipo) {
                latest = ultima;
            }
        }
        
        // Si no hay datos, buscar en todos los historiales disponibles por tipo
        if (!latest) {
            Object.values(historialMediciones.value).forEach(historial => {
                if (Array.isArray(historial)) {
                    const medicionTipo = historial.find(m => m.tipo === controlReq.tipo);
                    if (medicionTipo && (!latest || new Date(medicionTipo.fecha) > new Date(latest.fecha))) {
                        latest = medicionTipo;
                        // Buscar la anterior para tendencia
                        const idx = historial.indexOf(medicionTipo);
                        if (idx >= 0 && idx < historial.length - 1) {
                            previous = historial[idx + 1];
                        }
                    }
                }
            });
        }

        let value = latest ? latest.valor : '--';
        if (value === 'N/A' || value === null || value === undefined) value = '--';

        // Usar unidad del control requerido o de la medición
        let unit = latest && latest.unidad ? latest.unidad : controlReq.unidad;
        // Usar formato de fecha amigable
        let date = latest && latest.fecha ? formatDateFriendly(latest.fecha) : 'Sin registros';
        let status = 'Pendiente';
        let statusClass = 'bg-gray-bg text-gray-text-light';
        
        if (value === '--') {
             status = 'Sin registrar';
             unit = controlReq.unidad; // Mantener unidad aunque no haya valor
        } else if (latest) {
             const estado = latest.estado || 'normal';
             if (estado === 'normal' || estado === 'none') {
                status = 'Normal';
                statusClass = 'bg-health-green/10 text-health-green';
            } else if (estado === 'alerta' || estado === 'alert') {
                status = 'Alerta';
                statusClass = 'bg-alert-red/10 text-alert-red';
            } else if (estado === 'critico' || estado === 'critical') {
                status = 'Crítico';
                statusClass = 'bg-red-600/10 text-red-600';
            } else {
                status = 'Registrado';
                statusClass = 'bg-primary/10 text-primary';
            }
        }

        // Usar icono y color del control requerido
        const iconName = controlReq.icono;
        const colorClass = controlReq.color;
        const bgClass = controlReq.bg;

        // Calcular tendencia comparando con medición anterior
        const tendencia = calcularTendencia(
            latest ? latest.valor : null,
            previous ? previous.valor : null,
            controlReq.tipo
        );

        return {
            key: controlReq.id,
            title: controlReq.nombre,
            icon: iconName,
            color: colorClass,
            bg: bgClass,
            unit,
            value,
            status,
            statusClass,
            date,
            tendencia
        };
    });
});

// Datos para el Resumen Semanal - Gráficos dinámicos
const datosResumenPeso = computed(() => {
  // Buscar todas las mediciones de peso en el historial
  const medicionesPeso = [];
  
  Object.values(historialMediciones.value).forEach(historial => {
    if (Array.isArray(historial)) {
      historial.forEach(m => {
        if (m.tipo === 'peso' && m.valor && m.valor !== '--' && m.valor !== 'N/A') {
          medicionesPeso.push({
            valor: parseFloat(m.valor),
            fecha: m.fecha,
            fechaStr: new Date(m.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
          });
        }
      });
    }
  });
  
  // Ordenar por fecha y tomar las últimas 7
  medicionesPeso.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const ultimasMediciones = medicionesPeso.slice(-7);
  
  if (ultimasMediciones.length === 0) {
    return {
      promedio: 0,
      mediciones: [],
      tieneDatos: false
    };
  }
  
  // Calcular promedio
  const promedio = ultimasMediciones.reduce((sum, m) => sum + m.valor, 0) / ultimasMediciones.length;
  
  // Normalizar alturas para el gráfico (0-100%)
  const valores = ultimasMediciones.map(m => m.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  
  const medicionesNormalizadas = ultimasMediciones.map(m => ({
    ...m,
    altura: Math.max(20, Math.min(100, ((m.valor - min) / rango) * 80 + 20))
  }));
  
  return {
    promedio: promedio.toFixed(1),
    mediciones: medicionesNormalizadas,
    tieneDatos: true
  };
});

const datosResumenPresion = computed(() => {
  // Buscar todas las mediciones de presión en el historial
  const medicionesPresion = [];
  
  Object.values(historialMediciones.value).forEach(historial => {
    if (Array.isArray(historial)) {
      historial.forEach(m => {
        if (m.tipo === 'presion' && m.valor && m.valor !== '--' && m.valor !== 'N/A') {
          // Extraer valor sistólico (antes del /)
          const sistolica = parseFloat(m.valor.split('/')[0]);
          if (!isNaN(sistolica)) {
            medicionesPresion.push({
              valor: sistolica,
              valorCompleto: m.valor,
              fecha: m.fecha,
              fechaStr: new Date(m.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
            });
          }
        }
      });
    }
  });
  
  // Ordenar por fecha y tomar las últimas 7
  medicionesPresion.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const ultimasMediciones = medicionesPresion.slice(-7);
  
  if (ultimasMediciones.length === 0) {
    return {
      promedio: 0,
      mediciones: [],
      tieneDatos: false
    };
  }
  
  // Calcular promedio
  const promedio = ultimasMediciones.reduce((sum, m) => sum + m.valor, 0) / ultimasMediciones.length;
  
  return {
    promedio: Math.round(promedio),
    mediciones: ultimasMediciones,
    tieneDatos: true
  };
});

// Eventos (Controles Pendientes)
const proximosEventos = computed(() => {
    const list = controlesProximos.value.filter(c => c.estado === 'pendiente').slice(0, 3);
    
    if (list.length === 0) {
        return [
           { 
             day: '15', month: 'ENE', title: 'Consulta General', subtitle: 'Hospital Central • 10:00 AM', 
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

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if(isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `Hace ${hours} horas`;
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
};

// Formato de fecha amigable (Hoy, Ayer, Hace X días)
const formatDateFriendly = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const now = new Date();
    const diffTime = now - d;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Hoy - mostrar hora
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `Hoy, ${hours}:${minutes}`;
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    }
};

// Funciones auxiliares para generar gráficos
const generarPathPresion = (mediciones) => {
  if (mediciones.length < 2) return '';
  
  const valores = mediciones.map(m => m.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  
  // Normalizar valores a coordenadas Y (0-40, invertido porque SVG va de arriba hacia abajo)
  const puntos = mediciones.map((m, idx) => {
    const x = (idx / (mediciones.length - 1)) * 100;
    const y = 40 - (((m.valor - min) / rango) * 30 + 5); // Entre 5 y 35
    return `${x},${y}`;
  });
  
  // Crear path suavizado con curvas Bézier
  let path = `M${puntos[0]}`;
  for (let i = 1; i < puntos.length; i++) {
    const prev = puntos[i - 1].split(',').map(Number);
    const curr = puntos[i].split(',').map(Number);
    const cpx1 = prev[0] + (curr[0] - prev[0]) / 2;
    const cpy1 = prev[1];
    const cpx2 = prev[0] + (curr[0] - prev[0]) / 2;
    const cpy2 = curr[1];
    path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${curr[0]},${curr[1]}`;
  }
  
  return path;
};

const generarYUltimoPunto = (mediciones) => {
  if (mediciones.length === 0) return 20;
  
  const ultimo = mediciones[mediciones.length - 1];
  const valores = mediciones.map(m => m.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  
  return 40 - (((ultimo.valor - min) / rango) * 30 + 5);
};

// Función para calcular tendencia comparando con medición anterior
const calcularTendencia = (current, previous, tipo) => {
    if (!current || !previous || current === '--' || previous === '--') {
        return { direccion: 'stable', cambio: null, porcentaje: null };
    }
    
    let valorActual = parseFloat(current);
    let valorAnterior = parseFloat(previous);
    
    // Para presión arterial, extraer valor sistólico
    if (tipo === 'presion' && current.includes('/')) {
        valorActual = parseFloat(current.split('/')[0]);
        valorAnterior = parseFloat(previous.split('/')[0]);
    }
    
    if (isNaN(valorActual) || isNaN(valorAnterior) || valorAnterior === 0) {
        return { direccion: 'stable', cambio: null, porcentaje: null };
    }
    
    const diferencia = valorActual - valorAnterior;
    const porcentaje = ((diferencia / valorAnterior) * 100);
    
    // Umbral del 5% para considerar estable
    if (Math.abs(porcentaje) < 5) {
        return { direccion: 'stable', cambio: diferencia, porcentaje };
    }
    
    // Para peso y presión: menos es mejor (down = good)
    // Para glucosa y frecuencia: depende del rango normal
    let direccion = diferencia > 0 ? 'up' : 'down';
    
    return { direccion, cambio: diferencia, porcentaje };
};

onMounted(async () => {
    // Obtener plan activo desde localStorage
    const planGuardado = localStorage.getItem('mio-plan-activo');
    if (planGuardado) {
        planActivo.value = planGuardado;
    }
    
    // Cargar datos reales de la API de HOMA
    await Promise.all([
        healthStore.fetchAllHealthData(),
        campanasStore.cargarCampanas(),
        serviciosStore.cargarServicios()
    ]);
});
</script>

<template>
    <!-- Root Container: Adjusted for use inside Global Layout (no sidebar, full height handled by layout) -->
    <div class="h-full flex flex-col bg-gray-bg text-gray-text font-body">
        
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md border-b border-gray-border px-8 py-4 sticky top-0 z-20 transition-all duration-300">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="font-display font-bold text-2xl text-gray-text">{{ saludo }}, {{ firstName || 'Usuario' }}</h1>
                    <p class="text-gray-text-light text-sm mt-1 font-medium">Aquí está el resumen de tu salud hoy</p>
                </div>
                <div class="flex items-center gap-6">
                    <button class="relative p-2 text-gray-text hover:bg-gray-bg rounded-xl transition-all group">
                        <iconify-icon icon="lucide:bell" class="text-xl group-hover:text-primary transition-colors"></iconify-icon>
                        <span v-if="hasNotifications" class="absolute top-1 right-1 w-2.5 h-2.5 bg-alert-red rounded-full border-2 border-white"></span>
                    </button>
                    
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
                    
                    <div class="flex items-center gap-3 pl-6 border-l border-gray-border">
                        <div class="text-right hidden sm:block">
                            <p class="font-medium text-gray-text text-sm">{{ nombreCompleto }}</p>
                            <p class="text-xs text-gray-text-light font-medium">Paciente</p>
                        </div>
                        <div class="w-10 h-10 bg-health-green/10 rounded-xl flex items-center justify-center border border-health-green/20">
                            <span class="text-health-green font-display font-bold">{{ userInitials }}</span>
                        </div>
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
                        <h2 class="font-display font-bold text-xl text-gray-text flex items-center gap-2">
                            Campañas de Salud
                            <span v-if="!campanasStore.cargando" class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-bold font-mono">{{ campanas.length }}</span>
                        </h2>
                        <button 
                            v-if="campanas.length > 0" 
                            @click="$router.push('/campanas-anteriores')"
                            class="text-primary font-bold text-sm hover:underline flex items-center gap-1"
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
                             class="bg-white rounded-2xl p-6 shadow-sm border border-gray-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                            <!-- Hover Effect -->
                            <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                    <img v-if="campana.imagenUrl" :src="campana.imagenUrl" class="w-8 h-8 object-contain" alt="Icono" />
                                    <iconify-icon v-else icon="lucide:heart" class="text-2xl text-primary"></iconify-icon>
                                </div>
                                <span v-if="campana.activa" class="px-3 py-1 bg-health-green/10 text-health-green text-xs font-label font-bold rounded-full">Activa</span>
                                <span v-else class="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-label font-bold rounded-full">Inactiva</span>
                            </div>
                            <h3 class="font-display font-bold text-lg text-gray-text mb-2 group-hover:text-primary transition-colors">{{ campana.nombre }}</h3>
                            <p class="text-gray-text-light text-sm mb-6 leading-relaxed line-clamp-2 h-10">{{ campana.descripcion || 'Campaña de salud disponible para ti' }}</p>
                            <a :href="campana.url" target="_blank" rel="noopener noreferrer" 
                               class="block w-full py-3 bg-gray-bg text-gray-text font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-none hover:shadow-lg hover:shadow-primary/30 text-center">
                                Ver Detalles
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Mediciones Recientes -->
                <section class="fade-in stagger-1">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="font-display font-bold text-xl text-gray-text">Mis Mediciones Recientes</h2>
                        <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20 hover:translate-y-[-2px]">
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
                                        {{ Math.abs(item.tendencia.porcentaje).toFixed(1) }}%
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
                    <!-- Eventos -->
                    <section>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="font-display font-bold text-xl text-gray-text">Próximos Eventos</h2>
                            <a href="#" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                                Ver calendario
                                <iconify-icon icon="lucide:calendar" class="text-base"></iconify-icon>
                            </a>
                        </div>
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-border p-6 h-full">
                            <div class="space-y-4">
                                <div v-for="(event, idx) in proximosEventos" :key="idx" 
                                     class="flex items-center gap-4 p-4 bg-gray-bg rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                                    <div :class="`w-14 h-14 ${event.bgClass} rounded-xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform`">
                                        <span :class="`${event.colorClass} font-label font-bold text-xs uppercase tracking-wider`">{{ event.month }}</span>
                                        <span :class="`${event.colorClass} font-display font-bold text-xl leading-none`">{{ event.day }}</span>
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-bold text-gray-text text-base group-hover:text-primary transition-colors">{{ event.title }}</p>
                                        <p class="text-sm text-gray-text-light font-medium mt-0.5">{{ event.subtitle }}</p>
                                    </div>
                                    <span :class="`px-3 py-1 text-xs font-label font-bold rounded-full ${event.statusClass}`">{{ event.status }}</span>
                                </div>
                            </div>
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
                    <Carousel 
                        loop 
                        class="w-full"
                        :autoplay="true"
                        :interval="6000"
                    >
                        <CarouselContent>
                            <CarouselItem v-for="banner in bannersFiltrados" :key="banner.title">
                                <a
                                    :href="banner.url"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="block w-full aspect-[21/9] max-h-[180px] rounded-2xl overflow-hidden relative group cursor-pointer"
                                >
                                    <img 
                                        :src="banner.image" 
                                        :alt="banner.title" 
                                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4">
                                        <h3 class="text-white font-bold text-lg md:text-xl drop-shadow-lg">{{ banner.title }}</h3>
                                    </div>
                                </a>
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                        <CarouselDots class="mt-4" />
                    </Carousel>
                </section>
            </div>
        </div>
    </div>
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

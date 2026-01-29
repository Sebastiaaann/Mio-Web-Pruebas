<script setup>
import { ref, onMounted, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/tiendaUsuario";
import { useHealthStore } from "@/stores/tiendaSalud";
import Chart from 'chart.js/auto';
import emblaCarouselVue from "embla-carousel-vue";
import Autoplay from "embla-carousel-autoplay";

// Stores
const userStore = useUserStore();
const healthStore = useHealthStore();
const { firstName, fullName, user } = storeToRefs(userStore);
const { historialMediciones, controlesProximos, videos } = storeToRefs(healthStore);

// Carousel Setup (for Education/Videos)
const [emblaRef] = emblaCarouselVue({ loop: true, align: 'start' }, [Autoplay()]);

// Chart References
const chartPresion = ref(null);
const chartGlucosa = ref(null);
const chartPeso = ref(null);
const chartFC = ref(null);

onMounted(async () => {
    // Mock login/data init if needed
    if (!userStore.isAuthenticated) userStore.mockLogin();
    healthStore.initMockData();

    await nextTick();
    initCharts();
});

const initCharts = () => {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
            y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 10 }, color: '#9CA3AF' } }
        },
        elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 4 } }
    };

    // Presión Arterial
    if (chartPresion.value) {
        new Chart(chartPresion.value, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                    { label: 'Sistólica', data: [118, 120, 122, 119, 121, 118, 120], borderColor: '#DC2626', backgroundColor: '#DC2626', borderWidth: 2, tension: 0.4 },
                    { label: 'Diastólica', data: [78, 80, 79, 77, 79, 78, 80], borderColor: '#F87171', backgroundColor: '#F87171', borderWidth: 2, tension: 0.4 }
                ]
            },
            options: commonOptions
        });
    }

    // Glucosa
    if (chartGlucosa.value) {
        new Chart(chartGlucosa.value, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Glucosa', data: [98, 96, 94, 92, 95, 93, 94], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 2, fill: true, tension: 0.4
                }]
            },
            options: commonOptions
        });
    }

    // Peso
    if (chartPeso.value) {
        new Chart(chartPeso.value, {
            type: 'line',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'],
                datasets: [{
                    label: 'Peso', data: [70.2, 69.8, 69.5, 69.2, 68.9, 68.7, 68.5], borderColor: '#FF9500', backgroundColor: '#FF9500', borderWidth: 2, tension: 0.4
                }]
            },
            options: commonOptions
        });
    }

    // Frecuencia Cardíaca
    if (chartFC.value) {
        new Chart(chartFC.value, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'FC', data: [72, 74, 71, 73, 72, 70, 72], borderColor: '#9333EA',
                    backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
                        gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
                        return gradient;
                    },
                    borderWidth: 2, fill: true, tension: 0.4
                }]
            },
            options: commonOptions
        });
    }
};

</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    
    <!-- Content Area -->
    <div class="p-4 sm:p-8 space-y-6">
        <!-- Tabs -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="flex border-b border-gray-200 overflow-x-auto">
                <button class="tab-active px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap">
                    <iconify-icon icon="lucide:activity"></iconify-icon>
                    Mediciones
                </button>
                <button class="px-6 py-4 text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <iconify-icon icon="lucide:bar-chart-3"></iconify-icon>
                    Análisis
                </button>
                <button class="px-6 py-4 text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap">
                    <iconify-icon icon="lucide:pill"></iconify-icon>
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
                        <iconify-icon icon="lucide:calendar" class="text-gray-400"></iconify-icon>
                        <span class="text-sm text-gray-700 font-medium">Período:</span>
                    </div>
                    <div class="flex gap-2">
                        <button class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600 transition-colors">7 días</button>
                        <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">30 días</button>
                        <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">90 días</button>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Presión Arterial -->
                    <div class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                    <iconify-icon icon="lucide:heart" class="text-red-600 text-xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900">Presión Arterial</h3>
                                    <p class="text-xs text-gray-500">mmHg</p>
                                </div>
                            </div>
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Normal</span>
                        </div>
                        <div class="flex items-end gap-4 mb-4">
                            <div>
                                <span class="font-mono text-3xl font-bold text-gray-900">118/78</span>
                                <span class="text-sm text-gray-500 ml-1">promedio</span>
                            </div>
                            <div class="text-sm text-green-600 flex items-center gap-1 font-medium">
                                <iconify-icon icon="lucide:trending-down"></iconify-icon>
                                <span>-3%</span>
                            </div>
                        </div>
                        <div class="chart-container h-48 w-full relative">
                            <canvas ref="chartPresion"></canvas>
                        </div>
                    </div>

                    <!-- Glucosa -->
                    <div class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <iconify-icon icon="lucide:droplet" class="text-blue-500 text-xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900">Glucosa</h3>
                                    <p class="text-xs text-gray-500">mg/dL</p>
                                </div>
                            </div>
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Óptimo</span>
                        </div>
                        <div class="flex items-end gap-4 mb-4">
                            <div>
                                <span class="font-mono text-3xl font-bold text-gray-900">94</span>
                                <span class="text-sm text-gray-500 ml-1">promedio</span>
                            </div>
                            <div class="text-sm text-green-600 flex items-center gap-1 font-medium">
                                <iconify-icon icon="lucide:trending-down"></iconify-icon>
                                <span>-5%</span>
                            </div>
                        </div>
                        <div class="chart-container h-48 w-full relative">
                            <canvas ref="chartGlucosa"></canvas>
                        </div>
                    </div>

                    <!-- Peso -->
                    <div class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <iconify-icon icon="lucide:scale" class="text-orange-500 text-xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900">Peso</h3>
                                    <p class="text-xs text-gray-500">kg</p>
                                </div>
                            </div>
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Meta</span>
                        </div>
                        <div class="flex items-end gap-4 mb-4">
                            <div>
                                <span class="font-mono text-3xl font-bold text-gray-900">68.5</span>
                                <span class="text-sm text-gray-500 ml-1">actual</span>
                            </div>
                            <div class="text-sm text-green-600 flex items-center gap-1 font-medium">
                                <iconify-icon icon="lucide:trending-down"></iconify-icon>
                                <span>-1.2 kg</span>
                            </div>
                        </div>
                        <div class="chart-container h-48 w-full relative">
                            <canvas ref="chartPeso"></canvas>
                        </div>
                    </div>

                    <!-- Frecuencia Cardíaca -->
                    <div class="metric-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 cursor-pointer">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <iconify-icon icon="lucide:activity" class="text-purple-600 text-xl"></iconify-icon>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900">Frecuencia Cardíaca</h3>
                                    <p class="text-xs text-gray-500">lpm</p>
                                </div>
                            </div>
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Excelente</span>
                        </div>
                        <div class="flex items-end gap-4 mb-4">
                            <div>
                                <span class="font-mono text-3xl font-bold text-gray-900">72</span>
                                <span class="text-sm text-gray-500 ml-1">promedio</span>
                            </div>
                            <div class="text-sm text-gray-500 flex items-center gap-1 font-medium">
                                <iconify-icon icon="lucide:minus"></iconify-icon>
                                <span>0%</span>
                            </div>
                        </div>
                        <div class="chart-container h-48 w-full relative">
                            <canvas ref="chartFC"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Historial de Mediciones -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 class="font-bold text-lg text-gray-900">Historial de Mediciones</h3>
                        <button class="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors">
                            <iconify-icon icon="lucide:download"></iconify-icon>
                            Exportar
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr class="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">15 Ene, 2026</div>
                                        <div class="text-xs text-gray-500">08:30 AM</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center gap-2">
                                            <iconify-icon icon="lucide:heart" class="text-red-500"></iconify-icon>
                                            <span class="text-sm text-gray-900">Presión Arterial</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="font-mono text-lg font-semibold text-gray-900">120/80</span>
                                        <span class="text-xs text-gray-500 ml-1">mmHg</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                            Normal
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button class="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50">
                                            <iconify-icon icon="lucide:more-vertical"></iconify-icon>
                                        </button>
                                    </td>
                                </tr>
                                <tr class="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">14 Ene, 2026</div>
                                        <div class="text-xs text-gray-500">07:15 AM</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center gap-2">
                                            <iconify-icon icon="lucide:droplet" class="text-blue-500"></iconify-icon>
                                            <span class="text-sm text-gray-900">Glucosa</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="font-mono text-lg font-semibold text-gray-900">92</span>
                                        <span class="text-xs text-gray-500 ml-1">mg/dL</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                            Óptimo
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button class="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50">
                                            <iconify-icon icon="lucide:more-vertical"></iconify-icon>
                                        </button>
                                    </td>
                                </tr>
                                 <tr class="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">13 Ene, 2026</div>
                                        <div class="text-xs text-gray-500">09:00 AM</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center gap-2">
                                            <iconify-icon icon="lucide:scale" class="text-orange-500"></iconify-icon>
                                            <span class="text-sm text-gray-900">Peso</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="font-mono text-lg font-semibold text-gray-900">68.5</span>
                                        <span class="text-xs text-gray-500 ml-1">kg</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                            Meta
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button class="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50">
                                            <iconify-icon icon="lucide:more-vertical"></iconify-icon>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                 <!-- Videos section (Carousel) -->
                 <div class="mt-8">
                    <h3 class="font-bold text-lg text-gray-900 mb-4 px-1">Educación Recomendada</h3>
                    <!-- Embla Carousel -->
                    <div class="overflow-hidden" ref="emblaRef">
                        <div class="flex -ml-4">
                             <!-- Slide 1 -->
                            <div class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4" v-for="video in videos" :key="video.id">
                                 <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full hover:shadow-md transition-shadow cursor-pointer group">
                                    <div class="h-40 bg-gray-200 relative">
                                        <img v-if="video.thumbnail" :src="video.thumbnail" class="w-full h-full object-cover">
                                        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                                             <iconify-icon icon="lucide:image" class="text-gray-300 text-4xl"></iconify-icon>
                                        </div>
                                        <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                                            <iconify-icon icon="lucide:play-circle" class="text-white text-4xl opacity-90 scale-95 group-hover:scale-110 transition-transform duration-200 drop-shadow-lg"></iconify-icon>
                                        </div>
                                        <span class="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">05:20</span>
                                    </div>
                                    <div class="p-4">
                                        <div class="flex items-start justify-between gap-2 mb-2">
                                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 uppercase tracking-wide">Educación</span>
                                        </div>
                                        <h4 class="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-orange-500 transition-colors">{{ video.titulo }}</h4>
                                        <p class="text-sm text-gray-500 line-clamp-2 h-10">{{ video.descripcion }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Fallback/Mock Slides if no videos -->
                             <div  v-if="videos.length === 0" class="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4">
                                 <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full group cursor-pointer">
                                    <div class="h-40 bg-gray-100 relative flex items-center justify-center">
                                       <iconify-icon icon="lucide:video" class="text-gray-300 text-4xl"></iconify-icon>
                                    </div>
                                    <div class="p-4">
                                        <h4 class="font-bold text-gray-900 mb-1">Cargando contenido...</h4>
                                        <p class="text-sm text-gray-500">Estamos preparando tus videos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Sidebar -->
            <aside class="w-full xl:w-80 space-y-6">
                <!-- Rangos Normales -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <iconify-icon icon="lucide:info" class="text-orange-500"></iconify-icon>
                        Rangos Normales
                    </h3>
                    <div class="space-y-4">
                        <div class="border-l-4 border-green-500 p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-900">Presión Arterial</span>
                                <iconify-icon icon="lucide:check-circle" class="text-green-500 text-lg"></iconify-icon>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="font-mono font-bold text-gray-900">90/60</span>
                                <span class="text-gray-400">-</span>
                                <span class="font-mono font-bold text-gray-900">120/80</span>
                                <span class="text-xs text-gray-500">mmHg</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Tu última: 118/78</p>
                        </div>

                        <div class="border-l-4 border-green-500 p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-900">Glucosa en Ayunas</span>
                                <iconify-icon icon="lucide:check-circle" class="text-green-500 text-lg"></iconify-icon>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="font-mono font-bold text-gray-900">70</span>
                                <span class="text-gray-400">-</span>
                                <span class="font-mono font-bold text-gray-900">100</span>
                                <span class="text-xs text-gray-500">mg/dL</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Tu última: 94</p>
                        </div>

                        <div class="border-l-4 border-green-500 p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-900">IMC</span>
                                <iconify-icon icon="lucide:check-circle" class="text-green-500 text-lg"></iconify-icon>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="font-mono font-bold text-gray-900">18.5</span>
                                <span class="text-gray-400">-</span>
                                <span class="font-mono font-bold text-gray-900">24.9</span>
                                <span class="text-xs text-gray-500">kg/m²</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Tu IMC: 22.4</p>
                        </div>

                         <div class="border-l-4 border-green-500 p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-900">Frecuencia Card.</span>
                                <iconify-icon icon="lucide:check-circle" class="text-green-500 text-lg"></iconify-icon>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="font-mono font-bold text-gray-900">60</span>
                                <span class="text-gray-400">-</span>
                                <span class="font-mono font-bold text-gray-900">100</span>
                                <span class="text-xs text-gray-500">lpm</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Tu promedio: 72</p>
                        </div>

                        <div class="border-l-4 border-yellow-500 p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-900">Colesterol Total</span>
                                <iconify-icon icon="lucide:alert-circle" class="text-yellow-500 text-lg"></iconify-icon>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <span class="text-gray-400">&lt;</span>
                                <span class="font-mono font-bold text-gray-900">200</span>
                                <span class="text-xs text-gray-500">mg/dL</span>
                            </div>
                            <p class="text-xs text-yellow-600 mt-1 font-medium">Tu último: 215 - Revisar</p>
                        </div>
                    </div>
                     <div class="mt-4 pt-4 border-t border-gray-200">
                        <a href="#" class="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center justify-center gap-2 transition-colors">
                            Ver todos los rangos
                            <iconify-icon icon="lucide:arrow-right"></iconify-icon>
                        </a>
                    </div>
                </div>

                <!-- Próximas Mediciones -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <iconify-icon icon="lucide:calendar-clock" class="text-orange-500"></iconify-icon>
                        Programadas
                    </h3>
                    <div class="space-y-3">
                         <div class="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-50/50">
                            <div class="flex items-center gap-2 mb-1">
                                <iconify-icon icon="lucide:droplet" class="text-blue-500 text-sm"></iconify-icon>
                                <span class="text-sm font-bold text-gray-900">Glucosa</span>
                            </div>
                            <p class="text-xs text-gray-500">Hoy, 08:00 PM</p>
                        </div>
                        <div class="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-50/50">
                             <div class="flex items-center gap-2 mb-1">
                                <iconify-icon icon="lucide:scale" class="text-orange-500 text-sm"></iconify-icon>
                                <span class="text-sm font-bold text-gray-900">Peso</span>
                            </div>
                            <p class="text-xs text-gray-500">Mañana, 07:00 AM</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>

    <!-- FAB -->
    <button class="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 z-30">
        <iconify-icon icon="lucide:plus" class="text-3xl"></iconify-icon>
    </button>
  </div>
</template>

<style scoped>
.tab-active {
    border-bottom: 2px solid theme('colors.orange.500');
    color: theme('colors.orange.500');
}
.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>

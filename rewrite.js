const fs = require('fs');

const content = `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/tiendaUsuario';
import ModalAcceso from '@/components/auth/ModalAcceso.vue';

const router = useRouter();
const userStore = useUserStore();

// UI State
const showSplash = ref(true);
const isRevealed = ref(false);
const currentTime = ref('--:--:--');
const showLoginModal = ref(false);

// Update clock
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('es-CL', { hour12: false });
};

onMounted(() => {
  // Check if user is already logged in
  if (userStore.isAuthenticated) {
    router.push('/home');
    return;
  }

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Animation sequence
  setTimeout(() => {
    showSplash.value = false;
    
    // Trigger reveals after splash lifts
    setTimeout(() => {
      isRevealed.value = true;
    }, 500);
  }, 2500);
});
</script>

<template>
  <div class="landing-container bg-[#F9FAFB] text-[#111827] min-h-screen font-sans overflow-x-hidden" :class="{ 'h-screen overflow-hidden': showSplash }">
    
    <!-- FASE 1: SPLASH SCREEN -->
    <div 
      class="fixed inset-0 z-50 bg-[#101010] flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)]"
      :class="showSplash ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="flex flex-col items-center gap-4 animate-pulse-logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="mask-splash">
              <rect width="24" height="24" fill="white"/>
              <line x1="-2" y1="20" x2="20" y2="-2" stroke="black" stroke-width="4.0"/>
            </mask>
          </defs>
          <path d="M12 1.5 L6.5 12 L12 22.5 L17.5 12 Z" fill="#8B5CF6" mask="url(#mask-splash)"/>
        </svg>
        <div class="text-6xl font-display text-[#FCFBE8] uppercase tracking-tight">
          MIO
        </div>
      </div>
      <div class="absolute bottom-16 w-48 h-[2px] bg-gray-800 overflow-hidden">
        <div class="h-full bg-purple-500 animate-load-bar"></div>
      </div>
    </div>

    <!-- FASE 2: LANDING PAGE -->
    <main class="min-h-screen px-6 py-8 md:px-12 md:py-12 max-w-[1600px] mx-auto">
      
      <header 
        class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-start border-b border-gray-200 pb-8 mb-8 transition-all duration-700 ease-out"
        :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="mask-header">
                <rect width="24" height="24" fill="white"/>
                <!-- Modo Claro: Cortes Centrados -->
                <line x1="2" y1="-2" x2="22" y2="18" stroke="black" stroke-width="3.2"/>
                <line x1="-6" y1="6" x2="14" y2="26" stroke="black" stroke-width="2.0"/>
              </mask>
            </defs>
            <path d="M12 1.5 L6.5 12 L12 22.5 L17.5 12 Z" fill="#8B5CF6" mask="url(#mask-header)"/>
          </svg>
          <span class="text-2xl font-display text-gray-900 uppercase leading-none mt-1">MIO</span>
        </div>

        <div class="text-[13px] leading-relaxed text-gray-600 font-medium md:col-span-1 pr-8">
          Ingeniería Informática y Desarrollo Web de alto nivel. Transformando lógicas complejas en interfaces y ecosistemas escalables para plataformas B2B.
          <div class="mt-4">
            <a href="#" class="text-gray-900 font-semibold underline underline-offset-4 decoration-gray-300 hover:decoration-purple-500 transition-colors">hello@mio.dev</a>
          </div>
        </div>

        <div class="text-[13px] text-gray-600 font-medium uppercase tracking-widest hidden md:block">
          Santiago, CL <br>
          <span class="text-gray-900 font-semibold">{{ currentTime }}</span>
        </div>

        <nav class="flex gap-6 text-[13px] font-semibold text-gray-900 justify-start md:justify-end uppercase tracking-widest">
          <a href="#" class="hover:text-purple-600 transition-colors">Proyectos</a>
          <a href="#" class="hover:text-purple-600 transition-colors">Stack</a>
          <a href="#" class="hover:text-purple-600 transition-colors">Info</a>
        </nav>
      </header>

      <!-- SECCIÓN: Infraestructura Médica Animada -->
      <section 
        class="[font-synthesis:none] text-[12px] leading-4 w-full flex flex-col lg:flex-row items-center justify-between pb-20 shrink-0 antialiased transition-all duration-700 ease-out delay-100 mt-4 overflow-hidden lg:overflow-visible"
        :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <!-- Texto Izquierdo (Acortado y estilo SaaS) -->
        <div class="w-full lg:w-[40%] z-10 mb-8 lg:mb-0">
          <div class="text-[52px] lg:text-[72px] xl:text-[84px] leading-[1.05] tracking-tight mt-0 mb-6 text-[#111827] font-sans">
              <span class="font-normal">Infraestructura</span><br />
              <span class="font-bold">de salud digital.</span>
          </div>
          <div class="text-[18px] lg:text-[20px] leading-[1.6] mt-0 mb-10 text-[#4B5563] font-sans mx-0 max-w-[480px]">
              Monitorea signos vitales y conecta dispositivos en minutos. Una plataforma robusta para unificar datos y prever riesgos en tiempo real.
          </div>
          <div class="flex flex-wrap items-center gap-4">
              <!-- Botón Morado de MIO Único -->
              <button @click="showLoginModal = true" class="flex items-center py-4 px-8 gap-3 bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all text-white cursor-pointer rounded-sm shadow-[0_8px_20px_-6px_rgba(139,92,246,0.6)]">
                  <span class="inline-block text-[16px] font-sans font-medium leading-none mt-0.5">Comenzar ahora</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                  </svg>
              </button>
          </div>
        </div>

        <!-- Gráfico Animado Derecho (Forzado a la derecha) -->
        <div class="w-full lg:w-[60%] h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[720px] relative flex items-center justify-center lg:justify-end">
            <!-- Wrapper de escala: Centrado en móviles, alineado a la derecha en escritorio -->
            <div class="w-[640px] h-[720px] flex justify-center items-center relative shrink-0 origin-center lg:origin-right scale-[0.6] sm:scale-75 lg:scale-[0.85] xl:scale-100">
                <svg width="100%" height="100%" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;">
                    
                    <!-- Patrón de puntos de fondo -->
                    <defs>
                        <pattern id="dot-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#E5E7EB" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dot-pattern)" />

                    <!-- Path 1 (Arriba Izquierda) -->
                    <path d="M 140 296 C 210 296, 240 360, 290 360" fill="none" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="250" stroke-dashoffset="250">
                        <animate attributeName="stroke-dashoffset" values="250;0" dur="1.5s" fill="freeze" />
                    </path>
                    <circle r="3.5" fill="#F59E0B">
                        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 140 296 C 210 296, 240 360, 290 360"/>
                    </circle>

                    <!-- Path 2 (Centro Izquierda) -->
                    <path d="M 140

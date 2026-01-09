<script setup>
import { onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  console.log('📊 Dashboard cargado - ¡Onboarding completado exitosamente!');
});

function volverAInicio() {
  router.push('/');
}

function irAOnboarding() {
  router.push('/onboarding');
}
</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-homa-primary to-homa-primary-light p-8 md:p-12 shadow-2xl shadow-teal-900/20 text-white">
      <div class="relative z-10 max-w-2xl">
        <h1 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Bienvenido a MIO</h1>
        <p class="text-teal-50 text-lg md:text-xl font-medium leading-relaxed mb-8">
          Tu sistema integral de monitoreo de salud. Mantén un seguimiento de tus métricas vitales y recibe insights personalizados.
        </p>
        <div class="flex flex-wrap gap-4">
          <Button 
            label="Ver Dashboard" 
            icon="pi pi-chart-line" 
            class="bg-white text-homa-primary border-none hover:bg-teal-50 px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/10 transition-transform active:scale-95"
          />
          <Button 
            label="Configurar Perfil" 
            icon="pi pi-cog" 
            class="bg-homa-primary-dark/30 text-white border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-medium backdrop-blur-sm transition-transform active:scale-95"
            @click="irAOnboarding"
          />
        </div>
      </div>
      
      <!-- Decorative Background Elements -->
      <div class="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
          <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71.3,35.1C60.4,47.3,49.9,58.1,37.6,65.6C25.3,73.1,11.2,77.3,-2.6,81.8C-16.4,86.3,-29.9,91.2,-41.8,85.6C-53.7,80,-64,63.9,-71.6,49.3C-79.2,34.7,-84.1,21.6,-83.4,8.9C-82.7,-3.8,-76.4,-16.1,-68.4,-27.4C-60.4,-38.7,-50.7,-49,-39.3,-57.4C-27.9,-65.8,-14.8,-72.3,0.2,-72.7C15.2,-73,30.5,-67.2,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>
    </div>

    <!-- Quick Actions Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Mediciones -->
      <div class="homa-card group cursor-pointer" @click="router.push('/mediciones')">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-homa-primary transition-colors">Mediciones</h3>
        <p class="text-gray-500 text-sm leading-relaxed">
          Visualiza tus datos de salud con gráficos intuitivos y análisis detallados de tu progreso.
        </p>
      </div>

      <!-- Recursos -->
      <div class="homa-card group cursor-pointer" @click="router.push('/recursos')">
        <div class="w-14 h-14 rounded-2xl bg-teal-50 text-homa-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-homa-primary transition-colors">Recursos</h3>
        <p class="text-gray-500 text-sm leading-relaxed">
          Accede a guías, artículos y recursos educativos sobre salud y bienestar validados por expertos.
        </p>
      </div>

      <!-- Perfil -->
      <div class="homa-card group cursor-pointer" @click="router.push('/perfil')">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-homa-primary transition-colors">Perfil</h3>
        <p class="text-gray-500 text-sm leading-relaxed">
          Gestiona tu información personal, configuraciones del sistema y preferencias de notificaciones.
        </p>
      </div>
    </div>


  </div>
</template>

<style scoped>
.dashboard-placeholder {
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0fdf4;
  border: 2px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-icon svg {
  color: #000000;
}

/* Animación de entrada */
.dashboard-placeholder {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
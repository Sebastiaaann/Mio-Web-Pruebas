<script setup>
import { onMounted } from 'vue';
import Card from 'primevue/card';

// Opcional: efectos de entrada o configuraciones
onMounted(() => {
  console.log('🏠 Paso de bienvenida cargado');
});
</script>

<template>
  <div class="paso-bienvenida">
    <Card class="welcome-card border-none shadow-none">
      <template #header>
        <div class="text-center py-8">
          <div class="welcome-icon mb-6">
            <!-- Icono minimalista de corazón/salud -->
            <div class="heart-icon mx-auto">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M20.84 4.61c-1.5-1.07-3.46-1.33-5.19-.69L12 5.69 8.35 3.92c-1.73-.64-3.69-.38-5.19.69-1.94 1.38-2.34 4.15-.89 6.35l6.96 8.84c.68.86 1.98.86 2.66 0l6.96-8.84c1.45-2.2 1.05-4.97-.89-6.35z"
                  stroke="#000000" 
                  stroke-width="1.5" 
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <div class="text-center space-y-6">
          <!-- Mensaje principal -->
          <div>
            <h2 class="text-2xl font-bold text-black mb-4">
              Queremos cuidarte
            </h2>
            <p class="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Bienvenido a HOMA, tu plataforma integral de monitoreo de salud. 
              Estamos aquí para acompañarte en tu viaje hacia una vida más saludable.
            </p>
          </div>

          <!-- Beneficios destacados -->
          <div class="grid md:grid-cols-3 gap-6 mt-8">
            <div class="benefit-item">
              <div class="benefit-icon mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    stroke="#000000" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h4 class="font-semibold text-black mb-2">Monitoreo Personalizado</h4>
              <p class="text-sm text-gray-600">
                Seguimiento adaptado a tus condiciones de salud específicas
              </p>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    stroke="#000000" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h4 class="font-semibold text-black mb-2">Análisis Inteligente</h4>
              <p class="text-sm text-gray-600">
                Reportes y tendencias que te ayudan a tomar mejores decisiones
              </p>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" 
                    stroke="#000000" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h4 class="font-semibold text-black mb-2">Control Total</h4>
              <p class="text-sm text-gray-600">
                Tú decides qué monitorear y cómo recibir las alertas
              </p>
            </div>
          </div>

          <!-- Información del proceso -->
          <div class="process-info mt-8 p-6 bg-gray-50 rounded-lg border">
            <h4 class="font-semibold text-black mb-3">¿Qué vamos a hacer?</h4>
            <div class="text-left space-y-2 max-w-lg mx-auto">
              <div class="flex items-center">
                <span class="w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center mr-3">1</span>
                <span class="text-sm text-gray-700">Recopilaremos tus datos personales básicos</span>
              </div>
              <div class="flex items-center">
                <span class="w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center mr-3">2</span>
                <span class="text-sm text-gray-700">Configuraremos tu perfil de salud y hábitos</span>
              </div>
              <div class="flex items-center">
                <span class="w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center mr-3">3</span>
                <span class="text-sm text-gray-700">¡Listo! Tu plataforma HOMA estará configurada</span>
              </div>
            </div>
          </div>

          <!-- Tiempo estimado -->
          <div class="text-center mt-6">
            <p class="text-sm text-gray-500">
              <i class="pi pi-clock mr-2"></i>
              Tiempo estimado: 3-5 minutos
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.paso-bienvenida {
  max-width: 64rem;
  margin-left: auto;
  margin-right: auto;
}

.welcome-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
}

.heart-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background-color: #f9fafb;
  border-width: 2px;
  border-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.heart-icon:hover {
  border-color: #000000;
  background-color: #f3f4f6;
  transform: scale(1.05);
}

.benefit-item {
  text-align: center;
}

.benefit-icon {
  display: flex;
  justify-content: center;
}

.process-info {
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
}

/* Animaciones de entrada */
.paso-bienvenida {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.benefit-item {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.benefit-item:nth-child(1) { animation-delay: 0.1s; }
.benefit-item:nth-child(2) { animation-delay: 0.2s; }
.benefit-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
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
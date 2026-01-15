<script setup>
/**
 * MensajesView - Vista de bandeja de mensajes
 * Muestra estado "No disponible" con ilustración del robot
 * Migrado a shadcn-vue
 */
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import MioRobot from '@/components/ui/MioRobot.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function volverAlDashboard() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="mensajes-view min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <!-- Robot Mascota -->
    <MioRobot 
      size="xl" 
      mood="thinking" 
      :animate="true"
      :showBubble="true"
      bubbleIcon="pi pi-envelope"
      class="mb-8"
    />
    
    <!-- Mensaje -->
    <div class="max-w-md">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
        Bandeja de Mensajes
      </h1>
      <p class="text-gray-500 text-lg mb-6">
        No disponible por el momento
      </p>
      
      
      <!-- Botón de acción -->
      <Button 
        class="px-6 py-3 rounded-xl"
        @click="volverAlDashboard"
      >
        <ArrowLeft class="mr-2 h-4 w-4" />
        Volver al Dashboard
      </Button>
    </div>
    
    <!-- Decoración de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full opacity-30 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl" />
    </div>
  </div>
</template>

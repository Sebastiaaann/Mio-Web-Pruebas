<script setup>
import { Construction, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-neutral-900">
    <div class="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
      <Construction class="w-12 h-12 text-orange-500" />
    </div>
    
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      En Construcción
    </h1>
    
    <p class="text-gray-500 dark:text-gray-400 max-w-md mb-8">
      Estamos trabajando arduamente para traerte esta funcionalidad pronto. ¡Gracias por tu paciencia!
    </p>
    
    <Button 
      @click="router.back()" 
      class="gap-2 bg-gray-900 text-white hover:bg-gray-800"
    >
      <ArrowLeft class="w-4 h-4" />
      Volver
    </Button>
  </div>
</template>

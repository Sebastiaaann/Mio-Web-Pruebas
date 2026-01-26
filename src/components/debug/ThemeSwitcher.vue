<script setup>
import { useConfigStore } from '@/stores/tiendaConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Palette, Check } from 'lucide-vue-next'

const configStore = useConfigStore()

const themes = [
    { id: 'homa', name: 'Homa (Default)', color: '#7D58E9' },
    { id: 'mutual', name: 'Mutual de Seguridad', color: '#C4D600' }
]
</script>

<template>
  <Card class="mb-8 border-dashed border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
      <CardContent class="p-4 flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-3">
              <div class="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Palette class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                  <h3 class="font-bold text-sm text-gray-900 dark:text-gray-100">Simulador de Branding</h3>
                  <p class="text-xs text-gray-500">Prueba cómo se ve la app con distintos clientes</p>
              </div>
          </div>

          <div class="flex gap-2">
              <Button 
                v-for="theme in themes" 
                :key="theme.id"
                variant="outline"
                size="sm"
                class="flex items-center gap-2 transition-all"
                :class="{ 
                    'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20': configStore.clientBrand === theme.id 
                }"
                @click="configStore.loadPreset(theme.id)"
              >
                  <span 
                    class="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                    :style="{ backgroundColor: theme.color }"
                  ></span>
                  {{ theme.name }}
                  <Check v-if="configStore.clientBrand === theme.id" class="w-3 h-3 ml-1 text-indigo-600" />
              </Button>
          </div>
      </CardContent>
  </Card>
</template>

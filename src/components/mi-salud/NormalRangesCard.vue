<script setup lang="ts">
import { Activity, Droplet, Scale, Thermometer, Heart } from 'lucide-vue-next'

const rangos = [
  {
    id: 'presion',
    nombre: 'Presión arterial',
    icono: Heart,
    color: 'text-red-500',
    campos: [
      { etiqueta: 'Max Systolic', valor: '160' },
      { etiqueta: 'Min Systolic', valor: '90' },
      { etiqueta: 'Max Diastolic', valor: '100' },
      { etiqueta: 'Min Diastolic', valor: '60' },
      { etiqueta: 'Max bpm', valor: '100' },
      { etiqueta: 'Min bpm', valor: '60' }
    ]
  },
  {
    id: 'glicemia',
    nombre: 'Glicemia',
    icono: Droplet,
    color: 'text-blue-500',
    campos: [
      { etiqueta: 'Max glucose', valor: '140' },
      { etiqueta: 'Min glucose', valor: '71' }
    ]
  },
  {
    id: 'peso',
    nombre: 'Peso',
    icono: Scale,
    color: 'text-orange-500',
    campos: [
      { etiqueta: 'Max weight', valor: '100' },
      { etiqueta: 'Min weight', valor: '80' },
      { etiqueta: 'Max height', valor: '250' },
      { etiqueta: 'Min height', valor: '30' },
      { etiqueta: 'Max IMC', valor: '25' },
      { etiqueta: 'Min IMC', valor: '18' }
    ]
  },
  {
    id: 'temperatura',
    nombre: 'Temperatura',
    icono: Thermometer,
    color: 'text-red-400',
    campos: [
      { etiqueta: 'Max temperature', valor: '37.5' },
      { etiqueta: 'Min temperature', valor: '36' }
    ]
  },
  {
    id: 'saturacion',
    nombre: 'Saturación',
    icono: Heart,
    color: 'text-cyan-500',
    campos: [
      { etiqueta: 'Max bpm', valor: '100' },
      { etiqueta: 'Min bpm', valor: '55' },
      { etiqueta: 'Max SPO2', valor: '100' },
      { etiqueta: 'Min SPO2', valor: '90' }
    ]
  }
]
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2 font-display">
      <iconify-icon icon="lucide:clipboard-check" class="text-gray-400"></iconify-icon>
      Rangos Normales
    </h3>
    
    <div class="space-y-6">
      <div 
        v-for="rango in rangos" 
        :key="rango.id"
        class="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0"
      >
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <!-- Nombre del rango -->
          <div class="sm:w-48 flex-shrink-0">
            <div class="flex items-center gap-2">
              <component :is="rango.icono" :class="['w-5 h-5', rango.color]" />
              <span class="text-lg font-semibold text-gray-900">{{ rango.nombre }}</span>
            </div>
          </div>
          
          <!-- Grid de campos -->
          <div class="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4">
            <div 
              v-for="(campo, index) in rango.campos" 
              :key="index"
              class="relative"
            >
              <div class="border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <label class="block text-xs text-gray-500 mb-1">{{ campo.etiqueta }}</label>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-medium text-gray-700">{{ campo.valor }}</span>
                  <iconify-icon icon="lucide:info" class="w-4 h-4 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

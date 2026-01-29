<script setup>
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2 font-display">
          <iconify-icon icon="lucide:clipboard-check" class="text-gray-400"></iconify-icon>
          Rangos Normales
      </h3>
      <div class="space-y-4">
          <div class="border-l-4 border-emerald-500 p-4 bg-gray-50 rounded-r-lg">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">Presión Arterial</span>
                  <iconify-icon icon="lucide:check-circle" class="text-emerald-500 text-lg"></iconify-icon>
              </div>
              <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono font-bold text-gray-900">90/60</span>
                  <span class="text-gray-400">-</span>
                  <span class="font-mono font-bold text-gray-900">120/80</span>
                  <span class="text-xs text-gray-500">mmHg</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Tu última: 118/78</p>
          </div>

          <div class="border-l-4 border-emerald-500 p-4 bg-gray-50 rounded-r-lg">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">Glucosa en Ayunas</span>
                  <iconify-icon icon="lucide:check-circle" class="text-emerald-500 text-lg"></iconify-icon>
              </div>
              <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono font-bold text-gray-900">70</span>
                  <span class="text-gray-400">-</span>
                  <span class="font-mono font-bold text-gray-900">100</span>
                  <span class="text-xs text-gray-500">mg/dL</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Tu última: 94</p>
          </div>

          <div class="border-l-4 border-emerald-500 p-4 bg-gray-50 rounded-r-lg">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">IMC</span>
                  <iconify-icon icon="lucide:check-circle" class="text-emerald-500 text-lg"></iconify-icon>
              </div>
              <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono font-bold text-gray-900">18.5</span>
                  <span class="text-gray-400">-</span>
                  <span class="font-mono font-bold text-gray-900">24.9</span>
                  <span class="text-xs text-gray-500">kg/m²</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Tu IMC: 22.4</p>
          </div>

           <div class="border-l-4 border-emerald-500 p-4 bg-gray-50 rounded-r-lg">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">Frecuencia Card.</span>
                  <iconify-icon icon="lucide:check-circle" class="text-emerald-500 text-lg"></iconify-icon>
              </div>
              <div class="flex items-center gap-2 text-sm">
                  <span class="font-mono font-bold text-gray-900">60</span>
                  <span class="text-gray-400">-</span>
                  <span class="font-mono font-bold text-gray-900">100</span>
                  <span class="text-xs text-gray-500">lpm</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Tu promedio: 72</p>
          </div>

          <div class="border-l-4 border-amber-500 p-4 bg-gray-50 rounded-r-lg">
              <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold text-gray-900">Colesterol Total</span>
                  <iconify-icon icon="lucide:alert-circle" class="text-amber-500 text-lg"></iconify-icon>
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
</template>

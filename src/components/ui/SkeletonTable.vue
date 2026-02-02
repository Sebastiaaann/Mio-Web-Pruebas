<script setup lang="ts">
/**
 * SkeletonTable - Componente de skeleton para tablas de carga
 * 
 * Muestra una animación de pulso mientras se cargan los datos de la tabla.
 * Diseñado para simular la estructura de MeasurementHistoryTable.
 */

interface Props {
  /** Número de filas a mostrar en el skeleton */
  rows?: number
  /** Número de columnas a mostrar */
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 5
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <!-- Header skeleton -->
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <div class="h-6 w-48 bg-gray-200 rounded"></div>
      <div class="h-8 w-24 bg-gray-200 rounded"></div>
    </div>

    <!-- Tabla skeleton -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <!-- Header de columnas -->
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="col in columns" 
              :key="`header-${col}`"
              class="px-6 py-3"
            >
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </th>
          </tr>
        </thead>

        <!-- Filas de datos -->
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in rows" :key="`row-${row}`">
            <!-- Primera columna: Fecha -->
            <td class="px-6 py-4">
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded w-20"></div>
                <div class="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </td>

            <!-- Segunda columna: Tipo -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded bg-gray-200"></div>
                <div class="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </td>

            <!-- Tercera columna: Valor -->
            <td class="px-6 py-4">
              <div class="flex items-baseline gap-1">
                <div class="h-6 bg-gray-200 rounded w-12"></div>
                <div class="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </td>

            <!-- Cuarta columna: Estado -->
            <td class="px-6 py-4">
              <div class="h-6 bg-gray-200 rounded-full w-20"></div>
            </td>

            <!-- Quinta columna: Acciones -->
            <td class="px-6 py-4 text-right">
              <div class="h-8 w-8 bg-gray-200 rounded-full ml-auto"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LimitErrores - Componente de límite de errores (Error Boundary) para Vue 3.
 * Captura errores no manejados en el árbol de componentes hijo y muestra
 * una UI de recuperación en lugar de romper toda la aplicación.
 *
 * Uso:
 *   <LimitErrores>
 *     <RouterView />
 *   </LimitErrores>
 */

import { ref, onErrorCaptured } from 'vue'
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'

const hayError = ref(false)
const mensajeError = ref('')
const detalleError = ref('')

/**
 * Captura cualquier error que burbujee desde los componentes hijos.
 * Retornar `false` evita que el error se propague más arriba.
 */
onErrorCaptured((error: unknown, _instance, info: string) => {
  hayError.value = true

  if (error instanceof Error) {
    mensajeError.value = error.message
    detalleError.value = `${info}\n${error.stack || ''}`
  } else {
    mensajeError.value = String(error)
    detalleError.value = info
  }

  // Log del error para diagnóstico
  console.error('[LimitErrores] Error capturado:', error, '\nInfo:', info)

  // Retornar false para detener la propagación
  return false
})

/**
 * Recarga la página para reintentar desde un estado limpio.
 */
function recargarPagina() {
  window.location.reload()
}

/**
 * Intenta recuperarse restableciendo el estado de error sin recargar.
 */
function intentarRecuperar() {
  hayError.value = false
  mensajeError.value = ''
  detalleError.value = ''
}
</script>

<template>
  <!-- Estado de error -->
  <div
    v-if="hayError"
    class="min-h-screen flex items-center justify-center bg-gray-50 p-6"
    role="alert"
    aria-live="assertive"
  >
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center space-y-6">
      <!-- Icono -->
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle class="w-8 h-8 text-red-500" aria-hidden="true" />
        </div>
      </div>

      <!-- Título y descripción -->
      <div class="space-y-2">
        <h1 class="text-xl font-semibold text-gray-900">
          Algo salió mal
        </h1>
        <p class="text-sm text-gray-500">
          Ocurrió un error inesperado en la aplicación. Puedes intentar recuperarte
          o recargar la página para continuar.
        </p>
      </div>

      <!-- Mensaje de error (visible solo en desarrollo) -->
      <details
        v-if="mensajeError"
        class="text-left bg-gray-50 rounded-lg p-3 cursor-pointer"
      >
        <summary class="text-xs font-medium text-gray-500 select-none">
          Detalle del error
        </summary>
        <p class="mt-2 text-xs text-red-600 font-mono break-all whitespace-pre-wrap">
          {{ mensajeError }}
        </p>
      </details>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          @click="intentarRecuperar"
          class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Intentar recuperar
        </button>
        <button
          type="button"
          @click="recargarPagina"
          class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          <RefreshCw class="w-4 h-4" aria-hidden="true" />
          Recargar página
        </button>
      </div>
    </div>
  </div>

  <!-- Contenido normal -->
  <slot v-else />
</template>

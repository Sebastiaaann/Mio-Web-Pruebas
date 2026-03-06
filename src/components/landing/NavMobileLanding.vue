<script setup lang="ts">
/**
 * Menú de navegación móvil para la landing page.
 * Se abre mediante un botón hamburguesa en el header.
 * Usa Teleport para montar el overlay al nivel del body.
 */
import { ChevronDown } from 'lucide-vue-next'
import { ref } from 'vue'
import { enlacesNavegacion, esGrupo } from './NavLinksLanding'
import type { GrupoNavegacion } from './NavLinksLanding'

interface Props {
  abierto: boolean
  isDark: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ cerrar: [] }>()

// Grupos expandidos dentro del menú móvil
const gruposExpandidos = ref<Set<number>>(new Set())

function alternarGrupo(i: number) {
  if (gruposExpandidos.value.has(i)) {
    gruposExpandidos.value.delete(i)
  } else {
    gruposExpandidos.value.add(i)
  }
  // Forzar reactividad
  gruposExpandidos.value = new Set(gruposExpandidos.value)
}

function cerrar() {
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- Overlay oscuro -->
      <div
        v-if="props.abierto"
        class="fixed inset-0 z-40 md:hidden"
        aria-hidden="true"
        @click="cerrar"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <!-- Panel del menú -->
      <div
        v-if="props.abierto"
        class="fixed top-0 left-0 right-0 z-50 md:hidden rounded-b-2xl shadow-2xl border-b overflow-y-auto max-h-[90dvh]"
        :class="props.isDark
          ? 'bg-[#1A1033]/97 border-white/10'
          : 'bg-white/97 border-gray-200/80'"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <!-- Cabecera del panel (espacio para el header real que está encima) -->
        <div class="h-[72px]" />

        <div class="px-4 pb-6 space-y-1">
          <template v-for="(item, i) in enlacesNavegacion" :key="i">
            <!-- Enlace simple -->
            <a
              v-if="!esGrupo(item)"
              :href="item.href"
              class="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              :class="props.isDark
                ? 'text-gray-200 hover:bg-white/5 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
              @click="cerrar"
            >
              {{ item.etiqueta }}
            </a>

            <!-- Grupo con acordeón -->
            <div v-else>
              <button
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                :class="props.isDark
                  ? 'text-gray-200 hover:bg-white/5'
                  : 'text-gray-700 hover:bg-gray-100'"
                @click="alternarGrupo(i)"
              >
                {{ item.etiqueta }}
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="gruposExpandidos.has(i) ? 'rotate-180' : ''"
                />
              </button>

              <Transition
                enter-active-class="transition-all duration-200 ease-out overflow-hidden"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[600px]"
                leave-active-class="transition-all duration-150 ease-in overflow-hidden"
                leave-from-class="opacity-100 max-h-[600px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="gruposExpandidos.has(i)" class="pl-4 mt-1 space-y-0.5">
                  <a
                    v-for="enlace in (item as GrupoNavegacion).items"
                    :key="enlace.href"
                    :href="enlace.href"
                    class="flex flex-col px-4 py-2.5 rounded-xl transition-colors"
                    :class="props.isDark
                      ? 'text-gray-300 hover:bg-white/5'
                      : 'text-gray-600 hover:bg-purple-50'"
                    @click="cerrar"
                  >
                    <span class="text-sm font-medium">{{ enlace.etiqueta }}</span>
                    <span
                      class="text-xs mt-0.5"
                      :class="props.isDark ? 'text-gray-500' : 'text-gray-400'"
                    >
                      {{ enlace.descripcion }}
                    </span>
                  </a>

                  <!-- Items secundarios -->
                  <template v-if="(item as GrupoNavegacion).itemsSecundarios?.length">
                    <hr
                      class="my-1 mx-4"
                      :class="props.isDark ? 'border-white/10' : 'border-gray-100'"
                    />
                    <div class="flex flex-wrap gap-1 px-4 pb-1">
                      <a
                        v-for="sec in (item as GrupoNavegacion).itemsSecundarios"
                        :key="sec.href"
                        :href="sec.href"
                        class="text-xs px-3 py-1.5 rounded-full transition-colors"
                        :class="props.isDark
                          ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                        @click="cerrar"
                      >
                        {{ sec.etiqueta }}
                      </a>
                    </div>
                  </template>
                </div>
              </Transition>
            </div>
          </template>

          <!-- CTAs móviles -->
          <div class="pt-4 flex flex-col gap-2">
            <a
              href="/auth"
              class="block w-full text-center px-6 py-3 text-sm font-medium rounded-full border transition-colors"
              :class="props.isDark
                ? 'border-gray-600 text-gray-200 hover:border-purple-500 hover:text-purple-300'
                : 'border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-700'"
              @click="cerrar"
            >
              Ingresar
            </a>
            <a
              href="/auth"
              class="block w-full text-center px-6 py-3 text-sm font-semibold bg-[#8B5CF6] text-white rounded-full hover:bg-[#7C3AED] transition-colors shadow-lg shadow-purple-500/25"
              @click="cerrar"
            >
              Comenzar →
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

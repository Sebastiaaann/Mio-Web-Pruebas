<script setup lang="ts">
/**
 * Navegación de escritorio para la landing page.
 * Muestra los grupos como dropdowns accesibles al hacer hover/focus.
 */
import { ref } from 'vue'
import { ChevronDown, Activity, Gift, Clock, Calendar, MessageCircle, Users, Heart, Building2 } from 'lucide-vue-next'
import { enlacesNavegacion, esGrupo } from './NavLinksLanding'
import type { GrupoNavegacion } from './NavLinksLanding'

interface Props {
  isDark?: boolean
}
const props = withDefaults(defineProps<Props>(), { isDark: false })

const iconos: Record<string, unknown> = {
  activity: Activity,
  gift: Gift,
  clock: Clock,
  calendar: Calendar,
  'message-circle': MessageCircle,
  users: Users,
  heart: Heart,
  'building-2': Building2,
}

// Índice del dropdown actualmente abierto
const grupoAbierto = ref<number | null>(null)

// Refs de cada contenedor de grupo para verificar relatedTarget en focusout
const refsContenedor: HTMLElement[] = []
function registrarContenedor(el: unknown, i: number) {
  if (el instanceof HTMLElement) refsContenedor[i] = el
}

function abrirGrupo(i: number) {
  grupoAbierto.value = i
}

/**
 * Cierra el grupo solo si el foco/cursor sale completamente del contenedor.
 * Handler compartido de mouseleave y focusout.
 * Con focusout, relatedTarget es el elemento que recibe el foco;
 * si sigue dentro del mismo contenedor, no cerramos.
 */
function manejarSalida(evento: FocusEvent | MouseEvent, i: number) {
  if (evento instanceof FocusEvent) {
    const contenedor = refsContenedor[i]
    const destino = evento.relatedTarget as Node | null
    if (contenedor && destino && contenedor.contains(destino)) return
  }
  grupoAbierto.value = null
}
</script>

<template>
  <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
    <template v-for="(item, i) in enlacesNavegacion" :key="i">
      <!-- Item simple (sin dropdown) -->
      <a
        v-if="!esGrupo(item)"
        :href="item.href"
        class="px-4 py-2 text-sm font-medium rounded-full transition-colors hover:text-[#8B5CF6]"
        :class="props.isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100/60'"
      >
        {{ item.etiqueta }}
      </a>

      <!-- Grupo con dropdown -->
      <div
        v-else
        :ref="(el) => registrarContenedor(el, i)"
        class="relative"
        @mouseenter="abrirGrupo(i)"
        @mouseleave="manejarSalida($event as MouseEvent, i)"
        @focusin="abrirGrupo(i)"
        @focusout="manejarSalida($event as FocusEvent, i)"
      >
        <button
          class="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors hover:text-[#8B5CF6]"
          :class="props.isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100/60'"
          :aria-expanded="grupoAbierto === i"
          :aria-haspopup="true"
          type="button"
        >
          {{ item.etiqueta }}
          <ChevronDown
            class="w-3.5 h-3.5 transition-transform duration-200"
            :class="grupoAbierto === i ? 'rotate-180' : ''"
          />
        </button>

        <!-- Panel dropdown -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-show="grupoAbierto === i"
            class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl shadow-xl border p-3 z-50"
            :class="props.isDark
              ? 'bg-[#1A1033]/95 border-white/10 backdrop-blur-xl'
              : 'bg-white/95 border-gray-200/80 backdrop-blur-xl'"
          >
            <!-- Items principales -->
            <ul class="space-y-0.5">
              <li v-for="enlace in (item as GrupoNavegacion).items" :key="enlace.href">
                <a
                  :href="enlace.href"
                  class="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                  :class="props.isDark
                    ? 'hover:bg-white/5 text-gray-300'
                    : 'hover:bg-purple-50 text-gray-700'"
                >
                  <span
                    class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="props.isDark
                      ? 'bg-purple-900/40 text-purple-400 group-hover:bg-purple-800/50'
                      : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'"
                  >
                    <component :is="iconos[enlace.icono ?? '']" class="w-4 h-4" />
                  </span>
                  <span>
                    <span class="block text-sm font-medium leading-snug">{{ enlace.etiqueta }}</span>
                    <span
                      class="block text-xs mt-0.5 leading-snug"
                      :class="props.isDark ? 'text-gray-500' : 'text-gray-400'"
                    >
                      {{ enlace.descripcion }}
                    </span>
                  </span>
                </a>
              </li>
            </ul>

            <!-- Separador + items secundarios -->
            <template v-if="(item as GrupoNavegacion).itemsSecundarios?.length">
              <hr
                class="my-2"
                :class="props.isDark ? 'border-white/10' : 'border-gray-100'"
              />
              <div class="flex flex-wrap gap-1 px-1">
                <a
                  v-for="sec in (item as GrupoNavegacion).itemsSecundarios"
                  :key="sec.href"
                  :href="sec.href"
                  class="text-xs px-3 py-1.5 rounded-full transition-colors"
                  :class="props.isDark
                    ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                >
                  {{ sec.etiqueta }}
                </a>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </template>
  </nav>
</template>

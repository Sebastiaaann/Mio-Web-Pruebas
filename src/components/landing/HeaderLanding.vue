<script setup lang="ts">
/**
 * Header principal de la landing page de Mio+.
 *
 * Responsabilidades:
 * - Muestra el logo (LogoMio), la navegación desktop y los CTAs
 * - Aplica blur + borde al hacer scroll (via useScroll)
 * - Gestiona el menú móvil
 * - Integra el toggle de tema oscuro/claro (AlternarTema)
 *
 * El estado de tema (isDark) sube por emit al padre (LandingMio.vue)
 * para mantener un único source of truth.
 */
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { useScroll } from '@/composables/useScroll'
import AlternarTema from '@/components/ui/AlternarTema.vue'
import NavDesktopLanding from './NavDesktopLanding.vue'
import NavMobileLanding from './NavMobileLanding.vue'

interface Props {
  isDark: boolean
  isRevealed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRevealed: true,
})

const emit = defineEmits<{
  toggleTema: []
}>()

// Scroll: aplica efecto de cristal al pasar 40px
const estaScrolleado = useScroll(40, 10)

// Estado del menú móvil
const menuMovilAbierto = ref(false)

function toggleMenuMovil() {
  menuMovilAbierto.value = !menuMovilAbierto.value
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-30 transition-all duration-700 ease-out"
    :class="[
      props.isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
      estaScrolleado
        ? props.isDark
          ? 'bg-[#1A1033]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
        : 'bg-transparent'
    ]"
  >
    <div class="flex items-center justify-between px-6 md:px-12 py-4">
      <!-- Logo -->
      <a href="/" aria-label="Mio+ inicio" class="flex-shrink-0 flex items-center gap-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
          <defs>
            <mask id="mio-logo-mask-header">
              <rect width="24" height="24" fill="#fff"/>
              <line x1="-2" y1="20" x2="20" y2="-2" stroke="#000" stroke-width="4.0"/>
            </mask>
          </defs>
          <path d="M12 2 L3 12 L12 22 L21 12 Z" fill="#8B5CF6" :mask="'url(#mio-logo-mask-header)'" />
        </svg>
        <span
          class="text-2xl font-bold tracking-tight leading-none whitespace-nowrap select-none"
          :class="props.isDark ? 'text-white' : 'text-gray-900'"
        >
          MIO
        </span>
      </a>

      <!-- Lado derecho: navegación + controles -->
      <div class="flex items-center gap-2">
        <!-- Navegación desktop -->
        <NavDesktopLanding :isDark="props.isDark" />

        <!-- Separador visual -->
        <div class="hidden md:block w-px h-5 mx-1" :class="props.isDark ? 'bg-white/10' : 'bg-gray-200'" />

        <!-- Toggle de tema -->
        <AlternarTema :isDark="props.isDark" @toggle="emit('toggleTema')" />

        <!-- CTA "Ingresar" — solo desktop -->
        <a
          href="/auth"
          class="hidden sm:inline-flex items-center text-sm font-medium px-4 py-2 rounded-full transition-colors"
          :class="props.isDark
            ? 'text-gray-300 hover:text-white hover:bg-white/5'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'"
        >
          Ingresar
        </a>

        <!-- CTA "Comenzar" — siempre visible -->
        <a
          href="/auth"
          class="inline-flex items-center text-sm font-semibold px-5 py-2.5 bg-[#8B5CF6] text-white rounded-full hover:bg-[#7C3AED] transition-all shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95"
        >
          Comenzar
        </a>

        <!-- Botón hamburguesa — solo móvil -->
        <button
          class="md:hidden ml-1 p-2 rounded-full transition-colors"
          :class="props.isDark
            ? 'text-gray-300 hover:bg-white/10'
            : 'text-gray-600 hover:bg-gray-100'"
          :aria-label="menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'"
          :aria-expanded="menuMovilAbierto"
          @click="toggleMenuMovil"
        >
          <Transition
            enter-active-class="transition-all duration-150"
            enter-from-class="opacity-0 rotate-90 scale-75"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 -rotate-90 scale-75"
            mode="out-in"
          >
            <X v-if="menuMovilAbierto" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </Transition>
        </button>
      </div>
    </div>
  </header>

  <!-- Menú móvil (usa Teleport internamente) -->
  <NavMobileLanding
    :abierto="menuMovilAbierto"
    :isDark="props.isDark"
    @cerrar="menuMovilAbierto = false"
  />
</template>

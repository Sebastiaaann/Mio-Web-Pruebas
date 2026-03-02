<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import AlternarTema from '@/components/ui/AlternarTema.vue'

const router = useRouter()
const userStore = useUserStore()

// Animación de entrada
const isRevealed = ref(false)

// Dark mode
const isDark = ref(false)

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/home')
    return
  }

  const savedTheme = localStorage.getItem('mio-theme')
  isDark.value = savedTheme === 'dark'
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // Fade-in sutil del contenido (sin splash negro)
  setTimeout(() => {
    isRevealed.value = true
  }, 100)
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  localStorage.setItem('mio-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

const irAlAuth = () => router.push('/auth')
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col relative overflow-x-hidden transition-colors duration-300 font-sans"
    :class="isDark ? 'bg-[#1A1033] text-[#F3F4F6]' : 'bg-[#FDFBFF] text-[#1F2937]'"
  >
    <!-- Fondo: gradiente radial púrpura -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-gradient-custom transition-opacity duration-1000"></div>
    </div>

    <!-- NAVBAR -->
    <nav
      class="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 ease-out"
      :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <defs>
            <mask id="mask-nav">
              <rect width="24" height="24" fill="white"/>
              <line x1="2" y1="-2" x2="22" y2="18" stroke="black" stroke-width="3.2"/>
              <line x1="-6" y1="6" x2="14" y2="26" stroke="black" stroke-width="2.0"/>
            </mask>
          </defs>
          <path d="M12 1.5 L6.5 12 L12 22.5 L17.5 12 Z" fill="#8B5CF6" mask="url(#mask-nav)"/>
        </svg>
        <span class="text-xl font-bold text-[#8B5CF6] tracking-tight">
          Mio<sup class="text-sm">+</sup>
        </span>
      </div>

      <!-- Links de navegación (desktop) -->
      <div
        class="hidden md:flex items-center gap-8 text-sm font-medium"
        :class="isDark ? 'text-gray-300' : 'text-gray-600'"
      >
        <a href="#caracteristicas" class="hover:text-[#8B5CF6] transition-colors">Características</a>
        <a href="#controles" class="hover:text-[#8B5CF6] transition-colors">Controles</a>
        <a href="#clinica" class="hover:text-[#8B5CF6] transition-colors">Clínica</a>
      </div>

      <!-- CTAs navbar + toggle tema -->
      <div class="flex items-center gap-3">
        <AlternarTema :isDark="isDark" @toggle="toggleDarkMode" />
        <button
          @click="irAlAuth"
          class="hidden sm:block text-sm font-medium px-4 py-2 rounded-full transition-colors"
          :class="isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
        >
          Iniciar Sesión
        </button>
        <button
          @click="irAlAuth"
          class="text-sm font-semibold px-5 py-2.5 bg-[#8B5CF6] text-white rounded-full hover:bg-[#7C3AED] transition-all shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95"
        >
          Registrarse →
        </button>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <main class="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-0 md:pt-16">

      <!-- Badge -->
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border transition-all duration-700 delay-100"
        :class="[
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          isDark
            ? 'bg-purple-900/30 border-purple-700/40 text-purple-300'
            : 'bg-purple-50 border-purple-200 text-purple-700'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
        Plataforma de salud preventiva · AccuHealth
      </div>

      <!-- Headline -->
      <h1
        class="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6 transition-all duration-700 delay-150"
        :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        Tu salud,<br>
        <span class="text-[#8B5CF6]">siempre contigo.</span>
      </h1>

      <!-- Subtítulo -->
      <p
        class="text-base md:text-lg max-w-xl mb-10 leading-relaxed transition-all duration-700 delay-200"
        :class="[
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          isDark ? 'text-gray-400' : 'text-gray-500'
        ]"
      >
        Monitorea tus métricas en tiempo real, agenda controles preventivos
        y conecta con especialistas desde un solo lugar.
      </p>

      <!-- CTAs Hero -->
      <div
        class="flex flex-col sm:flex-row gap-3 mb-16 transition-all duration-700 delay-300"
        :class="isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <button
          @click="irAlAuth"
          class="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-full transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
        >
          Iniciar Sesión →
        </button>
        <button
          @click="irAlAuth"
          class="px-8 py-3.5 font-semibold rounded-full transition-all border hover:scale-105 active:scale-95"
          :class="isDark
            ? 'bg-transparent border-gray-600 text-gray-200 hover:border-purple-500 hover:text-purple-300'
            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-700'"
        >
          Registrarse gratis
        </button>
      </div>

      <!-- Screenshot de la App -->
      <div
        class="w-full max-w-5xl mx-auto transition-all duration-700 delay-400"
        :class="isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'"
      >
        <div
          class="rounded-2xl overflow-hidden border shadow-2xl"
          :class="isDark
            ? 'border-white/10 shadow-black/50'
            : 'border-gray-200/80 shadow-purple-900/10'"
        >
          <img
            src="/assets/screenshot_mi_salud.png"
            alt="Vista Mi Salud — Mio+"
            class="w-full h-auto block"
            loading="eager"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-gradient-custom {
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(237, 233, 254, 0.8) 0%,
      rgba(255, 255, 255, 0) 40%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(237, 233, 254, 0.8) 0%,
      rgba(255, 255, 255, 0) 40%
    );
}

.dark .bg-gradient-custom {
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(139, 92, 246, 0.15) 0%,
      rgba(26, 16, 51, 0) 50%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(139, 92, 246, 0.15) 0%,
      rgba(26, 16, 51, 0) 50%
    );
}
</style>

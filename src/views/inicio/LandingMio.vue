<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import HeaderLanding from '@/components/landing/HeaderLanding.vue'

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

    <!-- HEADER -->
    <HeaderLanding
      :isDark="isDark"
      :isRevealed="isRevealed"
      @toggle-tema="toggleDarkMode"
    />

    <!-- HERO SECTION -->
    <main class="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-0 md:pt-32">
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

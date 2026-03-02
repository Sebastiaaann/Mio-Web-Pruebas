<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { X, AlertCircle, Loader2, Mail, CreditCard, CheckCircle2 } from 'lucide-vue-next'
import { validateRut, formatRutOnInput } from '@/utils/rutValidator'
import { validarEmail } from '@/utils/validadores'
import AlternarTema from '@/components/ui/AlternarTema.vue'
import PremiumInput from '@/components/ui/PremiumInput.vue'

const router = useRouter()
const userStore = useUserStore()

// Animación de entrada
const isRevealed = ref(false)

// Auth modal
const showAuthModal = ref(false)
const authMode = ref<'login' | 'register'>('login')
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ rut: '', email: '', emailConfirm: '' })
const loginError = ref('')
const registerError = ref('')
const isSubmitting = ref(false)

// Dark mode
const isDark = ref(false)

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/home')
    return
  }

  // Leer tema guardado
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

const handleLoginClick = () => {
  authMode.value = 'login'
  showAuthModal.value = true
  loginError.value = ''
}

const handleRegisterClick = () => {
  authMode.value = 'register'
  showAuthModal.value = true
  registerError.value = ''
}

const closeModal = () => {
  showAuthModal.value = false
  loginError.value = ''
  registerError.value = ''
  loginForm.value = { email: '', password: '' }
  registerForm.value = { rut: '', email: '', emailConfirm: '' }
}

const handleLoginSubmit = async () => {
  loginError.value = ''
  if (!loginForm.value.email || !validarEmail(loginForm.value.email)) {
    loginError.value = 'Email inválido'
    return
  }
  if (!loginForm.value.password) {
    loginError.value = 'Ingresa tu contraseña'
    return
  }
  isSubmitting.value = true
  try {
    const result = await userStore.login(loginForm.value.email, loginForm.value.password)
    if (result.success) {
      closeModal()
      router.push('/home')
    } else {
      loginError.value = result.error || 'Error al iniciar sesión'
    }
  } catch {
    loginError.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}

const handleRegisterSubmit = async () => {
  registerError.value = ''
  if (!validateRut(registerForm.value.rut)) {
    registerError.value = 'RUT inválido'
    return
  }
  if (!registerForm.value.email || !validarEmail(registerForm.value.email)) {
    registerError.value = 'Email inválido'
    return
  }
  if (registerForm.value.email !== registerForm.value.emailConfirm) {
    registerError.value = 'Los emails no coinciden'
    return
  }
  isSubmitting.value = true
  try {
    const result = await userStore.register()
    if (result.success) {
      closeModal()
      router.push('/onboarding')
    } else {
      registerError.value = result.error || 'Error al registrarse'
    }
  } catch {
    registerError.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}

const handleRutInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  registerForm.value.rut = formatRutOnInput(input.value)
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col relative overflow-x-hidden transition-colors duration-300 font-sans"
    :class="isDark ? 'bg-[#1A1033] text-[#F3F4F6]' : 'bg-[#FDFBFF] text-[#1F2937]'"
  >
    <!-- Fondo: gradiente radial púrpura (igual a AccesoView) -->
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
          @click="handleLoginClick"
          class="hidden sm:block text-sm font-medium px-4 py-2 rounded-full transition-colors"
          :class="isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
        >
          Iniciar Sesión
        </button>
        <button
          @click="handleRegisterClick"
          class="text-sm font-semibold px-5 py-2.5 bg-[#8B5CF6] text-white rounded-full hover:bg-[#7C3AED] transition-all shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95"
        >
          Registrarse →
        </button>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <main
      class="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-0 md:pt-16 transition-all duration-300"
      :class="showAuthModal ? 'opacity-40 blur-sm scale-[0.98] pointer-events-none' : 'opacity-100 blur-0 scale-100'"
    >
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
          @click="handleLoginClick"
          class="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-full transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
        >
          Iniciar Sesión →
        </button>
        <button
          @click="handleRegisterClick"
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

    <!-- MODAL AUTH -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showAuthModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/20 backdrop-blur-sm"
          @click="closeModal"
        ></div>

        <!-- Card -->
        <div
          class="w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 border backdrop-blur-2xl"
          :class="isDark
            ? 'bg-gray-900/80 border-white/10 shadow-black/50'
            : 'bg-white/90 border-white/40 shadow-purple-900/10'"
        >
          <!-- Botón cerrar -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X class="w-6 h-6" />
          </button>

          <!-- Header modal -->
          <div class="flex flex-col items-center mb-8">
            <img
              src="/assets/robot_mascot.png"
              alt="Mio+ Mascot"
              class="w-24 h-24 object-contain mb-4 filter drop-shadow-lg"
            />
            <h2
              class="text-2xl font-bold text-center mb-1"
              :class="isDark ? 'text-[#F3F4F6]' : 'text-[#1F2937]'"
            >
              {{ authMode === 'register' ? '¿Eres nuevo?' : '¡Bienvenido de vuelta!' }}
            </h2>
            <p class="text-[#8B5CF6] font-semibold text-lg">
              {{ authMode === 'register' ? 'Crear cuenta' : 'Ingresa a tu cuenta' }}
            </p>
          </div>

          <!-- FORMULARIO REGISTRO -->
          <form v-if="authMode === 'register'" @submit.prevent="handleRegisterSubmit" class="space-y-5">
            <div class="space-y-1">
              <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">RUT</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard class="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Ej: 12.345.678-9"
                  v-model="registerForm.rut"
                  @input="handleRutInput($event)"
                  :disabled="isSubmitting"
                  class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                  :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">Correo electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  v-model="registerForm.email"
                  :disabled="isSubmitting"
                  class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                  :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">Reingresar correo</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle2 class="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Confirma tu correo"
                  v-model="registerForm.emailConfirm"
                  :disabled="isSubmitting"
                  class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                  :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'"
                />
              </div>
            </div>

            <div
              v-if="registerError"
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2"
            >
              <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-700 dark:text-red-300">{{ registerError }}</p>
            </div>

            <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                @click="closeModal"
                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-[#8B5CF6] text-[#8B5CF6] bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6]"
              >
                VOLVER
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-full shadow-lg shadow-purple-200 dark:shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="isSubmitting" class="w-5 h-5 mr-2 animate-spin" />
                {{ isSubmitting ? 'REGISTRANDO...' : 'CONTINUAR' }}
              </button>
            </div>

            <div class="mt-4 text-center">
              <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                ¿Ya tienes cuenta?
                <button type="button" @click="authMode = 'login'" class="text-[#8B5CF6] font-semibold hover:underline">
                  Inicia sesión
                </button>
              </p>
            </div>
          </form>

          <!-- FORMULARIO LOGIN -->
          <form v-else @submit.prevent="handleLoginSubmit" class="space-y-4 pt-2">
            <PremiumInput
              id="login-email"
              type="email"
              label="Email"
              placeholder="nombre@ejemplo.com"
              v-model="loginForm.email"
              :error="loginError && loginError.includes('Email') ? 'Email inválido' : ''"
              :success="validarEmail(loginForm.email)"
            />

            <PremiumInput
              id="login-password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              v-model="loginForm.password"
              :error="loginError && !loginError.includes('Email') ? loginError : ''"
            />

            <div
              v-if="loginError"
              class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2"
            >
              <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-700 dark:text-red-300">{{ loginError }}</p>
            </div>

            <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                @click="closeModal"
                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-[#8B5CF6] text-[#8B5CF6] bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6]"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-full shadow-lg shadow-purple-200 dark:shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="isSubmitting" class="w-5 h-5 mr-2 animate-spin" />
                {{ isSubmitting ? 'INGRESANDO...' : 'INGRESAR' }}
              </button>
            </div>

            <div class="mt-4 text-center">
              <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                ¿No tienes cuenta?
                <button type="button" @click="authMode = 'register'" class="text-[#8B5CF6] font-semibold hover:underline">
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>

          <div class="mt-8 text-center">
            <p class="text-xs text-gray-400 dark:text-gray-500">
              <span class="font-bold text-purple-400">Mio<sup class="text-[0.6em] top-[-0.3em]">+</sup></span>
              una marca de
              <span class="font-semibold text-gray-500 dark:text-gray-400">AccuHealth</span>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Gradiente radial púrpura — idéntico al de AccesoView.vue */
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

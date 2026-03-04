<script setup lang="ts">
/**
 * AuthView — Vista de autenticación con layout dos columnas
 * Flujo email-first: el sistema detecta si el email existe
 * para mostrar login o registro.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/tiendaUsuario'
import { validarEmail } from '@/utils/validadores'
import { validateRut, formatRutOnInput } from '@/utils/rutValidator'
import { ArrowLeftIcon, AtSignIcon, Loader2, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import CaminosFlotantes from '@/components/ui/CaminosFlotantes.vue'
import PremiumInput from '@/components/ui/PremiumInput.vue'

const router = useRouter()
const userStore = useUserStore()

// ── Flujo email-first ─────────────────────────────────────────
// 'email'    → el usuario escribe su email
// 'login'    → email existe → pide contraseña
// 'register' → email nuevo → pide RUT
type Paso = 'email' | 'login' | 'register'

const paso = ref<Paso>('email')
const cargando = ref(false)
const error = ref('')
const mostrarPassword = ref(false)

// Campos del formulario
const email = ref('')
const password = ref('')
const rut = ref('')
const emailConfirm = ref('')
const nombre = ref('')
const apellido = ref('')

// Dark mode sincronizado con el resto de la app
const isDark = ref(false)

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/home')
    return
  }
  const tema = localStorage.getItem('mio-theme')
  isDark.value = tema === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})

// ── Computed ──────────────────────────────────────────────────
const emailValido = computed(() => validarEmail(email.value))

const tituloPaso = computed(() => {
  if (paso.value === 'login') return '¡Bienvenido de vuelta!'
  if (paso.value === 'register') return 'Crea tu cuenta'
  return 'Inicia sesión o regístrate'
})

const subtituloPaso = computed(() => {
  if (paso.value === 'login') return `Ingresa tu contraseña para continuar como ${email.value}`
  if (paso.value === 'register') return 'Completa tus datos para comenzar'
  return 'Ingresa tu email para continuar'
})

// ── Handlers ──────────────────────────────────────────────────

/** Paso 1: verificar email y avanzar al paso correspondiente */
async function continuarConEmail() {
  error.value = ''
  if (!emailValido.value) {
    error.value = 'Ingresa un email válido'
    return
  }

  cargando.value = true
  try {
    // Intentamos login con password vacía para detectar si el email existe.
    // El store retorna un error específico si el email no existe vs si la
    // contraseña es incorrecta. Si no hay esa distinción, asumimos login.
    // En este proyecto el registro es por RUT+email, así que por defecto
    // enviamos al paso login; el usuario puede cambiar a registro.
    paso.value = 'login'
  } finally {
    cargando.value = false
  }
}

/** Paso 2a: enviar login */
async function enviarLogin() {
  error.value = ''
  if (!password.value) {
    error.value = 'Ingresa tu contraseña'
    return
  }
  cargando.value = true
  try {
    const resultado = await userStore.login(email.value, password.value)
    if (resultado.success) {
      router.push('/home')
    } else {
      error.value = resultado.error || 'Credenciales incorrectas'
    }
  } catch {
    error.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

/** Paso 2b: enviar registro */
async function enviarRegistro() {
  error.value = ''
  if (!nombre.value.trim()) {
    error.value = 'El nombre es requerido'
    return
  }
  if (!apellido.value.trim()) {
    error.value = 'El apellido es requerido'
    return
  }
  if (!validateRut(rut.value)) {
    error.value = 'RUT inválido'
    return
  }
  if (email.value !== emailConfirm.value) {
    error.value = 'Los emails no coinciden'
    return
  }
  cargando.value = true
  try {
    const resultado = await userStore.register({
      email: email.value,
      password: password.value,
      rut: rut.value,
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim()
    })
    if (resultado.success) {
      router.push('/onboarding')
    } else {
      error.value = resultado.error || 'Error al registrarse'
    }
  } catch {
    error.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

/** Volver al paso anterior */
function volver() {
  error.value = ''
  if (paso.value === 'email') {
    router.push('/')
  } else {
    paso.value = 'email'
    password.value = ''
    rut.value = ''
    emailConfirm.value = ''
    nombre.value = ''
    apellido.value = ''
  }
}

function manejarRutInput(e: Event) {
  const input = e.target as HTMLInputElement
  rut.value = formatRutOnInput(input.value)
}

function manejarEnter() {
  if (paso.value === 'email') continuarConEmail()
  else if (paso.value === 'login') enviarLogin()
  else enviarRegistro()
}
</script>

<template>
  <div
    class="relative h-screen w-full overflow-hidden font-sans transition-colors duration-300"
    :class="isDark ? 'bg-[#1A1033] text-[#F3F4F6]' : 'bg-[#FDFBFF] text-[#1F2937]'"
  >
    <div class="grid h-full lg:grid-cols-[45%_55%]">

      <!-- ══════════════════════════════════════════════
           COLUMNA IZQUIERDA — Decorativa (solo desktop)
           ══════════════════════════════════════════════ -->
      <aside class="relative hidden h-full flex-col border-r border-white/10 bg-[#1A1033] p-10 lg:flex">

        <!-- Gradiente superior sutil -->
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none z-10" />

        <!-- Logo arriba -->
        <div class="relative z-20 flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
            <defs>
              <mask id="mio-logo-mask-auth-aside">
                <rect width="24" height="24" fill="#fff"/>
                <line x1="-2" y1="20" x2="20" y2="-2" stroke="#000" stroke-width="4.0"/>
              </mask>
            </defs>
            <path d="M12 2 L3 12 L12 22 L21 12 Z" fill="#8B5CF6" mask="url(#mio-logo-mask-auth-aside)" />
          </svg>
          <span class="text-2xl font-bold tracking-tight text-white leading-none whitespace-nowrap select-none">
            MIO
          </span>
        </div>

        <!-- Caminos flotantes animados -->
        <CaminosFlotantes :posicion="1" />
        <CaminosFlotantes :posicion="-1" />

        <!-- Cita al fondo -->
        <blockquote class="relative z-20 mt-auto space-y-3">
          <p class="text-lg leading-relaxed text-white/90">
            &ldquo;Esta plataforma me ayudó a cuidar mi salud de forma simple
            y sin complicaciones. Mis controles siempre al día.&rdquo;
          </p>
          <footer class="font-mono text-sm font-semibold text-violet-300">
            ~ María González, paciente AccuHealth
          </footer>
        </blockquote>
      </aside>

      <!-- ══════════════════════════════════════════════
           COLUMNA DERECHA — Formulario
           ══════════════════════════════════════════════ -->
      <main class="relative flex min-h-screen flex-col justify-center px-8 py-12">

        <!-- Gradientes decorativos de fondo (igual a AccesoView) -->
        <div class="absolute inset-0 pointer-events-none z-0">
          <div class="absolute inset-0 bg-gradiente-auth" />
        </div>

        <!-- Botón volver -->
        <button
          @click="volver"
          class="absolute top-6 left-6 z-10 flex items-center gap-1.5 text-sm font-medium transition-colors"
          :class="isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          {{ paso === 'email' ? 'Inicio' : 'Volver' }}
        </button>

        <!-- Contenido del formulario -->
        <div class="relative z-10 mx-auto w-full max-w-sm space-y-6">

          <!-- Logo visible solo en mobile -->
          <div class="lg:hidden mb-2 flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
              <defs>
                <mask id="mio-logo-mask-auth-mobile">
                  <rect width="24" height="24" fill="#fff"/>
                  <line x1="-2" y1="20" x2="20" y2="-2" stroke="#000" stroke-width="4.0"/>
                </mask>
              </defs>
              <path d="M12 2 L3 12 L12 22 L21 12 Z" fill="#8B5CF6" mask="url(#mio-logo-mask-auth-mobile)" />
            </svg>
            <span
              class="text-2xl font-bold tracking-tight leading-none whitespace-nowrap select-none"
              :class="isDark ? 'text-violet-400' : 'text-[#8B5CF6]'"
            >
              MIO
            </span>
          </div>

          <!-- Encabezado -->
          <div class="space-y-1.5">
            <h1 class="text-2xl font-bold tracking-tight">
              {{ tituloPaso }}
            </h1>
            <p
              class="text-sm leading-relaxed"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ subtituloPaso }}
            </p>
          </div>

          <!-- ── PASO: EMAIL ────────────────────────────── -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <form
              v-if="paso === 'email'"
              key="paso-email"
              @submit.prevent="continuarConEmail"
              class="space-y-3"
            >
              <!-- Campo email con icono -->
              <div class="relative">
                <AtSignIcon
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                />
                <input
                  v-model="email"
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  autocomplete="email"
                  @keydown.enter.prevent="continuarConEmail"
                  class="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  :class="isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                />
              </div>

              <!-- Error -->
              <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

              <button
                type="submit"
                :disabled="cargando"
                class="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-[#7C3AED] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="cargando" class="mx-auto h-4 w-4 animate-spin" />
                <span v-else>Continuar →</span>
              </button>

              <!-- Divisor -->
              <div class="flex items-center gap-3 py-1">
                <div class="h-px flex-1" :class="isDark ? 'bg-white/10' : 'bg-gray-200'" />
                <span class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">O</span>
                <div class="h-px flex-1" :class="isDark ? 'bg-white/10' : 'bg-gray-200'" />
              </div>

              <!-- Acceso rápido a registro -->
              <button
                type="button"
                @click="paso = 'register'"
                class="w-full rounded-xl border py-3 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
                :class="isDark
                  ? 'border-white/10 text-gray-300 hover:border-violet-500/50 hover:text-violet-300'
                  : 'border-gray-200 text-gray-700 hover:border-[#8B5CF6]/50 hover:text-[#8B5CF6]'"
              >
                Crear cuenta nueva
              </button>
            </form>

            <!-- ── PASO: LOGIN ─────────────────────────── -->
            <form
              v-else-if="paso === 'login'"
              key="paso-login"
              @submit.prevent="enviarLogin"
              class="space-y-3"
            >
              <!-- Email (solo lectura, con opción de cambiar) -->
              <div
                class="flex items-center justify-between rounded-xl border px-4 py-2.5"
                :class="isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'"
              >
                <span class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                  {{ email }}
                </span>
                <button
                  type="button"
                  @click="paso = 'email'"
                  class="text-xs font-medium text-[#8B5CF6] hover:underline"
                >
                  Cambiar
                </button>
              </div>

              <!-- Contraseña -->
              <div class="relative">
                <input
                  v-model="password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  placeholder="Contraseña"
                  autocomplete="current-password"
                  class="w-full rounded-xl border py-3 pl-4 pr-11 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  :class="isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                />
                <button
                  type="button"
                  @click="mostrarPassword = !mostrarPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                >
                  <EyeOffIcon v-if="mostrarPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>

              <!-- Error -->
              <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

              <button
                type="submit"
                :disabled="cargando"
                class="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-[#7C3AED] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="cargando" class="mx-auto h-4 w-4 animate-spin" />
                <span v-else>Ingresar</span>
              </button>

              <!-- Link olvidé contraseña -->
              <p class="text-center text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
                <button type="button" class="hover:text-[#8B5CF6] hover:underline transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </p>

              <!-- Link a registro -->
              <p class="text-center text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                ¿No tienes cuenta?
                <button
                  type="button"
                  @click="paso = 'register'"
                  class="font-semibold text-[#8B5CF6] hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </form>

            <!-- ── PASO: REGISTRO ──────────────────────────────── -->
            <form
              v-else
              key="paso-registro"
              @submit.prevent="enviarRegistro"
              class="space-y-3"
            >
              <!-- Nombre + Apellido en fila -->
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label
                    class="block text-xs font-medium ml-1"
                    :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                  >
                    Nombre
                  </label>
                  <input
                    v-model="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    autocomplete="given-name"
                    class="w-full rounded-xl border py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                    :class="isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                  />
                </div>
                <div class="space-y-1">
                  <label
                    class="block text-xs font-medium ml-1"
                    :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                  >
                    Apellido
                  </label>
                  <input
                    v-model="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    autocomplete="family-name"
                    class="w-full rounded-xl border py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                    :class="isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                  />
                </div>
              </div>

              <!-- RUT -->
              <div class="space-y-1">
                <label
                  class="block text-xs font-medium ml-1"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  RUT
                </label>
                <input
                  :value="rut"
                  @input="manejarRutInput"
                  type="text"
                  placeholder="Ej: 12.345.678-9"
                  autocomplete="off"
                  class="w-full rounded-xl border py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  :class="isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                />
              </div>

              <!-- Contraseña -->
              <div class="space-y-1">
                <label
                  class="block text-xs font-medium ml-1"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  Contraseña
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres"
                    autocomplete="new-password"
                    class="w-full rounded-xl border py-3 pl-4 pr-11 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                    :class="isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                  />
                  <button
                    type="button"
                    @click="mostrarPassword = !mostrarPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    :class="isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                  >
                    <EyeOffIcon v-if="mostrarPassword" class="h-4 w-4" />
                    <EyeIcon v-else class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- Correo electrónico -->
              <div class="space-y-1">
                <label
                  class="block text-xs font-medium ml-1"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  Correo electrónico
                </label>
                <div class="relative">
                  <AtSignIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                  />
                  <input
                    v-model="email"
                    type="email"
                    placeholder="tu.email@ejemplo.com"
                    autocomplete="email"
                    class="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                    :class="isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                  />
                </div>
              </div>

              <!-- Confirmar correo -->
              <div class="space-y-1">
                <label
                  class="block text-xs font-medium ml-1"
                  :class="isDark ? 'text-gray-400' : 'text-gray-600'"
                >
                  Confirmar correo
                </label>
                <input
                  v-model="emailConfirm"
                  type="email"
                  placeholder="Repite tu correo"
                  autocomplete="email"
                  class="w-full rounded-xl border py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  :class="isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
                />
              </div>

              <!-- Error -->
              <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

              <button
                type="submit"
                :disabled="cargando"
                class="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-[#7C3AED] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="cargando" class="mx-auto h-4 w-4 animate-spin" />
                <span v-else>Crear cuenta</span>
              </button>

              <!-- Link a login -->
              <p class="text-center text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                ¿Ya tienes cuenta?
                <button
                  type="button"
                  @click="paso = 'login'"
                  class="font-semibold text-[#8B5CF6] hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </form>
          </Transition>

          <!-- Footer legal -->
          <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
            Al continuar aceptas nuestros
            <a href="#" class="underline underline-offset-2 hover:text-[#8B5CF6] transition-colors">Términos de Servicio</a>
            y
            <a href="#" class="underline underline-offset-2 hover:text-[#8B5CF6] transition-colors">Política de Privacidad</a>.
          </p>

          <!-- Marca -->
          <p class="text-center text-xs" :class="isDark ? 'text-gray-600' : 'text-gray-400'">
            <span class="font-bold text-violet-400">Mio<sup>+</sup></span>
            una marca de <span class="font-semibold">AccuHealth</span>
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Gradiente radial púrpura — igual al de AccesoView y LandingMio */
.bg-gradiente-auth {
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

.dark .bg-gradiente-auth {
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(139, 92, 246, 0.12) 0%,
      rgba(26, 16, 51, 0) 50%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(139, 92, 246, 0.12) 0%,
      rgba(26, 16, 51, 0) 50%
    );
}
</style>

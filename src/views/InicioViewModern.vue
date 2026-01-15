<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Using simple headless UI pattern for modal/transitions if accessible or just simple v-if/v-show with CSS transitions
// Icons
import { CreditCard, Mail, CheckCircle2, X } from 'lucide-vue-next'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const router = useRouter()

// State for Modal
const showAuthModal = ref(false)
const authMode = ref('login') // 'login' or 'register'

const handleLoginClick = () => {
    authMode.value = 'login'
    showAuthModal.value = true
}

const handleRegisterClick = () => {
    authMode.value = 'register'
    showAuthModal.value = true
}

const closeModal = () => {
    showAuthModal.value = false
}

// Form Handlers (Mock)
const handleLoginSubmit = () => {
    // Simulate login
    router.push('/dashboard')
}

const handleRegisterSubmit = () => {
    // Simulate register
    router.push('/onboarding')
}

// Toggle Dark Mode - Sincronizado con localStorage (misma clave que dashboard)
const isDark = ref(false)

onMounted(() => {
    // Leer preferencia guardada, por defecto false (light mode)
    const savedTheme = localStorage.getItem('mio-theme')
    isDark.value = savedTheme === 'dark'
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
})

const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('mio-theme', isDark.value ? 'dark' : 'light')
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}
</script>

<template>
  <!-- Main Container -->
  <div class="min-h-screen w-full flex flex-col relative overflow-hidden transition-colors duration-300 font-sans"
       :class="[isDark ? 'bg-[#1A1033] text-[#F3F4F6]' : 'bg-[#FDFBFF] text-[#1F2937]']">
       
    <!-- Background Gradients (Animated) -->
    <div class="absolute inset-0 pointer-events-none z-0">
        <div class="absolute inset-0 bg-gradient-custom transition-opacity duration-1000"></div>
    </div>

    <!-- Main Landing Content -->
    <main class="flex-grow flex items-center justify-center relative z-10 px-6 py-12 lg:px-24 transition-all duration-500 ease-in-out"
          :class="{ 'opacity-50 blur-sm scale-95': showAuthModal }">
        <div class="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <!-- Left Column: Text Content -->
            <div class="flex flex-col items-start space-y-8 max-w-lg">
                <div class="space-y-2">
                    <h1 class="text-6xl font-bold text-[#8B5CF6] tracking-tight flex items-start">
                        Mio
                        <span class="text-4xl align-top mt-1 ml-1">+</span>
                    </h1>
                    <p class="text-sm font-medium" :class="isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'">
                        Una marca de <span class="font-bold" :class="isDark ? 'text-[#F3F4F6]' : 'text-[#1F2937]'">AccuHealth</span>
                    </p>
                </div>

                <h2 class="text-4xl md:text-5xl font-semibold leading-tight">
                    Bienvenido a tu plataforma de monitoreo de salud.
                </h2>

                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                    <button @click="handleLoginClick"
                        class="px-8 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-full transition-all shadow-lg shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 transform hover:scale-105 active:scale-95">
                        Iniciar Sesión
                    </button>
                    <button @click="handleRegisterClick"
                        class="px-8 py-3.5 border font-medium rounded-full transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 transform hover:scale-105 active:scale-95"
                        :class="isDark 
                            ? 'bg-transparent border-gray-600 text-gray-200 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 focus:ring-offset-[#1A1033]' 
                            : 'bg-white border-gray-200 text-gray-700 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50'">
                        Registrarse
                    </button>
                </div>

                <div class="flex items-center gap-6 text-sm pt-4"
                     :class="isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'">
                    <button class="hover:text-[#8B5CF6] transition-colors hover:underline">¿Olvidaste tu contraseña?</button>
                    <button class="hover:text-[#8B5CF6] transition-colors hover:underline">Ayuda</button>
                </div>
            </div>

            <!-- Right Column: Visuals/Illustration -->
            <div class="hidden lg:flex justify-center items-center relative h-[500px] w-full select-none pointer-events-none">
                <!-- Floating Elements Animation -->
                <div class="absolute z-20 animate-float">
                    <div class="w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl border"
                         :class="isDark ? 'bg-[#8B5CF6]/30 border-white/10' : 'bg-[#8B5CF6]/20 border-white/50'">
                         <div class="w-16 h-16 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-inner">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                         </div>
                    </div>
                    <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-widest font-bold uppercase"
                         :class="isDark ? 'text-[#8B5CF6]/60' : 'text-[#8B5CF6]/40'">
                        Ilustración de Monitoreo
                    </div>
                </div>

                <!-- Decorative Orbs -->
                <div class="absolute -top-10 right-1/3 animate-float-delayed">
                    <div class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border z-10 relative"
                         :class="isDark ? 'bg-[#2D1B4E] border-gray-700' : 'bg-white border-gray-100'">
                         <div class="w-8 h-8 rounded-full" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"></div>
                    </div>
                </div>

                <div class="absolute bottom-20 left-20 animate-float-delayed-2">
                    <div class="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border z-10 relative"
                         :class="isDark ? 'bg-[#2D1B4E] border-gray-700' : 'bg-white border-gray-100'">
                         <div class="w-10 h-8 rounded md:rounded-lg" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"></div>
                    </div>
                </div>

                <div class="absolute bottom-32 right-20 animate-float">
                    <div class="w-18 h-18 rounded-full p-4 flex items-center justify-center shadow-lg border z-10 relative"
                         :class="isDark ? 'bg-[#2D1B4E] border-gray-700' : 'bg-white border-gray-100'">
                         <div class="w-10 h-10 rounded-lg" :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"></div>
                    </div>
                </div>

                <!-- Connected Lines SVG -->
                <svg class="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 400 400" :class="isDark ? 'opacity-10' : 'opacity-20'">
                    <line class="text-[#8B5CF6]" stroke="currentColor" stroke-dasharray="5,5" stroke-width="2" x1="250" x2="200" y1="120" y2="200"></line>
                    <line class="text-[#8B5CF6]" stroke="currentColor" stroke-dasharray="5,5" stroke-width="2" x1="120" x2="200" y1="300" y2="200"></line>
                    <line class="text-[#8B5CF6]" stroke="currentColor" stroke-dasharray="5,5" stroke-width="2" x1="300" x2="200" y1="280" y2="200"></line>
                </svg>
            </div>
        </div>
    </main>

    <!-- Dark Mode Toggle -->
    <div class="absolute bottom-4 right-4 z-50">
        <ThemeToggle :isDark="isDark" @toggle="toggleDarkMode" />
    </div>

    <!-- AUTH MODAL OVERLAY -->
    <!-- This creates the 'effect' of the form appearing on the same view -->
    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
    >
        <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="closeModal"></div>

            <!-- Card -->
            <div class="w-full max-w-lg rounded-2xl shadow-[0_10px_40px_-10px_rgba(139,92,246,0.1)] p-8 md:p-10 relative overflow-hidden transition-colors border z-10"
                 :class="isDark ? 'bg-[#1F2937] border-gray-700' : 'bg-white border-purple-50'">
                
                <!-- Close Button -->
                <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X class="w-6 h-6" />
                </button>

                <!-- Header -->
                <div class="flex flex-col items-center mb-8">
                    <div class="mb-6 relative">
                        <div class="w-32 h-32 flex items-center justify-center relative">
                             <img 
                                src="/assets/robot_mascot.png" 
                                alt="Mio+ Mascot" 
                                class="w-full h-full object-contain filter drop-shadow-lg"
                             />
                            <div class="absolute -right-2 -bottom-2 p-2 rounded-full shadow-md border bg-white dark:bg-gray-800 border-purple-50 dark:border-gray-700">
                                <span class="text-[#8B5CF6] text-xl font-bold material-icons-round">
                                    {{ authMode === 'register' ? 'badge' : 'login' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <h1 class="text-2xl font-bold text-center mb-1" :class="isDark ? 'text-[#F3F4F6]' : 'text-[#1F2937]'">
                        {{ authMode === 'register' ? '¿Eres nuevo?' : '¡Bienvenido de vuelta!' }}
                    </h1>
                    <p class="text-[#8B5CF6] font-semibold text-lg">
                        {{ authMode === 'register' ? 'Crear cuenta' : 'Ingresa a tu cuenta' }}
                    </p>
                </div>

                <!-- REGISTER FORM -->
                <form v-if="authMode === 'register'" @submit.prevent="handleRegisterSubmit" class="space-y-5">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">RUT</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard class="text-gray-400 w-5 h-5"/>
                            </div>
                            <input type="text" placeholder="Ej: 12.345.678-9" 
                                   class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                                   :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">Correo electrónico</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail class="text-gray-400 w-5 h-5"/>
                            </div>
                            <input type="email" placeholder="nombre@ejemplo.com" 
                                   class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                                   :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'" />
                        </div>
                    </div>

                     <div class="space-y-1">
                        <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">Reingresar correo</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CheckCircle2 class="text-gray-400 w-5 h-5"/>
                            </div>
                            <input type="email" placeholder="Confirma tu correo" 
                                   class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                                   :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'" />
                        </div>
                    </div>

                    <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" @click="closeModal"
                                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-[#8B5CF6] text-base font-medium rounded-full text-[#8B5CF6] bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] transition-colors duration-200">
                            VOLVER
                        </button>
                        <button type="submit"
                                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#8B5CF6] hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] shadow-lg shadow-purple-200 dark:shadow-none transition-all duration-200">
                            CONTINUAR
                        </button>
                    </div>
                </form>

                <!-- LOGIN FORM -->
                 <form v-else @submit.prevent="handleLoginSubmit" class="space-y-5">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">RUT</label>
                        <div class="relative">
                             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard class="text-gray-400 w-5 h-5"/>
                            </div>
                            <input type="text" placeholder="Ej: 12.345.678-9" 
                                   class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                                   :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'" />
                        </div>
                    </div>
                     <div class="space-y-1">
                        <label class="block text-sm font-medium ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-700'">Contraseña</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CheckCircle2 class="text-gray-400 w-5 h-5"/>
                            </div>
                            <input type="password" placeholder="••••••••" 
                                   class="block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm transition-shadow duration-200"
                                   :class="isDark ? 'bg-gray-800 border-gray-600 text-[#F3F4F6]' : 'bg-white border-gray-200 text-[#1F2937]'" />
                        </div>
                    </div>

                     <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" @click="closeModal"
                                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-[#8B5CF6] text-base font-medium rounded-full text-[#8B5CF6] bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] transition-colors duration-200">
                            CANCELAR
                        </button>
                        <button type="submit"
                                class="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#8B5CF6] hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] shadow-lg shadow-purple-200 dark:shadow-none transition-all duration-200">
                            INGRESAR
                        </button>
                    </div>
                 </form>


                <div class="mt-8 text-center">
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                        <span class="font-bold text-purple-400">Mio<sup class="text-[0.6em] top-[-0.3em]">+</sup></span> 
                        una marca de <span class="font-semibold text-gray-500 dark:text-gray-400">AccuHealth</span>
                    </p>
                </div>
            </div>
        </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Gradient matching user snippet */
.bg-gradient-custom {
    background: radial-gradient(circle at 10% 20%, rgba(237, 233, 254, 0.8) 0%, rgba(255, 255, 255, 0) 40%),
                radial-gradient(circle at 90% 80%, rgba(237, 233, 254, 0.8) 0%, rgba(255, 255, 255, 0) 40%);
}
.dark .bg-gradient-custom {
    background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, rgba(26, 16, 51, 0) 50%),
                radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.15) 0%, rgba(26, 16, 51, 0) 50%);
}

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
}
.animate-float {
    animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
    animation: float 5s ease-in-out infinite 1s;
}
.animate-float-delayed-2 {
    animation: float 7s ease-in-out infinite 0.5s;
}
</style>

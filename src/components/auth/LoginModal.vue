<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Motion } from 'motion-v';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const router = useRouter();

// State
const currentView = ref('login'); // 'login' | 'register'
const email = ref('');
const password = ref('');
const showPassword = ref(false);

// Register State
const registerEmail = ref('');
const confirmEmail = ref('');
const rut = ref('');

const handleClose = () => {
    emit('close');
    setTimeout(() => {
        currentView.value = 'login'; // Reset on close
    }, 300);
};

const handleLogin = () => {
    // Mock functionality
    router.push('/dashboard');
};

const handleRegister = () => {
    // Mock registration functionality
    router.push('/dashboard');
};

const switchToRegister = () => {
    currentView.value = 'register';
};

const switchToLogin = () => {
    currentView.value = 'login';
};
</script>

<template>
  <Motion
    v-if="isOpen"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <Motion
        layout
        :initial="{ scale: 0.9, opacity: 0, y: 20 }"
        :animate="{ scale: 1, opacity: 1, y: 0 }"
        :transition="{ type: 'spring', damping: 25, stiffness: 300 }"
        class="bg-white rounded-4xl w-full max-w-md p-8 relative flex flex-col items-center shadow-2xl overflow-hidden"
    >
        <!-- Close Button -->
        <button 
            @click="handleClose"
            class="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <!-- Robot Header -->
        <div class="mb-4 relative">
             <img 
              src="/assets/robot_mascot.png" 
              alt="MIO Agent" 
              class="h-28 object-contain drop-shadow-lg"
            />
             <!-- Chat Bubble-->
            <div 
                class="absolute -right-4 top-0 bg-purple-100 p-2 rounded-xl rounded-bl-none shadow-sm animate-bounce-slow"
                v-if="currentView === 'login'"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
            </div>
             <div 
                class="absolute -right-4 top-0 bg-purple-100 p-2 rounded-xl rounded-bl-none shadow-sm animate-pulse"
                v-else
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
        </div>

        <!-- View login -->
        <div v-if="currentView === 'login'" class="w-full flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-300">
            <!-- Titulo -->
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-slate-400/80 mb-1">¡Hola!</h2>
                <h1 class="text-3xl font-bold text-[#8B5CF6]">Iniciemos sesión</h1>
            </div>

            <!-- Formulario -->
            <form class="w-full space-y-5" @submit.prevent="handleLogin">
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-slate-700 ml-1">Ingresa tu correo electrónico</label>
                    <InputText v-model="email" placeholder="micorreo@mail.com" class="w-full rounded-xl! border-slate-200! focus:border-[#8B5CF6]! bg-slate-50! py-3! text-lg! text-slate-600! placeholder:text-slate-300! shadow-none ring-0!" />
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-bold text-slate-700 ml-1">Ingresa tu contraseña</label>
                    <div class="relative">
                        <InputText v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••••••" class="w-full rounded-xl! border-slate-200! focus:border-[#8B5CF6]! bg-slate-50! py-3! text-lg! text-slate-600! placeholder:text-slate-300! shadow-none ring-0!" />
                    </div>
                </div>

                <div class="flex items-center gap-2 ml-1">
                    <Checkbox v-model="showPassword" :binary="true" inputId="showPass" class="border-slate-300!" />
                    <label for="showPass" class="text-slate-600 cursor-pointer select-none">Ver contraseña</label>
                </div>

                <button class="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4">ENTRAR</button>

                <div class="text-center space-y-4 pt-2">
                    <a href="#" class="block text-slate-800 font-bold border-b border-slate-800 inline-block pb-0.5 hover:text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors">¿OLVIDASTE TU CONTRASEÑA?</a>
                    <button type="button" @click="switchToRegister" class="text-slate-900 font-black tracking-wide text-sm hover:text-[#8B5CF6] transition-colors">CREAR CUENTA EN MIO APP</button>
                </div>
            </form>
        </div>

        <!-- vista registro -->
        <div v-else class="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
             <!-- Titulo-->
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-[#8B5CF6] mb-1">¡Oh! ¿Eres nuevo?</h2>
                <h1 class="text-3xl font-bold text-[#8B5CF6]/70">Crear cuenta</h1>
            </div>

            <form class="w-full space-y-5" @submit.prevent="handleRegister">
                 <!-- RUT -->
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-slate-700 ml-1">RUT</label>
                    <InputText v-model="rut" placeholder="Ingresa tu RUT" class="w-full rounded-xl! border-slate-200! focus:border-[#8B5CF6]! bg-slate-50! py-3! text-lg! text-slate-600! placeholder:text-slate-300! shadow-none ring-0!" />
                </div>

                 <!-- Email -->
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-slate-700 ml-1">Correo electrónico</label>
                    <InputText v-model="registerEmail" placeholder="micorreo@mail.com" class="w-full rounded-xl! border-slate-200! focus:border-[#8B5CF6]! bg-slate-50! py-3! text-lg! text-slate-600! placeholder:text-slate-300! shadow-none ring-0!" />
                </div>

                 <!-- Confirmar email -->
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-slate-700 ml-1">Reingresa tu Correo electrónico</label>
                    <InputText v-model="confirmEmail" placeholder="Vuelve a ingresar tu email" class="w-full rounded-xl! border-slate-200! focus:border-[#8B5CF6]! bg-slate-50! py-3! text-lg! text-slate-600! placeholder:text-slate-300! shadow-none ring-0!" />
                </div>

                <!-- Actions -->
                <div class="pt-4 space-y-3">
                    <button class="w-full bg-[#E9D5FF] hover:bg-[#D8B4FE] text-[#6B21A8] font-bold py-3.5 rounded-full text-lg shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]">CONTINUAR</button>
                    
                    <button type="button" @click="switchToLogin" class="w-full bg-transparent border-2 border-slate-200 hover:border-slate-400 text-slate-700 font-bold py-3.5 rounded-full text-lg transition-all">VOLVER</button>
                </div>
            </form>
        </div>

    </Motion>
  </Motion>
</template>

<style scoped>
/* PrimeVue Overrides for exact match */
:deep(.p-inputtext:enabled:focus) {
    box-shadow: none;
    border-color: #8B5CF6;
}
:deep(.p-checkbox-box) {
    border-radius: 4px;
    border-color: #cbd5e1;
}
:deep(.p-checkbox.p-highlight .p-checkbox-box) {
    background: #8B5CF6;
    border-color: #8B5CF6;
}
</style>

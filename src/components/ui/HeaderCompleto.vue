<script setup lang="ts">
/**
 * HeaderCompleto - Header unificado para todas las vistas
 * Diseño Premium/SaaS Financiero con soporte para temas dinámicos
 * Incluye: saludo dinámico, notificaciones, chatbot y perfil de usuario
 */
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/tiendaUsuario'
import { useConfigStore } from '@/stores/tiendaConfig'
import { storeToRefs } from 'pinia'
import { Bot, Bell } from 'lucide-vue-next'
import { useSaludo } from '@/composables/useSaludo'
import { useUserInitials } from '@/composables/useUserInitials'
import { useTheme } from '@/composables/useTheme'
import ChatbotBanner from '@/components/ui/home-ios/ChatbotBanner.vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet/index.js";
import ChatView from '@/views/chat/ChatView.vue';

// Props para personalizar el header por vista
interface Props {
  /** Título principal (si no se usa saludo dinámico) */
  titulo?: string
  /** Subtítulo descriptivo */
  subtitulo?: string
  /** Mostrar saludo dinámico en lugar de título fijo */
  mostrarSaludo?: boolean
  /** Mostrar el banner del chatbot debajo del header */
  mostrarChatbotBanner?: boolean
  /** Color del badge de notificaciones */
  notificationBadgeColor?: string
  /** Mostrar badge de notificaciones */
  showNotificationBadge?: boolean
  /** Cantidad de notificaciones */
  notificationCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  titulo: '',
  subtitulo: '',
  mostrarSaludo: true,
  mostrarChatbotBanner: false,
  notificationBadgeColor: '#EF4444',
  showNotificationBadge: true,
  notificationCount: 0
})

// Emits para eventos
const emit = defineEmits<{
  (e: 'clickNotification'): void
  (e: 'clickProfile'): void
}>()

const userStore = useUserStore()
const configStore = useConfigStore()
const { nombreCompleto, firstName } = storeToRefs(userStore)

// Composables
const { saludo } = useSaludo()
const { iniciales: userInitials } = useUserInitials(firstName, nombreCompleto)
const { colors, themeClass } = useTheme()

// Estado para controlar el panel del chatbot
const chatbotAbierto = ref<boolean>(false)

// Estado de notificaciones
const hasNotifications = ref<boolean>(true)

// Computed para el título a mostrar
const tituloMostrado = computed(() => {
  if (props.mostrarSaludo) {
    return `${saludo.value}, ${firstName.value || 'Usuario'}`
  }
  return props.titulo
})

const logoHeader = computed(() => {
  if (configStore.planActivo === 'mutual') {
    return configStore.logoMutual || '/assets/logo_mutual.png'
  }
  return null
})

// Handlers
const handleNotificationClick = () => {
  emit('clickNotification')
}

const handleProfileClick = () => {
  emit('clickProfile')
}
</script>

<template>
  <div class="header-completo-container">
    <!-- Header Principal -->
    <header 
      :class="themeClass"
      class="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 sticky top-0 z-20 transition-all duration-300"
    >
      <div class="flex items-center justify-between">
        <!-- Lado Izquierdo: Título/Subtítulo -->
        <div>
          <h1 class="h1-premium">
            {{ tituloMostrado }}
          </h1>
          <p v-if="subtitulo" class="text-secondary text-sm mt-1 font-medium">
            {{ subtitulo }}
          </p>
        </div>

        <!-- Lado Derecho: Notificaciones, Chatbot y Perfil -->
        <div class="flex items-center gap-3 md:gap-5">
          <!-- Logo Mutual si aplica -->
          <img
            v-if="logoHeader"
            :src="logoHeader"
            alt="Logo Mutual"
            class="h-7 w-auto object-contain"
          />
          
          <!-- Botón de Notificaciones -->
          <button 
            @click="handleNotificationClick"
            class="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all group"
            aria-label="Notificaciones"
          >
            <Bell class="w-5 h-5" />
            <span 
              v-if="showNotificationBadge && hasNotifications" 
              class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              :style="{ backgroundColor: notificationBadgeColor }"
            ></span>
            <span 
              v-if="notificationCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2 border-white"
              :style="{ backgroundColor: notificationBadgeColor }"
            >
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </button>

          <!-- Separador -->
          <div class="hidden md:block w-px h-6 bg-slate-200"></div>

          <!-- Avatar Chatbot -->
          <Sheet v-model:open="chatbotAbierto">
            <SheetTrigger as-child>
              <button 
                class="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center group"
                aria-label="Abrir asistente virtual"
              >
                <Bot class="w-5 h-5 text-white" />
                <!-- Indicador online -->
                <span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
              </button>
            </SheetTrigger>
            
            <SheetContent side="right" class="w-full sm:w-[450px] p-0 flex flex-col">
              <SheetHeader class="px-4 py-3 border-b border-slate-200 shrink-0">
                <SheetTitle class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <Bot class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-base font-semibold text-slate-900">Asistente Virtual</span>
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span class="text-xs text-green-600 font-medium">En línea</span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <!-- ChatView integrado -->
              <div class="flex-1 overflow-hidden">
                <ChatView :show-header="false" />
              </div>
            </SheetContent>
          </Sheet>

          <!-- Separador -->
          <div class="hidden md:block w-px h-6 bg-slate-200"></div>

          <!-- Perfil de Usuario - Avatar Circular -->
          <div 
            class="relative flex-shrink-0 cursor-pointer"
            @click="handleProfileClick"
          >
            <div 
              class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
              :style="{ 
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary + '30'
              }"
            >
              <span 
                class="text-sm font-semibold"
                :style="{ color: colors.primary }"
              >
                {{ userInitials }}
              </span>
            </div>
            <!-- Indicador Online -->
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Chatbot Banner (opcional) -->
    <div v-if="mostrarChatbotBanner" class="px-4 md:px-8 py-4">
      <ChatbotBanner />
    </div>
  </div>
</template>

<style scoped>
.header-completo-container {
  width: 100%;
}

/* Animaciones suaves */
header {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

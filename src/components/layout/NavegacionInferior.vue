<script setup>
/**
 * BottomNavigation - Barra de navegación inferior para móvil
 * Similar a la navegación de la app móvil Mio+
 * Migrado a Lucide icons
 */
import { useRoute, useRouter } from 'vue-router'
import { 
  Home, 
  Mail, 
  BarChart3, 
  HelpCircle, 
  User 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const navItems = [
  { 
    name: 'dashboard', 
    label: 'Inicio', 
    icon: Home,
    path: '/dashboard'
  },
  { 
    name: 'mensajes', 
    label: 'Mensajes', 
    icon: Mail,
    path: '/mensajes'
  },
  { 
    name: 'controles', 
    label: 'Controles', 
    icon: BarChart3,
    path: '/controles'
  },
  { 
    name: 'ayuda', 
    label: 'Ayuda', 
    icon: HelpCircle,
    path: '/ayuda'
  },
  { 
    name: 'perfil', 
    label: 'Perfil', 
    icon: User,
    path: '/perfil'
  }
]

function isActive(item) {
  return route.path === item.path || route.name === item.name
}

function navigateTo(item) {
  router.push(item.path)
}
</script>

<template>
  <nav 
    class="bottom-navigation fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg md:hidden"
    role="navigation"
    aria-label="Navegación principal"
  >
    <ul class="flex items-center justify-around h-16 px-2">
      <li v-for="item in navItems" :key="item.name">
        <button
          @click="navigateTo(item)"
          :class="[
            'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 cursor-pointer',
            isActive(item) 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          ]"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <component 
            :is="item.icon" 
            :class="[
              'h-5 w-5 mb-1 transition-transform',
              isActive(item) ? 'scale-110' : ''
            ]" 
          />
          <span 
            :class="[
              'text-[10px] font-medium',
              isActive(item) ? 'font-semibold' : ''
            ]"
          >
            {{ item.label }}
          </span>
        </button>
      </li>
    </ul>
    
    <!-- Safe area padding for devices with home indicator -->
    <div class="h-safe-area-inset-bottom bg-white" />
  </nav>
</template>

<style scoped>
.h-safe-area-inset-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>

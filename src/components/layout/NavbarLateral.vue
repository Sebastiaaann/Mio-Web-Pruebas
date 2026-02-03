<!-- src/components/layout/NavbarLateral.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Motion, AnimatePresence } from 'motion-v';
import { 
  Home, 
  Activity, 
  BookOpen, 
  Inbox, 
  HelpCircle, 
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  MoreVertical,
  Settings,
  LogOut,
  Calendar,
  PanelLeft,
  Command,
  Heart,
  Scale,
  Droplet
} from 'lucide-vue-next';

import { useUserStore } from '@/stores/tiendaUsuario';
import { useConfigStore } from '@/stores/tiendaConfig';
import ProfileOverlay from '@/components/profile/ProfileOverlay.vue';

// Props handling
const props = defineProps({
  visible: { type: Boolean, default: true },
  collapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'update:mobileOpen']);

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const configStore = useConfigStore();

const clientName = computed(() => '');

// --- STATE ---
const openSubmenus = ref({});
const isMobileOpen = ref(false);
const isProfileMenuOpen = ref(false);
const searchInputRef = ref(null);
const profileContainerRef = ref(null);
const showProfileOverlay = ref(false);
const showTooltip = ref('');

// --- MENU DATA ---
const menuSections = [
  {
    title: 'Plataforma',
    list: [
      { name: 'Inicio', ruta: '/home', icono: Home },
      { 
        name: 'Preventivo', 
        ruta: '/dashboard-preventive', 
        icono: Activity,
        hasSubmenu: true,
        subItems: [
          { name: 'Mi Salud', ruta: '/dashboard-preventive', icono: Activity },
          { name: 'Historial', ruta: '/historial-controles', icono: BookOpen },
        ]
      },
      { 
        name: 'Controles', 
        ruta: '/controles', 
        icono: BookOpen,
        hasSubmenu: true,
        subItems: [
          { name: 'Presión Arterial', ruta: '/nueva-medicion/tipo?tipo=presion', icono: Heart },
          { name: 'Control de Peso', ruta: '/nueva-medicion/tipo?tipo=peso', icono: Scale },
          { name: 'Glicemia', ruta: '/nueva-medicion/tipo?tipo=glicemia', icono: Droplet },
        ]
      },
      { name: 'Citas', ruta: '/citas', icono: Calendar },
      { 
        name: 'Mensajes', 
        ruta: '/mensajes', 
        icono: Inbox,
        hasSubmenu: true,
        subItems: [
          { name: 'Bandeja', ruta: '/mensajes', icono: Inbox },
          { name: 'Controles', ruta: '/mensajes/controles', icono: Activity },
        ]
      },
      { name: 'Ayuda', ruta: '/ayuda', icono: HelpCircle },
    ]
  },
  {
    title: 'Cuenta',
    list: [
      { name: 'Perfil', ruta: '/perfil', icono: User },
    ]
  }
];

const profileMenuItems = [
  { label: 'Ver Perfil', action: 'profile', icon: User },
  { label: 'Configuración', action: 'settings', icon: Settings },
];

// --- METHODS ---

const toggleSubmenu = (name) => {
  if (props.collapsed) emit('toggle');
  openSubmenus.value[name] = !openSubmenus.value[name];
};

const closeMobile = () => {
  isMobileOpen.value = false;
};

const openMobileMenu = () => {
  isMobileOpen.value = true;
};

const esRutaActiva = (ruta) => route.path === ruta;

const esSubRutaActiva = (subItems) => {
  if (!subItems) return false;
  return subItems.some(subItem => {
    // Extract base path from query string routes
    const basePath = subItem.ruta.split('?')[0];
    return route.path === basePath || route.fullPath.includes(basePath);
  });
};

// Search Logic
const handleSearchClick = () => {
  if (props.collapsed) {
    emit('toggle');
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 100);
  } else {
    searchInputRef.value?.focus();
  }
};

const handleSearchKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleSearchClick();
  }
};

// Profile Logic
const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const handleSignOut = () => {
  userStore.logout();
  isProfileMenuOpen.value = false;
  router.push('/');
};

// Click Outside Logic for Profile Menu
const handleClickOutside = (event) => {
  if (profileContainerRef.value && !profileContainerRef.value.contains(event.target)) {
    isProfileMenuOpen.value = false;
  }
};

const handleProfileItemClick = (item) => {
  isProfileMenuOpen.value = false;
  
  if (item.action === 'profile') {
    showProfileOverlay.value = true;
  } else if (item.action === 'settings') {
    router.push('/perfil');
  } else if (item.href) {
    window.location.href = item.href;
  }
};

// Tooltip helpers
const showItemTooltip = (name) => {
  if (props.collapsed) {
    showTooltip.value = name;
  }
};

const hideItemTooltip = () => {
  showTooltip.value = '';
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('mousedown', handleClickOutside);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});
</script>

<template>
  <!-- Mobile Overlay -->
  <AnimatePresence>
    <Motion
      v-if="isMobileOpen"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
      @click="closeMobile"
    />
  </AnimatePresence>
  
  <!-- Sidebar Aside -->
  <Motion
    id="sidebar-container"
    is="aside"
    :initial="false"
    :animate="{
      width: collapsed ? '76px' : '280px',
      x: isMobileOpen ? 0 : 0
    }"
    :transition="{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }"
    class="fixed inset-y-2 left-2 z-50 flex flex-col h-[calc(100vh-16px)] bg-[#F9FAFB] rounded-2xl border border-gray-200/80 transition-transform duration-300 md:translate-x-0 shadow-lg"
    :class="isMobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Sidebar Header -->
    <div class="flex items-center h-[68px] shrink-0 px-4 relative">
      <!-- Logo Section -->
      <div 
        class="flex items-center overflow-hidden cursor-pointer transition-all duration-300 flex-1"
        :class="collapsed ? 'justify-center' : ''"
        @click="closeMobile"
      >
        <div 
          class="flex items-center justify-center transition-all duration-300 overflow-hidden"
          :class="collapsed ? 'w-10 h-10' : 'w-auto h-10'"
        >
          <img 
            src="/assets/logo_mio_purple.png" 
            alt="MIO" 
            class="object-contain transition-all duration-300"
            :class="collapsed ? 'w-8 h-8' : 'w-auto h-8'"
          />
        </div>
      </div>

      <!-- Collapse Toggle Button -->
      <button
        @click="emit('toggle')"
        @mouseenter="showTooltip = 'toggle'"
        @mouseleave="showTooltip = ''"
        class="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200 shadow-sm flex-shrink-0 ml-2 relative"
        :class="collapsed ? 'absolute -right-4 top-4 bg-white shadow-md' : ''"
      >
        <PanelLeft v-if="collapsed" :size="14" :stroke-width="2" />
        <ChevronLeft v-else :size="14" :stroke-width="2" />
        
        <!-- Tooltip for toggle button -->
        <AnimatePresence>
          <Motion
            v-if="showTooltip === 'toggle' && collapsed"
            :initial="{ opacity: 0, x: -5 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -5 }"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
          >
            Show Navigation
          </Motion>
        </AnimatePresence>
      </button>
      
      <!-- Mobile Close Button -->
      <button 
        @click="closeMobile" 
        class="md:hidden absolute right-4 text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <X :size="20" :stroke-width="2" />
      </button>
    </div>

    <!-- Search Bar - Jump to style -->
    <div class="px-4 mb-4 shrink-0">
      <div
        role="button"
        :tabindex="collapsed ? 0 : -1"
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-all duration-200 hover:border-gray-300 hover:shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10"
        :class="{ 'justify-center cursor-pointer': collapsed, 'cursor-text': !collapsed }"
        @click="handleSearchClick"
        @keydown="handleSearchKeyDown"
      >
        <Search :size="16" class="text-gray-400 flex-shrink-0" />
        
        <AnimatePresence>
          <Motion
            v-show="!collapsed"
            :initial="{ opacity: 0, width: 0 }"
            :animate="{ opacity: 1, width: 'auto' }"
            :exit="{ opacity: 0, width: 0 }"
            class="flex-1 flex items-center justify-between overflow-hidden"
          >
            <input
              ref="searchInputRef"
              type="text"
              placeholder="Jump to..."
              class="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
            <div class="flex items-center gap-1 flex-shrink-0">
              <kbd class="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                <Command :size="10" />
                <span>K</span>
              </kbd>
            </div>
          </Motion>
        </AnimatePresence>
        
        <!-- Tooltip for collapsed search -->
        <AnimatePresence>
          <Motion
            v-if="collapsed && showTooltip === 'search'"
            :initial="{ opacity: 0, x: -5 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -5 }"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50"
          >
            Search
          </Motion>
        </AnimatePresence>
      </div>
    </div>

    <!-- Menu -->
    <nav aria-label="Menú principal" class="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-6">
      <div v-for="(section, idx) in menuSections" :key="idx">
        <!-- Section Title -->
        <div v-if="collapsed" class="my-3 h-px bg-gray-200 mx-2"></div>
        <h2 
          v-else 
          class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
        >
          {{ section.title }}
        </h2>

        <!-- Menu Items -->
        <ul class="space-y-0.5">
          <li v-for="item in section.list" :key="item.name">
            <!-- Parent Item with Submenu -->
            <div v-if="item.hasSubmenu && !collapsed">
              <!-- Parent Item Header (Clickable to toggle) -->
              <button
                @click="toggleSubmenu(item.name)"
                class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative"
                :class="[
                  esRutaActiva(item.ruta) || esSubRutaActiva(item.subItems)
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                ]"
              >
                <!-- Icon Container -->
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  :class="[
                    esRutaActiva(item.ruta) || esSubRutaActiva(item.subItems)
                      ? 'bg-white shadow-sm border border-gray-200 text-violet-600'
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-gray-200 text-gray-500 group-hover:text-violet-600'
                  ]"
                >
                  <component :is="item.icono" :size="18" :stroke-width="2" />
                </div>

                <!-- Item Label -->
                <span class="whitespace-nowrap text-sm flex-1 text-left">{{ item.name }}</span>
                
                <!-- Chevron Indicator -->
                <ChevronDown 
                  :size="16" 
                  :stroke-width="2"
                  class="text-gray-400 transition-transform duration-200"
                  :class="openSubmenus[item.name] ? 'rotate-180' : ''"
                />
              </button>
              
              <!-- Submenu Items -->
              <AnimatePresence>
                <Motion
                  v-if="openSubmenus[item.name]"
                  :initial="{ opacity: 0, height: 0 }"
                  :animate="{ opacity: 1, height: 'auto' }"
                  :exit="{ opacity: 0, height: 0 }"
                  :transition="{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }"
                  class="overflow-hidden"
                >
                  <ul class="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-0.5">
                    <li v-for="subItem in item.subItems" :key="subItem.name">
                      <router-link
                        :to="subItem.ruta"
                        @click="closeMobile"
                        class="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                        :class="[
                          esRutaActiva(subItem.ruta.split('?')[0])
                            ? 'text-violet-600 font-semibold bg-violet-50/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
                        ]"
                      >
                        <component 
                          :is="subItem.icono" 
                          :size="14" 
                          :stroke-width="2"
                          :class="esRutaActiva(subItem.ruta.split('?')[0]) ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'"
                        />
                        <span class="whitespace-nowrap">{{ subItem.name }}</span>
                      </router-link>
                    </li>
                  </ul>
                </Motion>
              </AnimatePresence>
            </div>
            
            <!-- Collapsed Parent Item (shows tooltip with submenu info) -->
            <div 
              v-else-if="item.hasSubmenu && collapsed"
              class="relative"
              @mouseenter="showItemTooltip(item.name)"
              @mouseleave="hideItemTooltip"
            >
              <router-link
                :to="item.ruta"
                @click="closeMobile"
                class="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative"
                :class="[
                  esRutaActiva(item.ruta) || esSubRutaActiva(item.subItems)
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                ]"
              >
                <!-- Icon Container -->
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  :class="[
                    esRutaActiva(item.ruta) || esSubRutaActiva(item.subItems)
                      ? 'bg-white shadow-sm border border-gray-200 text-violet-600'
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-gray-200 text-gray-500 group-hover:text-violet-600'
                  ]"
                >
                  <component :is="item.icono" :size="18" :stroke-width="2" />
                </div>
              </router-link>
              
              <!-- Expanded Tooltip for Collapsed Submenu Parent -->
              <AnimatePresence>
                <Motion
                  v-if="showTooltip === item.name && collapsed"
                  :initial="{ opacity: 0, x: -5, scale: 0.95 }"
                  :animate="{ opacity: 1, x: 0, scale: 1 }"
                  :exit="{ opacity: 0, x: -5, scale: 0.95 }"
                  class="fixed left-[80px] bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl overflow-hidden"
                  :style="{ top: 'auto' }"
                >
                  <div class="py-2">
                    <div class="px-3 py-1.5 font-semibold border-b border-gray-700 mb-1">
                      {{ item.name }}
                    </div>
                    <router-link
                      v-for="subItem in item.subItems"
                      :key="subItem.name"
                      :to="subItem.ruta"
                      @click="closeMobile; hideItemTooltip()"
                      class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-800 transition-colors"
                    >
                      <component :is="subItem.icono" :size="12" :stroke-width="2" />
                      <span>{{ subItem.name }}</span>
                    </router-link>
                  </div>
                  <div class="absolute left-0 top-4 -translate-x-1 w-1.5 h-1.5 bg-gray-900 rotate-45"></div>
                </Motion>
              </AnimatePresence>
            </div>
            
            <!-- Regular Item (no submenu) -->
            <router-link
              v-else
              :to="item.ruta"
              @click="closeMobile"
              @mouseenter="showItemTooltip(item.name)"
              @mouseleave="hideItemTooltip"
              class="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative"
              :class="[
                esRutaActiva(item.ruta)
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              ]"
            >
              <!-- Icon Container -->
              <div 
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                :class="[
                  esRutaActiva(item.ruta)
                    ? 'bg-white shadow-sm border border-gray-200 text-violet-600'
                    : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-gray-200 text-gray-500 group-hover:text-violet-600'
                ]"
              >
                <component :is="item.icono" :size="18" :stroke-width="2" />
              </div>

              <!-- Item Label -->
              <AnimatePresence>
                <Motion 
                  v-show="!collapsed"
                  :initial="{ opacity: 0, x: -8 }"
                  :animate="{ opacity: 1, x: 0 }"
                  :exit="{ opacity: 0, x: -8 }"
                  :transition="{ duration: 0.2, delay: 0.05 }"
                  class="whitespace-nowrap text-sm"
                >
                  {{ item.name }}
                </Motion>
              </AnimatePresence>
              
              <!-- Active Indicator Dot -->
              <div 
                v-if="esRutaActiva(item.ruta) && !collapsed"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500"
              ></div>
            </router-link>
            
            <!-- Tooltip for collapsed regular items -->
            <AnimatePresence>
              <Motion
                v-if="showTooltip === item.name && collapsed && !item.hasSubmenu"
                :initial="{ opacity: 0, x: -5, scale: 0.95 }"
                :animate="{ opacity: 1, x: 0, scale: 1 }"
                :exit="{ opacity: 0, x: -5, scale: 0.95 }"
                class="fixed left-[80px] px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg"
                :style="{ top: 'auto' }"
              >
                {{ item.name }}
                <div class="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rotate-45"></div>
              </Motion>
            </AnimatePresence>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Profile Footer -->
    <div 
      ref="profileContainerRef"
      class="p-3 border-t border-gray-200 bg-[#F9FAFB] shrink-0 mt-auto"
    >
      <!-- Profile Dropdown Menu -->
      <AnimatePresence>
        <Motion
          v-if="isProfileMenuOpen"
          :initial="{ opacity: 0, y: 8, scale: 0.96 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 8, scale: 0.96 }"
          :transition="{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }"
          class="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
          :class="collapsed ? 'left-3 w-56' : 'left-3 right-3'"
          style="bottom: 80px;"
        >
          <div class="py-1.5">
            <!-- Menu Header -->
            <div class="px-3 py-2 border-b border-gray-100 mb-1">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Mi Cuenta</p>
            </div>

            <!-- Menu Items -->
            <button 
              v-for="item in profileMenuItems" 
              :key="item.label"
              @click="handleProfileItemClick(item)"
              class="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <component :is="item.icon" :size="16" class="text-gray-500" />
              <span>{{ item.label }}</span>
            </button>

            <div class="h-px bg-gray-100 my-1.5 mx-3"></div>

            <!-- Sign Out -->
            <button 
              @click="handleSignOut"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut :size="16" :stroke-width="2" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </Motion>
      </AnimatePresence>

      <!-- Profile Button -->
      <div 
        @click="toggleProfileMenu"
        class="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
        :class="{ 'justify-center': collapsed }"
      >
        <!-- Avatar -->
        <div class="relative flex-shrink-0">
          <div 
            class="w-9 h-9 rounded-full overflow-hidden transition-all duration-200 bg-gradient-to-br from-violet-100 to-purple-100 border-2 flex items-center justify-center"
            :class="[
              isProfileMenuOpen 
                ? 'border-violet-400 ring-2 ring-violet-100' 
                : 'border-gray-200 group-hover:border-violet-300'
            ]"
          >
            <img 
              v-if="userStore.usuario?.avatar" 
              :src="userStore.usuario.avatar" 
              class="w-full h-full object-cover" 
              alt="Avatar"
            />
            <span v-else class="text-sm font-semibold text-violet-600">
              {{ userStore.iniciales }}
            </span>
          </div>
          <!-- Online Indicator -->
          <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <!-- User Info -->
        <AnimatePresence>
          <Motion
            v-show="!collapsed"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            class="flex-1 min-w-0"
          >
            <p class="text-sm font-semibold text-gray-900 truncate">
              Hola, {{ userStore.firstName || 'Usuario' }}
            </p>
          </Motion>
        </AnimatePresence>
        
        <!-- More Icon -->
        <AnimatePresence>
          <Motion
            v-show="!collapsed"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
          >
            <MoreVertical 
              :size="16"
              class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            />
          </Motion>
        </AnimatePresence>
      </div>
    </div>

    <ProfileOverlay v-model:open="showProfileOverlay" />
  </Motion>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth transitions for all interactive elements */
.router-link-active {
  position: relative;
}

/* Custom focus styles */
*:focus-visible {
  outline: 2px solid rgba(139, 92, 246, 0.5);
  outline-offset: 2px;
}
</style>

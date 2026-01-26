<!-- src/components/layout/NavbarLateral.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
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
  Menu,
  X,
  MoreVertical,
  Settings,
  LogOut,
  Calendar
} from 'lucide-vue-next';

import { useUserStore } from '@/stores/tiendaUsuario';

// Props handling
const props = defineProps({
  visible: { type: Boolean, default: true },
  collapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'update:mobileOpen']);

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
import { useConfigStore } from '@/stores/tiendaConfig';
const configStore = useConfigStore();
import { computed } from 'vue';

const clientName = computed(() => configStore.clientName || 'MIO+');

// --- STATE ---
const openSubmenus = ref({});
const isMobileOpen = ref(false);
const isProfileMenuOpen = ref(false);
const searchInputRef = ref(null);
const profileContainerRef = ref(null);



// --- MENU DATA ---
const menuSections = [
  {
    title: 'Plataforma',
    list: [
      { name: 'Inicio', ruta: '/home', icono: Home },
      { name: 'Preventivo', ruta: '/dashboard-preventive', icono: Activity },
      { name: 'Controles', ruta: '/controles', icono: BookOpen },
      { name: 'Citas', ruta: '/citas', icono: Calendar },
      { name: 'Mensajes', ruta: '/mensajes', icono: Inbox },
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

import ProfileOverlay from '@/components/profile/ProfileOverlay.vue';

const showProfileOverlay = ref(false);

const profileMenuItems = [
  { label: 'Ver Perfil', action: 'profile', icon: User },
  { label: 'Configuración de la cuenta', action: 'settings', icon: Settings },
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

// Search Logic
const handleSearchClick = () => {
  if (props.collapsed) {
    emit('toggle');
    // Wait for animation to start/finish slightly before focusing
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
        // Por ahora redirige a perfil, luego implementar settings
        router.push('/perfil');
    } else if (item.href) {
        window.location.href = item.href;
    }
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
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="closeMobile"
    />
  </AnimatePresence>
  
  <!-- Mobile Header -->
  <div 
    class="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-md"
  >
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-primary-foreground font-bold">M</div>
      <span class="font-bold text-lg text-sidebar-foreground tracking-wide">{{ clientName }}</span>
    </div>
    <button @click="openMobileMenu" class="text-sidebar-foreground hover:text-primary">
      <Menu :size="24" :stroke-width="2" />
    </button>
  </div>

  <!-- Sidebar Aside -->
  <Motion
    id="sidebar-container"
    is="aside"
    :initial="false"
    :animate="{
      width: collapsed ? '80px' : '288px',
      x: isMobileOpen ? 0 : 0
    }"
    :transition="{ duration: 0.3, ease: 'easeInOut' }"
    class="fixed inset-y-0 left-0 z-50 flex flex-col h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0"
    :class="isMobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Sidebar Header -->
    <div class="flex items-center h-24 shrink-0 px-6 relative justify-start">
      <div 
        class="flex items-center gap-3 overflow-hidden cursor-pointer transition-all duration-300" 
        :class="collapsed ? 'w-full justify-center' : ''"
        @click="closeMobile"
      >
        <img 
          src="/assets/logo_mio_purple.png" 
          alt="MIO Logo" 
          width="48"
          height="48"
          loading="lazy"
          decoding="async"
          class="h-12 w-auto object-contain transition-all duration-300"
          :class="collapsed ? 'scale-110' : ''"
        />
      </div>

      <button
        @click="emit('toggle')"
        class="hidden md:flex absolute -right-3 top-9 bg-primary text-primary-foreground rounded-full p-1 border border-sidebar-border hover:bg-primary/90 transition-colors shadow-lg z-50"
      >
        <ChevronRight v-if="collapsed" :size="14" :stroke-width="2" />
        <ChevronLeft v-else :size="14" :stroke-width="2" />
      </button>
      
      <button @click="closeMobile" class="md:hidden absolute right-4 text-sidebar-foreground hover:text-primary">
        <X :size="24" :stroke-width="2" />
      </button>
    </div>

    <!-- Sidebar Search -->
    <div class="px-5 mb-6 relative group shrink-0">
        <div
            role="button"
            :tabindex="collapsed ? 0 : -1"
            class="flex items-center rounded-xl overflow-hidden transition-all duration-300 focus:outline-none h-[48px] w-full bg-sidebar-accent border border-transparent focus-within:border-primary/50"
            :style="{ cursor: collapsed ? 'pointer' : 'text' }"
            @click="handleSearchClick"
            @keydown="handleSearchKeyDown"
        >
            <div class="w-12 h-full flex items-center justify-center flex-shrink-0 pointer-events-none text-muted-foreground">
                <Search :size="18" />
            </div>

            <input
                ref="searchInputRef"
                :tabindex="collapsed ? -1 : 0"
                type="search"
                placeholder="Buscar..."
                class="bg-transparent border-none outline-none text-sidebar-foreground placeholder-muted-foreground text-sm h-full w-full pr-3 transition-all duration-300 ease-in-out origin-left font-medium"
                :class="collapsed ? 'opacity-0 scale-x-0 w-0 p-0' : 'opacity-100 scale-x-100'"
            />
        </div>
    </div>

    <!-- Menu -->
    <nav aria-label="Menú principal" class="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-8">
      <div v-for="(section, idx) in menuSections" :key="idx">
        <div v-if="collapsed" class="my-4 h-px bg-sidebar-border mx-2"></div>
        <h2 
          v-else 
          class="px-2 mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground animate-fade-in whitespace-nowrap"
        >
          {{ section.title }}
        </h2>

        <ul class="space-y-1">
          <li v-for="item in section.list" :key="item.name">
            <router-link
              :to="item.ruta"
              @click="closeMobile"
              class="group flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 relative"
              :class="[
                esRutaActiva(item.ruta)
                  ? 'text-sidebar-primary-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent font-medium'
              ]"
            >
               <!-- Shared Background -->
               <Motion
                  v-if="esRutaActiva(item.ruta)"
                  layoutId="sidebar-active-item"
                  class="absolute inset-0 bg-sidebar-primary rounded-xl shadow-md shadow-primary/20 z-0"
                  :initial="false"
                  :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
               />
               
               <!-- Inactive Hover Effect -->
               <Motion
                  v-if="!esRutaActiva(item.ruta)"
                  class="absolute inset-0 bg-sidebar-accent/50 rounded-xl z-0 opacity-0"
                  :whileHover="{ opacity: 1, scale: 0.98 }"
                  :transition="{ duration: 0.2 }"
               />

               <span class="relative z-10 shrink-0 transition-all duration-300 group-hover:scale-105" 
                  :class="[collapsed ? 'mx-auto' : '', esRutaActiva(item.ruta) ? 'text-sidebar-primary-foreground' : 'text-current']"
               >
                 <component :is="item.icono" :size="20" :stroke-width="2" />
               </span>

               <AnimatePresence>
                 <Motion 
                    v-show="!collapsed"
                    :initial="{ opacity: 0, x: -10 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :exit="{ opacity: 0, x: -10 }"
                    class="whitespace-nowrap z-10 relative"
                 >
                   {{ item.name }}
                 </Motion>
               </AnimatePresence>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Profile Footer with Context Menu -->
    <div 
        ref="profileContainerRef"
        class="p-5 border-t border-sidebar-border bg-sidebar shrink-0 mt-auto relative"
    >
         <!-- Context Menu -->
         <AnimatePresence>
            <Motion
                v-if="isProfileMenuOpen"
                :initial="{ opacity: 0, y: 10, scale: 0.95 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, y: 10, scale: 0.95 }"
                :transition="{ duration: 0.2 }"
                class="absolute bottom-full mb-4 bg-popover border border-sidebar-border rounded-xl shadow-2xl overflow-hidden z-50 w-64"
                :style="collapsed ? 'left-20' : 'left-4 right-4'"
            >
                <div class="py-2">
                    <div class="px-4 py-2 border-b border-sidebar-border mb-1">
                        <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Mi Cuenta</p>
                    </div>

                    <button 
                        v-for="item in profileMenuItems" 
                        :key="item.label"
                        @click="handleProfileItemClick(item)"
                        class="w-full text-left group flex items-center gap-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-sidebar-accent transition-colors relative"
                    >
                        <component :is="item.icon" :size="18" class="text-primary transition-colors" />
                        <span class="font-medium">{{ item.label }}</span>
                        <span v-if="item.badge" class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{{ item.badge }}</span>
                    </button>

                    <div class="h-px bg-sidebar-border my-1 mx-2"></div>

                    <button 
                        @click="handleSignOut"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut :size="18" :stroke-width="2" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </Motion>
         </AnimatePresence>

         <!-- Profile Button -->
         <div 
            @click="toggleProfileMenu"
            class="flex items-center gap-3 rounded-xl transition-all duration-300 ease-in-out cursor-pointer group"
            :class="{ 'justify-center': collapsed }"
         >
             <div class="relative flex-shrink-0">
                 <div 
                    class="w-10 h-10 rounded-full overflow-hidden ring-2 transition-all duration-300 ease-out bg-white bg-cover grayscale group-hover:grayscale-0"
                    :class="[
                        isProfileMenuOpen 
                            ? 'ring-primary' 
                            : 'ring-transparent'
                    ]"
                 >
                     <img v-if="userStore.usuario?.avatar" :src="userStore.usuario.avatar" class="w-full h-full object-cover" />
                     <div v-else class="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-bold">
                        {{ userStore.iniciales }}
                     </div>
                 </div>
                 <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-sidebar rounded-full"></div>
             </div>
             
             <div v-show="!collapsed" class="flex-1 overflow-hidden transition-opacity duration-300">
                 <p 
                    class="text-sm font-bold truncate transition-colors text-sidebar-foreground"
                 >
                    {{ userStore.nombreCompleto }}
                 </p>
                 <p class="text-xs text-muted-foreground font-medium truncate">{{ userStore.usuario?.email || '' }}</p>
             </div>
             
             <MoreVertical 
                v-show="!collapsed" 
                :size="18"
                class="text-muted-foreground hover:text-sidebar-foreground transition-colors"
             />
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
.shadow-teal-glow {
    box-shadow: 0 0 10px rgba(45, 212, 191, 0.5);
}
</style>
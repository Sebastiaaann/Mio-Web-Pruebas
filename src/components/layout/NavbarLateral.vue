<!-- src/components/layout/NavbarLateral.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Motion, AnimatePresence } from 'motion-v';

// Props handling
const props = defineProps({
  visible: { type: Boolean, default: true },
  collapsed: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'update:mobileOpen']);

const router = useRouter();
const route = useRoute();

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
      { name: 'Inicio', ruta: '/dashboard', icono: 'home' },
      { name: 'Mensajes', ruta: '/mensajes', icono: 'activity' },
      { name: 'Controles', ruta: '/controles', icono: 'book' },
      { name: 'Help', ruta: '/help', icono: 'book' },
    ]
  },
  {
    title: 'Cuenta',
    list: [
      { name: 'Perfil', ruta: '/perfil', icono: 'user' },
    ]
  }
];

const profileMenuItems = [
  { label: 'Ver Perfil', href: '#', icon: 'pi pi-user' },
  { label: 'Configuración de la cuenta', href: '#', icon: 'pi pi-cog' },
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
    // console.log("Signing out...");
    isProfileMenuOpen.value = false;
    router.push('/');
};

// Click Outside Logic for Profile Menu
const handleClickOutside = (event) => {
  if (profileContainerRef.value && !profileContainerRef.value.contains(event.target)) {
    isProfileMenuOpen.value = false;
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
    class="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 border-b border-slate-800 bg-[#0B1121]/95 backdrop-blur-md"
  >
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-violet-700 grid place-items-center text-white font-bold">M</div>
      <span class="font-bold text-lg text-white tracking-wide">MIO+</span>
    </div>
    <button @click="openMobileMenu" class="text-slate-400 hover:text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
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
    class="fixed inset-y-0 left-0 z-50 flex flex-col h-full border-r border-slate-800/50 bg-[#0B1121] text-slate-300 transition-transform duration-300 md:translate-x-0"
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
          class="h-12 object-contain transition-all duration-300"
          :class="collapsed ? 'scale-110' : ''"
        />
      </div>

      <button
        @click="emit('toggle')"
        class="hidden md:flex absolute -right-3 top-9 bg-[#8B5CF6] text-white rounded-full p-1 border border-slate-900 hover:bg-[#7C3AED] transition-colors shadow-lg z-50"
      >
        <svg v-if="collapsed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <button @click="closeMobile" class="md:hidden absolute right-4 text-slate-400 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Sidebar Search -->
    <div class="px-5 mb-6 relative group shrink-0">
        <div
            role="button"
            :tabindex="collapsed ? 0 : -1"
            class="flex items-center rounded-xl overflow-hidden transition-all duration-300 focus:outline-none h-[48px] w-full bg-[#1A2035] border border-transparent focus-within:border-[#8B5CF6]/50"
            :style="{ cursor: collapsed ? 'pointer' : 'text' }"
            @click="handleSearchClick"
            @keydown="handleSearchKeyDown"
        >
            <div class="w-12 h-full flex items-center justify-center flex-shrink-0 pointer-events-none text-slate-500">
                <i class="pi pi-search text-lg"></i>
            </div>

            <input
                ref="searchInputRef"
                :tabindex="collapsed ? -1 : 0"
                type="search"
                placeholder="Buscar..."
                class="bg-transparent border-none outline-none text-slate-300 placeholder-slate-500 text-sm h-full w-full pr-3 transition-all duration-300 ease-in-out origin-left font-medium"
                :class="collapsed ? 'opacity-0 scale-x-0 w-0 p-0' : 'opacity-100 scale-x-100'"
            />
        </div>
    </div>

    <!-- Menu -->
    <div class="flex-1 overflow-y-auto scrollbar-hide px-4 py-2 space-y-8">
      <div v-for="(section, idx) in menuSections" :key="idx">
        <div v-if="collapsed" class="my-4 h-px bg-slate-800/50 mx-2"></div>
        <h2 
          v-else 
          class="px-2 mb-3 text-[11px] font-bold uppercase tracking-widest text-[#64748B] animate-fade-in whitespace-nowrap"
        >
          {{ section.title }}
        </h2>

        <ul class="space-y-1">
          <li v-for="item in section.list" :key="item.name">
            <router-link
              :to="item.ruta"
              @click="closeMobile"
              class="group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden"
              :class="[
                esRutaActiva(item.ruta)
                  ? 'text-white font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2035] font-medium'
              ]"
            >
               <span class="relative z-10 shrink-0 text-xl transition-all duration-300 group-hover:scale-105" 
                  :class="[collapsed ? 'mx-auto' : '', esRutaActiva(item.ruta) ? 'text-[#8B5CF6]' : 'text-current']"
               >
                 <i v-if="item.icono === 'home'" class="pi pi-home"></i>
                 <i v-if="item.icono === 'activity'" class="pi pi-chart-line"></i>
                 <i v-if="item.icono === 'book'" class="pi pi-book"></i>
                 <i v-if="item.icono === 'user'" class="pi pi-user"></i>
               </span>

               <AnimatePresence>
                 <Motion 
                    v-show="!collapsed"
                    :initial="{ opacity: 0, x: -10 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :exit="{ opacity: 0, x: -10 }"
                    class="whitespace-nowrap"
                 >
                   {{ item.name }}
                 </Motion>
               </AnimatePresence>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Profile Footer with Context Menu -->
    <div 
        ref="profileContainerRef"
        class="p-5 border-t border-slate-800/50 bg-[#0B1121] shrink-0 mt-auto relative"
    >
         <!-- Context Menu -->
         <AnimatePresence>
            <Motion
                v-if="isProfileMenuOpen"
                :initial="{ opacity: 0, y: 10, scale: 0.95 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, y: 10, scale: 0.95 }"
                :transition="{ duration: 0.2 }"
                class="absolute bottom-full mb-4 bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 w-64"
                :style="collapsed ? 'left-20' : 'left-4 right-4'"
            >
                <div class="py-2">
                    <div class="px-4 py-2 border-b border-slate-700/50 mb-1">
                        <p class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mi Cuenta</p>
                    </div>

                    <a 
                        v-for="item in profileMenuItems" 
                        :key="item.label"
                        :href="item.href"
                        @click="isProfileMenuOpen = false"
                        class="group flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors relative"
                    >
                        <i :class="item.icon" class="text-lg text-[#8B5CF6] transition-colors"></i>
                        <span class="font-medium">{{ item.label }}</span>
                        <span v-if="item.badge" class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">{{ item.badge }}</span>
                    </a>

                    <div class="h-px bg-slate-700/50 my-1 mx-2"></div>

                    <button 
                        @click="handleSignOut"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <i class="pi pi-sign-out text-lg"></i>
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
                            ? 'ring-[#8B5CF6]' 
                            : 'ring-transparent'
                    ]"
                 ></div>
                 <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B1121] rounded-full"></div>
             </div>
             
             <div v-show="!collapsed" class="flex-1 overflow-hidden transition-opacity duration-300">
                 <p 
                    class="text-sm font-bold truncate transition-colors text-white"
                 >
                    Usuario Demo
                 </p>
                 <p class="text-xs text-[#64748B] font-medium truncate">demo@mio.cl</p>
             </div>
             
             <i 
                v-show="!collapsed" 
                class="pi pi-ellipsis-v text-slate-500 hover:text-white transition-colors"
             ></i>
         </div>
    </div>

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
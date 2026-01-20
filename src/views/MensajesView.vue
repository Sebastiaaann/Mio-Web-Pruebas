<script setup>
/**
 * MensajesView - Bandeja de Mensajes estilo Inbox
 */
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Motion, AnimatePresence } from 'motion-v'
import { useMensajesStore } from '@/stores/tiendaMensajes'
import { useHealthStore } from '@/stores/tiendaSalud'
import { ChevronRight, Inbox } from 'lucide-vue-next'

const springTransition = {
  type: "spring",
  duration: 0.5,
  bounce: 0
}

const mensajesStore = useMensajesStore()
const healthStore = useHealthStore()
const { sections: SECTIONS } = storeToRefs(mensajesStore)

onMounted(async () => {
  await healthStore.fetchControles()
  mensajesStore.initFromControls()
})

// Secciones abiertas (por defecto "alertas" y "recordatorios")
const openSections = ref(['alerts', 'results', 'reminders'])

function toggleSection(id) {
  if (openSections.value.includes(id)) {
    openSections.value = openSections.value.filter(item => item !== id)
  } else {
    openSections.value = [...openSections.value, id]
  }
}

function isSectionOpen(id) {
  return openSections.value.includes(id)
}
</script>

<template>
  <div class="w-full h-full min-h-screen font-sans p-4 md:p-6">
    <div class="bg-white dark:bg-neutral-900 h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
      
      <!-- Header -->
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div class="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
          <Inbox class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          Bandeja de Entrada
        </h1>
      </div>
      
      <!-- Column Headers -->
      <div class="grid grid-cols-[80px_1fr_1.5fr] md:grid-cols-[100px_1.2fr_1.5fr] px-6 py-3 border-b border-gray-100 dark:border-neutral-800 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        <div></div>
        <div>ID / Tipo</div>
        <div>Detalle</div>
      </div>

      <!-- Sections -->
      <Motion layout class="flex flex-col">
        <Motion 
          v-for="section in SECTIONS"
          :key="section.id"
          layout
          :initial="false"
          class="border-b border-gray-50 dark:border-neutral-800/50 last:border-none bg-white dark:bg-neutral-900 overflow-hidden"
        >
          <!-- Section Header -->
          <button
            @click="toggleSection(section.id)"
            class="w-full flex items-center px-4 py-4 hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer relative z-10"
          >
            <Motion
              :animate="{ rotate: isSectionOpen(section.id) ? 90 : 0 }"
              :transition="springTransition"
              class="mr-3 text-gray-400 dark:text-gray-500"
            >
              <ChevronRight :size="14" :stroke-width="3" />
            </Motion>

            <div class="flex items-center gap-3">
              <component 
                :is="section.icon" 
                :size="14" 
                :class="section.iconColor"
              />
              <span 
                class="text-[11px] font-bold tracking-wider uppercase"
                :class="section.iconColor"
              >
                {{ section.title }}
              </span>
              <span class="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {{ section.count }}
              </span>
            </div>
          </button>

          <!-- Section Content -->
          <AnimatePresence :initial="false" mode="sync">
            <Motion
              v-if="isSectionOpen(section.id)"
              key="content"
              :initial="{ height: 0, opacity: 0 }"
              :animate="{ height: 'auto', opacity: 1 }"
              :exit="{ height: 0, opacity: 0 }"
              :transition="springTransition"
              class="overflow-hidden"
            >
              <div class="pb-2">
                <Motion
                  v-for="(item, i) in section.items"
                  :key="item.id"
                  layout="position"
                  :initial="{ x: -10, opacity: 0 }"
                  :animate="{ x: 0, opacity: 1 }"
                  :exit="{ x: -10, opacity: 0 }"
                  :transition="{ ...springTransition, delay: i * 0.03 }"
                  class="grid grid-cols-[80px_1fr_1.5fr] md:grid-cols-[100px_1.2fr_1.5fr] px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-neutral-800/30 items-center cursor-pointer transition-colors border-b border-gray-50 dark:border-neutral-800/30 last:border-none"
                >
                  <!-- Issue ID -->
                  <div class="flex items-center">
                    <span class="text-[11px] text-gray-400 dark:text-gray-500 font-mono tracking-tight">
                      {{ item.id }}
                    </span>
                  </div>
                  
                  <!-- Icon + Title -->
                  <div class="flex items-center gap-3">
                    <div 
                      class="p-1.5 rounded-md flex-shrink-0"
                      :class="item.iconBg"
                    >
                      <component 
                        :is="item.icon" 
                        :size="14" 
                        :class="item.iconColor"
                      />
                    </div>
                    <span class="text-[13px] text-gray-800 dark:text-gray-200 font-medium truncate">
                      {{ item.title }}
                    </span>
                  </div>
                  
                  <!-- Description -->
                  <div class="text-[12px] text-gray-500 dark:text-gray-400 truncate pr-4">
                    {{ item.description }}
                  </div>
                </Motion>
              </div>
            </Motion>
          </AnimatePresence>
        </Motion>
      </Motion>
      
    </div>
  </div>
</template>

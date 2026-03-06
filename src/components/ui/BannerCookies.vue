<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { Button } from '@/components/ui/button'
import {
  CLAVE_AVISO_COOKIES_LEGACY,
  CLAVE_AVISO_COOKIES_VISTO,
  NOMBRE_COOKIE_SESION
} from '@/config/legal'

// Persistir solo que el usuario ya vio el aviso, sin tratarlo como consentimiento.
const avisoCookiesVisto = useLocalStorage(CLAVE_AVISO_COOKIES_VISTO, false)
const mostrarBanner = computed(() => !avisoCookiesVisto.value)

onMounted(() => {
  if (typeof window === 'undefined' || avisoCookiesVisto.value) return

  const valorLegacy = window.localStorage.getItem(CLAVE_AVISO_COOKIES_LEGACY)
  if (valorLegacy === 'true') {
    avisoCookiesVisto.value = true
    window.localStorage.removeItem(CLAVE_AVISO_COOKIES_LEGACY)
  }
})

function marcarAvisoComoVisto() {
  avisoCookiesVisto.value = true
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="mostrarBanner"
        class="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        role="region"
        aria-label="Aviso de cookies"
      >
        <Motion
          :initial="{ scale: 0.95, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :transition="{ duration: 0.3, delay: 0.5 }"
        >
          <div
            class="mx-auto max-w-screen-lg backdrop-blur-lg bg-background/95 border border-border/50 rounded-xl shadow-2xl"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5">
              <!-- Icono -->
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-primary"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 14v.01" />
                  </svg>
                </div>
              </div>

              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <p class="text-sm sm:text-base text-foreground leading-relaxed">
                  Usamos la cookie de sesión
                  <code class="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">{{ NOMBRE_COOKIE_SESION }}</code>
                  para mantener tu acceso seguro y guardamos una preferencia local funcional para no
                  volver a mostrar este aviso. No usamos tracking ni cookies de terceros.
                  <router-link
                    to="/politica-cookies"
                    class="text-primary hover:underline font-medium inline-flex items-center gap-1 ml-1"
                  >
                    Más información
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </router-link>
                </p>
              </div>

              <!-- Botón -->
              <div class="flex-shrink-0 w-full sm:w-auto">
                <Button
                  @click="marcarAvisoComoVisto"
                  class="w-full sm:w-auto"
                  size="default"
                >
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </Transition>
  </Teleport>
</template>

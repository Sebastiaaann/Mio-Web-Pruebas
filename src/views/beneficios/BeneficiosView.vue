<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTiendaServicios } from '@/stores/tiendaServicios'
import { useConfigStore } from '@/stores/tiendaConfig'
import { useBannersFiltrados } from '@/composables/useBannersFiltrados'
import { useTheme } from '@/composables/useTheme'
import HeaderCompleto from '@/components/ui/HeaderCompleto.vue'

const serviciosStore = useTiendaServicios()
const configStore = useConfigStore()

const { servicios } = storeToRefs(serviciosStore)
const planActivo = computed(() => configStore.planActivo || 'esencial')

interface BannerItem {
  id?: string | number
  title?: string
  titulo?: string
  nombre?: string
  image?: string
  url?: string
  description?: string
  descripcion?: string
  summary?: string
  texto?: string
  subtitulo?: string
  subtitulo_banner?: string
  main_text?: string
}

const { bannersFiltrados } = useBannersFiltrados(servicios, planActivo)
const { themeClass, colors, isMutual } = useTheme()

const tieneBanners = computed(() => bannersFiltrados.value.length > 0)
const estaCargandoServicios = computed(() => serviciosStore.cargando)
const cantidadBanners = computed(() => bannersFiltrados.value.length)
const nombrePlan = computed(() => (isMutual.value ? 'Plan Mutual' : 'Plan Esencial'))
const brilloPrimario = computed(() => ({
  background: `radial-gradient(circle, ${colors.value.primary}33 0%, transparent 70%)`
}))
const brilloSecundario = computed(() => ({
  background: `radial-gradient(circle, ${colors.value.accent}2b 0%, transparent 70%)`
}))
const brilloTerciario = computed(() => ({
  background: `radial-gradient(circle, ${colors.value.primaryLight}40 0%, transparent 70%)`
}))

function obtenerDescripcionBanner(banner: BannerItem): string {
  const opciones = [
    banner.description,
    banner.descripcion,
    banner.summary,
    banner.texto,
    banner.subtitulo,
    banner.subtitulo_banner,
    banner.main_text
  ]

  const valor = opciones.find(item => typeof item === 'string' && item.trim().length > 0)
  return String(valor || '')
}

function obtenerTituloBanner(banner: BannerItem): string {
  return String(banner.title || banner.titulo || banner.nombre || 'Beneficio destacado')
}

onMounted(async () => {
  if (!serviciosStore.hayServicios && !serviciosStore.cargando) {
    await serviciosStore.cargarServicios()
  }
})

watch(() => configStore.planActivo, async (nuevoPlan, planAnterior) => {
  if (!nuevoPlan || nuevoPlan === planAnterior) return
  await serviciosStore.cargarServicios()
})
</script>

<template>
  <div :class="themeClass" class="min-h-screen flex flex-col beneficios-bg" style="font-family: 'Cabinet Grotesk', sans-serif;">
    <HeaderCompleto
      titulo="Beneficios"
      subtitulo="Explora los beneficios disponibles para tu plan"
      :mostrar-saludo="false"
    />

    <main class="flex-1 overflow-y-auto px-6 pb-16 pt-10">
      <div class="max-w-6xl mx-auto space-y-10">
        <section class="beneficios-hero relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-lg p-8 sm:p-10">
          <div class="absolute -top-24 right-0 h-64 w-64 rounded-full blur-3xl" :style="brilloPrimario" />
          <div class="absolute -bottom-16 left-0 h-56 w-56 rounded-full blur-3xl" :style="brilloSecundario" />
          <div class="absolute top-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full blur-2xl" :style="brilloTerciario" />

          <div class="relative z-10 flex flex-col gap-6">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <span class="inline-flex h-2 w-2 rounded-full" :style="{ backgroundColor: colors.primary }"></span>
              {{ nombrePlan }} · {{ cantidadBanners }} beneficios
            </div>
            <div class="space-y-3">
              <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tus beneficios destacados</h2>
              <p class="text-sm sm:text-base text-slate-600 max-w-2xl">
                Explora experiencias, actividades y servicios pensados para tu bienestar. Todo en un solo lugar.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="beneficios-chip">Bienestar</span>
              <span class="beneficios-chip">Ahorro</span>
              <span class="beneficios-chip">Actividades</span>
              <span class="beneficios-chip">Exclusivo</span>
            </div>
          </div>
        </section>

        <section v-if="estaCargandoServicios" class="grid gap-6">
          <div class="card-premium p-6 animate-pulse">
            <div class="h-6 w-40 bg-slate-200 rounded mb-3"></div>
            <div class="h-4 w-72 bg-slate-200 rounded mb-6"></div>
            <div class="h-52 bg-slate-200 rounded-2xl"></div>
          </div>
          <div class="card-premium p-6 animate-pulse">
            <div class="h-6 w-48 bg-slate-200 rounded mb-3"></div>
            <div class="h-4 w-64 bg-slate-200 rounded mb-6"></div>
            <div class="h-52 bg-slate-200 rounded-2xl"></div>
          </div>
        </section>

        <section v-else-if="tieneBanners" class="space-y-8">
          <article
            v-for="(banner, index) in bannersFiltrados"
            :key="banner.id || banner.title"
            class="beneficios-card group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)]"
          >
            <div class="relative w-full h-56 sm:h-64 md:h-80" style="background: linear-gradient(135deg, #0F172A, #1F2937)">
              <img
                v-if="banner.image"
                :src="banner.image"
                :alt="obtenerTituloBanner(banner)"
                loading="eager"
                decoding="async"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />

              <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

              <div class="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Beneficio</span>
                  <span class="beneficios-tag bg-white/15 text-white border border-white/30">Exclusivo</span>
                </div>

                <div class="max-w-xl space-y-4">
                  <div class="inline-flex rounded-xl px-4 py-2 backdrop-blur-md bg-black/55">
                    <h3 class="font-bold text-xl sm:text-3xl tracking-tight text-white">
                      {{ obtenerTituloBanner(banner) }}
                    </h3>
                  </div>

                  <p v-if="obtenerDescripcionBanner(banner)" class="text-sm sm:text-base leading-relaxed text-white/85">
                    {{ obtenerDescripcionBanner(banner) }}
                  </p>

                  <div class="flex flex-wrap items-center gap-3">
                    <a
                      :href="banner.url || '#"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 bg-white text-slate-900 hover:bg-slate-100"
                    >
                      <span>Ver más información</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-full border border-white/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white"
                    >
                      Guardar beneficio
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="beneficios-divider" />
            <div class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span class="inline-flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: colors.primary }"></span>
                  Beneficio {{ index + 1 }} de {{ cantidadBanners }}
                </span>
                <span class="hidden sm:inline-flex">•</span>
                <span>Disponible para {{ nombrePlan }}</span>
              </div>
              <span class="text-xs font-semibold text-slate-700">Actualizado recientemente</span>
            </div>
          </article>
        </section>

        <section v-else class="bg-white rounded-3xl border border-slate-200/70 p-10 text-center shadow-sm">
          <p class="text-slate-600">No hay beneficios disponibles para este plan.</p>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.beneficios-bg {
  background: radial-gradient(circle at top left, rgba(226, 232, 240, 0.9), transparent 55%),
    radial-gradient(circle at 20% 80%, rgba(148, 163, 184, 0.25), transparent 50%),
    #f8fafc;
}

.beneficios-hero {
  box-shadow: 0 30px 60px -45px rgba(15, 23, 42, 0.45);
}

.beneficios-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 8px 20px -15px rgba(15, 23, 42, 0.25);
}

.beneficios-card {
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.beneficios-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 35px 70px -45px rgba(15, 23, 42, 0.6);
}

.beneficios-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.5), transparent);
}

.beneficios-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>

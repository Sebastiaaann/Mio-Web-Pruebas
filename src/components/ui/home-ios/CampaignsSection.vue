<script setup>
/**
 * CampaignsSection - Sección de Campañas de Salud estilo iOS
 * Reemplaza Servicios Principales con campañas dinámicas de la API
 */
import { Motion } from 'motion-v'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

const { prefersReduced } = usePrefersReducedMotion()
import { ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['startCampaign'])
</script>

<template>
  <section>
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="prefersReduced ? { duration: 0.001 } : { duration: 0.5, delay: 0.1 }"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl text-gray-800" style="font-weight: 425;">Tus Campañas de Salud</h3>
          <p class="text-gray-500 text-sm">Operativos y evaluaciones disponibles</p>
        </div>
        
      </div>
    </Motion>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div 
        v-for="i in 3" 
        :key="i"
        class="campaign-card-skeleton animate-pulse"
      >
        <div class="flex items-center gap-4 p-4">
          <div class="w-16 h-10 bg-gray-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="!campaigns.length" 
      class="campaign-card-empty p-8 text-center"
    >
      <div class="text-4xl mb-3">🎯</div>
      <p class="text-gray-600 font-medium">No hay campañas activas</p>
      <p class="text-gray-400 text-sm">Te notificaremos cuando haya nuevas disponibles</p>
    </div>

    <!-- Campaigns List -->
    <div v-else class="space-y-4">
      <Motion
        v-for="(campaign, index) in campaigns"
        :key="campaign.id"
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="prefersReduced ? { duration: 0.001 } : { duration: 0.4, delay: 0.1 + (index * 0.1) }"
      >
        <component
          :is="campaign.survey_url ? 'a' : 'div'"
          :href="campaign.survey_url || undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="campaign-card group"
          :class="campaign.survey_url ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white' : 'cursor-default opacity-80'"
          :aria-label="campaign.survey_url ? `Abrir campaña: ${campaign.name}` : `Campaña no disponible: ${campaign.name}`"
          @click="campaign.survey_url && emit('startCampaign', campaign)"
        >
          <div class="flex items-center gap-4">
            <!-- Logo -->
            <div class="campaign-logo flex-shrink-0">
              <img 
                v-if="campaign.logo"
                :src="campaign.logo" 
                :alt="campaign.name"
                width="64" height="40"
                loading="lazy" decoding="async"
                class="w-16 h-10 object-contain"
              />
              <div 
                v-else 
                class="w-16 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center"
              >
                <span class="text-purple-600 text-lg">🩺</span>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-800 truncate">
                {{ campaign.name }}
              </h4>
              <p class="text-sm text-gray-500 truncate">
                {{ campaign.description }}
              </p>
            </div>

            <!-- CTA -->
            <span class="campaign-cta flex-shrink-0 flex items-center gap-1">
              <span>COMENZAR AHORA</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </span>
          </div>
        </component>
      </Motion>
    </div>
  </section>
</template>

<style scoped>
.campaign-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.12);
  border-color: rgba(147, 51, 234, 0.2);
}

.campaign-logo {
  background: white;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.campaign-cta {
  color: #0d9488; /* Teal color from the app */
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(13, 148, 136, 0.08);
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.campaign-cta:hover {
  background: rgba(13, 148, 136, 0.15);
}

.campaign-card-skeleton {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.campaign-card-empty {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}
</style>

<script setup>
/**
 * WizardView - Vista que envuelve el DynamicWizard
 * Recibe el protocol_id desde los query params y renderiza el wizard
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DynamicWizard from '@/components/wizard/DynamicWizard.vue'

const route = useRoute()
const router = useRouter()

// Obtener protocol_id desde query params
const protocolId = computed(() => route.query.protocol)
const planId = computed(() => route.query.planId)
const planName = computed(() => route.query.planName)

// Redirigir si no hay protocol_id
if (!protocolId.value) {
  router.replace('/nueva-medicion/tipo')
}

// Manejar cierre del wizard
function handleClose() {
  router.push('/dashboard')
}

// Manejar completado
function handleComplete(data) {
  console.log('Wizard completado:', data)
  // Opcional: Mostrar mensaje de éxito o redirigir
}
</script>

<template>
  <DynamicWizard
    v-if="protocolId"
    :protocol-id="protocolId"
    :plan-id="planId"
    :plan-name="planName"
    @close="handleClose"
    @complete="handleComplete"
  />
</template>

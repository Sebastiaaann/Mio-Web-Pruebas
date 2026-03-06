<script setup lang="ts">
import { computed } from 'vue'
import IconoPresionArterial from './IconoPresionArterial.vue'
import IconoGlucosa from './IconoGlucosa.vue'
import IconoPeso from './IconoPeso.vue'
import IconoOxigeno from './IconoOxigeno.vue'
import IconoTemperatura from './IconoTemperatura.vue'
import IconoCorazon from './IconoCorazon.vue'
import IconoCaraFeliz from './IconoCaraFeliz.vue'
import IconoCaraTriste from './IconoCaraTriste.vue'

type IconName = 
  | 'presion-arterial' 
  | 'glucosa' 
  | 'peso' 
  | 'oxigeno' 
  | 'temperatura' 
  | 'corazon'
  | 'cara-feliz'
  | 'cara-triste'

interface Props {
  name: IconName
  class?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

const iconComponent = computed(() => {
  const icons: Record<IconName, any> = {
    'presion-arterial': IconoPresionArterial,
    'glucosa': IconoGlucosa,
    'peso': IconoPeso,
    'oxigeno': IconoOxigeno,
    'temperatura': IconoTemperatura,
    'corazon': IconoCorazon,
    'cara-feliz': IconoCaraFeliz,
    'cara-triste': IconoCaraTriste
  }
  return icons[props.name]
})
</script>

<template>
  <component
    :is="iconComponent"
    :class="props.class"
    :size="props.size"
  />
</template>

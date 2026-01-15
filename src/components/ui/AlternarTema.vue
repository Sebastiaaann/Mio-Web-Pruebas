<script setup>
import { computed } from 'vue';

const props = defineProps({
  isDark: {
    type: Boolean,
    required: true
  }
});

defineEmits(['toggle']);

// Styles for transitions
const transitionClass = "transition-all duration-700 ease-in-out origin-center";

// Sun State: Visible when NOT dark
const sunClass = computed(() => {
    return props.isDark 
        ? "scale-0 opacity-0 rotate-90" 
        : "scale-100 opacity-100 rotate-0";
});

// Moon State: Visible when dark
const moonClass = computed(() => {
    return props.isDark 
        ? "scale-100 opacity-100 rotate-0" 
        : "scale-0 opacity-0 -rotate-90";
});

</script>

<template>
  <button
    @click="$emit('toggle')"
    class="relative flex items-center justify-center p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary dark:text-gray-200 shadow-sm transition-colors cursor-pointer w-10 h-10 overflow-hidden"
    :class="$attrs.class"
    aria-label="Toggle Theme"
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="relative z-10 w-6 h-6"
    >
      <!-- GROUP: SUN (RAYS + CENTER) -->
      <g :class="[transitionClass, sunClass]">
          <!-- SUN RAYS -->
          <path d="M12.4058 1.76251V3.76251" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M12.4058 21.7625V23.7625" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4.62598 4.98248L6.04598 6.40248" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M18.7656 19.1225L20.1856 20.5425" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M1.40576 12.7625H3.40576" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.4058 12.7625H23.4058" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4.62598 20.5425L6.04598 19.1225" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M18.7656 6.40248L20.1856 4.98248" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- SUN CENTER -->
          <path d="M12.4058 17.7625C15.1672 17.7625 17.4058 15.5239 17.4058 12.7625C17.4058 10.0011 15.1672 7.76251 12.4058 7.76251C9.64434 7.76251 7.40576 10.0011 7.40576 12.7625C7.40576 15.5239 9.64434 17.7625 12.4058 17.7625Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- MOON (Overlay) -->
      <!-- We position it absolute relative to the SVG viewbox by using a group transformation or simply overlaying it. 
           Since standard SVG doesn't support absolute positioning of paths easily, we keep it in the same flow but transform it. -->
      <g :class="[transitionClass, moonClass]">
        <path
            d="M21.1918 13.2013C21.0345 14.9035 20.3957 16.5257 19.35 17.8781C18.3044 19.2305 16.8953 20.2571 15.2875 20.8379C13.6797 21.4186 11.9398 21.5294 10.2713 21.1574C8.60281 20.7854 7.07479 19.9459 5.86602 18.7371C4.65725 17.5283 3.81774 16.0003 3.4457 14.3318C3.07367 12.6633 3.18451 10.9234 3.76526 9.31561C4.346 7.70783 5.37263 6.29868 6.72501 5.25307C8.07739 4.20746 9.69959 3.56862 11.4018 3.41132C10.4052 4.75958 9.92564 6.42077 10.0503 8.09273C10.175 9.76469 10.8957 11.3364 12.0812 12.5219C13.2667 13.7075 14.8384 14.4281 16.5104 14.5528C18.1823 14.6775 19.8435 14.1979 21.1918 13.2013Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
      </g>
    </svg>
  </button>
</template>

<style scoped>
/* Ensure the groups stack on top of each other by default if not transformed away. 
   SVG 'g' elements don't strictly support absolute positioning like divs, 
   but since one scales to 0, they won't visually overlap in a messy way. 
   However, we should ensure the transformation origin is correct. */
   
g {
    transform-box: fill-box;
    transform-origin: center;
}
</style>

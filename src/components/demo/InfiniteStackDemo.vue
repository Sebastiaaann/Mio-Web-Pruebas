<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Motion } from 'motion-v';
import ShowcaseNavbar from './ShowcaseNavbar.vue';

const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;

const cards = ref([
    { id: 1, color: '#ef4444', text: 'Front' },
    { id: 2, color: '#3b82f6', text: 'Middle' },
    { id: 3, color: '#10b981', text: 'Back' },
    { id: 4, color: '#f59e0b', text: 'Last' },
]);

// simple move function: take top card, move to bottom
const moveToEnd = (from) => {
    const item = cards.value.shift();
    if (item) cards.value.push(item);
};

// interval to auto-cycle
let interval;
onMounted(() => {
    interval = setInterval(() => {
        moveToEnd(0);
    }, 4000);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="min-h-screen bg-neutral-950 font-sans text-white flex flex-col items-center justify-center p-8 overflow-hidden">
    <ShowcaseNavbar />

    <div class="relative w-64 h-80">
        <!-- 
            We map over cards. 
            The order in the array determines the visual Z-order if we were just using CSS.
            But for animations, we use `layoutId` to track items as they move positions in the DOM.
        -->
        <Motion
            v-for="(card, index) in cards"
            :key="card.id"
            :layoutId="`card-${card.id}`"
            class="absolute inset-0 rounded-3xl shadow-2xl flex items-center justify-center text-4xl font-bold text-black/50 border border-white/10"
            :style="{ 
                backgroundColor: card.color,
                zIndex: cards.length - index,
            }"
            :animate="{
                scale: 1 - index * SCALE_FACTOR,
                y: index * CARD_OFFSET,
                opacity: 1 - index * 0.1,
                // If it's the last one being moved to back, we might want a different entry anim
                // But simplified here: layout animations handle the swap smoothly.
            }"
            :transition="{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }"
        >
            {{ card.text }}
        </Motion>
    </div>
    
    <p class="mt-32 text-neutral-500 text-sm">Infinite Auto-Cycling Stack</p>

  </div>
</template>

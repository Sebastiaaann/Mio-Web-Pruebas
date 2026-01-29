<script setup>
/**
 * QuestionStep - Componente para pasos tipo "question"
 * Muestra una pregunta con opciones de respuesta predefinidas
 * Ejemplo: "¿Cómo se ha sentido?" → Bien/Regular/Mal
 */
import { ref, computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'valid'])

const selectedAnswer = ref(props.modelValue)

// Verificar si hay una respuesta seleccionada
const isValid = computed(() => selectedAnswer.value !== null)

// Emitir valor y validación cuando cambia la selección
function selectAnswer(answer) {
  selectedAnswer.value = answer.text
  emit('update:modelValue', answer.text)
  emit('valid', true)
}

// Mapeo de colores según evaluación
const evaluationColors = {
  green: {
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
    border: 'border-emerald-500',
    text: 'text-emerald-700'
  },
  orange: {
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-100',
    border: 'border-amber-500',
    text: 'text-amber-700'
  },
  red: {
    bg: 'bg-red-50',
    hover: 'hover:bg-red-100',
    border: 'border-red-500',
    text: 'text-red-700'
  }
}

// Obtener color según evaluación de la respuesta
function getAnswerColor(answer) {
  return evaluationColors[answer.evaluation] || evaluationColors.orange
}

// Verificar si una respuesta está seleccionada
function isSelected(answer) {
  return selectedAnswer.value === answer.text
}
</script>

<template>
  <div class="space-y-8">
    <!-- Pregunta -->
    <div class="text-center">
      <h2 class="font-display font-bold text-3xl text-gray-900 mb-4">
        {{ step.question?.question || step.header }}
      </h2>
      <p v-if="step.body" class="text-lg text-gray-500">
        {{ step.body }}
      </p>
    </div>

    <!-- Opciones de respuesta -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button
        v-for="(answer, index) in step.question?.answers"
        :key="answer.text"
        @click="selectAnswer(answer)"
        class="group relative p-8 rounded-2xl border-2 transition-all duration-300 animate-fade-in-up"
        :class="[
          getAnswerColor(answer).bg,
          getAnswerColor(answer).hover,
          isSelected(answer) ? `border-[#FF9500] ring-4 ring-[#FF9500]/20 scale-105` : 'border-transparent'
        ]"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="text-center">
          <!-- Emoji según evaluación -->
          <div class="text-6xl mb-4 transform transition-transform group-hover:scale-110">
            {{ answer.evaluation === 'green' ? '😊' : answer.evaluation === 'orange' ? '😐' : '😞' }}
          </div>
          <p class="font-display font-semibold text-gray-900 text-lg">
            {{ answer.text }}
          </p>
        </div>

        <!-- Checkmark cuando está seleccionado -->
        <div
          v-if="isSelected(answer)"
          class="absolute -top-2 -right-2 w-8 h-8 bg-[#FF9500] rounded-full flex items-center justify-center shadow-lg"
        >
          <Check class="text-white w-5 h-5" />
        </div>

        <!-- Borde de selección -->
        <div
          v-if="isSelected(answer)"
          class="absolute inset-0 rounded-2xl border-4 border-[#FF9500] pointer-events-none"
        />
      </button>
    </div>

    <!-- Indicador de selección -->
    <div
      v-if="selectedAnswer"
      class="text-center animate-fade-in"
    >
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9500]/10 rounded-full">
        <span class="text-sm font-medium text-[#FF9500]">
          Has seleccionado: {{ selectedAnswer }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}

.font-display {
  font-family: 'Cabinet Grotesk', sans-serif;
}
</style>

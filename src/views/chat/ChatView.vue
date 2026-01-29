<script setup>
/**
 * ChatView - Vista dedicada del Asistente Virtual
 * Interfaz de chat con el webhook de HOMA
 * Diseño minimalista inspirado en la imagen proporcionada
 */
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Motion } from 'motion-v'
import { 
  enviarMensaje, 
  obtenerSessionId, 
  limpiarSesion,
  guardarHistorial,
  obtenerHistorial 
} from '@/services/chatService'
import { 
  Bot, 
  Send, 
  ArrowLeft, 
  Trash2, 
  Loader2,
  Sparkles
} from 'lucide-vue-next'

const router = useRouter()

// Props
const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  }
})

// Estado del chat
const mensajes = ref([])
const mensajeInput = ref('')
const enviando = ref(false)
const sessionId = ref(null)
const chatContainer = ref(null)

// Mensaje de bienvenida
const mensajeBienvenida = {
  id: 'welcome',
  tipo: 'bot',
  texto: '¡Hola! 👋 Soy tu Asistente Virtual. Estoy aquí para ayudarte con información sobre tus controles de salud, medicamentos y cualquier duda que tengas. ¿En qué puedo ayudarte?',
  timestamp: new Date()
}

// Sugerencias rápidas
const sugerencias = [
  '¿Cuáles son mis próximos controles?',
  '¿Cómo agendar una teleconsulta?',
  '¿Qué beneficios tengo disponibles?',
  'Necesito ayuda con mi medicación'
]

// Computed
const puedeEnviar = computed(() => 
  mensajeInput.value.trim().length > 0 && !enviando.value
)

// Funciones
async function enviar() {
  if (!puedeEnviar.value) return

  const textoMensaje = mensajeInput.value.trim()
  mensajeInput.value = ''

  // Agregar mensaje del usuario
  const mensajeUsuario = {
    id: `user_${Date.now()}`,
    tipo: 'usuario',
    texto: textoMensaje,
    timestamp: new Date()
  }
  mensajes.value.push(mensajeUsuario)
  await scrollToBottom()

  // Enviar al webhook
  enviando.value = true
  
  try {
    const respuesta = await enviarMensaje(textoMensaje, sessionId.value)
    
    if (respuesta.sessionId) {
      sessionId.value = respuesta.sessionId
    }

    // Agregar respuesta del bot
    const mensajeBot = {
      id: `bot_${Date.now()}`,
      tipo: 'bot',
      texto: respuesta.mensaje,
      timestamp: new Date(),
      error: !respuesta.exito
    }
    mensajes.value.push(mensajeBot)
    
    // Guardar historial
    guardarHistorial(mensajes.value)
  } catch (error) {
    mensajes.value.push({
      id: `error_${Date.now()}`,
      tipo: 'bot',
      texto: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      timestamp: new Date(),
      error: true
    })
  } finally {
    enviando.value = false
    await scrollToBottom()
  }
}

function usarSugerencia(sugerencia) {
  mensajeInput.value = sugerencia
  enviar()
}

function limpiarChat() {
  limpiarSesion()
  mensajes.value = [mensajeBienvenida]
  sessionId.value = obtenerSessionId()
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function formatearHora(date) {
  return new Date(date).toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Lifecycle
onMounted(() => {
  sessionId.value = obtenerSessionId()
  const historial = obtenerHistorial()
  
  if (historial.length > 0) {
    mensajes.value = historial
  } else {
    mensajes.value = [mensajeBienvenida]
  }
  
  scrollToBottom()
})

// Watch para auto-scroll
watch(() => mensajes.value.length, () => scrollToBottom())
</script>

<template>
  <div class="chat-view flex flex-col h-full bg-[#FAFAF8]">
    <!-- Header -->
    <Motion
      v-if="showHeader"
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4 }"
    >
      <header class="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              @click="router.back()"
              class="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <Bot class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="font-semibold text-gray-800">Asistente Virtual</h1>
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span class="text-xs text-green-600">En línea</span>
              </div>
            </div>
          </div>
          
          <button 
            @click="limpiarChat"
            class="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Limpiar chat"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </header>
    </Motion>

    <!-- Chat Messages -->
    <div 
      ref="chatContainer"
      class="flex-1 overflow-y-auto px-4 py-6"
    >
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Messages -->
        <Motion
          v-for="mensaje in mensajes"
          :key="mensaje.id"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.3 }"
        >
          <!-- Bot Message -->
          <div v-if="mensaje.tipo === 'bot'">
            <div 
              class="bg-[#F5F1E8] rounded-3xl p-5 border border-[#E8E4D9]"
              :class="mensaje.error ? 'bg-red-50 border border-red-200' : ''"
            >
              <div class="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
                <span>RESPUESTA DEL AGENTE</span>
              </div>
              <div class="bg-white rounded-2xl px-5 py-4 border border-gray-100">
                <p class="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{{ mensaje.texto }}</p>
              </div>
            </div>
          </div>

          <!-- User Message -->
          <div v-else class="flex justify-end">
            <div class="max-w-[80%] text-right">
              <p class="text-sm leading-relaxed text-gray-700">{{ mensaje.texto }}</p>
            </div>
          </div>
        </Motion>

        <!-- Typing Indicator -->
        <Motion
          v-if="enviando"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          <div class="bg-[#F5F1E8] rounded-3xl p-5 border border-[#E8E4D9] inline-block">
            <div class="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
              <span>RESPUESTA DEL AGENTE</span>
            </div>
            <div class="bg-white rounded-2xl px-5 py-4 border border-gray-100 inline-flex items-center gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms;" />
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms;" />
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms;" />
            </div>
          </div>
        </Motion>

        <!-- Quick Suggestions (only when few messages) -->
        <div v-if="mensajes.length <= 2 && !enviando" class="pt-4">
          <p class="text-xs text-gray-400 mb-3 flex items-center gap-1">
            <Sparkles class="w-3 h-3" />
            Sugerencias rápidas
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="sugerencia in sugerencias"
              :key="sugerencia"
              @click="usarSugerencia(sugerencia)"
              class="text-sm px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {{ sugerencia }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.2 }"
    >
      <div class="bg-white border-t border-gray-100 p-4">
        <form 
          @submit.prevent="enviar"
          class="max-w-2xl mx-auto flex items-center gap-3"
        >
          <div class="flex-1 relative">
            <input
              v-model="mensajeInput"
              type="text"
              placeholder="¿En qué puedo ayudarte hoy?"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all text-gray-700 placeholder-gray-400"
              :disabled="enviando"
            />
          </div>
          <button
            type="submit"
            :disabled="!puedeEnviar"
            class="w-11 h-11 rounded-full bg-[#E07A5F] text-white shadow-lg shadow-orange-200/50 hover:bg-[#D06A4F] hover:shadow-orange-300/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
          >
            <Loader2 v-if="enviando" class="w-5 h-5 animate-spin" />
            <Send v-else class="w-5 h-5" />
          </button>
        </form>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.chat-view {
  min-height: 100%;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Smooth scroll behavior */
.overflow-y-auto {
  scroll-behavior: smooth;
}
</style>

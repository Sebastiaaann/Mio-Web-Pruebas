<script setup>
/**
 * ChatView - Vista dedicada del Asistente Virtual
 * Interfaz de chat con el webhook de HOMA
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
  User,
  Loader2,
  Sparkles
} from 'lucide-vue-next'

const router = useRouter()

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
  texto: '¡Hola! 👋 Soy el Asistente Virtual de MIO. Estoy aquí para ayudarte con tus dudas de salud. ¿En qué puedo ayudarte hoy?',
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
watch(mensajes, () => scrollToBottom(), { deep: true })
</script>

<template>
  <div class="chat-view flex flex-col h-full bg-linear-to-br from-purple-50 via-white to-purple-100">
    <!-- Header -->
    <Motion
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4 }"
    >
      <header class="glass-header px-4 py-3 border-b border-purple-100/50">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              @click="router.back()"
              class="p-2 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div class="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
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
      <div class="max-w-3xl mx-auto space-y-4">
        <!-- Messages -->
        <Motion
          v-for="mensaje in mensajes"
          :key="mensaje.id"
          :initial="{ opacity: 0, y: 20, scale: 0.95 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :transition="{ duration: 0.3 }"
        >
          <div 
            class="flex gap-3"
            :class="mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'"
          >
            <!-- Bot Avatar -->
            <div 
              v-if="mensaje.tipo === 'bot'"
              class="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0"
            >
              <Bot class="w-4 h-4 text-white" />
            </div>

            <!-- Message Bubble -->
            <div 
              class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm"
              :class="[
                mensaje.tipo === 'usuario' 
                  ? 'bg-linear-to-r from-purple-600 to-purple-500 text-white rounded-br-sm' 
                  : mensaje.error 
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              ]"
            >
              <p class="text-sm whitespace-pre-wrap">{{ mensaje.texto }}</p>
              <p 
                class="text-[10px] mt-1 opacity-60"
                :class="mensaje.tipo === 'usuario' ? 'text-right' : ''"
              >
                {{ formatearHora(mensaje.timestamp) }}
              </p>
            </div>

            <!-- User Avatar -->
            <div 
              v-if="mensaje.tipo === 'usuario'"
              class="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0"
            >
              <User class="w-4 h-4 text-white" />
            </div>
          </div>
        </Motion>

        <!-- Typing Indicator -->
        <Motion
          v-if="enviando"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          <div class="flex gap-3 justify-start">
            <div class="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Bot class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms;" />
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms;" />
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms;" />
              </div>
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
              class="text-sm px-3 py-2 bg-white border border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all"
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
      <div class="glass-header border-t border-purple-100/50 p-4">
        <form 
          @submit.prevent="enviar"
          class="max-w-3xl mx-auto flex items-center gap-3"
        >
          <input
            v-model="mensajeInput"
            type="text"
            placeholder="Escribe tu mensaje..."
            class="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            :disabled="enviando"
          />
          <button
            type="submit"
            :disabled="!puedeEnviar"
            class="p-3 rounded-xl bg-linear-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-300/40 hover:shadow-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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

.glass-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.2);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.4);
}
</style>

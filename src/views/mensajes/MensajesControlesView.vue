<script setup>
/**
 * MensajesControlesView - Bandeja de Resultados de Controles
 * Estilo Master-Detail (Inbox / Chat)
 */
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useControlesStore } from '@/stores/salud/tiendaControles'
import { enviarMensaje } from '@/services/chatService'
import { storeToRefs } from 'pinia'
import { Motion, AnimatePresence } from 'motion-v'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Calendar,
  Activity,
  Heart,
  Scale,
  FlaskConical,
  Info,
  Share2,
  Download,
  Bot,
  Send,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const healthStore = useHealthStore()
const controlesStore = useControlesStore()
const { historialMediciones, controlesProximos } = storeToRefs(healthStore)

const searchQuery = ref('')
const selectedControlId = ref(null)
const cargando = ref(true)
const controlesRealizados = ref([])

// Estado para el Chat
const chatInput = ref('')
const enviandoMensaje = ref(false)
const chatMessages = ref([])
const chatContainer = ref(null)

// Iconos por tipo
const getIconoPorTipo = (nombre) => {
  const normalizedName = nombre?.toUpperCase() || ''
  if (normalizedName.includes('PRESIÓN') || normalizedName.includes('ARTERIAL')) return Heart
  if (normalizedName.includes('PESO')) return Scale
  if (normalizedName.includes('GLICEMIA') || normalizedName.includes('GLUCOSA')) return FlaskConical
  return Activity
}

// Transformar historial plano
function transformarHistorial() {
  const controles = []
  
  Object.entries(historialMediciones.value).forEach(([protocolId, mediciones]) => {
    // Buscar nombre del protocolo
    const protocolo = controlesProximos.value.find(p => p.id === protocolId)
    const nombreProtocolo = protocolo?.nombre || 'Control'

    mediciones.forEach(medicion => {
      const fechaObj = new Date(medicion.fecha)
      
      // Analizar valores para determinar estado real (frontend validation)
      const analisis = analizarResultado(nombreProtocolo, medicion.valor)

      controles.push({
        id: `${protocolId}-${medicion.id || fechaObj.getTime()}`,
        protocolId: protocolId,
        nombre: nombreProtocolo,
        valor: medicion.valor,
        unidad: medicion.unidad,
        fecha: fechaObj,
        fechaStr: fechaObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
        horaStr: fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        estado: analisis.estado, // Usar estado calculado
        icono: getIconoPorTipo(nombreProtocolo),
        mensaje: analisis.mensaje // Usar mensaje calculado
      })
    })
  })

  // Ordenar por fecha descendente (más reciente primero)
  return controles.sort((a, b) => b.fecha - a.fecha)
}

function analizarResultado(tipo, valor) {
  const nombre = (tipo || '').toUpperCase()
  let estado = 'normal'
  let mensaje = `Registro recibido correctamente.`

  // Presión Arterial (formato "120/80")
  if (nombre.includes('PRESIÓN') || nombre.includes('ARTERIAL')) {
    const cleanValor = valor.toString().replace(/[^0-9/.]/g, '')
    const partes = cleanValor.split('/')
    if (partes.length === 2) {
      const sis = parseFloat(partes[0])
      const dia = parseFloat(partes[1])
      
      if (!isNaN(sis) && !isNaN(dia)) {
        if (sis > 180 || dia > 120) {
          estado = 'danger' // Crisis
          mensaje = `ALERTA CRÍTICA: Tu presión arterial (${valor}) es peligrosamente alta. Por favor acude a un servicio de urgencia o contacta a tu médico de inmediato.`
        } else if (sis >= 140 || dia >= 90) {
          estado = 'warning'
          mensaje = `Atención: Tu presión arterial (${valor}) está elevada (Hipertensión). Te recomendamos reposar y volver a medir en 15 minutos.`
        } else if (sis < 90 || dia < 60) {
          estado = 'danger'
          mensaje = `ALERTA: Tu presión arterial (${valor}) es muy baja (Hipotensión). Podrías sentir mareos o desmayos. Recuéstate y eleva las piernas. Si persiste, busca ayuda.`
        } else {
          estado = 'success'
          mensaje = `¡Excelente! Tu presión arterial (${valor}) se encuentra en rangos saludables y óptimos. ¡Sigue así!`
        }
      }
    }
  } 
  
  // Glicemia
  else if (nombre.includes('GLICEMIA') || nombre.includes('GLUCOSA')) {
    const val = parseFloat(valor)
    if (!isNaN(val)) {
      if (val < 70) {
        estado = 'warning'
        mensaje = `Atención: Tu nivel de glucosa (${valor}) es bajo (Hipoglicemia). Consume algún alimento con azúcar de absorción rápida.`
      } else if (val > 180) {
        estado = 'warning'
        mensaje = `Atención: Tu nivel de glucosa (${valor}) está elevado. Recuerda seguir tu dieta y tratamiento.`
      } else {
         estado = 'success'
         mensaje = `¡Muy bien! Tu nivel de glucosa (${valor}) está controlado y dentro del objetivo.`
      }
    }
  }

  // Peso (sin rango estricto genérico, pero sanity check)
  else if (nombre.includes('PESO')) {
     mensaje = `Registro de peso (${valor}kg) actualizado. Mantener un peso saludable es clave para tu bienestar.`
     estado = 'normal'
  }

  return { estado, mensaje }
}

// Filtros
const filteredControles = computed(() => {
  let lista = controlesRealizados.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    lista = lista.filter(c => 
      c.nombre.toLowerCase().includes(query) || 
      c.valor.toString().includes(query)
    )
  }
  return lista
})

const selectedControl = computed(() => {
  return controlesRealizados.value.find(c => c.id === selectedControlId.value)
})

function selectControl(id) {
  selectedControlId.value = id
  chatMessages.value = [] // Resetear chat al cambiar selección
}

async function enviarPregunta() {
  if (!chatInput.value.trim() || enviandoMensaje.value) return

  const pregunta = chatInput.value
  chatInput.value = ''
  enviandoMensaje.value = true

  // Agregar mensaje de usuario
  chatMessages.value.push({
    role: 'user',
    content: pregunta
  })

  await scrollToBottom()

  try {
    // Construir contexto del control actual
    const ctrl = selectedControl.value
    const contextoControl = `Contexto del control actual: 
    - Tipo: ${ctrl.nombre}
    - Valor: ${ctrl.valor} ${ctrl.unidad}
    - Fecha: ${ctrl.fechaStr} a las ${ctrl.horaStr}
    - Estado calculado: ${ctrl.estado}
    - Feedback inicial: ${ctrl.mensaje}
    
    El usuario pregunta sobre este control: "${pregunta}"`

    const respuesta = await enviarMensaje(contextoControl)
    
    if (respuesta && respuesta.mensaje) {
      chatMessages.value.push({
        role: 'assistant',
        content: respuesta.mensaje
      })
    } else {
      throw new Error('No se recibió respuesta')
    }
  } catch (error) {
    chatMessages.value.push({
      role: 'assistant',
      content: 'Lo siento, tuve un problema al procesar tu consulta. Por favor intenta de nuevo.'
    })
  } finally {
    enviandoMensaje.value = false
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(async () => {
  cargando.value = true
  try {
    // Asegurar carga de datos base
    if (controlesProximos.value.length === 0) {
      await controlesStore.fetchControles()
    }
    
    // Cargar historial para cada protocolo
    const promises = controlesProximos.value.map(protocolo => 
      healthStore.fetchHistorial(protocolo.id)
    )
    await Promise.allSettled(promises)

    controlesRealizados.value = transformarHistorial()

    // Seleccionar el primero por defecto
    if (controlesRealizados.value.length > 0 && !selectedControlId.value) {
      selectedControlId.value = controlesRealizados.value[0].id
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="w-full h-[calc(100vh-2rem)] md:p-6 p-4 font-sans" style="font-family: 'Cabinet Grotesk', sans-serif;">
    <div class="bg-white dark:bg-neutral-900 w-full h-full rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
      
      <!-- LEFT SIDEBAR: LIST -->
      <div class="w-full md:w-[320px] lg:w-[380px] border-r border-gray-100 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900 h-full">
        
        <!-- Header List -->
        <div class="p-4 border-b border-gray-100 dark:border-neutral-800 bg-white z-10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Resultados</h2>
              <p class="text-xs text-gray-500">Historial de controles realizados</p>
            </div>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-500">
                <Filter :size="18" />
              </button>
            </div>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar resultados..." 
              class="w-full bg-gray-50 dark:bg-neutral-800 pl-9 pr-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder-gray-400"
            />
          </div>
        </div>

        <!-- List Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div v-if="cargando" class="p-8 flex justify-center">
            <div class="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div v-else-if="filteredControles.length === 0" class="p-8 text-center text-gray-500 text-sm">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity class="text-gray-300" />
            </div>
            <p>No hay resultados registrados</p>
          </div>

          <div v-else class="flex flex-col">
            <button
              v-for="control in filteredControles"
              :key="control.id"
              @click="selectControl(control.id)"
              class="flex items-start gap-3 p-4 border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all text-left group relative"
              :class="selectedControlId === control.id ? 'bg-violet-50/60 dark:bg-violet-900/10' : ''"
            >
              <!-- Indicator Bar -->
              <div 
                v-if="selectedControlId === control.id"
                class="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"
              ></div>

              <!-- Icon -->
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :class="selectedControlId === control.id ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'"
              >
                <component :is="control.icono" :size="18" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-0.5">
                  <span 
                    class="font-semibold text-sm truncate pr-2"
                    :class="selectedControlId === control.id ? 'text-violet-900 dark:text-violet-100' : 'text-gray-900 dark:text-gray-100'"
                  >
                    {{ control.nombre }}
                  </span>
                  <span class="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                    {{ control.fechaStr }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2 mt-1">
                  <span class="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                    {{ control.valor }} <span class="text-xs font-normal text-gray-400">{{ control.unidad }}</span>
                  </span>
                  
                  <!-- Small Status Dot -->
                  <span 
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-500': control.estado === 'normal' || control.estado === 'success',
                      'bg-orange-500': control.estado === 'warning' || control.estado === 'alerta',
                      'bg-red-500': control.estado === 'danger' || control.estado === 'critico'
                    }"
                  ></span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT MAIN: DETAIL (CHAT STYLE) -->
      <div class="flex-1 bg-gray-50 dark:bg-neutral-950 flex flex-col relative overflow-hidden h-full">
        <!-- Eliminado AnimatePresence para evitar conflictos de navegación -->
        <div 
          v-if="selectedControl"
          :key="selectedControl.id"
          class="h-full flex flex-col animate-in fade-in duration-300"
        >
            <!-- Detail Header -->
            <div class="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                   <component :is="selectedControl.icono" :size="20" />
                </div>
                <div class="flex flex-col">
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ selectedControl.nombre }}
                  </h3>
                  <span class="text-xs text-green-600 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Verificado • {{ selectedControl.fechaStr }}
                  </span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical :size="18" />
                </button>
              </div>
            </div>

            <!-- Detail Content (Chat Flow) -->
            <div 
              ref="chatContainer"
              class="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50 dark:bg-neutral-950"
            >
              <div class="max-w-3xl mx-auto space-y-6">
                
                <!-- Time Separator -->
                <div class="flex justify-center">
                  <span class="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                    {{ selectedControl.fechaStr }} • {{ selectedControl.horaStr }}
                  </span>
                </div>

                <!-- Bot Message: Intro -->
                <div class="flex gap-4">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shrink-0 mt-1">
                    <Bot class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex flex-col gap-1 max-w-[80%]">
                    <span class="text-xs font-bold text-gray-500 ml-1">Asistente MIO</span>
                    <div class="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-neutral-700">
                      <p class="text-sm text-gray-700 dark:text-gray-200">
                        Registro de control recibido correctamente. Aquí tienes los detalles.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Result Card (As a message attachment) -->
                <div class="flex gap-4">
                  <div class="w-8 shrink-0"></div> <!-- Spacer alignment -->
                  <div class="max-w-[80%] w-full sm:w-auto">
                    <div class="bg-slate-800 dark:bg-neutral-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                       <!-- Decorative bg circles -->
                       <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                       <div class="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

                       <div class="relative z-10">
                         <div class="flex items-center justify-between mb-4">
                           <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Valor Medido</span>
                           <component :is="selectedControl.icono" class="text-slate-400" :size="16" />
                         </div>
                         
                         <div class="text-4xl font-bold font-mono tracking-tight mb-1">
                           {{ selectedControl.valor }}
                           <span class="text-lg font-sans font-normal text-slate-400 ml-1">{{ selectedControl.unidad }}</span>
                         </div>
                         
                         <div class="mt-4 flex items-center gap-2">
                            <span 
                              class="w-2.5 h-2.5 rounded-full"
                              :class="{
                                'bg-emerald-400': selectedControl.estado === 'normal' || selectedControl.estado === 'success',
                                'bg-orange-400': selectedControl.estado === 'warning' || selectedControl.estado === 'alerta',
                                'bg-rose-500': selectedControl.estado === 'danger' || selectedControl.estado === 'critico'
                              }"
                            ></span>
                            <span class="text-sm font-medium text-slate-200 capitalize">
                              {{ selectedControl.estado === 'normal' || selectedControl.estado === 'success' ? 'Normal' : (selectedControl.estado === 'danger' ? 'Crítico' : 'Alerta') }}
                            </span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                <!-- Bot Message: Feedback -->
                <div class="flex gap-4">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shrink-0 mt-1">
                    <Bot class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex flex-col gap-1 max-w-[80%]">
                    <span class="text-xs font-bold text-gray-500 ml-1">Asistente MIO</span>
                    <div class="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-neutral-700">
                      <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                        {{ selectedControl.mensaje }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Chat History Messages -->
                <template v-for="(msg, idx) in chatMessages" :key="idx">
                  <!-- User Message -->
                  <div v-if="msg.role === 'user'" class="flex justify-end gap-4">
                    <div class="flex flex-col gap-1 max-w-[80%] items-end">
                      <div class="bg-violet-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                        <p class="text-sm leading-relaxed">{{ msg.content }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Bot Response -->
                  <div v-else class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shrink-0 mt-1">
                      <Bot class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex flex-col gap-1 max-w-[80%]">
                      <span class="text-xs font-bold text-gray-500 ml-1">Asistente MIO</span>
                      <div class="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-neutral-700">
                        <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                          {{ msg.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Loading Indicator -->
                <div v-if="enviandoMensaje" class="flex gap-4">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shrink-0 mt-1">
                    <Bot class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-bold text-gray-500 ml-1">Asistente MIO</span>
                    <div class="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-neutral-700 w-fit">
                      <div class="flex gap-1.5">
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Suggestions (Only shown if no chat history yet) -->
                <div v-if="chatMessages.length === 0" class="flex gap-4">
                  <div class="w-8 shrink-0"></div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      @click="router.push('/nueva-medicion/tipo')"
                      class="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                    >
                      Nuevo Control
                    </button>
                    <button 
                      @click="chatInput = '¿Qué significa este valor?'; enviarPregunta()"
                      class="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
                    >
                      ¿Qué significa este valor?
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800">
               <div class="max-w-3xl mx-auto flex gap-2">
                 <input 
                   v-model="chatInput"
                   @keyup.enter="enviarPregunta"
                   type="text"
                   :disabled="enviandoMensaje"
                   placeholder="Haz una pregunta sobre este control..."
                   class="flex-1 bg-gray-50 dark:bg-neutral-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                 />
                 <button 
                   @click="enviarPregunta"
                   :disabled="!chatInput.trim() || enviandoMensaje"
                   class="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-200 dark:shadow-none"
                 >
                   <Loader2 v-if="enviandoMensaje" class="w-5 h-5 animate-spin" />
                   <Send v-else :size="18" />
                 </button>
               </div>
            </div>
        </div>

          <!-- Empty State (No Selection) -->
          <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Activity :size="32" class="text-gray-300" />
            </div>
            <p class="text-sm">Selecciona un control para ver el detalle</p>
          </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #262626;
}
</style>

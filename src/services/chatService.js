/**
 * chatService.js - Servicio para comunicación con Groq AI
 * Integración con Llama 3.3 70B via Groq API
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// Configuración del modelo
const MODEL_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 1,
}

// System prompt para el asistente de salud
const SYSTEM_PROMPT = `Eres el Asistente Virtual de MIO, una plataforma de salud de Mutual de Seguridad en Chile.

Tu rol es:
- Ayudar a los usuarios con dudas sobre sus servicios de salud
- Proporcionar información sobre teleconsultas, controles médicos y beneficios
- Orientar sobre cómo usar la plataforma MIO
- Dar consejos generales de bienestar (sin reemplazar consultas médicas)

Reglas:
- Responde siempre en español chileno, de forma amable y profesional
- Sé conciso pero completo en tus respuestas
- Si no sabes algo, sugiere contactar a un profesional de salud
- Nunca des diagnósticos médicos específicos
- Usa emojis ocasionalmente para ser más cercano 😊

Servicios disponibles en MIO:
- Teleconsulta: Consultas médicas por videollamada
- Controles: Medición de presión arterial, peso y glicemia
- Material Audiovisual: Videos y webinars de salud
- Club de Beneficios: Descuentos en farmacias y gimnasios
- Operativos: Exámenes preventivos programados`

// Historial de conversación para contexto
let conversationHistory = []

/**
 * Envía un mensaje al chatbot Groq y recibe la respuesta
 * @param {string} mensaje - Mensaje del usuario
 * @returns {Promise<Object>} - Respuesta del chatbot
 */
export async function enviarMensaje(mensaje) {
  try {
    // Agregar mensaje del usuario al historial
    conversationHistory.push({
      role: 'user',
      content: mensaje
    })

    // Limitar historial a últimos 10 mensajes para no exceder tokens
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10)
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        ...MODEL_CONFIG,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    const respuestaBot = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.'

    // Agregar respuesta al historial
    conversationHistory.push({
      role: 'assistant',
      content: respuestaBot
    })
    
    return {
      exito: true,
      mensaje: respuestaBot,
      modelo: data.model,
      tokens: data.usage
    }
  } catch (error) {
    console.error('Error en chatService (Groq):', error)
    return {
      exito: false,
      mensaje: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
      error: error.message
    }
  }
}

/**
 * Genera un ID de sesión único
 * @returns {string} - ID de sesión
 */
function generarSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Obtiene o crea un sessionId persistente
 * @returns {string} - ID de sesión almacenado
 */
export function obtenerSessionId() {
  let sessionId = sessionStorage.getItem('chat_session_id')
  if (!sessionId) {
    sessionId = generarSessionId()
    sessionStorage.setItem('chat_session_id', sessionId)
  }
  return sessionId
}

/**
 * Limpia la sesión y el historial de chat
 */
export function limpiarSesion() {
  sessionStorage.removeItem('chat_session_id')
  sessionStorage.removeItem('chat_historial')
  conversationHistory = [] // Limpiar historial de conversación
}

/**
 * Guarda el historial de mensajes en sessionStorage
 * @param {Array} mensajes - Array de mensajes
 */
export function guardarHistorial(mensajes) {
  sessionStorage.setItem('chat_historial', JSON.stringify(mensajes))
}

/**
 * Recupera el historial de mensajes
 * @returns {Array} - Array de mensajes guardados
 */
export function obtenerHistorial() {
  const historial = sessionStorage.getItem('chat_historial')
  return historial ? JSON.parse(historial) : []
}

export default {
  enviarMensaje,
  obtenerSessionId,
  limpiarSesion,
  guardarHistorial,
  obtenerHistorial
}

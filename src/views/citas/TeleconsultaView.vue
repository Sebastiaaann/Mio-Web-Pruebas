<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTiendaUsuario } from '@/stores/tiendaUsuario'
import { pacienteService } from '@/services/pacienteService'
import NavbarLateral from '@/components/layout/NavbarLateral.vue'

const SNABB_SCRIPT_SRC = 'https://cdn.snabb.cl/widget/v1.0/snabb-widget.js'
const SNABB_ELEMENT_ID = 'SnabbWidget'
const SNABB_ORGANIZACION_ID = '6818b78e4e4bafa81cfe55e3'
const SNABB_HCS_ID = '68274196413d4581778c8b0e'
const SNABB_WIDGET_ORIGIN = 'https://widget.snabb.cl'

declare global {
  interface Window {
    SnabbWidget?: {
      init: (config: {
        element: string | HTMLElement
        apiKey?: string
        options?: Record<string, unknown>
        colors?: Record<string, string>
        preset?: Record<string, unknown>
        callback?: (data: unknown) => void
      }) => void
    }
  }
}

const userStore = useTiendaUsuario()

const sidebarVisible = ref(true)
const cargandoWidget = ref(true)
const errorWidget = ref<string | null>(null)
const widgetInicializado = ref(false)
let mensajeListener: ((event: MessageEvent) => void) | null = null
let iframeWidget: HTMLIFrameElement | null = null

const patientId = computed(() =>
  userStore.usuario?.patient_id || (userStore.usuario as { id?: string | number } | null)?.id
)

function toggleSidebar(): void {
  sidebarVisible.value = !sidebarVisible.value
}

function limpiarContenedorWidget(): void {
  const contenedor = document.getElementById(SNABB_ELEMENT_ID)
  if (contenedor) {
    contenedor.innerHTML = ''
  }
}

function cargarScriptSnabb(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.SnabbWidget) {
      resolve()
      return
    }

    const existente = document.querySelector<HTMLScriptElement>('script[data-snabb-widget="true"]')
    if (existente) {
      existente.addEventListener('load', () => resolve())
      existente.addEventListener('error', () => reject(new Error('No se pudo cargar el script de teleconsulta')))
      return
    }

    const script = document.createElement('script')
    script.src = SNABB_SCRIPT_SRC
    script.async = true
    script.dataset.snabbWidget = 'true'
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('No se pudo cargar el script de teleconsulta')))
    document.body.appendChild(script)
  })
}

function esperarWidgetDisponible(intentos = 20, esperaMs = 150): Promise<void> {
  return new Promise((resolve, reject) => {
    let intentosActual = 0
    const timer = window.setInterval(() => {
      intentosActual += 1

      if (window.SnabbWidget?.init) {
        window.clearInterval(timer)
        resolve()
        return
      }

      if (intentosActual >= intentos) {
        window.clearInterval(timer)
        reject(new Error('No se pudo cargar el widget de teleconsulta.'))
      }
    }, esperaMs)
  })
}

function registrarListenerWidget(datosInit: Record<string, unknown>): void {
  if (mensajeListener) return

  mensajeListener = ({ data, source }: MessageEvent) => {
    if (!source || !data || typeof data !== 'object') return

    const payload = data as { type?: string }
    if (payload.type === 'loaded') {
      try {
        ;(source as Window).postMessage({ type: 'init', data: datosInit }, SNABB_WIDGET_ORIGIN)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('No se pudo enviar la configuración al widget:', error)
        }
      }
    }
  }

  window.addEventListener('message', mensajeListener)
}

function crearIframeWidget(preset = false): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  const origin = window.location.origin
  const rutaPreset = preset ? 'preset' : ''
  iframe.src = `https://widget.snabb.cl/${rutaPreset}?origin=${origin}`
  iframe.allowFullscreen = true
  iframe.name = 'SnabbWidgetFrame'
  iframe.style.border = 'none'
  iframe.style.borderRadius = '8px'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.display = 'block'
  return iframe
}

function normalizarTexto(valor?: unknown): string {
  if (typeof valor !== 'string') return ''
  return valor.trim()
}

function obtenerDocumento(paciente: Record<string, unknown>): string {
  const documento = paciente.document as unknown
  if (typeof documento === 'string') return documento.trim()
  if (documento && typeof documento === 'object' && 'value' in documento) {
    return normalizarTexto((documento as { value?: string }).value)
  }
  return ''
}

function normalizarGenero(valor?: unknown): string {
  if (!valor) return ''
  if (typeof valor === 'string') return valor.trim()
  if (typeof valor === 'object' && valor !== null && 'name' in valor) {
    return normalizarTexto((valor as { name?: string }).name)
  }
  return ''
}

function obtenerGeneroBio(paciente: Record<string, unknown>): unknown {
  const bioInfo = paciente.bioInfo
  if (bioInfo && typeof bioInfo === 'object' && 'gender' in bioInfo) {
    return (bioInfo as { gender?: unknown }).gender
  }
  return undefined
}

function normalizarFechaNacimiento(valor?: unknown): string {
  if (!valor) return ''
  if (typeof valor === 'string') return valor.split('T')[0].trim()
  return ''
}

async function iniciarWidget(): Promise<void> {
  if (widgetInicializado.value) return

  cargandoWidget.value = true
  errorWidget.value = null

  try {
    const idPaciente = patientId.value
    if (!idPaciente) {
      throw new Error('No se encontró el paciente para la teleconsulta.')
    }

    const resultado = await pacienteService.obtenerPerfil(idPaciente)
    if (!resultado.success || !resultado.paciente) {
      throw new Error('No se pudo obtener el perfil del paciente.')
    }

    const paciente = resultado.paciente as Record<string, unknown>
    const patientEmail = normalizarTexto(paciente.email)
    const patientName = normalizarTexto(paciente.name || paciente.first_name || paciente.firstName || paciente.nombre)
    const patientLastName = normalizarTexto(paciente.surname || paciente.last_name || paciente.lastName || paciente.lastname || paciente.apellido)
    const patientPhone = normalizarTexto(paciente.phone || paciente.telefono || paciente.cellphone)
    const patientIdentifier = obtenerDocumento(paciente)
    const patientGender = normalizarGenero(paciente.gender ?? obtenerGeneroBio(paciente))
    const patientBirthdate = normalizarFechaNacimiento(paciente.birth_date || paciente.birthday || paciente.fecha_nacimiento)

    await cargarScriptSnabb()
    const widgetDisponible = await esperarWidgetDisponible().then(() => true).catch(() => false)

    const contenedor = document.getElementById(SNABB_ELEMENT_ID)
    if (!contenedor) {
      throw new Error('No se encontró el contenedor de teleconsulta.')
    }

    limpiarContenedorWidget()

    contenedor.style.width = '100%'
    contenedor.style.height = '100%'

    const opcionesWidget = {
      type: 'telehealth',
      organization: SNABB_ORGANIZACION_ID,
      hcs: SNABB_HCS_ID,
      patientEmail,
      patientName,
      patientLastName,
      patientPhone,
      patientIdentifier,
      patientGender,
      patientBirthdate,
      patient: {
        email: patientEmail,
        name: patientName,
        lastName: patientLastName,
        phone: patientPhone,
        identifier: patientIdentifier,
        gender: patientGender,
        birthdate: patientBirthdate
      }
    }

    if (widgetDisponible && window.SnabbWidget?.init) {
      window.SnabbWidget.init({
        element: contenedor,
        options: opcionesWidget
      })
    } else {
      registrarListenerWidget({ options: opcionesWidget })
      iframeWidget = crearIframeWidget()
      contenedor.appendChild(iframeWidget)
    }

    widgetInicializado.value = true
  } catch (error) {
    errorWidget.value = error instanceof Error ? error.message : 'No se pudo cargar la teleconsulta.'
  } finally {
    cargandoWidget.value = false
  }
}

onMounted(() => {
  void iniciarWidget()
})

onUnmounted(() => {
  limpiarContenedorWidget()
  if (mensajeListener) {
    window.removeEventListener('message', mensajeListener)
    mensajeListener = null
  }
  iframeWidget = null
})
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden bg-slate-50 text-gray-900">
    <NavbarLateral
      :visible="true"
      :collapsed="!sidebarVisible"
      @toggle="toggleSidebar"
    />

    <div
      class="teleconsulta-wrapper h-dvh overflow-hidden transition-opacity duration-300"
      :class="sidebarVisible ? 'md:ml-72' : 'md:ml-20'"
    >
      <div class="teleconsulta-container h-full w-full overflow-hidden">
        <div class="teleconsulta-header">
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-slate-900">Teleconsulta</h1>
            <p class="text-xs sm:text-sm text-slate-500">Conecta con un especialista en segundos.</p>
          </div>
        </div>

        <div class="teleconsulta-body">
          <div v-if="cargandoWidget" class="teleconsulta-cargando">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
            <p class="text-sm text-slate-500">Preparando tu sesión...</p>
          </div>

          <div v-else-if="errorWidget" class="teleconsulta-error">
            <p class="text-sm text-rose-600">{{ errorWidget }}</p>
          </div>

          <div v-show="!cargandoWidget" id="SnabbWidget" class="teleconsulta-widget" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teleconsulta-wrapper {
  background: #f8fafc;
}

.teleconsulta-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.teleconsulta-header {
  padding: 1.25rem 1.5rem 0.75rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7));
}

.teleconsulta-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.teleconsulta-cargando,
.teleconsulta-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  background: #fff;
}

.teleconsulta-widget {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.teleconsulta-widget iframe {
  height: 100%;
  width: 100%;
  border: none;
}
</style>

import { defineStore } from 'pinia'
import { ref, markRaw } from 'vue'
import { useHealthStore } from '@/stores/tiendaSalud'
import { useTiendaCitas } from '@/stores/tiendaCitas'
import { useTiendaCampanas } from '@/stores/tiendaCampanas'
import {
  ClipboardCheck,
  Activity,
  AlertCircle,
  Bell,
  Sparkles,
  Info,
  Calendar,
  Megaphone,
  Heart,
  Scale,
  Droplets
} from 'lucide-vue-next'

export interface MensajeItem {
  id: string
  title: string
  description: string
  date?: Date | string
  icon?: unknown
  iconColor?: string
  iconBg?: string
  actionLink?: string
  type?: 'cita' | 'control' | 'campana' | 'info'
}

export interface SeccionMensajes {
  id: 'priority' | 'news' | 'info'
  title: string
  count: number
  icon: unknown
  iconColor: string
  items: MensajeItem[]
}

export const useMensajesStore = defineStore('mensajes', () => {
  const sections = ref<SeccionMensajes[]>([
    {
      id: 'priority',
      title: 'PRIORITARIO',
      count: 0,
      icon: markRaw(AlertCircle),
      iconColor: 'text-orange-500',
      items: []
    },
    {
      id: 'news',
      title: 'NOVEDADES',
      count: 0,
      icon: markRaw(Sparkles),
      iconColor: 'text-violet-500',
      items: []
    },
    {
      id: 'info',
      title: 'INFORMACIÓN',
      count: 0,
      icon: markRaw(Info),
      iconColor: 'text-blue-500',
      items: []
    }
  ])

  // Icon map for controls
  const controlIconMap: Record<string, unknown> = {
    'Presión Arterial': markRaw(Heart),
    'Peso Básico': markRaw(Scale),
    'Glicemia': markRaw(Droplets),
    default: markRaw(Activity)
  }

  function addMessage(sectionId: SeccionMensajes['id'], message: MensajeItem): void {
    const sectionIndex = sections.value.findIndex(s => s.id === sectionId)
    if (sectionIndex !== -1) {
      if (message.icon) {
        message.icon = markRaw(message.icon)
      }
      sections.value[sectionIndex].items.push(message)
      sections.value[sectionIndex].count++
    }
  }

  function clearMessages() {
    sections.value.forEach(section => {
      section.items = []
      section.count = 0
    })
  }

  /**
   * Cargar y consolidar todos los mensajes
   */
  async function refreshMessages(): Promise<void> {
    clearMessages()
    
    const healthStore = useHealthStore()
    const citasStore = useTiendaCitas()
    const campanasStore = useTiendaCampanas()

    // 1. Cargar datos si no están cargados
    const promises = []
    if (healthStore.controlesProximos.length === 0) promises.push(healthStore.fetchControles())
    if (citasStore.citasAgendadas.length === 0) promises.push(citasStore.obtenerCitas())
    if (campanasStore.campanas.length === 0) promises.push(campanasStore.cargarCampanas())
    
    await Promise.allSettled(promises)

    // 2. Procesar Citas (Prioritario)
    const citas = citasStore.citasProximas
    citas.forEach(cita => {
      const fecha = new Date(cita.fecha)
      const esHoy = new Date().toDateString() === fecha.toDateString()
      
      addMessage('priority', {
        id: `CITA-${cita.id}`,
        title: `${esHoy ? '¡Hoy!' : 'Próxima Cita'}: ${cita.tipoNombre}`,
        description: `${cita.doctor} - ${fecha.toLocaleDateString()} ${cita.hora}`,
        date: fecha,
        icon: markRaw(Calendar),
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        actionLink: '/citas',
        type: 'cita'
      })
    })

    // 3. Procesar Controles Vencidos (Prioritario)
    const controles = healthStore.controlesProximos
    controles.forEach((control: any) => {
      if (control.estado === 'vencido') {
        addMessage('priority', {
          id: `CTRL-VENCIDO-${control.id}`,
          title: `Control Vencido: ${control.nombre}`,
          description: 'Es importante que realices este control para tu seguimiento.',
          icon: controlIconMap[control.nombre] || controlIconMap.default,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          actionLink: `/nueva-medicion/tipo`, // Podría ser deep link específico
          type: 'control'
        })
      }
    })

    // 4. Procesar Campañas (Novedades)
    const campanas = campanasStore.campanas
    campanas.forEach(campana => {
      if (campana.activa) {
        addMessage('news', {
          id: `CAMP-${campana.id}`,
          title: campana.nombre,
          description: campana.descripcion || 'Nueva campaña disponible para ti.',
          icon: markRaw(Megaphone),
          iconColor: 'text-violet-600',
          iconBg: 'bg-violet-100 dark:bg-violet-900/30',
          actionLink: campana.urlLink || '#',
          type: 'campana'
        })
      }
    })

    // 5. Novedades Fijas (Ejemplo)
    addMessage('news', {
      id: 'NOV-SLEEP',
      title: 'Nueva función: Control de Sueño',
      description: 'Ahora puedes registrar tus horas de sueño y ver correlaciones.',
      icon: markRaw(Sparkles),
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      type: 'info'
    })

    // 6. Información General (Info)
    addMessage('info', {
      id: 'INFO-TIPS',
      title: 'Tip de Salud: Hidratación',
      description: 'Recuerda beber al menos 2 litros de agua al día para mantenerte saludable.',
      icon: markRaw(Info),
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      type: 'info'
    })
  }

  // Alias para mantener compatibilidad con vista anterior si se llama directamente
  function initFromControls() {
    refreshMessages()
  }

  function upsertMessage(sectionId: SeccionMensajes['id'], message: MensajeItem): void {
    const sectionIndex = sections.value.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) return

    if (message.icon) {
      message.icon = markRaw(message.icon)
    }

    const section = sections.value[sectionIndex]
    const existingIndex = section.items.findIndex(item => item.id === message.id)

    if (existingIndex !== -1) {
      section.items[existingIndex] = { ...section.items[existingIndex], ...message }
    } else {
      section.items.unshift(message)
      section.count++
    }
  }

  function $reset(): void {
    clearMessages()
  }

  return {
    sections,
    addMessage,
    upsertMessage,
    initFromControls,
    refreshMessages,
    $reset
  }
})

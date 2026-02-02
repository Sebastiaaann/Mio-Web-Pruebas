import { defineStore } from 'pinia'
import { ref, markRaw } from 'vue'
import { useHealthStore } from '@/stores/tiendaSalud'
import {
  ClipboardCheck,
  Activity,
  AlertCircle,
  Bell,
  Droplets,
  Sparkles,
  Info,
  Heart,
  Scale
} from 'lucide-vue-next'

interface MensajeItem {
  id: string
  title: string
  description: string
  icon?: unknown
  iconColor?: string
  iconBg?: string
}

interface SeccionMensajes {
  id: 'results' | 'alerts' | 'reminders' | 'news'
  title: string
  count: number
  icon: unknown
  iconColor: string
  items: MensajeItem[]
}

export const useMensajesStore = defineStore('mensajes', () => {
  const sections = ref<SeccionMensajes[]>([
    {
      id: 'results',
      title: 'RESULTADOS',
      count: 0,
      icon: markRaw(ClipboardCheck),
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      items: []
    },
    {
      id: 'alerts',
      title: 'ALERTAS',
      count: 0,
      icon: markRaw(AlertCircle),
      iconColor: 'text-red-500',
      items: []
    },
    {
      id: 'reminders',
      title: 'RECORDATORIOS',
      count: 0,
      icon: markRaw(Bell),
      iconColor: 'text-teal-500',
      items: []
    },
    {
      id: 'news',
      title: 'NOVEDADES',
      count: 1,
      icon: markRaw(Sparkles),
      iconColor: 'text-violet-500',
      items: [
        {
          id: 'NOV-01',
          title: 'Nueva función: Control de Sueño',
          description: 'Ahora puedes registrar tus horas de sueño y ver correlaciones con tu energía diaria.',
          icon: markRaw(Info),
          iconColor: 'text-violet-500',
          iconBg: 'bg-violet-100 dark:bg-violet-900/30'
        }
      ]
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
      sections.value[sectionIndex].items.unshift(message)
      sections.value[sectionIndex].count++
    }
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

  /**
   * Populate reminders based on pending health controls
   */
  function initFromControls(): void {
    const healthStore = useHealthStore()
    const controls = healthStore.controlesProximos

    const remindersSection = sections.value.find(s => s.id === 'reminders')
    const alertsSection = sections.value.find(s => s.id === 'alerts')
    const resultsSection = sections.value.find(s => s.id === 'results')

    if (remindersSection) {
      remindersSection.items = []
      remindersSection.count = 0
    }
    if (alertsSection) {
      alertsSection.items = []
      alertsSection.count = 0
    }
    if (resultsSection) {
      resultsSection.items = []
      resultsSection.count = 0
    }

    controls.forEach((control: any) => {
      if (control.estado === 'pendiente' || control.estado === 'vencido') {
        const icon = controlIconMap[control.nombre] || controlIconMap.default
        const isOverdue = control.estado === 'vencido'

        addMessage('reminders', {
          id: `REC-CTRL-${control.id}`,
          title: `${isOverdue ? '⚠️ ' : ''}Control: ${control.nombre}`,
          description: isOverdue
            ? 'Este control está vencido. ¡Realízalo cuanto antes!'
            : `Tienes un control programado. ${control.descripcion || ''}`,
          icon,
          iconColor: isOverdue ? 'text-red-500' : 'text-teal-500',
          iconBg: isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-teal-100 dark:bg-teal-900/30'
        })
      }
    })

    addMessage('alerts', {
      id: 'ALT-INFO-01',
      title: 'Recuerda tus controles',
      description: `Tienes ${controls.length} controles disponibles para registrar. Mantén tus mediciones al día.`,
      icon: markRaw(AlertCircle),
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30'
    })

    controls.forEach((control: any) => {
      addMessage('results', {
        id: `RES-AVAIL-${control.id}`,
        title: `${control.nombre} Disponible`,
        description: `Puedes registrar tu ${control.nombre.toLowerCase()} cuando lo desees.`,
        icon: controlIconMap[control.nombre] || controlIconMap.default,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30'
      })
    })
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    sections.value = [
      {
        id: 'results',
        title: 'RESULTADOS',
        count: 0,
        icon: markRaw(ClipboardCheck),
        iconColor: 'text-indigo-500 dark:text-indigo-400',
        items: []
      },
      {
        id: 'alerts',
        title: 'ALERTAS',
        count: 0,
        icon: markRaw(AlertCircle),
        iconColor: 'text-red-500',
        items: []
      },
      {
        id: 'reminders',
        title: 'RECORDATORIOS',
        count: 0,
        icon: markRaw(Bell),
        iconColor: 'text-teal-500',
        items: []
      },
      {
        id: 'news',
        title: 'NOVEDADES',
        count: 1,
        icon: markRaw(Sparkles),
        iconColor: 'text-violet-500',
        items: [
          {
            id: 'NOV-01',
            title: 'Nueva función: Control de Sueño',
            description: 'Ahora puedes registrar tus horas de sueño y ver correlaciones con tu energía diaria.',
            icon: markRaw(Info),
            iconColor: 'text-violet-500',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30'
          }
        ]
      }
    ]
  }

  return {
    sections,
    addMessage,
    upsertMessage,
    initFromControls,
    $reset
  }
})

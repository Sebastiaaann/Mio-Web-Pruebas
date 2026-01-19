import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  ClipboardCheck, 
  FileText, 
  Activity, 
  AlertCircle, 
  HeartPulse, 
  Bell, 
  Stethoscope, 
  Droplets,
  Sparkles,
  Info 
} from 'lucide-vue-next'

export const useMensajesStore = defineStore('mensajes', () => {
  const sections = ref([
    {
      id: 'results',
      title: 'RESULTADOS',
      count: 2,
      icon: ClipboardCheck,
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      items: [
        { 
            id: 'RES-001', 
            title: 'Examen de Sangre General', 
            description: 'Resultados disponibles para visualización. Todos los parámetros dentro del rango normal.',
            icon: FileText, 
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        { 
            id: 'RES-002', 
            title: 'Control Preventivo Anual', 
            description: 'Informe completo del chequeo preventivo realizado el 15 de Enero.',
            icon: Activity, 
            iconColor: 'text-indigo-500',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30'
        },
      ]
    },
    {
      id: 'alerts',
      title: 'ALERTAS',
      count: 2,
      icon: AlertCircle,
      iconColor: 'text-red-500',
      items: [
        { 
            id: 'ALT-102', 
            title: 'Presión Arterial Elevada', 
            description: 'Se detectó una lectura inusual en tu última medición (140/90). Te recomendamos descansar y medir nuevamente.',
            icon: HeartPulse, 
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100 dark:bg-red-900/30'
        },
        { 
            id: 'ALT-103', 
            title: 'Inactividad Física', 
            description: 'No se ha registrado actividad física en 3 días. ¡Una caminata de 15 min ayuda mucho!',
            icon: Activity, 
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30'
        },
      ]
    },
    {
      id: 'reminders',
      title: 'RECORDATORIOS',
      count: 2,
      icon: Bell,
      iconColor: 'text-teal-500',
      items: [
        { 
            id: 'REC-55', 
            title: 'Consulta Nutricionista', 
            description: 'Mañana a las 15:30 hrs con Dra. Soto. Recuerda llevar tus exámenes recientes.',
            icon: Stethoscope,
            iconColor: 'text-teal-500',
            iconBg: 'bg-teal-100 dark:bg-teal-900/30'
        },
        { 
            id: 'REC-56', 
            title: 'Hidratación', 
            description: 'Recuerda alcanzar tu meta de 2L hoy. Llevas 1.2L registrados.',
            icon: Droplets, 
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-50 dark:bg-blue-900/20'
        },
      ]
    },
    {
      id: 'news',
      title: 'NOVEDADES',
      count: 1,
      icon: Sparkles,
      iconColor: 'text-violet-500',
      items: [
        { 
            id: 'NOV-01', 
            title: 'Nueva función: Control de Sueño', 
            description: 'Ahora puedes registrar tus horas de sueño y ver correlaciones con tu energía diaria.',
            icon: Info, 
            iconColor: 'text-violet-500',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30'
        },
      ]
    }
  ])

  function addMessage(sectionId, message) {
    const sectionIndex = sections.value.findIndex(s => s.id === sectionId)
    if (sectionIndex !== -1) {
      sections.value[sectionIndex].items.unshift(message)
      sections.value[sectionIndex].count++
    }
  }

  return {
    sections,
    addMessage
  }
})

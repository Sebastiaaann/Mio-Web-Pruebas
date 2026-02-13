import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logger } from '@/utils/logger'

interface Cita {
  id: string
  tipo: string
  tipoNombre: string
  fecha: Date
  hora: string
  doctor: string
  especialidad: string
  estado: string
  notas: string
  color: string
}

interface NuevaCita {
  tipo: string
  tipoNombre?: string
  fecha: Date
  hora: string
  notas?: string
  color?: string
}

/**
 * Store de Citas - Maneja las citas medicas agendadas
 */
export const useTiendaCitas = defineStore('citas', () => {
  // State
  const citasAgendadas = ref<Cita[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // Mock data para desarrollo
  const MOCK_CITAS: Cita[] = [
    {
      id: '1',
      tipo: 'general',
      tipoNombre: 'Consulta General',
      fecha: new Date(2026, 0, 20, 9, 0),
      hora: '09:00',
      doctor: 'Dr. González',
      especialidad: 'Medicina General',
      estado: 'confirmada',
      notas: '',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      tipo: 'cardio',
      tipoNombre: 'Cardiología',
      fecha: new Date(2026, 0, 22, 14, 0),
      hora: '14:00',
      doctor: 'Dra. Martínez',
      especialidad: 'Cardiología',
      estado: 'confirmada',
      notas: 'Control de presión',
      color: 'bg-rose-500'
    },
    {
      id: '3',
      tipo: 'control',
      tipoNombre: 'Control Preventivo',
      fecha: new Date(2026, 0, 23, 10, 30),
      hora: '10:30',
      doctor: 'Dr. Silva',
      especialidad: 'Medicina Preventiva',
      estado: 'pendiente',
      notas: '',
      color: 'bg-violet-500'
    },
    {
      id: '4',
      tipo: 'nutricion',
      tipoNombre: 'Nutrición',
      fecha: new Date(2026, 0, 24, 15, 0),
      hora: '15:00',
      doctor: 'Lic. Fernández',
      especialidad: 'Nutrición',
      estado: 'confirmada',
      notas: 'Plan alimenticio',
      color: 'bg-emerald-500'
    },
    {
      id: '5',
      tipo: 'general',
      tipoNombre: 'Consulta General',
      fecha: new Date(2026, 0, 25, 11, 0),
      hora: '11:00',
      doctor: 'Dr. González',
      especialidad: 'Medicina General',
      estado: 'confirmada',
      notas: '',
      color: 'bg-blue-500'
    }
  ]

  // Getters
  const citasPorFecha = computed<Record<string, Cita[]>>(() => {
    const grouped: Record<string, Cita[]> = {}
    citasAgendadas.value.forEach(cita => {
      const key = cita.fecha.toISOString().split('T')[0]
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(cita)
    })
    return grouped
  })

  const citasProximas = computed(() => {
    const now = new Date()
    return citasAgendadas.value
      .filter(cita => cita.fecha >= now)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .slice(0, 5)
  })

  // Actions
  async function obtenerCitas(): Promise<{ success: boolean; error?: string }> {
    cargando.value = true
    error.value = null

    try {
      // Por ahora, usar mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      citasAgendadas.value = MOCK_CITAS

      logger.info('✅ Citas cargadas:', citasAgendadas.value.length)
      return { success: true }
    } catch (e) {
      error.value = (e as Error).message || 'Error al cargar citas'
      logger.error('❌ Error cargando citas:', e)
      return { success: false, error: error.value }
    } finally {
      cargando.value = false
    }
  }

  async function agregarCita(nuevaCita: NuevaCita): Promise<{ success: boolean; cita?: Cita; error?: string }> {
    cargando.value = true
    error.value = null

    try {
      const cita: Cita = {
        id: Date.now().toString(),
        tipo: nuevaCita.tipo,
        tipoNombre: nuevaCita.tipoNombre || 'General',
        fecha: nuevaCita.fecha,
        hora: nuevaCita.hora,
        doctor: 'Por asignar',
        especialidad: nuevaCita.tipoNombre || 'General',
        estado: 'pendiente',
        notas: nuevaCita.notas || '',
        color: nuevaCita.color || 'bg-blue-500'
      }

      citasAgendadas.value.push(cita)
      logger.info('✅ Cita agregada:', cita)

      return { success: true, cita }
    } catch (e) {
      error.value = (e as Error).message || 'Error al agendar cita'
      logger.error('❌ Error agendando cita:', e)
      return { success: false, error: error.value }
    } finally {
      cargando.value = false
    }
  }

  async function cancelarCita(citaId: string): Promise<{ success: boolean; error?: string }> {
    cargando.value = true
    error.value = null

    try {
      const index = citasAgendadas.value.findIndex(c => c.id === citaId)
      if (index !== -1) {
        citasAgendadas.value.splice(index, 1)
        logger.info('✅ Cita cancelada:', citaId)
      }

      return { success: true }
    } catch (e) {
      error.value = (e as Error).message || 'Error al cancelar cita'
      logger.error('❌ Error cancelando cita:', e)
      return { success: false, error: error.value }
    } finally {
      cargando.value = false
    }
  }

  function limpiarError(): void {
    error.value = null
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset(): void {
    citasAgendadas.value = []
    cargando.value = false
    error.value = null
  }

  return {
    // State
    citasAgendadas,
    cargando,
    error,
    // Getters
    citasPorFecha,
    citasProximas,
    // Actions
    obtenerCitas,
    agregarCita,
    cancelarCita,
    limpiarError,
    $reset
  }
})

// Alias para compatibilidad
export const useAppointmentsStore = useTiendaCitas

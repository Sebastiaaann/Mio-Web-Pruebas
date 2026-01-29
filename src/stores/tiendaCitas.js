import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { clienteApi } from '@/utils/clienteApi';
import { logger } from '@/utils/logger';

/**
 * Store de Citas - Maneja las citas médicas agendadas
 */
export const useTiendaCitas = defineStore('citas', () => {
  // State
  const citasAgendadas = ref([]);
  const cargando = ref(false);
  const error = ref(null);

  // Mock data para desarrollo
  const MOCK_CITAS = [
    {
      id: '1',
      tipo: 'general',
      tipoNombre: 'Consulta General',
      fecha: new Date(2026, 0, 20, 9, 0), // 20 Enero 2026, 09:00
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
      fecha: new Date(2026, 0, 22, 14, 0), // 22 Enero 2026, 14:00
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
      fecha: new Date(2026, 0, 23, 10, 30), // 23 Enero 2026, 10:30
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
      fecha: new Date(2026, 0, 24, 15, 0), // 24 Enero 2026, 15:00
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
      fecha: new Date(2026, 0, 25, 11, 0), // 25 Enero 2026, 11:00
      hora: '11:00',
      doctor: 'Dr. González',
      especialidad: 'Medicina General',
      estado: 'confirmada',
      notas: '',
      color: 'bg-blue-500'
    }
  ];

  // Getters
  const citasPorFecha = computed(() => {
    // Agrupa citas por fecha (YYYY-MM-DD)
    const grouped = {};
    citasAgendadas.value.forEach(cita => {
      const key = cita.fecha.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(cita);
    });
    return grouped;
  });

  const citasProximas = computed(() => {
    const now = new Date();
    return citasAgendadas.value
      .filter(cita => cita.fecha >= now)
      .sort((a, b) => a.fecha - b.fecha)
      .slice(0, 5);
  });

  // Actions
  async function obtenerCitas() {
    cargando.value = true;
    error.value = null;

    try {
      // TODO: Cuando esté la API real, usar esto:
      // const sessionMeta = localStorage.getItem("mio-session-meta");
      // const { patient_id } = JSON.parse(sessionMeta);
      // const data = await clienteApi.get(`/api/v1/patients/${patient_id}/appointments`);
      // citasAgendadas.value = data.appointments;

      // Por ahora, usar mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
      citasAgendadas.value = MOCK_CITAS;
      
      logger.info('✅ Citas cargadas:', citasAgendadas.value.length);
      return { success: true };
    } catch (e) {
      error.value = e.message || 'Error al cargar citas';
      logger.error('❌ Error cargando citas:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  async function agregarCita(nuevaCita) {
    cargando.value = true;
    error.value = null;

    try {
      // TODO: API real
      // const sessionMeta = localStorage.getItem("mio-session-meta");
      // const { patient_id } = JSON.parse(sessionMeta);
      // const data = await clienteApi.post(`/api/v1/patients/${patient_id}/appointments`, nuevaCita);

      // Mock: Agregar localmente
      const cita = {
        id: Date.now().toString(),
        ...nuevaCita,
        estado: 'pendiente',
        doctor: 'Por asignar',
        especialidad: nuevaCita.tipoNombre || 'General'
      };

      citasAgendadas.value.push(cita);
      logger.info('✅ Cita agregada:', cita);
      
      return { success: true, cita };
    } catch (e) {
      error.value = e.message || 'Error al agendar cita';
      logger.error('❌ Error agendando cita:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  async function cancelarCita(citaId) {
    cargando.value = true;
    error.value = null;

    try {
      // TODO: API real
      // await clienteApi.delete(`/api/v1/appointments/${citaId}`);

      // Mock: Eliminar localmente
      const index = citasAgendadas.value.findIndex(c => c.id === citaId);
      if (index !== -1) {
        citasAgendadas.value.splice(index, 1);
        logger.info('✅ Cita cancelada:', citaId);
      }

      return { success: true };
    } catch (e) {
      error.value = e.message || 'Error al cancelar cita';
      logger.error('❌ Error cancelando cita:', e);
      return { success: false, error: error.value };
    } finally {
      cargando.value = false;
    }
  }

  function limpiarError() {
    error.value = null;
  }

  /**
   * Resetear store a estado inicial
   */
  function $reset() {
    citasAgendadas.value = [];
    cargando.value = false;
    error.value = null;
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
  };
});

// Alias para compatibilidad
export const useAppointmentsStore = useTiendaCitas;

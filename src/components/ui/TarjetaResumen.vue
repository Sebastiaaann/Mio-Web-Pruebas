<script setup lang="ts">
/**
 * TarjetaResumen - Componente de ejemplo con diseño Premium SaaS
 * 
 * Este componente demuestra cómo usar las variables CSS de tema dinámico
 * para crear una tarjeta que cambia de color automáticamente según el plan activo.
 * 
 * @example
 * <TarjetaResumen
 *   titulo="Presión Arterial"
 *   subtitulo="Última medición"
 *   valor="120/80"
 *   unidad="mmHg"
 *   estado="Normal"
 *   estadoTipo="success"
 *   icono="lucide:heart"
 *   textoBoton="Ver historial"
 *   @accion="navigateToHistory"
 * />
 */
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

interface Props {
  /** Título de la tarjeta */
  titulo: string
  /** Subtítulo descriptivo (opcional) */
  subtitulo?: string
  /** Valor principal a mostrar */
  valor: string | number
  /** Unidad de medida (opcional) */
  unidad?: string
  /** Texto del estado (opcional) */
  estado?: string
  /** Tipo de estado para el badge */
  estadoTipo?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  /** Nombre del icono (formato iconify) */
  icono: string
  /** Texto del botón de acción */
  textoBoton: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitulo: '',
  unidad: '',
  estado: '',
  estadoTipo: 'neutral'
})

const emit = defineEmits<{
  (e: 'accion'): void
}>()

// Acceso al tema dinámico
const { colors } = useTheme()

/**
 * Clases CSS para el badge de estado según el tipo
 */
const estadoClase = computed(() => {
  const clases: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-slate-50 text-slate-700 border border-slate-200'
  }
  return clases[props.estadoTipo] || clases.neutral
})

const handleAccion = () => {
  emit('accion')
}
</script>

<template>
  <div class="tarjeta-resumen">
    <!-- Header con icono y estado -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Icono con fondo del tema dinámico -->
        <div 
          class="icono-tema"
          :style="{ 
            backgroundColor: colors.primaryLight, 
            color: colors.primary 
          }"
        >
          <iconify-icon :icon="icono" class="text-lg" />
        </div>
        
        <div>
          <h3 class="titulo">{{ titulo }}</h3>
          <p v-if="subtitulo" class="subtitulo">{{ subtitulo }}</p>
        </div>
      </div>
      
      <!-- Badge de estado -->
      <span 
        v-if="estado" 
        class="badge-estado"
        :class="estadoClase"
      >
        {{ estado }}
      </span>
    </div>
    
    <!-- Valor principal -->
    <div class="mb-5">
      <span class="valor">{{ valor }}</span>
      <span v-if="unidad" class="unidad">{{ unidad }}</span>
    </div>
    
    <!-- Botón de acción con color del tema -->
    <button 
      class="btn-accion"
      :style="{ backgroundColor: colors.primary }"
      @click="handleAccion"
    >
      {{ textoBoton }}
      <iconify-icon icon="lucide:arrow-right" class="ml-2" />
    </button>
  </div>
</template>

<style scoped>
/**
 * Tarjeta con diseño Premium SaaS Financiero
 * - Fondo blanco puro
 * - Sombra suave y difusa
 * - Bordes sutiles
 * - Transiciones suaves
 */
.tarjeta-resumen {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.025);
  transition: all 0.2s ease-out;
}

.tarjeta-resumen:hover {
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.025);
  border-color: #CBD5E1;
  transform: translateY(-1px);
}

/* Icono con fondo del tema dinámico */
.icono-tema {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-out;
}

/* Tipografía Cabinet Grotesk - Jerarquía clara */
.titulo {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: #334155;
  line-height: 1.4;
  margin: 0;
}

.subtitulo {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: #64748B;
  margin: 2px 0 0 0;
  line-height: 1.4;
}

/* Valor numérico grande y prominente - Cabinet Grotesk Bold */
.valor {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 700;
  font-size: 32px;
  letter-spacing: -0.025em;
  color: #0F172A;
  line-height: 1.2;
}

.unidad {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #64748B;
  margin-left: 4px;
}

/* Badge de estado - Cabinet Grotesk Medium */
.badge-estado {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.02em;
  padding: 4px 12px;
  border-radius: 9999px;
}

/* Botón de acción - Cabinet Grotesk Semibold */
.btn-accion {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  padding: 10px 16px;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-accion:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
}

.btn-accion:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>

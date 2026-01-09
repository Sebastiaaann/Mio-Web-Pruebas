<script setup>
import { ref, computed, watch } from 'vue';
import InputText from 'primevue/inputtext';
import { validarRut } from '@/utils/validadores';
import { formatearRut, limpiarRut } from '@/utils/formateadores';

const { 
  modelValue = '', 
  label = 'RUT',
  placeholder = 'Ej: 12.345.678-9',
  required = false,
  mostrarError = true
} = defineProps([
  'modelValue', 
  'label', 
  'placeholder', 
  'required', 
  'mostrarError'
]);

const emit = defineEmits(['update:modelValue', 'validacion']);

// Estado interno del componente
const inputRef = ref();
const valorInterno = ref(modelValue);
const rutValido = ref(true);
const mensajeError = ref('');

// Computed para determinar si hay error
const hayError = computed(() => {
  return !rutValido.value && valorInterno.value.length > 0;
});

// Computed para las clases CSS del input
const clasesInput = computed(() => {
  return {
    'p-invalid': hayError.value
  };
});

// Watch para cambios externos del modelValue
watch(() => modelValue, (nuevoValor) => {
  valorInterno.value = nuevoValor;
  validarRutInterno(nuevoValor);
});

// Función de validación interna
function validarRutInterno(rut) {
  if (!rut || rut.length === 0) {
    rutValido.value = !required;
    mensajeError.value = required ? 'El RUT es obligatorio' : '';
    return rutValido.value;
  }
  
  // Validar formato y dígito verificador
  const esValido = validarRut(rut);
  rutValido.value = esValido;
  mensajeError.value = esValido ? '' : 'RUT inválido';
  
  // Emitir evento de validación
  emit('validacion', { valido: esValido, rut: rut });
  
  return esValido;
}

// Manejar input del usuario
function manejarInput(event) {
  let valor = event.target.value;
  
  // Limpiar y formatear el RUT
  const rutLimpio = limpiarRut(valor);
  
  // Solo permitir hasta 9 caracteres (8 números + dígito verificador)
  if (rutLimpio.length <= 9) {
    const rutFormateado = rutLimpio.length > 1 ? formatearRut(rutLimpio) : rutLimpio;
    valorInterno.value = rutFormateado;
    
    // Validar
    validarRutInterno(rutFormateado);
    
    // Emitir cambio
    emit('update:modelValue', rutFormateado);
  }
}

// Manejar blur para validación final
function manejarBlur() {
  validarRutInterno(valorInterno.value);
}

// Función para enfocar el input (útil para navegación)
function enfocar() {
  inputRef.value?.$el.focus();
}

// Exponer métodos públicos
defineExpose({
  enfocar,
  validar: () => validarRutInterno(valorInterno.value)
});
</script>

<template>
  <div class="campo-rut">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-black mb-2"
      :class="{ 'text-red-600': hayError }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input -->
    <InputText
      ref="inputRef"
      :model-value="valorInterno"
      :placeholder="placeholder"
      :class="clasesInput"
      class="w-full"
      @input="manejarInput"
      @blur="manejarBlur"
      maxlength="12"
      autocomplete="off"
    />

    <!-- Mensaje de error -->
    <div 
      v-if="mostrarError && hayError && mensajeError" 
      class="error-message mt-1 text-sm"
      :class="hayError ? 'text-gray-600' : 'text-gray-500'"
    >
      {{ mensajeError }}
    </div>

    <!-- Mensaje de ayuda -->
    <div 
      v-if="!hayError && valorInterno.length === 0" 
      class="mt-1 text-xs text-gray-500"
    >
      Ingrese RUT sin puntos ni guion (ej: 123456789)
    </div>
  </div>
</template>

<style scoped>
.campo-rut {
  @apply w-full;
}

/* Estilos adicionales para el estado de error */
.p-invalid {
  border-color: #6B6B6B !important;
}

/* Animación suave para transiciones */
.error-message {
  transition: opacity 0.2s ease-in-out;
}
</style>
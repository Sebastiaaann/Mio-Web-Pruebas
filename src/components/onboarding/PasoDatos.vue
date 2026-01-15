<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { useOnboardingStore } from '@/stores/tiendaIncorporacion';
import InputRut from '@/components/forms/InputRut.vue';

const onboardingStore = useOnboardingStore();

// Estado local del formulario
const formularioLocal = ref({
  rut: '',
  nombre: '',
  apellido: '',
  genero: ''
});

// Estado de validación
const errores = ref({});
const tocado = ref({
  rut: false,
  nombre: false,
  apellido: false,
  genero: false
});

// Opciones para el dropdown de género
const opcionesGenero = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
  { label: 'Prefiero no decir', value: 'no_decir' }
];

// Computed para verificar si el formulario es válido
const formularioValido = computed(() => {
  return formularioLocal.value.rut && 
         formularioLocal.value.nombre && 
         formularioLocal.value.apellido && 
         formularioLocal.value.genero;
});

// Watch para actualizar store cuando cambie el formulario
watch(formularioLocal, (nuevosDatos) => {
  onboardingStore.actualizarDatosPersonales(nuevosDatos);
}, { deep: true });

// Watch para validación en tiempo real
watch(formularioLocal, () => {
  validarFormulario();
}, { deep: true });

// Funciones de validación
function validarCampo(campo, valor) {
  switch (campo) {
    case 'nombre':
    case 'apellido':
      if (!valor.trim()) {
        return `${campo.charAt(0).toUpperCase() + campo.slice(1)} es obligatorio`;
      }
      if (valor.trim().length < 2) {
        return `${campo.charAt(0).toUpperCase() + campo.slice(1)} debe tener al menos 2 caracteres`;
      }
      // Solo permitir letras, espacios y algunos caracteres especiales
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s''-]+$/.test(valor)) {
        return `${campo.charAt(0).toUpperCase() + campo.slice(1)} solo puede contener letras`;
      }
      break;
    case 'genero':
      if (!valor) {
        return 'Debe seleccionar una opción';
      }
      break;
  }
  return '';
}

function validarFormulario() {
  const nuevosErrores = {};
  
  Object.keys(formularioLocal.value).forEach(campo => {
    if (tocado.value[campo]) {
      const error = validarCampo(campo, formularioLocal.value[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    }
  });
  
  errores.value = nuevosErrores;
}

// Manejar blur de campos
function manejarBlur(campo) {
  tocado.value[campo] = true;
  validarFormulario();
}

// Manejar validación del RUT desde componente hijo
function manejarValidacionRut({ valido, rut }) {
  if (!valido && rut) {
    errores.value.rut = 'RUT inválido';
  } else {
    delete errores.value.rut;
  }
}

// Formatear nombres (capitalizar primera letra)
function formatearNombre(valor) {
  return valor
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

// Manejar input de nombres con formateo
function manejarInputNombre(campo, event) {
  const valor = event.target.value;
  // Permitir solo letras, espacios y acentos mientras se escribe
  const valorLimpio = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s''-]/g, '');
  formularioLocal.value[campo] = valorLimpio;
}

// Lifecycle
onMounted(() => {
  // Cargar datos existentes del store si los hay
  const datosExistentes = onboardingStore.datosPersonales;
  if (datosExistentes.rut || datosExistentes.nombre) {
    formularioLocal.value = { ...datosExistentes };
  }
});
</script>

<template>
  <div class="paso-datos">
    <Card class="border-none shadow-none">
      <template #header>
        <div class="text-center py-4">
          <h3 class="text-xl font-bold text-black mb-2">Datos Personales</h3>
          <p class="text-gray-600">
            Necesitamos algunos datos básicos para personalizar tu experiencia
          </p>
        </div>
      </template>

      <template #content>
        <div class="formulario-datos max-w-lg mx-auto space-y-6">
          <!-- RUT -->
          <div class="campo-formulario">
            <InputRut
              v-model="formularioLocal.rut"
              label="RUT"
              placeholder="Ej: 12.345.678-9"
              required
              @validacion="manejarValidacionRut"
              @blur="manejarBlur('rut')"
            />
          </div>

          <!-- Nombre -->
          <div class="campo-formulario">
            <label class="block text-sm font-medium text-black mb-2">
              Nombre
              <span class="text-red-500 ml-1">*</span>
            </label>
            <InputText
              v-model="formularioLocal.nombre"
              placeholder="Ingrese su nombre"
              :class="{ 'p-invalid': errores.nombre }"
              class="w-full"
              @input="manejarInputNombre('nombre', $event)"
              @blur="manejarBlur('nombre')"
              autocomplete="given-name"
            />
            <div v-if="errores.nombre" class="error-message mt-1 text-sm text-gray-600">
              {{ errores.nombre }}
            </div>
          </div>

          <!-- Apellido -->
          <div class="campo-formulario">
            <label class="block text-sm font-medium text-black mb-2">
              Apellido
              <span class="text-red-500 ml-1">*</span>
            </label>
            <InputText
              v-model="formularioLocal.apellido"
              placeholder="Ingrese su apellido"
              :class="{ 'p-invalid': errores.apellido }"
              class="w-full"
              @input="manejarInputNombre('apellido', $event)"
              @blur="manejarBlur('apellido')"
              autocomplete="family-name"
            />
            <div v-if="errores.apellido" class="error-message mt-1 text-sm text-gray-600">
              {{ errores.apellido }}
            </div>
          </div>

          <!-- Género -->
          <div class="campo-formulario">
            <label class="block text-sm font-medium text-black mb-2">
              Género
              <span class="text-red-500 ml-1">*</span>
            </label>
            <Dropdown
              v-model="formularioLocal.genero"
              :options="opcionesGenero"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione una opción"
              :class="{ 'p-invalid': errores.genero }"
              class="w-full"
              @blur="manejarBlur('genero')"
            />
            <div v-if="errores.genero" class="error-message mt-1 text-sm text-gray-600">
              {{ errores.genero }}
            </div>
          </div>

          <!-- Estado del formulario -->
          <div class="estado-formulario mt-8 p-4 bg-gray-50 rounded-lg border">
            <div class="flex items-center">
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-700 mb-1">
                  Estado del formulario:
                </div>
                <div class="flex items-center">
                  <div 
                    :class="[
                      'w-2 h-2 rounded-full mr-2',
                      formularioValido ? 'bg-green-500' : 'bg-gray-400'
                    ]"
                  ></div>
                  <span class="text-sm" :class="formularioValido ? 'text-green-700' : 'text-gray-600'">
                    {{ formularioValido ? 'Completo' : 'Incompleto' }}
                  </span>
                </div>
              </div>
              
              <div v-if="formularioValido" class="text-green-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Información de privacidad -->
          <div class="info-privacidad text-center mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-center mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 15h.01M8 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  stroke="#6b6b6b" 
                  stroke-width="1.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </svg>
              <span class="ml-2 text-sm font-medium text-gray-700">Privacidad y Seguridad</span>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed">
              Tus datos personales están protegidos y solo se utilizarán para 
              personalizar tu experiencia Mio. Nunca compartimos información 
              personal sin tu consentimiento explícito.
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.paso-datos {
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
}

.campo-formulario {
  margin-bottom: 0.25rem;
}

.estado-formulario {
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
  transition: all 0.3s ease;
}

.info-privacidad {
  background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
}

/* Animaciones */
.paso-datos {
  animation: slideInRight 0.5s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.campo-formulario {
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
}

.campo-formulario:nth-child(1) { animation-delay: 0.1s; }
.campo-formulario:nth-child(2) { animation-delay: 0.2s; }
.campo-formulario:nth-child(3) { animation-delay: 0.3s; }
.campo-formulario:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estados de validación */
.p-invalid {
  border-color: #6b6b6b !important;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
</style>
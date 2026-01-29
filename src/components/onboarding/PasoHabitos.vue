<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';
import { useOnboardingStore } from '@/stores/tiendaIncorporacion';

const onboardingStore = useOnboardingStore();

// Estado local del formulario
const formularioLocal = ref({
  cardiovascular: {
    hipertension: false,
    arritmia: false,
    colesterol_alto: false,
    diabetes: false
  },
  estiloVida: {
    tabaquismo: '',
    consumoAgua: 2 // valor por defecto: 2 litros
  },
  nutricion: {
    preferencias: '',
    alergias: ''
  }
});

// Opciones para el dropdown de tabaquismo
const opcionesTabaquismo = [
  { label: 'No fuma', value: 'no_fuma' },
  { label: 'Ocasional (fines de semana)', value: 'ocasional' },
  { label: 'Diario (< 10 cigarros)', value: 'diario_bajo' },
  { label: 'Diario (> 10 cigarros)', value: 'diario_alto' }
];

// Configuración de condiciones cardiovasculares
const condicionesCardiovasculares = [
  { 
    key: 'hipertension', 
    label: 'Hipertensión',
    descripcion: 'Presión arterial alta'
  },
  { 
    key: 'arritmia', 
    label: 'Arritmia',
    descripcion: 'Irregularidades en el ritmo cardíaco'
  },
  { 
    key: 'colesterol_alto', 
    label: 'Colesterol alto',
    descripcion: 'Niveles elevados de colesterol en sangre'
  },
  { 
    key: 'diabetes', 
    label: 'Diabetes',
    descripcion: 'Diabetes tipo 1 o tipo 2'
  }
];

// Computed para verificar si el formulario tiene datos mínimos
const formularioValido = computed(() => {
  return formularioLocal.value.estiloVida.tabaquismo && 
         formularioLocal.value.estiloVida.consumoAgua >= 0;
});

// Computed para mostrar resumen de condiciones seleccionadas
const condicionesSeleccionadas = computed(() => {
  return Object.entries(formularioLocal.value.cardiovascular)
    .filter(([_, seleccionada]) => seleccionada)
    .map(([key, _]) => {
      const condicion = condicionesCardiovasculares.find(c => c.key === key);
      return condicion ? condicion.label : key;
    });
});

// Watch para actualizar store cuando cambie el formulario
watch(formularioLocal, (nuevosDatos) => {
  onboardingStore.actualizarDatosHabitos(nuevosDatos);
}, { deep: 2 });

// Manejar cambio en checkbox de condiciones cardiovasculares
function manejarCambioCondicion(condicion, valor) {
  formularioLocal.value.cardiovascular[condicion] = valor;
}

// Manejar cambio en consumo de agua
function manejarCambioAgua(valor) {
  // Asegurar que el valor esté en un rango razonable (0-10 litros)
  if (valor >= 0 && valor <= 10) {
    formularioLocal.value.estiloVida.consumoAgua = valor;
  }
}

// Lifecycle
onMounted(() => {
  // Cargar datos existentes del store si los hay
  const datosExistentes = onboardingStore.datosHabitos;
  if (Object.keys(datosExistentes.cardiovascular).some(k => datosExistentes.cardiovascular[k]) ||
      datosExistentes.estiloVida.tabaquismo ||
      datosExistentes.estiloVida.consumoAgua > 0) {
    formularioLocal.value = { 
      ...formularioLocal.value,
      ...datosExistentes,
      // Merge profundo para objetos anidados
      cardiovascular: { ...formularioLocal.value.cardiovascular, ...datosExistentes.cardiovascular },
      estiloVida: { ...formularioLocal.value.estiloVida, ...datosExistentes.estiloVida },
      nutricion: { ...formularioLocal.value.nutricion, ...datosExistentes.nutricion }
    };
  }
});
</script>

<template>
  <div class="paso-habitos">
    <Card class="border-none shadow-none">
      <template #header>
        <div class="text-center py-4">
          <h3 class="text-xl font-bold text-black mb-2">Hábitos de Salud</h3>
          <p class="text-gray-600">
            Esta información nos ayudará a personalizar tu monitoreo de salud
          </p>
        </div>
      </template>

      <template #content>
        <div class="formulario-habitos max-w-2xl mx-auto space-y-8">
          
          <!-- Sección Cardiovascular -->
          <div class="seccion-cardiovascular">
            <div class="seccion-header mb-6">
              <div class="flex items-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M20.84 4.61c-1.5-1.07-3.46-1.33-5.19-.69L12 5.69 8.35 3.92c-1.73-.64-3.69-.38-5.19.69-1.94 1.38-2.34 4.15-.89 6.35l6.96 8.84c.68.86 1.98.86 2.66 0l6.96-8.84c1.45-2.2 1.05-4.97-.89-6.35z"
                    stroke="#000000" 
                    stroke-width="1.5" 
                    fill="none"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-black ml-3">Condiciones Cardiovasculares</h4>
              </div>
              <p class="text-sm text-gray-600">
                Seleccione las condiciones que apliquen a su situación actual (opcional)
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div 
                v-for="condicion in condicionesCardiovasculares" 
                :key="condicion.key"
                class="condicion-item p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div class="flex items-start">
                  <Checkbox
                    :model-value="formularioLocal.cardiovascular[condicion.key]"
                    @update:model-value="manejarCambioCondicion(condicion.key, $event)"
                    :inputId="condicion.key"
                    class="mr-3 mt-1"
                  />
                  <div class="flex-1">
                    <label 
                      :for="condicion.key" 
                      class="text-sm font-medium text-black cursor-pointer block"
                    >
                      {{ condicion.label }}
                    </label>
                    <p class="text-xs text-gray-600 mt-1">
                      {{ condicion.descripcion }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de condiciones seleccionadas -->
            <div v-if="condicionesSeleccionadas.length > 0" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-700">
                <strong>Condiciones seleccionadas:</strong> 
                {{ condicionesSeleccionadas.join(', ') }}
              </p>
            </div>
          </div>

          <Divider />

          <!-- Sección Estilo de Vida -->
          <div class="seccion-estilo-vida">
            <div class="seccion-header mb-6">
              <div class="flex items-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#000000" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-black ml-3">Estilo de Vida</h4>
              </div>
              <p class="text-sm text-gray-600">
                Información sobre sus hábitos diarios
              </p>
            </div>

            <div class="space-y-6">
              <!-- Tabaquismo -->
              <div class="campo-formulario">
                <label class="block text-sm font-medium text-black mb-2">
                  Hábitos de Tabaquismo
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <Dropdown
                  v-model="formularioLocal.estiloVida.tabaquismo"
                  :options="opcionesTabaquismo"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione su situación"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Esta información es confidencial y nos ayuda a personalizar las recomendaciones
                </div>
              </div>

              <!-- Consumo de Agua -->
              <div class="campo-formulario">
                <label class="block text-sm font-medium text-black mb-2">
                  Consumo Diario de Agua
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center flex-1">
                    <!-- Icono de grifo -->
                    <div class="mr-3 text-gray-600">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M6 2v6h.01M6 8a2 2 0 012 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 012-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2z"
                          stroke="currentColor" 
                          stroke-width="1.5" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <InputNumber
                      v-model="formularioLocal.estiloVida.consumoAgua"
                      :min="0"
                      :max="10"
                      :step="0.5"
                      showButtons
                      class="flex-1"
                      placeholder="2.0"
                      @update:model-value="manejarCambioAgua"
                    />
                  </div>
                  <span class="text-sm text-gray-600">litros/día</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Recomendado: 2-3 litros diarios para un adulto promedio
                </div>
              </div>
            </div>
          </div>

          <Divider />

          <!-- Sección Nutrición -->
          <div class="seccion-nutricion">
            <div class="seccion-header mb-6">
              <div class="flex items-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="#000000"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-black ml-3">Nutrición</h4>
              </div>
              <p class="text-sm text-gray-600">
                Información sobre preferencias alimentarias y alergias (opcional)
              </p>
            </div>

            <div class="space-y-4">
              <!-- Preferencias -->
              <div class="campo-formulario">
                <label class="block text-sm font-medium text-black mb-2">
                  Preferencias Alimentarias
                </label>
                <Textarea
                  v-model="formularioLocal.nutricion.preferencias"
                  placeholder="Ej: Vegetariano, vegano, sin gluten, dieta mediterránea..."
                  rows="3"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Comparta cualquier preferencia dietética que considere importante
                </div>
              </div>

              <!-- Alergias -->
              <div class="campo-formulario">
                <label class="block text-sm font-medium text-black mb-2">
                  Alergias Alimentarias
                </label>
                <Textarea
                  v-model="formularioLocal.nutricion.alergias"
                  placeholder="Ej: Mariscos, frutos secos, lácteos, gluten..."
                  rows="3"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Liste cualquier alergia alimentaria conocida para un monitoreo más seguro
                </div>
              </div>
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
                    {{ formularioValido ? 'Listo para finalizar' : 'Complete los campos obligatorios' }}
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
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.paso-habitos {
  max-width: 64rem;
  margin-left: auto;
  margin-right: auto;
}

.seccion-header {
  padding-bottom: 1rem;
}

.condicion-item {
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
  transition: all 0.2s ease;
}

.condicion-item:hover {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

.estado-formulario {
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
}

/* Animaciones */
.paso-habitos {
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.seccion-cardiovascular,
.seccion-estilo-vida,
.seccion-nutricion {
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
}

.seccion-cardiovascular { animation-delay: 0.1s; }
.seccion-estilo-vida { animation-delay: 0.2s; }
.seccion-nutricion { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mejora visual para checkboxes */
.condicion-item .p-checkbox .p-checkbox-box {
  border-color: #d1d5db;
}

.condicion-item .p-checkbox .p-checkbox-box.p-highlight {
  background-color: #000000;
  border-color: #000000;
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-habitos {
    max-width: none;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .condicion-item {
    padding: 0.75rem;
  }
}
</style>
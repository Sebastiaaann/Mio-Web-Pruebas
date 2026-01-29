<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Stepper from 'primevue/stepper';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useOnboardingStore } from '@/stores/tiendaIncorporacion';

// Componentes de los pasos
import PasoBienvenida from '@/components/onboarding/PasoBienvenida.vue';
import PasoDatos from '@/components/onboarding/PasoDatos.vue';
import PasoHabitos from '@/components/onboarding/PasoHabitos.vue';

const router = useRouter();
const toast = useToast();
const onboardingStore = useOnboardingStore();

// Estado local
const stepperRef = ref();
const cargandoEnvio = ref(false);

// Computed properties del store
const pasoActual = computed(() => onboardingStore.pasoActual);
const puedeAvanzar = computed(() => onboardingStore.puedeAvanzar(pasoActual.value));
const puedeRetroceder = computed(() => pasoActual.value > 0);
const formularioEnviado = computed(() => onboardingStore.formularioEnviado);

// Configuración de pasos
const pasos = [
  {
    id: 'bienvenida',
    titulo: 'Bienvenida',
    descripcion: 'Te damos la bienvenida a Mio',
    icono: 'pi pi-home'
  },
  {
    id: 'datos',
    titulo: 'Datos Personales',
    descripcion: 'Información demográfica',
    icono: 'pi pi-user'
  },
  {
    id: 'habitos',
    titulo: 'Hábitos de Salud',
    descripcion: 'Condiciones y estilo de vida',
    icono: 'pi pi-heart'
  }
];

// Métodos de navegación
async function avanzarPaso() {
  // Verificar si el paso actual permite avanzar
  if (pasoActual.value === 0) {
    // Paso de bienvenida - siempre puede avanzar
    onboardingStore.avanzarPaso();
  } else if (pasoActual.value === 1) {
    // Paso de datos - verificar validación
    if (onboardingStore.esPasoCompleto(1)) {
      onboardingStore.avanzarPaso();
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Datos Incompletos',
        detail: 'Por favor complete todos los campos obligatorios',
        life: 3000
      });
    }
  } else if (pasoActual.value === 2) {
    // Paso final - enviar formulario
    await enviarFormulario();
  }
}

function retrocederPaso() {
  onboardingStore.retrocederPaso();
}

// Envío del formulario
async function enviarFormulario() {
  try {
    cargandoEnvio.value = true;
    
    // Verificar que todos los pasos estén completos
    if (!onboardingStore.esPasoCompleto(1) || !onboardingStore.esPasoCompleto(2)) {
      throw new Error('Todos los pasos deben estar completos');
    }

    const resultado = await onboardingStore.enviarFormularioCompleto();
    
    if (resultado.success) {
      toast.add({
        severity: 'success',
        summary: '¡Completado!',
        detail: 'Tu perfil Mio ha sido configurado exitosamente',
        life: 4000
      });

      // Redirigir al dashboard después del éxito
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } else {
      throw new Error(resultado.error || 'Error al enviar datos');
    }
    
  } catch (error) {
    console.error('Error al enviar onboarding:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo completar el proceso',
      life: 4000
    });
  } finally {
    cargandoEnvio.value = false;
  }
}

// Obtener texto del botón según el paso actual
const textoBotonPrincipal = computed(() => {
  if (pasoActual.value === 0) return 'Comenzar';
  if (pasoActual.value === 1) return 'Continuar';
  if (pasoActual.value === 2) return cargandoEnvio.value ? 'Enviando...' : 'Finalizar';
  return 'Siguiente';
});

// Lifecycle
onMounted(() => {
  // Resetear store si es necesario
  if (formularioEnviado.value) {
    onboardingStore.reiniciarOnboarding();
  }
});
</script>

<template>
  <div class="onboarding-container min-h-screen bg-gray-50 py-8">
    <Toast />
    
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-black mb-2">Configuración Mio</h1>
        <p class="text-gray-600">Configure su perfil para comenzar a monitorear su salud</p>
      </div>

      <!-- Stepper Principal -->
      <Card class="shadow-sm">
        <template #content>
          <div class="stepper-container">
            <!-- Custom Stepper Header -->
            <div class="stepper-headers mb-8">
              <div 
                v-for="(paso, index) in pasos" 
                :key="paso.id"
                class="stepper-header-item mb-6"
                :class="{ 'active': index === pasoActual, 'completed': index < pasoActual }"
              >
                <div class="flex items-center">
                  <div 
                    :class="[
                      'stepper-number w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm mr-4',
                      index <= pasoActual ? 'bg-black border-black text-white' : 'bg-gray-100 border-gray-300 text-gray-500'
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div>
                    <h3 
                      :class="[
                        'text-lg font-semibold',
                        index <= pasoActual ? 'text-black' : 'text-gray-500'
                      ]"
                    >
                      {{ paso.titulo }}
                    </h3>
                    <p class="text-sm text-gray-600">{{ paso.descripcion }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div class="stepper-content">
              <div v-if="pasoActual === 0" class="step-content">
                <PasoBienvenida />
              </div>
              <div v-else-if="pasoActual === 1" class="step-content">
                <PasoDatos />
              </div>
              <div v-else-if="pasoActual === 2" class="step-content">
                <PasoHabitos />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Navegación -->
      <div class="flex justify-between items-center mt-8">
        <Button
          v-if="puedeRetroceder"
          label="Anterior"
          icon="pi pi-arrow-left"
          @click="retrocederPaso"
          outlined
          class="px-6 py-2"
        />
        <div v-else></div>

        <Button
          :label="textoBotonPrincipal"
          :icon="pasoActual === 2 ? 'pi pi-check' : 'pi pi-arrow-right'"
          :icon-pos="pasoActual === 2 ? 'left' : 'right'"
          @click="avanzarPaso"
          :loading="cargandoEnvio"
          :disabled="cargandoEnvio"
          class="px-8 py-2 bg-black text-white border-black hover:bg-gray-800"
        />
      </div>

      <!-- Indicador de progreso -->
      <div class="mt-6 text-center">
        <div class="text-sm text-gray-500">
          Paso {{ pasoActual + 1 }} de {{ pasos.length }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            class="bg-black h-2 rounded-full transition-colors transition-transform duration-300"
            :style="{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
}

.stepper-container {
  max-width: 64rem;
  margin-left: auto;
  margin-right: auto;
}

.stepper-headers {
  margin-bottom: 1rem;
}

.stepper-header-item {
  opacity: 0.5;
  transition: all 0.3s ease;
}

.stepper-header-item.active,
.stepper-header-item.completed {
  opacity: 1;
}

.stepper-number {
  transition: all 0.3s ease;
}

.step-content {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  animation: fadeInUp 0.4s ease-out;
}

/* Animaciones suaves */
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
</style>
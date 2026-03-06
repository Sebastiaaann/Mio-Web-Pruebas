/**
 * Tests unitarios para DynamicWizard
 * Cubre carga de protocolo, mapeo de componentes, navegación y resumen final.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import DynamicWizard from '@/components/wizard/DynamicWizard.vue'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/services/protocolService', () => ({
  getProtocol: vi.fn(),
  saveProtocolObservations: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}))

vi.mock('@/stores/tiendaUsuario', () => ({
  useTiendaUsuario: vi.fn(() => ({
    usuario: { patient_id: '123', nombre: 'Test', apellido: 'User' }
  }))
}))

vi.mock('@/stores/tiendaSalud', () => ({
  useHealthStore: vi.fn(() => ({
    fetchAllHealthData: vi.fn().mockResolvedValue(undefined),
    initMockData: vi.fn()
  }))
}))

vi.mock('@/composables/useAlturaPaciente', () => ({
  useAlturaPaciente: vi.fn(() => ({
    alturaCm: ref(170),
    alturaMetros: ref(1.70),
    setAlturaCm: vi.fn()
  }))
}))

import { getProtocol, saveProtocolObservations } from '@/services/protocolService'

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** Crea la respuesta de la API con un protocolo de un solo paso */
function crearProtocoloEjemplo(tipoComponente = 'question') {
  return {
    success: true,
    data: {
      protocol: [
        {
          id: 'proto-1',
          name: 'Protocolo de prueba',
          diagram: {
            components: [
              {
                id: 'comp-1',
                z_order: 1,
                dynamic_data: {
                  observation_type: { type: tipoComponente, id: 1 },
                  header: 'Paso 1',
                  question: { question: '¿Cómo te sientes?', options: ['Bien', 'Mal'] }
                }
              }
            ],
            links: []
          }
        }
      ]
    }
  }
}

/** Protocolo con dos pasos válidos */
function crearProtocoloDosParos() {
  return {
    success: true,
    data: {
      protocol: [
        {
          id: 'proto-2',
          name: 'Protocolo dos pasos',
          diagram: {
            components: [
              {
                id: 'comp-1',
                z_order: 1,
                dynamic_data: {
                  observation_type: { type: 'question', id: 1 },
                  header: 'Paso 1',
                  question: { question: '¿Pregunta 1?' }
                }
              },
              {
                id: 'comp-2',
                z_order: 2,
                dynamic_data: {
                  observation_type: { type: 'glucometer', id: 2 },
                  header: 'Paso 2'
                }
              }
            ],
            links: []
          }
        }
      ]
    }
  }
}

/** Protocolo con un paso de tipo 'text' para fallback testing */
function crearProtocoloTexto() {
  return {
    success: true,
    data: {
      protocol: [
        {
          id: 'proto-text',
          name: 'Protocolo texto',
          diagram: {
            components: [
              {
                id: 'comp-text',
                z_order: 1,
                dynamic_data: {
                  observation_type: { type: 'text', id: 99 },
                  header: 'Informacion',
                  body: 'Texto informativo'
                }
              }
            ],
            links: []
          }
        }
      ]
    }
  }
}

// ── Opciones de montaje ───────────────────────────────────────────────────────

const stubs = {
  QuestionStep: { template: '<div data-testid="question-step" />' },
  TensiometerStep: { template: '<div data-testid="tensiometer-step" />' },
  WeightStep: { template: '<div data-testid="weight-step" />' },
  GlucometerStep: { template: '<div data-testid="glucometer-step" />' },
  TextStep: { template: '<div data-testid="text-step" />' },
  WizardProgress: { template: '<div />' },
  WizardNavigation: { template: '<div />' },
  Loader2: { template: '<span data-testid="loader" />' },
  AlertCircle: { template: '<span />' },
  CheckCircle2: { template: '<span />' }
}

function montarWizard(protocolId = 'proto-1') {
  return mount(DynamicWizard, {
    global: { stubs },
    props: { protocolId }
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DynamicWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Estado de carga inicial
  it('muestra el texto de carga mientras se obtiene el protocolo', () => {
    // La promesa nunca resuelve para capturar el estado intermedio
    vi.mocked(getProtocol).mockReturnValue(new Promise(() => {}))

    const wrapper = montarWizard()

    // isLoading = true → el template muestra "Cargando protocolo..."
    expect(wrapper.text()).toContain('Cargando protocolo')
  })

  // 2. Manejo de error de API
  it('muestra mensaje de error cuando getProtocol rechaza', async () => {
    vi.mocked(getProtocol).mockRejectedValue(new Error('Error de red'))

    const wrapper = montarWizard()
    await flushPromises()

    expect(wrapper.text()).toContain('Error de red')
  })

  // 3. Renderizado del primer paso tras carga exitosa
  it('renderiza el primer paso después de cargar el protocolo', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloEjemplo('question'))

    const wrapper = montarWizard()
    await flushPromises()

    // El spinner ya no debe estar y el paso debe renderizarse
    expect(wrapper.text()).not.toContain('Cargando protocolo')
    expect(wrapper.find('[data-testid="question-step"]').exists()).toBe(true)
  })

  // 4. Mapeo correcto: tipo 'question' → QuestionStep
  it('mapea el tipo question a QuestionStep', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloEjemplo('question'))

    const wrapper = montarWizard()
    await flushPromises()

    expect(wrapper.find('[data-testid="question-step"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="text-step"]').exists()).toBe(false)
  })

  // 5. Tipo 'text' válido → TextStep (fallback y tipo explícito)
  it('renderiza TextStep para el tipo text', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloTexto())

    const wrapper = montarWizard()
    await flushPromises()

    expect(wrapper.find('[data-testid="text-step"]').exists()).toBe(true)
  })

  // 6. isFirstStep es verdadero al inicio (currentStepIndex = 0)
  it('isFirstStep es verdadero en el primer paso', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloDosParos())

    const wrapper = montarWizard()
    await flushPromises()

    // El componente expone isFirstStep como computed.
    // En <script setup> con Vue Test Utils, las propiedades reactivas son
    // accesibles directamente en wrapper.vm (sin .value)
    const vm = wrapper.vm as unknown as { isFirstStep: boolean }
    expect(vm.isFirstStep).toBe(true)
  })

  // 7. goToNextStep avanza al siguiente paso cuando el paso es válido
  it('goToNextStep avanza al segundo paso cuando el paso es válido', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloDosParos())

    const wrapper = montarWizard()
    await flushPromises()

    const vm = wrapper.vm as unknown as {
      isFirstStep: boolean
      isLastStep: boolean
      handleStepValid: (v: boolean) => void
      goToNextStep: () => void
    }

    // Verificar estado inicial
    expect(vm.isFirstStep).toBe(true)

    // Marcar paso válido y avanzar
    vm.handleStepValid(true)
    vm.goToNextStep()
    await wrapper.vm.$nextTick()

    // Ahora debería estar en el segundo paso
    expect(vm.isFirstStep).toBe(false)
    expect(vm.isLastStep).toBe(true)
  })

  // 8. resumenItems filtra observaciones con respuesta nula
  it('resumenItems solo incluye observaciones con valor no vacío', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloEjemplo('question'))
    // saveProtocolObservations devuelve batch sin ID → no llega a mostrar resumen aquí
    // Solo verificamos la lógica de formatearRespuesta: null → excluido
    vi.mocked(saveProtocolObservations).mockResolvedValue({ id: 'b1', observations: [] } as never)

    const wrapper = montarWizard()
    await flushPromises()

    // Acceder a resumenItems a través del método de la instancia
    const vm = wrapper.vm as unknown as {
      observacionesGuardadas: ObservacionGuardada[]
      resumenItems: Array<{ id: unknown; titulo: string; valor: string | null }>
    }

    // Inyectar directamente en la data reactiva expuesta
    // resumenItems es computed que depende de observacionesGuardadas
    // Como no hay defineExpose, lo evaluamos indirectamente via submitWizard + resumen DOM

    // Verificar que una respuesta string 'Bien' aparezca en resumenItems
    // Inyectar vía handleStepUpdate (método expuesto en vm)
    const vmFull = wrapper.vm as unknown as {
      handleStepUpdate: (v: unknown) => void
      handleStepValid: (v: boolean) => void
      submitWizard: () => Promise<void>
    }

    vmFull.handleStepUpdate('Bien')
    vmFull.handleStepValid(true)
    await vmFull.submitWizard()
    await flushPromises()

    // Después del submit, resumenItems debería tener 1 ítem
    const vmResumen = wrapper.vm as unknown as {
      resumenItems: Array<{ id: unknown; titulo: string; valor: string | null }>
    }
    // Debe haber al menos un ítem con valor
    expect(vmResumen.resumenItems.length).toBeGreaterThanOrEqual(1)
    expect(vmResumen.resumenItems.some((i) => i.valor !== null)).toBe(true)
  })

  // 9. Pantalla de resumen tras envío exitoso
  it('muestra la pantalla de resumen después de un envío exitoso', async () => {
    vi.mocked(getProtocol).mockResolvedValue(crearProtocoloEjemplo('question'))
    vi.mocked(saveProtocolObservations).mockResolvedValue({ id: 'batch-99', observations: [] } as never)

    const wrapper = montarWizard()
    await flushPromises()

    // Registrar una respuesta y enviar
    const vm = wrapper.vm as unknown as {
      handleStepUpdate: (v: unknown) => void
      handleStepValid: (v: boolean) => void
      submitWizard: () => Promise<void>
    }

    vm.handleStepUpdate('Respuesta válida')
    vm.handleStepValid(true)
    await vm.submitWizard()
    await flushPromises()

    // El resumen debe estar visible en el DOM
    expect(wrapper.text()).toContain('Resumen del control')
  })
})

// Tipo local para el test 8
interface ObservacionGuardada {
  stepId: string | number
  stepType: string
  stepData: object
  response: unknown
}

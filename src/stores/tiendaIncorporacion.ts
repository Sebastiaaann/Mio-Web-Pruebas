// stores/tiendaIncorporacion.ts
import { defineStore } from 'pinia'
import { validarRut, validarLongitud, validarRango, validarTextoLibre } from '@/utils/validadores'

interface DatosPersonales {
  rut: string
  nombre: string
  apellido: string
  genero: string
}

interface DatosHabitos {
  cardiovascular: {
    hipertension: boolean
    arritmia: boolean
    colesterol_alto: boolean
    diabetes: boolean
  }
  estiloVida: {
    tabaquismo: string
    consumoAgua: number
  }
  nutricion: {
    preferencias: string
    alergias: string
  }
}

interface OnboardingState {
  pasoActual: number
  pasosCompletados: boolean[]
  formularioEnviado: boolean
  datosPersonales: DatosPersonales
  datosHabitos: DatosHabitos
}

export const useOnboardingStore = defineStore('onboarding', {
  state: (): OnboardingState => ({
    // Control de flujo del stepper
    pasoActual: 0,
    pasosCompletados: [false, false, false],
    formularioEnviado: false,

    // Paso 1: Datos Personales (Demográficos)
    datosPersonales: {
      rut: '',
      nombre: '',
      apellido: '',
      genero: '' // valores: 'masculino', 'femenino', 'otro', 'no_decir'
    },

    // Paso 2: Datos de Hábitos de Salud
    datosHabitos: {
      // Condiciones cardiovasculares (checkboxes)
      cardiovascular: {
        hipertension: false,
        arritmia: false,
        colesterol_alto: false,
        diabetes: false
      },

      // Estilo de vida
      estiloVida: {
        tabaquismo: '', // valores: 'no_fuma', 'ocasional', 'diario_bajo', 'diario_alto'
        consumoAgua: 0 // litros por día (número)
      },

      // Nutrición
      nutricion: {
        preferencias: '', // texto libre
        alergias: '' // texto libre
      }
    }
  }),

  getters: {
    // Getter para verificar si un paso está completo
    esPasoCompleto: (state) => (numeroPaso: number): boolean => {
      switch (numeroPaso) {
        case 0:
          return state.pasosCompletados[0]
        case 1:
          return Boolean(
            state.datosPersonales.rut &&
            state.datosPersonales.nombre &&
            state.datosPersonales.apellido &&
            state.datosPersonales.genero
          )
        case 2:
          return Boolean(
            state.datosHabitos.estiloVida.tabaquismo &&
            state.datosHabitos.estiloVida.consumoAgua >= 0
          )
        default:
          return false
      }
    },

    // Getter para obtener los datos consolidados
    datosCompletos: (state) => ({
      datosPersonales: state.datosPersonales,
      datosHabitos: state.datosHabitos,
      fechaEnvio: new Date().toISOString(),
      version: '1.0'
    }),

    // Getter para verificar si se puede avanzar al siguiente paso
    puedeAvanzar: (state) => (pasoActual: number): boolean => {
      return state.pasosCompletados[pasoActual]
    }
  },

  actions: {
    validarDatosConsolidados(): { valido: boolean; errores: string[] } {
      const errores: string[] = []
      const { datosPersonales, datosHabitos } = this.datosCompletos

      const nombreValido = validarLongitud(datosPersonales.nombre?.trim() || '', 2, 50)
        && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(datosPersonales.nombre || '')
      const apellidoValido = validarLongitud(datosPersonales.apellido?.trim() || '', 2, 50)
        && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(datosPersonales.apellido || '')
      const generoValido = ['masculino', 'femenino', 'otro', 'no_decir'].includes(datosPersonales.genero)

      if (!validarRut(datosPersonales.rut || '')) {
        errores.push('El RUT no es válido')
      }
      if (!nombreValido) {
        errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres')
      }
      if (!apellidoValido) {
        errores.push('El apellido es obligatorio y debe tener al menos 2 caracteres')
      }
      if (!generoValido) {
        errores.push('Debe seleccionar un género válido')
      }

      const tabaquismoValido = ['no_fuma', 'ocasional', 'diario_bajo', 'diario_alto'].includes(
        datosHabitos.estiloVida.tabaquismo
      )
      const consumoAguaValido = validarRango(Number(datosHabitos.estiloVida.consumoAgua), 0, 10)

      if (!tabaquismoValido) {
        errores.push('Debe seleccionar una opción válida de tabaquismo')
      }
      if (!consumoAguaValido) {
        errores.push('El consumo de agua debe estar entre 0 y 10 litros')
      }

      if (!validarTextoLibre(datosHabitos.nutricion.preferencias || '', 300)) {
        errores.push('Las preferencias deben ser un texto válido de máximo 300 caracteres')
      }
      if (!validarTextoLibre(datosHabitos.nutricion.alergias || '', 300)) {
        errores.push('Las alergias deben ser un texto válido de máximo 300 caracteres')
      }

      return {
        valido: errores.length === 0,
        errores
      }
    },

    // Actualizar datos personales (Paso 1)
    actualizarDatosPersonales(datos: Partial<DatosPersonales>): void {
      this.datosPersonales = { ...this.datosPersonales, ...datos }
      this.pasosCompletados[1] = this.esPasoCompleto(1)
    },

    // Actualizar datos de hábitos (Paso 2)
    actualizarDatosHabitos(datos: Partial<DatosHabitos>): void {
      if (datos.cardiovascular) {
        this.datosHabitos.cardiovascular = { ...this.datosHabitos.cardiovascular, ...datos.cardiovascular }
      }
      if (datos.estiloVida) {
        this.datosHabitos.estiloVida = { ...this.datosHabitos.estiloVida, ...datos.estiloVida }
      }
      if (datos.nutricion) {
        this.datosHabitos.nutricion = { ...this.datosHabitos.nutricion, ...datos.nutricion }
      }

      this.pasosCompletados[2] = this.esPasoCompleto(2)
    },

    // Navegar al siguiente paso
    avanzarPaso(): void {
      if (this.pasoActual < 2) {
        this.pasosCompletados[this.pasoActual] = true
        this.pasoActual++
      }
    },

    // Navegar al paso anterior
    retrocederPaso(): void {
      if (this.pasoActual > 0) {
        this.pasoActual--
      }
    },

    // Ir a un paso específico (solo si los pasos anteriores están completos)
    irAPaso(numeroPaso: number): void {
      if (numeroPaso >= 0 && numeroPaso <= 2) {
        let puedeNavegar = true
        for (let i = 0; i < numeroPaso; i++) {
          if (!this.pasosCompletados[i]) {
            puedeNavegar = false
            break
          }
        }

        if (puedeNavegar) {
          this.pasoActual = numeroPaso
        }
      }
    },

    // Enviar formulario completo - acción principal
    async enviarFormularioCompleto(): Promise<{ success: boolean; data?: unknown; error?: string }> {
      try {
        if (!this.esPasoCompleto(1) || !this.esPasoCompleto(2)) {
          throw new Error('Todos los pasos deben estar completos antes del envío')
        }

        const resultadoValidacion = this.validarDatosConsolidados()
        if (!resultadoValidacion.valido) {
          throw new Error(resultadoValidacion.errores[0] || 'Datos inválidos')
        }

        const datosConsolidados = this.datosCompletos

        if (import.meta.env.DEV) {
          console.log('📊 Datos Personales:', datosConsolidados.datosPersonales)
          console.log('🫀 Datos de Salud:', datosConsolidados.datosHabitos)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))

        this.formularioEnviado = true

        if (import.meta.env.DEV) {
          console.log('✅ Onboarding enviado exitosamente')
        }
        return { success: true, data: datosConsolidados }
      } catch (error) {
        console.error('❌ Error al enviar onboarding:', error)
        return { success: false, error: (error as Error).message }
      }
    },

    // Resetear todo el store (para testing o reiniciar proceso)
    reiniciarOnboarding(): void {
      this.pasoActual = 0
      this.pasosCompletados = [false, false, false]
      this.formularioEnviado = false

      this.datosPersonales = {
        rut: '',
        nombre: '',
        apellido: '',
        genero: ''
      }

      this.datosHabitos = {
        cardiovascular: {
          hipertension: false,
          arritmia: false,
          colesterol_alto: false,
          diabetes: false
        },
        estiloVida: {
          tabaquismo: '',
          consumoAgua: 0
        },
        nutricion: {
          preferencias: '',
          alergias: ''
        }
      }
    },

    // Alias para consistencia con otros stores
    $reset(): void {
      this.reiniciarOnboarding()
    }
  }
})

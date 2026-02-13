// stores/tiendaIncorporacion.ts
import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
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

export const useOnboardingStore = defineStore('onboarding', () => {
  // State
  const pasoActual = ref(0)
  const pasosCompletados = ref([false, false, false])
  const formularioEnviado = ref(false)

  const datosPersonales = reactive<DatosPersonales>({
    rut: '',
    nombre: '',
    apellido: '',
    genero: ''
  })

  const datosHabitos = reactive<DatosHabitos>({
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
  })

  // Getters
  const esPasoCompleto = computed(() => (numeroPaso: number): boolean => {
    switch (numeroPaso) {
      case 0:
        return pasosCompletados.value[0]
      case 1:
        return Boolean(
          datosPersonales.rut &&
          datosPersonales.nombre &&
          datosPersonales.apellido &&
          datosPersonales.genero
        )
      case 2:
        return Boolean(
          datosHabitos.estiloVida.tabaquismo &&
          datosHabitos.estiloVida.consumoAgua >= 0
        )
      default:
        return false
    }
  })

  const datosCompletos = computed(() => ({
    datosPersonales,
    datosHabitos,
    fechaEnvio: new Date().toISOString(),
    version: '1.0'
  }))

  const puedeAvanzar = computed(() => (pasoActualIdx: number): boolean => {
    return pasosCompletados.value[pasoActualIdx]
  })

  // Actions
  function validarDatosConsolidados(): { valido: boolean; errores: string[] } {
    const errores: string[] = []
    const consolidated = datosCompletos.value // acceder al valor del computed

    const nombreValido = validarLongitud(consolidated.datosPersonales.nombre?.trim() || '', 2, 50)
      && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(consolidated.datosPersonales.nombre || '')
    const apellidoValido = validarLongitud(consolidated.datosPersonales.apellido?.trim() || '', 2, 50)
      && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(consolidated.datosPersonales.apellido || '')
    const generoValido = ['masculino', 'femenino', 'otro', 'no_decir'].includes(consolidated.datosPersonales.genero)

    if (!validarRut(consolidated.datosPersonales.rut || '')) {
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
      consolidated.datosHabitos.estiloVida.tabaquismo
    )
    const consumoAguaValido = validarRango(Number(consolidated.datosHabitos.estiloVida.consumoAgua), 0, 10)

    if (!tabaquismoValido) {
      errores.push('Debe seleccionar una opción válida de tabaquismo')
    }
    if (!consumoAguaValido) {
      errores.push('El consumo de agua debe estar entre 0 y 10 litros')
    }

    if (!validarTextoLibre(consolidated.datosHabitos.nutricion.preferencias || '', 300)) {
      errores.push('Las preferencias deben ser un texto válido de máximo 300 caracteres')
    }
    if (!validarTextoLibre(consolidated.datosHabitos.nutricion.alergias || '', 300)) {
      errores.push('Las alergias deben ser un texto válido de máximo 300 caracteres')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  function actualizarDatosPersonales(datos: Partial<DatosPersonales>): void {
    Object.assign(datosPersonales, datos)
    pasosCompletados.value[1] = esPasoCompleto.value(1)
  }

  function actualizarDatosHabitos(datos: Partial<DatosHabitos>): void {
    if (datos.cardiovascular) {
      Object.assign(datosHabitos.cardiovascular, datos.cardiovascular)
    }
    if (datos.estiloVida) {
      Object.assign(datosHabitos.estiloVida, datos.estiloVida)
    }
    if (datos.nutricion) {
      Object.assign(datosHabitos.nutricion, datos.nutricion)
    }

    pasosCompletados.value[2] = esPasoCompleto.value(2)
  }

  function avanzarPaso(): void {
    if (pasoActual.value < 2) {
      pasosCompletados.value[pasoActual.value] = true
      pasoActual.value++
    }
  }

  function retrocederPaso(): void {
    if (pasoActual.value > 0) {
      pasoActual.value--
    }
  }

  function irAPaso(numeroPaso: number): void {
    if (numeroPaso >= 0 && numeroPaso <= 2) {
      let puedeNavegar = true
      for (let i = 0; i < numeroPaso; i++) {
        if (!pasosCompletados.value[i]) {
          puedeNavegar = false
          break
        }
      }

      if (puedeNavegar) {
        pasoActual.value = numeroPaso
      }
    }
  }

  async function enviarFormularioCompleto(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      if (!esPasoCompleto.value(1) || !esPasoCompleto.value(2)) {
        throw new Error('Todos los pasos deben estar completos antes del envío')
      }

      const resultadoValidacion = validarDatosConsolidados()
      if (!resultadoValidacion.valido) {
        throw new Error(resultadoValidacion.errores[0] || 'Datos inválidos')
      }

      const datos = datosCompletos.value

      if (import.meta.env.DEV) {
        console.log('📊 Datos Personales:', datos.datosPersonales)
        console.log('🫀 Datos de Salud:', datos.datosHabitos)
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      formularioEnviado.value = true

      if (import.meta.env.DEV) {
        console.log('✅ Onboarding enviado exitosamente')
      }
      return { success: true, data: datos }
    } catch (error) {
      console.error('❌ Error al enviar onboarding:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  function reiniciarOnboarding(): void {
    pasoActual.value = 0
    pasosCompletados.value = [false, false, false]
    formularioEnviado.value = false

    Object.assign(datosPersonales, {
      rut: '',
      nombre: '',
      apellido: '',
      genero: ''
    })

    Object.assign(datosHabitos, {
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
    })
  }

  function $reset(): void {
    reiniciarOnboarding()
  }

  return {
    // State
    pasoActual,
    pasosCompletados,
    formularioEnviado,
    datosPersonales,
    datosHabitos,
    // Getters
    esPasoCompleto,
    datosCompletos,
    puedeAvanzar,
    // Actions
    validarDatosConsolidados,
    actualizarDatosPersonales,
    actualizarDatosHabitos,
    avanzarPaso,
    retrocederPaso,
    irAPaso,
    enviarFormularioCompleto,
    reiniciarOnboarding,
    $reset
  }
})

import { computed, ref } from 'vue'
import {
  guardarAlturaPacientePersistida,
  leerAlturaPacientePersistida
} from '@/utils/storageCliente'

function leerAlturaStorage(): number | null {
  return leerAlturaPacientePersistida()
}

function guardarAlturaStorage(alturaCm: number | null): void {
  guardarAlturaPacientePersistida(alturaCm)
}

export function useAlturaPaciente() {
  const alturaCm = ref<number | null>(leerAlturaStorage())

  const alturaMetros = computed(() => {
    if (!alturaCm.value) return null
    return alturaCm.value / 100
  })

  function setAlturaCm(valor: number | null): void {
    alturaCm.value = valor && Number.isFinite(valor) ? Math.round(valor) : null
    guardarAlturaStorage(alturaCm.value)
  }

  function limpiarAltura(): void {
    alturaCm.value = null
    guardarAlturaStorage(null)
  }

  return {
    alturaCm,
    alturaMetros,
    setAlturaCm,
    limpiarAltura
  }
}

export default useAlturaPaciente

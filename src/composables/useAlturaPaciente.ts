import { computed, ref } from 'vue'

const STORAGE_KEY = 'mio-altura-cm'

function leerAlturaStorage(): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const valor = Number(raw)
  if (!Number.isFinite(valor) || valor <= 0) return null
  return valor
}

function guardarAlturaStorage(alturaCm: number | null): void {
  if (typeof window === 'undefined') return
  if (!alturaCm) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, String(Math.round(alturaCm)))
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

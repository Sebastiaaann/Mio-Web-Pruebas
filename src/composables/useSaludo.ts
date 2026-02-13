import { computed } from 'vue'

/**
 * Composable para generar saludos según la hora del día
 * @returns Saludo personalizado (Buenos días, tardes o noches)
 */
export function useSaludo() {
  const saludo = computed(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buenos días'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })

  return {
    saludo
  }
}

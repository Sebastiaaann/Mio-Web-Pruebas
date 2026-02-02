import { computed, toValue, type MaybeRefOrGetter, type ComputedRef } from 'vue'

/**
 * Composable para filtrar banners según el plan activo del usuario
 *
 * Proporciona funcionalidad para:
 * - Filtrar banners por tipo de plan (esencial vs mutual)
 * - Plan esencial: solo muestra banners de "Berni Allen"
 * - Plan mutual: muestra todos los banners disponibles
 *
 * @example
 * ```ts
 * const { bannersFiltrados } = useBannersFiltrados(servicios, planActivo)
 * ```
 */

/** Opción de banner del servicio */
interface OpcionBanner {
  image?: string
  title?: string
  url?: string
  nombre?: string
  titulo?: string
  imagen?: string
  imagenUrl?: string
  logo?: string
  [key: string]: unknown
}

/** Servicio de tipo BANNER */
interface ServicioBanner {
  name?: string
  nombre?: string
  options?: OpcionBanner[]
  items?: OpcionBanner[]
}

/** Retorno del composable */
interface RetornoUseBannersFiltrados {
  bannersFiltrados: ComputedRef<OpcionBanner[]>
}

/**
 * Composable para filtrar banners según el plan activo
 *
 * @param servicios - Lista de servicios disponibles
 * @param planActivo - Plan activo del usuario ('esencial' | 'mutual')
 * @returns Objeto con banners filtrados
 */
export function useBannersFiltrados(
  servicios: MaybeRefOrGetter<ServicioBanner[]>,
  planActivo: MaybeRefOrGetter<string>
): RetornoUseBannersFiltrados {
  const bannersFiltrados = computed(() => {
    const listaServicios = toValue(servicios)
    const plan = toValue(planActivo)

    // Buscar el servicio de tipo BANNER
    const servicioBanner = listaServicios.find(s => s.name === 'BANNER' || s.nombre === 'BANNER')

    const opciones = servicioBanner?.options || servicioBanner?.items

    if (!servicioBanner || !opciones) {
      return []
    }

    // Obtener todos los banners que tengan imagen y título
    const todosBanners = opciones
      .map(option => ({
        ...option,
        image: option.image || option.imagen || option.imagenUrl || option.logo,
        title: option.title || option.titulo || option.nombre
      }))
      .filter(option => option.image && option.title)

    // Si el plan es esencial, filtrar solo "Clases en vivo con Berni Allen"
    if (plan === 'esencial') {
      return todosBanners.filter(banner =>
        banner.title?.toLowerCase().includes('berni allen')
      )
    }

    // Si es mutual, mostrar todos los banners
    return todosBanners
  })

  return {
    bannersFiltrados
  }
}

export default useBannersFiltrados

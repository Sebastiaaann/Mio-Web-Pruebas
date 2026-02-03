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
  home_position?: string
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
    const plan = String(toValue(planActivo) || '').toLowerCase()

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
        id: option.id || option.title || option.titulo || Math.random().toString(36).substr(2, 9),
        image: option.image || option.imagen || option.imagenUrl || option.logo,
        title: option.title || option.titulo || option.nombre,
        planName: option.plan_name || option.nombre,
        homePosition: option.home_position
      }))
      .filter(option => option.image && option.title)

    // Eliminar duplicados por ID o título
    const bannersUnicos = todosBanners.filter((banner, index, self) => 
      index === self.findIndex(b => b.id === banner.id || b.title === banner.title)
    )

    // Filtrar por plan cuando el plan_name esté disponible
    const bannersPorPlan = bannersUnicos.filter(banner => {
      if (!banner.planName) return false

      const planBanner = String(banner.planName).toLowerCase()

      return planBanner.includes(plan) || plan.includes(planBanner)
    })

    return bannersPorPlan.sort((a, b) => {
      const posA = Number(a.homePosition || 0)
      const posB = Number(b.homePosition || 0)
      return posA - posB
    })
  })

  return {
    bannersFiltrados
  }
}

export default useBannersFiltrados

/**
 * Datos de navegación para el header de la landing page
 */

export interface EnlaceNavegacion {
  etiqueta: string
  href: string
  descripcion?: string
  icono?: string
}

export interface GrupoNavegacion {
  etiqueta: string
  items: EnlaceNavegacion[]
  itemsSecundarios?: EnlaceNavegacion[]
}

export type ItemNavegacion = EnlaceNavegacion | GrupoNavegacion

/** Verifica si un item tiene sub-ítems (es un dropdown) */
export function esGrupo(item: ItemNavegacion): item is GrupoNavegacion {
  return 'items' in item
}

export const enlacesNavegacion: ItemNavegacion[] = [
  {
    etiqueta: 'Plataforma',
    items: [
      {
        etiqueta: 'Controles de Salud',
        href: '#controles',
        descripcion: 'Registra y monitorea tus mediciones en tiempo real',
        icono: 'activity',
      },
      {
        etiqueta: 'Beneficios',
        href: '#beneficios',
        descripcion: 'Descubre los beneficios de tu plan de salud',
        icono: 'gift',
      },
      {
        etiqueta: 'Historial',
        href: '#historial',
        descripcion: 'Accede al historial completo de tus controles',
        icono: 'clock',
      },
      {
        etiqueta: 'Citas',
        href: '#citas',
        descripcion: 'Agenda y gestiona tus citas médicas',
        icono: 'calendar',
      },
      {
        etiqueta: 'Mensajes',
        href: '#mensajes',
        descripcion: 'Comunícate directamente con tu equipo de salud',
        icono: 'message-circle',
      },
    ],
  },
  {
    etiqueta: 'Empresa',
    items: [
      {
        etiqueta: 'Quiénes Somos',
        href: '#nosotros',
        descripcion: 'Conoce la misión y el equipo detrás de Mio+',
        icono: 'users',
      },
      {
        etiqueta: 'Historias de Pacientes',
        href: '#historias',
        descripcion: 'Testimonios reales de personas que cuidan su salud',
        icono: 'heart',
      },
      {
        etiqueta: 'Alianzas',
        href: '#alianzas',
        descripcion: 'Clínicas y laboratorios asociados a nuestra red',
        icono: 'building-2',
      },
    ],
    itemsSecundarios: [
      { etiqueta: 'Términos de Uso', href: '/terminos' },
      { etiqueta: 'Privacidad', href: '/privacidad' },
      { etiqueta: 'Ayuda', href: '/ayuda' },
    ],
  },
  {
    etiqueta: 'Precios',
    href: '#precios',
  },
]

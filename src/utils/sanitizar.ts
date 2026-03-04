/**
 * sanitizar.ts
 * Utilidades centralizadas de sanitización HTML usando DOMPurify.
 *
 * Uso:
 *   import { sanitizarHtml, sanitizarHtmlRico } from '@/utils/sanitizar'
 *
 *   // Solo texto plano dentro de etiquetas simples
 *   const seguro = sanitizarHtml(contenidoDeApi)
 *
 *   // Permite más etiquetas (contenido enriquecido, ej: artículos)
 *   const enriquecido = sanitizarHtmlRico(contenidoDeApi)
 */

import DOMPurify from 'dompurify'

/**
 * Opciones para contenido de texto básico
 * (mensajes informativos, resultados médicos, indicaciones).
 * No se permiten atributos para evitar inyección de estilos o eventos.
 */
const OPCIONES_BASICAS = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span'] as string[],
  ALLOWED_ATTR: [] as string[],
}

/**
 * Opciones para contenido enriquecido (artículos, guías, educación al paciente).
 * Permite enlaces seguros (sin javascript:) y atributos de accesibilidad.
 */
const OPCIONES_RICAS = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's',
    'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'span', 'div', 'blockquote',
    'a', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ] as string[],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'aria-label', 'class'] as string[],
  FORCE_BODY: true,
}

/**
 * Sanitiza HTML básico proveniente de la API.
 * Adecuado para: mensajes de wizard, resultados médicos, indicaciones.
 *
 * @param html - Cadena HTML sin sanitizar (puede ser undefined/null)
 * @returns Cadena HTML sanitizada, o '' si la entrada está vacía
 */
export function sanitizarHtml(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, OPCIONES_BASICAS)
}

/**
 * Sanitiza HTML enriquecido proveniente de la API.
 * Adecuado para: artículos, guías clínicas, contenido educativo largo.
 *
 * @param html - Cadena HTML sin sanitizar (puede ser undefined/null)
 * @returns Cadena HTML sanitizada, o '' si la entrada está vacía
 */
export function sanitizarHtmlRico(html: string | null | undefined): string {
  if (!html) return ''
  const limpio = DOMPurify.sanitize(html, OPCIONES_RICAS)
  // Asegurar que los enlaces externos abran con protección
  return limpio.replace(/<a\s/g, '<a rel="noopener noreferrer" ')
}

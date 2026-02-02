import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Une nombre de clases de css y resuelve conflictos de tailwindcss
 */
export function unirClases(...entradas: Array<string | undefined | null | false>): string {
  return twMerge(clsx(...entradas))
}

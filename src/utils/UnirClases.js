import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 *Une nombre de clases de css y resuelve conflictos de tailwindcss

 */

 export function unirClases(...entradas) {
    return twMerge(clsx(...entradas));
 }
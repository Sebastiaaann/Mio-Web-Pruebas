import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ComputedRef } from 'vue'

type ValorParam = string | null
type ValidadorParam = (valor: string) => boolean

interface OpcionesRouteParams {
  defaults?: Record<string, string>
  validators?: Record<string, ValidadorParam>
}

interface ResultadoRouteParams {
  params: ComputedRef<Record<string, unknown>>
  query: ComputedRef<Record<string, unknown>>
  getParam: (key: string, defaultValue?: string | null) => ValorParam
  getQuery: (key: string, defaultValue?: string | null) => ValorParam
  getNumberParam: (key: string, defaultValue?: number) => number
  getNumberQuery: (key: string, defaultValue?: number) => number
  getBooleanQuery: (key: string, defaultValue?: boolean) => boolean
}

/**
 * Composable para acceder a los parametros de ruta de forma tipada y segura
 */
export function useRouteParams(options: OpcionesRouteParams = {}): ResultadoRouteParams {
  const route = useRoute()
  const { defaults = {}, validators = {} } = options

  function getParam(key: string, defaultValue: string | null = null): ValorParam {
    const value = route.params[key]

    if (value === undefined || value === null) {
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }

    const stringValue = Array.isArray(value) ? (value[0] ?? '') : String(value)

    if (validators[key] && !validators[key](stringValue)) {
      console.warn(`⚠️ Parametro de ruta '${key}' no paso la validacion:`, stringValue)
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }

    return stringValue
  }

  function getQuery(key: string, defaultValue: string | null = null): ValorParam {
    const value = route.query[key]

    if (value === undefined || value === null) {
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }

    const stringValue = Array.isArray(value) ? (value[0] ?? '') : String(value)

    if (validators[key] && !validators[key](stringValue)) {
      console.warn(`⚠️ Query param '${key}' no paso la validacion:`, stringValue)
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }

    return stringValue
  }

  function getNumberParam(key: string, defaultValue: number = 0): number {
    const value = getParam(key)
    if (value === null) return defaultValue

    const num = Number(value)
    return Number.isNaN(num) ? defaultValue : num
  }

  function getNumberQuery(key: string, defaultValue: number = 0): number {
    const value = getQuery(key)
    if (value === null) return defaultValue

    const num = Number(value)
    return Number.isNaN(num) ? defaultValue : num
  }

  function getBooleanQuery(key: string, defaultValue: boolean = false): boolean {
    const value = getQuery(key)
    if (value === null) return defaultValue

    return value === 'true' || value === '1'
  }

  const params = computed(() => route.params as Record<string, unknown>)
  const query = computed(() => route.query as Record<string, unknown>)

  return {
    params,
    query,
    getParam,
    getQuery,
    getNumberParam,
    getNumberQuery,
    getBooleanQuery
  }
}

/**
 * Helper para validar que un parametro es un ID numerico valido
 */
export function isValidId(value: string): boolean {
  if (!value) return false
  const num = Number(value)
  return !Number.isNaN(num) && num > 0 && Number.isInteger(num)
}

/**
 * Helper para validar que un string no esta vacio
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Helper para validar UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export default useRouteParams

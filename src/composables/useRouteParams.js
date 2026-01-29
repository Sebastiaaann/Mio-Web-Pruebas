import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable para acceder a los parámetros de ruta de forma tipada y segura
 * Proporciona getters computados para acceder a params y query params
 * con valores por defecto y validación de tipos
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.defaults - Valores por defecto para los parámetros
 * @param {Object} options.validators - Funciones de validación para parámetros
 * @returns {Object} { params, query, getParam, getQuery }
 * 
 * @example
 * // Uso básico
 * const { params, getParam } = useRouteParams()
 * const userId = getParam('id') // string | undefined
 * 
 * @example
 * // Con valores por defecto
 * const { getParam, getQuery } = useRouteParams({
 *   defaults: {
 *     page: '1',
 *     limit: '10'
 *   }
 * })
 * const page = getParam('page', '1') // siempre string
 * 
 * @example
 * // Con validadores
 * const { getParam } = useRouteParams({
 *   validators: {
 *     id: (val) => !isNaN(Number(val))
 *   }
 * })
 * const userId = getParam('id') // null si no pasa validación
 */
export function useRouteParams(options = {}) {
  const route = useRoute()
  const { defaults = {}, validators = {} } = options

  /**
   * Obtener parámetro de ruta con valor por defecto
   * @param {string} key - Nombre del parámetro
   * @param {string} defaultValue - Valor por defecto si no existe
   * @returns {string|null} Valor del parámetro o default
   */
  function getParam(key, defaultValue = null) {
    const value = route.params[key]
    
    // Si no existe el parámetro
    if (value === undefined || value === null) {
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }
    
    // Si es un array, tomar el primer valor
    const stringValue = Array.isArray(value) ? value[0] : value
    
    // Validar si hay un validador definido
    if (validators[key] && !validators[key](stringValue)) {
      console.warn(`⚠️ Parámetro de ruta '${key}' no pasó la validación:`, stringValue)
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }
    
    return stringValue
  }

  /**
   * Obtener parámetro de query con valor por defecto
   * @param {string} key - Nombre del query param
   * @param {string} defaultValue - Valor por defecto si no existe
   * @returns {string|null} Valor del query param o default
   */
  function getQuery(key, defaultValue = null) {
    const value = route.query[key]
    
    if (value === undefined || value === null) {
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }
    
    const stringValue = Array.isArray(value) ? value[0] : value
    
    if (validators[key] && !validators[key](stringValue)) {
      console.warn(`⚠️ Query param '${key}' no pasó la validación:`, stringValue)
      return defaultValue !== null ? defaultValue : (defaults[key] || null)
    }
    
    return stringValue
  }

  /**
   * Obtener parámetro numérico
   * @param {string} key - Nombre del parámetro
   * @param {number} defaultValue - Valor por defecto
   * @returns {number} Valor numérico
   */
  function getNumberParam(key, defaultValue = 0) {
    const value = getParam(key)
    if (value === null) return defaultValue
    
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }

  /**
   * Obtener query param numérico
   * @param {string} key - Nombre del query param
   * @param {number} defaultValue - Valor por defecto
   * @returns {number} Valor numérico
   */
  function getNumberQuery(key, defaultValue = 0) {
    const value = getQuery(key)
    if (value === null) return defaultValue
    
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }

  /**
   * Obtener parámetro booleano
   * @param {string} key - Nombre del parámetro
   * @param {boolean} defaultValue - Valor por defecto
   * @returns {boolean} Valor booleano
   */
  function getBooleanQuery(key, defaultValue = false) {
    const value = getQuery(key)
    if (value === null) return defaultValue
    
    return value === 'true' || value === '1'
  }

  // Computed reactivos para todos los params y query
  const params = computed(() => route.params)
  const query = computed(() => route.query)

  return {
    // Reactivos
    params,
    query,
    // Getters
    getParam,
    getQuery,
    getNumberParam,
    getNumberQuery,
    getBooleanQuery
  }
}

/**
 * Helper para validar que un parámetro es un ID numérico válido
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export function isValidId(value) {
  if (!value) return false
  const num = Number(value)
  return !isNaN(num) && num > 0 && Number.isInteger(num)
}

/**
 * Helper para validar que un string no está vacío
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Helper para validar UUID
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export function isValidUUID(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export default useRouteParams

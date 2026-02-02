/**
 * Tests unitarios para los type guards de useChartData
 */

import { describe, it, expect } from 'vitest'
import {
  esArrayMediciones,
  esHistorialMediciones,
  detectarTipoEntrada
} from '@/composables/useChartData'
import type { Medicion, HistorialMediciones } from '@/types/salud'
import {
  medicionPresionNormal,
  medicionGlicemia,
  arrayMedicionesVacio,
  arrayMedicionesPresion,
  arrayMedicionesMixtas,
  historialVacio,
  historialUnProtocolo,
  historialMixto,
  historialMultiplesProtocolos,
  historialConArraysVacios,
  arrayDeStrings,
  arrayDeNumeros,
  arrayObjetosInvalidos,
  objetoInvalido
} from './fixtures/mediciones.mock'

describe('Type Guards', () => {
  describe('esArrayMediciones', () => {
    it('deberia retornar true para array vacio', () => {
      expect(esArrayMediciones([])).toBe(true)
      expect(esArrayMediciones(arrayMedicionesVacio)).toBe(true)
    })

    it('deberia retornar true para array de mediciones validas', () => {
      expect(esArrayMediciones([medicionPresionNormal])).toBe(true)
      expect(esArrayMediciones(arrayMedicionesPresion)).toBe(true)
      expect(esArrayMediciones(arrayMedicionesMixtas)).toBe(true)
    })

    it('deberia retornar false para null', () => {
      expect(esArrayMediciones(null)).toBe(false)
    })

    it('deberia retornar false para undefined', () => {
      expect(esArrayMediciones(undefined)).toBe(false)
    })

    it('deberia retornar false para objeto', () => {
      expect(esArrayMediciones({})).toBe(false)
      expect(esArrayMediciones({ id: 'test' })).toBe(false)
      expect(esArrayMediciones(objetoInvalido)).toBe(false)
    })

    it('deberia retornar false para array de strings', () => {
      expect(esArrayMediciones(['string1', 'string2'])).toBe(false)
      expect(esArrayMediciones(arrayDeStrings)).toBe(false)
    })

    it('deberia retornar false para array de numeros', () => {
      expect(esArrayMediciones([1, 2, 3])).toBe(false)
      expect(esArrayMediciones(arrayDeNumeros)).toBe(false)
    })

    it('deberia retornar false para array de objetos invalidos', () => {
      expect(esArrayMediciones([{ foo: 'bar' }])).toBe(false)
      expect(esArrayMediciones(arrayObjetosInvalidos)).toBe(false)
    })
  })

  describe('esHistorialMediciones', () => {
    it('deberia retornar true para historial vacio', () => {
      expect(esHistorialMediciones({})).toBe(true)
      expect(esHistorialMediciones(historialVacio)).toBe(true)
    })

    it('deberia retornar true para historial con un protocolo', () => {
      expect(esHistorialMediciones(historialUnProtocolo)).toBe(true)
    })

    it('deberia retornar true para historial con multiples protocolos', () => {
      expect(esHistorialMediciones(historialMixto)).toBe(true)
      expect(esHistorialMediciones(historialMultiplesProtocolos)).toBe(true)
    })

    it('deberia retornar false para array', () => {
      expect(esHistorialMediciones([])).toBe(false)
      expect(esHistorialMediciones([medicionPresionNormal])).toBe(false)
    })

    it('deberia retornar false para null', () => {
      expect(esHistorialMediciones(null)).toBe(false)
    })

    it('deberia retornar false para undefined', () => {
      expect(esHistorialMediciones(undefined)).toBe(false)
    })

    it('deberia retornar false para string', () => {
      expect(esHistorialMediciones('string')).toBe(false)
    })

    it('deberia retornar false para numero', () => {
      expect(esHistorialMediciones(123)).toBe(false)
    })

    it('deberia retornar false para objeto con valores no-array', () => {
      expect(esHistorialMediciones({ proto: 'string' })).toBe(false)
      expect(esHistorialMediciones({ proto: 123 })).toBe(false)
    })
  })

  describe('detectarTipoEntrada', () => {
    it('deberia detectar array y retornar tipo array', () => {
      const resultado = detectarTipoEntrada([medicionPresionNormal])
      expect(resultado.tipo).toBe('array')
      expect(resultado.totalProtocolos).toBe(0)
    })

    it('deberia detectar historial y retornar tipo historial', () => {
      const resultado = detectarTipoEntrada(historialUnProtocolo)
      expect(resultado.tipo).toBe('historial')
    })

    it('deberia aplanar historial correctamente', () => {
      const resultado = detectarTipoEntrada(historialUnProtocolo)
      expect(resultado.datos).toHaveLength(1)
      expect(resultado.totalProtocolos).toBe(1)
    })

    it('deberia manejar array vacio', () => {
      const resultado = detectarTipoEntrada([])
      expect(resultado.tipo).toBe('array')
      expect(resultado.datos).toHaveLength(0)
    })

    it('deberia manejar historial vacio', () => {
      const resultado = detectarTipoEntrada(historialVacio)
      expect(resultado.tipo).toBe('historial')
      expect(resultado.datos).toHaveLength(0)
    })
  })
})

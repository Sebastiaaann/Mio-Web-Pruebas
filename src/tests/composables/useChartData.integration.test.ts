
import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useChartData, esHistorialMediciones } from '@/composables/useChartData'
import type { TipoMedicion, Medicion, HistorialMediciones } from '@/types/salud'
import {
  historialPresion,
  historialGlucosa,
  historialPeso,
  historialMixto,
  historialVacio,
  arrayPresion,
  arrayGlucosa,
  arrayPeso,
  arrayMixto,
  arrayVacio,
  medicionPresionConUnidades,
  medicionValorNulo,
  medicionFechaInvalida,
  medicionSinTipo,
  medicionPesoNegativo,
  medicionPesoExcesivo,
  medicionGlucosaNegativa,
  historialConValoresNulos,
  historialConFechasInvalidas,
  historialConPesosInvalidos,
  medicionesDesordenadas,
  medicionesIniciales,
  medicionesAdicionales
} from './fixtures/mediciones.mock'

describe('useChartData Integration', () => {
  describe('con HistorialMediciones', () => {
    it('deberia procesar historial de presion', () => {
      const { datosGrafico } = useChartData(historialPresion, 'presion')
      expect(datosGrafico.value.labels).toHaveLength(3)
    })
  })
})

// Fixtures para tests de useChartData

import type { Medicion, HistorialMediciones } from '@/types/salud'

// ============================================================================
// MEDICIONES BASE
// ============================================================================

export const medicionPresionNormal: Medicion = {
  id: 'med-001',
  tipo: 'presion',
  nombre: 'Presion',
  valor: '120/80',
  unidad: 'mmHg',
  fecha: '2024-01-15T10:30:00Z',
  estado: 'normal'
}

export const medicionGlicemia: Medicion = {
  id: 'med-003',
  tipo: 'glucosa',
  nombre: 'Glicemia',
  valor: '95',
  unidad: 'mg/dL',
  fecha: '2024-01-15T12:00:00Z',
  estado: 'normal'
}

export const medicionPesoNormal: Medicion = {
  id: 'med-005',
  tipo: 'peso',
  nombre: 'Peso',
  valor: '70',
  unidad: 'kg',
  fecha: '2024-01-15T08:00:00Z',
  estado: 'normal'
}

// ============================================================================
// MEDICIONES ESPECIALES PARA TESTS
// ============================================================================

export const medicionPresionConUnidades: Medicion = {
  id: 'med-002',
  tipo: 'presion',
  nombre: 'Presion',
  valor: '130/85',
  unidad: 'mmHg',
  fecha: '2024-01-14T09:00:00Z',
  estado: 'alerta'
}

export const medicionValorNulo: Medicion = {
  id: 'med-null',
  tipo: 'peso',
  nombre: 'Peso',
  valor: '',
  unidad: 'kg',
  fecha: '2024-01-15T08:00:00Z',
  estado: 'na'
}

export const medicionFechaInvalida: Medicion = {
  id: 'med-invalid-date',
  tipo: 'glucosa',
  nombre: 'Glicemia',
  valor: '100',
  unidad: 'mg/dL',
  fecha: 'fecha-invalida',
  estado: 'normal'
}

export const medicionSinTipo: Medicion = {
  id: 'med-no-type',
  tipo: 'general',
  nombre: 'Medicion',
  valor: '50',
  unidad: '',
  fecha: '2024-01-15T10:00:00Z',
  estado: 'normal'
}

export const medicionPesoNegativo: Medicion = {
  id: 'med-neg-weight',
  tipo: 'peso',
  nombre: 'Peso',
  valor: '-5',
  unidad: 'kg',
  fecha: '2024-01-15T08:00:00Z',
  estado: 'critico'
}

export const medicionPesoExcesivo: Medicion = {
  id: 'med-extreme-weight',
  tipo: 'peso',
  nombre: 'Peso',
  valor: '500',
  unidad: 'kg',
  fecha: '2024-01-15T08:00:00Z',
  estado: 'alerta'
}

export const medicionGlucosaNegativa: Medicion = {
  id: 'med-neg-glucose',
  tipo: 'glucosa',
  nombre: 'Glicemia',
  valor: '-20',
  unidad: 'mg/dL',
  fecha: '2024-01-15T10:00:00Z',
  estado: 'critico'
}

// ============================================================================
// ARRAYS DE MEDICIONES
// ============================================================================

export const arrayMedicionesVacio: Medicion[] = []
export const arrayMedicionesPresion: Medicion[] = [medicionPresionNormal]
export const arrayMedicionesMixtas: Medicion[] = [medicionPresionNormal, medicionGlicemia]

// Alias para compatibilidad con tests existentes
export const arrayPresion = arrayMedicionesPresion
export const arrayGlucosa: Medicion[] = [medicionGlicemia]
export const arrayPeso: Medicion[] = [medicionPesoNormal]
export const arrayMixto = arrayMedicionesMixtas
export const arrayVacio = arrayMedicionesVacio

// ============================================================================
// HISTORIALES DE MEDICIONES
// ============================================================================

export const historialVacio: HistorialMediciones = {}
export const historialUnProtocolo: HistorialMediciones = { 'protocolo-1': [medicionPresionNormal] }
export const historialMixto: HistorialMediciones = { 
  'proto-1': [medicionPresionNormal], 
  'proto-2': [medicionGlicemia] 
}
export const historialMultiplesProtocolos: HistorialMediciones = { 
  'a': [medicionPresionNormal], 
  'b': [medicionGlicemia] 
}
export const historialConArraysVacios: HistorialMediciones = { 
  'vacio': [], 
  'con-datos': [medicionPresionNormal] 
}

// Alias para compatibilidad con tests existentes
export const historialPresion: HistorialMediciones = {
  'protocolo-presion': [
    { ...medicionPresionNormal, id: 'med-p1', fecha: '2024-01-15T10:00:00Z' },
    { ...medicionPresionNormal, id: 'med-p2', valor: '125/82', fecha: '2024-01-14T10:00:00Z' },
    { ...medicionPresionNormal, id: 'med-p3', valor: '118/78', fecha: '2024-01-13T10:00:00Z' }
  ]
}

export const historialGlucosa: HistorialMediciones = {
  'protocolo-glucosa': [
    { ...medicionGlicemia, id: 'med-g1', fecha: '2024-01-15T12:00:00Z' },
    { ...medicionGlicemia, id: 'med-g2', valor: '92', fecha: '2024-01-14T12:00:00Z' },
    { ...medicionGlicemia, id: 'med-g3', valor: '98', fecha: '2024-01-13T12:00:00Z' }
  ]
}

export const historialPeso: HistorialMediciones = {
  'protocolo-peso': [
    { ...medicionPesoNormal, id: 'med-w1', fecha: '2024-01-15T08:00:00Z' },
    { ...medicionPesoNormal, id: 'med-w2', valor: '69.5', fecha: '2024-01-14T08:00:00Z' },
    { ...medicionPesoNormal, id: 'med-w3', valor: '70.2', fecha: '2024-01-13T08:00:00Z' }
  ]
}

// ============================================================================
// HISTORIALES CON DATOS INVÁLIDOS
// ============================================================================

export const historialConValoresNulos: HistorialMediciones = {
  'protocolo-invalido': [
    medicionValorNulo,
    { ...medicionPresionNormal, id: 'med-valid' }
  ]
}

export const historialConFechasInvalidas: HistorialMediciones = {
  'protocolo-fechas': [
    medicionFechaInvalida,
    { ...medicionGlicemia, id: 'med-valid-date' }
  ]
}

export const historialConPesosInvalidos: HistorialMediciones = {
  'protocolo-pesos': [
    medicionPesoNegativo,
    medicionPesoExcesivo,
    { ...medicionPesoNormal, id: 'med-valid-weight' }
  ]
}

// ============================================================================
// DATOS PARA TESTS DE ORDENAMIENTO
// ============================================================================

export const medicionesDesordenadas: Medicion[] = [
  { ...medicionPresionNormal, id: 'med-1', fecha: '2024-01-10T10:00:00Z' },
  { ...medicionPresionNormal, id: 'med-2', fecha: '2024-01-15T10:00:00Z' },
  { ...medicionPresionNormal, id: 'med-3', fecha: '2024-01-05T10:00:00Z' }
]

export const medicionesIniciales: Medicion[] = [
  { ...medicionPresionNormal, id: 'med-a', fecha: '2024-01-15T10:00:00Z' },
  { ...medicionPresionNormal, id: 'med-b', fecha: '2024-01-14T10:00:00Z' }
]

export const medicionesAdicionales: Medicion[] = [
  { ...medicionPresionNormal, id: 'med-c', fecha: '2024-01-16T10:00:00Z' },
  { ...medicionPresionNormal, id: 'med-d', fecha: '2024-01-13T10:00:00Z' }
]

// ============================================================================
// DATOS INVÁLIDOS PARA TYPE GUARDS
// ============================================================================

export const objetoInvalido = { id: 'invalido', nombre: 'Sin tipo' }
export const arrayDeStrings: string[] = ['presion', 'glucosa']
export const arrayDeNumeros: number[] = [120, 80]
export const arrayObjetosInvalidos = [{ foo: 'bar' }]

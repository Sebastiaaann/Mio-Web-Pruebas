/**
 * Validación de ownership y detección básica de enumeración.
 */

const VENTANA_MS = 5 * 60 * 1000
const BLOQUEO_MS = 5 * 60 * 1000
const MAX_PID_DISTINTOS = 3
const MAX_INTENTOS_INVALIDOS = 5

const registroEnumeracion = new Map()

function normalizarId(valor) {
  if (valor === undefined || valor === null) return null
  const texto = String(valor).trim()
  if (!texto) return null
  return texto
}

export function extraerPatientId(params = {}, body = {}) {
  return (
    normalizarId(params.pid) ||
    normalizarId(body.patient_id) ||
    normalizarId(body.patientId) ||
    normalizarId(body.id_patient)
  )
}

export function validarOwnership({ requiereOwnership, session, params, body }) {
  if (!requiereOwnership) {
    return { permitido: true, patientIdObjetivo: null, patientIdSesion: null }
  }

  const patientIdSesion = normalizarId(session?.patient_id)
  const patientIdObjetivo = extraerPatientId(params, body)

  if (!patientIdSesion) {
    return {
      permitido: false,
      motivo: 'Sesión sin patient_id',
      patientIdObjetivo,
      patientIdSesion
    }
  }

  if (!patientIdObjetivo) {
    return {
      permitido: false,
      motivo: 'Endpoint requiere patient_id',
      patientIdObjetivo,
      patientIdSesion
    }
  }

  // Comparar como strings para evitar falso negativo entre "123" y 123
  if (String(patientIdSesion) !== String(patientIdObjetivo)) {
    return {
      permitido: false,
      motivo: 'patient_id no coincide con sesión',
      patientIdObjetivo,
      patientIdSesion
    }
  }

  return {
    permitido: true,
    patientIdObjetivo,
    patientIdSesion
  }
}

function limpiarRegistrosAntiguos(registro, ahora) {
  registro.intentos = registro.intentos.filter(item => ahora - item.ts <= VENTANA_MS)
}

export function evaluarEnumeracion({ identityKey, patientIdObjetivo, patientIdSesion, esValido }) {
  if (!identityKey) return { bloqueado: false }

  const ahora = Date.now()
  const registro = registroEnumeracion.get(identityKey) || { intentos: [], bloqueadoHasta: 0 }

  if (registro.bloqueadoHasta > ahora) {
    return { bloqueado: true, motivo: 'Bloqueado temporalmente por intentos sospechosos' }
  }

  limpiarRegistrosAntiguos(registro, ahora)

  const esInvalido = !esValido && !!patientIdObjetivo && !!patientIdSesion && patientIdObjetivo !== patientIdSesion
  if (esInvalido) {
    registro.intentos.push({ pid: patientIdObjetivo, ts: ahora })
  }

  const pidDistintos = new Set(registro.intentos.map(item => item.pid)).size
  const totalInvalidos = registro.intentos.length

  if (pidDistintos > MAX_PID_DISTINTOS || totalInvalidos > MAX_INTENTOS_INVALIDOS) {
    registro.bloqueadoHasta = ahora + BLOQUEO_MS
    registroEnumeracion.set(identityKey, registro)
    return {
      bloqueado: true,
      motivo: 'Patrón de enumeración detectado'
    }
  }

  registroEnumeracion.set(identityKey, registro)
  return { bloqueado: false }
}

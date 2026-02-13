# 📋 Contexto: Implementación de Guardado de Controles

## 🎯 Resumen Ejecutivo

Implementación del guardado real de controles médicos en MIO-Web usando API HOMA Center.

**Problema Original:** MIO-Web usaba endpoint incorrecto (`/setuseservice`) y simulaba éxito.
**Solución:** Implementar endpoint `/batch` de API HOMA Center con formato Controls Engine.

---

## 🔍 Descubrimientos Clave

### APIs Involucradas

| API | URL | Uso |
|-----|-----|-----|
| **API HOMA Normal** | `https://apihoma.homa.cl:7200` | Lectura (health plans, protocolos) |
| **API HOMA Center** | `https://homacenter.homa.cl:7999` | Escritura (guardar controles) |

### Endpoint Correcto

```
POST https://homacenter.homa.cl:7999/batch?skip_tray=false&evaluate_observations=true
```

**Parámetros Query:**
- `skip_tray=false` - No saltar evaluación de bandeja
- `evaluate_observations=true` - Evaluar observaciones

---

## 📦 Formato JSON Correcto

### Estructura Principal

```typescript
{
  id: null,                          // null para controles nuevos
  patientId: 75863,                  // ID numérico del paciente
  patientName: "Sebastián",          // Nombre del paciente
  patientSurname: "almonacid",       // Apellido (en minúsculas)
  protocolId: 7,                     // ID del protocolo
  protocolName: "CONTROL PRESION ARTERIAL",
  observations: [/* ... */],         // Array de observaciones
  created: "2026-02-12 09:44:00.000 -0400",  // Formato especial
  validationDate: "2026-02-12 09:44:00.000 -0400",
  triage: "none",
  validated: false,
  validatedBy: null,
  comments: null,
  isPartOfProtocol: true
}
```

### Formato de Fecha

**Formato requerido:** `YYYY-MM-DD HH:MM:00.000 -0400`

**Ejemplo:** `"2026-02-12 09:44:00.000 -0400"`

**Nota:** Controls Engine resta 4 horas al timestamp actual.

### Estructura de Observaciones

#### Tipo Question (ID: 1)
```typescript
{
  patientId: 75863,
  type: {
    id: 1,
    type: "question",
    name: "observation_question_name",
    header: "observation_question_header",
    numberOfParameters: 1,
    parametersNames: ["answer"],
    parametersUnits: ["answer"],
    triggerAlarmIfRed: false,
    customizableRange: false
  },
  values: {
    answer: {
      text: "Bien",
      evaluation: "green"  // green | orange | red
    },
    question: "¿CÓMO SE HA SENTIDO DESDE SU ULTIMO CONTROL?"
  },
  timestamp: "2026-02-12 09:44:00.000 -0400",
  annotations: {
    stepNodeId: "component-id"
  }
}
```

#### Tipo Tensiometer (ID: 3)
```typescript
{
  patientId: 75863,
  type: {
    id: 3,
    type: "tensiometer",
    name: "observation_tensiometer_name",
    header: "observation_tensiometer_header",
    numberOfParameters: 3,
    parametersNames: ["Systolic", "Diastolic", "bpm"],
    parametersUnits: ["mmHg", "mmHg", "bpm"],
    triggerAlarmIfRed: true,
    customizableRange: true
  },
  values: {
    Systolic: 120,    // Número, NO string
    Diastolic: 80,
    bpm: 75
  },
  timestamp: "2026-02-12 09:44:00.000 -0400",
  annotations: {
    stepNodeId: "component-id"
  }
}
```

#### Tipo Glucometer (ID: 4)
```typescript
{
  patientId: 75863,
  type: {
    id: 4,
    type: "glucometer",
    name: "observation_glucometer_name",
    header: "observation_glucometer_header",
    numberOfParameters: 1,
    parametersNames: ["glucose"],
    parametersUnits: ["mg/dL"],
    triggerAlarmIfRed: true,
    customizableRange: true
  },
  values: {
    glucose: 95  // Número
  },
  timestamp: "...",
  annotations: { stepNodeId: "..." }
}
```

#### Tipo Weight (ID: 5)
```typescript
{
  patientId: 75863,
  type: {
    id: 5,
    type: "weight",
    name: "observation_weight_name",
    header: "observation_weight_header",
    numberOfParameters: 3,
    parametersNames: ["weight", "height", "IMC"],
    parametersUnits: ["Kg", "cm", "Kg/m2"],
    triggerAlarmIfRed: false,
    customizableRange: true
  },
  values: {
    weight: 70,
    height: 175,
    IMC: 22.9
  },
  timestamp: "...",
  annotations: { stepNodeId: "..." }
}
```

#### Tipo Text (ID: 2)
```typescript
{
  patientId: 75863,
  type: {
    id: 2,
    type: "text",
    name: "observation_text_name",
    header: "observation_text_header",
    numberOfParameters: 0,
    parametersNames: [],
    parametersUnits: [],
    triggerAlarmIfRed: false,
    customizableRange: false
  },
  values: {},  // Vacío para tipo text
  timestamp: "...",
  annotations: { stepNodeId: "..." }
}
```

---

## ⚠️ Qué NO Hacer

### ❌ Endpoint Incorrecto
```typescript
// NO USAR
await clienteApi.post('/api/v1/services/setuseservice', {
  patient_id: patientId,
  protocol_id: protocolId,
  observations
})
```

### ❌ Simular Éxito
```typescript
// NO SIMULAR ÉXITO
logger.warn('No se pudo guardar en la API, simulando éxito')
return {
  success: true,  // ¡Esto es incorrecto!
  message: 'Datos guardados localmente (modo offline)'
}
```

### ❌ Formato de Fecha ISO
```typescript
// NO USAR
"created": "2026-02-12T13:44:00.000Z"  // Formato incorrecto
```

### ❌ Valores como Strings
```typescript
// NO USAR
"Systolic": "120"  // Debe ser número: 120
```

---

## ✅ Qué SÍ Hacer

### ✅ Usar Endpoint Correcto
```typescript
await fetch('https://homacenter.homa.cl:7999/batch?skip_tray=false&evaluate_observations=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(batchData)
})
```

### ✅ Manejar Errores Reales
```typescript
try {
  const result = await saveBatchObservations(data)
  if (result.id) {
    // Éxito real
    return { success: true, data: result }
  }
} catch (error) {
  // Propagar error real
  throw new Error(`Error al guardar: ${error.message}`)
}
```

### ✅ Formato de Fecha Correcto
```typescript
"created": "2026-02-12 09:44:00.000 -0400"
```

### ✅ Valores Numéricos
```typescript
"Systolic": 120  // Número
```

---

## 📁 Archivos Clave

### Servicios
- `src/services/homaCenterService.ts` - Cliente API HOMA Center (NUEVO)
- `src/services/protocolService.ts` - Servicio de protocolos (MODIFICAR)

### Componentes
- `src/components/wizard/DynamicWizard.vue` - Wizard de controles (MODIFICAR)

### Tipos de Pasos
- `src/components/wizard/step-types/QuestionStep.vue`
- `src/components/wizard/step-types/TensiometerStep.vue`
- `src/components/wizard/step-types/GlucometerStep.vue`
- `src/components/wizard/step-types/WeightStep.vue`
- `src/components/wizard/step-types/TextStep.vue`

---

## 🔧 Mapeo de Tipos de Observación

### IDs y Nombres

| Tipo | ID | Nombre | Parámetros |
|------|----|---------|------------|
| question | 1 | observation_question_name | answer |
| text | 2 | observation_text_name | (ninguno) |
| tensiometer | 3 | observation_tensiometer_name | Systolic, Diastolic, bpm |
| glucometer | 4 | observation_glucometer_name | glucose |
| weight | 5 | observation_weight_name | weight, height, IMC |
| termometer | 6 | observation_termometer_name | temperature |
| oxymeter | 7 | observation_oxymeter_name | bpm, SPO2 |

### Obtención Dinámica

Los tipos se obtienen de:
```
GET https://apihoma.homa.cl:7200/api/v1/batch/observation_types
```

Y se cachean en el servicio para no llamar repetidamente.

---

## 🧪 Testing

### Credenciales de Prueba

```json
{
  "email": "sebastian.almo9@gmail.com",
  "UID": "ZptrTFb5HMcRyu7Tq92WOP2uZoP2",
  "patient_id": "75863",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Paciente de Prueba

- **ID:** 75863
- **Nombre:** Sebastián Almonacid
- **Plan:** Mutual
- **Health Plans:** test Homa2C, PLAN LIBRE

### Protocolo de Prueba

- **ID:** 7
- **Nombre:** CONTROL PRESION ARTERIAL

---

## 📝 Ejemplo Completo de JSON Válido

```json
{
  "id": null,
  "patientId": 75863,
  "patientName": "Sebastián",
  "patientSurname": "almonacid",
  "protocolId": 7,
  "protocolName": "CONTROL PRESION ARTERIAL",
  "observations": [
    {
      "patientId": 75863,
      "type": {
        "id": 1,
        "type": "question",
        "name": "observation_question_name",
        "header": "observation_question_header",
        "numberOfParameters": 1,
        "parametersNames": ["answer"],
        "parametersUnits": ["answer"],
        "triggerAlarmIfRed": false,
        "customizableRange": false
      },
      "values": {
        "answer": {
          "text": "Bien",
          "evaluation": "green"
        },
        "question": "¿CÓMO SE HA SENTIDO DESDE SU ULTIMO CONTROL?"
      },
      "timestamp": "2026-02-12 09:44:00.000 -0400",
      "annotations": {
        "stepNodeId": "component-id-1"
      }
    },
    {
      "patientId": 75863,
      "type": {
        "id": 3,
        "type": "tensiometer",
        "name": "observation_tensiometer_name",
        "header": "observation_tensiometer_header",
        "numberOfParameters": 3,
        "parametersNames": ["Systolic", "Diastolic", "bpm"],
        "parametersUnits": ["mmHg", "mmHg", "bpm"],
        "triggerAlarmIfRed": true,
        "customizableRange": true
      },
      "values": {
        "Systolic": 120,
        "Diastolic": 80,
        "bpm": 75
      },
      "timestamp": "2026-02-12 09:44:00.000 -0400",
      "annotations": {
        "stepNodeId": "component-id-2"
      }
    }
  ],
  "created": "2026-02-12 09:44:00.000 -0400",
  "validationDate": "2026-02-12 09:44:00.000 -0400",
  "triage": "none",
  "validated": false,
  "validatedBy": null,
  "comments": null,
  "isPartOfProtocol": true
}
```

---

## 🔄 Flujo de Guardado

1. **Wizard completa todos los pasos**
2. **DynamicWizard recopila respuestas** en `responses.value`
3. **Transformar cada respuesta** al formato Controls Engine
4. **Obtener datos del paciente** (del store o API)
5. **Construir JSON completo** con todas las observaciones
6. **Enviar a API HOMA Center** vía `homaCenterService.saveBatchObservations()`
7. **Manejar respuesta real** (sin simular)
8. **Redirigir al usuario** o mostrar error

---

## 📚 Referencias

- **Controls Engine:** `E:\Controles-homa-mio\controls-engine-main\`
- **API HOMA:** `https://apihoma.homa.cl:7200`
- **API HOMA Center:** `https://homacenter.homa.cl:7999`
- **Documentación completa:** `docs/analisis-controles-flujo.md`

---

---

## 🚀 Implementación Realizada

### 📅 Fecha: 2026-02-12
### 🌿 Rama: `fix/guardado-controles-homa-center`

### 📁 Archivos Creados/Modificados

#### 1. Nuevo Servicio: `src/services/homaCenterService.ts`

**Funcionalidad:**
- Cliente dedicado para API HOMA Center
- Cache de tipos de observación
- Función `guardarBatchObservaciones()` para enviar controles
- Formateo de timestamps al formato Controls Engine
- Construcción de observaciones según tipo

**Funciones principales:**
- `obtenerTiposObservacion()` - Obtiene y cachea tipos de la API
- `formatearTimestamp()` - Formato "YYYY-MM-DD HH:MM:00.000 -0400"
- `construirObservacion()` - Crea estructura de observación según tipo
- `guardarBatchObservaciones()` - Envía el batch completo
- `limpiarCacheTiposObservacion()` - Limpia cache si es necesario

#### 2. Servicio Modificado: `src/services/protocolService.ts`

**Cambios:**
- Reemplazada función `saveProtocolObservations()`
- Eliminada simulación de éxito
- Ahora usa `guardarBatchObservaciones()` del nuevo servicio
- Firma actualizada con parámetros adicionales:
  - `patientName`
  - `patientSurname`  
  - `protocolName`

**Antes (incorrecto):**
```typescript
export async function saveProtocolObservations(
  patientId: string,
  protocolId: string,
  observations: unknown[]
): Promise<Record<string, unknown>>
```

**Después (correcto):**
```typescript
export async function saveProtocolObservations(
  patientId: string,
  patientName: string,
  patientSurname: string,
  protocolId: string,
  protocolName: string,
  observations: WizardObservation[]
): Promise<BatchResponse>
```

#### 3. Componente Modificado: `src/components/wizard/DynamicWizard.vue`

**Cambios en función `submitWizard()`:**
- Obtiene datos del paciente del store (`name`, `lastname`)
- Obtiene nombre del protocolo de `protocolData.value`
- Transforma respuestas al formato Controls Engine
- Verifica éxito por `result.id` (no por `result.success`)
- Maneja errores reales (sin simular)

**Flujo actualizado:**
1. Obtener `patientId` del store o props
2. Obtener `patientName` y `patientSurname` del store
3. Obtener `protocolName` de los datos del protocolo
4. Construir array de observaciones con:
   - `stepId`
   - `stepType`
   - `stepData` (question, observationType)
   - `response`
5. Llamar a `saveProtocolObservations()` con todos los parámetros
6. Verificar respuesta tiene `id` (éxito real)
7. Emitir eventos o mostrar error

### ✅ Validación

**Prueba exitosa realizada:**
- Endpoint: `POST https://homacenter.homa.cl:7999/batch`
- Respuesta: `200 OK`
- ID generado: `63921`
- Paciente: `75863`
- Protocolo: `CONTROL PRESION ARTERIAL`

**Nota (desarrollo local):**
- Para evitar CORS, usar proxy server-side `POST /api/homa-center/batch`

**JSON enviado (ejemplo):**
```json
{
  "id": null,
  "patientId": 75863,
  "patientName": "Sebastián",
  "patientSurname": "almonacid",
  "protocolId": 7,
  "protocolName": "CONTROL PRESION ARTERIAL",
  "observations": [
    {
      "patientId": 75863,
      "type": { /* tipo question */ },
      "values": { "answer": { "text": "Bien", "evaluation": "green" } },
      "timestamp": "2026-02-12 09:44:00.000 -0400",
      "annotations": { "stepNodeId": "..." }
    },
    {
      "patientId": 75863,
      "type": { /* tipo tensiometer */ },
      "values": { "Systolic": 120, "Diastolic": 80, "bpm": 75 },
      "timestamp": "2026-02-12 09:44:00.000 -0400",
      "annotations": { "stepNodeId": "..." }
    }
  ],
  "created": "2026-02-12 09:44:00.000 -0400",
  "validationDate": "2026-02-12 09:44:00.000 -0400",
  "triage": "none",
  "validated": false,
  "validatedBy": null,
  "comments": null,
  "isPartOfProtocol": true
}
```

### 🧪 Pruebas Recomendadas

1. **Wizard completo:** Completar un control de presión arterial
2. **Verificar respuesta:** Confirmar que retorna ID de batch
3. **Historial:** Verificar que aparece en el historial del paciente
4. **Errores:** Probar manejo de errores (sin conexión, etc.)

### 📝 Notas de Implementación

- **Tipos de observación:** Se obtienen dinámicamente de la API y se cachean
- **Formato de fecha:** Se restan 4 horas como hace Controls Engine
- **Valores numéricos:** Se aseguran como números (no strings)
- **Autenticación:** ✅ AHORA REQUIERE token X-API-KEY (corregido vulnerabilidad crítica)
- **CORS:** ✅ Resuelto con proxy server-side (`/api/homa-center/batch`)
- **Error handling:** Ahora propaga errores reales, no simula éxito

---

## 🔒 Seguridad Implementada

### Correcciones de Seguridad Críticas (2026-02-12)

#### 1. ✅ Autenticación Obligatoria
**Problema:** API HOMA Center no requería autenticación.
**Solución:** Agregar header `X-API-KEY` con token del usuario.

```typescript
// src/services/homaCenterService.ts
function obtenerTokenAuth(): string | null {
  return localStorage.getItem('mio-token')
}

const token = obtenerTokenAuth()
if (!token) {
  throw new Error('No se encontró token de autenticación...')
}

await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': token
  }
})
```

#### 2. ✅ Validación de Rangos Médicos
**Problema:** Se aceptaban valores médicamente imposibles.
**Solución:** Validadores específicos por tipo de medición.

```typescript
// Validadores implementados:
- validarDatosTensiometer(): Sistólica 50-300 mmHg, Diastólica 30-200 mmHg, BPM 30-250
- validarDatosGlucometer(): Glucosa 20-1000 mg/dL
- validarDatosWeight(): Peso 1-500 Kg, Altura 30-300 cm, IMC 5-100
- validarDatosOxymeter(): BPM 30-250, SpO2 50-100%
- validarDatosTermometer(): Temperatura 30-45 °C
```

#### 3. ✅ Sanitización de Logs
**Problema:** Logs podían exponer datos médicos sensibles (PHI).
**Solución:** Truncar IDs y nunca loggear valores médicos.

```typescript
// ANTES (inseguro):
logger.info('Batch:', { patientId: 75863, observations: [...] })

// DESPUÉS (seguro):
logger.info('Batch:', {
  patientId: `[ID:758...]`, // Truncado
  observationsCount: 5      // Solo conteo
})
```

### Patrones de Seguridad Aplicados

#### Manejo de Datos Sensibles (PHI)
```typescript
// ✅ CORRECTO
logger.info('Control guardado', {
  batchId: result.id,
  patientId: hashId(result.patientId),
  observationsCount: result.observations.length
  // NUNCA: valores médicos, diagnósticos, datos personales
})
```

#### Validación de Inputs
```typescript
// ✅ CORRECTO
function validarPresion(sistolica: number) {
  if (sistolica < 50 || sistolica > 300) {
    throw new Error('Presión fuera de rango válido')
  }
}

// ❌ INCORRECTO
const valores = { Systolic: data.systolic } // Sin validar
```

---

*Contexto actualizado: 2026-02-12*
*Rama: fix/guardado-controles-homa-center*
*Estado: ✅ Implementación completada con seguridad reforzada*

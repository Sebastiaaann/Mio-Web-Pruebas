# 📋 Contexto: Proyecto Ficha Clínica + Backend HOMA

## 🔗 Proyecto Relacionado

**Ruta**: `c:\Users\elwax\Desktop\ficha_cliente-master`
**Nombre**: Ficha Clínica
**Stack**: Vue 3 + Vite + PrimeVue + Pinia + Tailwind CSS

---

## 🔐 Autenticación y Backend (Info de Cristóbal)

> [!IMPORTANT]
> Esta información viene directamente de Cristóbal y es la fuente de verdad para la integración.

### Autenticación

- **Sistema**: Firebase Authentication
- **Service Account**: `homa-prod-fbb80-firebase-adminsdk-dw5cc-50cf9fbcdd.json`
- **Project ID**: `homa-prod-fbb80`

### Backends Disponibles

| Backend         | URL                               | Documentación        | Uso           |
| --------------- | --------------------------------- | -------------------- | ------------- |
| **API HOMA**    | `https://apihoma.homa.cl:7200`    | ✅ Disponible        | Principal     |
| **HOMA Center** | `https://homacenter.homa.cl:7999` | ❌ Sin documentación | Secundario    |
| **Workflows**   | `https://workflows.homa.cl`       | Parcial              | Ficha Clínica |

### Sistema de Planes y Servicios

```
Usuario → Plan → Servicios visibles
```

- Los usuarios tienen **planes** asignados
- Dependiendo del **plan**, se muestran ciertos **servicios**
- Estructura **dinámica de componentes** basada en JSON de la base de datos
- El JSON define qué componente renderizar para cada servicio

### Arquitectura de Componentes Dinámicos

```javascript
// Ejemplo conceptual del JSON de servicios
{
  "servicios": [
    {
      "id": "ficha-medica",
      "componente": "FichaMedicaView",
      "plan_requerido": ["premium", "enterprise"]
    },
    {
      "id": "telemedicina",
      "componente": "TelemedicinaView",
      "plan_requerido": ["basic", "premium", "enterprise"]
    }
  ]
}
```

---

## 🎯 ¿Qué es Ficha Clínica?

Sistema de gestión de pacientes médicos para **Orientación Médica Telefónica (OMT)**. Permite buscar, visualizar y administrar información de pacientes en tiempo real.

---

## 📊 Características Principales

### Sistema de Búsqueda de Pacientes

- Búsqueda por **teléfono**, **RUT** o **apellido**
- Tabla interactiva con filtros y ordenamiento
- Exportación a CSV

### Vista Detallada de Paciente

- Información completa del paciente
- Datos del cliente y programa
- Historial médico (en desarrollo)

### Utilidades Chilenas

- **Validación de RUT** con algoritmo módulo 11
- **Formateo de RUT** con puntos y guión
- Formateo de fechas y teléfonos

---

## 🔧 Stack Tecnológico

```json
{
  "framework": "Vue 3.5.25",
  "buildTool": "Vite 7.2.4",
  "ui": "PrimeVue 4.5.2 (tema Aura)",
  "state": "Pinia 3.0.4",
  "routing": "Vue Router 4.6.3",
  "css": "Tailwind CSS 4.1.17",
  "http": "Axios 1.13.2",
  "auth": "Firebase Admin SDK"
}
```

---

## 📁 Estructura Relevante

```
ficha_cliente-master/
├── src/
│   ├── utils/
│   │   └── rut.js           ← Validación RUT (reutilizable)
│   ├── services/
│   │   └── PatientsService.js  ← Ejemplo de servicio API
│   ├── stores/
│   │   └── patientStore.js     ← Ejemplo de store Pinia
│   └── views/
│       ├── SearchPatientView.vue  ← Búsqueda de pacientes
│       └── PatientDetailView.vue  ← Detalle de paciente
```

---

## 🔑 Código Reutilizable

### 1. Validación de RUT (`utils/rut.js`)

Ya copiamos y mejoramos este código en `Mio-Web/src/utils/rutValidator.js`

### 2. Patrón de Servicios

```javascript
// PatientsService.js - Patrón de servicio API
export const PatientsService = {
  getPatients(queryParams) {
    return fetch(`${API_URL}/endpoint?${queryParams}`).then((res) =>
      res.json(),
    );
  },
};
```

### 3. APIs Base

```javascript
// URLs de backend
const API_HOMA = "https://apihoma.homa.cl:7200"; // Principal
const HOMA_CENTER = "https://homacenter.homa.cl:7999"; // Sin documentación
const WORKFLOWS = "https://workflows.homa.cl"; // Ficha Clínica
```

---

## 🔗 Relación con Mio-Web

| Aspecto            | Ficha Clínica                     | Mio-Web                          |
| ------------------ | --------------------------------- | -------------------------------- |
| **Propósito**      | Gestión de pacientes (operadores) | App de salud (usuarios finales)  |
| **UI**             | PrimeVue                          | shadcn-vue                       |
| **Login**          | No implementado                   | ✅ Firebase Auth                 |
| **RUT Validation** | ✅ Básico                         | ✅ Completo (copiado y mejorado) |
| **API**            | workflows.homa.cl                 | apihoma.homa.cl + homacenter     |
| **Target**         | Desktop (operadores)              | Mobile-first (pacientes)         |
| **Servicios**      | Fijos                             | Dinámicos por plan               |

---

## 📝 Notas Importantes

1. **Autenticación Firebase**: Usar el service account proporcionado
2. **2 Backends**: `apihoma.homa.cl:7200` (documentado) y `homacenter.homa.cl:7999` (sin docs)
3. **Servicios por Plan**: Los usuarios ven servicios según su plan
4. **Componentes Dinámicos**: JSON de BD define qué renderizar
5. **Validación RUT**: Copiamos la lógica de ficha_cliente y la mejoramos
6. **Diferentes audiencias**: Ficha Clínica es para operadores, Mio-Web es para pacientes

---

## ⚠️ Seguridad

> [!CAUTION]
> El archivo `homa-prod-fbb80-firebase-adminsdk-*.json` contiene credenciales sensibles.
>
> - **NO** subir a repositorios públicos
> - Añadido a `.gitignore`
> - Usar variables de entorno en producción

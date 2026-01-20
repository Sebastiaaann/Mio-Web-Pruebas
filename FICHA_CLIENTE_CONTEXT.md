# 📋 Contexto: Proyecto Ficha Clínica

## 🔗 Proyecto Relacionado

**Ruta**: `c:\Users\elwax\Desktop\ficha_cliente-master`
**Nombre**: Ficha Clínica
**Stack**: Vue 3 + Vite + PrimeVue + Pinia + Tailwind CSS

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
  "http": "Axios 1.13.2"
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

### 3. API Base

```
API_URL = https://workflows.homa.cl
```

**Mismo backend** que usaremos en Mio-Web.

---

## 🔗 Relación con Mio-Web

| Aspecto            | Ficha Clínica                     | Mio-Web                          |
| ------------------ | --------------------------------- | -------------------------------- |
| **Propósito**      | Gestión de pacientes (operadores) | App de salud (usuarios finales)  |
| **UI**             | PrimeVue                          | shadcn-vue                       |
| **Login**          | No implementado                   | ✅ Implementado                  |
| **RUT Validation** | ✅ Básico                         | ✅ Completo (copiado y mejorado) |
| **API**            | workflows.homa.cl                 | workflows.homa.cl (mismo)        |
| **Target**         | Desktop (operadores)              | Mobile-first (pacientes)         |

---

## 📝 Notas

1. **Mismo backend**: Ambos proyectos usan `https://workflows.homa.cl`
2. **Validación RUT**: Copiamos la lógica de ficha_cliente y la mejoramos
3. **Diferentes audiencias**: Ficha Clínica es para operadores, Mio-Web es para pacientes
4. **Diferente UI**: PrimeVue vs shadcn-vue

# Guía Completa de Uso de Agentes - Proyecto Mio-Web

Este documento detalla el catálogo completo de agentes disponibles en el ecosistema **Gemini** para el proyecto **Mio-Web**. Utilúsalos para potenciar el desarrollo bajo demanda.

> **Sintaxis Base:**
> "Use the **[nombre-del-agente]** agent to [tarea específica]..."

---

## 1. Agentes Maestros (Core)

Estos son los agentes principales para el flujo de trabajo diario.

### 🧩 Orchestrator (Orquestador)

**Rol:** Coordinación de múltiples agentes y visión global.
**Ejemplos Mio-Web:**

- "Use the **orchestrator** agent to coordinate the integration of the new Homa API endpoints with the frontend scheduling view."
- "Use the **orchestrator** agent to plan and execute the migration of the `tiendaUsuario` store to a persistent state model."

### 📅 Project Planner (Planificador)

**Rol:** Desglose de historias de usuario y requisitos.
**Ejemplos Mio-Web:**

- "Use the **project-planner** agent to create a task list for implementing the 'Telemedicina' module."
- "Use the **project-planner** agent to detailed the implementation plan for the new 'Resultados de Exámenes' dashboard."

### 🛡️ Security Auditor (Auditor de Seguridad)

**Rol:** Seguridad de datos médicos y autenticación.
**Ejemplos Mio-Web:**

- "Use the **security-auditor** agent to review the `authService.js` file for token storage vulnerabilities."
- "Use the **security-auditor** agent to audit the patient data handling in `BloodPressureWizardView.vue` to ensure data privacy."

### 🔧 Backend Specialist (Especialista Backend)

**Rol:** Lógica de servidor, integración de APIs y Node.js.
**Ejemplos Mio-Web:**

- "Use the **backend-specialist** agent to create a proxy service for the Homa API to handle CORS issues."
- "Use the **backend-specialist** agent to optimize the data transformation logic in `serviciosService.js`."

### 🎨 Frontend Specialist (Especialista Frontend)

**Rol:** Vue.js, Componentes UI, Tailwind y UX.
**Ejemplos Mio-Web:**

- "Use the **frontend-specialist** agent to refactor `NavbarLateral.vue` to match the new 'Glassmorphism' design spec."
- "Use the **frontend-specialist** agent to implement smooth transitions for the 'Agendamiento de Citas' wizard."

### 🐞 Debugger (Depurador)

**Rol:** Resolución de bugs y errores complejos.
**Ejemplos Mio-Web:**

- "Use the **debugger** agent to find why the user session is lost after refreshing the 'Perfil' page."
- "Use the **debugger** agent to investigate the race condition in the 'Solicitud de Horas' form submission."

---

## 2. Agentes Especialistas Técnicos

Agentes enfocados en dominios técnicos específicos de profundidad.

### 🗄️ Database Architect

**Rol:** Diseño de esquemas y optimización de datos.
**Ejemplo:** "Use the **database-architect** agent to design a local IndexedDB schema for offline caching of patient records."

### 🚀 DevOps Engineer

**Rol:** CI/CD, Docker y Despliegue.
**Ejemplo:** "Use the **devops-engineer** agent to create a GitHub Action for deploying the frontend to the staging server."

### 📝 Documentation Writer

**Rol:** Documentación técnica y de usuario.
**Ejemplo:** "Use the **documentation-writer** agent to update `INTEGRACION_API.md` considering the latest changes in endpoints."

### 🔍 Explorer Agent

**Rol:** Análisis y exploración del código existente.
**Ejemplo:** "Use the **explorer-agent** agent to map all usages of the deprecated 'Login' component component across the project."

### ⚔️ Penetration Tester

**Rol:** Pruebas de intrusión simuladas.
**Ejemplo:** "Use the **penetration-tester** agent to simulate XSS attacks on the 'Comentarios de Paciente' input fields."

### ⚡ Performance Optimizer

**Rol:** Optimización de velocidad y recursos.
**Ejemplo:** "Use the **performance-optimizer** agent to reduce the bundle size of the initial load by tree-shaking unused icons."

### 📈 SEO Specialist

**Rol:** Posicionamiento en motores de búsqueda (para partes públicas).
**Ejemplo:** "Use the **seo-specialist** agent to add structured data (JSON-LD) for the 'Clínica Homa' landing page."

### 🧪 Test Engineer

**Rol:** Pruebas automatizadas (Unitarias/E2E).
**Ejemplo:** "Use the **test-engineer** agent to write Playwright tests for the complete 'Reserva de Hora' flow."

---

## 3. Agentes Específicos del Proyecto (Custom)

Estos agentes están configurados específicamente con las reglas de negocio de Mio-Web.

### 🤖 Agente de API (`agente_api.md`)

**Rol:** Especialista en la integración con los servicios `apihoma` y `homacenter`.
**Ejemplo:** "Use the **agente_api** to validate if the payload for the 'Crear Presupuesto' endpoint matches the legacy Homa SOAP definition."

### 🏗️ Agente de Arquitectura (`agente_arquitectura.md`)

**Rol:** Patrones de escalabilidad y estructura de carpetas.
**Ejemplo:** "Use the **agente_arquitectura** to decide where to place the new 'Notificaciones' service within the project structure."

### 🛡️ Agente de Robustez (`agente_robustez.md`)

**Rol:** Manejo de errores, reintentos e idempotencia.
**Ejemplo:** "Use the **agente_robustez** to implement a retry mechanism for the unstable 'Consulta de Previsión' external service."

### 💎 Agente de UI Premium (`agente_ui.md`)

**Rol:** Estética visual de alto nivel, animaciones y 'wow factor'.
**Ejemplo:** "Use the **agente_ui** to redesign the 'Login' card with a modern bento-grid style and micro-interactions."

---

## 4. Futuras Implementaciones y Problemas a Abordar

Basado en la estructura actual y los agentes disponibles, aquí hay áreas donde podríamos aplicar estos recursos en el futuro:

### Problemas Potenciales Detectables

- **Inconsistencia de UI:** Usar el `frontend-specialist` junto con `agente_ui` para auditar que todas las vistas usen los mismos tokens de diseño.
- **Cuellos de Botella en API:** Usar `performance-optimizer` para detectar llamadas redundantes a la API de Homa en el dashboard principal.
- **Seguridad de Datos Sensibles:** Usar `security-auditor` para asegurar que no se logueen datos personales (PII) en la consola del navegador.

### Nuevas Funcionalidades Sugeridas

1.  **Modo Offline (PWA):** Usar `backend-specialist` y `database-architect` para implementar Service Workers y almacenamiento local.
2.  **Gamificación de Salud:** Usar `game-developer` para crear una vista interactiva de progreso del paciente con animaciones complejas.
3.  **Chatbot de Asistencia:** Usar `orchestrator` y `backend-specialist` para integrar un asistente de IA para dudas frecuentes de pacientes.

"Use the performance-optimizer agent to analyze the entire project context to identify dead code, unused imports, and apply optimizations to reduce the bundle size."

/**
 * Wizard Components - Exportaciones
 * 
 * Este módulo exporta todos los componentes relacionados con el wizard dinámico
 * basado en protocolos de la API de HOMA.
 */

// Wizard principal
export { default as DynamicWizard } from './DynamicWizard.vue'

// Componentes de progreso y navegación
export { default as WizardProgress } from './WizardProgress.vue'
export { default as WizardNavigation } from './WizardNavigation.vue'

// Componentes de tipos de paso
export { default as QuestionStep } from './step-types/QuestionStep.vue'
export { default as TensiometerStep } from './step-types/TensiometerStep.vue'
export { default as WeightStep } from './step-types/WeightStep.vue'
export { default as GlucometerStep } from './step-types/GlucometerStep.vue'
export { default as TextStep } from './step-types/TextStep.vue'

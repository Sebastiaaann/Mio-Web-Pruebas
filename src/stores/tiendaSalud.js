// stores/tiendaSalud.js - Store de salud del usuario
// 
// ⚠️ DEPRECATED: Este archivo se mantiene para compatibilidad con código existente.
// Se recomienda migrar a usar los nuevos stores modulares:
// 
//   import { useControlesStore, useMedicionesStore, useContenidoStore } from '@/stores/salud'
//
// O usar la store compuesta legacy:
//
//   import { useHealthStore } from '@/stores/salud'
//
// Los imports existentes siguen funcionando sin cambios:
//   import { useHealthStore } from '@/stores/tiendaSalud'
//   import { useTiendaSalud } from '@/stores/tiendaSalud'

// Re-exportar todo desde el nuevo módulo de salud
export { 
  useHealthStore, 
  useTiendaSalud,
  useControlesStore,
  useTiendaControles,
  useMedicionesStore,
  useTiendaMediciones,
  useContenidoStore,
  useTiendaContenido
} from './salud/index.js'

// Mantener compatibilidad con import por defecto
export { useHealthStore as default } from './salud/index.js'

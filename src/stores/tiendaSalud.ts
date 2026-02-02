// Re-export del store compuesto de salud
export {
  useHealthStore,
  useTiendaSalud,
  useControlesStore,
  useTiendaControles,
  useMedicionesStore,
  useTiendaMediciones,
  useContenidoStore,
  useTiendaContenido
} from './salud'

export { useHealthStore as default } from './salud'

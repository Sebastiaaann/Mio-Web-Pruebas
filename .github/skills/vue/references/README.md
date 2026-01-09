# Referencias de Vue 3 para Mio-Web

Guías de patrones y mejores prácticas para desarrollo con Vue 3.

## 📚 Versiones Disponibles

### Español (JavaScript) - Para Proyecto Mio-Web
Adaptadas al stack del proyecto: JavaScript, Tailwind CSS, PrimeVue, nomenclatura en español.

| Archivo | Contenido | Cuándo Usar |
|---------|-----------|-------------|
| [componentes-es.md](./componentes-es.md) | Patrones de componentes Vue 3 | Crear/modificar componentes .vue |
| [composables-es.md](./composables-es.md) | Lógica reutilizable con Composition API | Compartir estado/lógica entre componentes |
| [utilidades-es.md](./utilidades-es.md) | Funciones puras (formatters, validators) | Transformar/validar datos sin estado |

### Inglés (TypeScript) - Referencias Técnicas
Guías originales con TypeScript (solo para consulta técnica avanzada).

| Archivo | Contenido | Nota |
|---------|-----------|------|
| [components.md](./components.md) | Component patterns con TS | Referencia, NO usar TS en Mio-Web |
| [composables.md](./composables.md) | Composables con tipos | Referencia, NO usar TS en Mio-Web |
| [testing.md](./testing.md) | Testing con Vitest | No configurado aún en proyecto |
| [utils-client.md](./utils-client.md) | Client utils con tipos | Referencia, NO usar TS en Mio-Web |

## 🎯 Guía Rápida

### Estoy creando un componente Vue
➡️ Lee: [componentes-es.md](./componentes-es.md)
- Sección "Componentes con `<script setup>`"
- Ejemplos de props, emits, slots

### Necesito compartir lógica entre componentes
➡️ Lee: [composables-es.md](./composables-es.md)
- Primero revisa si existe en [VueUse](https://vueuse.org)
- Sección "Estructura estándar"
- Patrones async y cleanup

### Necesito formatear/validar datos
➡️ Lee: [utilidades-es.md](./utilidades-es.md)
- Formateadores (moneda, fecha)
- Validadores (email, RUT chileno)
- Transformadores (slugify, truncate)

## 🔄 Diferencias entre Versiones

| Aspecto | Versión ES (Mio-Web) | Versión EN (Original) |
|---------|---------------------|---------------------|
| Lenguaje | JavaScript puro | TypeScript |
| Nomenclatura | Español | Inglés |
| CSS Framework | Tailwind CSS | UnoCSS Attributify |
| UI Library | PrimeVue | Generic |
| Ejemplos | Validación RUT, formatos CL | Genéricos |

## ⚠️ Importante

**Para agentes AI trabajando en Mio-Web:**
- ✅ USAR: Versiones `-es.md` (español/JavaScript)
- ❌ NO USAR: Versiones originales con TypeScript
- ✅ Nomenclatura: 100% en español (`formatearMoneda`, `validarEmail`)
- ✅ Sin tipos TypeScript (`defineProps(['nombre'])` no `defineProps<{ nombre: string }>()`)

**Documentación principal del proyecto:** Ver `/AGENTS.md` en la raíz del repositorio.

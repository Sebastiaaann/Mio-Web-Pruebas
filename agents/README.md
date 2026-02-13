# Sistema de Agentes

Este directorio contiene agentes especializados que se activan automáticamente según el contexto de desarrollo.

## Estructura

```
agents/
├── README.md                      # Este archivo
├── vue/
│   ├── core.md                   # Vue Core - Composition API, TypeScript
│   ├── router.md                 # Vue Router - Navegación y rutas
│   ├── pinia.md                  # Pinia - State management
│   ├── use.md                    # VueUse - Composables utilitarios
│   └── composables.md            # Composables adaptables
├── testing/
│   └── testing.md                # Testing con Vitest y Playwright
├── frontend/
│   └── design.md                 # Diseño frontend, Tailwind, shadcn/ui
├── devops/
│   └── deploy.md                 # Despliegue (placeholder)
└── documentation/
    └── docs.md                   # Documentación (placeholder)
```

## Prioridades

### Prioridad 1: Vue.js (OBLIGATORIO)
Todas las skills de Vue tienen prioridad absoluta en este proyecto.

- **vue/core**: Composition API, `<script setup>`, TypeScript
- **vue/router**: Vue Router 4, navegación, guards
- **vue/pinia**: State management con Pinia
- **vue/use**: VueUse composables
- **vue/composables**: Crear composables adaptables

### Prioridad 2: Testing y Calidad
- **testing/testing**: Tests unitarios, componentes, E2E

### Prioridad 3: Frontend y UI
- **frontend/design**: Tailwind CSS, shadcn/ui, diseño responsive

## Uso

Los agentes se activan **automáticamente** cuando:
1. Se detecta el tipo de archivo correspondiente
2. Se mencionan palabras clave relacionadas
3. Se detectan patrones de código específicos

**No es necesario mencionar explícitamente los agentes.**

## Referencia Rápida

### Por Tipo de Archivo

| Extensión | Agente |
|-----------|--------|
| `.vue` | vue/core |
| `.test.ts`, `.spec.ts` | testing/testing |
| `use*.ts` | vue/composables + vue/use |
| `stores/*.ts` | vue/pinia |
| `router/*.ts` | vue/router |

### Por Contexto

| Si el usuario pide... | Agente a usar |
|----------------------|---------------|
| Crear componente Vue | vue/core |
| Agregar ruta/navegación | vue/router |
| Crear store/estado | vue/pinia |
| Escribir tests | testing/testing |
| Mejorar diseño | frontend/design |
| Crear composable | vue/composables |

## Contribuir

Para agregar nuevos agentes:
1. Crear archivo `.md` en la carpeta correspondiente
2. Seguir el formato de agentes existentes
3. Actualizar este README
4. Actualizar `../AGENTS.md` con referencias

## Notas

- Todos los agentes siguen las reglas de idioma del proyecto (español)
- Las skills de Vue tienen prioridad absoluta
- Los agentes deben aplicarse automáticamente sin mención explícita

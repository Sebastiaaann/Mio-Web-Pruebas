# Directrices para Agentes

## Idioma del Proyecto

**IMPORTANTE**: Este proyecto está en español. Todas las contribuciones de código, archivos y documentación deben seguir estas reglas:

### Requisitos de Idioma

1. **Nombres de archivos**: Todos los nombres de archivos y carpetas deben estar en español cuando sea posible (excepto nombres técnicos estándar como `index.js`, `App.vue`, etc.)

2. **Comentarios**: Todos los comentarios en el código deben estar escritos en español.

3. **Variables y funciones**: Se recomienda usar nombres descriptivos en español para variables, funciones y componentes cuando sea semánticamente claro. Por ejemplo:
   - `obtenerUsuario()` en lugar de `getUser()`
   - `listaProductos` en lugar de `productList`
   - `estaActivo` en lugar de `isActive`

4. **Mensajes de UI**: Todos los textos visibles para el usuario (labels, placeholders, mensajes de error, tooltips, etc.) DEBEN estar en español.

5. **Documentación**: Toda la documentación, READMEs, y comentarios de código deben estar en español.

6. **Commits**: Los mensajes de commit deben estar en español y seguir el formato convencional:
   - `feat: agregar funcionalidad de login`
   - `fix: corregir error en formulario de registro`
   - `docs: actualizar documentación del API`

### Excepciones

- Palabras técnicas universales (API, HTTP, URL, etc.)
- Nombres de librerías y frameworks (Vue, Pinia, Supabase, etc.)
- Tipos de datos y estructuras estándar
- Configuraciones que requieren nombres específicos en inglés

### Ejemplos de Código

```javascript
// ✅ Correcto
const usuarioActivo = ref(null)
const obtenerDatos = async () => { ... }
const listaDeProductos = computed(() => { ... })

// ❌ Incorrecto
const activeUser = ref(null)
const fetchData = async () => { ... }
const productList = computed(() => { ... })
```

```vue
<!-- ✅ Correcto -->
<Button label="Guardar cambios" />
<InputText placeholder="Ingrese su correo electrónico" />

<!-- ❌ Incorrecto -->
<Button label="Save changes" />
<InputText placeholder="Enter your email" />
```

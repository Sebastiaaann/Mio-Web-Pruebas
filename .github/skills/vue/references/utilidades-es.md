# Utilidades del Cliente

Funciones puras para formateo, validación, transformación y parsing.

## Referencia Rápida

| Categoría | Ejemplos |
|-----------|----------|
| Formateadores | `formatearMoneda`, `formatearFecha`, `formatearRut` |
| Validadores | `validarEmail`, `validarRut`, `validarTelefono` |
| Transformadores | `slugificar`, `truncar`, `capitalizar` |
| Parsers | `parsearQuery`, `parsearJSON`, `parsearFecha` |

## Reglas

**Funciones puras:**

- Mismo input → mismo output
- Sin efectos secundarios
- Sin mutación de estado externo
- Sin API calls, sin refs, sin reactivos

**Cuándo NO usar utilidades:**

- Lógica con estado → usar composables
- Específico de Vue → usar composables
- Lógica de componente → mantener en componente
- API calls → usar services o Pinia stores

## Estructura

```javascript
// utils/formateadores.js

/**
 * Formatea número como moneda chilena (CLP)
 * @param {number} monto - Monto a formatear
 * @param {string} [locale='es-CL'] - Locale para formato
 * @returns {string} Formato: $1.234.567
 */
export function formatearMoneda(monto, locale = 'es-CL') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(monto);
}

/**
 * Formatea fecha a formato chileno DD/MM/YYYY
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} [locale='es-CL'] - Locale para formato
 * @returns {string} Formato: 09/01/2026
 */
export function formatearFecha(fecha, locale = 'es-CL') {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Intl.DateTimeFormat(locale).format(fechaObj);
}
```

**Naming:** Verbos descriptivos en español (`formatearMoneda`, `validarEmail`, `parsearQuery`)

**Organización:** Agrupar por categoría (`formateadores.js`, `validadores.js`)

**Exports:** Solo named exports

## Ejemplos por Categoría

### Formateadores

```javascript
// utils/formateadores.js

/**
 * Formatea número como moneda chilena (CLP)
 * @param {number} monto - Monto a formatear
 * @returns {string} Formato: $1.234.567
 * @example
 * formatearMoneda(1234567) // "$1.234.567"
 * formatearMoneda(1500.50) // "$1.501"
 */
export function formatearMoneda(monto) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(monto);
}

/**
 * Formatea fecha a formato chileno DD/MM/YYYY
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Formato: 09/01/2026
 * @example
 * formatearFecha(new Date('2026-01-09')) // "09/01/2026"
 * formatearFecha('2026-01-09') // "09/01/2026"
 */
export function formatearFecha(fecha) {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Intl.DateTimeFormat('es-CL').format(fechaObj);
}

/**
 * Formatea fecha con hora en formato chileno
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Formato: 09/01/2026, 14:30
 * @example
 * formatearFechaHora(new Date()) // "09/01/2026, 14:30"
 */
export function formatearFechaHora(fecha) {
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fechaObj);
}

/**
 * Formatea RUT chileno al formato XX.XXX.XXX-X
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 * @example
 * formatearRut('12345678K') // "12.345.678-K"
 * formatearRut('123456789') // "12.345.678-9"
 */
export function formatearRut(rut) {
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  if (rutLimpio.length < 2) return rut;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  // Formato: 12.345.678-9
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

/**
 * Formatea número de teléfono chileno
 * @param {string} telefono - Número sin formato
 * @returns {string} Formato: +56 9 1234 5678
 * @example
 * formatearTelefono('912345678') // "+56 9 1234 5678"
 * formatearTelefono('221234567') // "+56 22 1234 567"
 */
export function formatearTelefono(telefono) {
  const limpio = telefono.replace(/\D/g, '');
  
  // Móvil: +56 9 XXXX XXXX
  if (limpio.length === 9 && limpio.startsWith('9')) {
    return `+56 ${limpio[0]} ${limpio.slice(1, 5)} ${limpio.slice(5)}`;
  }
  
  // Fijo Santiago: +56 22 XXXX XXX
  if (limpio.length === 9 && limpio.startsWith('2')) {
    return `+56 ${limpio.slice(0, 2)} ${limpio.slice(2, 6)} ${limpio.slice(6)}`;
  }
  
  return telefono;
}

/**
 * Formatea bytes a tamaño legible
 * @param {number} bytes - Tamaño en bytes
 * @param {number} [decimales=2] - Decimales a mostrar
 * @returns {string} Tamaño formateado
 * @example
 * formatearBytes(1024) // "1 KB"
 * formatearBytes(1536, 2) // "1.50 KB"
 */
export function formatearBytes(bytes, decimales = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimales < 0 ? 0 : decimales;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + tamaños[i];
}
```

### Validadores

```javascript
// utils/validadores.js

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 * @example
 * validarEmail('usuario@ejemplo.cl') // true
 * validarEmail('invalido@') // false
 */
export function validarEmail(email) {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email);
}

/**
 * Valida RUT chileno con dígito verificador
 * @param {string} rut - RUT en formato XX.XXX.XXX-X o sin formato
 * @returns {boolean} true si es válido
 * @example
 * validarRut('12.345.678-5') // true
 * validarRut('12345678-5') // true
 * validarRut('12.345.678-K') // depende del cálculo
 */
export function validarRut(rut) {
  // Limpiar formato
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 2) return false;
  
  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();
  
  // Calcular dígito verificador esperado
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : String(dvEsperado);
  
  return dv === dvFinal;
}

/**
 * Valida número de teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si es válido
 * @example
 * validarTelefono('912345678') // true (móvil)
 * validarTelefono('221234567') // true (fijo Santiago)
 * validarTelefono('12345') // false
 */
export function validarTelefono(telefono) {
  const limpio = telefono.replace(/\D/g, '');
  
  // Móvil: 9 dígitos comenzando con 9
  if (limpio.length === 9 && limpio.startsWith('9')) return true;
  
  // Fijo: 9 dígitos comenzando con 2
  if (limpio.length === 9 && limpio.startsWith('2')) return true;
  
  return false;
}

/**
 * Valida URL
 * @param {string} url - URL a validar
 * @returns {boolean} true si es válido
 * @example
 * validarUrl('https://ejemplo.cl') // true
 * validarUrl('no-es-url') // false
 */
export function validarUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida rango numérico
 * @param {number} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si está en rango
 * @example
 * validarRango(50, 0, 100) // true
 * validarRango(150, 0, 100) // false
 */
export function validarRango(valor, min, max) {
  return valor >= min && valor <= max;
}

/**
 * Valida longitud de texto
 * @param {string} texto - Texto a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean} true si está en rango
 * @example
 * validarLongitud('Hola', 2, 10) // true
 * validarLongitud('H', 2, 10) // false
 */
export function validarLongitud(texto, min, max) {
  const longitud = texto.length;
  return longitud >= min && longitud <= max;
}
```

### Transformadores

```javascript
// utils/transformadores.js

/**
 * Convierte texto a slug URL-friendly
 * @param {string} texto - Texto a slugificar
 * @returns {string} Slug en minúsculas con guiones
 * @example
 * slugificar('Hola Mundo!') // "hola-mundo"
 * slugificar('Ñandú & Pingüino') // "nandu-pinguino"
 */
export function slugificar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-+|-+$/g, ''); // Remover guiones inicio/fin
}

/**
 * Trunca texto a longitud máxima
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @param {string} [sufijo='...'] - Sufijo al truncar
 * @returns {string} Texto truncado
 * @example
 * truncar('Texto largo', 5) // "Texto..."
 * truncar('Corto', 10) // "Corto"
 */
export function truncar(texto, longitud, sufijo = '...') {
  if (texto.length <= longitud) return texto;
  return texto.slice(0, longitud) + sufijo;
}

/**
 * Capitaliza primera letra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto con primera letra mayúscula
 * @example
 * capitalizar('hola mundo') // "Hola mundo"
 */
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Convierte a Title Case
 * @param {string} texto - Texto a convertir
 * @returns {string} Texto en Title Case
 * @example
 * convertirATitleCase('hola mundo') // "Hola Mundo"
 */
export function convertirATitleCase(texto) {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => capitalizar(palabra))
    .join(' ');
}

/**
 * Limpia formato de RUT dejando solo números y K
 * @param {string} rut - RUT con o sin formato
 * @returns {string} RUT sin formato
 * @example
 * limpiarRut('12.345.678-K') // "12345678K"
 */
export function limpiarRut(rut) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Limpia número de teléfono dejando solo dígitos
 * @param {string} telefono - Teléfono con o sin formato
 * @returns {string} Solo dígitos
 * @example
 * limpiarTelefono('+56 9 1234 5678') // "912345678"
 */
export function limpiarTelefono(telefono) {
  return telefono.replace(/\D/g, '');
}
```

### Parsers

```javascript
// utils/parsers.js

/**
 * Parsea query string a objeto
 * @param {string} search - Query string (ej: "?foo=bar&baz=qux")
 * @returns {Object} Objeto con parámetros
 * @example
 * parsearQuery('?nombre=Juan&edad=30') // { nombre: 'Juan', edad: '30' }
 */
export function parsearQuery(search) {
  return Object.fromEntries(new URLSearchParams(search));
}

/**
 * Parsea JSON con fallback
 * @param {string} json - String JSON
 * @param {*} fallback - Valor por defecto si falla
 * @returns {*} Objeto parseado o fallback
 * @example
 * parsearJSON('{"a":1}', {}) // { a: 1 }
 * parsearJSON('invalido', {}) // {}
 */
export function parsearJSON(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Parsea fecha de string
 * @param {string} fechaStr - Fecha como string
 * @returns {Date|null} Objeto Date o null si inválido
 * @example
 * parsearFecha('2026-01-09') // Date object
 * parsearFecha('invalido') // null
 */
export function parsearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return isNaN(fecha.getTime()) ? null : fecha;
}
```

## Errores Comunes

**Efectos secundarios (no pura):**

```javascript
// ❌ Incorrecto - muta estado externo
let contador = 0;
export function incrementar() {
  contador++;
  return contador;
}

// ✅ Correcto - función pura
export function sumar(a, b) {
  return a + b;
}
```

**Usar utils para lógica con estado:**

```javascript
// ❌ Incorrecto - debería ser composable
export function useContador() { ... }

// ✅ Correcto - transformación pura
export function formatearContador(contador) {
  return `Contador: ${contador}`;
}
```

## Organización

**Flat para proyectos pequeños:**

```
utils/
├── formateadores.js
├── validadores.js
└── transformadores.js
```

**Anidado para proyectos grandes:**

```
utils/
├── formateadores/
│   ├── fecha.js
│   ├── moneda.js
│   └── index.js
└── validadores/
    ├── email.js
    ├── rut.js
    └── index.js
```

## Casos de Uso HOMA

### Validación de Formulario Onboarding

```javascript
// En componente de onboarding
import { validarRut, validarEmail, validarTelefono } from '@/utils/validadores';

const errores = ref({});

function validarFormulario() {
  errores.value = {};
  
  if (!validarRut(formulario.rut)) {
    errores.value.rut = 'RUT inválido';
  }
  
  if (!validarEmail(formulario.email)) {
    errores.value.email = 'Email inválido';
  }
  
  if (!validarTelefono(formulario.telefono)) {
    errores.value.telefono = 'Teléfono inválido';
  }
  
  return Object.keys(errores.value).length === 0;
}
```

### Formateo de Datos de Salud

```javascript
// utils/formatearSalud.js

/**
 * Formatea índice de salud HOMA
 * @param {number} indice - Índice de salud (0-100)
 * @returns {Object} Color y etiqueta
 */
export function formatearIndiceSalud(indice) {
  if (indice >= 80) {
    return { color: 'green', etiqueta: 'Excelente', clase: 'bg-green-500' };
  }
  if (indice >= 60) {
    return { color: 'yellow', etiqueta: 'Bueno', clase: 'bg-yellow-500' };
  }
  if (indice >= 40) {
    return { color: 'orange', etiqueta: 'Regular', clase: 'bg-orange-500' };
  }
  return { color: 'red', etiqueta: 'Bajo', clase: 'bg-red-500' };
}
```

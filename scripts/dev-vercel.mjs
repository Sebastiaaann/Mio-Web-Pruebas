/**
 * scripts/dev-vercel.mjs
 *
 * Carga las variables de entorno de desarrollo de Vercel (.env.development.local)
 * en el proceso actual y luego lanza `vercel dev`, de modo que las funciones
 * serverless (api/) reciban correctamente las variables como GROQ_API_KEY.
 *
 * Uso: npm run dev:vercel
 */

import { config } from 'dotenv'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const raizProyecto = resolve(__dirname, '..')

// Cargar en orden de precedencia (el último sobreescribe al anterior si hay conflicto)
config({ path: resolve(raizProyecto, '.env') })
config({ path: resolve(raizProyecto, '.env.local') })
config({ path: resolve(raizProyecto, '.env.development') })
config({ path: resolve(raizProyecto, '.env.development.local') })

// Pasar los argumentos de la línea de comandos al proceso hijo
const args = process.argv.slice(2)
const proc = spawn('vercel', ['dev', ...args], {
  stdio: 'inherit',
  env: process.env,
  shell: true
})

proc.on('exit', (code) => process.exit(code ?? 0))

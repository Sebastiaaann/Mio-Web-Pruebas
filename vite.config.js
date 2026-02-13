import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const esVercelDev = Boolean(process.env.VERCEL) || process.env.VERCEL_ENV === 'development' || process.env.VERCEL_DEV === '1'

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'iconify-icon'
          }
        }
      }),
      // Evitar errores de Vercel dev con plugins de inspección
      ...(esVercelDev ? [] : [vueDevTools()]),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api/homa-center/batch': {
          target: 'https://homacenter.homa.cl:7999',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/batch?skip_tray=false&evaluate_observations=true'
        }
      }
    },
    // Configuración de Vitest para testing
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/tests/setup.js'],
      include: ['src/**/*.{test,spec}.{js,ts}'],
      pool: 'forks',
      minWorkers: 1,
      maxWorkers: 1
    }
  }
})


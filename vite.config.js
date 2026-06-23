import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET?.replace(/\/$/, '')

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : {},
  }
})

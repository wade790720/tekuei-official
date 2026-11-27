import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'

// /api runs in the local Worker against the simulated R2 in .wrangler/state, never the live site.
export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), reactRouter()],
  // Pre-bundle the dependencies of lazy pages and the editor too, or the first visit to one reloads the page mid-edit.
  optimizeDeps: { entries: ['src/**/*.tsx'] },
})

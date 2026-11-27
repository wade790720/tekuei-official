// npm run build:next: the build for the tekuei-next Worker (env.next in wrangler.jsonc). The Cloudflare vite plugin
// reads CLOUDFLARE_ENV at build time; setting it here keeps the script the same on Windows and Unix shells.
import { spawnSync } from 'node:child_process'

const result = spawnSync('npx', ['react-router', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CLOUDFLARE_ENV: 'next' },
})
process.exit(result.status ?? 1)

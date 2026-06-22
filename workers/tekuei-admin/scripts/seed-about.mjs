/**
 * 將 src/data/about.json 種子寫入 KV
 *
 * 用法（在 workers/tekuei-admin 目錄）：
 *   npx wrangler kv key put --binding=CMS_KV "content:about" --path=../../src/data/about.json
 *
 * 或設定環境變數後執行：
 *   WORKER_URL=https://tekuei-admin.xxx.workers.dev ADMIN_PASSWORD=xxx node scripts/seed-about.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const aboutPath = join(__dirname, '../../../src/data/about.json')
const workerUrl = process.env.WORKER_URL
const password = process.env.ADMIN_PASSWORD

if (!workerUrl || !password) {
  console.log('Seed via wrangler (recommended):')
  console.log(
    '  npx wrangler kv key put --binding=CMS_KV "content:about" --path=../../src/data/about.json',
  )
  console.log('')
  console.log('Or set WORKER_URL + ADMIN_PASSWORD to seed via admin API.')
  process.exit(0)
}

const body = readFileSync(aboutPath, 'utf8')
JSON.parse(body)

const loginRes = await fetch(`${workerUrl}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
})
if (!loginRes.ok) {
  console.error('Login failed:', await loginRes.text())
  process.exit(1)
}
const { token } = await loginRes.json()

const putRes = await fetch(`${workerUrl}/api/admin/content/about`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body,
})
if (!putRes.ok) {
  console.error('Seed failed:', await putRes.text())
  process.exit(1)
}

console.log('About content seeded successfully.')

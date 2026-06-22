/**
 * 將 src/data/data.json 上傳至 R2
 *
 * 用法（專案根目錄）：
 *   npm run seed
 *
 * 或手動：
 *   npx wrangler r2 object put tekuei-site-data/data.json --file=src/data/data.json --content-type=application/json
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../src/data/data.json')
const bucket = process.env.R2_BUCKET || 'tekuei-site-data'

readFileSync(dataPath, 'utf8')
JSON.parse(readFileSync(dataPath, 'utf8'))

console.log(`Uploading data.json to R2 bucket ${bucket} ...`)
const result = spawnSync(
  'npx',
  [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/data.json`,
    `--file=${dataPath}`,
    '--content-type=application/json',
  ],
  { stdio: 'inherit', shell: true },
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('Done. R2 key: data.json')

/** 將 src/data/data.json 上傳至 R2 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../src/data/data.json')
const bucket = process.env.R2_BUCKET || 'tekuei-cms'

readFileSync(dataPath, 'utf8')
JSON.parse(readFileSync(dataPath, 'utf8'))

console.log(`Uploading data.json to remote R2 bucket ${bucket} ...`)
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
    '--remote',
  ],
  { stdio: 'inherit', shell: true },
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('Done. R2 key: data.json')

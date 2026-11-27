/** 將 src/data/data.json 放進本機的 R2（.wrangler/state，npm run dev 和 preview 讀的那一個）。不會寫到正式站 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../src/data/data.json')
const bucket = process.env.R2_BUCKET || 'tekuei-cms'

readFileSync(dataPath, 'utf8')
JSON.parse(readFileSync(dataPath, 'utf8'))

console.log(`Writing data.json to the local R2 bucket ${bucket} in .wrangler/state ...`)
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
    '--local',
    '--persist-to=.wrangler/state',
  ],
  { stdio: 'inherit', shell: true },
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('Done. R2 key: data.json')

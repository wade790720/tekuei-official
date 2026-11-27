import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { it } from 'node:test'

// A binding with "remote": true makes npm run dev and preview read and write the live bucket.
const text = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
const config: unknown = JSON.parse(text.replace(/^\s*\/\/.*$/gm, ''))

function remoteKeys(value: unknown, path: string): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => remoteKeys(v, `${path}[${i}]`))
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([k, v]) => (k === 'remote' ? [`${path}.${k}`] : remoteKeys(v, `${path}.${k}`)))
}

it('wrangler.jsonc has no binding set to remote', () => {
  assert.deepEqual(remoteKeys(config, 'wrangler'), [])
})

it('the check finds a remote key', () => {
  assert.deepEqual(remoteKeys({ r2_buckets: [{ binding: 'BUCKET', remote: true }] }, 'w'), ['w.r2_buckets[0].remote'])
})

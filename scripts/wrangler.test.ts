import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { it } from 'node:test'

// A binding with "remote": true makes npm run dev and preview read and write the live bucket.
const text = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
interface Bucket {
  binding: string
  bucket_name: string
}
interface WranglerConfig {
  env?: { next?: { name?: string; r2_buckets?: Bucket[] } }
}
const config: WranglerConfig = JSON.parse(text.replace(/^\s*\/\/.*$/gm, ''))

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

it('the integration environment tekuei-next binds its own bucket, not the live one', () => {
  const next = config.env?.next
  assert.ok(next, 'wrangler.jsonc has no env.next')
  assert.equal(next.name, 'tekuei-next')
  const buckets = next.r2_buckets ?? []
  assert.deepEqual(
    buckets.map((b) => [b.binding, b.bucket_name]),
    [['BUCKET', 'tekuei-cms-next']],
  )
  assert.ok(!JSON.stringify(next).includes('"tekuei-cms"'), 'env.next mentions the live bucket tekuei-cms')
})

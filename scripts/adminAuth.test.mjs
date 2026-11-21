import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkAdmin, MAX_FAILS, WINDOW_MS } from '../src/lib/adminAuth.js'

// In-memory stand-in for an R2 bucket: get returns a snapshot with an etag, put honours onlyIf.etagMatches.
function fakeBucket() {
  const store = new Map()
  let version = 0
  return {
    async get(key) {
      const hit = store.get(key)
      if (!hit) return null
      const { body, etag } = hit
      return { etag, json: async () => JSON.parse(body) }
    },
    async put(key, body, opts) {
      await Promise.resolve() // let a parallel caller read first, like a real network round trip
      const cur = store.get(key)
      if (opts?.onlyIf?.etagMatches && cur?.etag !== opts.onlyIf.etagMatches) return null
      store.set(key, { body, etag: `v${++version}` })
      return {}
    },
  }
}

const req = (code) => new Request('https://x/api', { headers: { Authorization: `Bearer ${code}` } })
const env = () => ({ ADMIN_SECRET: '123456', BUCKET: fakeBucket() })

test('the right code passes', async () => {
  assert.equal(await checkAdmin(req('123456'), env()), 'ok')
})

test('a wrong code is denied', async () => {
  assert.equal(await checkAdmin(req('000000'), env()), 'denied')
})

test('no secret configured denies everyone', async () => {
  assert.equal(await checkAdmin(req(''), { BUCKET: fakeBucket() }), 'denied')
})

test('after MAX_FAILS wrong codes even the right one is locked until the window ends', async () => {
  const e = env()
  const t0 = 1_000_000
  for (let i = 0; i < MAX_FAILS; i++) assert.equal(await checkAdmin(req('000000'), e, t0 + i), 'denied')
  assert.equal(await checkAdmin(req('123456'), e, t0 + 10), 'locked')
  assert.equal(await checkAdmin(req('123456'), e, t0 + WINDOW_MS + 1), 'ok')
})

test('a successful login resets the count', async () => {
  const e = env()
  for (let i = 0; i < MAX_FAILS - 1; i++) await checkAdmin(req('000000'), e, i)
  assert.equal(await checkAdmin(req('123456'), e, 10), 'ok')
  for (let i = 0; i < MAX_FAILS - 1; i++) assert.equal(await checkAdmin(req('000000'), e, 20 + i), 'denied')
})

test('guesses sent at the same time: only one is compared', async () => {
  const e = env()
  await checkAdmin(req('000000'), e, 0) // creates the counter object
  const results = await Promise.all(['111111', '222222', '123456'].map((c) => checkAdmin(req(c), e, 1)))
  assert.equal(results.filter((r) => r !== 'locked').length, 1, `one claimed the attempt: ${results}`)
})

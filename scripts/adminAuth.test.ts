import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkAdmin, MAX_FAILS, WINDOW_MS } from '../src/lib/adminAuth.ts'
import { fakeR2 as fakeBucket } from './fakeR2.ts'

const req = (code: string) => new Request('https://x/api', { headers: { Authorization: `Bearer ${code}` } })
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

test('a successful login does not clear earlier wrong guesses', async () => {
  const e = env()
  for (let i = 0; i < MAX_FAILS - 1; i++) await checkAdmin(req('000000'), e, i)
  assert.equal(await checkAdmin(req('123456'), e, 10), 'ok')
  assert.equal(await checkAdmin(req('000000'), e, 20), 'denied')
  assert.equal(await checkAdmin(req('123456'), e, 30), 'locked')
})

test('saving many times does not use up the wrong-guess budget', async () => {
  const e = env()
  for (let i = 0; i < MAX_FAILS * 4; i++) assert.equal(await checkAdmin(req('123456'), e, i), 'ok')
  for (let i = 0; i < MAX_FAILS - 1; i++) assert.equal(await checkAdmin(req('000000'), e, 100 + i), 'denied')
  assert.equal(await checkAdmin(req('123456'), e, 200), 'ok')
})

test('guesses sent at the same time: only one is compared', async () => {
  const e = env()
  await checkAdmin(req('000000'), e, 0) // creates the counter object
  const results = await Promise.all(['111111', '222222', '123456'].map((c) => checkAdmin(req(c), e, 1)))
  assert.equal(results.filter((r) => r !== 'locked').length, 1, `one claimed the attempt: ${results}`)
})

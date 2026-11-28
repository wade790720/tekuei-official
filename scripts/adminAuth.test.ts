import { test } from 'node:test'
import assert from 'node:assert/strict'
import { adminLogin, checkAdmin, issueToken, MAX_FAILS, TOKEN_MS, WINDOW_MS } from '../src/lib/adminAuth.ts'
import { fakeR2 as fakeBucket } from './fakeR2.ts'
import { testCodes } from './testCodes.ts'

const { right: CODE, wrong } = testCodes()

const req = (code: string) => new Request('https://x/api', { headers: { Authorization: `Bearer ${code}` } })
const env = () => ({ ADMIN_SECRET: CODE, BUCKET: fakeBucket() })

test('the right code passes', async () => {
  assert.equal(await checkAdmin(req(CODE), env()), 'ok')
})

test('a wrong code is denied', async () => {
  assert.equal(await checkAdmin(req(wrong()), env()), 'denied')
})

test('no secret configured denies everyone', async () => {
  assert.equal(await checkAdmin(req(''), { BUCKET: fakeBucket() }), 'denied')
})

test('after MAX_FAILS wrong codes even the right one is locked until the window ends', async () => {
  const e = env()
  const t0 = 1_000_000
  for (let i = 0; i < MAX_FAILS; i++) assert.equal(await checkAdmin(req(wrong()), e, t0 + i), 'denied')
  assert.equal(await checkAdmin(req(CODE), e, t0 + 10), 'locked')
  assert.equal(await checkAdmin(req(CODE), e, t0 + WINDOW_MS + 1), 'ok')
})

test('a successful login does not clear earlier wrong guesses', async () => {
  const e = env()
  for (let i = 0; i < MAX_FAILS - 1; i++) await checkAdmin(req(wrong()), e, i)
  assert.equal(await checkAdmin(req(CODE), e, 10), 'ok')
  assert.equal(await checkAdmin(req(wrong()), e, 20), 'denied')
  assert.equal(await checkAdmin(req(CODE), e, 30), 'locked')
})

test('saving many times does not use up the wrong-guess budget', async () => {
  const e = env()
  for (let i = 0; i < MAX_FAILS * 4; i++) assert.equal(await checkAdmin(req(CODE), e, i), 'ok')
  for (let i = 0; i < MAX_FAILS - 1; i++) assert.equal(await checkAdmin(req(wrong()), e, 100 + i), 'denied')
  assert.equal(await checkAdmin(req(CODE), e, 200), 'ok')
})

test('guesses sent at the same time: only one is compared', async () => {
  const e = env()
  await checkAdmin(req(wrong()), e, 0)
  const results = await Promise.all([wrong(2), wrong(3), CODE].map((c) => checkAdmin(req(c), e, 1)))
  assert.equal(results.filter((r) => r !== 'locked').length, 1, `one claimed the attempt: ${results}`)
})

const login = async (code: string, e = env(), now = 0) => {
  const res = await adminLogin(new Request('https://x/api/admin/verify', { method: 'POST', headers: { Authorization: `Bearer ${code}` } }), e, now)
  const body: unknown = await res.json()
  const token = typeof body === 'object' && body !== null && 'token' in body && typeof body.token === 'string' ? body.token : null
  return { status: res.status, token }
}

test('login with the code returns a token, not the code', async () => {
  const { status, token } = await login(CODE)
  assert.equal(status, 200)
  assert.ok(token && !token.includes(CODE))
})

test('login with a wrong code returns no token', async () => {
  assert.deepEqual(await login(wrong()), { status: 401, token: null })
})

test('the token passes until it expires, without costing attempts', async () => {
  const e = env()
  const { token } = await login(CODE, e, 0)
  assert.ok(token)
  for (let i = 0; i < MAX_FAILS * 2; i++) assert.equal(await checkAdmin(req(token), e, 1 + i), 'ok')
  assert.equal(await checkAdmin(req(token), e, TOKEN_MS + 1), 'denied')
})

test('a token still passes while code guesses have locked the site', async () => {
  const e = env()
  const { token } = await login(CODE, e, 0)
  for (let i = 0; i < MAX_FAILS; i++) await checkAdmin(req(wrong()), e, 1 + i)
  assert.equal(await checkAdmin(req(CODE), e, 10), 'locked')
  assert.equal(await checkAdmin(req(token ?? ''), e, 10), 'ok')
})

test('a forged, altered or other-secret token is denied', async () => {
  const e = env()
  const real = await issueToken(CODE, 0)
  const [exp, sig] = real.split('.')
  for (const t of [`${Number(exp) + 1}.${sig}`, `${exp}.${sig.slice(1)}x`, `${exp}.!!`, `${exp}.${sig}.x`, await issueToken(wrong(), 0)]) {
    assert.equal(await checkAdmin(req(t), e, 1), 'denied', t)
  }
})

test('a token cannot be traded for a new token', async () => {
  const { token } = await login(CODE)
  assert.deepEqual(await login(token ?? ''), { status: 401, token: null })
})

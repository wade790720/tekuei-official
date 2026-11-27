import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestGet, onRequestPut } from '../functions/api/data.ts'
import { onRequestGet as getFile } from '../functions/api/file/[[path]].ts'
import { fakeR2 } from './fakeR2.ts'

type TestEnv = { ADMIN_SECRET?: string; BUCKET: ReturnType<typeof fakeR2> }

const SECRET = '123456'
const site = () => ({ journal: { posts: ['old'] }, work: { items: ['matsu'] } })
const env = (initial: Record<string, unknown> = { 'data.json': site() }): TestEnv => ({ ADMIN_SECRET: SECRET, BUCKET: fakeR2(initial) })

const get = (e: TestEnv, ifNoneMatch?: string) =>
  onRequestGet({ request: new Request('https://x/api/data', { headers: ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {} }), env: e })
const etagOf = async (e: TestEnv) => (await get(e)).headers.get('ETag') ?? undefined
const put = (e: TestEnv, body: unknown, { code = SECRET, etag }: { code?: string; etag?: string } = {}) =>
  onRequestPut({
    request: new Request('https://x/api/data', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${code}`, ...(etag ? { 'If-Match': etag } : {}) },
      body: JSON.stringify(body),
    }),
    env: e,
  })

test('saving one section keeps the others', async () => {
  const e = env()
  const res = await put(e, { journal: { posts: ['new'] } }, { etag: await etagOf(e) })
  assert.equal(res.status, 200)
  assert.deepEqual(e.BUCKET.read('data.json'), { journal: { posts: ['new'] }, work: { items: ['matsu'] } })
})

test('a wrong code cannot save', async () => {
  const e = env()
  assert.equal((await put(e, { journal: {} }, { code: '000000', etag: await etagOf(e) })).status, 401)
  assert.deepEqual(e.BUCKET.read('data.json'), site())
})

test('a save from an editor that loaded an older version is refused', async () => {
  const e = env()
  const loaded = await etagOf(e) // laptop opens the editor
  await put(e, { journal: { posts: ['from phone'] } }, { etag: loaded }) // phone saves first
  const res = await put(e, { journal: { posts: ['from laptop'] } }, { etag: loaded })
  assert.equal(res.status, 409)
  assert.deepEqual(e.BUCKET.read('data.json').journal, { posts: ['from phone'] })
})

test('a save that names no version is refused once data.json exists', async () => {
  const e = env()
  const res = await put(e, { journal: { posts: ['blind'] } })
  assert.equal(res.status, 409)
  assert.deepEqual(e.BUCKET.read('data.json'), site())
})

test('the first save into an empty bucket needs no version', async () => {
  const e = env({})
  const res = await put(e, { journal: { posts: ['first'] } })
  assert.equal(res.status, 200)
  assert.deepEqual(e.BUCKET.read('data.json'), { journal: { posts: ['first'] } })
})

test('the etag a save returns lets the same editor save again', async () => {
  const e = env()
  const first = await (await put(e, { journal: { posts: ['a'] } }, { etag: await etagOf(e) })).json()
  const res = await put(e, { journal: { posts: ['b'] } }, { etag: first.etag })
  assert.equal(res.status, 200)
  assert.deepEqual(e.BUCKET.read('data.json').journal, { posts: ['b'] })
})

test('the file route serves uploaded images and nothing else in the bucket', async () => {
  const e = { BUCKET: fakeR2({ 'images/a.webp': 'pixels', 'admin/attempts.json': { fails: 3 }, 'data.json': site() }) }
  const file = (path: string) => getFile({ request: new Request(`https://x/api/file/${path}`), env: e })
  assert.equal((await file('images/a.webp')).status, 200)
  assert.equal((await file('admin/attempts.json')).status, 404)
  assert.equal((await file('data.json')).status, 404)
  assert.equal((await file('images/%2E%2E/data.json')).status, 404)
  assert.equal((await file('images/%E0%A4%A')).status, 400)
})

test('a data.json that cannot be read is not overwritten', async () => {
  const e = env()
  await e.BUCKET.put('data.json', '{ "journal": broken')
  const res = await put(e, { about: { zh: 'new' } }, { etag: await etagOf(e) })
  assert.equal(res.status, 500)
  assert.equal(await (await e.BUCKET.get('data.json'))?.text(), '{ "journal": broken', 'the other sections are still there to recover')
})

test('an unchanged data.json is answered with 304 and no body', async () => {
  const e = env()
  const first = await get(e)
  const etag = first.headers.get('ETag') ?? ''
  assert.equal(first.headers.get('Cache-Control'), 'private, no-cache')
  const again = await get(e, etag)
  assert.equal(again.status, 304)
  assert.equal(await again.text(), '')
  await put(e, { journal: { posts: ['new'] } }, { etag })
  assert.equal((await get(e, etag)).status, 200, 'a saved change is sent in full')
})

test('a weak ETag, as Cloudflare sends when it compresses the file, still gets 304', async () => {
  const e = env()
  const etag = (await get(e)).headers.get('ETag') ?? ''
  assert.equal((await get(e, `W/${etag}`)).status, 304)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestGet, onRequestPut } from '../functions/api/data.js'
import { onRequestGet as getFile } from '../functions/api/file/[[path]].js'
import { fakeR2 } from './fakeR2.mjs'

const SECRET = '123456'
const site = () => ({ journal: { posts: ['old'] }, work: { items: ['matsu'] } })
const env = () => ({ ADMIN_SECRET: SECRET, BUCKET: fakeR2({ 'data.json': site() }) })

const get = (e) => onRequestGet({ request: new Request('https://x/api/data'), env: e })
const put = (e, body, { code = SECRET, etag } = {}) =>
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
  const res = await put(e, { journal: { posts: ['new'] } }, { etag: (await get(e)).headers.get('ETag') })
  assert.equal(res.status, 200)
  assert.deepEqual(e.BUCKET.read('data.json'), { journal: { posts: ['new'] }, work: { items: ['matsu'] } })
})

test('a wrong code cannot save', async () => {
  const e = env()
  assert.equal((await put(e, { journal: {} }, { code: '000000' })).status, 401)
  assert.deepEqual(e.BUCKET.read('data.json'), site())
})

test('a save from an editor that loaded an older version is refused', async () => {
  const e = env()
  const loaded = (await get(e)).headers.get('ETag') // laptop opens the editor
  await put(e, { journal: { posts: ['from phone'] } }, { etag: loaded }) // phone saves first
  const res = await put(e, { journal: { posts: ['from laptop'] } }, { etag: loaded })
  assert.equal(res.status, 409)
  assert.deepEqual(e.BUCKET.read('data.json').journal, { posts: ['from phone'] })
})

test('the etag a save returns lets the same editor save again', async () => {
  const e = env()
  const first = await (await put(e, { journal: { posts: ['a'] } }, { etag: (await get(e)).headers.get('ETag') })).json()
  const res = await put(e, { journal: { posts: ['b'] } }, { etag: first.etag })
  assert.equal(res.status, 200)
  assert.deepEqual(e.BUCKET.read('data.json').journal, { posts: ['b'] })
})

test('the file route serves uploaded images and nothing else in the bucket', async () => {
  const e = { BUCKET: fakeR2({ 'images/a.webp': 'pixels', 'admin/attempts.json': { fails: 3 }, 'data.json': site() }) }
  const file = (path) => getFile({ request: new Request(`https://x/api/file/${path}`), env: e })
  assert.equal((await file('images/a.webp')).status, 200)
  assert.equal((await file('admin/attempts.json')).status, 404)
  assert.equal((await file('data.json')).status, 404)
  assert.equal((await file('images/%2E%2E/data.json')).status, 404)
  assert.equal((await file('images/%E0%A4%A')).status, 400)
})

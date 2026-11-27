import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { routeApi } from '../workers/api.ts'
import { fakeR2 } from './fakeR2.ts'
import { testCodes } from './testCodes.ts'

// workers/app.ts sends these URLs to functions/; each case answers in a way only its own handler does.
const { right: SECRET } = testCodes()
const env = () => ({
  ADMIN_SECRET: SECRET,
  BUCKET: fakeR2({ 'data.json': { journal: { posts: { zh: [], en: [] }, content: { zh: {}, en: {} } } }, 'images/a.png': 'png' }),
})
const auth = { Authorization: `Bearer ${SECRET}` }

async function call(method: string, path: string, init: RequestInit = {}) {
  const res = routeApi(new Request(`https://tekuei.com${path}`, { method, ...init }), env())
  assert.ok(res, `${method} ${path} is not in the table`)
  return res
}

describe('Worker API table', () => {
  it('GET and HEAD /api/data reach the data handler', async () => {
    for (const method of ['GET', 'HEAD']) {
      const res = await call(method, '/api/data')
      assert.equal(res.status, 200)
      assert.ok(res.headers.get('ETag'), `${method} has the data ETag`)
    }
  })

  it('PUT /api/data reaches the data handler, which refuses a save without If-Match', async () => {
    const res = await call('PUT', '/api/data', { headers: auth, body: '{}' })
    assert.equal(res.status, 409)
  })

  it('POST /api/upload reaches the upload handler', async () => {
    const res = await call('POST', '/api/upload', { headers: auth, body: new FormData() })
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'Missing file' })
  })

  it('POST /api/translate reaches the translate handler', async () => {
    const res = await call('POST', '/api/translate', { headers: auth, body: '{}' })
    assert.equal(res.status, 503, 'no AI binding in the fake env')
  })

  it('POST /api/admin/verify reaches the verify handler', async () => {
    const res = await call('POST', '/api/admin/verify', { headers: auth })
    assert.deepEqual(await res.json(), { ok: true })
  })

  it('GET /api/file/* reaches the file handler', async () => {
    const res = await call('GET', '/api/file/images/a.png')
    assert.equal(res.status, 200)
    assert.equal(await res.text(), '"png"')
  })

  it('GET /sitemap.xml and /llms.txt reach their functions', async () => {
    const sitemap = await call('GET', '/sitemap.xml')
    assert.equal(sitemap.headers.get('Content-Type'), 'application/xml; charset=utf-8')
    assert.match(await sitemap.text(), /<urlset/)
    const llms = await call('GET', '/llms.txt')
    assert.equal(llms.headers.get('Content-Type'), 'text/markdown; charset=utf-8')
    assert.match(await llms.text(), /tekuei\.com/)
  })

  it('answers 405 to a method the handler does not export', async () => {
    for (const [method, path] of [
      ['GET', '/api/upload'],
      ['GET', '/api/translate'],
      ['GET', '/api/admin/verify'],
      ['POST', '/api/data'],
      ['DELETE', '/api/data'],
      ['PATCH', '/api/data'],
      ['PUT', '/api/file/images/a.png'],
      ['POST', '/sitemap.xml'],
    ]) {
      assert.equal((await call(method, path)).status, 405, `${method} ${path}`)
    }
  })

  it('leaves pages to React Router', () => {
    for (const path of ['/', '/journal', '/api/file', '/api/data/', '/api/nope']) {
      assert.equal(routeApi(new Request(`https://tekuei.com${path}`), env()), undefined, path)
    }
  })
})

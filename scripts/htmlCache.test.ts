import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cachedPage } from '../workers/htmlCache.ts'
import type { CacheDeps } from '../workers/htmlCache.ts'
import { fakeR2 } from './fakeR2.ts'

function setup(deploy = 'd1') {
  const store = new Map<string, Response>()
  const pending: Promise<unknown>[] = []
  const bucket = fakeR2({ 'data.json': { journal: {} } })
  const deps: CacheDeps = {
    cache: {
      async match(key) {
        return store.get(key.url)?.clone()
      },
      async put(key, res) {
        store.set(key.url, res)
      },
    },
    bucket,
    deploy,
    waitUntil: (p) => pending.push(p),
  }
  let renders = 0
  const page = (status = 200, cacheControl = 'public, max-age=0, must-revalidate') => async () => {
    renders++
    return new Response(`render ${renders}`, { status, headers: { 'Cache-Control': cacheControl } })
  }
  const get = async (render = page(), path = '/journal') => {
    const res = await cachedPage(new Request(`https://tekuei.com${path}`), deps, render)
    await Promise.all(pending)
    return res
  }
  return { deps, bucket, store, get, page, renders: () => renders }
}

describe('page cache', () => {
  it('renders once, then serves the stored page with the browser Cache-Control', async () => {
    const t = setup()
    const first = await t.get()
    assert.equal(first.headers.get('X-Page-Cache'), 'miss')
    const second = await t.get()
    assert.equal(await second.text(), 'render 1')
    assert.equal(second.headers.get('X-Page-Cache'), 'hit')
    assert.equal(second.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate')
    assert.equal(second.headers.has('X-Page-Cache-Control'), false)
    assert.equal(t.renders(), 1)
  })

  it('renders again after a save changes data.json', async () => {
    const t = setup()
    await t.get()
    await t.bucket.put('data.json', '{}')
    assert.equal(await (await t.get()).text(), 'render 2')
  })

  it('renders again after a deploy', async () => {
    const t = setup()
    await t.get()
    t.deps.deploy = 'd2'
    assert.equal(await (await t.get()).text(), 'render 2')
  })

  it('never stores a 404, a no-store page or a HEAD request', async () => {
    const t = setup()
    await t.get(t.page(404, 'no-store'))
    await t.get(t.page(200, 'no-store'))
    await cachedPage(new Request('https://tekuei.com/journal', { method: 'HEAD' }), t.deps, t.page())
    assert.equal(t.store.size, 0)
  })

  it('keeps each URL, query included, apart', async () => {
    const t = setup()
    await t.get(t.page(), '/journal?tag=AI')
    assert.equal(await (await t.get(t.page(), '/journal')).text(), 'render 2')
  })
})
